import React, { useEffect, useRef, useState } from 'react';

const CheckoutBricks = ({ valor, descricao, onPagamentoConfirmado, relatorio, nomeUsuario, emailUsuario }) => {
  const [loading, setLoading] = useState(false); // só ativa quando Brick vai carregar
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
      script.onload = () => (window.MercadoPago ? resolve(window.MercadoPago) : reject(new Error('SDK carregada mas MercadoPago não disponível.')));
      script.onerror = () => reject(new Error('Falha ao carregar o SDK MercadoPago.'));
      document.body.appendChild(script);
    });

  useEffect(() => {
    // Só inicia o checkout se nome, e-mail e valor estiverem preenchidos
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
                  const { token, payment_method_id, issuer_id, transaction_amount, installments, payer } = formData;

                  if (!token || !payer?.email) {
                    throw new Error('Dados obrigatórios ausentes para o pagamento.');
                  }

                  const payload = {
                    valor: transaction_amount,
                    token,
                    parcelamento: installments,
                    metodo_pagamento: payment_method_id,
                    issuer_id,
                    payer: {
                      email: payer.email || emailUsuario,
                      nome: nomeUsuario || payer.first_name || 'Cliente',
                      identification: {
                        tp_doc: payer.identification.type,
                        nr_cpf: payer.identification.number,
                      },
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
                    setErroCheckout(data.erro || data.message || 'Pagamento recusado.');
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
      if (brickInstanceRef.current?.destroy) brickInstanceRef.current.destroy();
    };
  }, [valor, descricao, relatorio, onPagamentoConfirmado, nomeUsuario, emailUsuario]);

  // Só renderiza o container se nome/email preenchidos
  if (!nomeUsuario || !emailUsuario) return null;

  return (
    <div className="container mt-4">
      <h5>Checkout com Cartão de Crédito</h5>
      <p>Complete os dados abaixo para realizar o pagamento:</p>

      {loading && <div className="alert alert-info">Carregando método de pagamento...</div>}
      {erroCheckout && <div className="alert alert-danger">{erroCheckout}</div>}

      <div ref={paymentBrickContainerRef} id="paymentBrick_container" />
    </div>
  );
};

export default CheckoutBricks;
