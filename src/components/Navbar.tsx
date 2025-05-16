import React from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/noticias">Notícias</Link>
        </li>
        <li>
          <Link to="/equipe">Equipe</Link>
        </li>
        <li>
          <Link to="/treinos">Treinos</Link>
        </li>
        <li>
          <Link to="/perfil">Perfil</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;