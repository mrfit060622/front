import React, { useState, useEffect, useRef } from "react";
import CountUp from "react-countup";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import CheckoutBricks from "./CheckoutBricks";
import { useLocation, useSearchParams } from "react-router-dom";

export default function Home() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const referenceFromURL = searchParams.get("ref");

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [externalReference, setExternalReference] = useState(null);
  const [valorPagamento] = useState(1.0); // valor do relatório pago
  const [onPagamentoConfirmado, setOnPagamentoConfirmado] = useState(false);
  const [mostrarCheckout, setMostrarCheckout] = useState(false);

  // Cálculo state
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [activity, setActivity] = useState("Sedentario");
  const [goal, setGoal] = useState("manter");
  const [result, setResult] = useState(null);

  const [reportsCount] = useState(2000);

  // Refs
  const calculoRef = useRef(null);
  const resultadoRef = useRef(null);

  // 🔹 Recupera dados se o usuário vier com ?ref=<codigo>
  useEffect(() => {
    if (referenceFromURL) {
      fetch(`${process.env.REACT_APP_API_HOST}/pdf/consulta_pdf/${referenceFromURL}`)
        .then((res) => res.json())
        .then((data) => {
          if (!data) return;
          setName(data.nome);
          setEmail(data.email);
          setGender(data.sexo);
          setAge(data.idade);
          setWeight(data.peso);
          setHeight(data.altura);
          setActivity(data.atividade);
          setGoal(data.objetivo);
          setExternalReference(referenceFromURL);

          const resObj = {
            tmb: data.tmb,
            gastoDiario: data.gastoDiario,
            meta: data.calorias,
            inputs: {
              gender: data.sexo,
              age: data.idade,
              weight: data.peso,
              height: data.altura,
              activity: data.atividade,
              goal: data.objetivo,
            },
          };
          setResult(resObj);
          setOnPagamentoConfirmado(true);
        })
        .catch((err) => console.error("Erro ao buscar dados:", err));
    }
  }, [referenceFromURL]);

  // ✅ Validação das entradas
  function validarEntradasCalc() {
    const a = Number(age);
    const w = Number(weight);
    const h = Number(height);

    if (!gender) return alert("Selecione o sexo.");
    if (Number.isNaN(a) || a < 5 || a > 120) return alert("Idade inválida (5 a 120 anos).");
    if (Number.isNaN(w) || w < 30 || w > 500) return alert("Peso inválido (30 a 500 kg).");
    if (Number.isNaN(h) || h < 50 || h > 250) return alert("Altura inválida (50 a 250 cm).");

    return true;
  }

  // 🔹 Cálculo Harris-Benedict
  function handleCalculate(e) {
    e.preventDefault();
    if (!validarEntradasCalc()) return;

    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    let tmb;
    if (gender === "masculino" || gender === "male") {
      tmb = 88.362 + 13.397 * w + 4.799 * h - 5.677 * a;
    } else {
      tmb = 447.593 + 9.247 * w + 3.098 * h - 4.330 * a;
    }

    const atividadeMap = {
      Sedentario: 1.25,
      Leve: 1.38,
      Moderado: 1.55,
      Intenso: 1.73,
      Muitointenso: 1.9,
    };
    const factor = atividadeMap[activity];
    const gastoDiario = tmb * factor;
    let ajuste = 0;
    if (goal === "emagrecer") ajuste = -400;
    if (goal === "ganhar") ajuste = 400;

    const meta = Math.max(1000, Math.round(gastoDiario + ajuste));
    const resObj = {
      tmb: Math.round(tmb),
      gastoDiario: Math.round(gastoDiario),
      meta,
      inputs: { gender, age: a, weight: w, height: h, activity: factor, goal },
    };

    setResult(resObj);
    setTimeout(() => resultadoRef.current?.scrollIntoView({ behavior: "smooth" }), 150);
  }

  function buildPayload() {
    if (!result) return null;
    return {
      nome: name,
      email,
      idade: result.inputs.age,
      peso: result.inputs.weight,
      altura: result.inputs.height,
      sexo: result.inputs.gender,
      atividade: activity,
      objetivo: result.inputs.goal,
      calorias: result.meta,
      data: new Date().toLocaleDateString(),
      tmb: result.tmb,
      gastoDiario: result.gastoDiario,
      externalReference
    };
  }
  function validarEmail(email) {
    // Regex básica para e-mail válido
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  async function handleSendFree(e) {
    e.preventDefault();
    if (!result) return alert("Realize o cálculo antes.");
    if (!name || !email) return alert("Preencha nome e e-mail.");
    if (!validarEmail(email)) return alert("E-mail inválido. Por favor, insira um endereço válido.");

    const payload = buildPayload();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) alert("✅ Relatório gratuito enviado! Verifique seu e-mail.");
      else alert("Erro ao enviar relatório gratuito.");
    } catch {
      alert("Erro na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Função de abrir checkout pago
  function handleAbrirCheckout() {
    if (!result) return alert("Realize o cálculo antes de solicitar o relatório pago.");
    if (!name || !email) return alert("Preencha nome e e-mail para prosseguir com o pagamento.");
    if (!validarEmail(email)) return alert("E-mail inválido. Por favor, insira um endereço válido.");
    setMostrarCheckout(true);
  }

  async function lidarComPagamento() {
    setOnPagamentoConfirmado(true);
    setMostrarCheckout(false);
  
    const payload_pg = buildPayload();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf_pg`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload_pg),
      });
      if (res.ok) {
        alert("✅ Pagamento confirmado! Seu relatório completo foi enviado ao e-mail informado.");
        setTimeout(() => {
        window.location.href = "/sucesso_pagamento"; // ou use navigate("/sucesso") se estiver usando React Router
      }, 1000);
      } else {
        alert("Erro ao enviar relatório completo após o pagamento.");
      }
    } catch {
      alert("Erro na comunicação com o servidor para gerar o relatório pago.");
    }
  }

  return (
    <div className="bg-light min-vh-100 py-5 d-flex flex-column align-items-center">
      <div className="container bg-white shadow rounded-4 p-4 p-md-5">

        {/* HERO */}
        <div className="row align-items-center g-5">
          <div className="col-md-6">
            <h1 className="fw-bold display-5 text-dark">
              Transforme seu corpo com o <span className="text-success">Relatório MrFit</span> 🔥
            </h1>
            <p className="text-muted fs-5 mt-3">
              Descubra quantas calorias você realmente precisa e receba um relatório com sugestões práticas.
            </p>
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
            <img src="/modelo_capa.png" alt="Pessoa feliz" className="img-fluid rounded-4 shadow-sm" />
          </div>
        </div>

        {/* FORM DE CÁLCULO */}
        <section id="calculo" ref={calculoRef} className="mt-5 pt-4 border-top">
          <div className="text-center mb-4">
            <h2 className="fw-bold text-dark">Calcule seu metabolismo 🧮</h2>
            <p className="text-muted">Informe seus dados para gerar seu diagnóstico.</p>
          </div>

          <Form onSubmit={handleCalculate}>
            <div className="row g-3">
              <div className="col-md-3">
                <Form.Select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Sexo</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </Form.Select>
              </div>
              <div className="col-md-3">
                <Form.Control type="number" placeholder="Idade" value={age} onChange={(e) => setAge(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <Form.Control type="number" placeholder="Peso (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} required />
              </div>
              <div className="col-md-3">
                <Form.Control type="number" placeholder="Altura (cm)" value={height} onChange={(e) => setHeight(e.target.value)} required />
              </div>
            </div>

            <div className="row g-3 mt-3">
              <div className="col-md-6">
                <Form.Select value={activity} onChange={(e) => setActivity(e.target.value)}>
                  <option value="Sedentario">Sedentário</option>
                  <option value="Leve">Leve (1-3x/sem)</option>
                  <option value="Moderado">Moderado (3-5x/sem)</option>
                  <option value="Intenso">Intenso (6-7x/sem)</option>
                  <option value="Muitointenso">Muito intenso</option>
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

          {/* RESULTADO */}
          {result && (
            <div id="resultado" ref={resultadoRef} className="mt-5 text-center">
              <h4 className="fw-bold text-dark">Seu resultado</h4>
              <p>🔥 TMB: <strong>{result.tmb}</strong> kcal</p>
              <p>💪 Gasto diário: <strong>{result.gastoDiario}</strong> kcal</p>
              <p>🎯 Meta recomendada: <strong className="text-success">{result.meta}</strong> kcal</p>

              <Form onSubmit={(e) => e.preventDefault()}>
                <div className="row g-2 justify-content-center">
                  <div className="col-md-4">
                    <Form.Control type="text" placeholder="Seu nome" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="col-md-4">
                    <Form.Control type="email" placeholder="Seu melhor e-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                  

                  {!onPagamentoConfirmado && (
                    <Button variant="warning" onClick={handleAbrirCheckout}>
                      Receber relatório completo
                    </Button>
                  )}
                  
                  </div>
                  {/* 🔹 Bloco explicativo entre os botões e o checkout */}
<div className="text-center mt-4 bg-warning bg-opacity-10 border rounded-4 p-3">
  <h5 className="fw-bold text-dark mb-2">💎 Relatório Completo MrFit</h5>
  <p className="text-muted mb-1">
    Receba um relatório <strong>personalizado e detalhado</strong> com:
  </p> <br></br>
  <ul className="list-unstyled text-muted small">
    <li>📊 Distribuição de macronutrientes e plano diário</li>
    <li>🥗 Sugestões de refeições equilibradas e flexíveis</li>
    <li>📈 Estratégias personalizadas conforme seu objetivo</li>
    <li>📝 Mais de 30 substituições de refeições para nunca cair na monotonia</li>
    <li>⏱️ Economia de tempo: tudo pronto, você só aplica</li>
    <li>🎯 Controle total do seu progresso e acompanhamento do seu resultado</li>
    <li>💡 Dicas educativas sobre cada alimento, para você aprender enquanto segue o plano</li>
<br></br><br></br>
<h5>Imagine sentir-se <strong>mais leve, disposto </strong>e no controle da sua alimentação a partir de <strong>HOJE !!!</strong> </h5>


  </ul>
  <p className="fw-semibold text-success fs-5 mb-1">
    Apenas <strong>R$ {valorPagamento.toFixed(2)}</strong>
  </p>
  <p className="text-secondary small mb-0">
    ⚠️ Oferta especial: Após o pagamento, seu relatório é enviado automaticamente por e-mail. Garanta já o seu!
  </p>
</div>
                 {mostrarCheckout && (
                   <div className="checkout-container">
                     <CheckoutBricks
                       valor={valorPagamento}
                       descricao="Relatório completo MrFit"
                       relatorio={buildPayload()}
                       nomeUsuario={name}
                       emailUsuario={email}
                       onPagamentoConfirmado={lidarComPagamento}
                       onClose={() => setMostrarCheckout(false)} // Para fechar
                     />
                   </div>
                 )}
              </Form>
            </div>
          )}
        </section>
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
         </section>

         {/* Oferta Especial */}
         <section className="mt-5 py-5 border-top bg-light rounded-4 text-center">
           <h2 className="fw-bold text-dark">Oferta Especial de Lançamento</h2>
           <p className="fs-5 text-muted">
             De <span className="text-decoration-line-through">R$ 49,90</span> por apenas{" "}
             <span className="fw-bold text-success">R$ {valorPagamento.toFixed(2)}</span>
           </p>
           <p className="text-muted">
             Relatório completo + plano de metas + guia alimentar.
           </p>
         </section>

         {/* Rodapé */}
         <footer className="mt-5 pt-4 border-top text-center text-muted small">
           <p>MrFit — Conteúdo informativo. Não substitui nutricionista.</p>
           <p>Política de privacidade | contato@srfit.com.br</p>
         </footer>

        
      </div>
    </div>
  );
}

