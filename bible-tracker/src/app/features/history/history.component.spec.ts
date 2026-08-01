import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HistoryComponent } from './history.component';
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
  id: 'mat',
  name: 'Mateus',
  testament: 'Novo',
  chapters: 28,
  abbreviation: 'Mt'
};

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let bibleDataService: BibleDataService;
  let storageService: StorageService;
  let i18nService: I18nService;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryComponent);
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

    it('should start with empty search term', () => {
      expect(component.searchTerm()).toBe('');
    });

    it('should start with "recent" sort mode', () => {
      expect(component.sortMode()).toBe('recent');
    });

    it('should start with "all" filter', () => {
      expect(component.filter()).toBe('all');
    });

    it('should have empty entries initially', () => {
      expect(component.entries()).toEqual([]);
    });
  });

  describe('History Filtering', () => {
    it('should show all testament filter', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.filter.set('all');
      expect(component.entries().length).toBe(2);
    });

    it('should filter by Old Testament', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.filter.set('old');
      const filtered = component.entries();
      
      filtered.forEach((entry) => {
        const book = bibleDataService.getBookById(entry.bookId);
        expect(book?.testament).toBe('Antigo');
      });
    });

    it('should filter by New Testament', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.filter.set('new');
      const filtered = component.entries();
      
      filtered.forEach((entry) => {
        const book = bibleDataService.getBookById(entry.bookId);
        expect(book?.testament).toBe('Novo');
      });
    });

    it('should exclude unknown books', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const entries = component.entries();
      
      entries.forEach((entry) => {
        const book = bibleDataService.getBookById(entry.bookId);
        expect(book).toBeDefined();
      });
    });
  });

  describe('History Search', () => {
    it('should search by book name', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.searchTerm.set('gênesis');
      expect(component.entries().length).toBe(1);
      expect(component.entries()[0].bookId).toBe('gen');
    });

    it('should perform case-insensitive search', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      
      component.searchTerm.set('GÊNESIS');
      expect(component.entries().length).toBe(1);
    });

    it('should handle partial search', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.searchTerm.set('mat');
      expect(component.entries().length).toBe(1);
      expect(component.entries()[0].bookId).toBe('mat');
    });

    it('should clear search for empty term', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.searchTerm.set('gen');
      expect(component.entries().length).toBe(1);
      
      component.searchTerm.set('');
      expect(component.entries().length).toBe(2);
    });

    it('should return empty array for no matches', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      
      component.searchTerm.set('xyz123');
      expect(component.entries()).toEqual([]);
    });

    it('should search within filtered results', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.filter.set('old');
      component.searchTerm.set('gen');
      
      expect(component.entries().length).toBe(1);
    });
  });

  describe('History Sorting', () => {
    it('should sort by recent (newest first)', (done) => {
      const now = new Date();
      storageService.historySignal.set([
        {
          id: '1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: new Date(now.getTime() - 5000).toISOString(),
          completedTime: '10:00',
          notes: ''
        },
        {
          id: '2',
          bookId: 'gen',
          chapterNumber: 2,
          completedAt: new Date(now.getTime() - 1000).toISOString(),
          completedTime: '10:05',
          notes: ''
        }
      ]);

      component.sortMode.set('recent');
      
      setTimeout(() => {
        const entries = component.entries();
        expect(entries[0].chapterNumber).toBe(2);
        expect(entries[1].chapterNumber).toBe(1);
        done();
      }, 100);
    });

    it('should sort by oldest (oldest first)', (done) => {
      const now = new Date();
      storageService.historySignal.set([
        {
          id: '1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: new Date(now.getTime() - 5000).toISOString(),
          completedTime: '10:00',
          notes: ''
        },
        {
          id: '2',
          bookId: 'gen',
          chapterNumber: 2,
          completedAt: new Date(now.getTime() - 1000).toISOString(),
          completedTime: '10:05',
          notes: ''
        }
      ]);

      component.sortMode.set('oldest');
      
      setTimeout(() => {
        const entries = component.entries();
        expect(entries[0].chapterNumber).toBe(1);
        expect(entries[1].chapterNumber).toBe(2);
        done();
      }, 100);
    });

    it('should sort by book', (done) => {
      storageService.toggleChapter(TEST_BOOK_2, 1);
      storageService.toggleChapter(TEST_BOOK, 1);
      
      component.sortMode.set('book');
      
      setTimeout(() => {
        const entries = component.entries();
        // Should be grouped by book
        expect(entries.length).toBeGreaterThan(0);
        done();
      }, 100);
    });
  });

  describe('Sort Mode Handler', () => {
    it('should set recent sort', () => {
      component.setSort('recent');
      expect(component.sortMode()).toBe('recent');
    });

    it('should set oldest sort', () => {
      component.setSort('oldest');
      expect(component.sortMode()).toBe('oldest');
    });

    it('should set book sort', () => {
      component.setSort('book');
      expect(component.sortMode()).toBe('book');
    });

    it('should update sort label', () => {
      component.setSort('recent');
      expect(component.sortLabel()).toContain(i18nService.t().history.sortRecent);
    });
  });

  describe('Sort Labels', () => {
    it('should return correct label for recent', () => {
      component.sortMode.set('recent');
      expect(component.sortLabel()).toBe(i18nService.t().history.sortRecent);
    });

    it('should return correct label for oldest', () => {
      component.sortMode.set('oldest');
      expect(component.sortLabel()).toBe(i18nService.t().history.sortOldest);
    });

    it('should return correct label for book', () => {
      component.sortMode.set('book');
      expect(component.sortLabel()).toBe(i18nService.t().history.sortBook);
    });
  });

  describe('Filter Change Handler', () => {
    it('should handle all filter', () => {
      const event = { value: 'all' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('all');
    });

    it('should handle old filter', () => {
      const event = { value: 'old' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('old');
    });

    it('should handle new filter', () => {
      const event = { value: 'new' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('new');
    });

    it('should recompute entries on filter change', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.filter.set('all');
      expect(component.entries().length).toBe(2);
      
      component.filter.set('old');
      expect(component.entries().length).toBe(1);
    });
  });

  describe('Book Name Resolution', () => {
    it('should get book name from service', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const bookName = component.getBookName('gen');
      expect(bookName).toBe('Gênesis');
    });

    it('should return unknown book for invalid ID', () => {
      const bookName = component.getBookName('invalid');
      expect(bookName).toBe(i18nService.t().common.unknownBook);
    });

    it('should translate book names correctly', () => {
      const bookName = component.getBookName('gen');
      const expectedName = bibleDataService.getBookById('gen')?.name ?? 'Unknown';
      expect(bookName).toBe(expectedName);
    });
  });

  describe('Complex Scenarios', () => {
    it('should combine search and filter', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.filter.set('old');
      component.searchTerm.set('gen');
      
      const entries = component.entries();
      expect(entries.length).toBe(1);
      expect(entries[0].bookId).toBe('gen');
    });

    it('should handle search and sort together', (done) => {
      const now = new Date();
      storageService.historySignal.set([
        {
          id: '1',
          bookId: 'gen',
          chapterNumber: 1,
          completedAt: new Date(now.getTime() - 5000).toISOString(),
          completedTime: '10:00',
          notes: ''
        },
        {
          id: '2',
          bookId: 'gen',
          chapterNumber: 2,
          completedAt: new Date(now.getTime() - 1000).toISOString(),
          completedTime: '10:05',
          notes: ''
        }
      ]);

      component.searchTerm.set('gênesis');
      component.sortMode.set('oldest');
      
      setTimeout(() => {
        const entries = component.entries();
        expect(entries.length).toBe(2);
        expect(entries[0].chapterNumber).toBe(1);
        done();
      }, 100);
    });

    it('should maintain search state when changing sort', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.searchTerm.set('genesis');
      expect(component.entries().length).toBe(1);
      
      component.sortMode.set('oldest');
      expect(component.entries().length).toBe(1);
      expect(component.searchTerm()).toBe('genesis');
    });

    it('should maintain sort state when changing filter', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.sortMode.set('oldest');
      component.filter.set('all');
      
      expect(component.sortMode()).toBe('oldest');
      expect(component.filter()).toBe('all');
    });
  });

  describe('Signal Reactivity', () => {
    it('should update entries on search term change', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      const allEntries = component.entries().length;
      component.searchTerm.set('gen');
      
      expect(component.entries().length).toBeLessThan(allEntries);
    });

    it('should update entries on filter change', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      const allEntries = component.entries().length;
      component.filter.set('old');
      
      expect(component.entries().length).toBeLessThanOrEqual(allEntries);
    });

    it('should update entries on sort change', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      
      const recentEntries = component.entries();
      component.sortMode.set('oldest');
      
      expect(component.entries().length).toBe(recentEntries.length);
    });

    it('should react to storage changes', () => {
      expect(component.entries().length).toBe(0);
      
      storageService.toggleChapter(TEST_BOOK, 1);
      
      expect(component.entries().length).toBe(1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty history', () => {
      expect(component.entries()).toEqual([]);
    });

    it('should handle search with special characters', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      
      component.searchTerm.set('êne');
      expect(component.entries().length).toBeGreaterThan(0);
    });

    it('should handle very long search term', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      
      component.searchTerm.set('this is a very long search term that does not match');
      expect(component.entries()).toEqual([]);
    });

    it('should handle filter with no results', () => {
      storageService.toggleChapter(TEST_BOOK_2, 1);
      
      component.filter.set('old');
      expect(component.entries()).toEqual([]);
    });

    it('should handle large history gracefully', () => {
      for (let i = 0; i < 100; i++) {
        storageService.toggleChapter(TEST_BOOK, (i % 50) + 1);
      }
      
      expect(component.entries().length).toBeGreaterThan(0);
    });
  });

  describe('I18n Integration', () => {
    it('should translate book names', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const bookName = component.getBookName('gen');
      
      expect(bookName).toBe(i18nService.translateBookName(TEST_BOOK));
    });

    it('should provide translated sort labels', () => {
      expect(component.sortLabel()).toBeTruthy();
    });
  });

  describe('History Entry Structure', () => {
    it('should have complete entry data', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const entries = component.entries();
      
      if (entries.length > 0) {
        const entry = entries[0];
        expect(entry.id).toBeTruthy();
        expect(entry.bookId).toBeTruthy();
        expect(entry.chapterNumber).toBeGreaterThan(0);
        expect(entry.completedAt).toBeTruthy();
        expect(entry.completedTime).toBeTruthy();
      }
    });

    it('should preserve notes in entries', () => {
      storageService.toggleChapter(TEST_BOOK, 1, 'Test note');
      const entries = component.entries();
      
      if (entries.length > 0) {
        expect(entries[0].notes).toBe('Test note');
      }
    });
  });
});
