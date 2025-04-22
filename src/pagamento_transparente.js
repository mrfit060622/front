import React, { useEffect } from "react";

function TermosDeUso() {
  useEffect(() => {
    const { REACT_APP_API_HOST, REACT_APP_CHAVE_MP } = process.env;

    if (!REACT_APP_API_HOST || !REACT_APP_CHAVE_MP) {
      console.error("⚠️ Variáveis de ambiente não definidas");
      return;
    }

    const loadMercadoPagoScript = () => {
      return new Promise((resolve, reject) => {
        // Evita carregar múltiplas vezes
        if (window.MercadoPago) {
          resolve();
          return;
        }

        const existingScript = document.querySelector('script[src="https://sdk.mercadopago.com/js/v2"]');
        if (existingScript) {
          existingScript.onload = resolve;
          existingScript.onerror = reject;
          return;
        }

        const script = document.createElement("script");
        script.src = "https://sdk.mercadopago.com/js/v2";
        script.async = true;
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });
    };

    const initializeCardForm = () => {
      const mp = new window.MercadoPago(REACT_APP_CHAVE_MP);
      const amount = "1.00";

      mp.cardForm({
        amount,
        autoMount: true,
        iframe: true,
        form: {
          id: "form-checkout",
          cardNumber: { id: "form-checkout__cardNumber", placeholder: "Número do cartão" },
          expirationMonth: { id: "form-checkout__expirationMonth", placeholder: "Mês" },
          expirationYear: { id: "form-checkout__expirationYear", placeholder: "Ano" },
          securityCode: { id: "form-checkout__securityCode", placeholder: "CVV" },
          cardholderName: { id: "form-checkout__cardholderName", placeholder: "Nome no cartão" },
          issuer: { id: "form-checkout__issuer", placeholder: "Banco emissor" },
          installments: { id: "form-checkout__installments", placeholder: "Parcelas" },
          identificationType: { id: "form-checkout__identificationType", placeholder: "Tipo de documento" },
          identificationNumber: { id: "form-checkout__identificationNumber", placeholder: "Número do documento" },
          cardholderEmail: { id: "form-checkout__cardholderEmail", placeholder: "Seu e-mail" },
        },
        callbacks: {
          onFormMounted: error => {
            if (error) {
              console.warn("⚠️ Erro ao montar o formulário:", error);
            } else {
              console.log("✅ Formulário montado com sucesso");
            }
          },
          onSubmit: async event => {
            event.preventDefault();

            try {
              const formData = mp.cardForm().getCardFormData();

              const payload = {
                valor: Number(amount),
                token: formData.token,
                issuer_id: formData.issuerId,
                metodo_pagamento: formData.paymentMethodId,
                parcelamento: Number(formData.installments),
                descricao: "Relatório MrFit",
                payer: {
                  email: formData.cardholderEmail,
                  identification: {
                    tp_doc: formData.identificationType,
                    nr_cpf: formData.identificationNumber,
                  },
                },
              };

              const response = await fetch(`${REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
              });

              const data = await response.json();
              console.log("✅ Pagamento processado:", data);
              alert("Pagamento realizado com sucesso!");
            } catch (error) {
              console.error("❌ Erro ao processar pagamento:", error);
              alert("Erro ao processar pagamento.");
            }
          },
          onFetching: resource => {
            console.log("🔄 Buscando recurso:", resource);
            const progressBar = document.querySelector(".progress-bar");
            if (progressBar) progressBar.removeAttribute("value");

            return () => {
              if (progressBar) progressBar.setAttribute("value", "0");
            };
          },
        },
      });
    };

    const init = async () => {
      try {
        await loadMercadoPagoScript();
        if (window.MercadoPago) {
          initializeCardForm();
        } else {
          console.error("❌ MercadoPago não disponível após carregar script");
        }
      } catch (error) {
        console.error("❌ Falha ao carregar o SDK do Mercado Pago:", error);
      }
    };

    init();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-3">Pagamento - MrFit</h2>
      <form id="form-checkout">
        <div id="form-checkout__cardNumber" className="form-group mb-2"></div>
        <div id="form-checkout__expirationMonth" className="form-group mb-2"></div>
        <div id="form-checkout__expirationYear" className="form-group mb-2"></div>
        <div id="form-checkout__securityCode" className="form-group mb-2"></div>
        <input type="text" id="form-checkout__cardholderName" className="form-control mb-2" placeholder="Nome no cartão" />
        <select id="form-checkout__issuer" className="form-control mb-2"></select>
        <select id="form-checkout__installments" className="form-control mb-2"></select>
        <select id="form-checkout__identificationType" className="form-control mb-2"></select>
        <input type="text" id="form-checkout__identificationNumber" className="form-control mb-2" placeholder="Documento" />
        <input type="email" id="form-checkout__cardholderEmail" className="form-control mb-2" placeholder="E-mail" />
        <button type="submit" className="btn btn-primary w-100">Pagar</button>
      </form>

      <progress className="progress-bar w-100 mt-3" value="0" max="100"></progress>
    </div>
  );
}

export default TermosDeUso;
