import React from 'react';
import { Container, Card } from 'react-bootstrap';

function GuiaMetasNutricionais() {
  return (
    <Container>
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Guia de Metas Nutricionais ✅</Card.Title>
          <Card.Text>
            Aqui você encontrará um guia para definir e alcançar suas metas nutricionais.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default GuiaMetasNutricionais;
