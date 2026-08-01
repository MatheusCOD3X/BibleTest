import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BooksComponent } from './books.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';

describe('BooksComponent', () => {
  let storageService: StorageService;
  let bibleDataService: BibleDataService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BooksComponent],
      providers: [provideRouter([]), provideNoopAnimations()]
    }).compileComponents();
    storageService = TestBed.inject(StorageService);
    bibleDataService = TestBed.inject(BibleDataService);
  });

  it('should create and list every book by default', () => {
    const fixture = TestBed.createComponent(BooksComponent);
    const component = fixture.componentInstance;

    expect(component.filteredBooks().length).toBe(bibleDataService.books.length);
  });

  describe('searchTerm filtering', () => {
    it('filters books whose translated name includes the search term', () => {
      const fixture = TestBed.createComponent(BooksComponent);
      const component = fixture.componentInstance;

      component.searchTerm.set('gênesis');

      expect(component.filteredBooks().length).toBe(1);
      expect(component.filteredBooks()[0].id).toBe('gen');
    });

    it('returns an empty list when nothing matches', () => {
      const fixture = TestBed.createComponent(BooksComponent);
      const component = fixture.componentInstance;
      component.searchTerm.set('xyz-not-a-book');
      expect(component.filteredBooks().length).toBe(0);
    });
  });

  describe('searchSuggestions', () => {
    it('is empty when the search term is blank', () => {
      const fixture = TestBed.createComponent(BooksComponent);
      expect(fixture.componentInstance.searchSuggestions()).toEqual([]);
    });

    it('caps suggestions at 6 matches', () => {
      const fixture = TestBed.createComponent(BooksComponent);
      const component = fixture.componentInstance;
      // "a" matches far more than 6 book names in pt-BR.
      component.searchTerm.set('a');
      expect(component.searchSuggestions().length).toBeLessThanOrEqual(6);
    });
  });

  describe('matchesFilter / onFilterChange', () => {
    it('filters by testament (old/new)', () => {
      const fixture = TestBed.createComponent(BooksComponent);
      const component = fixture.componentInstance;

      component.onFilterChange({ value: 'old' });
      expect(component.filteredBooks().every((book) => book.testament === 'Antigo')).toBeTrue();

      component.onFilterChange({ value: 'new' });
      expect(component.filteredBooks().every((book) => book.testament === 'Novo')).toBeTrue();
    });

    it('filters by completion status', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.markBookComplete(genesis);

      const fixture = TestBed.createComponent(BooksComponent);
      const component = fixture.componentInstance;

      component.onFilterChange({ value: 'completed' });
      expect(component.filteredBooks().map((book) => book.id)).toEqual(['gen']);

      component.onFilterChange({ value: 'not-started' });
      expect(component.filteredBooks().map((book) => book.id)).not.toContain('gen');
    });

    it('filters by in-progress status', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);

      const fixture = TestBed.createComponent(BooksComponent);
      const component = fixture.componentInstance;

      component.onFilterChange({ value: 'progress' });
      expect(component.filteredBooks().map((book) => book.id)).toEqual(['gen']);
    });
  });

  describe('toggleBookComplete', () => {
    it('marks an incomplete book as complete', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      const fixture = TestBed.createComponent(BooksComponent);

      fixture.componentInstance.toggleBookComplete(genesis);

      expect(storageService.isBookCompleted(genesis)).toBeTrue();
    });

    it('unmarks an already complete book', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.markBookComplete(genesis);
      const fixture = TestBed.createComponent(BooksComponent);

      fixture.componentInstance.toggleBookComplete(genesis);

      expect(storageService.isBookCompleted(genesis)).toBeFalse();
    });
  });

  describe('goToBook', () => {
    it('navigates to the book details route', () => {
      const fixture = TestBed.createComponent(BooksComponent);
      const router = TestBed.inject(Router);
      const navigateSpy = spyOn(router, 'navigate');

      fixture.componentInstance.goToBook('gen');

      expect(navigateSpy).toHaveBeenCalledWith(['/book', 'gen']);
    });
  });

  describe('trackByBook', () => {
    it('returns the book id', () => {
      const fixture = TestBed.createComponent(BooksComponent);
      const genesis = bibleDataService.getBookById('gen')!;
      expect(fixture.componentInstance.trackByBook(0, genesis)).toBe('gen');
    });
  });
});
