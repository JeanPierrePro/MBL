// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Noticias from './pages/Noticias';
import Equipe from './pages/Equipe';
import Perfil from './pages/Perfil';
import Treinos from './pages/Treinos';
import Navbar from './components/Navbar'; // Importa o componente Navbar
import './styles/global.css'; // Importa os estilos globais (se os tiveres)

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Renderiza a Navbar fora do Routes */}
        <div className="content"> {/* Opcional: um container para o conteúdo abaixo da navbar */}
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
      </div>
    </Router>
  );
}

export default App;