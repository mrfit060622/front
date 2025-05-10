import React, { useState } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';

function Pagamento({ show, onHide, valor = 1.0, descricao = 'Relatório Nutricional Personalizado', idade = 0, peso = 0, altura = 0, sexo = '', atividade = '', objetivo = '', calorias = 0 }) {
  const [paymentData, setPaymentData] = useState({
    transactionAmount: valor,
    description: descricao,
    payerEmail: '',
    payerName: '',
    paymentMethod: '',
    idade:idade,
    peso:peso,
    altura:altura,
    sexo:sexo,
    atividade:atividade,
    objetivo:objetivo,
    calorias:calorias
  });

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!paymentData.payerEmail || !paymentData.payerName) {
      setPaymentStatus('❌ Preencha todos os campos para continuar.');
      return;
    }

    if (paymentData.transactionAmount <= 0) {
      setPaymentStatus('❌ Valor do pagamento inválido.');
      return;
    }

    try {
      setLoading(true);
      setPaymentStatus('🔄 Gerando link de pagamento...');

      const resposta = await axios.post(
        `${process.env.REACT_APP_API_HOST}/pagamento/checkout`,
        paymentData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const { status, init_point } = resposta.data;

      if (status === 'success' && init_point) {
        setPaymentStatus('✅ Redirecionando para o Mercado Pago...');
        window.location.href = init_point;
      } else {
        setPaymentStatus('❌ Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro no pagamento:', error);
      setPaymentStatus('❌ Erro ao iniciar pagamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>💳 Pagamento Seguro</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handlePayment}>
          <Form.Group controlId="formEmail" className="mb-3">
            <Form.Label>E-mail</Form.Label>
            <Form.Control
              type="email"
              value={paymentData.payerEmail}
              onChange={(e) =>
                setPaymentData({ ...paymentData, payerEmail: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group controlId="formNome" className="mb-3">
            <Form.Label>Nome</Form.Label>
            <Form.Control
              type="text"
              value={paymentData.payerName}
              onChange={(e) =>
                setPaymentData({ ...paymentData, payerName: e.target.value })
              }
              required
            />
          </Form.Group>

          <Form.Group controlId="formValor" className="mb-3">
            <Form.Label>Valor a Pagar</Form.Label>
            <Form.Control
              type="text"
              readOnly
              value={`R$ ${paymentData.transactionAmount.toFixed(2)}`}
            />
          </Form.Group>

          <Button variant="primary" type="submit" disabled={loading} className="w-100">
            {loading ? <Spinner animation="border" size="sm" /> : 'Pagar Agora'}
          </Button>
        </Form>

        {paymentStatus && (
          <Alert className="mt-3" variant="info">
            {paymentStatus}
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
}

export default Pagamento;
