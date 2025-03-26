import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Modal, Form } from 'react-bootstrap';

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
    const [email, setEmail] = useState('');
    const [isPaid, setIsPaid] = useState(false);
    const [loading, setLoading] = useState(false); // Estado para evitar múltiplos envios

    const handleEmailChange = (e) => setEmail(e.target.value);

    const handleSendEmail = async () => {
        if (loading) return;
        setLoading(true);

        const endpoint = isPaid 
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
                credentials: 'include', // Garantir que os cookies sejam enviados
            });
    
            if (!response.ok) throw new Error('Erro ao enviar o e-mail');
    
            const result = await response.json();
            alert(result.message || 'PDF enviado com sucesso!');
            setShowModal(false);
            setEmail('');
    
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao enviar o e-mail. Tente novamente.');
        } finally {
            setLoading(false);
        }
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
                    <Button 
                        className='meubutton' 
                        onClick={() => { setIsPaid(false); setShowModal(true); }} 
                        variant="secondary"
                    >
                        Resumo Nutricional 🥗
                    </Button>

                    <Button 
                        className='meubutton' 
                        onClick={() => { setIsPaid(true); setShowModal(true); }} 
                        variant="secondary"
                    >
                        Adquirir Relatório Completo 🔥
                    </Button>
                </div>

                <Button className='meubutton' onClick={() => navigate('/')} variant="primary">Voltar</Button>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Enviar Resumo Nutricional</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={(event) => event.preventDefault()}>
                        <Form.Group controlId="formEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="Digite seu e-mail" 
                                value={email} 
                                onChange={handleEmailChange} 
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        handleSendEmail();
                                    }
                                }} 
                                required 
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>Fechar</Button>
                    <Button variant="primary" onClick={handleSendEmail} disabled={loading}>
                        {loading ? 'Enviando...' : 'Enviar'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default Detalhes;
