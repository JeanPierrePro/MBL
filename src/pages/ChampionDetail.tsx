// src/pages/ChampionDetail.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChampionByIdFromJson } from '../services/championsJsonService';
import { getItemByIdFromJson } from '../services/itemsJsonService';
// Importe os tipos corretos
import type { Champion, ChampionStats } from '../types/Champion'; // Importe ChampionStats
import type { Item } from '../types/Item';
import detailStyles from '../styles/ChampionDetailPage.module.css';

const ChampionDetail: React.FC = () => {
  const { championId } = useParams<{ championId: string }>();
  const navigate = useNavigate();
  const [champion, setChampion] = useState<Champion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Estado para armazenar os detalhes dos itens, mapeados por ID
  const [recommendedItemsDetails, setRecommendedItemsDetails] = useState<{ [itemId: string]: Item }>({});

  useEffect(() => {
    const fetchChampionAndItemDetails = async () => {
      if (!championId) {
        setError("ID do campeão não fornecido na URL.");
        setLoading(false);
        return;
      }

      try {
        const championData = await getChampionByIdFromJson(championId);
        if (championData) {
          setChampion(championData);

          const itemsToFetch: Set<string> = new Set();
          championData.builds.forEach(build => {
            build.items.forEach(itemId => itemsToFetch.add(itemId));
          });

          const fetchedItems: { [itemId: string]: Item } = {};
          for (const id of Array.from(itemsToFetch)) {
            const itemData = await getItemByIdFromJson(id);
            if (itemData) {
              fetchedItems[id] = itemData;
            } else {
              console.warn(`Item com ID "${id}" não encontrado para a build do campeão.`);
            }
          }
          setRecommendedItemsDetails(fetchedItems);

        } else {
          setError(`Campeão com ID "${championId}" não encontrado no arquivo JSON.`);
        }
      } catch (err) {
        console.error("Erro ao buscar detalhes do campeão ou itens:", err);
        setError("Não foi possível carregar os detalhes do campeão ou seus itens. Verifique os arquivos JSON.");
      } finally {
        setLoading(false);
      }
    };

    fetchChampionAndItemDetails();
  }, [championId]);

  // Função para calcular as estatísticas finais com base na build
  const calculateFinalStats = useMemo(() => {
    if (!champion || !champion.baseStats) {
      return null;
    }

    const firstRecommendedBuild = champion.builds[0];
    if (!firstRecommendedBuild) {
        return null;
    }

    // Inicializa as estatísticas finais com as estatísticas base do campeão
    // O tipo agora está garantido por ChampionStats
    let finalStats: ChampionStats = { ...champion.baseStats };

    firstRecommendedBuild.items.forEach(itemId => {
      const item = recommendedItemsDetails[itemId];
      if (item && item.stats) {
        // Itera sobre as estatísticas do item
        for (const statKey in item.stats) {
          // Garante que a chave é uma chave válida para ChampionStats E Item.stats
          const key = statKey as keyof ChampionStats; 

          // Verifica se o valor da estatística no item é um número antes de somar
          if (typeof item.stats[key] === 'number') {
            finalStats[key] = (finalStats[key] || 0) + item.stats[key]!; // O '!' afirma que não é nulo/undefined
          }
        }
      }
    });

    // APLICAÇÃO DE PASSIVAS (Exemplo: Layla aumenta o dano em 25%)
    // Adapte esta lógica para o seu modelo de passivas.
    // É importante que 'attackDamage' exista em ChampionStats e Item.stats para que o cálculo funcione.
    if (champion.id === 'layla' && champion.passive.name === "Malefic Gun") {
      finalStats.attackDamage = (finalStats.attackDamage || 0) * 1.25;
    }
    // Adicione mais lógicas de passiva conforme necessário

    // Arredondar valores para evitar números muito longos
    for (const key in finalStats) {
        if (typeof finalStats[key as keyof ChampionStats] === 'number') {
            finalStats[key as keyof ChampionStats] = parseFloat(finalStats[key as keyof ChampionStats].toFixed(2));
        }
    }

    return finalStats;
  }, [champion, recommendedItemsDetails]);

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

      {/* SEÇÃO: BUILDS RECOMENDADAS E CÁLCULO DE ESTATÍSTICAS */}
      <div className={detailStyles.section}>
        <h3>Builds Recomendadas</h3>
        {champion.builds.length === 0 && <p>Nenhuma build recomendada para este campeão.</p>}
        {champion.builds.map((build, buildIndex) => (
          <div key={buildIndex} className={detailStyles.buildCard}>
            <h4>{build.type}</h4>
            <p className={detailStyles.buildDescription}>{build.description}</p>
            
            <h4>Itens da Build:</h4>
            <div className={detailStyles.buildItemsGrid}>
                {build.items.map((itemId, itemIndex) => {
                    const item = recommendedItemsDetails[itemId];
                    return item ? (
                        <div key={itemIndex} className={detailStyles.buildItem}>
                            <img src={item.imageUrl || "placeholder_item.png"} alt={item.name} className={detailStyles.buildItemImage} />
                            <p className={detailStyles.buildItemName}>{item.name}</p>
                            {/* item.description agora é reconhecido */}
                            {item.description && <p className={detailStyles.buildItemDescription}>{item.description}</p>}
                        </div>
                    ) : (
                        <div key={itemIndex} className={detailStyles.buildItemPlaceholder}>Item não encontrado: {itemId}</div>
                    );
                })}
            </div>

            <p><strong>Runas:</strong> {build.runes.join(', ')}</p>
            
            {/* Exibição das estatísticas finais apenas para a primeira build como exemplo */}
            {buildIndex === 0 && calculateFinalStats && (
                <div className={detailStyles.finalStats}>
                    <h4>Estatísticas Finais com esta Build (Exemplo):</h4>
                    <ul className={detailStyles.statsList}>
                        {Object.entries(calculateFinalStats).map(([key, value]) => (
                            <li key={key}>
                                <strong>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</strong> {value}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
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