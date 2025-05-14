import React, { useState, useEffect, useRef } from 'react';

const CheckoutBricks = ({ valor, descricao, onPagamentoConfirmado, relatorio }) => {
  const [email, setEmail] = useState('');
  const [docNumber] = useState('');
  const [nome] = useState('');
  const bricksBuilderRef = useRef(null); // Salva instância para evitar duplicação
  const paymentBrickContainerRef = useRef(null); // Ref do container do Brick

  // Carrega o script do Mercado Pago dinamicamente
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

  // Inicializa o Brick
  useEffect(() => {
    const startCheckout = async () => {
      try {
        if (bricksBuilderRef.current) return; // Já criado, não recriar

        const MercadoPago = await loadMercadoPagoScript();
        const mpInstance = new MercadoPago(process.env.REACT_APP_CHAVE_MP, {
          locale: 'pt-BR',
        });

        const bricksBuilder = mpInstance.bricks();
        bricksBuilderRef.current = bricksBuilder;

        const valorPagamento = valor >= 1 ? valor : 1;

        if (paymentBrickContainerRef.current) {
          await bricksBuilder.create('cardPayment', 'paymentBrick_container', {
            initialization: {
              amount: valorPagamento,
            },
            customization: {
              paymentMethods: {
                maxInstallments: 1,
              },
            },
            callbacks: {
              onReady: () => {
                console.log('✅ Brick pronto');
              },
              onSubmit: async ({ formData }) => {
                try {
                  // Criar o token do cartão
                  const cardData = {
                    card_number: formData.cardNumber,
                    expiration_year: formData.expirationYear,
                    expiration_month: formData.expirationMonth,
                    security_code: formData.securityCode,
                    cardholder: {
                      name: formData.cardholderName,
                      identification: {
                        type: 'CPF',
                        number: docNumber,
                      },
                    },
                  };

                  console.log('Enviando dados para criar o token do cartão:', cardData);

                  const response = await fetch('https://api.mercadopago.com/v1/card_tokens', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${process.env.REACT_APP_MP_ACCESS_TOKEN}`, // Use seu token de acesso
                    },
                    body: JSON.stringify(cardData),
                  });

                  const data = await response.json();
                  console.log('Resposta da criação do token do cartão:', data);

                  if (data.id) {
                    // Token do cartão criado com sucesso
                    // Agora, envie o token para o seu backend para processamento do pagamento
                    console.log('Token do cartão criado com sucesso:', data.id);
                    await fetch(`${process.env.REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        valor: valorPagamento,
                        token: data.id,  // O token criado
                        parcelamento: formData.installments,
                        metodo_pagamento: formData.paymentMethodId,
                        payer: {
                          email,
                          nome,
                          identification: {
                            tp_doc: 'CPF',
                            nr_cpf: docNumber,
                          },
                        },
                        relatorio,
                      }),
                    })
                      .then(res => res.json())
                      .then(data => {
                        console.log('Pagamento confirmado:', data);
                        onPagamentoConfirmado(data.external_reference || data.status);
                      })
                      .catch(error => {
                        console.error('Erro ao processar pagamento:', error);
                      });
                  } else {
                    console.error('Falha ao criar token:', data);
                    if (data.message) {
                      console.error('Erro no Mercado Pago:', data.message);
                    }
                  }
                } catch (error) {
                  console.error('Erro ao criar o token do cartão:', error);
                }
              },
              onError: (error) => {
                console.error('❌ Erro no Brick:', error);
              },
            },
          });
        }
      } catch (error) {
        console.error('❌ Erro geral no CheckoutBricks:', error);
      }
    };

    startCheckout();

    // Cleanup para evitar vazamentos de memória
    return () => {
      if (bricksBuilderRef.current) {
        bricksBuilderRef.current.destroy();
      }
    };
  }, [valor, descricao, email, docNumber, nome, relatorio, onPagamentoConfirmado]);

  return (
    <div className="container mt-4">
      <h5>Checkout com Cartão de Crédito</h5>
      <p className="mb-3">Preencha os dados abaixo para concluir o pagamento:</p>
      <div ref={paymentBrickContainerRef} id="paymentBrick_container" />
    </div>
  );
};

export default CheckoutBricks;
