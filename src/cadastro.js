import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import config from './config';

function Cadastro() {
  const [etapa, setEtapa] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    altura: '',
    peso: '',
    objetivo: '1',
    sexo: 'm',
    idade: '',
    Atividade: '1',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validarPrimeiraEtapa = () => {
    if (formData.senha !== formData.confirmarSenha) {
      alert('As senhas não coincidem.');
      return false;
    }
    return true;
  };

  const validarSegundaEtapa = () => {
    const { idade, peso, altura } = formData;

    const numeroIdade = Number(idade);
    if (isNaN(numeroIdade) || numeroIdade < 0 || numeroIdade > 120) {
      alert('Por favor, insira uma idade válida (entre 0 e 120 anos).');
      return false;
    }

    const numeroPeso = Number(peso);
    if (isNaN(numeroPeso) || numeroPeso < 30 || numeroPeso > 500) {
      alert('Por favor, insira um peso válido (entre 30 kg e 500 kg).');
      return false;
    }

    const numeroAltura = Number(altura);
    if (isNaN(numeroAltura) || numeroAltura < 50 || numeroAltura > 250) {
      alert('Por favor, insira uma altura válida (entre 50 cm e 250 cm).');
      return false;
    }

    return true;
  };

  const handleSubmitPrimeiraEtapa = (e) => {
    e.preventDefault();
    if (!validarPrimeiraEtapa()) return;
  
    // Verifica se o e-mail já está cadastrado antes de avançar
    fetch(`${config.apiUrl}/usuario/verificar-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.email }),
    })
      .then((response) => {
        if (response.status === 400) {
          alert("Este email já está registrado. Tente outro.");
          setFormData({
            nome: '',
            email: '',
            senha: '',
            confirmarSenha: '',
            altura: '',
            peso: '',
            objetivo: '1',
            sexo: 'm',
            idade: '',
            Atividade: '1',
          });
          setEtapa(1); // Retorna para a primeira etapa
        } else if (!response.ok) {
          throw new Error(`Erro na resposta: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!data.error) {
          setEtapa(2); // Avança para a segunda etapa
        }
      })
      .catch((error) => {
        alert("Erro ao verificar e-mail. Tente novamente.");
        console.error("Erro na verificação do e-mail:", error);
      });
  };

  const handleSubmitSegundaEtapa = (e) => {
    e.preventDefault();
    if (validarSegundaEtapa()) {
      // Enviar os dados para o backend
      fetch(`${config.apiUrl}/usuario/cadastro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          idade: Number(formData.idade),
          peso: Number(formData.peso),
          altura: Number(formData.altura),
          sexo: formData.sexo,
          objetivo: formData.objetivo,
          atividade: formData.Atividade,
        }),
      })
        .then((response) => {
          if (!response.ok) {
            return response.json().then((err) => {
              throw new Error(err.message || 'Erro desconhecido');
            });
          }
          return response.json();
        })
        .then((data) => {
          const mensagem = data.message?.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          if (mensagem && mensagem.toLowerCase().includes('usuario criado com sucesso')) {
            alert('Cadastro finalizado com sucesso!');
            window.location.href = `/perfil/${data.usuarioId}`;
          } else {
            alert('Erro ao criar o usuário. Resposta inesperada.');
          }
        })
        .catch((error) => {
          alert(`Erro ao fazer a requisição: ${error.message}`);
          console.error('Erro no cadastro:', error);
        });
    }
  };

  return (
    <div>
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Row>
          <Col>
            {etapa === 1 && (
              <Card>
                <Card.Body className='meucard'>
                  <h2 className="text-center mb-4">Cadastro</h2>
                  <Form onSubmit={handleSubmitPrimeiraEtapa}>
                    <Form.Group controlId="formNome" className="mb-3">
                      <Form.Label>Nome</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Digite seu nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formEmail" className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="Digite seu email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formSenha" className="mb-3">
                      <Form.Label>Senha</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Digite sua senha"
                        name="senha"
                        value={formData.senha}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formConfirmarSenha" className="mb-3">
                      <Form.Label>Confirmar Senha</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="Confirme sua senha"
                        name="confirmarSenha"
                        value={formData.confirmarSenha}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Button variant="primary" type="submit" className="meubutton">
                      Próxima Etapa
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}

            {etapa === 2 && (
              <Card>
                <Card.Body className='meucard'>
                  <h2>Informações Adicionais</h2>
                  <Form onSubmit={handleSubmitSegundaEtapa}>
                    <Form.Group controlId="formIdade" className="mb-3">
                      <Form.Label>Idade</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Digite sua idade"
                        name="idade"
                        value={formData.idade}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formAltura" className="mb-3">
                      <Form.Label>Altura (cm)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Digite sua altura"
                        name="altura"
                        value={formData.altura}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formPeso" className="mb-3">
                      <Form.Label>Peso (kg)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Digite seu peso"
                        name="peso"
                        value={formData.peso}
                        onChange={handleChange}
                        required
                      />
                    </Form.Group>

                    <Form.Group controlId="formObjetivo" className="mb-3">
                      <Form.Label>Objetivo</Form.Label>
                      <Form.Select
                        name="objetivo"
                        value={formData.objetivo}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">Manter peso</option>
                        <option value="2">Ganhar Massa Muscular</option>
                        <option value="3">Emagrecer</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="formSexo" className="mb-3">
                      <Form.Label>Sexo</Form.Label>
                      <Form.Select
                        name="sexo"
                        value={formData.sexo}
                        onChange={handleChange}
                        required
                      >
                        <option value="m">Masculino</option>
                        <option value="f">Feminino</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group controlId="formNivelAtividade" className="mb-3">
                      <Form.Label>Nível de Atividade</Form.Label>
                      <Form.Select
                        name="Atividade"
                        value={formData.Atividade}
                        onChange={handleChange}
                        required
                      >
                        <option value="1">Sedentário</option>
                        <option value="2">Leve</option>
                        <option value="3">Moderado</option>
                        <option value="4">Ativo</option>
                        <option value="5">Muito Ativo</option>
                      </Form.Select>
                    </Form.Group>

                    <Button variant="primary" type="submit" className="meubutton">
                      Finalizar Cadastro
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Cadastro;
