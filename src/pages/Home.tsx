import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuthArea from '../components/AuthArea';
import NewsCard from '../components/NewsCard';
import { getLatestNews } from '../services/database';
import type { News } from '../types/News';  // <---- import type
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
  const [latestNews, setLatestNews] = useState<News[]>([]);

  useEffect(() => {
    const fetchLatestNews = async () => {
      const news = await getLatestNews();
      setLatestNews(news);
    };
    fetchLatestNews();
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Navbar />
        <AuthArea />
      </header>

      <section className={styles.intro}>
        <h1>Bem-vindo ao MBL - Mundo das Notícias</h1>
        <p>
          Aqui você encontra as notícias mais fresquinhas, dicas, eventos e tudo que rola de mais legal no nosso universo.
          Fique ligado e não perca nenhuma novidade!
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
          <p>Carregando as últimas notícias, aguarde...</p>
        )}
      </main>
    </div>
  );
};

export default Home;
