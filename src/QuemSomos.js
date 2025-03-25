import React from 'react';
import { Container } from 'react-bootstrap';

function QuemSomos() {
  return (
    <div>
      <Container>
        <h2 className="text-center mb-4">Quem Somos</h2>
        
        <p>
          O <strong>MrFit</strong> nasceu com o propósito de transformar vidas através da nutrição e do bem-estar. Nosso objetivo é oferecer ferramentas eficazes para ajudar você a alcançar suas metas de saúde, seja emagrecimento, ganho de massa muscular ou manutenção do peso.
        </p>
        
        <h3 className="mt-4">Nossa Abordagem Científica</h3>
        <p>
          Nosso cálculo de necessidades calóricas é baseado na <strong>Equação de Harris-Benedict</strong>, um dos métodos mais reconhecidos na ciência da nutrição para estimar o gasto energético diário. Essa equação, revisada ao longo dos anos, permite calcular a <strong>Taxa Metabólica Basal (TMB)</strong>, que representa a quantidade de calorias que seu corpo gasta em repouso.
        </p>
        
        <p>
          Para tornar o cálculo ainda mais preciso, aplicamos os <strong>Fatores de Atividade de Mifflin-St Jeor</strong>, que ajustam a TMB de acordo com o nível de atividade física do usuário. Dessa forma, garantimos que os valores estimados estejam alinhados com a ciência e sejam úteis para planejamento alimentar e treinos.
        </p>
        
        <h3 className="mt-4">Compromisso com a Qualidade</h3>
        <p>
          No <strong>MrFit</strong>, prezamos pela qualidade das informações e pela transparência com nossos usuários. Nosso site foi desenvolvido para oferecer uma experiência intuitiva e acessível, permitindo que qualquer pessoa possa calcular suas necessidades nutricionais com facilidade.
        </p>
        
        <h3 className="mt-4">Nossa Missão</h3>
        <p>
          Acreditamos que pequenas mudanças podem gerar grandes transformações. Nosso compromisso é fornecer informações confiáveis e acessíveis para que você tome decisões mais saudáveis e alcance seus objetivos com segurança e eficácia.
        </p>
        
        <h3 className="mt-4">Entre em Contato</h3>
        <p>
          Se tiver dúvidas ou quiser saber mais sobre nosso método, entre em contato pelo e-mail: <strong>suporte@mrfit.com.br</strong>.
        </p>
      </Container>
    </div>
  );
}

export default QuemSomos;
