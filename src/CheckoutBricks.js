import React, { useEffect, useRef, useState } from 'react';

const CheckoutBricks = ({ valor, descricao, onPagamentoConfirmado, relatorio }) => {
  const [loading, setLoading] = useState(true);
  const [erroCheckout, setErroCheckout] = useState(null);

  const bricksBuilderRef = useRef(null);
  const brickInstanceRef = useRef(null);
  const paymentBrickContainerRef = useRef(null);

  // Carrega o script do Mercado Pago
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
              onReady: () => {
                setLoading(false);
              },
              onSubmit: async (formData) => {
  try {
    console.log("Dados recebidos no onSubmit:", formData);

    if (!formData || !formData.token) {
      throw new Error('Dados do formulário de pagamento não encontrados.');
    }

    const response = await fetch(`${process.env.REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    valor: valor >= 1 ? valor : 1,
    token: formData.token,
    parcelamento: formData.parcelamento,
    metodo_pagamento: formData.metodo_pagamento,
    payer: {
      email: formData.email,
      nome: formData.nome,
      identification: {
        tp_doc: formData.tp_doc,
        nr_cpf: formData.nr_cpf
      }
    },
    relatorio
  }),
});

    if (!response.ok) {
      throw new Error('Erro ao processar pagamento.');
    }

    const data = await response.json();

    if (data.status === 'approved') {
      onPagamentoConfirmado(data.external_reference || data.status);
    } else {
      setErroCheckout(`Pagamento recusado: ${data.status_detail || data.status}`);
    }

  } catch (error) {
    console.error('Erro ao processar pagamento:', error);
    setErroCheckout('Erro ao finalizar o pagamento. Tente novamente.');
  }
}
,

              onError: (error) => {
                console.error('Erro no Brick:', error);
                setErroCheckout('Erro ao carregar o método de pagamento.');
              },
            },
          });

          brickInstanceRef.current = brickInstance;
        }
      } catch (error) {
        console.error('Erro geral:', error);
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
