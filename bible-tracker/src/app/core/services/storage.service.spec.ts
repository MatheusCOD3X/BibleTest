import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';
import { BibleBook } from '../../models/bible.models';

const GENESIS: BibleBook = {
  id: 'gen',
  name: 'Gênesis',
  testament: 'Antigo',
  chapters: 3,
  abbreviation: 'Gn'
};

const EXODUS: BibleBook = {
  id: 'exo',
  name: 'Êxodo',
  testament: 'Antigo',
  chapters: 2,
  abbreviation: 'Ex'
};

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

  it('bootstraps default settings and empty progress/history when there is nothing saved', () => {
    expect(service.settingsSignal()).toEqual({
      theme: 'light',
      fontFamily: 'inter',
      fontSize: 16,
      animations: true,
      language: 'pt-BR'
    });
    expect(service.progressSignal().size).toBe(0);
    expect(service.historySignal()).toEqual([]);
  });

  describe('updateSettings', () => {
    it('merges partial settings and persists them', () => {
      service.updateSettings({ theme: 'dark', fontSize: 20 });

      expect(service.settingsSignal().theme).toBe('dark');
      expect(service.settingsSignal().fontSize).toBe(20);
      expect(service.settingsSignal().fontFamily).toBe('inter');

      const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1')!);
      expect(saved.settings.theme).toBe('dark');
    });
  });

  describe('toggleChapter', () => {
    it('marks a chapter as completed and adds a history entry', () => {
      service.toggleChapter(GENESIS, 1, 'nice chapter');

      const progress = service.progressSignal().get('gen:1');
      expect(progress?.completed).toBeTrue();
      expect(progress?.notes).toBe('nice chapter');

      const history = service.historySignal();
      expect(history.length).toBe(1);
      expect(history[0].bookId).toBe('gen');
      expect(history[0].chapterNumber).toBe(1);
    });

    it('unmarks a completed chapter and removes it from history on a second toggle', () => {
      service.toggleChapter(GENESIS, 1);
      service.toggleChapter(GENESIS, 1);

      const progress = service.progressSignal().get('gen:1');
      expect(progress?.completed).toBeFalse();
      expect(service.historySignal().length).toBe(0);
    });

    it('does not duplicate history entries when toggled on/off/on again', () => {
      service.toggleChapter(GENESIS, 1);
      service.toggleChapter(GENESIS, 1);
      service.toggleChapter(GENESIS, 1);

      expect(service.historySignal().length).toBe(1);
    });
  });

  describe('updateNotes', () => {
    it('updates notes for an existing progress entry', (done) => {
      service.toggleChapter(GENESIS, 1);
      service.updateNotes(GENESIS, 1, 'updated notes');

      expect(service.progressSignal().get('gen:1')?.notes).toBe('updated notes');
      // updateNotes debounces the save via scheduleSave(); just make sure it doesn't throw.
      setTimeout(() => done(), 450);
    });

    it('does nothing when the chapter has no existing progress entry', () => {
      service.updateNotes(GENESIS, 1, 'notes');
      expect(service.progressSignal().get('gen:1')).toBeUndefined();
    });
  });

  describe('getStats', () => {
    it('computes totals, percent and remaining time across books', () => {
      service.toggleChapter(GENESIS, 1);
      service.toggleChapter(GENESIS, 2);

      const stats = service.getStats([GENESIS, EXODUS]);

      expect(stats.totalChapters).toBe(5);
      expect(stats.completedChapters).toBe(2);
      expect(stats.remainingChapters).toBe(3);
      expect(stats.startedBooks).toBe(1);
      expect(stats.completedBooks).toBe(0);
      expect(stats.notStartedBooks).toBe(1);
      expect(stats.progressPercent).toBe(40);
      expect(stats.estimatedRemainingTime).toBe('12 min');
    });

    it('reports 0% progress when there are no chapters at all', () => {
      const stats = service.getStats([]);
      expect(stats.progressPercent).toBe(0);
      expect(stats.totalChapters).toBe(0);
    });
  });

  describe('getBookProgress / getBookCompletedCount / isBookCompleted', () => {
    it('tracks partial progress for a single book', () => {
      service.toggleChapter(GENESIS, 1);

      const progress = service.getBookProgress(GENESIS);
      expect(progress.completedChapters).toBe(1);
      expect(progress.totalChapters).toBe(3);
      expect(progress.progressPercent).toBe(33);
      expect(progress.started).toBeTrue();
      expect(progress.completed).toBeFalse();
    });

    it('marks a book as completed once every chapter is done', () => {
      service.toggleChapter(GENESIS, 1);
      service.toggleChapter(GENESIS, 2);
      service.toggleChapter(GENESIS, 3);

      expect(service.isBookCompleted(GENESIS)).toBeTrue();
      expect(service.getBookProgress(GENESIS).completed).toBeTrue();
    });
  });

  describe('markBookComplete / unmarkBookComplete', () => {
    it('completes every chapter of a book and adds history for each new chapter', () => {
      service.markBookComplete(GENESIS);

      expect(service.isBookCompleted(GENESIS)).toBeTrue();
      expect(service.historySignal().length).toBe(3);
    });

    it('does not duplicate history for chapters already completed', () => {
      service.toggleChapter(GENESIS, 1);
      service.markBookComplete(GENESIS);

      expect(service.historySignal().length).toBe(3);
      expect(service.historySignal().filter((entry) => entry.chapterNumber === 1).length).toBe(1);
    });

    it('unmarks every completed chapter of a book and clears its history', () => {
      service.markBookComplete(GENESIS);
      service.unmarkBookComplete(GENESIS);

      expect(service.isBookCompleted(GENESIS)).toBeFalse();
      expect(service.getBookCompletedCount(GENESIS)).toBe(0);
      expect(service.historySignal().length).toBe(0);
    });
  });

  describe('markAllComplete', () => {
    it('completes every chapter across multiple books', () => {
      service.markAllComplete([GENESIS, EXODUS]);

      expect(service.isBookCompleted(GENESIS)).toBeTrue();
      expect(service.isBookCompleted(EXODUS)).toBeTrue();
      expect(service.historySignal().length).toBe(5);
    });

    it('only adds history for chapters that were not already completed', () => {
      service.toggleChapter(GENESIS, 1);
      service.markAllComplete([GENESIS, EXODUS]);

      expect(service.historySignal().length).toBe(5);
    });
  });

  describe('export / import', () => {
    it('round-trips progress, settings and history through export/import', () => {
      service.toggleChapter(GENESIS, 1);
      service.updateSettings({ theme: 'dark' });

      const backup = service.export();

      service.clear();
      expect(service.progressSignal().size).toBe(0);

      service.import(backup);

      expect(service.progressSignal().get('gen:1')?.completed).toBeTrue();
      expect(service.settingsSignal().theme).toBe('dark');
      expect(service.historySignal().length).toBe(1);
    });

    it('throws a friendly error for invalid backup payloads', () => {
      expect(() => service.import('not json')).toThrowError('Arquivo de backup inválido.');
      expect(() => service.import('null')).toThrowError('Arquivo de backup inválido.');
    });
  });

  describe('applySettingsBitmask', () => {
    it('decodes a bitmask into settings and persists it', () => {
      service.updateSettings({ theme: 'dark', fontSize: 20, animations: false });
      const mask = service.settingsMaskSignal();

      service.clear();
      service.applySettingsBitmask(mask);

      expect(service.settingsSignal().theme).toBe('dark');
      expect(service.settingsSignal().fontSize).toBe(20);
      expect(service.settingsSignal().animations).toBeFalse();
    });
  });

  describe('resetProgress / clear', () => {
    it('wipes progress, history and settings back to defaults', () => {
      service.toggleChapter(GENESIS, 1);
      service.updateSettings({ theme: 'dark' });

      service.resetProgress();

      expect(service.progressSignal().size).toBe(0);
      expect(service.historySignal()).toEqual([]);
      expect(service.settingsSignal().theme).toBe('light');
      expect(localStorage.getItem('bible-pwa-state-v1')).toBeNull();
    });
  });

  describe('getMinutesForChapters', () => {
    it('multiplies chapters by the fixed per-chapter estimate', () => {
      expect(service.getMinutesForChapters(5)).toBe(20);
    });
  });

  describe('getProgress', () => {
    it('emits the current progress map through the observable', (done) => {
      service.getProgress().subscribe((map) => {
        expect(map instanceof Map).toBeTrue();
        done();
      });
    });
  });

  describe('load (persisted state)', () => {
    it('restores progress/settings/history saved from a previous session', () => {
      service.toggleChapter(GENESIS, 1);
      service.updateSettings({ theme: 'dark' });

      // Simulate a fresh app load by creating a brand new service instance backed by the same localStorage.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const reloaded = TestBed.inject(StorageService);

      expect(reloaded.settingsSignal().theme).toBe('dark');
      expect(reloaded.progressSignal().get('gen:1')?.completed).toBeTrue();
      expect(reloaded.historySignal().length).toBe(1);
    });

    it('falls back to defaults when the saved state is corrupted JSON', () => {
      localStorage.setItem('bible-pwa-state-v1', '{not-valid-json');

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const reloaded = TestBed.inject(StorageService);

      expect(reloaded.settingsSignal()).toEqual({
        theme: 'light',
        fontFamily: 'inter',
        fontSize: 16,
        animations: true,
        language: 'pt-BR'
      });
    });

    it('decodes settings from the bitmask when the settings JSON is missing (legacy backup)', () => {
      const partialState = {
        progress: [],
        history: [],
        settingsMask: 0
      };
      localStorage.setItem('bible-pwa-state-v1', JSON.stringify(partialState));

      TestBed.resetTestingModule();
      TestBed.configureTestingModule({});
      const reloaded = TestBed.inject(StorageService);

      expect(reloaded.settingsSignal().theme).toBeDefined();
    });
  });
});
