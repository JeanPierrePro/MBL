import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

// Funções e configurações do Firebase
import { auth } from '../services/firebaseConfig';
import { listenToAllNews } from '../services/database';

// Tipos e Estilos
import type { News } from '../types/News';
import NewsCard from '../components/NewsCard';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
  const [user, loadingAuth] = useAuthState(auth);
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const navigate = useNavigate();

  // Efeito para carregar as notícias em tempo real
  useEffect(() => {
    setLoadingNews(true);
    const unsubscribe = listenToAllNews(allNews => {
      // Pegamos apenas as 3 notícias mais recentes para mostrar na Home
      setLatestNews(allNews.slice(0, 3));
      setLoadingNews(false);
    });

    // Limpa o listener quando o componente é desmontado
    return () => unsubscribe();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Bem-vindo ao MBL</h1>
          <p className={styles.heroSubtitle}>
            A sua central de notícias, estatísticas e agendamento de treinos.
          </p>
        </div>
      </header>

      <main className={styles.mainContent}>
        
        {!loadingAuth && user && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Agenda da Equipa</h2>
            <p>Aceda à agenda da sua equipa para marcar e ver os próximos treinos.</p>
            <button className={styles.ctaButton} onClick={() => navigate('/treinos')}>
              Ver Agenda de Treinos
            </button>
          </section>
        )}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Últimas Notícias</h2>
          {loadingNews ? (
            <p>A carregar notícias...</p>
          ) : latestNews.length > 0 ? (
            <>
              <div className={styles.newsGrid}>
                {latestNews.map((newsItem) => (
                  <NewsCard
                    key={newsItem.id}
                    imageUrl={newsItem.imageUrl}
                    title={newsItem.title}
                    summary={newsItem.summary}
                    // ===== CORREÇÃO AQUI =====
                    // Adicionada a propriedade 'publicationDate' que estava em falta
                    publicationDate={newsItem.publicationDate}
                    onClick={() => navigate(`/noticias/${newsItem.id}`)} 
                  />
                ))}
              </div>
              <Link to="/noticias" className={styles.seeAllLink}>
                Ver Todas as Notícias
              </Link>
            </>
          ) : (
            <p>Nenhuma notícia disponível no momento.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;