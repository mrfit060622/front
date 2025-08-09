import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import CheckoutBricks from './CheckoutBricks';

const niveisAtividade = {
  "1": "Sedentário - Pouca ou nenhuma atividade física regular",
  "2": "Levemente Ativo - Treinos leves 1 a 2 vezes por semana",
  "3": "Moderadamente Ativo - Exercícios regulares 3 a 4 vezes por semana",
  "4": "Muito Ativo - Treinos intensos 5 a 6 vezes por semana",
  "5": "Extremamente Ativo - Exercícios diários com alta intensidade"
};

const objetivosMap = {
  "1": "Manter Peso - Consumo calórico equilibrado",
  "2": "Ganhar Massa Muscular - Excedente calórico com foco em proteínas",
  "3": "Emagrecer - Déficit calórico para perda de gordura"
};

const refeicoes = {
  "Café da Manhã": {
    limite: 3,
    alimentos: [
      "Ovo cozido", "Omelete simples", "Pão francês", "Pão integral", "Tapioca", "Banana",
      "Aveia", "Iogurte natural", "Mamão", "Queijo branco", "Café com leite", "Vitamina de banana"
    ]
  },
  "Almoço/Jantar": {
    limite: 5,
    alimentos: [
      "Arroz branco", "Arroz integral", "Feijão carioca", "Feijão preto", "Grão-de-bico",
      "Frango grelhado", "Peixe assado", "Carne moída", "Batata doce cozida",
      "Batata inglesa cozida", "Salada de alface e tomate", "Brócolis cozido", "Couve refogada",
      "Abobrinha refogada", "Ovo cozido", "Omelete", "Macarrão integral"
    ]
  },
  "Lanche": {
    limite: 3,
    alimentos: [
      "Abacate", "Amendoim torrado", "Castanha de caju", "Nozes", "Maçã", "Pão integral",
      "Pão francês", "Queijo branco", "Uvas", "Iogurte natural", "Pera", "Torrada integral",
      "Biscoito de polvilho"
    ]
  }
};

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const formatarTempo = (segundos) => {
  const minutos = Math.floor(segundos / 60);
  const segundosRestantes = segundos % 60;
  return `${minutos.toString().padStart(2, "0")}:${segundosRestantes.toString().padStart(2, "0")}`;
};

function Detalhes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [calorias, setCalorias] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success' ou 'danger'
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPagamento, setShowPagamento] = useState(false);
  const [showConfirmEmailModal, setShowConfirmEmailModal] = useState(false);
  const [emailToConfirm, setEmailToConfirm] = useState('');
  const [externalReference, setExternalReference] = useState(null);
  const [showSelecaoAlimentos, setShowSelecaoAlimentos] = useState(false);
  const [contador, setContador] = useState(600); // 600 segundos = 10 minutos
  const [preferencias, setPreferencias] = useState({
    "Café da Manhã": [],
    "Almoço/Jantar": [],
    "Lanche": []
  });

  const valorPagamento = 19.90;
  const referenceFromURL = searchParams.get("ref");

  // Contador regressivo
  useEffect(() => {
    if (contador <= 0) return;

    const timerId = setInterval(() => {
      setContador(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [contador]);

  // Carregar dados do formulário
  useEffect(() => {
    const getStoredData = () => {
      const storedDados = sessionStorage.getItem('dadosFormulario');
      const storedCalorias = sessionStorage.getItem('calorias');
      if (storedDados && storedCalorias) {
        setDadosFormulario(JSON.parse(storedDados));
        setCalorias(storedCalorias);
      }
    };

    if (location.state?.dadosFormulario && location.state?.calorias) {
      setDadosFormulario(location.state.dadosFormulario);
      setCalorias(location.state.calorias);
      sessionStorage.setItem('dadosFormulario', JSON.stringify(location.state.dadosFormulario));
      sessionStorage.setItem('calorias', location.state.calorias);
    } else if (referenceFromURL) {
      fetch(`${process.env.REACT_APP_API_HOST}/pdf/consulta_pdf/${referenceFromURL}`)
        .then(res => res.json())
        .then(data => {
          setDadosFormulario({
            nome: data.nome,
            idade: data.idade,
            peso: data.peso,
            altura: data.altura,
            sexo: data.sexo,
            atividade: Object.keys(niveisAtividade).find(k => niveisAtividade[k] === data.atividade),
            objetivo: Object.keys(objetivosMap).find(k => objetivosMap[k] === data.objetivo)
          });
          setCalorias(data.calorias);
          setExternalReference(referenceFromURL);
          setIsPaid(true);
        })
        .catch(err => console.error("Erro ao buscar dados:", err));
    } else {
      getStoredData();
    }
  }, [location.state, referenceFromURL]);

  // Validação e confirmação de email
  const handleValidateEmailAndConfirm = () => {
    setFeedbackMsg('');
    setFeedbackType('');
    setEmailError('');

    if (!isEmailValid(email)) {
      setEmailError('Por favor, insira um e-mail válido.');
      return;
    }

    if (isPaid) {
      setEmailToConfirm(email);
      setShowConfirmEmailModal(true);
    } else {
      handleSendEmail(email);
    }
  };

  // Enviar email
  const handleSendEmail = async (emailParam) => {
    setLoading(true);
    setFeedbackMsg('');
    setFeedbackType('');
    setEmailError('');

    if (!dadosFormulario) {
      setFeedbackMsg('Dados do formulário não encontrados.');
      setFeedbackType('danger');
      setLoading(false);
      return;
    }

    const endpoint = `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf_pg`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: emailParam,
          nome: dadosFormulario.nome,
          calorias,
          idade: dadosFormulario.idade,
          peso: dadosFormulario.peso,
          altura: dadosFormulario.altura,
          sexo: dadosFormulario.sexo === 'm' ? 'Masculino' : 'Feminino',
          atividade: niveisAtividade[dadosFormulario.atividade],
          objetivo: objetivosMap[dadosFormulario.objetivo],
          preferencias,
          data: new Date().toLocaleDateString(),
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Erro ao enviar');

      setFeedbackMsg(result.message || 'PDF enviado com sucesso!');
      setFeedbackType('success');
      setEmail('');
      setShowModal(false);
      setShowConfirmEmailModal(false);
    } catch (error) {
      console.error('Erro:', error);
      setFeedbackMsg('Erro ao enviar o e-mail. Tente novamente.');
      setFeedbackType('danger');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal do resumo (gratuito)
  const abrirResumo = () => {
    setIsPaid(false);
    setShowModal(true);
    setFeedbackMsg('');
    setFeedbackType('');
    setEmail('');
    setEmailError('');
  };

  // Abrir modal de seleção de alimentos antes do pagamento
  const abrirSelecaoAlimentos = () => {
    setShowSelecaoAlimentos(true);
  };

  // Confirmar pagamento
  const onPagamentoConfirmado = (ref) => {
    setExternalReference(ref);
    setIsPaid(true);
    setShowPagamento(false);
    setShowModal(true);
    setFeedbackMsg('');
    setFeedbackType('');
    setEmail('');
    setEmailError('');
  };

  // Alternar alimentos selecionados
  const toggleAlimento = (refeicao, alimento) => {
    setPreferencias(prev => {
      const selecionados = prev[refeicao];
      if (selecionados.includes(alimento)) {
        return {
          ...prev,
          [refeicao]: selecionados.filter(a => a !== alimento)
        };
      } else {
        if (selecionados.length < refeicoes[refeicao].limite) {
          return {
            ...prev,
            [refeicao]: [...selecionados, alimento]
          };
        } else {
          alert(`Você só pode escolher até ${refeicoes[refeicao].limite} alimentos para ${refeicao}.`);
          return prev;
        }
      }
    });
  };

  if (!calorias || !dadosFormulario) return <p>Erro: Nenhum dado recebido.</p>;

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card className="meucard" style={{ maxWidth: '450px', width: '100%' }}>
        <h2 align="center">Diagnóstico Calórico 🏋️</h2>
        <p><strong>Nome:</strong> {dadosFormulario.nome}</p>
        <p><strong>Idade:</strong> {dadosFormulario.idade} anos</p>
        <p><strong>Peso:</strong> {dadosFormulario.peso} kg</p>
        <p><strong>Altura:</strong> {dadosFormulario.altura} cm</p>
        <p><strong>Sexo:</strong> {dadosFormulario.sexo === 'm' ? 'Masculino' : 'Feminino'}</p>
        <p><strong>Atividade Física:</strong> {niveisAtividade[dadosFormulario.atividade]}</p>
        <p><strong>Objetivo:</strong> {objetivosMap[dadosFormulario.objetivo]}</p>
        <h3>Calorias Necessárias: {calorias}</h3>

        <div className="d-flex flex-column align-items-center mt-3 gap-2">
          <Button className='meubutton' onClick={abrirResumo} variant="secondary" style={{ width: '100%' }}>
            Receba seu Resumo Nutricional Grátis 🥗
          </Button>

          <Button className='meubutton' onClick={abrirSelecaoAlimentos} variant="secondary" style={{ width: '100%' }}>
            Adquirir Relatório Completo por apenas R$ 19,90🔥
          </Button>
        </div>

        <Button className='meubutton mt-3' onClick={() => navigate('/')} variant="primary" style={{ width: '100%' }}>
          Voltar
        </Button>
      </Card>

      {/* Modal: Enviar PDF por e-mail */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Enviar {isPaid ? 'Relatório Completo' : 'Resumo Nutricional'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label><strong>Escolha seus alimentos preferidos por refeição</strong></Form.Label>
              {Object.entries(refeicoes).map(([refeicao, { limite, alimentos }]) => (
                <div key={refeicao} className="mb-3">
                  <strong>{refeicao} (Escolha até {limite} opções)</strong>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {alimentos.map((alimento, idx) => {
                      const isSelected = preferencias[refeicao].includes(alimento);
                      return (
                        <Button
                          key={idx}
                          variant={isSelected ? "success" : "outline-secondary"}
                          size="sm"
                          onClick={() => toggleAlimento(refeicao, alimento)}
                        >
                          {alimento}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </Form.Group>
            <Form.Group controlId="email">
              <Form.Label>Digite seu e-mail</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                isInvalid={!!emailError}
                disabled={loading}
              />
              <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
            </Form.Group>
            <Button
              className="mt-3"
              variant="success"
              onClick={handleValidateEmailAndConfirm}
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? <Spinner size="sm" animation="border" /> : "Enviar"}
            </Button>
            {feedbackMsg && (
              <Alert className="mt-3" variant={feedbackType || 'info'}>
                {feedbackMsg}
              </Alert>
            )}
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal: Confirmação do e-mail para PDF pago */}
      <Modal show={showConfirmEmailModal} onHide={() => setShowConfirmEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirme seu e-mail</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Por favor, confirme que seu e-mail está correto para enviar o relatório:</p>
          <p><strong>{emailToConfirm}</strong></p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" className='meubutton' onClick={() => setShowConfirmEmailModal(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            className='meubutton'
            onClick={() => handleSendEmail(emailToConfirm)}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" animation="border" /> : "Confirmar e Enviar"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Seleção de Alimentos antes do pagamento */}
      <Modal
        show={showSelecaoAlimentos}
        onHide={() => setShowSelecaoAlimentos(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Escolha seus alimentos preferidos</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {Object.entries(refeicoes).map(([refeicao, { limite, alimentos }]) => (
            <div key={refeicao} className="mb-3">
              <strong>{refeicao} (máx. {limite})</strong>
              <div className="d-flex flex-wrap gap-2 mt-1">
                {alimentos.map((alimento, idx) => {
                  const isSelected = preferencias[refeicao]?.includes(alimento);
                  return (
                    <Button
                      key={idx}
                      variant={isSelected ? "success" : "outline-secondary"}
                      size="sm"
                      onClick={() => toggleAlimento(refeicao, alimento)}
                    >
                      {alimento}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button className='meubutton' variant="secondary" onClick={() => setShowSelecaoAlimentos(false)}>
            Cancelar
          </Button>
          <Button className='meubutton'
            variant="primary"
            onClick={() => {
              setShowSelecaoAlimentos(false);
              setShowPagamento(true);
              setContador(600); // Reinicia contador ao abrir pagamento
            }}
          >
            Conclua o pagamento e receba por e-mail seu relatório completo
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Pagamento */}
      <Modal show={showPagamento} onHide={() => setShowPagamento(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Relatório Nutricional Completo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <CheckoutBricks
            valor={valorPagamento}
            descricao="Relatório Nutricional Completo"
            onPagamentoConfirmado={onPagamentoConfirmado}
          />
        </Modal.Body>
      </Modal>
       {/* Contador com estilo profissional */}
          <div
            style={{
              fontWeight: '700',
              fontSize: '1.4rem',
              textAlign: 'center',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              backgroundColor: contador <= 60 ? '#ffdddd' : '#e0f7fa',
              color: contador <= 60 ? '#d32f2f' : '#00796b',
              boxShadow: '0 0 10px rgba(0,0,0,0.1)',
              marginBottom: '1.5rem',
              userSelect: 'none',
              transition: 'all 0.3s ease',
              fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
            }}
            aria-live="polite"
            aria-atomic="true"
          >
            Oferta termina em: {formatarTempo(contador)}
          </div>

          {contador <= 0 && (
            <Alert variant="danger" className="mb-3 text-center">
              Oferta expirada! Por favor, recarregue a página para tentar novamente.
            </Alert>
          )}
    </Container>
  );
}

export default Detalhes;
