import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Card, Button } from 'react-bootstrap';

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

    if (!calorias) {
        return <p>Erro: Nenhum dado recebido.</p>;
    }

    return (
        <Container className="d-flex justify-content-center align-items-center">
            <Card className="meucard">
                <h2 align='center'>Diagnóstico Calórico 🏋️</h2>
                <p><strong>Idade:</strong> {dadosFormulario.idade} anos</p>
                <p><strong>Peso:</strong> {dadosFormulario.peso} kg</p>
                <p><strong>Altura:</strong> {dadosFormulario.altura} cm</p>
                <p><strong>Sexo:</strong> {dadosFormulario.sexo === 'm' ? 'Masculino' : 'Feminino'}</p>
                <p><strong>Atividade Física:</strong> {niveisAtividade[dadosFormulario.atividade]}</p>
                <p><strong>Objetivo:</strong> {objetivosMap[dadosFormulario.objetivo]}</p>
                <h3>Calorias Necessárias: {calorias}</h3>

                {/* Botões para navegação para as páginas de detalhamento */}
                <div className="d-flex flex-column align-items-center mt-3">
                    <Button className='meubutton' onClick={() => navigate('/resumo-nutricional')} variant="secondary">Resumo Nutricional 🥗</Button>
                    <Button className='meubutton' onClick={() => navigate('/plano-metabolico')} variant="secondary">Plano Metabólico 🔥</Button>
                    <Button className='meubutton' onClick={() => navigate('/perfil-calorico')} variant="secondary">Perfil Calórico 🍽️</Button>
                    <Button className='meubutton' onClick={() => navigate('/estrategia-alimentar')} variant="secondary">Estratégia Alimentar 📊</Button>
                    <Button className='meubutton' onClick={() => navigate('/guia-metas-nutricionais')} variant="secondary">Guia de Metas Nutricionais ✅</Button>
                    <Button className='meubutton' onClick={() => navigate('/analise-personalizada')} variant="secondary">Análise Personalizada 🏋️</Button>
                </div>

                <Button className='meubutton' onClick={() => navigate('/')} variant="primary">Voltar</Button>
            </Card>
        </Container>
    );
}

export default Detalhes;
