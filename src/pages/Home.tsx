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
    // Usamos o listener para obter as notícias em tempo real.
    // O 'listenToAllNews' já as ordena da mais recente para a mais antiga.
    const unsubscribe = listenToAllNews(allNews => {
      // Pegamos apenas as 3 notícias mais recentes para mostrar na Home
      setLatestNews(allNews.slice(0, 3));
      setLoadingNews(false);
    });

    // Limpa o listener quando o componente é desmontado para evitar leaks de memória
    return () => unsubscribe();
  }, []); // O array vazio [] garante que esta lógica só corre uma vez

  return (
    <div className={styles.container}>
      {/* Secção Principal de Boas-Vindas */}
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Bem-vindo ao MBL</h1>
          <p className={styles.heroSubtitle}>
            A sua central de notícias, estatísticas e agendamento de treinos.
          </p>
        </div>
      </header>

      <main className={styles.mainContent}>
        
        {/* Secção de Acesso Rápido aos Treinos (só aparece se o utilizador estiver logado) */}
        {!loadingAuth && user && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Agenda da Equipa</h2>
            <p>Aceda à agenda da sua equipa para marcar e ver os próximos treinos.</p>
            <button className={styles.ctaButton} onClick={() => navigate('/treinos')}>
              Ver Agenda de Treinos
            </button>
          </section>
        )}

        {/* Secção das Últimas Notícias */}
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
                    imageUrl={newsItem.imageUrl || '/assets/default-news.jpg'}
                    title={newsItem.title}
                    summary={newsItem.summary}
                    // A função onClick pode navegar para uma página de detalhe da notícia no futuro
                    onClick={() => navigate(`/noticias`)} 
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