import React from 'react';
import type { News } from '../types/News'; // Importa o tipo News do caminho correto

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
    // O overlay escurece o fundo e captura cliques para fechar o popup.
    <div className="news-popup-overlay">
      {/* O conteúdo principal do popup */}
      <div className="news-popup-content">
        {/* Botão para fechar o popup */}
        <button className="news-popup-close" onClick={onClose}>
          X
        </button>
        {/* Renderiza a imagem da notícia se houver uma URL */}
        {imageUrl && <img src={imageUrl} alt={title} className="news-popup-image" />}
        {/* Título da notícia */}
        <h3>{title}</h3>
        {/* Descrição da notícia - AGORA USANDO 'description' */}
        <p>{description}</p>
      </div>
    </div>
  );
};

export default NewsPopup;