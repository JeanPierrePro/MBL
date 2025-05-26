  // src/pages/Meta.tsx
  import React, { useState, useEffect, useMemo } from 'react'; // Adicionado useMemo
  import { useNavigate } from 'react-router-dom';
  import { getAllChampionsFromJson } from '../services/championsJsonService';
  import ChampionCard from '../components/ChampionCard';
  import type { Champion } from '../types/Champion';
  import pageStyles from '../styles/MetaPage.module.css';

  const Meta: React.FC = () => {
    const [champions, setChampions] = useState<Champion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string>('All'); // Novo estado para o filtro de função
    const navigate = useNavigate();

    useEffect(() => {
      const fetchChampions = async () => {
        try {
          const data = await getAllChampionsFromJson();
          setChampions(data);
        } catch (err) {
          console.error("Erro ao buscar personagens:", err);
          setError("Não foi possível carregar os personagens. Verifique o arquivo JSON.");
        } finally {
          setLoading(false);
        }
      };

      fetchChampions();
    }, []);

    // Use useMemo para memorizar a lista de campeões filtrada e ordenada
    const filteredAndSortedChampions = useMemo(() => {
      let currentChampions = [...champions]; // Crie uma cópia para evitar mutações diretas

      // 1. Filtrar por função (role)
      if (selectedRole !== 'All') {
        currentChampions = currentChampions.filter(champion =>
          champion.role.includes(selectedRole) // Verifica se a função está incluída no array de roles do campeão
        );
      }

      // 2. Ordenar alfabeticamente pelo nome
      currentChampions.sort((a, b) => a.name.localeCompare(b.name));

      return currentChampions;
    }, [champions, selectedRole]); // Recalcula se 'champions' ou 'selectedRole' mudar

    // Extrair todas as funções únicas para o filtro
    const availableRoles = useMemo(() => {
      const roles = new Set<string>();
      champions.forEach(champion => {
        champion.role.forEach(r => roles.add(r));
      });
      return ['All', ...Array.from(roles).sort()]; // Adiciona 'All' e ordena as funções
    }, [champions]);

    const handleChampionClick = (championId: string) => {
      navigate(`/meta/${championId}`);
    };

    if (loading) {
      return <div className={pageStyles.loading}>Carregando personagens...</div>;
    }

    if (error) {
      return <div className={pageStyles.error}>{error}</div>;
    }

    return (
      <div className={pageStyles.container}>
        <h2 className={pageStyles.heading}>Catálogo de Personagens</h2>

        <div className={pageStyles.filtersContainer}>
          <label htmlFor="role-filter" className={pageStyles.filterLabel}>Filtrar por Função (Lane) :</label>
          <select
            id="role-filter"
            className={pageStyles.filterSelect}
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            {availableRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className={pageStyles.grid}>
          {filteredAndSortedChampions.map((champion) => (
            <ChampionCard
              key={champion.id}
              champion={champion}
              onClick={handleChampionClick}
            />
          ))}
          {filteredAndSortedChampions.length === 0 && !loading && !error && (
              <p className={pageStyles.noChampions}>Nenhum personagem encontrado com os filtros aplicados.</p>
          )}
        </div>
      </div>
    );
  };

  export default Meta;