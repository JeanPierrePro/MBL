// src/types/Champion.ts

export interface Ability {
  name: string;
  type: string; // Ex: "Skillshot", "Escudo", "Buff"
  description: string;
  iconUrl?: string; // URL da imagem do ícone da habilidade (pode ser opcional)
}

export interface ChampionBuild { // Renomeado de 'Build' para clareza
  type: string; // Ex: "Mid AP Burst", "Support Utility"
  items: string[]; // **IDs dos itens**, não nomes
  runes: string[]; // Nomes das runas
  description: string;
}

// **NOVA INTERFACE**: Define as estatísticas com valores numéricos
export interface ChampionStats {
  hp?: number; // Propriedades opcionais e numéricas
  attackDamage?: number;
  attackSpeed?: number;
  physicalDefense?: number;
  magicDefense?: number;
  movementSpeed?: number;
  mana?: number;
  // Adicione outras estatísticas se seu jogo as tiver, sempre como 'number'
}

export interface Champion {
  id: string; // ID único do personagem
  name: string; // Nome do personagem (Ex: "Lux")
  title: string; // Título do personagem (Ex: "A Dama da Luz")
  imageUrl: string; // URL da imagem principal do personagem
  role: string[]; // Papéis no jogo
  difficulty: string; // Dificuldade
  passive: {
    name: string;
    description: string;
  };
  abilities: Ability[]; // Array de habilidades
  builds: ChampionBuild[]; // Array de builds (usando ChampionBuild)
  compositions: string[]; // Sugestões de composições de time

  // **CAMPO ESSENCIAL ADICIONADO/CORRIGIDO:**
  baseStats: ChampionStats; // Estatísticas base do campeão, com tipo numérico
}