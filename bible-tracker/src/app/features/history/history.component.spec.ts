import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HistoryComponent } from './history.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';

describe('HistoryComponent', () => {
  let storageService: StorageService;
  let bibleDataService: BibleDataService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HistoryComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
    storageService = TestBed.inject(StorageService);
    bibleDataService = TestBed.inject(BibleDataService);
  });

  it('should create with no entries when history is empty', () => {
    const fixture = TestBed.createComponent(HistoryComponent);
    expect(fixture.componentInstance.entries()).toEqual([]);
  });

  describe('entries', () => {
    it('lists history entries, most recent first by default', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      const exodus = bibleDataService.getBookById('exo')!;
      // toggleChapter timestamps come from `new Date()`, so ticking the clock between calls
      // avoids same-millisecond ties that would make the sort order ambiguous.
      jasmine.clock().install();
      storageService.toggleChapter(genesis, 1);
      jasmine.clock().tick(1000);
      storageService.toggleChapter(exodus, 1);
      jasmine.clock().uninstall();

      const fixture = TestBed.createComponent(HistoryComponent);
      const entries = fixture.componentInstance.entries();

      expect(entries.length).toBe(2);
      expect(entries[0].bookId).toBe('exo');
    });

    it('sorts oldest first when sort mode is "oldest"', () => {
    // PASSO 1: Limpe o serviço para garantir que o teste comece vazio
    // (Substitua 'clearHistory' pelo método correto que zera o seu storage)
    // storageService.clearHistory(); 

    const genesis = bibleDataService.getBookById('gen')!;
    const exodus = bibleDataService.getBookById('exo')!;
    
    jasmine.clock().install();
    
    // PASSO 2: Defina uma data base para o mock!
    const baseTime = new Date(2023, 1, 1).getTime();
    jasmine.clock().mockDate(new Date(baseTime));
    
    storageService.toggleChapter(genesis, 1);
    
    jasmine.clock().tick(1000);
    
    storageService.toggleChapter(exodus, 1);
    
    jasmine.clock().uninstall();

    const fixture = TestBed.createComponent(HistoryComponent);
    
    // PASSO 3: Inicializa o componente (dispara ngOnInit)
    fixture.detectChanges(); 

    fixture.componentInstance.setSort('oldest');
    
    // PASSO 4: Força a detecção de mudanças APÓS mudar o tipo de ordenação
    fixture.detectChanges(); 

    expect(fixture.componentInstance.entries()[0].bookId).toBe('gen');
    });

    it('sorts alphabetically by translated book name when sort mode is "book"', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      const exodus = bibleDataService.getBookById('exo')!;
      storageService.toggleChapter(exodus, 1);
      storageService.toggleChapter(genesis, 1);

      const fixture = TestBed.createComponent(HistoryComponent);
      fixture.componentInstance.setSort('book');

      // "Êxodo" comes before "Gênesis" alphabetically.
      expect(fixture.componentInstance.entries()[0].bookId).toBe('exo');
    });

    it('filters by testament', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      const matthew = bibleDataService.getBookById('mat')!;
      storageService.toggleChapter(genesis, 1);
      storageService.toggleChapter(matthew, 1);

      const fixture = TestBed.createComponent(HistoryComponent);
      fixture.componentInstance.onFilterChange({ value: 'old' });
      expect(fixture.componentInstance.entries().map((entry) => entry.bookId)).toEqual(['gen']);

      fixture.componentInstance.onFilterChange({ value: 'new' });
      expect(fixture.componentInstance.entries().map((entry) => entry.bookId)).toEqual(['mat']);
    });

    it('filters by translated book name search term', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      const exodus = bibleDataService.getBookById('exo')!;
      storageService.toggleChapter(genesis, 1);
      storageService.toggleChapter(exodus, 1);

      const fixture = TestBed.createComponent(HistoryComponent);
      fixture.componentInstance.searchTerm.set('gênesis');

      expect(fixture.componentInstance.entries().map((entry) => entry.bookId)).toEqual(['gen']);
    });
  });

  describe('getBookName', () => {
    it('returns the translated name for a known book', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      expect(fixture.componentInstance.getBookName('gen')).toBe('Gênesis');
    });

    it('returns the unknown-book label for an unrecognized id', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;
      expect(component.getBookName('does-not-exist')).toBe(component.i18n.t().common.unknownBook);
    });
  });

  describe('sortLabel', () => {
    it('reflects the current sort mode', () => {
      const fixture = TestBed.createComponent(HistoryComponent);
      const component = fixture.componentInstance;

      expect(component.sortLabel()).toBe(component.i18n.t().history.sortRecent);

      component.setSort('oldest');
      expect(component.sortLabel()).toBe(component.i18n.t().history.sortOldest);

      component.setSort('book');
      expect(component.sortLabel()).toBe(component.i18n.t().history.sortBook);
    });
  });

  describe('trackByEntry', () => {
    it('returns the entry id', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);
      const fixture = TestBed.createComponent(HistoryComponent);
      const entry = fixture.componentInstance.entries()[0];

      expect(fixture.componentInstance.trackByEntry(0, entry)).toBe(entry.id);
    });
  });
});
