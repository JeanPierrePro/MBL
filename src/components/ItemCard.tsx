// src/components/ItemCard.tsx
import React from 'react';
import type { Item } from '../types/Item';
import itemCardStyles from '../styles/components/ItemCard.module.css'; // Crie este arquivo CSS

interface ItemCardProps {
  item: Item;
  onClick: (itemId: string) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, onClick }) => {
  return (
    <div className={itemCardStyles.card} onClick={() => onClick(item.id)}>
      <img src={item.imageUrl} alt={item.name} className={itemCardStyles.image} />
      <h3 className={itemCardStyles.name}>{item.name}</h3>
      <p className={itemCardStyles.category}>Categoria: {item.category}</p>
      {item.effect && (
        <p className={itemCardStyles.effectName}>Efeito: {item.effect.name}</p>
      )}
      {/* Você pode adicionar mais detalhes aqui, como stats */}
    </div>
  );
};

export default ItemCard;