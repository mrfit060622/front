import React, { useEffect, useRef, useState } from 'react';
import { Button } from "react-bootstrap";

const CheckoutBricks = ({ valor, descricao, onPagamentoConfirmado, relatorio, nomeUsuario, emailUsuario, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [erroCheckout, setErroCheckout] = useState(null);

  const bricksBuilderRef = useRef(null);
  const brickInstanceRef = useRef(null);
  const paymentBrickContainerRef = useRef(null);

  const loadMercadoPagoScript = () =>
    new Promise((resolve, reject) => {
      if (window.MercadoPago) return resolve(window.MercadoPago);

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () =>
        window.MercadoPago
          ? resolve(window.MercadoPago)
          : reject(new Error('SDK carregada mas MercadoPago não disponível.'));
      script.onerror = () => reject(new Error('Falha ao carregar o SDK MercadoPago.'));
      document.body.appendChild(script);
    });

  // Função de fechar/destruir
  const handleClose = () => {
    if (brickInstanceRef.current?.destroy) {
      brickInstanceRef.current.destroy();
      brickInstanceRef.current = null;
    }
    if (onClose) onClose();
  };

  useEffect(() => {
    if (!nomeUsuario || !emailUsuario || !valor) return;

    const startCheckout = async () => {
      try {
        setErroCheckout(null);
        setLoading(true);

        // Destrói brick anterior se existir
        if (brickInstanceRef.current?.destroy) {
          brickInstanceRef.current.destroy();
          brickInstanceRef.current = null;
        }

        const MercadoPago = await loadMercadoPagoScript();
        const mpInstance = new MercadoPago(process.env.REACT_APP_CHAVE_MP, { locale: 'pt-BR' });
        const bricksBuilder = mpInstance.bricks();
        bricksBuilderRef.current = bricksBuilder;

        if (paymentBrickContainerRef.current) {
          const brickInstance = await bricksBuilder.create('cardPayment', 'paymentBrick_container', {
            initialization: { amount: valor >= 1 ? valor : 1 },
            customization: { paymentMethods: { maxInstallments: 1 } },
            callbacks: {
              onReady: () => setLoading(false),
              onSubmit: async (formData) => {
                try {
                  const payload = {
                    valor: formData.transaction_amount,
                    token: formData.token,
                    parcelamento: formData.installments,
                    metodo_pagamento: formData.payment_method_id,
                    issuer_id: formData.issuer_id,
                    payer: {
                      email: formData.payer.email || emailUsuario,
                      nome: nomeUsuario || formData.payer.first_name || 'Cliente',
                      identification: formData.payer.identification,
                    },
                    relatorio,
                  };

                  const response = await fetch(`${process.env.REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                  });

                  const data = await response.json().catch(() => null);

                  if (response.ok && data?.status === 'success') {
                    onPagamentoConfirmado(data.external_reference || data.status);
                    setErroCheckout(null);
                  } else {
                    setErroCheckout(data?.erro || data?.message || 'Pagamento recusado.');
                  }
                } catch (err) {
                  console.error(err);
                  setErroCheckout('Erro ao finalizar o pagamento. Verifique os dados e tente novamente.');
                }
              },
              onError: (error) => {
                console.error('Erro no Brick:', error);
                setErroCheckout('Erro ao carregar o método de pagamento. Tente novamente.');
              },
            },
          });

          brickInstanceRef.current = brickInstance;
        }
      } catch (error) {
        console.error(error);
        setErroCheckout('Erro ao iniciar o checkout.');
        setLoading(false);
      }
    };

    startCheckout();

    return () => {
      // desmonta corretamente
      if (brickInstanceRef.current?.destroy) brickInstanceRef.current.destroy();
    };
  }, [valor, nomeUsuario, emailUsuario, relatorio, onPagamentoConfirmado]);

  if (!nomeUsuario || !emailUsuario) return null;

  return (
    <div className="container mt-4">
      <h5>Checkout com Cartão de Crédito</h5>
      <p>Complete os dados abaixo para realizar o pagamento:</p>

      {loading && <div className="alert alert-info">Carregando método de pagamento...</div>}
      {erroCheckout && <div className="alert alert-danger">{erroCheckout}</div>}

      <div ref={paymentBrickContainerRef} id="paymentBrick_container" />

      <Button variant="outline-danger" size="sm" onClick={handleClose}>
        Cancelar
      </Button>
    </div>
  );
};

export default CheckoutBricks;
