// src/components/ProtectedRoute.tsx

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebaseConfig';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    // Mostra uma mensagem de carregamento enquanto o estado de autenticação é verificado
    return <div>A verificar autenticação...</div>;
  }

  if (!user) {
    // Se não houver utilizador, redireciona para a página de login
    return <Navigate to="/login" replace />;
  }

  // Se houver utilizador, renderiza o conteúdo da rota (a página protegida)
  return <Outlet />;
};

export default ProtectedRoute;