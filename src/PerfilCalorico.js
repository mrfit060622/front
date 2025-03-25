import React from 'react';
import { Container, Card } from 'react-bootstrap';

function PerfilCalorico() {
  return (
    <Container>
      <Card className="mt-4">
        <Card.Body>
          <Card.Title>Perfil Calórico 🍽️</Card.Title>
          <Card.Text>
            Aqui você encontrará detalhes sobre seu perfil calórico.
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default PerfilCalorico;
