// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Noticias from './pages/Noticias';
import Equipe from './pages/Equipe';
import Perfil from './pages/Perfil';
import Treinos from './pages/Treinos';
import Navbar from './components/Navbar';
import RegisterTeam from './pages/RegisterTeam';
import CreateNews from './pages/CreateNews';
import Meta from './pages/Meta'; 
import ChampionDetail from './pages/ChampionDetail';

function App() {
  return (
    <Router>
      <div className="App">
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/equipe" element={<Equipe />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/treinos" element={<Treinos />} />
          <Route path="/register-team" element={<RegisterTeam />} />
          <Route path="/create-news" element={<CreateNews />} />
          {/* NOVAS ROTAS PARA A PÁGINA META */}
          <Route path="/meta" element={<Meta />} /> {/* Lista de personagens */}
          <Route path="/meta/:championId" element={<ChampionDetail />} /> {/* Detalhes de um personagem específico */}
        </Routes>
      </div>
    </Router>
  );
}

import { useLocation } from 'react-router-dom';

function AppNavbar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return !isHomePage && <Navbar />;
}

export default App;