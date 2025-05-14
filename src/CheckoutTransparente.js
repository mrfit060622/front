import React, { useState, useEffect } from "react";


const CheckoutTransparente = ({ valor, descricao, onPagamentoConfirmado, dadosExtras }) => {
  const [email, setEmail] = useState("");
  const [docNumber, setDocNumber] = useState("");

  useEffect(() => {
    if (!window.MercadoPago) {
      console.error("SDK do Mercado Pago não carregado.");
      return;
    }

    const mp = new window.MercadoPago(process.env.REACT_APP_CHAVE_MP);
    console.log (process.env.REACT_APP_CHAVE_MP)

    mp.cardForm({
      amount: valor,
      autoMount: true,
      form: {
        id: "form-checkout",
        cardholderName: { id: "form-checkout__cardholderName" },
        cardholderEmail: { id: "form-checkout__cardholderEmail" },
        cardNumber: { id: "form-checkout__cardNumber" },
        expirationDate: { id: "form-checkout__expirationDate" },
        securityCode: { id: "form-checkout__securityCode" },
        identificationType: { id: "form-checkout__identificationType" },
        identificationNumber: { id: "form-checkout__identificationNumber" },
        issuer: { id: "form-checkout__issuer" },
        installments: { id: "form-checkout__installments" },
      },
      callbacks: {
        onFormMounted: (error) => {
          if (error) console.warn("Erro ao montar o formulário:", error);
        },
        onSubmit: async (event) => {
          event.preventDefault();

          const {
            paymentMethodId,
            issuerId,
            token,
            installments,
            identificationNumber,
            identificationType,
            cardholderEmail,
          } = mp.cardForm().getCardFormData();

          try {
            const response = await fetch(`${process.env.REACT_APP_API_HOST}/pagamento/criar_pagamento`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                token,
                issuer_id: issuerId,
                payment_method_id: paymentMethodId,
                transaction_amount: valor,
                installments: parseInt(installments),
                description: descricao,
                email: cardholderEmail,
                doc_type: identificationType,
                doc_number: identificationNumber,
                ...dadosExtras
              })
            });

            const data = await response.json();
            console.log("Resultado do pagamento:", data);

            if (data.response?.status === "approved") {
              onPagamentoConfirmado(data.external_reference);
            } else {
              alert("Pagamento não aprovado. Verifique os dados e tente novamente.");
            }
          } catch (error) {
            console.error("Erro ao processar pagamento:", error);
            alert("Erro ao processar pagamento.");
          }
        }
      }
    });
  }, [valor, descricao, dadosExtras, onPagamentoConfirmado]);

  return (
    <div className="container mt-4">
      <h5>Checkout com Cartão de Crédito</h5>
      <p className="mb-3">Preencha os dados abaixo para concluir o pagamento:</p>

      <form id="form-checkout">
        <input type="text" id="form-checkout__cardholderName" className="form-control mb-2" placeholder="Nome no cartão" />
        <input type="email" id="form-checkout__cardholderEmail" className="form-control mb-2" placeholder="E-mail" />
        <input type="text" id="form-checkout__cardNumber" className="form-control mb-2" placeholder="Número do cartão" />
        <input type="text" id="form-checkout__expirationDate" className="form-control mb-2" placeholder="MM/AA" />
        <input type="text" id="form-checkout__securityCode" className="form-control mb-2" placeholder="CVV" />
        <select id="form-checkout__identificationType" className="form-control mb-2"></select>
        <input type="text" id="form-checkout__identificationNumber" className="form-control mb-2" placeholder="CPF" />
        <select id="form-checkout__issuer" className="form-control mb-2"></select>
        <select id="form-checkout__installments" className="form-control mb-3"></select>

        <button type="submit" className="btn btn-primary w-100">Pagar</button>
      </form>
    </div>
  );
};

export default CheckoutTransparente;
