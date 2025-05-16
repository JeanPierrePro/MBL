import React from 'react';
import { News } from '../types/News';
import styles from '../styles/NewsPopup.module.css'; // Importa o CSS Module

interface NewsPopupProps extends News {
  onClose: () => void;
}

const NewsPopup: React.FC<NewsPopupProps> = ({ imageUrl, title, content, onClose }) => {
  return (
    <div className={styles.newsPopup}>
      <div className={styles.popupContent}>
        <button className={styles.closeButton} onClick={onClose}>
          X
        </button>
        <img src={imageUrl} alt={title} className={styles.popupImage} />
        <h2 className={styles.popupTitle}>{title}</h2>
        <p className={styles.popupContentText}>{content}</p>
      </div>
    </div>
  );
};

export default NewsPopup;