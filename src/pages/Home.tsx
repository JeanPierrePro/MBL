// Home.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuthArea from '../components/AuthArea'; // Continuamos a importar a AuthArea
import NewsCard from '../components/NewsCard';
import { useLocation } from 'react-router-dom';
import { getLatestNews } from '../services/database';
import styles from '../styles/Home.module.css';
import type { News } from '../types/News';

const Home: React.FC = () => {
  const [latestNews, setLatestNews] = useState<News[]>([]);
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const fetchLatestNews = async () => {
      const news = await getLatestNews();
      setLatestNews(news);
    };
    fetchLatestNews();
  }, []);

  const nextEvent = {
    id: 'event-1',
    imageUrl: '/assets/images/event-promo.jpg',
    title: 'Torneio Épico da Temporada 2025!',
    description: 'Prepare-se para o maior evento de MLBB do ano. Prémios incríveis esperam por si!',
    date: '2025-06-15'
  };

  return (
    <div className={styles.container}>
      {/* O header agora conterá a Navbar E a AuthArea para o lado direito */}
      {isHomePage && (
        <header className={styles.homeHeader}> {/* Nova classe para o header da Home */}
          <Navbar />
          <div className={styles.authAreaHomeWrapper}> {/* Wrapper para posicionar AuthArea na Home */}
            <AuthArea />
          </div>
        </header>
      )}

      {/* O resto da sua HeroSection e Main Content permanece como está */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Bem-vindo ao MBL <br /> Mundo das Notícias</h1>
          <p className={styles.heroSubtitle}>
            Aqui encontra as notícias mais fresquinhas, dicas, eventos e tudo que rola de mais legal no nosso universo. Fique ligado e não perca nenhuma novidade!
          </p>
        </div>
      </div>

      <main className={styles.mainContent}>
        {latestNews.length > 0 && (
          <section className={styles.eventSection}>
            <h2 className={styles.sectionTitle}>Próximo Grande Evento</h2>
            <div className={styles.eventCard}>
              <img src={nextEvent.imageUrl} alt={nextEvent.title} className={styles.eventImage} />
              <div className={styles.eventDetails}>
                <h3>{nextEvent.title}</h3>
                <p>{nextEvent.description}</p>
                <span className={styles.eventDate}>Data: {nextEvent.date}</span>
                <button className={styles.eventCtaBtn} onClick={() => alert('Detalhes do Evento!')}>Ver Detalhes</button>
              </div>
            </div>
          </section>
        )}

        {latestNews.length > 0 ? (
          <section className={styles.latestNewsSection}>
            <h2 className={styles.sectionTitle}>Últimas Notícias</h2>
            <div className={styles.newsGrid}>
              {latestNews.slice(0, 6).map((newsItem) => (
                <NewsCard
                  key={newsItem.id}
                  imageUrl={newsItem.imageUrl || '/assets/images/default-news.jpg'}
                  title={newsItem.title}
                  onClick={() => console.log('Abrir notícia', newsItem.id)}
                />
              ))}
            </div>
            <button className={styles.loadMoreBtn} onClick={() => alert('Mais notícias em breve!')}>
              Ver Todas as Notícias
            </button>
          </section>
        ) : (
          <p>Carregando as últimas notícias, aguarde....</p>
        )}
      </main>
    </div>
  );
};

export default Home;