// src/types/News.ts
export interface News {
  id: string; // The Firestore document ID
  title: string;
  description: string;
  imageUrl: string;
  publicationDate: Date; // The date the news was published
  // Additional fields for events can be added here
}