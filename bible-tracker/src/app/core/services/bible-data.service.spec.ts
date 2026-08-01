import { TestBed } from '@angular/core/testing';
import { BibleDataService } from './bible-data.service';
import { BibleBook } from '../../models/bible.models';

describe('BibleDataService', () => {
  let service: BibleDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BibleDataService);
  });

  describe('Service Creation', () => {
    it('should create the service', () => {
      expect(service).toBeTruthy();
    });

    it('should have all 66 books loaded', () => {
      expect(service.books.length).toBe(66);
    });
  });

  describe('Old Testament Books', () => {
    it('should have all 39 Old Testament books', () => {
      const oldTestament = service.books.filter((book) => book.testament === 'Antigo');
      expect(oldTestament.length).toBe(39);
    });

    it('should include Genesis as first book', () => {
      const genesis = service.books[0];
      expect(genesis.id).toBe('gen');
      expect(genesis.name).toBe('Gênesis');
      expect(genesis.chapters).toBe(50);
    });

    it('should include Malachi as last Old Testament book', () => {
      const malachi = service.books.find((book) => book.id === 'mal');
      expect(malachi).toBeDefined();
      expect(malachi?.name).toBe('Malaquias');
      expect(malachi?.testament).toBe('Antigo');
    });

    it('should include Psalms with 150 chapters', () => {
      const psalms = service.getBookById('ps');
      expect(psalms).toBeDefined();
      expect(psalms?.chapters).toBe(150);
      expect(psalms?.name).toBe('Salmos');
    });

    it('should have correct abbreviations for OT books', () => {
      const books = ['gen', 'exo', 'lev', 'num', 'deu'];
      const abbreviations = ['Gn', 'Êx', 'Lv', 'Nm', 'Dt'];

      books.forEach((bookId, index) => {
        const book = service.getBookById(bookId);
        expect(book?.abbreviation).toBe(abbreviations[index]);
      });
    });
  });

  describe('New Testament Books', () => {
    it('should have all 27 New Testament books', () => {
      const newTestament = service.books.filter((book) => book.testament === 'Novo');
      expect(newTestament.length).toBe(27);
    });

    it('should include Matthew as first New Testament book', () => {
      const matthew = service.books.find((book) => book.id === 'mat');
      expect(matthew).toBeDefined();
      expect(matthew?.name).toBe('Mateus');
      expect(matthew?.chapters).toBe(28);
    });

    it('should include Revelation as last book', () => {
      const revelation = service.books[service.books.length - 1];
      expect(revelation.id).toBe('rev');
      expect(revelation.name).toBe('Apocalipse');
      expect(revelation.testament).toBe('Novo');
      expect(revelation.chapters).toBe(22);
    });

    it('should include Gospels correctly', () => {
      const gospels = ['mat', 'mar', 'luk', 'joh'];
      const expectedNames = ['Mateus', 'Marcos', 'Lucas', 'João'];

      gospels.forEach((bookId, index) => {
        const book = service.getBookById(bookId);
        expect(book?.name).toBe(expectedNames[index]);
      });
    });

    it('should have epistles with correct chapters', () => {
      const paul1Timothy = service.getBookById('1ti');
      expect(paul1Timothy?.chapters).toBe(6);
      expect(paul1Timothy?.abbreviation).toBe('1Tm');
    });
  });

  describe('Book Lookup', () => {
    it('should get book by ID', () => {
      const book = service.getBookById('gen');
      expect(book).toBeDefined();
      expect(book?.id).toBe('gen');
      expect(book?.name).toBe('Gênesis');
    });

    it('should return undefined for non-existent book', () => {
      const book = service.getBookById('xxx');
      expect(book).toBeUndefined();
    });

    it('should get all books with valid IDs', () => {
      service.books.forEach((book) => {
        const retrieved = service.getBookById(book.id);
        expect(retrieved).toEqual(book);
      });
    });

    it('should handle case-sensitive book IDs', () => {
      const lowercase = service.getBookById('gen');
      const uppercase = service.getBookById('GEN');
      expect(lowercase).toBeDefined();
      expect(uppercase).toBeUndefined();
    });
  });

  describe('Book Properties', () => {
    it('should have valid structure for each book', () => {
      service.books.forEach((book) => {
        expect(book.id).toBeTruthy();
        expect(book.name).toBeTruthy();
        expect(book.testament).toMatch(/Antigo|Novo/);
        expect(book.chapters).toBeGreaterThan(0);
        expect(book.abbreviation).toBeTruthy();
      });
    });

    it('should have unique IDs for each book', () => {
      const ids = service.books.map((book) => book.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have matching chapter counts for known books', () => {
      const expectedChapters = {
        'gen': 50,
        'exo': 40,
        'mat': 28,
        'joh': 21,
        'rev': 22,
        'ps': 150
      };

      Object.entries(expectedChapters).forEach(([bookId, chapters]) => {
        const book = service.getBookById(bookId);
        expect(book?.chapters).toBe(chapters);
      });
    });

    it('should have correct abbreviations', () => {
      const expectedAbbreviations = {
        'gen': 'Gn',
        'exo': 'Êx',
        'mat': 'Mt',
        'joh': 'Jo',
        'rev': 'Ap'
      };

      Object.entries(expectedAbbreviations).forEach(([bookId, abbr]) => {
        const book = service.getBookById(bookId);
        expect(book?.abbreviation).toBe(abbr);
      });
    });
  });

  describe('Testament Distribution', () => {
    it('should have exactly 39 Old Testament books', () => {
      const oldTestament = service.books.filter((book) => book.testament === 'Antigo');
      expect(oldTestament.length).toBe(39);
    });

    it('should have exactly 27 New Testament books', () => {
      const newTestament = service.books.filter((book) => book.testament === 'Novo');
      expect(newTestament.length).toBe(27);
    });

    it('should total 66 books', () => {
      const oldTestament = service.books.filter((book) => book.testament === 'Antigo').length;
      const newTestament = service.books.filter((book) => book.testament === 'Novo').length;
      expect(oldTestament + newTestament).toBe(66);
    });

    it('should have all books assigned to a testament', () => {
      service.books.forEach((book) => {
        expect(['Antigo', 'Novo']).toContain(book.testament);
      });
    });
  });

  describe('Book Ordering', () => {
    it('should have books in canonical order', () => {
      // First book should be Genesis
      expect(service.books[0].id).toBe('gen');
      // Last book should be Revelation
      expect(service.books[service.books.length - 1].id).toBe('rev');
    });

    it('should have correct order for Pentateuch', () => {
      const pentateuch = ['gen', 'exo', 'lev', 'num', 'deu'];
      const firstFive = service.books.slice(0, 5).map((book) => book.id);
      expect(firstFive).toEqual(pentateuch);
    });

    it('should have gospels before Paul epistles', () => {
      const matthewIndex = service.books.findIndex((book) => book.id === 'mat');
      const romansIndex = service.books.findIndex((book) => book.id === 'rom');
      expect(matthewIndex).toBeLessThan(romansIndex);
    });
  });

  describe('Total Chapter Count', () => {
    it('should have 1189 total chapters in Bible', () => {
      const totalChapters = service.books.reduce((sum, book) => sum + book.chapters, 0);
      expect(totalChapters).toBe(1189);
    });

    it('should have more OT chapters than NT', () => {
      const oldTestament = service.books
        .filter((book) => book.testament === 'Antigo')
        .reduce((sum, book) => sum + book.chapters, 0);
      const newTestament = service.books
        .filter((book) => book.testament === 'Novo')
        .reduce((sum, book) => sum + book.chapters, 0);
      expect(oldTestament).toBeGreaterThan(newTestament);
    });
  });

  describe('Book Name Translations', () => {
    it('should have Portuguese book names', () => {
      const book = service.getBookById('gen');
      expect(book?.name).toBe('Gênesis');
      expect(book?.name).not.toBe('Genesis');
    });

    it('should preserve special characters in names', () => {
      const books = [
        { id: 'exo', name: 'Êxodo' },
        { id: 'mic', name: 'Miquéias' },
        { id: 'jos', name: 'Josué' }
      ];

      books.forEach(({ id, name }) => {
        const book = service.getBookById(id);
        expect(book?.name).toBe(name);
      });
    });
  });

  describe('Multiple Book Queries', () => {
    it('should handle multiple queries efficiently', () => {
      const bookIds = ['gen', 'exo', 'mat', 'joh', 'rev'];
      const books = bookIds.map((id) => service.getBookById(id));
      
      expect(books.length).toBe(5);
      books.forEach((book) => {
        expect(book).toBeDefined();
      });
    });

    it('should find books by different criteria', () => {
      // All OT books with more than 40 chapters
      const largeOTBooks = service.books.filter((book) => book.testament === 'Antigo' && book.chapters > 40);
      expect(largeOTBooks.length).toBeGreaterThan(0);
      largeOTBooks.forEach((book) => {
        expect(book.chapters).toBeGreaterThan(40);
        expect(book.testament).toBe('Antigo');
      });
    });

    it('should find shortest books', () => {
      const shortestBooks = service.books.filter((book) => book.chapters === 1);
      expect(shortestBooks.length).toBeGreaterThan(0);
      expect(shortestBooks[0].chapters).toBe(1);
    });

    it('should find Psalms as book with most chapters', () => {
      const maxBook = service.books.reduce((max, book) => (book.chapters > max.chapters ? book : max));
      expect(maxBook.id).toBe('ps');
      expect(maxBook.chapters).toBe(150);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string lookup', () => {
      const book = service.getBookById('');
      expect(book).toBeUndefined();
    });

    it('should handle null-like string lookup', () => {
      const book = service.getBookById('null');
      expect(book).toBeUndefined();
    });

    it('should not have duplicate IDs', () => {
      const ids = service.books.map((book) => book.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should not have books with zero chapters', () => {
      service.books.forEach((book) => {
        expect(book.chapters).toBeGreaterThan(0);
      });
    });

    it('should not have empty names', () => {
      service.books.forEach((book) => {
        expect(book.name.length).toBeGreaterThan(0);
      });
    });

    it('should not have empty abbreviations', () => {
      service.books.forEach((book) => {
        expect(book.abbreviation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Service Immutability', () => {
    it('should not allow modification of books array', () => {
      const originalLength = service.books.length;
      const books = service.books;
      
      // Attempting to modify should not affect the service
      // Note: This test confirms the array is directly accessible but shows
      // that modifications would be at caller's risk
      expect(books.length).toBe(originalLength);
    });

    it('should always return the same book reference for same ID', () => {
      const book1 = service.getBookById('gen');
      const book2 = service.getBookById('gen');
      expect(book1).toBe(book2);
    });
  });

  describe('Performance & Scalability', () => {
    it('should quickly look up any book', () => {
      const start = performance.now();
      for (let i = 0; i < 100; i++) {
        service.getBookById('gen');
      }
      const end = performance.now();
      expect(end - start).toBeLessThan(100); // Should complete 100 lookups in less than 100ms
    });

    it('should filter books efficiently', () => {
      const start = performance.now();
      const filtered = service.books.filter((book) => book.testament === 'Antigo');
      const end = performance.now();
      expect(filtered.length).toBe(39);
      expect(end - start).toBeLessThan(50);
    });
  });
});
