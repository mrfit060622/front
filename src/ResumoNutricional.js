import React from 'react';
import { Container, Card } from 'react-bootstrap';

function ResumoNutricional() {
  return (
    <Container>
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Resumo Nutricional 🥗</Card.Title>
          <Card.Text>
            Aqui você encontrará um resumo detalhado de suas necessidades nutricionais.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResumoNutricional;
