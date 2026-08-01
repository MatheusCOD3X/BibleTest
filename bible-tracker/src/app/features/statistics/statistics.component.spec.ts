import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { StatisticsComponent } from './statistics.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';

// Note: we deliberately never call `fixture.detectChanges()` in this spec. Doing so would
// render the ng2-charts <canvas> elements bound in the template, which pulls in the real
// Chart.js rendering pipeline and isn't needed to validate the component's own logic - all
// the signals under test here are already computed in the constructor.
describe('StatisticsComponent', () => {
  let storageService: StorageService;
  let bibleDataService: BibleDataService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [StatisticsComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
    storageService = TestBed.inject(StorageService);
    bibleDataService = TestBed.inject(BibleDataService);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(StatisticsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('computes stats across all books', () => {
    const genesis = bibleDataService.getBookById('gen')!;
    storageService.toggleChapter(genesis, 1);

    const fixture = TestBed.createComponent(StatisticsComponent);
    const stats = fixture.componentInstance.stats();

    expect(stats.completedChapters).toBe(1);
    expect(stats.totalChapters).toBeGreaterThan(1000);
  });

  describe('progressByBook / topProgress / allProgressSorted', () => {
    it('lists one entry per book', () => {
      const fixture = TestBed.createComponent(StatisticsComponent);
      expect(fixture.componentInstance.progressByBook().length).toBe(bibleDataService.books.length);
    });

    it('sorts topProgress descending and caps at 8 entries', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.markBookComplete(genesis);

      const fixture = TestBed.createComponent(StatisticsComponent);
      const top = fixture.componentInstance.topProgress();

      expect(top.length).toBeLessThanOrEqual(8);
      expect(top[0].book.id).toBe('gen');
      expect(top[0].progress.progressPercent).toBe(100);
    });

    it('allProgressSorted includes every book, sorted descending by progress', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.markBookComplete(genesis);

      const fixture = TestBed.createComponent(StatisticsComponent);
      const all = fixture.componentInstance.allProgressSorted();

      expect(all.length).toBe(bibleDataService.books.length);
      expect(all[0].book.id).toBe('gen');
    });
  });

  describe('chart data', () => {
    it('progressChartData reflects completed vs remaining chapters', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);

      const fixture = TestBed.createComponent(StatisticsComponent);
      const data = fixture.componentInstance.progressChartData();

      expect(data.datasets[0].data[0]).toBe(1);
    });

    it('monthlyChartData groups history entries by month, most recent 6 months', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);

      const fixture = TestBed.createComponent(StatisticsComponent);
      const data = fixture.componentInstance.monthlyChartData();

      expect(data.labels!.length).toBeGreaterThan(0);
      expect(data.datasets[0].data.reduce((sum, value) => sum + value, 0)).toBe(1);
    });

    it('byBookChartData mirrors topProgress book names and percentages', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.markBookComplete(genesis);

      const fixture = TestBed.createComponent(StatisticsComponent);
      const component = fixture.componentInstance;
      const data = component.byBookChartData();

      expect(data.labels).toEqual(component.topProgress().map((item) => component.i18n.translateBookName(item.book)));
      expect(data.datasets[0].data).toEqual(component.topProgress().map((item) => item.progress.progressPercent));
    });
  });

  describe('getBookName', () => {
    it('returns the translated name for a known book', () => {
      const fixture = TestBed.createComponent(StatisticsComponent);
      expect(fixture.componentInstance.getBookName('gen')).toBe('Gênesis');
    });

    it('returns the unknown-book label for an unrecognized id', () => {
      const fixture = TestBed.createComponent(StatisticsComponent);
      const component = fixture.componentInstance;
      expect(component.getBookName('does-not-exist')).toBe(component.i18n.t().common.unknownBook);
    });
  });
});
