// src/types/Champion.ts

export interface Ability {
  name: string;
  type: string; // Ex: "Skillshot", "Escudo", "Buff"
  description: string;
  iconUrl?: string; // URL da imagem do ícone da habilidade (pode ser opcional)
}

export interface Build {
  type: string; // Ex: "Mid AP Burst", "Support Utility"
  items: string[]; // Nomes dos itens
  runes: string[]; // Nomes das runas
  description: string;
}

export interface Champion {
  id: string; // ID único do personagem
  name: string; // Nome do personagem (Ex: "Lux")
  title: string; // Título do personagem (Ex: "A Dama da Luz")
  imageUrl: string; // URL da imagem principal do personagem (do seu Vercel ou placeholder)
  role: string[]; // Papéis no jogo (Ex: ["Mid", "Support"])
  difficulty: string; // Dificuldade (Ex: "Fácil", "Médio", "Difícil")
  passive: {
    name: string;
    description: string;
  };
  abilities: Ability[]; // Array de habilidades
  builds: Build[]; // Array de builds
  compositions: string[]; // Sugestões de composições de time
  // Adicione outros campos conforme necessário, como 'lore', 'dicas', etc.
}