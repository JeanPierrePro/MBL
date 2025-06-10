// src/pages/NotFound.tsx

import React from 'react';
import { Link } from 'react-router-dom';

const NotFound: React.FC = () => {
  return (
    <div style={{ textAlign: 'center', padding: '50px', color: 'white' }}>
      <h2>Oops! Página Não Encontrada</h2>
      <p>A página que você está a procurar não existe.</p>
      <Link to="/" style={{ color: '#e94560', textDecoration: 'none' }}>
        Voltar para a Página Inicial
      </Link>
    </div>
  );
};

export default NotFound;