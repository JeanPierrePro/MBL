// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Noticias from './pages/Noticias';
import Equipe from './pages/Equipe';
import Perfil from './pages/Perfil';
import Treinos from './pages/Treinos';
import Navbar from './components/Navbar';
import './styles/global.css';

function App() {
  return (
    <Router>
      <div className="App">
        <AppNavbar /> {/* Usamos um componente separado para a Navbar condicional */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/noticias" element={<Noticias />} />
          <Route path="/equipe" element={<Equipe />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/treinos" element={<Treinos />} />
        </Routes>
      </div>
    </Router>
  );
}

function AppNavbar() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return !isHomePage && <Navbar />; // Renderiza a Navbar apenas se NÃO estiver na página inicial
}

export default App;