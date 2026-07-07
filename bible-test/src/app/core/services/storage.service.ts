import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings, BibleBook, BookProgress, ChapterProgress, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storageKey = 'bible-pwa-state-v1';
  private readonly progressSubject = new BehaviorSubject<Map<string, ChapterProgress>>(new Map());
  readonly progressSignal = signal<Map<string, ChapterProgress>>(new Map());
  readonly settingsSignal = signal<AppSettings>({
    theme: 'light',
    fontFamily: 'inter',
    fontSize: 16,
    animations: true,
    language: 'pt-BR'
  });
  readonly historySignal = signal<ReadingHistoryEntry[]>([]);

  constructor() {
    this.load();
  }

  save(): void {
    const state = {
      progress: Array.from(this.progressSignal().entries()).map(([id, chapter]) => ({ ...chapter })),
      settings: this.settingsSignal(),
      history: this.historySignal()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  load(): void {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) {
      this.bootstrapSeed();
      return;
    }

    try {
      const state = JSON.parse(raw);
      const progressMap = new Map<string, ChapterProgress>((state.progress || []).map((entry: ChapterProgress) => [entry.id, entry]));
      this.progressSignal.set(progressMap);
      this.progressSubject.next(progressMap);
      this.settingsSignal.set({
        theme: state.settings?.theme || 'light',
        fontFamily: state.settings?.fontFamily || 'inter',
        fontSize: state.settings?.fontSize || 16,
        animations: state.settings?.animations ?? true,
        language: state.settings?.language || 'pt-BR'
      });
      this.historySignal.set(state.history || []);
    } catch {
      this.bootstrapSeed();
    }
  }

  export(): string {
    return JSON.stringify({
      progress: Array.from(this.progressSignal().entries()).map(([id, chapter]) => ({ ...chapter })),
      settings: this.settingsSignal(),
      history: this.historySignal()
    }, null, 2);
  }

  import(payload: string): void {
    try {
      const parsed = JSON.parse(payload);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Formato inválido');
      }
      const progressMap = new Map<string, ChapterProgress>((parsed.progress || []).map((entry: ChapterProgress) => [entry.id, entry]));
      this.progressSignal.set(progressMap);
      this.progressSubject.next(progressMap);
      this.settingsSignal.set(parsed.settings || this.settingsSignal());
      this.historySignal.set(parsed.history || []);
      this.save();
    } catch {
      throw new Error('Arquivo de backup inválido.');
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
    this.progressSignal.set(new Map());
    this.progressSubject.next(new Map());
    this.historySignal.set([]);
    this.settingsSignal.set({
      theme: 'light',
      fontFamily: 'inter',
      fontSize: 16,
      animations: true,
      language: 'pt-BR'
    });
  }

  toggleChapter(book: BibleBook, chapterNumber: number, notes: string = ''): void {
    const id = `${book.id}:${chapterNumber}`;
    const existing = this.progressSignal().get(id);
    const now = new Date();
    const completed = !existing?.completed;
    const entry: ChapterProgress = {
      id,
      bookId: book.id,
      chapterNumber,
      completed,
      completedAt: completed ? now.toISOString() : null,
      completedTime: completed ? now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : null,
      notes
    };

    const next = new Map(this.progressSignal());
    next.set(id, entry);
    this.progressSignal.set(next);
    this.progressSubject.next(next);
    this.save();

    if (completed) {
      const historyEntry: ReadingHistoryEntry = {
        id: `${id}:${now.getTime()}`,
        bookId: book.id,
        chapterNumber,
        completedAt: now.toISOString(),
        completedTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        notes
      };
      this.historySignal.set([historyEntry, ...this.historySignal()]);
      this.save();
    }
  }

  updateNotes(book: BibleBook, chapterNumber: number, notes: string): void {
    const id = `${book.id}:${chapterNumber}`;
    const existing = this.progressSignal().get(id);
    if (!existing) {
      return;
    }
    const updated = { ...existing, notes };
    const next = new Map(this.progressSignal());
    next.set(id, updated);
    this.progressSignal.set(next);
    this.progressSubject.next(next);
    this.save();
  }

  getProgress(): Observable<Map<string, ChapterProgress>> {
    return this.progressSubject.asObservable();
  }

  getStats(books: BibleBook[]): ReadingStats {
    const progressValues = Array.from(this.progressSignal().values());
    const completedChapters = progressValues.filter((entry) => entry.completed).length;
    const totalChapters = books.reduce((sum, book) => sum + book.chapters, 0);
    const startedBooks = books.filter((book) => this.getBookCompletedCount(book) > 0).length;
    const completedBooks = books.filter((book) => this.isBookCompleted(book)).length;
    const notStartedBooks = books.length - startedBooks;
    const progressPercent = totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0;
    const streak = this.calculateStreak();
    const estimatedRemainingTime = this.estimateRemainingTime(totalChapters - completedChapters);

    return {
      totalChapters,
      completedChapters,
      remainingChapters: totalChapters - completedChapters,
      completedBooks,
      startedBooks,
      notStartedBooks,
      progressPercent,
      streak,
      dailyGoal: 10,
      estimatedRemainingTime
    };
  }

  getBookProgress(book: BibleBook): BookProgress {
    const completedChapters = this.getBookCompletedCount(book);
    const totalChapters = book.chapters;
    const progressPercent = totalChapters ? Math.round((completedChapters / totalChapters) * 100) : 0;
    return {
      bookId: book.id,
      completedChapters,
      totalChapters,
      progressPercent,
      completed: completedChapters === totalChapters,
      started: completedChapters > 0
    };
  }

  getBookCompletedCount(book: BibleBook): number {
    return Array.from(this.progressSignal().values()).filter((entry) => entry.bookId === book.id && entry.completed).length;
  }

  isBookCompleted(book: BibleBook): boolean {
    return this.getBookCompletedCount(book) === book.chapters;
  }

  markBookComplete(book: BibleBook): void {
    const next = new Map(this.progressSignal());
    for (let index = 1; index <= book.chapters; index++) {
      const id = `${book.id}:${index}`;
      const existing = next.get(id);
      if (!existing?.completed) {
        const now = new Date();
        next.set(id, {
          id,
          bookId: book.id,
          chapterNumber: index,
          completed: true,
          completedAt: now.toISOString(),
          completedTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          notes: existing?.notes || ''
        });
      }
    }
    this.progressSignal.set(next);
    this.progressSubject.next(next);
    this.save();
  }

  unmarkBookComplete(book: BibleBook): void {
    const next = new Map(this.progressSignal());
    for (let index = 1; index <= book.chapters; index++) {
      const id = `${book.id}:${index}`;
      const existing = next.get(id);
      if (existing?.completed) {
        next.delete(id);
      }
    }
    this.progressSignal.set(next);
    this.progressSubject.next(next);
    this.save();
  }

  markAllComplete(books: BibleBook[]): void {
    const next = new Map(this.progressSignal());
    books.forEach((book) => {
      for (let index = 1; index <= book.chapters; index++) {
        const id = `${book.id}:${index}`;
        const now = new Date();
        next.set(id, {
          id,
          bookId: book.id,
          chapterNumber: index,
          completed: true,
          completedAt: now.toISOString(),
          completedTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          notes: next.get(id)?.notes || ''
        });
      }
    });
    this.progressSignal.set(next);
    this.progressSubject.next(next);
    this.save();
  }

  resetProgress(): void {
    this.clear();
  }

  private bootstrapSeed(): void {
    this.progressSignal.set(new Map());
    this.progressSubject.next(new Map());
    this.historySignal.set([]);
    this.save();
  }

  private calculateStreak(): number {
    const history = this.historySignal().slice().sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
    if (!history.length) {
      return 0;
    }

    let streak = 1;
    const dates = Array.from(new Set(history.map((entry) => entry.completedAt.split('T')[0]))).sort();
    for (let index = dates.length - 2; index >= 0; index--) {
      const current = new Date(dates[index]);
      const next = new Date(dates[index + 1]);
      const diff = Math.round((next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private estimateRemainingTime(remaining: number): string {
    const minutes = remaining * 3;
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
}
