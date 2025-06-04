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
import Navbar from './components/Navbar'; // Certifique-se que este import está correto!
import RegisterTeam from './pages/RegisterTeam';
import CreateNews from './pages/CreateNews';
import Meta from './pages/Meta';
import ChampionDetail from './pages/ChampionDetail';
import MapPage from './pages/MapPage';
import ItemsCatalog from './pages/ItemsCatalog';
import ItemDetail from './pages/ItemDetail';
// -------------------------

function App() {
  return (
    <Router>
      <div className="App">
        {/* Renderize a sua Navbar aqui. Ela agora aparecerá em todas as páginas! */}
        <Navbar /> 
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
          <Route path="/meta" element={<Meta />} />
          <Route path="/meta/:championId" element={<ChampionDetail />} />
          <Route path="/MapPage" element={<MapPage />} />
          
          {/* --- NOVAS ROTAS AQUI --- */}
          <Route path="/items" element={<ItemsCatalog />} />
          <Route path="/items/:itemId" element={<ItemDetail />} />
          {/* ------------------------- */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;