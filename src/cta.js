import React, { useState, useEffect, useRef } from "react";
import CountUp from "react-countup";
import { Modal, Button, Form, Spinner } from "react-bootstrap";

/**
 * Home.js
 *
 * Regras implementadas:
 * - Cálculo (Harris-Benedict) obrigatório antes de enviar relatório grátis/pago.
 * - Validações de entradas (idade, peso, altura, sexo).
 * - Resultado armazenado em state + localStorage (key = 'mrfit_calc').
 * - Envio dos dados calculados ao backend:
 *    POST /api/pdf/gratuito  -> { name, email, calculo: { ... } }
 *    POST /api/pdf/pago      -> { name, email, calculo: { ... } }
 * - Mantém layout e estilos originais (Bootstrap).
 */

export default function Home() {
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [price] = useState(19.9);
  const [reportsCount] = useState(2000);

  // Cálculo state
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("1.2");
  const [goal, setGoal] = useState("manter");

  // Resultado calculado (tmb, calorias, meta)
  const [result, setResult] = useState(null);

  // para rolagem / foco
  const calculoRef = useRef(null);
  const resultadoRef = useRef(null);

  // Carrega cálculo salvo do localStorage (se houver)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("mrfit_calc");
      if (raw) {
        const parsed = JSON.parse(raw);
        // popula campos e resultado
        if (parsed?.inputs) {
          const i = parsed.inputs;
          setGender(i.gender || "");
          setAge(i.age || "");
          setWeight(i.weight || "");
          setHeight(i.height || "");
          setActivity(i.activity || "1.2");
          setGoal(i.goal || "manter");
        }
        if (parsed?.result) {
          setResult(parsed.result);
        }
      }
    } catch (err) {
      console.warn("Erro ao carregar mrfit_calc:", err);
    }
  }, []);

  // salva automaticamente no localStorage quando result muda
  useEffect(() => {
    const payload = {
      inputs: { gender, age, weight, height, activity, goal },
      result: result,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem("mrfit_calc", JSON.stringify(payload));
    } catch (err) {
      console.warn("Erro ao salvar mrfit_calc:", err);
    }
  }, [gender, age, weight, height, activity, goal, result]);

  // Valida entradas antes de calcular
  function validarEntradasCalc() {
    const a = Number(age);
    const w = Number(weight);
    const h = Number(height);

    if (!gender) {
      alert("Selecione o sexo.");
      return false;
    }
    if (Number.isNaN(a) || a < 5 || a > 120) {
      alert("Insira uma idade válida (entre 5 e 120 anos).");
      return false;
    }
    if (Number.isNaN(w) || w < 30 || w > 500) {
      alert("Insira um peso válido (entre 30 kg e 500 kg).");
      return false;
    }
    if (Number.isNaN(h) || h < 50 || h > 250) {
      alert("Insira uma altura válida (entre 50 cm e 250 cm).");
      return false;
    }
    // activity e goal já têm defaults.
    return true;
  }

  // Harris-Benedict (versão clássica para TMB)
  function handleCalculate(e) {
    e.preventDefault();
    if (!validarEntradasCalc()) return;

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    // formulas
    let tmb;
    if (gender === "masculino" || gender === "male") {
      tmb = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      // feminino
      tmb = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    }

    const factor = parseFloat(activity) || 1.2;
    const gastoDiario = tmb * factor;

    // ajuste por objetivo em kcal (valor conservador)
    let ajuste = 0;
    if (goal === "emagrecer") ajuste = -400; // déficit moderado
    if (goal === "ganhar") ajuste = 400; // superávit moderado

    const meta = Math.max(1000, Math.round(gastoDiario + ajuste)); // limite inferior razoável

    const resObj = {
      tmb: Math.round(tmb),
      gastoDiario: Math.round(gastoDiario),
      meta,
      inputs: {
        gender,
        age: Number(a),
        weight: Number(w),
        height: Number(h),
        activity: factor,
        goal,
      },
    };

    setResult(resObj);

    // rolar para resultado
    setTimeout(() => {
      if (resultadoRef.current) {
        resultadoRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 150);
  }

  // Rola para calculo (utilizado caso o user tente enviar sem calcular)
  function goToCalculo() {
    if (calculoRef.current) {
      calculoRef.current.scrollIntoView({ behavior: "smooth" });
      // opcional: focus no primeiro campo
      setTimeout(() => {
        const sel = calculoRef.current.querySelector("select, input");
        if (sel) sel.focus();
      }, 300);
    }
  }

  // payload padronizado para enviar ao backend
function buildPayload() {
  if (!result) return null;
  return {
    nome: name,
    email,
    idade: result.inputs.age,
    peso: result.inputs.weight,
    altura: result.inputs.height,
    sexo: result.inputs.gender,
    atividade: result.inputs.activity,
    objetivo: result.inputs.goal,
    calorias: result.meta, // meta final que o backend espera
    data: new Date().toLocaleDateString(),
    tmb: result.tmb,
    gastoDiario: result.gastoDiario,
  };
}

  // Envio relatório gratuito
async function handleSendFree(e) {
  e.preventDefault();
  if (!result) {
    alert("Primeiro realize o cálculo para gerar o relatório.");
    goToCalculo();
    return;
  }
  if (!name || !email) {
    alert("Preencha nome e e-mail antes de solicitar o relatório.");
    return;
  }

  const payload = buildPayload();
  if (!payload) return;

  setLoading(true);
  try {
    const res = await fetch(`${process.env.REACT_APP_API_HOST}/pdf/gratuito`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("✅ Relatório gratuito solicitado! Verifique seu e-mail.");
    } else {
      const t = await res.text();
      console.error("Erro no /pdf/gratuito:", res.status, t);
      alert("Erro ao solicitar relatório gratuito. Tente novamente.");
    }
  } catch (err) {
    console.error(err);
    alert("Erro na comunicação com o servidor.");
  } finally {
    setLoading(false);
  }
}


  // Envio relatório pago (espera retorno com checkoutUrl OU confirmação)
  async function handleSendPaid(e) {
    e.preventDefault();
    if (!result) {
      alert("Primeiro realize o cálculo para gerar o relatório.");
      goToCalculo();
      return;
    }
    if (!name || !email) {
      alert("Preencha nome e e-mail antes de continuar o pagamento.");
      return;
    }
    
    setLoading(true);
    const endpoint = `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf_pg`;
    try {
      const payload = buildPayload();
      payload.amount = price;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);
      if (res.ok) {
        // se backend retornar checkoutUrl, redireciona
        if (data && data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        } else {
          // fallback: mostra mensagem de sucesso
          alert("✅ Pedido de relatório pago processado. Siga as instruções enviadas por e-mail.");
        }
      } else {
        console.error("Erro /api/pdf/pago:", res.status, data);
        alert("Erro ao processar pagamento. Tente novamente.");
      }
    } catch (err) {
      console.error(err);
      alert("Erro na comunicação com o servidor de pagamento.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-light min-vh-100 py-5 d-flex flex-column align-items-center">
      {/* Container principal */}
      <div className="container bg-white shadow rounded-4 p-4 p-md-5">
        {/* Hero */}
        <div className="row align-items-center g-5">
          <div className="col-md-6">
            <h1 className="fw-bold display-5 text-dark">
              Transforme seu corpo com o{" "}
              <span className="text-success">Relatório MrFit</span> 🔥
            </h1>
            <p className="text-muted fs-5 mt-3">
              Descubra quantas calorias você realmente precisa e receba um
              relatório com sugestões práticas — baseado em cálculos reconhecidos
              e recomendações gerais de saúde.
            </p>

            {/* Botão para ir para calculo */}
            <Button
              variant="success"
              className="w-100 mt-3 py-2 fw-semibold"
              onClick={() =>
                document.getElementById("calculo")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Fazer meu cálculo gratuito
            </Button>
          </div>

          <div className="col-md-6 text-center">
            <img
              src="\modelo_capa.png"
              alt="Pessoa feliz usando o app"
              className="img-fluid rounded-4 shadow-sm"
            />
          </div>
        </div>

        {/* Seção de Cálculo */}
        <section id="calculo" ref={calculoRef} className="mt-5 pt-4 border-top">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Calcule seu metabolismo 🧮</h2>
            <p className="text-muted">Informe seus dados para gerar seu diagnóstico.</p>
          </div>

          <Form onSubmit={handleCalculate}>
            <div className="row g-3">
              <div className="col-md-3">
                <Form.Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                >
                  <option value="">Sexo</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </Form.Select>
              </div>

              <div className="col-md-3">
                <Form.Control
                  type="number"
                  placeholder="Idade"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  min={5}
                  max={120}
                  required
                />
              </div>

              <div className="col-md-3">
                <Form.Control
                  type="number"
                  placeholder="Peso (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  min={30}
                  max={500}
                  step="0.1"
                  required
                />
              </div>

              <div className="col-md-3">
                <Form.Control
                  type="number"
                  placeholder="Altura (cm)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  min={50}
                  max={250}
                  required
                />
              </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <Form.Select value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="1.2">Sedentário</option>
                  <option value="1.375">Leve (1-3x/sem)</option>
                  <option value="1.55">Moderado (3-5x/sem)</option>
                  <option value="1.725">Intenso (6-7x/sem)</option>
                  <option value="1.9">Muito intenso</option>
                </Form.Select>
              </div>

              <div className="col-md-6">
                <Form.Select value={goal} onChange={(e) => setGoal(e.target.value)}>
                  <option value="manter">Manter peso</option>
                  <option value="emagrecer">Emagrecer</option>
                  <option value="ganhar">Ganhar massa</option>
                </Form.Select>
              </div>
            </div>

            <div className="text-center mt-4">
              <Button type="submit" variant="success" className="px-5 py-2 fw-semibold">
                Calcular agora
              </Button>
            </div>
          </Form>

          {/* Resultado - só aparece se houver cálculo */}
          {result && (
            <div id="resultado" ref={resultadoRef} className="mt-5 text-center">
              <h4 className="fw-bold text-dark">Seu resultado</h4>
              <p className="text-muted mb-1">
                Taxa Metabólica Basal (TMB): <strong>{result.tmb} kcal</strong>
              </p>
              <p className="text-muted mb-1">
                Gasto Diário Estimado (com atividade): <strong>{result.gastoDiario} kcal</strong>
              </p>
              <p className="text-muted mb-3">
                Meta recomendada (ajustada pelo objetivo):{" "}
                <strong className="text-success">{result.meta} kcal</strong>
              </p>

              {/* Inputs para nome/email e botões de envio */}
              <Form onSubmit={(e) => e.preventDefault()}>
                <div className="row g-2 justify-content-center">
                  <div className="col-md-4">
                    <Form.Control
                      type="text"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <Form.Control
                      type="email"
                      placeholder="Seu melhor e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex flex-column flex-md-row gap-2 justify-content-center mt-3">
                  <Button
                    variant="success"
                    className="py-2 fw-semibold"
                    onClick={handleSendFree}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" animation="border" /> : "Receber diagnóstico gratuito"}
                  </Button>

                  <Button
                    variant="warning"
                    className="py-2 fw-semibold"
                    onClick={handleSendPaid}
                    disabled={loading}
                  >
                    {loading ? <Spinner size="sm" animation="border" /> : `Adquirir relatório completo (R$ ${price.toFixed(2)})`}
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="mt-5 pt-4 border-top">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Por que escolher o MrFit?</h2>
          </div>
          <div className="row g-4">
            {[
              {
                emoji: "💡",
                title: "Clareza Total",
                text: "Saiba exatamente quantas calorias comer para atingir seu objetivo, sem suposições.",
              },
              {
                emoji: "🧩",
                title: "Personalização Segura",
                text: "Recomendações com caráter informativo, não substituem nutricionista.",
              },
              {
                emoji: "📈",
                title: "Resultados Visíveis",
                text: "Aplique mudanças simples e mensuráveis nas suas refeições.",
              },
            ].map((item, i) => (
              <div className="col-md-4" key={i}>
                <div className="border rounded-4 p-4 h-100 text-center shadow-sm">
                  <div className="display-5">{item.emoji}</div>
                  <h5 className="fw-bold mt-3">{item.title}</h5>
                  <p className="text-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prova Social */}
        <section className="mt-5 pt-4 border-top text-center">
          <p className="text-muted mb-0">Mais de</p>
          <h3 className="fw-bold text-success display-6">
            <CountUp end={reportsCount} duration={2} separator="," />
          </h3>
          <p className="text-muted">
            relatórios gerados ajudaram pessoas a atingirem suas metas.
          </p>

          <blockquote className="fst-italic text-secondary">
            “Emagreci 4kg em 3 semanas só ajustando o que o relatório mostrou.” — Juliana M.
          </blockquote>
          <blockquote className="fst-italic text-secondary">
            “Valeu cada centavo. Tudo personalizado pra mim.” — Marcos R.
          </blockquote>

          <Button
            variant="success"
            className="mt-3 px-5 py-2 fw-semibold"
            onClick={() => {
              // se já calculado, abre checkout/pago; se não, rola para calculo
              if (!result) {
                goToCalculo();
                return;
              }
              setShowCheckout(true);
            }}
          >
            Quero Meu Relatório Agora
          </Button>
        </section>

        {/* Oferta Especial */}
        <section className="mt-5 py-5 border-top bg-light rounded-4 text-center">
          <h2 className="fw-bold text-dark">Oferta Especial de Lançamento</h2>
          <p className="fs-5 text-muted">
            De <span className="text-decoration-line-through">R$ 49,90</span> por apenas{" "}
            <span className="fw-bold text-success">R$ {price.toFixed(2)}</span>
          </p>
          <p className="text-muted">
            Relatório completo + plano de metas + guia alimentar.
          </p>
          <Button
            variant="warning"
            className="fw-semibold mt-3 px-5 py-2"
            onClick={() => {
              if (!result) {
                goToCalculo();
                return;
              }
              setShowCheckout(true);
            }}
          >
            Adquirir por R$ {price.toFixed(2)}
          </Button>
        </section>

        {/* Rodapé */}
        <footer className="mt-5 pt-4 border-top text-center text-muted small">
          <p>MrFit — Conteúdo informativo. Não substitui nutricionista.</p>
          <p>Política de privacidade | contato@srfit.com.br</p>
        </footer>
      </div>

      {/* Modal de Checkout: mantém comportamento apenas para coletar dados do cartão, mas o envio/checkout já é tratado por /api/pdf/pago */}
      <Modal show={showCheckout} onHide={() => setShowCheckout(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Relatório Completo MrFit</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Seu plano personalizado em minutos. Pagamento seguro 🔒</p>
          <Form
            onSubmit={(e) => {
              // Ao confirmar no modal, chamamos a mesma função de envio pago
              handleSendPaid(e);
            }}
          >
            <Form.Group className="mb-3">
              <Form.Label>Nome no cartão</Form.Label>
              <Form.Control type="text" required placeholder="Nome como no cartão" />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Número do cartão</Form.Label>
              <Form.Control type="text" required placeholder="1234 1234 1234 1234" />
            </Form.Group>
            <div className="row">
              <div className="col">
                <Form.Label>Validade</Form.Label>
                <Form.Control type="text" required placeholder="MM/AA" />
              </div>
              <div className="col">
                <Form.Label>CVC</Form.Label>
                <Form.Control type="text" required placeholder="123" />
              </div>
            </div>
            <Button
              type="submit"
              className="w-100 mt-4 py-2 fw-semibold"
              variant="success"
              disabled={loading}
            >
              {loading ? "Processando..." : `Pagar R$ ${price.toFixed(2)}`}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
