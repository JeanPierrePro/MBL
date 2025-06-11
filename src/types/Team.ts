// src/types/Team.ts

// --- TIPO DE STATUS ---
// Pode ser mantido aqui se usado amplamente para TeamMembers, ou importado de User.ts se UserProfile for a fonte principal
export type UserStatus = 'Online' | 'Offline' | 'In-Game' | 'Away' | 'Ativo';

export interface TeamMemberProfile {
  uid: string;
  nick: string;
  email: string;
  role: 'coach' | 'member';
  lane?: string | null; // Consistentemente opcional e permite null/undefined
  teamId?: string | null; // Consistentemente opcional e permite null/undefined
  status?: UserStatus; // Consistentemente opcional
  fotoURL?: string | null; // Consistentemente opcional e permite null/undefined
}

export interface Team {
  id: string;
  name: string;
  tag: string | null; // Pode ser nulo
  logoURL: string | null;
  contactEmail: string;
  leaderNickname: string;
  description: string | null; // Pode ser nulo
  region: string | null; // Pode ser nulo
  coachId: string;
  members: TeamMemberInTeamDoc[];
  registrationDate: Date; // Usar Date consistentemente
}

export interface TeamMemberInTeamDoc {
  nickname: string;
  lane: string | null; // Pode ser nulo
  email: string;
}

export interface NewTeamMemberFormData extends TeamMemberInTeamDoc {
  password?: string;
}

export interface Champion {
  id: string;
  name: string;
  // ...
}