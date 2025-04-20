import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Modal, Form, Spinner } from 'react-bootstrap';

const niveisAtividade = {
    "1": "Sedentário - Pouca ou nenhuma atividade física regular",
    "2": "Levemente Ativo - Treinos leves 1 a 2 vezes por semana",
    "3": "Moderadamente Ativo - Exercícios regulares 3 a 4 vezes por semana",
    "4": "Muito Ativo - Treinos intensos 5 a 6 vezes por semana",
    "5": "Extremamente Ativo - Exercícios diários com alta intensidade"
};

const objetivosMap = {
    "1": "Manter Peso - Consumo calórico equilibrado",
    "2": "Ganhar Massa Muscular - Excedente calórico com foco em proteínas",
    "3": "Emagrecer - Déficit calórico para perda de gordura"
};

function Detalhes() {
    const location = useLocation();
    const navigate = useNavigate();
    const { calorias, dadosFormulario } = location.state || {};
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [email, setEmail] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailChange = (e) => setEmail(e.target.value);

    const handleSendEmail = async (isPaidReport) => {
        if (loading) return;
        setLoading(true);
        setError(''); // Resetar o erro

        const endpoint = isPaidReport
            ? `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf_pg`
            : `${process.env.REACT_APP_API_HOST}/pdf/gerar_pdf`;

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    nome: dadosFormulario?.nome,
                    calorias,
                    idade: dadosFormulario?.idade,
                    peso: dadosFormulario?.peso,
                    altura: dadosFormulario?.altura,
                    sexo: dadosFormulario?.sexo === 'm' ? 'Masculino' : 'Feminino',
                    atividade: niveisAtividade[dadosFormulario?.atividade],
                    objetivo: objetivosMap[dadosFormulario?.objetivo],
                    data: new Date().toLocaleDateString(),
                }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Erro ao enviar o e-mail');

            const result = await response.json();
            alert(result.message || 'PDF enviado com sucesso!');
            setShowModal(false);
            setShowPaymentModal(false);
            setEmail('');

        } catch (error) {
            console.error('Erro:', error);
            setError('Erro ao enviar o e-mail. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handlePagamento = async () => {
        if (loading) return;
        setLoading(true);
        setError(''); // Resetar o erro

        try {
            const response = await fetch('http://localhost:5000/pagamento/criar_pagamento', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    nome: dadosFormulario?.nome,
                    calorias,
                    idade: dadosFormulario?.idade,
                    peso: dadosFormulario?.peso,
                    altura: dadosFormulario?.altura,
                    sexo: dadosFormulario?.sexo === 'm' ? 'Masculino' : 'Feminino',
                    atividade: niveisAtividade[dadosFormulario?.atividade],
                    objetivo: objetivosMap[dadosFormulario?.objetivo],
                    valor: 19.90, // Valor para o pagamento
                }),
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Erro ao processar o pagamento');

            const result = await response.json();
            if (result.success) {
                alert('Pagamento realizado com sucesso!');
                setIsPaid(true);
                setShowPaymentModal(false);
                handleSendEmail(true);
            } else {
                alert('Erro ao processar o pagamento. Tente novamente.');
            }

        } catch (error) {
            console.error('Erro:', error);
            setError('Erro ao processar o pagamento. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const abrirResumo = () => {
        setIsPaid(false);
        setShowModal(true);
    };

    const abrirPagamento = () => {
        setIsPaid(true);
        setShowPaymentModal(true);
    };

    if (!calorias || !dadosFormulario) {
        return <p>Erro: Nenhum dado recebido.</p>;
    }

    return (
        <Container className="d-flex justify-content-center align-items-center">
            <Card className="meucard">
                <h2 align='center'>Diagnóstico Calórico 🏋️</h2>
                <p><strong>Nome:</strong> {dadosFormulario.nome}</p>
                <p><strong>Idade:</strong> {dadosFormulario.idade} anos</p>
                <p><strong>Peso:</strong> {dadosFormulario.peso} kg</p>
                <p><strong>Altura:</strong> {dadosFormulario.altura} cm</p>
                <p><strong>Sexo:</strong> {dadosFormulario.sexo === 'm' ? 'Masculino' : 'Feminino'}</p>
                <p><strong>Atividade Física:</strong> {niveisAtividade[dadosFormulario.atividade]}</p>
                <p><strong>Objetivo:</strong> {objetivosMap[dadosFormulario.objetivo]}</p>
                <h3>Calorias Necessárias: {calorias}</h3>

                <div className="d-flex flex-column align-items-center mt-3">
                    <Button className='meubutton' onClick={abrirResumo} variant="secondary">
                        Resumo Nutricional 🥗
                    </Button>

                    <Button className='meubutton' onClick={abrirPagamento} variant="secondary">
                        Adquirir Relatório Completo 🔥
                    </Button>
                </div>

                <Button className='meubutton' onClick={() => navigate('/')} variant="primary">
                    Voltar
                </Button>
            </Card>

            {/* Modal para o resumo gratuito */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Resumo Nutricional</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Digite seu e-mail para receber o resumo gratuito:</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={handleEmailChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSendEmail(false);
                                    }
                                }}
                                required
                            />
                        </Form.Group>
                        {error && <div className="text-danger mt-2">{error}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
                    <Button variant="primary" onClick={() => handleSendEmail(false)} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Enviar'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Modal de confirmação para pagamento */}
            <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Relatório Completo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Este relatório é exclusivo e personalizado, com dicas avançadas.</p>
                    <p><strong>Valor: R$19,90</strong></p>
                    <Form onSubmit={(e) => e.preventDefault()}>
                        <Form.Group controlId="formEmailPago">
                            <Form.Label>Digite seu e-mail para receber o relatório:</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="exemplo@email.com"
                                value={email}
                                onChange={handleEmailChange}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handlePagamento();
                                    }
                                }}
                                required
                            />
                        </Form.Group>
                        {error && <div className="text-danger mt-2">{error}</div>}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPaymentModal(false)}>Cancelar</Button>
                    <Button variant="success" onClick={handlePagamento} disabled={loading}>
                        {loading ? <Spinner animation="border" size="sm" /> : 'Pagar e Receber'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Detalhes;
