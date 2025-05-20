// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Noticias from './pages/Noticias';
import Equipe from './pages/Equipe';
import Perfil from './pages/Perfil';
import Treinos from './pages/Treinos';
import Navbar from './components/Navbar';
import './styles/global.css';
import RegisterTeam from './pages/RegisterTeam';
import CreateNews from './pages/CreateNews';

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
          {/* ATUALIZADO: Rota para CreateNews agora é '/create-news' */}
          <Route path="/create-news" element={<CreateNews />} />
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