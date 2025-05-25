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

const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  const valorPagamento = 1; // preço atualizado para o relatório completo
  const descricaoPagamento = "Relatório Nutricional Completo com análise detalhada de macronutrientes, sugestões personalizadas e plano alimentar.";  
  const produtoNome = "Relatório Nutricional Completo";

  const referenceFromURL = searchParams.get("ref");

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

    const endpoint = isPaid
      ? `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf_pg`
      : `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf`;

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
          data: new Date().toLocaleDateString(),
          produto: isPaid ? produtoNome : "Resumo Nutricional",
          valor: isPaid ? valorPagamento : 0
        })
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Erro ao enviar');
       
    setFeedbackMsg(result.message || 'PDF enviado com sucesso!');
    setFeedbackType('success');
    setEmail('');

// Fechar o modal após um tempo para dar tempo de ver o alerta
    setTimeout(() => {
    setShowModal(false);
    setShowConfirmEmailModal(false);
    setFeedbackMsg('');
    setFeedbackType('');
    }, 3000); // 3 segundos
    } catch (error) {
      console.error('Erro:', error);
      setFeedbackMsg('Erro ao enviar o e-mail. Tente novamente.');
      setFeedbackType('danger');
    } finally {
      setLoading(false);
    }
  };

  const abrirResumo = () => {
    setIsPaid(false);
    setShowModal(true);
    setFeedbackMsg('');
    setFeedbackType('');
    setEmail('');
    setEmailError('');
  };

  const handlePagamento = () => setShowPagamento(true);

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

  if (!calorias || !dadosFormulario) return <p>Erro: Nenhum dado recebido.</p>;

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card className="meucard">
        <h2 align="center">Diagnóstico Calórico 🏋️</h2>
        <p><strong>Nome:</strong> {dadosFormulario.nome}</p>
        <p><strong>Idade:</strong> {dadosFormulario.idade} anos</p>
        <p><strong>Peso:</strong> {dadosFormulario.peso} kg</p>
        <p><strong>Altura:</strong> {dadosFormulario.altura} cm</p>
        <p><strong>Sexo:</strong> {dadosFormulario.sexo === 'm' ? 'Masculino' : 'Feminino'}</p>
        <p><strong>Atividade Física:</strong> {niveisAtividade[dadosFormulario.atividade]}</p>
        <p><strong>Objetivo:</strong> {objetivosMap[dadosFormulario.objetivo]}</p>
        <h3>Calorias Necessárias: {calorias}</h3>

        <div className="d-flex flex-column align-items-center mt-3">
          <Button className='meubutton' onClick={abrirResumo} variant="secondary">
            Resumo Nutricional 🥗
          </Button>

          <Button className='meubutton' onClick={handlePagamento} variant="secondary">
            Adquirir Relatório Completo 🔥
          </Button>
        </div>

        <Button className='meubutton mt-3' onClick={() => navigate('/')} variant="primary">
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
            <Form.Group controlId="email">
              <Form.Label>Digite seu e-mail para receber o PDF:</Form.Label>
              <Form.Control
                type="email"
                placeholder="exemplo@dominio.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                isInvalid={!!emailError}
              />
              <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
            </Form.Group>

            {feedbackMsg && (
              <Alert variant={feedbackType} className="mt-3">
                {feedbackMsg}
              </Alert>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={loading} onClick={handleValidateEmailAndConfirm}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Enviar PDF'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Confirmação de E-mail para PDF Pago */}
      <Modal show={showConfirmEmailModal} onHide={() => setShowConfirmEmailModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmação</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Confirma que deseja receber o relatório no e-mail <strong>{emailToConfirm}</strong>?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmEmailModal(false)}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={() => handleSendEmail(emailToConfirm)}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Confirmar'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Pagamento */}
      <Modal show={showPagamento} onHide={() => setShowPagamento(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Pagamento do Relatório Completo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>Produto:</strong> {produtoNome}</p>
          <p><strong>Descrição:</strong> {descricaoPagamento}</p>
          <p><strong>Valor:</strong> R$ {valorPagamento.toFixed(2)}</p>

          {/* Passa a descrição, valor, e callback para CheckoutBricks */}
          <CheckoutBricks
            valor={valorPagamento}
            descricao={descricaoPagamento}
            produto={produtoNome}
            onPagamentoConfirmado={onPagamentoConfirmado}
          />
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default Detalhes;
