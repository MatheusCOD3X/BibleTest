import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { HomeComponent } from './home.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';
import { I18nService } from '../../core/services/i18n.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: any;
  let storageService: StorageService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        StorageService,
        BibleDataService,
        I18nService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    storageService = TestBed.inject(StorageService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display greeting message', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const text = compiled.textContent || '';
    expect(text.length).toBeGreaterThan(0);
  });

  it('should initialize with empty progress', () => {
    expect(storageService.historySignal().length).toBe(0);
  });

  it('should update history when chapters are toggled', () => {
    const book = { id: 'gen', name: 'Gênesis', testament: 'Antigo', chapters: 50, abbreviation: 'Gn' };
    storageService.toggleChapter(book, 1);
    expect(storageService.historySignal().length).toBeGreaterThan(0);
  });
});
