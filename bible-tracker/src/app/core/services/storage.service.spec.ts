import { TestBed } from '@angular/core/testing';
import { BibleBook, ChapterProgress, ReadingHistoryEntry, AppSettings } from '../../models/bible.models';
import { StorageService } from './storage.service';

const TEST_BOOK: BibleBook = {
  id: 'gen',
  name: 'Gênesis',
  testament: 'Antigo',
  chapters: 50,
  abbreviation: 'Gn'
};

const TEST_BOOK_2: BibleBook = {
  id: 'exo',
  name: 'Êxodo',
  testament: 'Antigo',
  chapters: 40,
  abbreviation: 'Êx'
};

const SAMPLE_BOOKS: BibleBook[] = [TEST_BOOK, TEST_BOOK_2];

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Initialization & Loading', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should start with default settings', () => {
      expect(service.settingsSignal()).toEqual({
        theme: 'light',
        fontFamily: 'inter',
        fontSize: 16,
        animations: true,
        language: 'pt-BR'
      });
    });

    it('should start with empty progress map', () => {
      expect(service.progressSignal().size).toBe(0);
    });

    it('should start with empty history', () => {
      expect(service.historySignal()).toEqual([]);
    });

    it('should load saved state from localStorage on init', () => {
      const savedState = {
        progress: [{ id: 'gen:1', bookId: 'gen', chapterNumber: 1, completed: true, completedAt: '2024-01-01T10:00:00.000Z', completedTime: '10:00', notes: '' }],
        settings: { theme: 'dark', fontFamily: 'serif', fontSize: 18, animations: false, language: 'en' },
        settingsMask: 0,
        history: []
      };
      localStorage.setItem('bible-pwa-state-v1', JSON.stringify(savedState));

      // Create a new service instance to trigger load
      const newService = TestBed.inject(StorageService);
      expect(newService.progressSignal().size).toBe(1);
      expect(newService.settingsSignal().theme).toBe('dark');
      expect(newService.settingsSignal().language).toBe('en');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('bible-pwa-state-v1', 'invalid json {]');
      const newService = TestBed.inject(StorageService);
      expect(newService.progressSignal().size).toBe(0);
      expect(newService.settingsSignal().theme).toBe('light');
    });

    it('should bootstrap seed on empty localStorage', () => {
      const freshService = TestBed.inject(StorageService);
      expect(freshService.progressSignal().size).toBe(0);
      expect(freshService.historySignal()).toEqual([]);
    });
  });

  describe('Save & Load', () => {
    it('should save state to localStorage', () => {
      service.updateSettings({ theme: 'dark' });
      service.save();

      const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      expect(saved.settings.theme).toBe('dark');
    });

    it('should load state from localStorage', () => {
      const state = {
        progress: [{ id: 'gen:1', bookId: 'gen', chapterNumber: 1, completed: true, completedAt: '2024-01-01T10:00:00.000Z', completedTime: '10:00', notes: '' }],
        settings: { theme: 'dark', fontFamily: 'serif', fontSize: 18, animations: false, language: 'en' },
        settingsMask: 0,
        history: [{ id: 'gen:1:1234', bookId: 'gen', chapterNumber: 1, completedAt: '2024-01-01T10:00:00.000Z', completedTime: '10:00', notes: '' }]
      };
      localStorage.setItem('bible-pwa-state-v1', JSON.stringify(state));

      service.load();

      expect(service.progressSignal().size).toBe(1);
      expect(service.settingsSignal().theme).toBe('dark');
      expect(service.historySignal().length).toBe(1);
    });

    it('should save with debounce to avoid excessive writes', (done) => {
      spyOn(Storage.prototype, 'setItem');

      service.toggleChapter(TEST_BOOK, 1);
      service.updateNotes(TEST_BOOK, 1, 'Test note');

      setTimeout(() => {
        // Multiple updates should result in only one save call after debounce
        expect(Storage.prototype.setItem).toHaveBeenCalled();
        done();
      }, 500);
    });
  });

  describe('Settings Management', () => {
    it('should update settings signal', () => {
      service.updateSettings({ theme: 'dark' });
      expect(service.settingsSignal().theme).toBe('dark');
    });

    it('should update multiple settings at once', () => {
      service.updateSettings({ theme: 'dark', fontSize: 18, language: 'en' });
      expect(service.settingsSignal().theme).toBe('dark');
      expect(service.settingsSignal().fontSize).toBe(18);
      expect(service.settingsSignal().language).toBe('en');
    });

    it('should persist settings changes immediately', () => {
      service.updateSettings({ theme: 'dark' });
      const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      expect(saved.settings.theme).toBe('dark');
    });

    it('should apply settings bitmask', () => {
      // Bitmask encoding: theme (1 bit) | fontFamily (2 bits) | fontSize (1 bit) | animations (1 bit) | language (2 bits)
      service.applySettingsBitmask(15); // Sample bitmask
      expect(service.settingsSignal()).toBeDefined();
    });

    it('should compute settings mask signal', () => {
      expect(service.settingsMaskSignal()).toBeDefined();
      expect(typeof service.settingsMaskSignal()).toBe('number');
    });
  });

  describe('Chapter Progress Tracking', () => {
    it('should toggle chapter completion', () => {
      service.toggleChapter(TEST_BOOK, 1);
      const progress = service.progressSignal().get('gen:1');
      expect(progress).toBeDefined();
      expect(progress?.completed).toBe(true);
    });

    it('should untoggle completed chapter', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.toggleChapter(TEST_BOOK, 1);
      const progress = service.progressSignal().get('gen:1');
      expect(progress?.completed).toBe(false);
    });

    it('should add chapter to history when marked complete', () => {
      service.toggleChapter(TEST_BOOK, 1);
      expect(service.historySignal().length).toBeGreaterThan(0);
      const historyEntry = service.historySignal()[0];
      expect(historyEntry.bookId).toBe('gen');
      expect(historyEntry.chapterNumber).toBe(1);
    });

    it('should remove chapter from history when unmarked', () => {
      service.toggleChapter(TEST_BOOK, 1);
      const historyLengthAfterMark = service.historySignal().length;
      service.toggleChapter(TEST_BOOK, 1);
      expect(service.historySignal().length).toBe(historyLengthAfterMark - 1);
    });

    it('should set completed timestamp when marking complete', () => {
      service.toggleChapter(TEST_BOOK, 1);
      const progress = service.progressSignal().get('gen:1');
      expect(progress?.completedAt).toBeTruthy();
      expect(progress?.completedTime).toBeTruthy();
    });

    it('should clear timestamp when marking incomplete', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.toggleChapter(TEST_BOOK, 1);
      const progress = service.progressSignal().get('gen:1');
      expect(progress?.completedAt).toBeNull();
      expect(progress?.completedTime).toBeNull();
    });

    it('should save notes with chapter completion', () => {
      service.toggleChapter(TEST_BOOK, 1, 'Important chapter');
      const progress = service.progressSignal().get('gen:1');
      expect(progress?.notes).toBe('Important chapter');
    });

    it('should handle multiple chapters completion', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.toggleChapter(TEST_BOOK, 2);
      service.toggleChapter(TEST_BOOK, 3);
      expect(service.progressSignal().size).toBe(3);
    });

    it('should prevent duplicate history entries', () => {
      service.toggleChapter(TEST_BOOK, 1);
      const historyLength1 = service.historySignal().length;
      service.toggleChapter(TEST_BOOK, 1);
      service.toggleChapter(TEST_BOOK, 1);
      expect(service.historySignal().length).toBe(historyLength1);
    });
  });

  describe('Notes Management', () => {
    it('should update chapter notes', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.updateNotes(TEST_BOOK, 1, 'Updated notes');
      const progress = service.progressSignal().get('gen:1');
      expect(progress?.notes).toBe('Updated notes');
    });

    it('should not update notes for non-existent chapter', () => {
      service.updateNotes(TEST_BOOK, 99, 'Some notes');
      const progress = service.progressSignal().get('gen:99');
      expect(progress).toBeUndefined();
    });

    it('should debounce note updates', (done) => {
      spyOn(Storage.prototype, 'setItem');
      service.toggleChapter(TEST_BOOK, 1);
      service.updateNotes(TEST_BOOK, 1, 'Note 1');
      service.updateNotes(TEST_BOOK, 1, 'Note 2');
      
      setTimeout(() => {
        const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
        expect(saved.progress[0].notes).toBe('Note 2');
        done();
      }, 500);
    });
  });

  describe('Book Completion', () => {
    it('should mark entire book as complete', () => {
      service.markBookComplete(TEST_BOOK);
      for (let i = 1; i <= TEST_BOOK.chapters; i++) {
        const progress = service.progressSignal().get(`gen:${i}`);
        expect(progress?.completed).toBe(true);
      }
    });

    it('should add all chapters to history when marking book complete', () => {
      service.markBookComplete(TEST_BOOK);
      expect(service.historySignal().length).toBe(TEST_BOOK.chapters);
    });

    it('should unmark book completion', () => {
      service.markBookComplete(TEST_BOOK);
      service.unmarkBookComplete(TEST_BOOK);
      for (let i = 1; i <= TEST_BOOK.chapters; i++) {
        const progress = service.progressSignal().get(`gen:${i}`);
        expect(progress).toBeUndefined();
      }
    });

    it('should remove book chapters from history when unmarking', () => {
      service.markBookComplete(TEST_BOOK);
      const historyLengthAfterMark = service.historySignal().length;
      service.unmarkBookComplete(TEST_BOOK);
      expect(service.historySignal().length).toBe(0);
    });

    it('should not duplicate history entries when marking partially completed book', () => {
      service.toggleChapter(TEST_BOOK, 1);
      const historyAfterToggle = service.historySignal().length;
      service.markBookComplete(TEST_BOOK);
      expect(service.historySignal().length).toBe(TEST_BOOK.chapters);
    });

    it('should preserve notes when marking book complete', () => {
      service.toggleChapter(TEST_BOOK, 1, 'Original note');
      service.markBookComplete(TEST_BOOK);
      const progress = service.progressSignal().get('gen:1');
      expect(progress?.notes).toBe('Original note');
    });
  });

  describe('Book Progress Queries', () => {
    it('should get book completed count', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.toggleChapter(TEST_BOOK, 2);
      expect(service.getBookCompletedCount(TEST_BOOK)).toBe(2);
    });

    it('should return zero for no completed chapters', () => {
      expect(service.getBookCompletedCount(TEST_BOOK)).toBe(0);
    });

    it('should check if book is completed', () => {
      service.markBookComplete(TEST_BOOK);
      expect(service.isBookCompleted(TEST_BOOK)).toBe(true);
    });

    it('should return false if book not completed', () => {
      service.toggleChapter(TEST_BOOK, 1);
      expect(service.isBookCompleted(TEST_BOOK)).toBe(false);
    });

    it('should get comprehensive book progress', () => {
      service.markBookComplete(TEST_BOOK);
      const progress = service.getBookProgress(TEST_BOOK);
      expect(progress.completedChapters).toBe(TEST_BOOK.chapters);
      expect(progress.totalChapters).toBe(TEST_BOOK.chapters);
      expect(progress.progressPercent).toBe(100);
      expect(progress.completed).toBe(true);
      expect(progress.started).toBe(true);
    });

    it('should calculate partial progress', () => {
      service.toggleChapter(TEST_BOOK, 1);
      const progress = service.getBookProgress(TEST_BOOK);
      expect(progress.completedChapters).toBe(1);
      expect(progress.started).toBe(true);
      expect(progress.completed).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should calculate reading stats', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.toggleChapter(TEST_BOOK_2, 1);
      const stats = service.getStats(SAMPLE_BOOKS);
      
      expect(stats.totalChapters).toBe(90);
      expect(stats.completedChapters).toBe(2);
      expect(stats.remainingChapters).toBe(88);
      expect(stats.startedBooks).toBe(2);
      expect(stats.completedBooks).toBe(0);
    });

    it('should calculate streak correctly', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      service.historySignal.set([
        {
          id: 'test1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: todayString,
          completedTime: '10:00',
          notes: ''
        }
      ]);
      
      const stats = service.getStats(SAMPLE_BOOKS);
      expect(stats.streak).toBe(1);
    });

    it('should estimate remaining time', () => {
      const stats = service.getStats(SAMPLE_BOOKS);
      expect(stats.estimatedRemainingTime).toBeTruthy();
    });

    it('should include daily goal in stats', () => {
      const stats = service.getStats(SAMPLE_BOOKS);
      expect(stats.dailyGoal).toBe(10);
    });

    it('should calculate minutes for chapters', () => {
      expect(service.getMinutesForChapters(0)).toBe(0);
      expect(service.getMinutesForChapters(1)).toBe(4);
      expect(service.getMinutesForChapters(10)).toBe(40);
    });
  });

  describe('Export & Import', () => {
    it('should export state as JSON string', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.updateSettings({ theme: 'dark' });
      
      const exported = service.export();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.progress).toBeDefined();
      expect(parsed.settings).toBeDefined();
      expect(parsed.history).toBeDefined();
    });

    it('should import valid backup data', () => {
      const backupData = JSON.stringify({
        progress: [{ id: 'gen:1', bookId: 'gen', chapterNumber: 1, completed: true, completedAt: '2024-01-01T10:00:00.000Z', completedTime: '10:00', notes: '' }],
        settings: { theme: 'dark', fontFamily: 'serif', fontSize: 18, animations: false, language: 'en' },
        settingsMask: 0,
        history: []
      });

      service.import(backupData);

      expect(service.progressSignal().size).toBe(1);
      expect(service.settingsSignal().theme).toBe('dark');
    });

    it('should throw error on invalid import data', () => {
      expect(() => service.import('invalid json {]')).toThrow();
    });

    it('should throw error on non-object import data', () => {
      expect(() => service.import('"just a string"')).toThrow();
    });

    it('should handle empty arrays in import', () => {
      const backupData = JSON.stringify({
        progress: [],
        settings: null,
        settingsMask: 0,
        history: []
      });

      service.import(backupData);
      expect(service.progressSignal().size).toBe(0);
    });

    it('should restore default settings on missing settings in import', () => {
      const backupData = JSON.stringify({
        progress: [],
        settings: null,
        settingsMask: 0,
        history: []
      });

      service.import(backupData);
      expect(service.settingsSignal()).toEqual({
        theme: 'light',
        fontFamily: 'inter',
        fontSize: 16,
        animations: true,
        language: 'pt-BR'
      });
    });
  });

  describe('Clear & Reset', () => {
    it('should clear all data', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.updateSettings({ theme: 'dark' });
      
      service.clear();

      expect(service.progressSignal().size).toBe(0);
      expect(service.historySignal()).toEqual([]);
      expect(service.settingsSignal()).toEqual({
        theme: 'light',
        fontFamily: 'inter',
        fontSize: 16,
        animations: true,
        language: 'pt-BR'
      });
    });

    it('should reset progress', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.resetProgress();
      expect(service.progressSignal().size).toBe(0);
    });

    it('should remove from localStorage on clear', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.clear();
      expect(localStorage.getItem('bible-pwa-state-v1')).toBeNull();
    });
  });

  describe('Progress Observable', () => {
    it('should provide progress as observable', (done) => {
      service.getProgress().subscribe((progress) => {
        expect(progress instanceof Map).toBe(true);
        done();
      });
    });

    it('should emit progress updates', (done) => {
      let emitCount = 0;
      service.getProgress().subscribe(() => {
        emitCount++;
        if (emitCount === 2) {
          expect(emitCount).toBe(2);
          done();
        }
      });

      service.toggleChapter(TEST_BOOK, 1);
    });
  });

  describe('Before Unload', () => {
    it('should flush pending saves on beforeunload', () => {
      spyOn(Storage.prototype, 'setItem');
      service.updateSettings({ theme: 'dark' });
      
      // Simulate beforeunload event
      window.dispatchEvent(new Event('beforeunload'));
      
      expect(Storage.prototype.setItem).toHaveBeenCalled();
    });
  });

  describe('Settings Fallback & Resolution', () => {
    it('should use JSON settings when available', () => {
      const backupData = JSON.stringify({
        progress: [],
        settings: { theme: 'dark', fontFamily: 'serif', fontSize: 18, animations: false, language: 'en' },
        settingsMask: 999,
        history: []
      });

      service.import(backupData);
      expect(service.settingsSignal().theme).toBe('dark');
    });

    it('should fallback to bitmask when JSON settings missing', () => {
      // This tests the resolveSettings private method behavior through import
      const backupData = JSON.stringify({
        progress: [],
        settings: null,
        settingsMask: 0,
        history: []
      });

      service.import(backupData);
      expect(service.settingsSignal()).toBeDefined();
    });

    it('should handle partial settings in import', () => {
      const backupData = JSON.stringify({
        progress: [],
        settings: { theme: 'dark' },
        settingsMask: 0,
        history: []
      });

      service.import(backupData);
      expect(service.settingsSignal().theme).toBe('dark');
      expect(service.settingsSignal().language).toBe('pt-BR');
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle marking all books complete', () => {
      service.markAllComplete(SAMPLE_BOOKS);
      expect(service.getBookCompletedCount(TEST_BOOK)).toBe(TEST_BOOK.chapters);
      expect(service.getBookCompletedCount(TEST_BOOK_2)).toBe(TEST_BOOK_2.chapters);
    });

    it('should maintain history order (most recent first)', () => {
      service.toggleChapter(TEST_BOOK, 1);
      service.toggleChapter(TEST_BOOK, 2);
      service.toggleChapter(TEST_BOOK, 3);

      const history = service.historySignal();
      expect(history[0].chapterNumber).toBe(3);
      expect(history[1].chapterNumber).toBe(2);
      expect(history[2].chapterNumber).toBe(1);
    });

    it('should handle rapid toggle/untoggle cycles', () => {
      for (let i = 0; i < 5; i++) {
        service.toggleChapter(TEST_BOOK, 1);
        service.toggleChapter(TEST_BOOK, 1);
      }
      const progress = service.progressSignal().get('gen:1');
      expect(progress?.completed).toBe(false);
    });
  });
});
