export interface ChapterProgress {
  id: string;
  bookId: string;
  chapterNumber: number;
  completed: boolean;
  completedAt: string | null;
  completedTime: string | null;
  notes: string;
}

export interface BookProgress {
  bookId: string;
  completedChapters: number;
  totalChapters: number;
  progressPercent: number;
  completed: boolean;
  started: boolean;
}

export interface ReadingHistoryEntry {
  id: string;
  bookId: string;
  chapterNumber: number;
  completedAt: string;
  completedTime: string;
  notes: string;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontFamily: 'inter' | 'serif' | 'mono';
  fontSize: number;
  animations: boolean;
  language: 'pt-BR' | 'en' | 'es';
}

export interface BibleBook {
  id: string;
  name: string;
  testament: 'Antigo' | 'Novo';
  chapters: number;
  abbreviation: string;
}

export interface ReadingStats {
  totalChapters: number;
  completedChapters: number;
  remainingChapters: number;
  completedBooks: number;
  startedBooks: number;
  notStartedBooks: number;
  progressPercent: number;
  streak: number;
  dailyGoal: number;
  estimatedRemainingTime: string;
}
