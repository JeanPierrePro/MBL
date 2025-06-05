// src/types/Champion.ts

export interface ChampionStats {
  physicalAttack?: number;
  attackSpeed?: number;
  physicalDefense?: number;
  magicDefense?: number;
  hp?: number;
  cooldownReduction?: number;
  movementSpeed?: number;
  mana?: number;
  // Adicione outras propriedades de estatísticas se existirem no seu JSON
  // Por exemplo, se tiver 'attackDamage' no JSON, adicione aqui:
  // attackDamage?: number;
}

export interface Ability {
  name: string;
  type: string;
  description: string;
  iconUrl?: string;
}

export interface Passive {
  name: string;
  description: string;
}

export interface Build {
  type: string;
  items: string[]; // Array de IDs de itens
  runes: string[];
  description: string;
}

export interface Champion {
  id: string;
  name: string;
  title: string;
  imageUrl?: string;
  role: string[];
  difficulty: string;
  passive: Passive;
  abilities: Ability[];
  builds: Build[];
  compositions: string[];
  baseStats: ChampionStats; // Esta propriedade deve existir e ser do tipo ChampionStats
}