import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { BackupComponent } from './backup.component';
import { StorageService } from '../../core/services/storage.service';
import { BibleDataService } from '../../core/services/bible-data.service';

describe('BackupComponent', () => {
  let storageService: StorageService;
  let bibleDataService: BibleDataService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [BackupComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
    storageService = TestBed.inject(StorageService);
    bibleDataService = TestBed.inject(BibleDataService);
  });

  it('loads the current backup data on creation', () => {
    const genesis = bibleDataService.getBookById('gen')!;
    storageService.toggleChapter(genesis, 1);

    const fixture = TestBed.createComponent(BackupComponent);

    expect(fixture.componentInstance.backupData).toBe(storageService.export());
    expect(fixture.componentInstance.backupData).toContain('gen');
  });

  describe('exportBackup', () => {
    it('refreshes backupData with the latest export', () => {
      const fixture = TestBed.createComponent(BackupComponent);
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);

      fixture.componentInstance.exportBackup();

      expect(fixture.componentInstance.backupData).toBe(storageService.export());
    });
  });

  describe('importBackup', () => {
    it('imports valid backup data and clears any previous error', () => {
      const genesis = bibleDataService.getBookById('gen')!;
      storageService.toggleChapter(genesis, 1);
      const validBackup = storageService.export();
      storageService.clear();

      const fixture = TestBed.createComponent(BackupComponent);
      fixture.componentInstance.importError = 'stale error';
      fixture.componentInstance.backupData = validBackup;

      fixture.componentInstance.importBackup();

      expect(fixture.componentInstance.importError).toBe('');
      expect(storageService.getBookProgress(genesis).completedChapters).toBe(1);
    });

    it('sets a translated error message for invalid backup data', () => {
      const fixture = TestBed.createComponent(BackupComponent);
      const component = fixture.componentInstance;
      component.backupData = 'not valid json';

      component.importBackup();

      expect(component.importError).toBe(component.i18n.t().backup.invalidBackup);
    });
  });
});
