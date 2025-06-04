// src/types/Item.ts
export interface Item {
  id: string;
  name: string;
  category: string; // Ex: "Defesa", "Físico", "Mágico"
  imageUrl: string;
  stats: {
    physicalDefense?: string; // Usar string para valores como "90" ou "+90"
    physicalAttack?: string;
    magicPower?: string;
    hp?: string;
    cooldownReduction?: string; // Ex: "10%"
    movementSpeed?: string;
    attackSpeed?: string;
    mana?: string;
    // Adicione outras estatísticas conforme necessário
  } | null;
  effect: {
    name: string;
    description: string;
  } | null;
  
  // -- NOVAS PROPRIEDADES ADICIONADAS AQUI --
  cost: number; // Adicionado
  passiveUnique: boolean; // Adicionado
  lore: string; // Adicionado
  buildsInto: string[]; // Adicionado
  builtFrom: string[]; // Adicionado
}