// Home.tsx
import React, { useEffect, useState } from 'react';
import AuthArea from '../components/AuthArea';
import Navbar from '../components/Navbar';
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

  return (
    <div className={styles.container}>
      {isHomePage ? (
        <header className={styles.header}>
          <Navbar />
        </header>
      ) : (
        <></> // Não renderiza o header nem a Navbar em outras páginas
      )}

      <div className={styles.authAreaWrapper}>
        <AuthArea />
      </div>

      <section className={styles.intro}>
        <h1>Bem-vindo ao MBL - Mundo das Notícias</h1>
        <p>
          Aqui você encontra as notícias mais fresquinhas, dicas, eventos e tudo que rola de mais legal no nosso universo.
          Fique ligado e não perca nenhuma novidade!.
        </p>
      </section>

      <main className={styles.newsSection}>
        {latestNews.length > 0 ? (
          <>
            <section className={styles.featuredNews}>
              <h2>Próximo Evento</h2>
              <NewsCard
                imageUrl={latestNews[0]?.imageUrl || '/assets/images/default-news.jpg'}
                title={latestNews[0]?.title || 'Próximo Evento'}
                onClick={() => console.log('Abrir popup do próximo evento', latestNews[0]?.id)}
              />
            </section>

            {latestNews.length > 1 && (
              <section className={styles.otherNews}>
                <h2>Últimas Notícias</h2>
                <div className={styles.newsGrid}>
                  {latestNews.slice(1).map((newsItem) => (
                    <NewsCard
                      key={newsItem.id}
                      imageUrl={newsItem.imageUrl || '/assets/images/default-news.jpg'}
                      title={newsItem.title}
                      onClick={() => console.log('Abrir notícia', newsItem.id)}
                    />
                  ))}
                </div>
              </section>
            )}

            <button className={styles.loadMoreBtn} onClick={() => alert('Mais notícias em breve!')}>
              Ver Mais Notícias
            </button>
          </>
        ) : (
          <p>Carregando as últimas notícias, aguarde....</p>
        )}
      </main>
    </div>
  );
};

export default Home;