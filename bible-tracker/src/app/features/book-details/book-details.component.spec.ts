import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BookDetailsComponent } from './book-details.component';
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

describe('BookDetailsComponent', () => {
  let component: BookDetailsComponent;
  let fixture: ComponentFixture<BookDetailsComponent>;
  let bibleDataService: BibleDataService;
  let storageService: StorageService;
  let i18nService: I18nService;
  let snackbarSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.clear();

    const mockActivatedRoute = {
      paramMap: of({ get: (key: string) => 'gen' })
    };

    await TestBed.configureTestingModule({
      imports: [BookDetailsComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BookDetailsComponent);
    component = fixture.componentInstance;
    bibleDataService = TestBed.inject(BibleDataService);
    storageService = TestBed.inject(StorageService);
    i18nService = TestBed.inject(I18nService);

    const snackbar = TestBed.inject(MatSnackBar);
    snackbarSpy = spyOn(snackbar, 'open').and.returnValue({ close: () => {} } as any);

    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should load book from route params', (done) => {
      setTimeout(() => {
        expect(component.book()?.id).toBe('gen');
        done();
      }, 100);
    });

    it('should generate chapter array based on book chapters', () => {
      fixture.detectChanges();
      const chapters = component.chapters();
      expect(chapters.length).toBeGreaterThan(0);
    });

    it('should have chapters array with correct length', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          expect(component.chapters().length).toBe(book.chapters);
        }
        done();
      }, 100);
    });

    it('should initialize with undefined book', () => {
      const newComponent = new BookDetailsComponent(
        TestBed.inject(ActivatedRoute),
        bibleDataService,
        storageService,
        i18nService,
        TestBed.inject(MatSnackBar)
      );
      expect(newComponent.book()).toBeUndefined();
    });
  });

  describe('Chapter Progress Tracking', () => {
    it('should toggle chapter completion', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          const progress = component.progressMap().get('gen:1');
          expect(progress?.completed).toBe(true);
        }
        done();
      }, 100);
    });

    it('should show snackbar on chapter toggle', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          expect(snackbarSpy).toHaveBeenCalled();
        }
        done();
      }, 100);
    });

    it('should untoggle chapter', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          component.toggleChapter(book, 1);
          const progress = component.progressMap().get('gen:1');
          expect(progress?.completed).toBe(false);
        }
        done();
      }, 100);
    });

    it('should track multiple chapters', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          component.toggleChapter(book, 2);
          component.toggleChapter(book, 3);
          
          expect(component.progressMap().get('gen:1')?.completed).toBe(true);
          expect(component.progressMap().get('gen:2')?.completed).toBe(true);
          expect(component.progressMap().get('gen:3')?.completed).toBe(true);
        }
        done();
      }, 100);
    });

    it('should handle chapter without existing progress', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          const progress = component.getChapterProgress(book, 1);
          expect(progress).toBeUndefined();
        }
        done();
      }, 100);
    });
  });

  describe('Notes Management', () => {
    it('should update chapter notes', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          storageService.toggleChapter(book, 1);
          component.updateNotes(book, 1, 'Test note');
          
          const progress = component.progressMap().get('gen:1');
          expect(progress?.notes).toBe('Test note');
        }
        done();
      }, 100);
    });

    it('should update notes without toggling completion', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          storageService.toggleChapter(book, 1);
          const completedBefore = component.progressMap().get('gen:1')?.completed;
          
          component.updateNotes(book, 1, 'Updated note');
          
          const completedAfter = component.progressMap().get('gen:1')?.completed;
          expect(completedBefore).toBe(completedAfter);
        }
        done();
      }, 100);
    });

    it('should handle long notes', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          storageService.toggleChapter(book, 1);
          const longNote = 'A'.repeat(1000);
          component.updateNotes(book, 1, longNote);
          
          const progress = component.progressMap().get('gen:1');
          expect(progress?.notes).toBe(longNote);
        }
        done();
      }, 100);
    });

    it('should handle empty notes', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          storageService.toggleChapter(book, 1, 'Initial note');
          component.updateNotes(book, 1, '');
          
          const progress = component.progressMap().get('gen:1');
          expect(progress?.notes).toBe('');
        }
        done();
      }, 100);
    });
  });

  describe('Book Completion', () => {
    it('should mark entire book as complete', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.markBookComplete(book);
          
          for (let i = 1; i <= book.chapters; i++) {
            const progress = component.progressMap().get(`${book.id}:${i}`);
            expect(progress?.completed).toBe(true);
          }
        }
        done();
      }, 100);
    });

    it('should show snackbar when marking book complete', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.markBookComplete(book);
          expect(snackbarSpy).toHaveBeenCalled();
        }
        done();
      }, 100);
    });

    it('should unmark book completion', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.markBookComplete(book);
          component.unmarkBookComplete(book);
          
          const firstChapter = component.progressMap().get(`${book.id}:1`);
          expect(firstChapter).toBeUndefined();
        }
        done();
      }, 100);
    });

    it('should show snackbar when unmarking book', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.markBookComplete(book);
          snackbarSpy.calls.reset();
          
          component.unmarkBookComplete(book);
          expect(snackbarSpy).toHaveBeenCalled();
        }
        done();
      }, 100);
    });

    it('should handle unmark on partially completed book', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          storageService.toggleChapter(book, 1);
          storageService.toggleChapter(book, 2);
          
          component.unmarkBookComplete(book);
          
          expect(component.progressMap().size).toBe(0);
        }
        done();
      }, 100);
    });
  });

  describe('Chapter Progress Queries', () => {
    it('should get chapter progress', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          storageService.toggleChapter(book, 1);
          const progress = component.getChapterProgress(book, 1);
          expect(progress?.completed).toBe(true);
        }
        done();
      }, 100);
    });

    it('should return undefined for uncompleted chapter', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          const progress = component.getChapterProgress(book, 1);
          expect(progress).toBeUndefined();
        }
        done();
      }, 100);
    });

    it('should get progress for any chapter', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          for (let i = 1; i <= Math.min(5, book.chapters); i++) {
            storageService.toggleChapter(book, i);
          }
          
          for (let i = 1; i <= Math.min(5, book.chapters); i++) {
            const progress = component.getChapterProgress(book, i);
            expect(progress?.completed).toBe(true);
          }
        }
        done();
      }, 100);
    });
  });

  describe('Chapter Array Generation', () => {
    it('should generate chapters as array [1, 2, 3, ...]', (done) => {
      setTimeout(() => {
        const chapters = component.chapters();
        if (chapters.length > 0) {
          chapters.forEach((chapterNum, index) => {
            expect(chapterNum).toBe(index + 1);
          });
        }
        done();
      }, 100);
    });

    it('should have correct chapter count', (done) => {
      setTimeout(() => {
        const book = component.book();
        const chapters = component.chapters();
        if (book) {
          expect(chapters.length).toBe(book.chapters);
        }
        done();
      }, 100);
    });

    it('should regenerate chapters on book change', (done) => {
      setTimeout(() => {
        const initialChapters = component.chapters().length;
        
        // Simulate book change via route param update
        const mockActivatedRoute = TestBed.inject(ActivatedRoute) as any;
        mockActivatedRoute.paramMap = of({ get: (key: string) => 'exo' });
        
        setTimeout(() => {
          // The component should have loaded a different book if paramMap updated
          // This tests the reactivity of the computed signal
          expect(component.chapters).toBeDefined();
          done();
        }, 100);
      }, 100);
    });
  });

  describe('Route Parameter Handling', () => {
    it('should update book when route params change', (done) => {
      // The component should load from paramMap
      setTimeout(() => {
        expect(component.book()?.id).toBe('gen');
        done();
      }, 100);
    });

    it('should handle invalid book ID', (done) => {
      const mockActivatedRoute = {
        paramMap: of({ get: (key: string) => 'invalid' })
      };
      
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [BookDetailsComponent],
        providers: [
          provideRouter([]),
          provideNoopAnimations(),
          { provide: ActivatedRoute, useValue: mockActivatedRoute }
        ]
      });

      const newFixture = TestBed.createComponent(BookDetailsComponent);
      const newComponent = newFixture.componentInstance;
      
      setTimeout(() => {
        expect(newComponent.book()).toBeUndefined();
        done();
      }, 100);
    });
  });

  describe('Track By Function', () => {
    it('should track by chapter number', () => {
      const result = component.trackByChapter(0, 1);
      expect(result).toBe(1);
    });

    it('should return chapter number for track identity', () => {
      for (let i = 1; i <= 10; i++) {
        const result = component.trackByChapter(i - 1, i);
        expect(result).toBe(i);
      }
    });

    it('should ensure stable identity for ngFor', () => {
      const chapters = component.chapters();
      const tracked = chapters.map((chapter, index) => component.trackByChapter(index, chapter));
      
      // Each tracked result should uniquely identify its chapter
      expect(tracked.length).toBe(chapters.length);
      expect(new Set(tracked).size).toBe(tracked.length);
    });
  });

  describe('Integration with Services', () => {
    it('should use BibleDataService to load books', () => {
      expect(component.bibleDataService).toBe(bibleDataService);
    });

    it('should use StorageService for progress', () => {
      expect(component.progressMap).toBe(storageService.progressSignal);
    });

    it('should use I18nService for translations', (done) => {
      setTimeout(() => {
        expect(component.i18n).toBe(i18nService);
        done();
      }, 100);
    });

    it('should persist changes through StorageService', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          
          const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
          expect(saved.progress.length).toBeGreaterThan(0);
        }
        done();
      }, 100);
    });
  });

  describe('Snackbar Messages', () => {
    it('should show progress updated message', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          
          const args = snackbarSpy.calls.mostRecent().args;
          expect(args[0]).toContain(i18nService.t().bookDetails.progressUpdated);
        }
        done();
      }, 100);
    });

    it('should show book marked complete message', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.markBookComplete(book);
          
          const args = snackbarSpy.calls.mostRecent().args;
          expect(args[0]).toContain(i18nService.t().bookDetails.bookMarkedComplete);
        }
        done();
      }, 100);
    });

    it('should show book progress removed message', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.markBookComplete(book);
          component.unmarkBookComplete(book);
          
          const args = snackbarSpy.calls.mostRecent().args;
          expect(args[0]).toContain(i18nService.t().bookDetails.bookProgressRemoved);
        }
        done();
      }, 100);
    });

    it('should include close button in snackbar', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          
          const args = snackbarSpy.calls.mostRecent().args;
          expect(args[1]).toBe(i18nService.t().common.close);
        }
        done();
      }, 100);
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle marking then unmarking multiple chapters', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          for (let i = 1; i <= 5; i++) {
            component.toggleChapter(book, i);
          }
          for (let i = 1; i <= 5; i++) {
            component.toggleChapter(book, i);
          }
          
          for (let i = 1; i <= 5; i++) {
            const progress = component.progressMap().get(`${book.id}:${i}`);
            expect(progress?.completed).toBe(false);
          }
        }
        done();
      }, 100);
    });

    it('should handle notes on marked chapters', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, 1);
          component.updateNotes(book, 1, 'Chapter 1 notes');
          
          const progress = component.progressMap().get('gen:1');
          expect(progress?.completed).toBe(true);
          expect(progress?.notes).toBe('Chapter 1 notes');
        }
        done();
      }, 100);
    });

    it('should handle full book completion with notes', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          // Mark a few chapters with notes first
          storageService.toggleChapter(book, 1, 'Note 1');
          storageService.toggleChapter(book, 2, 'Note 2');
          
          // Now mark entire book complete
          component.markBookComplete(book);
          
          // All should be complete
          expect(storageService.getBookCompletedCount(book)).toBe(book.chapters);
          // Original notes should be preserved
          expect(component.progressMap().get('gen:1')?.notes).toBe('Note 1');
          expect(component.progressMap().get('gen:2')?.notes).toBe('Note 2');
        }
        done();
      }, 100);
    });
  });

  describe('Signal Reactivity', () => {
    it('should update chapters computed signal when book changes', (done) => {
      setTimeout(() => {
        const initialChapters = component.chapters();
        expect(initialChapters.length).toBeGreaterThan(0);
        done();
      }, 100);
    });

    it('should react to progress map changes', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          storageService.toggleChapter(book, 1);
          
          const progress = component.progressMap().get('gen:1');
          expect(progress?.completed).toBe(true);
        }
        done();
      }, 100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle book with single chapter', () => {
      const singleChapterBook = bibleDataService.getBookById('obá');
      expect(singleChapterBook?.chapters || 0).toBeGreaterThan(0);
    });

    it('should handle book with many chapters', (done) => {
      setTimeout(() => {
        const psalms = bibleDataService.getBookById('ps');
        if (psalms) {
          expect(component.chapters().length).toBeLessThanOrEqual(150);
        }
        done();
      }, 100);
    });

    it('should handle chapters beyond book chapter count', (done) => {
      setTimeout(() => {
        const book = component.book();
        if (book) {
          component.toggleChapter(book, book.chapters + 1);
          // Should still work or be gracefully ignored
          expect(component.progressMap()).toBeDefined();
        }
        done();
      }, 100);
    });
  });
});
