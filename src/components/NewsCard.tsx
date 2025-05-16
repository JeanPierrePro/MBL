import React from 'react';

interface NewsCardProps {
  imageUrl: string;
  title: string;
  onClick: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ imageUrl, title, onClick }) => {
  return (
    <div className="news-card" onClick={onClick}>
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
    </div>
  );
};

export default NewsCard;