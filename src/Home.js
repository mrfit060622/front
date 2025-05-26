import React, { useState, useRef } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles/cadastro.css';

function Home() {
  const [calorias, setCalorias] = useState(null);
  const [carregando, setCarregando] = useState(false); // ⬅️ Estado para controlar carregamento
  const caloriasRef = useRef(null);
  const navigate = useNavigate();

  const [dadosFormulario, setDadosFormulario] = useState({
    nome: '',
    idade: '',
    peso: '',
    altura: '',
    sexo: 'm',
    atividade: '1',
    objetivo: '1',
  });

  const lidarComMudanca = (e) => {
    const { name, value } = e.target;
    setDadosFormulario({ ...dadosFormulario, [name.toLowerCase()]: value });
  };

  const validarEntradas = () => {
    const { idade, peso, altura } = dadosFormulario;

    const numeroIdade = Number(idade);
    if (isNaN(numeroIdade) || numeroIdade < 1 || numeroIdade > 120) {
      alert("Por favor, insira uma idade válida (entre 1 e 120 anos).");
      return false;
    }

    const numeroPeso = Number(peso);
    if (isNaN(numeroPeso) || numeroPeso < 30 || numeroPeso > 500) {
      alert("Por favor, insira um peso válido (entre 30 kg e 500 kg).");
      return false;
    }

    const numeroAltura = Number(altura);
    if (isNaN(numeroAltura) || numeroAltura < 50 || numeroAltura > 250) {
      alert("Por favor, insira uma altura válida (entre 50 cm e 250 cm).");
      return false;
    }

    return true;
  };

  const calcularCalorias = async (e) => {
    e.preventDefault();

    if (!validarEntradas()) return;

    setCarregando(true); // ⬅️ Inicia o carregamento

    try {
      const resposta = await axios.post(
        `${process.env.REACT_APP_API_HOST}/calculo/`,
        dadosFormulario,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      const caloriasCalculadas = resposta.data.tmb;

      navigate("/detalhes", {
        state: {
          calorias: caloriasCalculadas,
          dadosFormulario,
        },
      });
    } catch (erro) {
      console.error("Erro ao calcular calorias:", erro);
      alert("Ocorreu um erro ao calcular calorias. Tente novamente mais tarde.");
    } finally {
      setCarregando(false); // ⬅️ Finaliza o carregamento mesmo se falhar
    }
  };

  return (
    <div>
      <Container className="d-flex justify-content-center align-items-center">
        <Row>
          <Col>
            <Card>
              <Card.Body className='meucard'>
                <h2 className="meutitle">Calculadora de Calorias</h2>

                {carregando ? (
                  <div className="text-center my-4">
                    <Spinner animation="border" role="status" className="me-2" />
                    <span>Estamos processando seus dados, isso pode levar alguns segundos...</span>
                  </div>
                ) : (
                  <Form onSubmit={calcularCalorias}>
                    <Form.Group controlId="formNome" className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        type="text"
                        name="nome"
                        placeholder="Digite seu nome"
                        value={dadosFormulario.nome}
                        onChange={lidarComMudanca}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formIdade" className="mb-3">
                      <Form.Label>Idade</Form.Label>
                      <Form.Control
                        type="number"
                        name="idade"
                        placeholder="Digite sua idade"
                        value={dadosFormulario.idade}
                        onChange={lidarComMudanca}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formPeso" className="mb-3">
                      <Form.Label>Peso (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        name="peso"
                        placeholder="Digite seu peso"
                        value={dadosFormulario.peso}
                        onChange={lidarComMudanca}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formAltura" className="mb-3">
                      <Form.Label>Altura (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        name="altura"
                        placeholder="Digite sua altura"
                        value={dadosFormulario.altura}
                        onChange={lidarComMudanca}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formSexo" className="mb-3">
                      <Form.Label>Sexo</Form.Label>
                      <Form.Select name="sexo" value={dadosFormulario.sexo} onChange={lidarComMudanca}>
                        <option value="m">Masculino</option>
                        <option value="f">Feminino</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="formAtividade" className="mb-3">
                      <Form.Label>Nível de Atividade</Form.Label>
                      <Form.Select name="atividade" value={dadosFormulario.atividade} onChange={lidarComMudanca}>
                        <option value="1">Sedentário</option>
                        <option value="2">Levemente Ativo</option>
                        <option value="3">Moderadamente Ativo</option>
                        <option value="4">Muito Ativo</option>
                        <option value="5">Extremamente Ativo</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="formObjetivo" className="mb-3">
                      <Form.Label>Objetivo</Form.Label>
                      <Form.Select name="objetivo" value={dadosFormulario.objetivo} onChange={lidarComMudanca}>
                        <option value="1">Manter Peso</option>
                        <option value="2">Ganhar Massa Muscular</option>
                        <option value="3">Emagrecer</option>
                      </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="meubutton">
                      Calcular
                    </Button>
                  </Form>
                )}

                {calorias && !carregando && (
                  <div className="text-center mt-4" ref={caloriasRef}>
                    <h4>Você precisa de:</h4>
                    <p>
                      <strong>{calorias}</strong> calorias por dia para alcançar seu objetivo.
                    </p>
                    <Link to="/Servicos" className="btn btn-secondary mt-3 w-100">
                      Acessar Plano de Acompanhamento grátis!
                    </Link>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
