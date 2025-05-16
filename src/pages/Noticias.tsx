// src/pages/Noticias.tsx
import React, { useState, useEffect } from 'react';
import NewsCard from '../components/NewsCard';
import NewsPopup from '../components/NewsPopup';
import { getAllNews } from '../services/database';
import { News } from '../types/News';

const Noticias: React.FC = () => {
  const [newsData, setNewsData] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);

  useEffect(() => {
    const fetchAllNews = async () => {
      const news = await getAllNews();
      setNewsData(news);
    };

    fetchAllNews();
  }, []);

  const handleNewsClick = (newsItem: News) => {
    setSelectedNews(newsItem);
  };

  const handleClosePopup = () => {
    setSelectedNews(null);
  };

  return (
    <div className="noticias-page">
      <h2>Notícias</h2>
      <div className="news-grid">
        {newsData.map((news) => (
          <NewsCard key={news.id} imageUrl={news.imageUrl} title={news.title} onClick={() => handleNewsClick(news)} />
        ))}
      </div>
      {selectedNews && <NewsPopup {...selectedNews} onClose={handleClosePopup} />}
    </div>
  );
};

export default Noticias;