// src/pages/Home.tsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AuthArea from '../components/AuthArea';
import NewsCard from '../components/NewsCard';
import { getLatestNews } from '../services/database';
import { News } from '../types/News';

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
    <div className="home-page">
      <header>
        <Navbar />
        <AuthArea />
      </header>
      <main>
        {latestNews.length > 0 ? (
          <>
            <section className="event-news">
              <h2>Próximo Evento</h2>
              <NewsCard
                imageUrl={latestNews[0]?.imageUrl || '/assets/images/default-news.jpg'}
                title={latestNews[0]?.title || 'Próximo Evento'}
                onClick={() => console.log('Abrir popup do próximo evento', latestNews[0]?.id)}
              />
            </section>
            {latestNews.length > 1 && (
              <section className="event-news">
                <h2>Último Evento</h2>
                <NewsCard
                  imageUrl={latestNews[1]?.imageUrl || '/assets/images/default-news.jpg'}
                  title={latestNews[1]?.title || 'Último Evento'}
                  onClick={() => console.log('Abrir popup do último evento', latestNews[1]?.id)}
                />
              </section>
            )}
          </>
        ) : (
          <p>A carregar as últimas notícias...</p>
        )}
      </main>
    </div>
  );
};

export default Home;