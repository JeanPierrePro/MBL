import React from 'react';
import type { News } from '../types/News';
import styles from '../styles/components/NewsPopup.module.css'; // Importa o CSS Module

// Define as props que o componente NewsPopup espera receber.
// Ele estende o tipo 'News' para incluir todas as propriedades de uma notícia (title, imageUrl, description, etc.)
// e adiciona a função 'onClose' para fechar o popup.
interface NewsPopupProps extends News {
  onClose: () => void;
}

const NewsPopup: React.FC<NewsPopupProps> = ({ imageUrl, title, description, onClose }) => {
  // Esta verificação é uma boa prática para evitar renderizar um popup vazio
  // se, por algum motivo, os dados da notícia não estiverem completos.
  if (!title && !description && !imageUrl) {
    return null;
  }

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