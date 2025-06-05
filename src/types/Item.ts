// src/types/Item.ts

export interface Item {
  id: string;
  name: string;
  category: string;
  imageUrl: string;
  cost: number;
  passiveUnique?: boolean;
  lore?: string;
  builtFrom?: string[];
  buildsInto?: string[];
  
  // **CAMPO ESSENCIAL ADICIONADO:**
  description?: string; // Descrição curta do item (opcional, mas necessário para seu código)

  // **CRÍTICO: AS ESTATÍSTICAS DEVEM SER NÚMEROS!**
  stats?: {
    physicalAttack?: number;
    attackSpeed?: number;
    physicalDefense?: number;
    magicDefense?: number;
    hp?: number;
    cooldownReduction?: number;
    movementSpeed?: number;
    mana?: number;
    // Adicione outras estatísticas aqui, todas como 'number'
  };
  effect?: {
    name: string;
    description: string;
  };
}