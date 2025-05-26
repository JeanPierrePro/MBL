// src/services/championsJsonService.ts

import type { Champion } from '../types/Champion';

/**
 * Função para buscar todos os campeões do arquivo JSON local.
 * @returns Uma Promise que resolve para um array de objetos Champion.
 */
export const getAllChampionsFromJson = async (): Promise<Champion[]> => {
  try {
    // Carrega o arquivo JSON principal que você editará manualmente
    const response = await fetch('/champions_data.json');

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erro HTTP! Status: ${response.status} - ${response.statusText}. Detalhes: ${errorText}`);
    }

    const data: Champion[] = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao carregar os dados dos campeões do JSON:", error);
    throw error;
  }
};

/**
 * Função para buscar um campeão específico pelo seu ID no arquivo JSON local.
 * @param championId O ID do campeão.
 * @returns O objeto Champion ou null se não for encontrado.
 */
export const getChampionByIdFromJson = async (championId: string): Promise<Champion | null> => {
  try {
    const allChampions = await getAllChampionsFromJson();
    const foundChampion = allChampions.find(champion => champion.id === championId);
    return foundChampion || null;
  } catch (error) {
    console.error(`Erro ao buscar campeão ${championId} no JSON:`, error);
    throw error;
  }
};