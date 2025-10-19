import React, { useEffect } from "react";
import { CheckCircle, Mail, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function SucessoPagamento() {
  // Scrolla pro topo quando carrega a página
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-b from-white via-green-50 to-green-100 text-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-2xl shadow-lg p-8 max-w-lg w-full border border-green-100"
      >
        <CheckCircle className="text-green-500 mx-auto mb-4" size={90} />
        <h1 className="text-3xl font-bold text-gray-800 mb-3">
          Pagamento Confirmado! 🎉
        </h1>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Seu relatório personalizado já está sendo preparado com todo cuidado.  
          Você receberá um e-mail com o arquivo em instantes.
        </p>

        <div className="bg-green-100 border border-green-200 rounded-xl p-4 text-green-800 mb-6">
          <p className="font-semibold mb-1">💡 Dica Importante:</p>
          <p>Verifique sua <strong>caixa de entrada</strong> e também a pasta <strong>Spam</strong> ou <strong>Promoções</strong>.</p>
        </div>

        <div className="text-sm text-gray-700 mb-6 space-y-2">
          <div className="flex justify-center items-center gap-2">
            <Mail size={18} />
            <p>
              E-mail de envio:{" "}
              <strong className="text-green-700">suporte@mrfit.com.br</strong>
            </p>
          </div>
          <div className="flex justify-center items-center gap-2">
            <HelpCircle size={18} />
            <p>
              Precisa de ajuda?{" "}
              <a
                href="mailto:suporte@mrfit.com.br"
                className="text-green-600 font-semibold hover:underline"
              >
                Contate nosso suporte
              </a>
            </p>
          </div>
        </div>

        <motion.a
          href="/"
          whileHover={{ scale: 1.05 }}
          className="bg-green-500 text-white font-semibold px-8 py-3 rounded-full shadow hover:bg-green-600 transition"
        >
          Voltar à Página Inicial
        </motion.a>
      </motion.div>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-10 text-sm text-gray-500"
      >
        💚 MrFit — Cuidar do corpo é cuidar da mente.
      </motion.footer>
    </div>
  );
}
