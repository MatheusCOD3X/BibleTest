import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BehaviorSubject } from 'rxjs';
import { BookDetailsComponent } from './book-details.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';

describe('BookDetailsComponent', () => {
  let storageService: StorageService;
  let bibleDataService: BibleDataService;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  function createComponent(id = 'gen') {
    // The subscription in the component's constructor reads the BehaviorSubject's current
    // value synchronously, so setting it right before creating the component simulates
    // navigating straight to that route.
    paramMap$.next(convertToParamMap({ id }));
    return TestBed.createComponent(BookDetailsComponent);
  }

  beforeEach(async () => {
    localStorage.clear();
    paramMap$ = new BehaviorSubject(convertToParamMap({ id: 'gen' }));
    await TestBed.configureTestingModule({
      imports: [BookDetailsComponent],
      providers: [provideNoopAnimations(), { provide: ActivatedRoute, useValue: { paramMap: paramMap$ } }]
    }).compileComponents();
    storageService = TestBed.inject(StorageService);
    bibleDataService = TestBed.inject(BibleDataService);
  });

  it('loads the book matching the route id param', () => {
    const fixture = createComponent('gen');
    const component = fixture.componentInstance;

    expect(component.book()?.id).toBe('gen');
    expect(component.chapters().length).toBe(50);
    expect(component.chapters()[0]).toBe(1);
  });

  it('reacts to route param changes without recreating the component', () => {
    const fixture = createComponent('gen');
    const component = fixture.componentInstance;
    expect(component.book()?.id).toBe('gen');

    paramMap$.next(convertToParamMap({ id: 'exo' }));

    expect(component.book()?.id).toBe('exo');
    expect(component.chapters().length).toBe(40);
  });

  it('leaves book undefined for an unknown id', () => {
    const fixture = createComponent('not-a-book');
    expect(fixture.componentInstance.book()).toBeUndefined();
  });

  describe('getChapterProgress', () => {
    it('returns undefined when a chapter has no progress yet', () => {
      const fixture = createComponent('gen');
      const genesis = bibleDataService.getBookById('gen')!;
      expect(fixture.componentInstance.getChapterProgress(genesis, 1)).toBeUndefined();
    });

    it('returns the progress entry after toggling a chapter', () => {
      const fixture = createComponent('gen');
      const genesis = bibleDataService.getBookById('gen')!;
      fixture.componentInstance.toggleChapter(genesis, 1);

      expect(fixture.componentInstance.getChapterProgress(genesis, 1)?.completed).toBeTrue();
    });
  });

  describe('toggleChapter', () => {
    it('delegates to StorageService.toggleChapter', () => {
      const fixture = createComponent('gen');
      const genesis = bibleDataService.getBookById('gen')!;
      const spy = spyOn(storageService, 'toggleChapter').and.callThrough();

      fixture.componentInstance.toggleChapter(genesis, 3);

      expect(spy).toHaveBeenCalledWith(genesis, 3);
    });
  });

  describe('updateNotes', () => {
    it('delegates to StorageService.updateNotes', () => {
      const fixture = createComponent('gen');
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);
      const spy = spyOn(storageService, 'updateNotes').and.callThrough();

      fixture.componentInstance.updateNotes(genesis, 1, 'minhas notas');

      expect(spy).toHaveBeenCalledWith(genesis, 1, 'minhas notas');
    });
  });

  describe('markBookComplete / unmarkBookComplete', () => {
    it('marks every chapter of the book as complete', () => {
      const fixture = createComponent('gen');
      const genesis = bibleDataService.getBookById('gen')!;

      fixture.componentInstance.markBookComplete(genesis);

      expect(storageService.isBookCompleted(genesis)).toBeTrue();
    });

    it('clears the progress for the book', () => {
      const fixture = createComponent('gen');
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.markBookComplete(genesis);

      fixture.componentInstance.unmarkBookComplete(genesis);

      expect(storageService.isBookCompleted(genesis)).toBeFalse();
    });
  });

  describe('trackByChapter', () => {
    it('returns the chapter number', () => {
      const fixture = createComponent('gen');
      expect(fixture.componentInstance.trackByChapter(0, 7)).toBe(7);
    });
  });
});
