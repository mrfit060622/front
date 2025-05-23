import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Card, Button, Modal, Form, Spinner } from 'react-bootstrap';
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

function Detalhes() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [calorias, setCalorias] = useState(null);
  const [dadosFormulario, setDadosFormulario] = useState(null);
  const [email, setEmail] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPagamento, setShowPagamento] = useState(false);
  const [externalReference, setExternalReference] = useState(null);

  const valorPagamento = 0.25;
  const referenceFromURL = searchParams.get("ref");

  // Carregar dados do location ou da API (apenas uma vez)
  useEffect(() => {
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
            atividade: Object.keys(niveisAtividade).find(key => niveisAtividade[key] === data.atividade),
            objetivo: Object.keys(objetivosMap).find(key => objetivosMap[key] === data.objetivo),
          });
          setCalorias(data.calorias);
          setExternalReference(referenceFromURL);
          setIsPaid(true);
        })
        .catch(err => {
          console.error("Erro ao buscar dados:", err);
        });
    } else {
      const storedDadosFormulario = sessionStorage.getItem('dadosFormulario');
      const storedCalorias = sessionStorage.getItem('calorias');
      if (storedDadosFormulario && storedCalorias) {
        setDadosFormulario(JSON.parse(storedDadosFormulario));
        setCalorias(storedCalorias);
      }
    }
  }, [location.state, referenceFromURL]);

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleSendEmail = async () => {
    if (loading || !dadosFormulario) return;
    setLoading(true);

    const endpoint = isPaid
      ? `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf_pg`
      : `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email,
          nome: dadosFormulario.nome,
          calorias,
          idade: dadosFormulario.idade,
          peso: dadosFormulario.peso,
          altura: dadosFormulario.altura,
          sexo: dadosFormulario.sexo === 'm' ? 'Masculino' : 'Feminino',
          atividade: niveisAtividade[dadosFormulario.atividade],
          objetivo: objetivosMap[dadosFormulario.objetivo],
          data: new Date().toLocaleDateString(),
        })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Erro ao enviar');

      alert(result.message || 'PDF enviado com sucesso!');
      setShowModal(false);
      setEmail('');
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao enviar o e-mail. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePagamento = () => {
    setShowPagamento(true);
  };

  const onPagamentoConfirmado = (externalRef) => {
    setExternalReference(externalRef);
    setIsPaid(true);
    setShowPagamento(false);
    setShowModal(true);
  };

  const verificarStatusPagamento = async () => {
    if (!externalReference) {
      alert("Pagamento não iniciado ou referência ausente.");
      return;
    }

    try {
      setCheckingStatus(true);
      const resposta = await fetch(`${process.env.REACT_APP_API_HOST}/pagamento/status/${externalReference}`);
      const data = await resposta.json();

      if (data.status === "approved") {
        setIsPaid(true);
        setShowModal(true);
      } else {
        alert("Pagamento ainda não confirmado. Tente novamente mais tarde.");
      }
    } catch (erro) {
      console.error("Erro ao verificar status:", erro);
      alert("Erro ao verificar o status do pagamento.");
    } finally {
      setCheckingStatus(false);
    }
  };

  if (!calorias || !dadosFormulario) {
    return <p>Erro: Nenhum dado recebido.</p>;
  }

  return (
    <Container className="d-flex justify-content-center align-items-center">
      <Card className="meucard">
        <h2 align='center'>Diagnóstico Calórico 🏋️</h2>
        <p><strong>Nome:</strong> {dadosFormulario.nome}</p>
        <p><strong>Idade:</strong> {dadosFormulario.idade} anos</p>
        <p><strong>Peso:</strong> {dadosFormulario.peso} kg</p>
        <p><strong>Altura:</strong> {dadosFormulario.altura} cm</p>
        <p><strong>Sexo:</strong> {dadosFormulario.sexo === 'm' ? 'Masculino' : 'Feminino'}</p>
        <p><strong>Atividade Física:</strong> {niveisAtividade[dadosFormulario.atividade]}</p>
        <p><strong>Objetivo:</strong> {objetivosMap[dadosFormulario.objetivo]}</p>
        <h3>Calorias Necessárias: {calorias}</h3>

        <div className="d-flex flex-column align-items-center mt-3">
          <Button className='meubutton' onClick={() => { setIsPaid(false); setShowModal(true); }} variant="secondary">
            Resumo Nutricional 🥗
          </Button>

          <Button className='meubutton' onClick={handlePagamento} variant="secondary">
            Adquirir Relatório Completo 🔥
          </Button>

          <Button className='meubutton' onClick={verificarStatusPagamento} variant="secondary" disabled={checkingStatus}>
            {checkingStatus ? "Verificando pagamento..." : "Enviar Relatório Completo via e-mail 🔥"}
          </Button>
        </div>

        <Button className='meubutton mt-3' onClick={() => navigate('/')} variant="primary">
          Voltar
        </Button>
      </Card>

      {/* Modal de envio de email */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Enviar Resumo Nutricional</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="email">
              <Form.Label>Digite seu e-mail</Form.Label>
              <Form.Control type="email" value={email} onChange={handleEmailChange} required />
            </Form.Group>
            <Button className="mt-3" variant="success" onClick={handleSendEmail} disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" /> : "Enviar"}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de pagamento */}
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
    </Container>
  );
}

export default Detalhes;
