// src/App.tsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/global.css';

// Componentes
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Noticias from './pages/Noticias';
import NewsDetail from './pages/NewsDetail'; // <-- Importe a página de detalhe
import Equipe from './pages/Equipe';
import Perfil from './pages/Perfil';
import Treinos from './pages/Treinos';
import RegisterTeam from './pages/RegisterTeam';
import CreateNews from './pages/CreateNews';
import Meta from './pages/Meta';
import ChampionDetail from './pages/ChampionDetail';
import MapPage from './pages/MapPage';
import ItemsCatalog from './pages/ItemsCatalog';
import ItemDetail from './pages/ItemDetail';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar /> 
        <Routes>
          {/* ===== ROTAS PÚBLICAS ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/noticias" element={<Noticias />} />
          {/* ===== CORREÇÃO AQUI: A rota de detalhe agora é pública ===== */}
          <Route path="/noticias/:newsId" element={<NewsDetail />} />
          <Route path="/equipe" element={<Equipe />} />
          
          {/* ===== ROTAS PROTEGIDAS (só para utilizadores logados) ===== */}
          <Route element={<ProtectedRoute />}>
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/treinos" element={<Treinos />} />
            <Route path="/register-team" element={<RegisterTeam />} />
            <Route path="/create-news" element={<CreateNews />} />
            <Route path="/meta" element={<Meta />} />
            <Route path="/meta/:championId" element={<ChampionDetail />} />
            <Route path="/MapPage" element={<MapPage />} />
            <Route path="/items" element={<ItemsCatalog />} />
            <Route path="/items/:itemId" element={<ItemDetail />} />
          </Route>
          
          {/* Rota para "Página não encontrada" */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;