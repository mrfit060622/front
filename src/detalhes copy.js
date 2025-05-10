import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Modal, Form,Spinner} from 'react-bootstrap';
import Pagamento from './pagamento';

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
  const { calorias, dadosFormulario } = location.state || {}; 
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPagamento, setShowPagamento] = useState(false);
  const [externalReference, setExternalReference] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const valorPagamento = 0.25;

  const handleSendEmail = async () => {
    if (loading) return;
    setLoading(true);

    const endpoint = isPaid 
        ? `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf_pg`
        : `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          nome: dadosFormulario?.nome,
          calorias,
          idade: dadosFormulario?.idade,
          peso: dadosFormulario?.peso,
          altura: dadosFormulario?.altura,
          sexo: dadosFormulario?.sexo === 'm' ? 'Masculino' : 'Feminino',
          atividade: niveisAtividade[dadosFormulario?.atividade],
          objetivo: objetivosMap[dadosFormulario?.objetivo],
          data: new Date().toLocaleDateString(),
        }),
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Erro ao enviar o e-mail');
      const result = await response.json();
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

  // 🔍 Consulta do status do pagamento
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
        setShowModal(true); // Abre modal de envio
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

          {/* ✅ Botão com verificação de pagamento */}
          <Button className='meubutton' onClick={verificarStatusPagamento} variant="secondary" disabled={checkingStatus}>
            {checkingStatus ? "Verificando pagamento..." : "Enviar Relatório Completo via e-mail 🔥"}
          </Button>
        </div>

        <Button className='meubutton' onClick={() => navigate('/')} variant="primary">Voltar</Button>
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
      <Pagamento
        show={showPagamento}
        onHide={() => setShowPagamento(false)}
        valor={valorPagamento}
        descricao="Relatório Nutricional Completo"
        idade={dadosFormulario.idade}
        peso={dadosFormulario.peso}
        altura={dadosFormulario.altura}
        sexo={dadosFormulario.sexo}
        atividade={niveisAtividade[dadosFormulario.atividade]}
        objetivo={objetivosMap[dadosFormulario.objetivo]}
        calorias={calorias}
      />
    </Container>
  );
}

export default Detalhes;