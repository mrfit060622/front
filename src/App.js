import React, { useEffect } from 'react';
import Cadastro from './cadastro';
import Home from './Home';
import Detalhes from './detalhes';
import Servicos from './Servicos';
import QuemSomos from './QuemSomos';
import Termos from './TermosDeUso';
import Pagamento from './pagamento';
import PlanoMetabolico from './PlanoMetabolico';
import PerfilCalorico from './PerfilCalorico';
import EstrategiaAlimentar from './EstrategiaAlimentar';
import GuiaMetasNutricionais from './GuiaMetasNutricionais';
import AnalisePersonalizada from './AnalisePersonalizada';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { trackPageView } from "./analytics";
import CookieConsent from './CookieConsent'; // Certifique-se de ajustar o caminho

function App() {
  useEffect(() => {
    trackPageView(); 
  }, []);

  return (
    <Router>
       <CookieConsent />
      {/* Navbar compartilhada */}
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand as={Link} to="/">MrFit</Navbar.Brand>
        <Nav>
          <Nav.Link as={Link} to="/">Home</Nav.Link>
          <Nav.Link as={Link} to="/Servicos">Serviços</Nav.Link>
          <Nav.Link as={Link} to="/QuemSomos">Quem Somos</Nav.Link>
          <Nav.Link as={Link} to="/TermosDeUso">Termos de uso</Nav.Link>
          {/* Cadastro em desenvolvimento */}
          {/*<Nav.Link as={Link} to="/Cadastro">Cadastro</Nav.Link>*/}
        </Nav>
      </Navbar>

      {/* Rotas */}
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Cadastro em desenvolvimento */}
        {/*<Route path="/Cadastro" element={<Cadastro />} />*/}
        <Route path="/Servicos" element={<Servicos/>} />
        <Route path="/detalhes" element={<Detalhes />} />
        <Route path="/QuemSomos" element={<QuemSomos />} />
        <Route path="/TermosDeUso" element={<Termos />} />
        <Route path="/Pagamento" element={<Pagamento />} />
        <Route path="/plano-metabolico" element={<PlanoMetabolico />} />
        <Route path="/perfil-calorico" element={<PerfilCalorico />} />
      </Routes>
    </Router>
  );
}

export default App;
