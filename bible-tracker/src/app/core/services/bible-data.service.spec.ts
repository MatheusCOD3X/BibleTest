import { TestBed } from '@angular/core/testing';
import { BibleDataService } from './bible-data.service';

describe('BibleDataService', () => {
  let service: BibleDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BibleDataService);
  });

  it('exposes all 66 books of the Bible', () => {
    expect(service.books.length).toBe(66);
  });

  it('splits books between Old and New Testament correctly', () => {
    const oldTestament = service.books.filter((book) => book.testament === 'Antigo');
    const newTestament = service.books.filter((book) => book.testament === 'Novo');

    expect(oldTestament.length).toBe(39);
    expect(newTestament.length).toBe(27);
  });

  it('has unique, non-empty ids and abbreviations for every book', () => {
    const ids = service.books.map((book) => book.id);
    expect(new Set(ids).size).toBe(ids.length);
    service.books.forEach((book) => {
      expect(book.id).toBeTruthy();
      expect(book.name).toBeTruthy();
      expect(book.abbreviation).toBeTruthy();
      expect(book.chapters).toBeGreaterThan(0);
    });
  });

  describe('getBookById', () => {
    it('returns the matching book', () => {
      const genesis = service.getBookById('gen');
      expect(genesis?.name).toBe('Gênesis');
      expect(genesis?.chapters).toBe(50);
    });

    it('returns undefined for an unknown id', () => {
      expect(service.getBookById('does-not-exist')).toBeUndefined();
    });
  });
});
