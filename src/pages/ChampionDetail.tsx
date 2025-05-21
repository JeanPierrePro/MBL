// src/pages/ChampionDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChampionById } from '../services/database'; // Importe a função para buscar um personagem específico
import type { Champion } from '../types/Champion'; // Importe o tipo Champion
import detailStyles from '../styles/ChampionDetail.module.css'; // Vamos criar este CSS depois

const ChampionDetail: React.FC = () => {
  const { championId } = useParams<{ championId: string }>(); // Obtém o ID do personagem da URL
  const [champion, setChampion] = useState<Champion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChampion = async () => {
      if (!championId) { // Garante que o ID do personagem existe na URL
        setError("ID do personagem não fornecido.");
        setLoading(false);
        return;
      }

      try {
        const data = await getChampionById(championId);
        if (data) {
          setChampion(data); // Define os dados do personagem se encontrado
        } else {
          setError("Personagem não encontrado."); // Caso o ID não corresponda a nenhum personagem
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do personagem:", err);
        setError("Não foi possível carregar os detalhes do personagem.");
      } finally {
        setLoading(false);
      }
    };

    fetchChampion();
  }, [championId]); // Re-executa este efeito sempre que o championId na URL mudar

  if (loading) {
    return <div className={detailStyles.loading}>Carregando detalhes do personagem...</div>;
  }

  if (error) {
    return (
      <div className={detailStyles.error}>
        <p>{error}</p>
        <button onClick={() => navigate('/meta')}>Voltar para a lista</button> {/* Botão para voltar */}
      </div>
    );
  }

  // Se não estiver carregando e não tiver erro, mas o personagem não foi encontrado
  if (!champion) {
    return <div className={detailStyles.notFound}>Personagem não encontrado.</div>;
  }

  // Se o personagem foi carregado com sucesso, exibe os detalhes
  return (
    <div className={detailStyles.container}>
      <button className={detailStyles.backButton} onClick={() => navigate('/meta')}>
        ← Voltar
      </button>
      <div className={detailStyles.header}>
        <img src={champion.imageUrl} alt={champion.name} className={detailStyles.image} />
        <h1>{champion.name} <span className={detailStyles.title}>- {champion.title}</span></h1>
        <p className={detailStyles.role}>Função: {champion.role.join(', ')}</p>
        <p className={detailStyles.difficulty}>Dificuldade: {champion.difficulty}</p>
      </div>

      <div className={detailStyles.section}>
        <h2>Passiva: {champion.passive.name}</h2>
        <p>{champion.passive.description}</p>
      </div>

      <div className={detailStyles.section}>
        <h2>Habilidades</h2>
        <div className={detailStyles.abilitiesGrid}>
          {champion.abilities.map((ability, index) => (
            <div key={index} className={detailStyles.abilityCard}>
              {ability.iconUrl && <img src={ability.iconUrl} alt={ability.name} className={detailStyles.abilityIcon} />}
              <h3>{ability.name} <span className={detailStyles.abilityType}>({ability.type})</span></h3>
              <p>{ability.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={detailStyles.section}>
        <h2>Builds Sugeridas</h2>
        {champion.builds.map((build, index) => (
          <div key={index} className={detailStyles.buildCard}>
            <h3>{build.type}</h3>
            <p><strong>Itens:</strong> {build.items.join(', ')}</p>
            <p><strong>Runas:</strong> {build.runes.join(', ')}</p>
            <p>{build.description}</p>
          </div>
        ))}
      </div>

      <div className={detailStyles.section}>
        <h2>Composições de Time</h2>
        <ul className={detailStyles.compositionsList}>
          {champion.compositions.map((comp, index) => (
            <li key={index}>{comp}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChampionDetail;