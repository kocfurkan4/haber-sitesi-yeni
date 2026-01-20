export interface NewsItem {
  id: string;
  title: string;
  interestScore: number;
  source: string;
  date: string;
  summary: string;
  content: string;
  tags: string[];
  category: string;
  sourceUrl: string;
  isSent: boolean;
}

// Mock data removed - all news will be fetched from RSS sources
export const mockNews: NewsItem[] = [];
