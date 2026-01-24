export interface Photo {
  id: string;
  url: string;
  caption?: string;
  width: number;
  height: number;
}

export interface ScrapbookEntry {
  id: string;
  date: string; // ISO date "2024-01-15"
  title: string;
  description: string;
  photos: Photo[];
  createdAt: string;
  updatedAt: string;
}
