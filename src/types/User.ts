// src/types/User.ts

export interface MatchHistoryItem {
  // ...nenhuma alteração aqui
  id: string;
  date: string; 
  outcome: 'Vitória' | 'Derrota' | 'Indefinido';
  champion: string; 
  score: string;
  damageDealt?: string;
  damageTaken?: string;
  towerDamage?: string;
  killParticipation?: string;
  gold?: string;
  screenshotUrl?: string | null;
}

export interface UserProfile {
  uid: string;
  nick: string;
  inGameName?: string; // NOVO CAMPO: Nome exato como aparece no jogo
  email: string;
  lane?: 'Top' | 'Jungle' | 'Mid' | 'Adc' | 'Support' | null;
  status?: 'Online' | 'Offline' | 'Ativo' | 'In-Game' | 'Away';
  fotoURL?: string | null;
  role: 'member' | 'coach';
  teamId?: string | null;
  matchHistory?: MatchHistoryItem[];
}