// src/components/ChampionCard.tsx
import React from 'react';
import type { Champion } from '../types/Champion'; // Importe o tipo Champion
import styles from '../styles/components/ChampionCard.module.css'; // Vamos criar este CSS depois

interface ChampionCardProps {
  champion: Champion;
  onClick: (championId: string) => void;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ champion, onClick }) => {
  return (
    <div className={styles.card} onClick={() => onClick(champion.id)}>
      <img src={champion.imageUrl} alt={champion.name} className={styles.image} />
      <h3 className={styles.name}>{champion.name}</h3>
      <p className={styles.title}>{champion.title}</p>
      {/* Você pode adicionar mais informações aqui, como a role principal */}
      <p className={styles.role}>Função: {champion.role[0]}</p>
    </div>
  );
};

export default ChampionCard;