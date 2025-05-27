// src/pages/Noticias.tsx
import React, { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import NewsPopup from '../components/NewsPopup';
import { getAllNews, getUserProfile } from '../services/database'; // Certifique-se que getUserProfile está aqui
import type { News } from '../types/News';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../services/firebaseConfig'; // Importa a autenticação do Firebase
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../types/User'; // Importa o tipo UserProfile

const Noticias: React.FC = () => {
  const [newsData, setNewsData] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [user, loadingUser] = useAuthState(auth); // Hook para obter o usuário autenticado
  const [canPostNews, setCanPostNews] = useState(false); // Estado para controlar a visibilidade do botão
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNewsAndUserRole = async () => {
      // 1. Buscar todas as notícias
      const news = await getAllNews();
      setNewsData(news)

      // 2. Verificar o papel do usuário (role)
      if (user) { // Se há um usuário logado
        const userProfile: UserProfile | null = await getUserProfile(user.uid);
        // Habilita a postagem APENAS se o usuário for 'coach'
        if (userProfile && userProfile.role === 'coach') {
          setCanPostNews(true);
        } else {
          setCanPostNews(false); // Membros não podem postar
        }
      } else {
        setCanPostNews(false); // Se não há usuário logado, ninguém pode postar
      }
    };

    // Chama a função para buscar notícias e verificar a role do usuário
    fetchNewsAndUserRole();
  }, [user]); // Re-executa este efeito sempre que o estado do usuário (logado/deslogado) mudar

  const handleNewsClick = (newsItem: News) => {
    setSelectedNews(newsItem);
  };

  const handleClosePopup = () => {
    setSelectedNews(null);
  };

  const handleAddNewsClick = () => {
    // Redireciona para a página de criação de notícias.
    // Você pode ter uma rota como '/create-news' ou '/treinador/create-news'.
    navigate('/create-news'); // Exemplo de rota para o formulário de criação de notícia
  };

  if (loadingUser) {
    return <p>Carregando notícias e verificando permissões...</p>;
  }

  return (
    <div className="noticias-page">
      <h2>Notícias e Eventos</h2>

      {/* BOTÃO PARA ADICIONAR NOTÍCIA - RENDERIZAÇÃO CONDICIONAL */}
      {/* O botão só aparece se 'canPostNews' for true (ou seja, se o usuário for 'coach') */}
      {canPostNews && (
        <button
          onClick={handleAddNewsClick}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Adicionar Nova Notícia / Evento
        </button>
      )}

      <div className="news-grid">
        {newsData.map((news) => (
          <NewsCard
            key={news.id}
            imageUrl={news.imageUrl}
            title={news.title}
            onClick={() => handleNewsClick(news)}
          />
        ))}
      </div>
      {selectedNews && <NewsPopup {...selectedNews} onClose={handleClosePopup} />}
    </div>
  );
};

export default Noticias;