import React from 'react';
import { News } from '../types/News';

interface NewsPopupProps extends News {
  onClose: () => void;
}

const NewsPopup: React.FC<NewsPopupProps> = ({ imageUrl, title, content, onClose }) => {
  return (
    <div className="news-popup">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          X
        </button>
        <img src={imageUrl} alt={title} />
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
    </div>
  );
};

export default NewsPopup;