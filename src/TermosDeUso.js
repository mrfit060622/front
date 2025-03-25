import React from 'react';
import { Container } from 'react-bootstrap';

function Termos() {
  return (
    <div>
      <Container>
        <h2 className="text-center mt-4 mb-4">Termos de Uso do Site MrFit</h2>

        <h4>1. Introdução</h4>
        <p>
          Bem-vindo ao site <strong>MrFit</strong>. Ao acessar e utilizar nossos serviços, 
          você concorda com os termos e condições descritos abaixo. Caso não concorde, pedimos 
          que não utilize o site.
        </p>

        <h4>2. Objetivo do Site</h4>
        <p>
          O <strong>MrFit</strong> tem como objetivo fornecer ferramentas para cálculo de calorias, 
          planos nutricionais e dicas de saúde e bem-estar. As informações disponibilizadas não 
          substituem a orientação profissional de nutricionistas ou médicos.
        </p>

        <h4>3. Coleta e Uso de Dados</h4>
        <ul>
          <li>
            <strong>3.1.</strong> Ao utilizar nossos serviços, podemos coletar informações como nome e e-mail para envio de promoções e novidades.
          </li>
          <li>
            <strong>3.2.</strong> Os dados coletados serão armazenados com segurança e não serão compartilhados com terceiros sem autorização prévia.
          </li>
          <li>
            <strong>3.3.</strong> Você pode solicitar a remoção do seu e-mail de nossa base de dados a qualquer momento.
          </li>
        </ul>

        <h4>4. Propriedade Intelectual</h4>
        <p>
          Todo o conteúdo do site, incluindo textos, imagens e cálculos, é protegido por direitos 
          autorais e não pode ser reproduzido sem permissão.
        </p>

        <h4>5. Isenção de Responsabilidade</h4>
        <ul>
          <li>
            <strong>5.1.</strong> O <strong>MrFit</strong> não se responsabiliza por eventuais danos causados pelo uso das informações do site.
          </li>
          <li>
            <strong>5.2.</strong> Os resultados podem variar de pessoa para pessoa e dependem de diversos fatores individuais.
          </li>
        </ul>

        <h4>6. Modificações dos Termos</h4>
        <p>
          Estes termos podem ser alterados a qualquer momento, sendo responsabilidade do usuário revisar as atualizações.
        </p>

        <h4>7. Contato</h4>
        <p>
          Para dúvidas ou solicitações, entre em contato pelo e-mail: 
          <a href="mailto:suporte@mrfit.com.br"> suporte@mrfit.com.br</a>.
        </p>

        <h4>8. Aceitação dos Termos</h4>
        <p>
          O uso do site implica na aceitação integral destes Termos de Uso.
        </p>
      </Container>
    </div>
  );
}

export default Termos;
