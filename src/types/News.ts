// src/types/News.ts
export interface News {
  id: string; // The Firestore document ID
  title: string;
  description: string; // Mantido
  summary: string;     // Adicionado
  content: string;     // Adicionado
  imageUrl: string;
  publicationDate: Date; // Usar Date consistentemente
}