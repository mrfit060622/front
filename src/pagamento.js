import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState } from 'react';
import { Modal, Spinner } from 'react-bootstrap';
import axios from 'axios';

function Pagamento({ show, onHide, valor, descricao, email, nome, onPagamentoConfirmado }) {
  const [preferenceId, setPreferenceId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!show) return;

  initMercadoPago(process.env.REACT_APP_CHAVE_MP);

    const criarcriarPagamento = async () => {
      try {
        setLoading(true);
        const resposta = await axios.post(`${process.env.REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
          transactionAmount: valor,
          description: descricao,
          payerEmail: email,
          payerName: nome,
          paymentMethodId: null, // null para mostrar todas
        });
        setPreferenceId(resposta.data.id);
      } catch (err) {
        console.error("Erro ao criar preferência de pagamento:", err);
      } finally {
        setLoading(false);
      }
    };

    criarcriarPagamento();
  }, [show, valor, descricao, email, nome]);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Pagamento</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        {loading && <Spinner animation="border" />}
        {preferenceId && (
          <Wallet
            initialization={{ preferenceId }}
            customization={{ texts: { valueProp: 'smart_option' } }}
          />
        )}
      </Modal.Body>
    </Modal>
  );
}

export default Pagamento;
