import React from 'react';
import styles from '../styles/components/NewsCard.module.css';

// Adicionamos a 'publicationDate' para poder exibi-la
interface NewsCardProps {
  title: string;
  imageUrl: string;
  summary: string;
  publicationDate: Date;
  onClick: () => void;
}

const NewsCard: React.FC<NewsCardProps> = ({ title, imageUrl, summary, publicationDate, onClick }) => {
  return (
    // O 'article' é mais semântico para um card de notícia
    <article className={styles.card} onClick={onClick}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={title} className={styles.cardImage} />
      </div>
      <div className={styles.cardContent}>
        <span className={styles.cardDate}>
          {/* Formata a data para um formato legível */}
          {new Date(publicationDate).toLocaleDateString('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.cardSummary}>{summary}</p>
      </div>
    </article>
  );
};

export default NewsCard;