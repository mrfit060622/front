import React, { useEffect, useRef, useState } from 'react';

const CheckoutBricks = ({ valor, descricao, onPagamentoConfirmado, relatorio }) => {
  const [loading, setLoading] = useState(true);
  const [erroCheckout, setErroCheckout] = useState(null);

  const bricksBuilderRef = useRef(null);
  const brickInstanceRef = useRef(null);
  const paymentBrickContainerRef = useRef(null);

  const loadMercadoPagoScript = () => {
    return new Promise((resolve, reject) => {
      if (window.MercadoPago) return resolve(window.MercadoPago);

      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.async = true;
      script.onload = () => {
        if (window.MercadoPago) resolve(window.MercadoPago);
        else reject(new Error('SDK carregada mas MercadoPago não disponível.'));
      };
      script.onerror = () => reject(new Error('Falha ao carregar o SDK MercadoPago.'));
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    const startCheckout = async () => {
      try {
        if (brickInstanceRef.current) return;

        const MercadoPago = await loadMercadoPagoScript();
        const mpInstance = new MercadoPago(process.env.REACT_APP_CHAVE_MP, {
          locale: 'pt-BR',
        });

        const bricksBuilder = mpInstance.bricks();
        bricksBuilderRef.current = bricksBuilder;

        const valorPagamento = valor >= 1 ? valor : 1;

        if (paymentBrickContainerRef.current) {
          const brickInstance = await bricksBuilder.create('cardPayment', 'paymentBrick_container', {
            initialization: {
              amount: valorPagamento,
            },
            customization: {
              paymentMethods: {
                maxInstallments: 1,
              },
            },
            callbacks: {
              onReady: () => setLoading(false),
              onSubmit: async (formData) => {
                try {
                  console.log('Dados recebidos do Brick:', formData);

                  if (
                    !formData.token ||
                    !formData.payer?.email ||
                    !formData.payer?.name ||
                    !formData.payer?.identification?.type ||
                    !formData.payer?.identification?.number
                  ) {
                    throw new Error('Dados obrigatórios ausentes para o pagamento.');
                  }

                  const response = await fetch(`${process.env.REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      valor: valorPagamento,
                      token: formData.token,
                      parcelamento: formData.parcelamento,
                      metodo_pagamento: formData.metodo_pagamento,
                      payer: {
                        email: formData.payer.email,
                        nome: formData.payer.name,
                        identification: {
                          tp_doc: formData.payer.identification.type,
                          nr_cpf: formData.payer.identification.number,
                        },
                      },
                      relatorio,
                    }),
                  });

                  const data = await response.json();
                  console.log('Resposta da API:', data);

                  if (response.ok && data.status === 'approved') {
                    onPagamentoConfirmado(data.external_reference || data.status);
                  } else {
                    const erroMsg = data.erro || data.message || 'Pagamento recusado.';
                    setErroCheckout(`Erro: ${erroMsg}`);
                  }
                } catch (error) {
                  console.error('Erro no envio dos dados para pagamento:', error);
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
        console.error('Erro geral no Checkout:', error);
        setErroCheckout('Erro ao iniciar o checkout.');
      }
    };

    startCheckout();

    return () => {
      if (brickInstanceRef.current?.destroy) {
        brickInstanceRef.current.destroy();
      }
    };
  }, [valor, descricao, relatorio, onPagamentoConfirmado]);

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
