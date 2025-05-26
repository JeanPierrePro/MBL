// src/components/ChampionCard.tsx
import React from 'react';
import type { Champion } from '../types/Champion'; // Importe o tipo Champion
import styles from '../styles/ChampionCard.module.css'; // Vamos criar este CSS depois

interface ChampionCardProps {
  champion: Champion;
  onClick: (championId: string) => void;
}

const ChampionCard: React.FC<ChampionCardProps> = ({ champion, onClick }) => {
  return (
    <div className={styles.card} onClick={() => onClick(champion.id)}>
      {/* ALTERAÇÃO AQUI: Usando um div com background-image */}
      <div
        className={styles.image} // Mantém a classe .image para os estilos de tamanho e borda
        style={{
          backgroundImage: `url('${champion.imageUrl}')`, // Define a imagem de fundo com a URL do campeão
          // Você pode adicionar um background-color fallback se quiser:
          // backgroundColor: '#3b3b6b'
        }}
        role="img" // Adiciona semântica para leitores de tela
        aria-label={`Imagem de ${champion.name}`} // Adiciona texto alternativo para acessibilidade
      />
      <h3 className={styles.name}>{champion.name}</h3>
      <p className={styles.title}>{champion.title}</p>
      {/* Você pode adicionar mais informações aqui, como a role principal */}
      <p className={styles.role}>Função: {champion.role[0]}</p>
    </div>
  );
};

export default ChampionCard;