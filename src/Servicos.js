import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

function Servicos() {
  return (
    <div>
      <Container className="d-flex justify-content-center align-items-center mt-5">
        <Row>
          <Col>
            <h2 className="text-center mb-4">Nossos Serviços</h2>
            <p className="text-center mb-5">
              Transforme sua rotina com planos personalizados feitos para você! Escolha o que melhor atende às suas necessidades.
            </p>
            {/* Novas opções de serviços */}
            <Row className="mt-5">
              <Col md={4} className="mb-4">
                <Card className="meucard">
                  <Card.Body>
                    <Card.Title>Resumo Nutricional 🥗</Card.Title>
                    <Card.Text>
                      Obtenha um resumo detalhado das suas refeições e nutrientes consumidos.
                    </Card.Text>
                    <Link to="/">
                      <Button variant="primary">Calcular Calorias</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4} className="mb-4">
                <Card className="meucard">
                  <Card.Body>
                    <Card.Title>Plano Metabólico 🔥</Card.Title>
                    <Card.Text>
                      Conheça o seu plano metabólico e como ele pode ajudar no seu desempenho.
                    </Card.Text>
                    <Link to="/">
                      <Button variant="primary">Calcular Calorias</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4} className="mb-4">
                <Card className="meucard">
                  <Card.Body>
                    <Card.Title>Perfil Calórico 🍽️</Card.Title>
                    <Card.Text>
                      Descubra o seu perfil calórico ideal para atingir seus objetivos.
                    </Card.Text>
                    <Link to="/">
                      <Button variant="primary">Calcular Calorias</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4} className="mb-4">
                <Card className="meucard">
                  <Card.Body>
                    <Card.Title>Estratégia Alimentar 📊</Card.Title>
                    <Card.Text>
                      Desenvolva uma estratégia alimentar eficaz para alcançar suas metas.
                    </Card.Text>
                    <Link to="/">
                      <Button variant="primary">Calcular Calorias</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4} className="mb-4">
                <Card className="meucard">
                  <Card.Body>
                    <Card.Title>Guia de Metas Nutricionais ✅</Card.Title>
                    <Card.Text>
                      Acompanhe suas metas nutricionais de forma simples e eficaz.
                    </Card.Text>
                    <Link to="/">
                      <Button variant="primary">Calcular Calorias</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4} className="mb-4">
                <Card className="meucard">
                  <Card.Body>
                    <Card.Title>Análise Personalizada 🏋️</Card.Title>
                    <Card.Text>
                      Receba uma análise personalizada com base nas suas informações.
                    </Card.Text>
                    <Link to="/">
                      <Button variant="primary">Calcular Calorias</Button>
                    </Link>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="text-center mt-5">
              <p className="mb-4">
                <strong>Em breve:</strong> Inteligência artificial integrada!
              </p>
              <Link to="/contato">
                <Button variant="secondary">Entre em Contato</Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Servicos;
