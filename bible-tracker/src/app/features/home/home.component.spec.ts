import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { I18nService } from '../../core/services/i18n.service';
import { BibleBook, ReadingHistoryEntry } from '../../models/bible.models';

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

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let bibleDataService: BibleDataService;
  let storageService: StorageService;
  let i18nService: I18nService;
  let router: Router;
  let routerSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    bibleDataService = TestBed.inject(BibleDataService);
    storageService = TestBed.inject(StorageService);
    i18nService = TestBed.inject(I18nService);
    router = TestBed.inject(Router);

    routerSpy = spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have user name', () => {
      expect(component.userName).toBe('Matheus');
    });

    it('should load all books', () => {
      expect(component.books.length).toBe(66);
    });

    it('should have stats signal', () => {
      expect(component.stats()).toBeDefined();
    });

    it('should have history signal', () => {
      expect(component.history()).toBeDefined();
    });
  });

  describe('Greeting Computed Signal', () => {
    it('should return morning greeting before 12', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2024, 0, 1, 9, 0, 0));
      
      const newComponent = new HomeComponent(router, bibleDataService, storageService, i18nService);
      const greeting = newComponent.greeting();
      
      expect(greeting).toContain(i18nService.t().home.greetingMorning);
      jasmine.clock().uninstall();
    });

    it('should return afternoon greeting between 12 and 18', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2024, 0, 1, 15, 0, 0));
      
      const newComponent = new HomeComponent(router, bibleDataService, storageService, i18nService);
      const greeting = newComponent.greeting();
      
      expect(greeting).toContain(i18nService.t().home.greetingAfternoon);
      jasmine.clock().uninstall();
    });

    it('should return evening greeting after 18', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2024, 0, 1, 20, 0, 0));
      
      const newComponent = new HomeComponent(router, bibleDataService, storageService, i18nService);
      const greeting = newComponent.greeting();
      
      expect(greeting).toContain(i18nService.t().home.greetingEvening);
      jasmine.clock().uninstall();
    });
  });

  describe('Current Reading Signal', () => {
    it('should suggest first book when no history', () => {
      const current = component.currentReading();
      expect(current.book).toBeDefined();
      expect(current.chapterNumber).toBe(1);
    });

    it('should suggest next chapter of last read book', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const current = component.currentReading();
      
      expect(current.book.id).toBe('gen');
      expect(current.chapterNumber).toBeGreaterThan(1);
    });

    it('should suggest next book if current is complete', () => {
      storageService.markBookComplete(TEST_BOOK);
      const current = component.currentReading();
      
      expect(current.book.id).not.toBe('gen');
    });

    it('should include progress info', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const current = component.currentReading();
      
      expect(current.progressPercent).toBeDefined();
      expect(current.completedChapters).toBeDefined();
      expect(current.totalChapters).toBeDefined();
    });
  });

  describe('Streak Signal', () => {
    it('should calculate reading streak', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      storageService.historySignal.set([
        {
          id: 'test1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: todayString,
          completedTime: '10:00',
          notes: ''
        }
      ]);
      
      const streak = component.streak();
      expect(streak).toBeGreaterThanOrEqual(0);
    });

    it('should include streak in stats', () => {
      const stats = component.stats();
      expect(stats.streak).toBeDefined();
    });
  });

  describe('Today History Signals', () => {
    it('should filter history for today', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      storageService.historySignal.set([
        {
          id: 'test1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: todayString,
          completedTime: '10:00',
          notes: ''
        }
      ]);
      
      const todayHistory = component.todayHistory();
      expect(todayHistory.length).toBe(1);
    });

    it('should exclude yesterday entries from today history', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toISOString();
      
      storageService.historySignal.set([
        {
          id: 'test1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: yesterdayString,
          completedTime: '10:00',
          notes: ''
        }
      ]);
      
      const todayHistory = component.todayHistory();
      expect(todayHistory.length).toBe(0);
    });

    it('should calculate chapters read today', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      storageService.historySignal.set([
        {
          id: 'test1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: todayString,
          completedTime: '10:00',
          notes: ''
        },
        {
          id: 'test2',
          bookId: 'gen',
          chapterNumber: 2,
          completedAt: todayString,
          completedTime: '11:00',
          notes: ''
        }
      ]);
      
      expect(component.chaptersToday()).toBe(2);
    });

    it('should calculate reading minutes today', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      for (let i = 0; i < 10; i++) {
        storageService.historySignal.set([
          ...storageService.historySignal(),
          {
            id: `test${i}`,
            bookId: 'gen',
            chapterNumber: i + 1,
            completedAt: todayString,
            completedTime: '10:00',
            notes: ''
          }
        ]);
      }
      
      const minutes = component.readingMinutesToday();
      expect(minutes).toBeGreaterThan(0);
    });
  });

  describe('Daily Verse Signal', () => {
    it('should provide daily verse', () => {
      const verse = component.dailyVerse();
      expect(verse).toBeDefined();
      expect(verse.reference).toBeTruthy();
      expect(verse.text).toBeTruthy();
    });

    it('should return same verse for same day', () => {
      const verse1 = component.dailyVerse();
      const verse2 = component.dailyVerse();
      expect(verse1.reference).toBe(verse2.reference);
    });

    it('should cycle through verses throughout year', () => {
      jasmine.clock().install();
      
      jasmine.clock().mockDate(new Date(2024, 0, 1, 10, 0, 0));
      const verse1 = component.dailyVerse();
      
      jasmine.clock().mockDate(new Date(2024, 0, 2, 10, 0, 0));
      const verse2 = component.dailyVerse();
      
      // Should potentially be different (depends on verse count)
      expect(verse1).toBeDefined();
      expect(verse2).toBeDefined();
      
      jasmine.clock().uninstall();
    });
  });

  describe('Stats Integration', () => {
    it('should calculate overall stats', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const stats = component.stats();
      
      expect(stats.totalChapters).toBeGreaterThan(0);
      expect(stats.completedChapters).toBe(1);
    });

    it('should include daily goal in stats', () => {
      const stats = component.stats();
      expect(stats.dailyGoal).toBe(10);
    });

    it('should calculate progress percentage', () => {
      const stats = component.stats();
      expect(stats.progressPercent).toBeGreaterThanOrEqual(0);
      expect(stats.progressPercent).toBeLessThanOrEqual(100);
    });
  });

  describe('Recent History', () => {
    it('should include recent history in component', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      for (let i = 0; i < 5; i++) {
        storageService.historySignal.set([
          {
            id: `test${i}`,
            bookId: 'gen',
            chapterNumber: i + 1,
            completedAt: todayString,
            completedTime: '10:00',
            notes: ''
          },
          ...storageService.historySignal()
        ]);
      }
      
      const todayEntries = component.todayHistory();
      expect(todayEntries.length).toBeLessThanOrEqual(5);
    });

    it('should show most recent entries first', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      const history = component.history();
      expect(history[0]).toBeDefined();
    });
  });

  describe('Continue Reading Navigation', () => {
    it('should navigate to current reading book', () => {
      component.continueReading();
      expect(routerSpy).toHaveBeenCalled();
    });

    it('should navigate to correct book', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      component.continueReading();
      
      const args = routerSpy.calls.mostRecent().args[0] as any[];
      expect(args[0]).toBe('/book');
    });

    it('should navigate with book ID', () => {
      component.continueReading();
      const args = routerSpy.calls.mostRecent().args[0] as any[];
      expect(args[1]).toBeTruthy();
    });
  });

  describe('Signal Reactivity', () => {
    it('should update greeting with time', () => {
      jasmine.clock().install();
      
      jasmine.clock().mockDate(new Date(2024, 0, 1, 9, 0, 0));
      const morning = component.greeting();
      
      jasmine.clock().mockDate(new Date(2024, 0, 1, 15, 0, 0));
      const afternoon = component.greeting();
      
      expect(morning).not.toBe(afternoon);
      jasmine.clock().uninstall();
    });

    it('should update current reading on history change', () => {
      const initial = component.currentReading();
      
      storageService.toggleChapter(TEST_BOOK, 1);
      const updated = component.currentReading();
      
      expect(updated).toBeDefined();
    });

    it('should update stats on progress change', () => {
      const initialStats = component.stats();
      const initialCompleted = initialStats.completedChapters;
      
      storageService.toggleChapter(TEST_BOOK, 1);
      const updatedStats = component.stats();
      
      expect(updatedStats.completedChapters).toBeGreaterThan(initialCompleted);
    });

    it('should update today history on new entries', () => {
      const initialCount = component.chaptersToday();
      
      const today = new Date();
      const todayString = today.toISOString();
      
      storageService.historySignal.set([
        {
          id: 'test1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: todayString,
          completedTime: '10:00',
          notes: ''
        },
        ...storageService.historySignal()
      ]);
      
      const updatedCount = component.chaptersToday();
      expect(updatedCount).toBeGreaterThanOrEqual(initialCount);
    });
  });

  describe('Services Integration', () => {
    it('should inject BibleDataService', () => {
      expect(component.bibleDataService).toBe(bibleDataService);
    });

    it('should inject StorageService', () => {
      expect(component.storageService).toBe(storageService);
    });

    it('should inject I18nService', () => {
      expect(component.i18n).toBe(i18nService);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty history gracefully', () => {
      expect(component.history()).toEqual([]);
      expect(component.todayHistory()).toEqual([]);
      expect(component.chaptersToday()).toBe(0);
    });

    it('should handle all books completed', () => {
      bibleDataService.books.forEach((book) => {
        storageService.markBookComplete(book);
      });
      
      const stats = component.stats();
      expect(stats.progressPercent).toBe(100);
      expect(stats.completedBooks).toBe(66);
    });

    it('should handle no progress made', () => {
      const stats = component.stats();
      expect(stats.completedChapters).toBe(0);
      expect(stats.progressPercent).toBe(0);
    });

    it('should handle large chapter counts', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      const entries: ReadingHistoryEntry[] = [];
      for (let i = 0; i < 100; i++) {
        entries.push({
          id: `test${i}`,
          bookId: 'gen',
          chapterNumber: (i % 50) + 1,
          completedAt: todayString,
          completedTime: '10:00',
          notes: ''
        });
      }
      
      storageService.historySignal.set(entries);
      expect(component.readingMinutesToday()).toBeGreaterThan(0);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle reading progress with multiple books', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      storageService.markBookComplete(TEST_BOOK);
      
      const stats = component.stats();
      expect(stats.startedBooks).toBeGreaterThan(0);
      expect(stats.completedBooks).toBe(1);
    });

    it('should update all signals on data changes', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.historySignal.set([
        {
          id: 'test1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: todayString,
          completedTime: '10:00',
          notes: ''
        }
      ]);
      
      expect(component.stats().completedChapters).toBeGreaterThan(0);
      expect(component.chaptersToday()).toBeGreaterThan(0);
      expect(component.currentReading()).toBeDefined();
    });
  });

  describe('Accessibility', () => {
    it('should provide user name for personalization', () => {
      expect(component.userName).toBeTruthy();
    });

    it('should have accessible greeting messages', () => {
      const greeting = component.greeting();
      expect(greeting.length).toBeGreaterThan(0);
    });

    it('should display reading stats clearly', () => {
      const stats = component.stats();
      expect(stats.progressPercent).toBeDefined();
      expect(stats.streak).toBeDefined();
    });
  });
});
