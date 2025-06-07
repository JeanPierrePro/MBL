// src/services/itemsJsonService.ts
import type { Item } from '../types/Item';

// NOVO CAMINHO: Agora o JSON está na raiz do 'public'
const ITEMS_DATA_PATH = '/items_data.json'; 

export async function getAllItemsFromJson(): Promise<Item[]> {
  try {
    const response = await fetch(ITEMS_DATA_PATH);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data: Item[] = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar dados dos equipamentos:", error);
    throw error; 
  }
}

export async function getItemByIdFromJson(id: string): Promise<Item | undefined> {
  const items = await getAllItemsFromJson();
  return items.find(item => item.id === id);
}