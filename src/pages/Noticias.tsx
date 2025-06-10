import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

// Funções, tipos e estilos necessários
import { listenToAllNews, getUserProfile } from '../services/database';
import { auth } from '../services/firebaseConfig';
import type { News } from '../types/News';
import NewsCard from '../components/NewsCard';
import styles from '../styles/Noticias.module.css';

// Função auxiliar para agrupar as notícias por data
const groupNewsByDate = (news: News[]) => {
  const groups: { [key: string]: News[] } = {
    "Hoje": [],
    "Ontem": [],
    "Esta Semana": [],
    "Este Mês": [],
    "Mais Antigas": [],
  };

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // O início da semana é a última Segunda-feira
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - (today.getDay() === 0 ? 6 : today.getDay() - 1));

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  news.forEach(item => {
    // Certifica-se que publicationDate é um objeto Date válido
    const itemDate = item.publicationDate instanceof Date ? item.publicationDate : new Date(item.publicationDate);
    
    if (itemDate >= today) groups["Hoje"].push(item);
    else if (itemDate >= yesterday) groups["Ontem"].push(item);
    else if (itemDate >= startOfWeek) groups["Esta Semana"].push(item);
    else if (itemDate >= startOfMonth) groups["Este Mês"].push(item);
    else groups["Mais Antigas"].push(item);
  });

  return groups;
};


const Noticias: React.FC = () => {
  const [newsData, setNewsData] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [user, loadingUser] = useAuthState(auth);
  const [canPostNews, setCanPostNews] = useState(false);
  const navigate = useNavigate();

  // Efeito para carregar as notícias em tempo real
  useEffect(() => {
    setLoadingNews(true);
    const unsubscribe = listenToAllNews((news) => {
      setNewsData(news);
      setLoadingNews(false);
    });
    return () => unsubscribe();
  }, []);

  // Efeito para verificar o papel (role) do utilizador
  useEffect(() => {
    const checkUserRole = async () => {
      if (user) {
        const userProfile = await getUserProfile(user.uid);
        setCanPostNews(userProfile?.role === 'coach');
      } else {
        setCanPostNews(false);
      }
    };
    if (!loadingUser) {
      checkUserRole();
    }
  }, [user, loadingUser]);

  // Agrupa as notícias usando useMemo para melhor performance
  const groupedNews = useMemo(() => groupNewsByDate(newsData), [newsData]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <h1 className={styles.title}>Notícias e Eventos</h1>
        {/* Mostra o botão apenas se não estiver a carregar o user e se for coach */}
        {!loadingUser && canPostNews && (
          <button onClick={() => navigate('/create-news')} className={styles.addButton}>
            + Publicar Notícia
          </button>
        )}
      </header>

      {loadingNews ? (
        <p>A carregar notícias...</p>
      ) : (
        // Mapeia cada grupo de notícias (Hoje, Ontem, etc.)
        Object.keys(groupedNews).map(groupTitle => (
          // Só renderiza a secção se houver notícias nesse grupo
          groupedNews[groupTitle].length > 0 && (
            <section key={groupTitle} className={styles.newsSection}>
              <h2 className={styles.sectionTitle}>{groupTitle}</h2>
              <div className={styles.newsGrid}>
                {groupedNews[groupTitle].map((news) => (
                  <NewsCard
                    key={news.id}
                    imageUrl={news.imageUrl}
                    title={news.title}
                    summary={news.summary}
                    publicationDate={news.publicationDate}
                    onClick={() => navigate(`/noticias/${news.id}`)}
                  />
                ))}
              </div>
            </section>
          )
        ))
      )}
    </div>
  );
};

export default Noticias;