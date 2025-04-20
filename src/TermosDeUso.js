import React, { useEffect } from "react";
import { loadMercadoPago } from "@mercadopago/sdk-js";

function TermosDeUso() {
  useEffect(() => {
    async function initMercadoPago() {
      if (!process.env.REACT_APP_API_HOST) {
        console.error("⚠️ Variável REACT_APP_API_HOST não está definida no .env");
        return;
      }

      try {
        // Carregar o SDK do Mercado Pago
        await loadMercadoPago();

        // Inicializar o Mercado Pago
        const mp = new window.MercadoPago("APP_USR-82278741-94ac-4e85-b6ad-6179e250794e");

        const amount = "10.5"; // valor pode ser dinâmico no futuro

        // Iniciar o formulário de pagamento
        const cardForm = mp.cardForm({
          amount,
          iframe: true,  // Defina iframe como true para habilitar o uso do iframe
          form: {
            id: "form-checkout",
            cardNumber: {
              id: "form-checkout__cardNumber",
              placeholder: "Número do cartão",
            },
            expirationMonth: {
              id: "form-checkout__expirationMonth",
              placeholder: "Mês",
            },
            expirationYear: {
              id: "form-checkout__expirationYear",
              placeholder: "Ano",
            },
            securityCode: {
              id: "form-checkout__securityCode",
              placeholder: "CVV",
            },
            cardholderName: {
              id: "form-checkout__cardholderName",
              placeholder: "Nome no cartão",
            },
            issuer: {
              id: "form-checkout__issuer",
              placeholder: "Banco emissor",
            },
            installments: {
              id: "form-checkout__installments",
              placeholder: "Parcelas",
            },
            identificationType: {
              id: "form-checkout__identificationType",
              placeholder: "Tipo de documento",
            },
            identificationNumber: {
              id: "form-checkout__identificationNumber",
              placeholder: "Número do documento",
            },
            cardholderEmail: {
              id: "form-checkout__cardholderEmail",
              placeholder: "Seu e-mail",
            },
          },
          callbacks: {
            onFormMounted: error => {
              if (error) {
                console.warn("Erro ao montar formulário:", error);
              } else {
                console.log("✅ Formulário Mercado Pago montado com sucesso");
              }
            },
            onSubmit: event => {
              event.preventDefault();

              // Obter os dados do formulário
              const {
                paymentMethodId,
                issuerId,
                cardholderEmail,
                amount,
                token,
                installments,
                identificationNumber,
                identificationType,
              } = cardForm.getCardFormData(); // Obtenção correta dos dados

              const payload = {
                valor: Number(amount),
                token,
                issuer_id: issuerId,
                metodo_pagamento: paymentMethodId,
                parcelamento: Number(installments),
                descricao: "Relatório MrFit",
                payer: {
                  email: cardholderEmail,
                  identification: {
                    tp_doc: identificationType,
                    nr_cpf: identificationNumber,
                  },
                },
              };

              console.log("Payload enviado:", payload);  // Log do payload para depuração

              fetch(`${process.env.REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
              })
                .then(res => res.json())
                .then(data => {
                  console.log("✅ Pagamento processado com sucesso:", data);
                  // Ex: redirecionar para página de sucesso
                })
                .catch(err => {
                  console.error("❌ Erro ao processar pagamento:", err);
                });
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
      } catch (error) {
        console.error("❌ Erro ao iniciar Mercado Pago:", error);
      }
    }

    initMercadoPago();
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
