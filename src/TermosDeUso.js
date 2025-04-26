import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function TermosDeUso() {
  const valorPagamento = 1.0;
  const [paymentData, setPaymentData] = useState({
    transactionAmount: valorPagamento,
    description: 'Plano de Acompanhamento',
    payerEmail: '',
    payerName: '',
    paymentMethod: 'pix', // Essa chave pode ser usada no futuro se você quiser definir preferências específicas
  });

  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
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
    <Container className="d-flex justify-content-center align-items-center py-5">
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <h2 className="meutitle mb-4">💳 Pagamento Seguro</h2>
              <p className="text-muted">
                Aceitamos pagamento por <strong>PIX, Cartão de Crédito e Débito</strong> via Mercado Pago.
              </p>
              <Form onSubmit={handlePayment}>
                <Form.Group controlId="formEmail" className="mb-3">
                  <Form.Label>E-mail</Form.Label>
                  <Form.Control
                    type="email"
                    name="payerEmail"
                    placeholder="Digite seu e-mail"
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
                    name="payerName"
                    placeholder="Digite seu nome completo"
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

                <Button variant="primary" type="submit" disabled={loading} className="meubutton">
                  {loading ? <Spinner animation="border" size="sm" /> : 'Pagar Agora'}
                </Button>
              </Form>

              {paymentStatus && (
                <Alert className="mt-4" variant="info">
                  {paymentStatus}
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default TermosDeUso;
