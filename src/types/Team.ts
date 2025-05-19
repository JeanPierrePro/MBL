// src/types/Team.ts

export interface Team {
  id?: string; // O ID será gerado pelo banco de dados
  name: string;
  tag?: string; // Tag da equipe (opcional)
  logoURL?: string | null; // URL da logo da equipe (opcional)
  contactEmail: string; // E-mail de contato da equipe
  leaderNickname: string; // Nickname do líder da equipe
  members: TeamMember[]; // Array de membros da equipe
  description?: string; // Descrição da equipe (opcional)
  region?: string; // Região da equipe (opcional)
  registrationDate?: Date; // Data de registro (será gerada no backend/database)
  // Adicione outros campos conforme necessário
}

export interface TeamMember {
  nickname: string;
  lane?: string; // Lane principal do membro (opcional)
  // Adicione outros detalhes do membro se precisar
}