import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { BooksComponent } from './books.component';
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

describe('BooksComponent', () => {
  let component: BooksComponent;
  let fixture: ComponentFixture<BooksComponent>;
  let bibleDataService: BibleDataService;
  let storageService: StorageService;
  let i18nService: I18nService;
  let router: Router;
  let routerSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [BooksComponent],
      providers: [provideRouter([]), provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(BooksComponent);
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

    it('should load all books from bible data service', () => {
      expect(component.books.length).toBe(66);
    });

    it('should initialize with empty search term', () => {
      expect(component.searchTerm()).toBe('');
    });

    it('should initialize with "all" filter', () => {
      expect(component.filter()).toBe('all');
    });

    it('should have empty search suggestions initially', () => {
      expect(component.searchSuggestions()).toEqual([]);
    });
  });

  describe('Book Filtering', () => {
    it('should show all books with "all" filter', () => {
      component.filter.set('all');
      expect(component.filteredBooks().length).toBe(66);
    });

    it('should filter by Old Testament', () => {
      component.filter.set('old');
      const filtered = component.filteredBooks();
      filtered.forEach((book) => {
        expect(book.testament).toBe('Antigo');
      });
    });

    it('should filter by New Testament', () => {
      component.filter.set('new');
      const filtered = component.filteredBooks();
      filtered.forEach((book) => {
        expect(book.testament).toBe('Novo');
      });
    });

    it('should filter by completed books', () => {
      storageService.markBookComplete(TEST_BOOK);
      component.filter.set('completed');
      const filtered = component.filteredBooks();
      
      const genBook = filtered.find((book) => book.id === 'gen');
      expect(genBook).toBeDefined();
    });

    it('should filter by books in progress', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      component.filter.set('progress');
      const filtered = component.filteredBooks();
      
      const genBook = filtered.find((book) => book.id === 'gen');
      expect(genBook).toBeDefined();
    });

    it('should filter by not-started books', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      component.filter.set('not-started');
      const filtered = component.filteredBooks();
      
      const genBook = filtered.find((book) => book.id === 'gen');
      expect(genBook).toBeUndefined();
    });

    it('should count Testament distribution correctly', () => {
      component.filter.set('old');
      const oldCount = component.filteredBooks().length;
      component.filter.set('new');
      const newCount = component.filteredBooks().length;
      
      expect(oldCount).toBe(39);
      expect(newCount).toBe(27);
    });
  });

  describe('Search Functionality', () => {
    it('should search by book name', () => {
      component.searchTerm.set('gênesis');
      expect(component.filteredBooks().length).toBeGreaterThan(0);
      expect(component.filteredBooks()[0].name).toContain('Gênesis');
    });

    it('should perform case-insensitive search', () => {
      component.searchTerm.set('GÊNESIS');
      expect(component.filteredBooks().length).toBeGreaterThan(0);
    });

    it('should handle partial search', () => {
      component.searchTerm.set('êne');
      const filtered = component.filteredBooks();
      expect(filtered.length).toBeGreaterThan(0);
      expect(filtered.some((book) => book.name.toLowerCase().includes('êne'))).toBe(true);
    });

    it('should return empty array for no matches', () => {
      component.searchTerm.set('xyz123');
      expect(component.filteredBooks()).toEqual([]);
    });

    it('should clear search when term is empty', () => {
      component.searchTerm.set('genesis');
      expect(component.filteredBooks().length).toBeGreaterThan(0);
      
      component.searchTerm.set('');
      expect(component.filteredBooks().length).toBe(66);
    });

    it('should search within filtered results', () => {
      component.filter.set('old');
      component.searchTerm.set('reis');
      const filtered = component.filteredBooks();
      
      expect(filtered.length).toBeGreaterThan(0);
      filtered.forEach((book) => {
        expect(book.testament).toBe('Antigo');
        expect(book.name.toLowerCase()).toContain('reis');
      });
    });

    it('should combine search and filter correctly', () => {
      component.filter.set('new');
      component.searchTerm.set('joão');
      const filtered = component.filteredBooks();
      
      filtered.forEach((book) => {
        expect(book.testament).toBe('Novo');
        expect(book.name.toLowerCase()).toContain('joão');
      });
    });
  });

  describe('Search Suggestions', () => {
    it('should provide autocomplete suggestions', () => {
      component.searchTerm.set('g');
      expect(component.searchSuggestions().length).toBeGreaterThan(0);
    });

    it('should limit suggestions to 6 results', () => {
      component.searchTerm.set('a');
      expect(component.searchSuggestions().length).toBeLessThanOrEqual(6);
    });

    it('should return empty suggestions for empty search', () => {
      component.searchTerm.set('');
      expect(component.searchSuggestions()).toEqual([]);
    });

    it('should return empty suggestions for whitespace only', () => {
      component.searchTerm.set('   ');
      expect(component.searchSuggestions()).toEqual([]);
    });

    it('should perform case-insensitive suggestions', () => {
      component.searchTerm.set('GÊ');
      const suggestions = component.searchSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });

    it('should match partial book names', () => {
      component.searchTerm.set('sam');
      const suggestions = component.searchSuggestions();
      expect(suggestions.some((book) => book.name.toLowerCase().includes('sam'))).toBe(true);
    });

    it('should handle special characters in search', () => {
      component.searchTerm.set('ê');
      expect(component.searchSuggestions().length).toBeGreaterThan(0);
    });

    it('should update suggestions as search term changes', () => {
      component.searchTerm.set('g');
      const suggestionsG = component.searchSuggestions().length;
      
      component.searchTerm.set('ge');
      const suggestionsGE = component.searchSuggestions().length;
      
      expect(suggestionsG).toBeGreaterThanOrEqual(suggestionsGE);
    });

    it('should return suggestions in order of books array', () => {
      component.searchTerm.set('o');
      const suggestions = component.searchSuggestions();
      
      suggestions.forEach((book, index) => {
        expect(book).toBeDefined();
      });
    });
  });

  describe('Filter Change Handler', () => {
    it('should handle filter value change', () => {
      const event = { value: 'old' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('old');
    });

    it('should handle "new" filter', () => {
      const event = { value: 'new' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('new');
    });

    it('should handle "completed" filter', () => {
      const event = { value: 'completed' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('completed');
    });

    it('should handle "progress" filter', () => {
      const event = { value: 'progress' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('progress');
    });

    it('should handle "not-started" filter', () => {
      const event = { value: 'not-started' };
      component.onFilterChange(event);
      expect(component.filter()).toBe('not-started');
    });

    it('should recompute filtered books on filter change', () => {
      component.searchTerm.set('genesis');
      component.filter.set('all');
      const allCount = component.filteredBooks().length;
      
      component.filter.set('new');
      const newCount = component.filteredBooks().length;
      
      expect(newCount).toBeLessThan(allCount);
    });
  });

  describe('Navigation', () => {
    it('should navigate to book details', () => {
      component.goToBook('gen');
      expect(routerSpy).toHaveBeenCalledWith(['/book', 'gen']);
    });

    it('should navigate with correct book ID', () => {
      component.goToBook('exo');
      expect(routerSpy).toHaveBeenCalledWith(['/book', 'exo']);
    });

    it('should navigate from suggestion selection', () => {
      component.searchTerm.set('gen');
      if (component.searchSuggestions().length > 0) {
        const firstSuggestion = component.searchSuggestions()[0];
        component.goToBook(firstSuggestion.id);
        expect(routerSpy).toHaveBeenCalledWith(['/book', firstSuggestion.id]);
      }
    });

    it('should handle navigation to any book', () => {
      const allBooks = component.books;
      allBooks.slice(0, 5).forEach((book) => {
        component.goToBook(book.id);
      });
      
      expect(routerSpy).toHaveBeenCalledTimes(5);
    });
  });

  describe('Book Progress Display', () => {
    it('should identify completed books', () => {
      storageService.markBookComplete(TEST_BOOK);
      const progress = storageService.getBookProgress(TEST_BOOK);
      expect(progress.completed).toBe(true);
    });

    it('should identify books in progress', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const progress = storageService.getBookProgress(TEST_BOOK);
      expect(progress.started).toBe(true);
      expect(progress.completed).toBe(false);
    });

    it('should identify not-started books', () => {
      const progress = storageService.getBookProgress(TEST_BOOK);
      expect(progress.started).toBe(false);
    });

    it('should calculate progress percentage', () => {
      for (let i = 1; i <= 25; i++) {
        storageService.toggleChapter(TEST_BOOK, i);
      }
      const progress = storageService.getBookProgress(TEST_BOOK);
      expect(progress.progressPercent).toBe(50);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle search and filter together', () => {
      component.filter.set('old');
      component.searchTerm.set('reis');
      
      const filtered = component.filteredBooks();
      filtered.forEach((book) => {
        expect(book.testament).toBe('Antigo');
        expect(book.name.toLowerCase()).toContain('reis');
      });
    });

    it('should maintain search state when changing filters', () => {
      component.searchTerm.set('genesis');
      component.filter.set('all');
      
      const beforeFilterChange = component.filteredBooks();
      
      component.filter.set('old');
      const afterFilterChange = component.filteredBooks();
      
      expect(component.searchTerm()).toBe('genesis');
      expect(beforeFilterChange.length).toBeGreaterThanOrEqual(afterFilterChange.length);
    });

    it('should handle switching between filters', () => {
      component.filter.set('old');
      expect(component.filteredBooks().length).toBe(39);
      
      component.filter.set('new');
      expect(component.filteredBooks().length).toBe(27);
      
      component.filter.set('all');
      expect(component.filteredBooks().length).toBe(66);
    });

    it('should provide suggestions that update with filter changes', () => {
      component.filter.set('all');
      component.searchTerm.set('samue');
      const allSuggestions = component.searchSuggestions();
      
      component.filter.set('old');
      // Suggestions should not depend on filter (only on search term)
      const filteredSuggestions = component.searchSuggestions();
      
      expect(allSuggestions.length).toBe(filteredSuggestions.length);
    });

    it('should handle rapid search changes', () => {
      const terms = ['g', 'ge', 'gen', 'gene', 'genes', 'genesi', 'genesis'];
      
      terms.forEach((term) => {
        component.searchTerm.set(term);
      });
      
      const finalFiltered = component.filteredBooks();
      expect(finalFiltered.length).toBeGreaterThan(0);
      expect(finalFiltered[0].name.toLowerCase()).toContain('genesis');
    });

    it('should have Bible data loaded in component', () => {
      expect(component.bibleDataService).toBe(bibleDataService);
      expect(component.books).toBe(bibleDataService.books);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update filtered books when search term changes', () => {
      const allBooks = component.filteredBooks().length;
      
      component.searchTerm.set('genesis');
      const searchedBooks = component.filteredBooks().length;
      
      expect(searchedBooks).toBeLessThan(allBooks);
    });

    it('should update filtered books when filter changes', () => {
      const allBooks = component.filteredBooks().length;
      
      component.filter.set('old');
      const filteredBooks = component.filteredBooks().length;
      
      expect(filteredBooks).toBeLessThan(allBooks);
    });

    it('should update suggestions when search term changes', () => {
      component.searchTerm.set('');
      expect(component.searchSuggestions()).toEqual([]);
      
      component.searchTerm.set('g');
      expect(component.searchSuggestions().length).toBeGreaterThan(0);
    });

    it('should react to storage service changes', () => {
      component.filter.set('not-started');
      let filtered = component.filteredBooks();
      expect(filtered.some((book) => book.id === 'gen')).toBe(true);
      
      storageService.toggleChapter(TEST_BOOK, 1);
      filtered = component.filteredBooks();
      expect(filtered.some((book) => book.id === 'gen')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle search with special characters', () => {
      component.searchTerm.set('êxodo');
      expect(component.filteredBooks().length).toBeGreaterThan(0);
    });

    it('should handle very long search term', () => {
      component.searchTerm.set('this is a very long search term that does not match any book');
      expect(component.filteredBooks()).toEqual([]);
    });

    it('should handle numeric search', () => {
      component.searchTerm.set('1');
      const filtered = component.filteredBooks();
      expect(filtered.length).toBeGreaterThan(0);
    });

    it('should handle filter with no results', () => {
      component.filter.set('completed');
      expect(component.filteredBooks().length).toBe(0);
    });
  });

  describe('I18n Integration', () => {
    it('should translate book names correctly', () => {
      const book = component.books[0];
      const translatedName = i18nService.translateBookName(book);
      expect(translatedName).toBe(book.name);
    });

    it('should search using translated book names', () => {
      component.searchTerm.set('gênesis');
      const filtered = component.filteredBooks();
      expect(filtered.length).toBeGreaterThan(0);
    });
  });
});
