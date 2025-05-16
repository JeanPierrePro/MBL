import React from 'react';
import { Link } from 'react-router-dom';

const AuthArea: React.FC = () => {
  return (
    <div className="auth-area">
      <Link to="/login">Login</Link>
      <Link to="/register">Registar</Link>
    </div>
  );
};

export default AuthArea;