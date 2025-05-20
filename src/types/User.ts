// src/types/User.ts
export interface UserProfile {
  uid: string;
  nick: string;
  email: string;
  lane: string; // A lane pode ser uma string vazia para treinadores
  status: 'Online' | 'Offline' | 'Ativo';
  fotoPerfil?: string | null;
  role: 'member' | 'coach';
}