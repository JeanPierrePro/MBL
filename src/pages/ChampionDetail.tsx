// src/pages/ChampionDetail.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChampionByIdFromJson } from '../services/championsJsonService';
// CORRIGIDO: Removidos Ability e Build, pois já estão implícitos dentro de Champion
import type { Champion } from '../types/Champion';
import detailStyles from '../styles/ChampionDetailPage.module.css';

const ChampionDetail: React.FC = () => {
  const { championId } = useParams<{ championId: string }>();
  const navigate = useNavigate();
  const [champion, setChampion] = useState<Champion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChampionDetails = async () => {
      if (!championId) {
        setError("ID do campeão não fornecido na URL.");
        setLoading(false);
        return;
      }

      try {
        const data = await getChampionByIdFromJson(championId);
        if (data) {
          setChampion(data);
        } else {
          setError(`Campeão com ID "${championId}" não encontrado no arquivo JSON.`);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do campeão:", err);
        setError("Não foi possível carregar os detalhes do campeão. Verifique o arquivo JSON ou o ID.");
      } finally {
        setLoading(false);
      }
    };

    fetchChampionDetails();
  }, [championId]);

  if (loading) {
    return <div className={detailStyles.loading}>Carregando detalhes do campeão...</div>;
  }

  if (error) {
    return <div className={detailStyles.error}>{error}</div>;
  }

  if (!champion) {
    return <div className={detailStyles.notFound}>Campeão não encontrado.</div>;
  }

  return (
    <div className={detailStyles.container}>
      <button className={detailStyles.backButton} onClick={() => navigate('/meta')}>
        &larr; Voltar para o Catálogo
      </button>
      <div className={detailStyles.header}>
        <img src={champion.imageUrl || "placeholder.png"} alt={champion.name} className={detailStyles.championImage} />
        <div className={detailStyles.info}>
          <h1 className={detailStyles.name}>{champion.name}</h1>
          <h2 className={detailStyles.title}>{champion.title}</h2>
          <p className={detailStyles.role}>**Função:** {champion.role.join(' / ')}</p>
          <p className={detailStyles.difficulty}>**Dificuldade:** {champion.difficulty}</p>
        </div>
      </div>

      <div className={detailStyles.section}>
        <h3>Passiva: {champion.passive.name}</h3>
        <p>{champion.passive.description}</p>
      </div>

      <div className={detailStyles.section}>
        <h3>Habilidades</h3>
        <div className={detailStyles.abilitiesGrid}>
          {champion.abilities.map((ability, index) => (
            <div key={index} className={detailStyles.abilityCard}>
              {ability.iconUrl && <img src={ability.iconUrl} alt={ability.name} className={detailStyles.abilityIcon} />}
              <h4>{ability.name} ({ability.type})</h4>
              <p>{ability.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={detailStyles.section}>
        <h3>Builds Sugeridas</h3>
        {champion.builds.map((build, index) => (
          <div key={index} className={detailStyles.buildCard}>
            <h4>{build.type}</h4>
            <p className={detailStyles.buildDescription}>{build.description}</p>
            <p><strong>Itens:</strong> {build.items.join(', ')}</p>
            <p><strong>Runas:</strong> {build.runes.join(', ')}</p>
          </div>
        ))}
      </div>

      <div className={detailStyles.section}>
        <h3>Composições de Equipe Sugeridas</h3>
        <ul className={detailStyles.compositionList}>
          {champion.compositions.map((comp, index) => (
            <li key={index}>{comp}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChampionDetail;