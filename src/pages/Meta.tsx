// src/pages/Meta.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllChampions } from '../services/database'; // Importe a função para buscar personagens
import ChampionCard from '../components/ChampionCard'; // Importe o componente do cartão
import type { Champion } from '../types/Champion'; // Importe o tipo Champion
import pageStyles from '../styles/MetaPage.module.css'; // Vamos criar este CSS depois

const Meta: React.FC = () => {
  const [champions, setChampions] = useState<Champion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChampions = async () => {
      try {
        const data = await getAllChampions();
        setChampions(data);
      } catch (err) {
        console.error("Erro ao buscar personagens:", err);
        setError("Não foi possível carregar os personagens. Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchChampions();
  }, []); // O array vazio [] significa que este efeito só roda uma vez após a montagem

  const handleChampionClick = (championId: string) => {
    navigate(`/meta/${championId}`); // Redireciona para a página de detalhes do personagem
  };

  if (loading) {
    return <div className={pageStyles.loading}>Carregando personagens...</div>;
  }

  if (error) {
    return <div className={pageStyles.error}>{error}</div>;
  }

  return (
    <div className={pageStyles.container}>
      <h2 className={pageStyles.heading}>Catálogo de Personagens (Meta)</h2>
      <div className={pageStyles.grid}>
        {champions.map((champion) => (
          <ChampionCard
            key={champion.id}
            champion={champion}
            onClick={handleChampionClick}
          />
        ))}
        {champions.length === 0 && !loading && !error && (
            <p className={pageStyles.noChampions}>Nenhum personagem encontrado. Adicione alguns no Firestore!</p>
        )}
      </div>
    </div>
  );
};

export default Meta;