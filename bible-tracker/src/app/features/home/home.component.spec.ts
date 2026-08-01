import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';

describe('HomeComponent', () => {
  let storageService: StorageService;
  let bibleDataService: BibleDataService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [provideRouter([]), provideNoopAnimations()]
    }).compileComponents();
    storageService = TestBed.inject(StorageService);
    bibleDataService = TestBed.inject(BibleDataService);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exposes all books from BibleDataService', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    expect(fixture.componentInstance.books.length).toBe(bibleDataService.books.length);
  });

  describe('greeting', () => {
    // `greeting` is a computed signal with no reactive dependency on the clock, so it caches
    // its result on first read - each time slot needs its own fresh component instance.
    it('greets with "morning" text before noon', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2026, 0, 1, 8));
      const component = TestBed.createComponent(HomeComponent).componentInstance;
      expect(component.greeting()).toBe(component.i18n.t().home.greetingMorning);
      jasmine.clock().uninstall();
    });

    it('greets with "afternoon" text between noon and 6pm', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2026, 0, 1, 14));
      const component = TestBed.createComponent(HomeComponent).componentInstance;
      expect(component.greeting()).toBe(component.i18n.t().home.greetingAfternoon);
      jasmine.clock().uninstall();
    });

    it('greets with "evening" text after 6pm', () => {
      jasmine.clock().install();
      jasmine.clock().mockDate(new Date(2026, 0, 1, 20));
      const component = TestBed.createComponent(HomeComponent).componentInstance;
      expect(component.greeting()).toBe(component.i18n.t().home.greetingEvening);
      jasmine.clock().uninstall();
    });
  });

  describe('currentReading', () => {
    it('suggests the first pending book when there is no history yet', () => {
      const fixture = TestBed.createComponent(HomeComponent);
      const component = fixture.componentInstance;

      const reading = component.currentReading();
      expect(reading.book.id).toBe(bibleDataService.books[0].id);
      expect(reading.chapterNumber).toBe(1);
    });

    it('suggests the next chapter after the most recently read one', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);

      const fixture = TestBed.createComponent(HomeComponent);
      const reading = fixture.componentInstance.currentReading();

      expect(reading.book.id).toBe('gen');
      expect(reading.chapterNumber).toBe(2);
    });

    it('moves on to the next pending book once the current one is fully completed', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.markBookComplete(genesis);

      const fixture = TestBed.createComponent(HomeComponent);
      const reading = fixture.componentInstance.currentReading();

      expect(reading.book.id).not.toBe('gen');
    });
  });

  describe('streak / today stats', () => {
    it('starts at zero chapters/streak with no history', () => {
      const fixture = TestBed.createComponent(HomeComponent);
      const component = fixture.componentInstance;

      expect(component.streak()).toBe(0);
      expect(component.chaptersToday()).toBe(0);
      expect(component.readingMinutesToday()).toBe(0);
    });

    it('counts chapters completed today and estimates reading minutes', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);
      storageService.toggleChapter(genesis, 2);

      const fixture = TestBed.createComponent(HomeComponent);
      const component = fixture.componentInstance;

      expect(component.chaptersToday()).toBe(2);
      expect(component.readingMinutesToday()).toBe(8);
    });
  });

  describe('dailyVerse', () => {
    it('returns a verse from the current locale dictionary', () => {
      const fixture = TestBed.createComponent(HomeComponent);
      const component = fixture.componentInstance;
      const verse = component.dailyVerse();

      expect(component.i18n.t().home.dailyVerses).toContain(verse);
    });
  });

  describe('continueReading', () => {
    it('navigates to the suggested book', () => {
      const fixture = TestBed.createComponent(HomeComponent);
      const component = fixture.componentInstance;
      const router = TestBed.inject(Router);
      const navigateSpy = spyOn(router, 'navigate');

      component.continueReading();

      expect(navigateSpy).toHaveBeenCalledWith(['/book', component.currentReading().book.id]);
    });
  });
});
