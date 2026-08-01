import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BackupComponent } from './backup.component';
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

describe('BackupComponent', () => {
  let component: BackupComponent;
  let fixture: ComponentFixture<BackupComponent>;
  let storageService: StorageService;
  let i18nService: I18nService;
  let snackbarSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [BackupComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(BackupComponent);
    component = fixture.componentInstance;
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

    it('should initialize with backup data on creation', () => {
      expect(component.backupData).toBeTruthy();
    });

    it('should initialize with empty import error', () => {
      expect(component.importError).toBe('');
    });

    it('should export data on initialization', () => {
      const data = component.backupData;
      const parsed = JSON.parse(data);
      expect(parsed).toBeDefined();
      expect(parsed.progress).toBeDefined();
      expect(parsed.settings).toBeDefined();
      expect(parsed.history).toBeDefined();
    });
  });

  describe('Export Functionality', () => {
    it('should export backup data', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      component.exportBackup();
      
      expect(component.backupData).toBeTruthy();
      const parsed = JSON.parse(component.backupData);
      expect(parsed.progress).toBeDefined();
    });

    it('should export valid JSON format', () => {
      component.exportBackup();
      
      expect(() => JSON.parse(component.backupData)).not.toThrow();
    });

    it('should include progress in export', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      component.exportBackup();
      
      const parsed = JSON.parse(component.backupData);
      expect(parsed.progress).toBeDefined();
      expect(parsed.progress.length).toBeGreaterThan(0);
    });

    it('should include settings in export', () => {
      component.exportBackup();
      
      const parsed = JSON.parse(component.backupData);
      expect(parsed.settings).toBeDefined();
      expect(parsed.settings.theme).toBeTruthy();
    });

    it('should include history in export', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      component.exportBackup();
      
      const parsed = JSON.parse(component.backupData);
      expect(parsed.history).toBeDefined();
    });

    it('should include settings mask in export', () => {
      component.exportBackup();
      
      const parsed = JSON.parse(component.backupData);
      expect(parsed.settingsMask).toBeDefined();
    });

    it('should show snackbar confirmation on export', () => {
      component.exportBackup();
      
      expect(snackbarSpy).toHaveBeenCalled();
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().backup.exported);
    });

    it('should update backup data on export', () => {
      const initialData = component.backupData;
      
      storageService.toggleChapter(TEST_BOOK, 1);
      component.exportBackup();
      
      const updatedData = component.backupData;
      expect(updatedData).not.toBe(initialData);
    });

    it('should include close button in snackbar', () => {
      component.exportBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[1]).toBe(i18nService.t().common.close);
    });

    it('should have snackbar duration', () => {
      component.exportBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      const options = args[2];
      expect(options.duration).toBeGreaterThan(0);
    });
  });

  describe('Import Functionality', () => {
    it('should import valid backup data', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      storageService.updateSettings({ theme: 'dark' });
      const exported = storageService.export();
      
      // Clear everything
      storageService.clear();
      expect(storageService.progressSignal().size).toBe(0);
      
      // Import
      component.backupData = exported;
      component.importBackup();
      
      expect(storageService.progressSignal().size).toBeGreaterThan(0);
      expect(storageService.settingsSignal().theme).toBe('dark');
    });

    it('should clear import error on successful import', () => {
      const validData = storageService.export();
      
      component.importError = 'Some error';
      component.backupData = validData;
      component.importBackup();
      
      expect(component.importError).toBe('');
    });

    it('should show success snackbar on import', () => {
      const validData = storageService.export();
      component.backupData = validData;
      
      component.importBackup();
      
      expect(snackbarSpy).toHaveBeenCalled();
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().backup.restored);
    });

    it('should handle invalid JSON on import', () => {
      component.backupData = 'invalid json {]';
      component.importBackup();
      
      expect(component.importError).toBe(i18nService.t().backup.invalidBackup);
    });

    it('should handle non-object import data', () => {
      component.backupData = '"just a string"';
      component.importBackup();
      
      expect(component.importError).toBe(i18nService.t().backup.invalidBackup);
    });

    it('should set import error message on failure', () => {
      component.backupData = 'invalid';
      component.importBackup();
      
      expect(component.importError).toBeTruthy();
      expect(component.importError).toBe(i18nService.t().backup.invalidBackup);
    });

    it('should not show success snackbar on import error', () => {
      snackbarSpy.calls.reset();
      component.backupData = 'invalid';
      
      component.importBackup();
      
      expect(snackbarSpy).not.toHaveBeenCalled();
    });

    it('should persist imported data', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const exported = storageService.export();
      
      storageService.clear();
      component.backupData = exported;
      component.importBackup();
      
      const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      expect(saved.progress.length).toBeGreaterThan(0);
    });

    it('should handle empty backup data', () => {
      const emptyBackup = JSON.stringify({
        progress: [],
        settings: null,
        settingsMask: 0,
        history: []
      });
      
      component.backupData = emptyBackup;
      component.importBackup();
      
      expect(component.importError).toBe('');
    });
  });

  describe('Backup Data Format', () => {
    it('should export with proper structure', () => {
      const exported = storageService.export();
      const parsed = JSON.parse(exported);
      
      expect('progress' in parsed).toBe(true);
      expect('settings' in parsed).toBe(true);
      expect('history' in parsed).toBe(true);
      expect('settingsMask' in parsed).toBe(true);
    });

    it('should have array of progress entries', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const exported = storageService.export();
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed.progress)).toBe(true);
    });

    it('should have settings object', () => {
      const exported = storageService.export();
      const parsed = JSON.parse(exported);
      
      expect(typeof parsed.settings).toBe('object');
      expect(parsed.settings.theme).toBeTruthy();
    });

    it('should have history array', () => {
      storageService.toggleChapter(TEST_BOOK, 1);
      const exported = storageService.export();
      const parsed = JSON.parse(exported);
      
      expect(Array.isArray(parsed.history)).toBe(true);
    });

    it('should preserve chapter details in export', () => {
      storageService.toggleChapter(TEST_BOOK, 1, 'Test note');
      const exported = storageService.export();
      const parsed = JSON.parse(exported);
      
      const entry = parsed.progress[0];
      expect(entry.bookId).toBe('gen');
      expect(entry.chapterNumber).toBe(1);
      expect(entry.notes).toBe('Test note');
    });

    it('should preserve settings in export', () => {
      storageService.updateSettings({ theme: 'dark', fontSize: 20, language: 'en' });
      const exported = storageService.export();
      const parsed = JSON.parse(exported);
      
      expect(parsed.settings.theme).toBe('dark');
      expect(parsed.settings.fontSize).toBe(20);
      expect(parsed.settings.language).toBe('en');
    });
  });

  describe('Error Handling', () => {
    it('should handle null backup data gracefully', () => {
      component.backupData = 'null';
      component.importBackup();
      
      expect(component.importError).toBe(i18nService.t().backup.invalidBackup);
    });

    it('should handle undefined in backup data', () => {
      component.backupData = 'undefined';
      component.importBackup();
      
      expect(component.importError).toBe(i18nService.t().backup.invalidBackup);
    });

    it('should handle corrupted JSON', () => {
      component.backupData = '{"progress": [{"id": "gen:1", "bookId"';
      component.importBackup();
      
      expect(component.importError).toBe(i18nService.t().backup.invalidBackup);
    });

    it('should display user-friendly error message', () => {
      component.backupData = 'invalid data';
      component.importBackup();
      
      expect(component.importError).toBe(i18nService.t().backup.invalidBackup);
    });

    it('should not throw on invalid import', () => {
      expect(() => {
        component.backupData = 'invalid';
        component.importBackup();
      }).not.toThrow();
    });
  });

  describe('Round Trip Testing', () => {
    it('should export and import without data loss', () => {
      // Setup test data
      storageService.toggleChapter(TEST_BOOK, 1, 'Chapter 1');
      storageService.toggleChapter(TEST_BOOK, 2, 'Chapter 2');
      storageService.updateSettings({ theme: 'dark', fontSize: 20 });
      
      const exported = storageService.export();
      
      // Clear and import
      storageService.clear();
      component.backupData = exported;
      component.importBackup();
      
      // Verify
      expect(storageService.progressSignal().size).toBe(2);
      expect(storageService.settingsSignal().theme).toBe('dark');
      expect(storageService.settingsSignal().fontSize).toBe(20);
    });

    it('should handle multiple export/import cycles', () => {
      for (let i = 0; i < 3; i++) {
        storageService.toggleChapter(TEST_BOOK, i + 1);
      }
      
      const exported1 = storageService.export();
      
      component.backupData = exported1;
      component.exportBackup();
      
      const exported2 = component.backupData;
      
      const parsed1 = JSON.parse(exported1);
      const parsed2 = JSON.parse(exported2);
      
      expect(parsed1.progress.length).toBe(parsed2.progress.length);
    });
  });

  describe('Integration with Services', () => {
    it('should use StorageService for export', () => {
      spyOn(storageService, 'export').and.callThrough();
      
      component.exportBackup();
      
      expect(storageService.export).toHaveBeenCalled();
    });

    it('should use StorageService for import', () => {
      spyOn(storageService, 'import').and.callThrough();
      
      const validData = storageService.export();
      component.backupData = validData;
      component.importBackup();
      
      expect(storageService.import).toHaveBeenCalled();
    });

    it('should use I18nService for messages', () => {
      component.exportBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().backup.exported);
    });
  });

  describe('UI State Management', () => {
    it('should update backup data property on export', () => {
      const initialData = component.backupData;
      
      storageService.toggleChapter(TEST_BOOK, 1);
      component.exportBackup();
      
      expect(component.backupData).not.toBe(initialData);
    });

    it('should clear import error after successful import', () => {
      component.importError = 'Previous error';
      const validData = storageService.export();
      
      component.backupData = validData;
      component.importBackup();
      
      expect(component.importError).toBe('');
    });

    it('should set import error on failed import', () => {
      component.importError = '';
      component.backupData = 'invalid';
      
      component.importBackup();
      
      expect(component.importError).not.toBe('');
    });
  });

  describe('Snackbar Notifications', () => {
    it('should include export message in snackbar', () => {
      component.exportBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().backup.exported);
    });

    it('should include import message in snackbar', () => {
      const validData = storageService.export();
      component.backupData = validData;
      
      component.importBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().backup.restored);
    });

    it('should include close action button', () => {
      component.exportBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[1]).toBe(i18nService.t().common.close);
    });

    it('should have snackbar duration on export', () => {
      component.exportBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[2].duration).toBe(1600);
    });

    it('should have snackbar duration on import', () => {
      const validData = storageService.export();
      component.backupData = validData;
      
      component.importBackup();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[2].duration).toBe(1600);
    });
  });

  describe('Large Data Handling', () => {
    it('should handle large backup data', () => {
      // Add many entries
      for (let i = 1; i <= 50; i++) {
        storageService.toggleChapter(TEST_BOOK, i);
      }
      
      component.exportBackup();
      
      expect(component.backupData.length).toBeGreaterThan(0);
      expect(() => JSON.parse(component.backupData)).not.toThrow();
    });

    it('should import large backup data', () => {
      // Add many entries
      for (let i = 1; i <= 50; i++) {
        storageService.toggleChapter(TEST_BOOK, i);
      }
      
      const exported = storageService.export();
      storageService.clear();
      
      component.backupData = exported;
      component.importBackup();
      
      expect(storageService.progressSignal().size).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty backup', () => {
      storageService.clear();
      component.exportBackup();
      
      const parsed = JSON.parse(component.backupData);
      expect(parsed.progress).toEqual([]);
      expect(parsed.history).toEqual([]);
    });

    it('should handle backup with only settings', () => {
      storageService.clear();
      storageService.updateSettings({ theme: 'dark' });
      
      component.exportBackup();
      
      const parsed = JSON.parse(component.backupData);
      expect(parsed.settings.theme).toBe('dark');
    });

    it('should handle special characters in notes', () => {
      storageService.toggleChapter(TEST_BOOK, 1, '\\n\\t\\"quotes\\"');
      component.exportBackup();
      
      const parsed = JSON.parse(component.backupData);
      expect(parsed.progress[0].notes).toContain('quotes');
    });
  });
});
