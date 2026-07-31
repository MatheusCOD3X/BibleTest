import { Injectable, computed, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings, BibleBook, BookProgress, ChapterProgress, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';
import { decodeBitmaskFromSettings, encodeSettingsToBitmask } from '../utils/settings-bitmask';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  fontFamily: 'inter',
  fontSize: 16,
  animations: true,
  language: 'pt-BR'
};

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly storageKey = 'bible-pwa-state-v1';
  private readonly minutesPerChapter = 4;
  private readonly progressSubject = new BehaviorSubject<Map<string, ChapterProgress>>(new Map());
  readonly progressSignal = signal<Map<string, ChapterProgress>>(new Map());
  readonly settingsSignal = signal<AppSettings>({ ...DEFAULT_SETTINGS });
  /** Espelho compacto (bitmask) de `settingsSignal`, mantido para persistência/sincronização leve (ex.: com um futuro BFF). */
  readonly settingsMaskSignal = computed(() => encodeSettingsToBitmask(this.settingsSignal()));
  readonly historySignal = signal<ReadingHistoryEntry[]>([]);
  private saveDebounceHandle: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    this.load();
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => this.flushPendingSave());
    }
  }

  save(): void {
    clearTimeout(this.saveDebounceHandle);
    this.saveDebounceHandle = undefined;
    const state = {
      progress: Array.from(this.progressSignal().entries()).map(([id, chapter]) => ({ ...chapter })),
      settings: this.settingsSignal(),
      // Cópia compacta de `settings`, guardada além do JSON acima (ver settings-bitmask.ts).
      settingsMask: this.settingsMaskSignal(),
      history: this.historySignal()
    };
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  /** Salva um pouco depois da última chamada, evitando gravar a cada tecla digitada (ex.: nas notas). */
  private scheduleSave(delay = 400): void {
    clearTimeout(this.saveDebounceHandle);
    this.saveDebounceHandle = setTimeout(() => this.save(), delay);
  }

  private flushPendingSave(): void {
    if (this.saveDebounceHandle) {
      this.save();
    }
  }

  updateSettings(partial: Partial<AppSettings>): void {
    this.settingsSignal.update((current) => ({ ...current, ...partial }));
    this.save();
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
      this.settingsSignal.set(this.resolveSettings(state.settings, state.settingsMask));
      this.historySignal.set(state.history || []);
    } catch {
      this.bootstrapSeed();
    }
  }

  /** Dá preferência ao JSON completo de configurações; se ele estiver ausente (ex.: um backup antigo/incompleto), decodifica o bitmask como alternativa. */
  private resolveSettings(settingsJson: Partial<AppSettings> | undefined, settingsMask: number | undefined): AppSettings {
    if (settingsJson && typeof settingsJson === 'object') {
      return {
        theme: settingsJson.theme || DEFAULT_SETTINGS.theme,
        fontFamily: settingsJson.fontFamily || DEFAULT_SETTINGS.fontFamily,
        fontSize: settingsJson.fontSize || DEFAULT_SETTINGS.fontSize,
        animations: settingsJson.animations ?? DEFAULT_SETTINGS.animations,
        language: settingsJson.language || DEFAULT_SETTINGS.language
      };
    }
    if (typeof settingsMask === 'number') {
      return decodeBitmaskFromSettings(settingsMask, DEFAULT_SETTINGS);
    }
    return { ...DEFAULT_SETTINGS };
  }

  /** Aplica configurações recebidas como um bitmask compacto (ex.: enviado por um backend/BFF) e as salva. */
  applySettingsBitmask(mask: number): void {
    this.settingsSignal.set(decodeBitmaskFromSettings(mask, this.settingsSignal()));
    this.save();
  }

  export(): string {
    return JSON.stringify({
      progress: Array.from(this.progressSignal().entries()).map(([id, chapter]) => ({ ...chapter })),
      settings: this.settingsSignal(),
      settingsMask: this.settingsMaskSignal(),
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
      this.settingsSignal.set(this.resolveSettings(parsed.settings, parsed.settingsMask));
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
    this.settingsSignal.set({ ...DEFAULT_SETTINGS });
  }

  toggleChapter(book: BibleBook, chapterNumber: number, notes: string = ''): void {
    // Combinamos livro + capítulo em uma única string (ex.: "gen:3") para usar como chave no
    // Map de progresso. Esse mesmo padrão de chave composta se repete no resto deste arquivo.
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

    // Primeiro removemos qualquer entrada de histórico antiga deste capítulo, assim marcar/desmarcar
    // repetidamente nunca cria duplicatas nem deixa registros "presos" quando o capítulo é desmarcado.
    const historyWithoutChapter = this.historySignal().filter((historyEntry) => !(historyEntry.bookId === book.id && historyEntry.chapterNumber === chapterNumber));
    if (completed) {
      const historyEntry: ReadingHistoryEntry = {
        id: `${id}:${now.getTime()}`,
        bookId: book.id,
        chapterNumber,
        completedAt: now.toISOString(),
        completedTime: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        notes
      };
      this.historySignal.set([historyEntry, ...historyWithoutChapter]);
    } else {
      this.historySignal.set(historyWithoutChapter);
    }
    this.save();
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
    this.scheduleSave();
  }

  getProgress(): Observable<Map<string, ChapterProgress>> {
    return this.progressSubject.asObservable();
  }

  getMinutesForChapters(chapters: number): number {
    return chapters * this.minutesPerChapter;
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
    const now = new Date();
    const completedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newEntries: ReadingHistoryEntry[] = [];

    for (let index = 1; index <= book.chapters; index++) {
      const id = `${book.id}:${index}`;
      const existing = next.get(id);
      if (!existing?.completed) {
        next.set(id, {
          id,
          bookId: book.id,
          chapterNumber: index,
          completed: true,
          completedAt: now.toISOString(),
          completedTime,
          notes: existing?.notes || ''
        });
        newEntries.push({
          id: `${id}:${now.getTime()}`,
          bookId: book.id,
          chapterNumber: index,
          completedAt: now.toISOString(),
          completedTime,
          notes: existing?.notes || ''
        });
      }
    }

    this.progressSignal.set(next);
    this.progressSubject.next(next);

    if (newEntries.length) {
      // Um Set serve aqui só para perguntar "esse capítulo está na lista?" rapidamente com
      // `.has()` dentro do filter, em vez de percorrer o array `newEntries` a cada item.
      const newChapters = new Set(newEntries.map((entry) => entry.chapterNumber));
      const historyWithoutNewChapters = this.historySignal().filter((entry) => !(entry.bookId === book.id && newChapters.has(entry.chapterNumber)));
      this.historySignal.set([...newEntries.reverse(), ...historyWithoutNewChapters]);
    }
    this.save();
  }

  unmarkBookComplete(book: BibleBook): void {
    const next = new Map(this.progressSignal());
    const removedChapters = new Set<number>();
    for (let index = 1; index <= book.chapters; index++) {
      const id = `${book.id}:${index}`;
      const existing = next.get(id);
      if (existing?.completed) {
        next.delete(id);
        removedChapters.add(index);
      }
    }
    this.progressSignal.set(next);
    this.progressSubject.next(next);

    if (removedChapters.size) {
      this.historySignal.set(this.historySignal().filter((entry) => !(entry.bookId === book.id && removedChapters.has(entry.chapterNumber))));
    }
    this.save();
  }

  markAllComplete(books: BibleBook[]): void {
    const next = new Map(this.progressSignal());
    const now = new Date();
    const completedTime = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const newEntriesByBook = new Map<string, ReadingHistoryEntry[]>();

    books.forEach((book) => {
      const newEntries: ReadingHistoryEntry[] = [];
      for (let index = 1; index <= book.chapters; index++) {
        const id = `${book.id}:${index}`;
        const existing = next.get(id);
        if (!existing?.completed) {
          next.set(id, {
            id,
            bookId: book.id,
            chapterNumber: index,
            completed: true,
            completedAt: now.toISOString(),
            completedTime,
            notes: existing?.notes || ''
          });
          newEntries.push({
            id: `${id}:${now.getTime()}`,
            bookId: book.id,
            chapterNumber: index,
            completedAt: now.toISOString(),
            completedTime,
            notes: existing?.notes || ''
          });
        }
      }
      if (newEntries.length) {
        newEntriesByBook.set(book.id, newEntries);
      }
    });

    this.progressSignal.set(next);
    this.progressSubject.next(next);

    if (newEntriesByBook.size) {
      const historyWithoutNewChapters = this.historySignal().filter((entry) => {
        const newEntries = newEntriesByBook.get(entry.bookId);
        return !newEntries?.some((newEntry) => newEntry.chapterNumber === entry.chapterNumber);
      });
      const allNewEntries = Array.from(newEntriesByBook.values()).flatMap((entries) => entries.reverse());
      this.historySignal.set([...allNewEntries, ...historyWithoutNewChapters]);
    }
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

  // Sequência (streak) = quantos dias seguidos (incluindo hoje/ontem) o usuário concluiu
  // ao menos um capítulo. Estratégia: pegar as datas únicas do histórico, ordenar e contar
  // quantos dias consecutivos existem a partir do dia mais recente.
  private calculateStreak(): number {
    const dates = Array.from(new Set(this.historySignal().map((entry) => entry.completedAt.split('T')[0]))).sort();
    if (!dates.length) {
      return 0;
    }

    const oneDayMs = 1000 * 60 * 60 * 24;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastActiveDay = new Date(dates[dates.length - 1]);
    const daysSinceLastActivity = Math.round((today.getTime() - lastActiveDay.getTime()) / oneDayMs);

    // Se o último capítulo concluído não foi hoje nem ontem, a sequência (streak) foi quebrada.
    if (daysSinceLastActivity > 1) {
      return 0;
    }

    let streak = 1;
    for (let index = dates.length - 2; index >= 0; index--) {
      const current = new Date(dates[index]);
      const next = new Date(dates[index + 1]);
      const diff = Math.round((next.getTime() - current.getTime()) / oneDayMs);
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  private estimateRemainingTime(remaining: number): string {
    const minutes = remaining * this.minutesPerChapter;
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}min`;
  }
}
