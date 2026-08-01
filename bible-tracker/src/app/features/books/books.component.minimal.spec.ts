import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BooksComponent } from './books.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';
import { I18nService } from '../../core/services/i18n.service';

describe('BooksComponent - Minimal', () => {
  let component: BooksComponent;
  let fixture: any;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BooksComponent],
      providers: [
        provideRouter([]),
        provideNoopAnimations(),
        StorageService,
        BibleDataService,
        I18nService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BooksComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render without errors', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement).toBeTruthy();
  });
});
