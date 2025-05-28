// src/types/User.ts

// Definindo o tipo para os itens do histórico de partidas
export interface MatchHistoryItem {
    id: string; // ID único da partida (pode ser gerado automaticamente ou do backend)
    date: string; // Data da partida (ex: 'YYYY-MM-DD' ou um timestamp)
    champion: string; // Campeão jogado
    outcome: 'Victory' | 'Defeat' | 'Draw'; // Resultado da partida (adicionei 'Draw' como opção)
    score: string; // Placar (ex: 'KDA: 10/2/5' ou outros detalhes)
    screenshotUrl?: string | null; // URL da imagem da tela de final de partida (opcional, pode ser null)
}

// Seu UserProfile atualizado
export interface UserProfile {
    uid: string;
    nick: string;
    email: string;
    lane: string; // A lane pode ser uma string vazia para treinadores
    status: 'Online' | 'Offline' | 'Ativo' | 'In-Game' | 'Away'; // Adicionei mais opções para status
    fotoPerfil?: string | null; // URL da foto de perfil (opcional, pode ser null)
    role: 'member' | 'coach';
    matchHistory?: MatchHistoryItem[]; // <--- ADICIONE ESTA LINHA! (Array de histórico de partidas)
}