// src/types/Item.ts (depois da correção - ADICIONE 'description')

export interface ItemStats {
  physicalAttack?: number;
  attackSpeed?: number;
  physicalDefense?: number;
  magicDefense?: number;
  hp?: number;
  cooldownReduction?: number;
  movementSpeed?: number;
  mana?: number;
}

export interface ItemEffect {
  name: string;
  description: string;
}

export interface Item {
  id: string;
  name: string;
  category: string;
  imageUrl?: string;
  stats: ItemStats;
  description?: string; // <--- **ADICIONE ESTA LINHA**
  effect?: ItemEffect;
  cost: number;
  passiveUnique?: boolean;
  lore?: string;
  buildsInto?: string[];
  builtFrom?: string[];
}