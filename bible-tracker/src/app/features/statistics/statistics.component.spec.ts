import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { StatisticsComponent } from './statistics.component';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { I18nService } from '../../core/services/i18n.service';
import { BibleBook } from '../../models/bible.models';

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

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;
  let bibleDataService: BibleDataService;
  let storageService: StorageService;
  let i18nService: I18nService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [StatisticsComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    bibleDataService = TestBed.inject(BibleDataService);
    storageService = TestBed.inject(StorageService);
    i18nService = TestBed.inject(I18nService);

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should have stats signal', () => {
      expect(component.stats()).toBeDefined();
    });

    it('should have history signal', () => {
      expect(component.history()).toBeDefined();
    });

    it('should have progress by book signal', () => {
      expect(component.progressByBook()).toBeDefined();
    });

    it('should have top progress signal', () => {
      expect(component.topProgress()).toBeDefined();
    });

    it('should have all progress sorted signal', () => {
      expect(component.allProgressSorted()).toBeDefined();
    });
  });

  describe('Statistics Calculation', () => {
    it('should calculate reading stats', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const stats = component.stats();
      
      expect(stats.totalChapters).toBeGreaterThan(0);
      expect(stats.completedChapters).toBe(1);
      expect(stats.progressPercent).toBeGreaterThan(0);
    });

    it('should include remaining chapters', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const stats = component.stats();
      
      expect(stats.remainingChapters).toBe(stats.totalChapters - stats.completedChapters);
    });

    it('should track completed books', () => {
      storageService.markBookComplete(TEST_BOOK);
      const stats = component.stats();
      
      expect(stats.completedBooks).toBe(1);
    });

    it('should track started books', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      const stats = component.stats();
      expect(stats.startedBooks).toBeGreaterThanOrEqual(2);
    });

    it('should track not started books', () => {
      const stats = component.stats();
      expect(stats.notStartedBooks).toBe(66);
    });

    it('should calculate progress percentage correctly', () => {
      const stats = component.stats();
      expect(stats.progressPercent).toBeGreaterThanOrEqual(0);
      expect(stats.progressPercent).toBeLessThanOrEqual(100);
    });

    it('should calculate streak', () => {
      const stats = component.stats();
      expect(stats.streak).toBeGreaterThanOrEqual(0);
    });

    it('should include daily goal', () => {
      const stats = component.stats();
      expect(stats.dailyGoal).toBe(10);
    });

    it('should estimate remaining time', () => {
      const stats = component.stats();
      expect(stats.estimatedRemainingTime).toBeTruthy();
    });
  });

  describe('Progress By Book', () => {
    it('should get progress for all books', () => {
      const progressByBook = component.progressByBook();
      expect(progressByBook.length).toBe(66);
    });

    it('should include book reference', () => {
      const progressByBook = component.progressByBook();
      progressByBook.forEach((item) => {
        expect(item.book).toBeDefined();
        expect(item.book.id).toBeTruthy();
      });
    });

    it('should include progress data', () => {
      const progressByBook = component.progressByBook();
      progressByBook.forEach((item) => {
        expect(item.progress).toBeDefined();
        expect(item.progress.completedChapters).toBeGreaterThanOrEqual(0);
      });
    });

    it('should update on storage changes', () => {
      const initialLength = component.progressByBook().length;
      
      storageService.toggleChapter(TEST_BOOK, 1);
      const updated = component.progressByBook();
      
      expect(updated.length).toBe(initialLength);
      expect(updated.find((p) => p.book.id === 'gen')?.progress.started).toBe(true);
    });
  });

  describe('Top Progress Signal', () => {
    it('should show top progressed books', () => {
      storageService.markBookComplete(TEST_BOOK);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      const topProgress = component.topProgress();
      expect(topProgress.length).toBeGreaterThan(0);
      expect(topProgress[0].progress.progressPercent).toBeGreaterThanOrEqual(topProgress[topProgress.length - 1].progress.progressPercent);
    });

    it('should limit to 8 books', () => {
      bibleDataService.books.slice(0, 15).forEach((book) => {
        storageService.toggleChapter(book, 1);
      });
      
      const topProgress = component.topProgress();
      expect(topProgress.length).toBeLessThanOrEqual(8);
    });

    it('should show books with highest progress first', () => {
      storageService.markBookComplete(TEST_BOOK);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      const topProgress = component.topProgress();
      if (topProgress.length > 1) {
        expect(topProgress[0].progress.progressPercent).toBeGreaterThanOrEqual(topProgress[1].progress.progressPercent);
      }
    });
  });

  describe('All Progress Sorted Signal', () => {
    it('should sort all books by progress', () => {
      storageService.markBookComplete(TEST_BOOK);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      const sorted = component.allProgressSorted();
      expect(sorted.length).toBe(66);
    });

    it('should maintain descending order', () => {
      bibleDataService.books.slice(0, 5).forEach((book) => {
        for (let i = 1; i <= Math.floor(book.chapters / 2); i++) {
          storageService.toggleChapter(book, i);
        }
      });
      
      const sorted = component.allProgressSorted();
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].progress.progressPercent).toBeGreaterThanOrEqual(sorted[i].progress.progressPercent);
      }
    });
  });

  describe('Chart Types', () => {
    it('should have doughnut chart type', () => {
      expect(component.progressChartType).toBe('doughnut');
    });

    it('should have bar chart type for monthly', () => {
      expect(component.monthlyChartType).toBe('bar');
    });

    it('should have bar chart type for by book', () => {
      expect(component.byBookChartType).toBe('bar');
    });
  });

  describe('Chart Options', () => {
    it('should have responsive progress chart options', () => {
      expect(component.progressChartOptions?.responsive).toBe(true);
    });

    it('should have responsive monthly chart options', () => {
      expect(component.monthlyChartOptions?.responsive).toBe(true);
    });

    it('should have responsive book chart options', () => {
      expect(component.byBookChartOptions?.responsive).toBe(true);
    });

    it('should have maintain aspect ratio disabled for charts', () => {
      expect(component.progressChartOptions?.maintainAspectRatio).toBe(false);
      expect(component.monthlyChartOptions?.maintainAspectRatio).toBe(false);
      expect(component.byBookChartOptions?.maintainAspectRatio).toBe(false);
    });

    it('should have legend at bottom for progress chart', () => {
      expect(component.progressChartOptions?.plugins?.legend?.position).toBe('bottom');
    });

    it('should hide legend for monthly chart', () => {
      expect(component.monthlyChartOptions?.plugins?.legend?.display).toBe(false);
    });

    it('should hide legend for book chart', () => {
      expect(component.byBookChartOptions?.plugins?.legend?.display).toBe(false);
    });

    it('should have Y axis starting at zero for monthly chart', () => {
      const yScale = component.monthlyChartOptions?.scales?.['y'] as any;
      expect(yScale?.beginAtZero).toBe(true);
    });

    it('should have X axis max of 100 for book chart', () => {
      const xScale = component.byBookChartOptions?.scales?.['x'] as any;
      expect(xScale?.max).toBe(100);
    });
  });

  describe('Chart Data Signals', () => {
    it('should have progress chart data', () => {
      const chartData = component.progressChartData();
      expect(chartData).toBeDefined();
    });

    it('should have monthly chart data', () => {
      const chartData = component.monthlyChartData();
      expect(chartData).toBeDefined();
    });

    it('should have book chart data', () => {
      const chartData = component.byBookChartData();
      expect(chartData).toBeDefined();
    });

    it('should update chart data on progress change', () => {
      const initialData = component.progressChartData();
      
      storageService.toggleChapter(TEST_BOOK, 1);
      const updatedData = component.progressChartData();
      
      expect(updatedData).toBeDefined();
    });
  });

  describe('History Integration', () => {
    it('should access history signal', () => {
      expect(component.history()).toBeDefined();
    });

    it('should update on history changes', () => {
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
      
      expect(component.history().length).toBe(1);
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

  describe('Complex Scenarios', () => {
    it('should handle multiple books with varying progress', () => {
      storageService.markBookComplete(TEST_BOOK);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      storageService.toggleChapter(TEST_BOOK_2, 2);
      
      const stats = component.stats();
      expect(stats.completedBooks).toBe(1);
      expect(stats.startedBooks).toBeGreaterThan(1);
    });

    it('should maintain stats consistency', () => {
      bibleDataService.books.slice(0, 10).forEach((book) => {
        for (let i = 1; i <= book.chapters; i++) {
          storageService.toggleChapter(book, i);
        }
      });
      
      const stats = component.stats();
      const progressByBook = component.progressByBook();
      
      let totalCompleted = 0;
      progressByBook.forEach((item) => {
        if (item.progress.completed) {
          totalCompleted++;
        }
      });
      
      expect(stats.completedBooks).toBe(totalCompleted);
    });

    it('should handle zero progress gracefully', () => {
      const stats = component.stats();
      expect(stats.completedChapters).toBe(0);
      expect(stats.progressPercent).toBe(0);
      expect(stats.completedBooks).toBe(0);
    });

    it('should handle full completion', () => {
      bibleDataService.books.forEach((book) => {
        storageService.markBookComplete(book);
      });
      
      const stats = component.stats();
      expect(stats.progressPercent).toBe(100);
      expect(stats.completedBooks).toBe(66);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update stats on progress change', () => {
      const initialStats = component.stats();
      
      storageService.toggleChapter(TEST_BOOK, 1);
      const updatedStats = component.stats();
      
      expect(updatedStats.completedChapters).toBeGreaterThan(initialStats.completedChapters);
    });

    it('should update top progress on book completion', () => {
      const initialTop = component.topProgress();
      
      storageService.markBookComplete(TEST_BOOK);
      const updatedTop = component.topProgress();
      
      expect(updatedTop.some((p) => p.book.id === 'gen' && p.progress.completed)).toBe(true);
    });

    it('should update sorted progress on changes', () => {
      const initialSorted = component.allProgressSorted();
      
      storageService.markBookComplete(TEST_BOOK);
      const updatedSorted = component.allProgressSorted();
      
      const genInitial = initialSorted.find((p) => p.book.id === 'gen');
      const genUpdated = updatedSorted.find((p) => p.book.id === 'gen');
      
      expect(genUpdated?.progress.completed).toBe(true);
    });

    it('should maintain order consistency in sorted signal', () => {
      for (let i = 0; i < 5; i++) {
        storageService.toggleChapter(bibleDataService.books[i], 1);
      }
      
      const sorted = component.allProgressSorted();
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i - 1].progress.progressPercent).toBeGreaterThanOrEqual(sorted[i].progress.progressPercent);
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle single book completion', () => {
      storageService.markBookComplete(TEST_BOOK);
      const stats = component.stats();
      expect(stats.completedBooks).toBe(1);
    });

    it('should handle single chapter completion', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const stats = component.stats();
      expect(stats.completedChapters).toBe(1);
    });

    it('should handle large history', () => {
      const today = new Date();
      const todayString = today.toISOString();
      
      const entries = [];
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
      expect(component.history().length).toBe(100);
    });

    it('should handle books with single chapter', () => {
      const singleChapterBooks = bibleDataService.books.filter((b) => b.chapters === 1);
      singleChapterBooks.forEach((book) => {
        storageService.markBookComplete(book);
      });
      
      const stats = component.stats();
      expect(stats.completedBooks).toBeGreaterThan(0);
    });

    it('should handle books with many chapters', () => {
      const psalms = bibleDataService.getBookById('ps');
      if (psalms) {
        for (let i = 1; i <= 50; i++) {
          storageService.toggleChapter(psalms, i);
        }
        
        const progress = storageService.getBookProgress(psalms);
        expect(progress.progressPercent).toBeGreaterThan(0);
      }
    });
  });

  describe('Performance', () => {
    it('should calculate stats efficiently', () => {
      const start = performance.now();
      component.stats();
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });

    it('should sort progress efficiently', () => {
      bibleDataService.books.forEach((book) => {
        storageService.toggleChapter(book, 1);
      });
      
      const start = performance.now();
      component.allProgressSorted();
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100);
    });
  });
});
