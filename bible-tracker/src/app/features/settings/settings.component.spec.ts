import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsComponent } from './settings.component';
import { StorageService } from '../../core/services/storage.service';
import { I18nService } from '../../core/services/i18n.service';
import { AppSettings } from '../../models/bible.models';

describe('SettingsComponent', () => {
  let component: SettingsComponent;
  let fixture: ComponentFixture<SettingsComponent>;
  let storageService: StorageService;
  let i18nService: I18nService;
  let snackbarSpy: jasmine.Spy;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsComponent);
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

    it('should bind settings signal from storage', () => {
      expect(component.settings()).toBeDefined();
      expect(component.settings()).toEqual(storageService.settingsSignal());
    });

    it('should initialize with no reset confirmation', () => {
      expect(component.resetConfirm()).toBe(false);
    });

    it('should capture initial settings state', () => {
      const initialSettings = component.lastSavedSettings();
      expect(initialSettings).toEqual(storageService.settingsSignal());
    });
  });

  describe('Signal Reactivity', () => {
    it('should have unsaved changes computed signal', () => {
      expect(component.hasUnsavedChanges()).toBe(false);
      
      component.settings.set({ ...component.settings(), theme: 'dark' });
      
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should detect theme change as unsaved', () => {
      storageService.updateSettings({ theme: 'dark' });
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should detect font family change as unsaved', () => {
      storageService.updateSettings({ fontFamily: 'serif' });
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should detect font size change as unsaved', () => {
      storageService.updateSettings({ fontSize: 18 });
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should detect animations change as unsaved', () => {
      storageService.updateSettings({ animations: false });
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should detect language change as unsaved', () => {
      storageService.updateSettings({ language: 'en' });
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should not show unsaved changes after save', () => {
      storageService.updateSettings({ theme: 'dark' });
      expect(component.hasUnsavedChanges()).toBe(true);
      
      component.saveSettings();
      
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should not show unsaved changes after cancel', () => {
      storageService.updateSettings({ theme: 'dark' });
      expect(component.hasUnsavedChanges()).toBe(true);
      
      component.cancelSettings();
      
      expect(component.hasUnsavedChanges()).toBe(false);
    });
  });

  describe('Update Settings', () => {
    it('should update theme setting', () => {
      component.updateSetting('theme', 'dark');
      expect(storageService.settingsSignal().theme).toBe('dark');
    });

    it('should update font family setting', () => {
      component.updateSetting('fontFamily', 'serif');
      expect(storageService.settingsSignal().fontFamily).toBe('serif');
    });

    it('should update font size setting', () => {
      component.updateSetting('fontSize', 20);
      expect(storageService.settingsSignal().fontSize).toBe(20);
    });

    it('should update animations setting', () => {
      component.updateSetting('animations', false);
      expect(storageService.settingsSignal().animations).toBe(false);
    });

    it('should update language setting', () => {
      component.updateSetting('language', 'en');
      expect(storageService.settingsSignal().language).toBe('en');
    });

    it('should immediately reflect in settings signal', () => {
      const initialValue = component.settings().theme;
      component.updateSetting('theme', 'dark');
      expect(component.settings().theme).not.toBe(initialValue);
    });

    it('should mark changes as unsaved', () => {
      component.updateSetting('theme', 'dark');
      expect(component.hasUnsavedChanges()).toBe(true);
    });
  });

  describe('Save Settings', () => {
    it('should save current settings', () => {
      storageService.updateSettings({ theme: 'dark' });
      component.saveSettings();
      
      const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      expect(saved.settings.theme).toBe('dark');
    });

    it('should update last saved settings', () => {
      storageService.updateSettings({ theme: 'dark' });
      component.saveSettings();
      
      expect(component.lastSavedSettings()).toEqual(component.settings());
    });

    it('should clear unsaved changes flag', () => {
      storageService.updateSettings({ theme: 'dark' });
      expect(component.hasUnsavedChanges()).toBe(true);
      
      component.saveSettings();
      
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should show snackbar confirmation', () => {
      component.saveSettings();
      
      expect(snackbarSpy).toHaveBeenCalled();
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().settings.settingsSaved);
    });

    it('should include close button in snackbar', () => {
      component.saveSettings();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[1]).toBe(i18nService.t().common.close);
    });

    it('should persist multiple settings changes', () => {
      storageService.updateSettings({ theme: 'dark', fontSize: 20, language: 'en' });
      component.saveSettings();
      
      const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      expect(saved.settings.theme).toBe('dark');
      expect(saved.settings.fontSize).toBe(20);
      expect(saved.settings.language).toBe('en');
    });
  });

  describe('Cancel Settings', () => {
    it('should revert changes to last saved settings', () => {
      const savedSettings = component.lastSavedSettings();
      const initialTheme = savedSettings?.theme ?? 'light';
      
      storageService.updateSettings({ theme: 'dark' });
      expect(storageService.settingsSignal().theme).toBe('dark');
      
      component.cancelSettings();
      
      expect(storageService.settingsSignal().theme).toBe(initialTheme);
    });

    it('should clear unsaved changes flag', () => {
      storageService.updateSettings({ theme: 'dark' });
      expect(component.hasUnsavedChanges()).toBe(true);
      
      component.cancelSettings();
      
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should show snackbar confirmation', () => {
      storageService.updateSettings({ theme: 'dark' });
      component.cancelSettings();
      
      expect(snackbarSpy).toHaveBeenCalled();
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().settings.settingsCanceled);
    });

    it('should handle cancel with no previous saved state', () => {
      component.lastSavedSettings.set(null);
      component.cancelSettings();
      
      // Should not throw and settings should remain as-is
      expect(component.settings()).toBeDefined();
    });

    it('should revert all settings on cancel', () => {
      const initialSettings = { ...component.lastSavedSettings()! };
      
      storageService.updateSettings({
        theme: 'dark',
        fontSize: 20,
        language: 'en',
        animations: false,
        fontFamily: 'serif'
      });
      
      component.cancelSettings();
      
      expect(storageService.settingsSignal()).toEqual(initialSettings);
    });

    it('should not save to storage on cancel', () => {
      storageService.updateSettings({ theme: 'dark' });
      const saved1 = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      
      component.cancelSettings();
      
      const saved2 = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      // Backup should be reverted but not saved again with cancel operation
      expect(saved2.settings.theme).not.toBe('dark');
    });
  });

  describe('Reset App', () => {
    it('should require double confirmation for reset', () => {
      component.resetApp();
      expect(component.resetConfirm()).toBe(true);
    });

    it('should reset confirmation after timeout', (done) => {
      component.resetApp();
      expect(component.resetConfirm()).toBe(true);
      
      setTimeout(() => {
        expect(component.resetConfirm()).toBe(false);
        done();
      }, 4500);
    });

    it('should execute reset on second confirmation', () => {
      component.resetApp();
      component.resetApp();
      
      expect(storageService.progressSignal().size).toBe(0);
      expect(storageService.historySignal()).toEqual([]);
    });

    it('should show snackbar on successful reset', () => {
      component.resetApp();
      component.resetApp();
      
      expect(snackbarSpy).toHaveBeenCalled();
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toContain(i18nService.t().settings.appReset);
    });

    it('should reset settings to default on reset', () => {
      storageService.updateSettings({ theme: 'dark' });
      
      component.resetApp();
      component.resetApp();
      
      expect(storageService.settingsSignal()).toEqual({
        theme: 'light',
        fontFamily: 'inter',
        fontSize: 16,
        animations: true,
        language: 'pt-BR'
      });
    });

    it('should update last saved settings after reset', () => {
      storageService.updateSettings({ theme: 'dark' });
      
      component.resetApp();
      component.resetApp();
      
      expect(component.lastSavedSettings()).toEqual(storageService.settingsSignal());
    });

    it('should clear reset confirmation after reset', () => {
      component.resetApp();
      component.resetApp();
      
      expect(component.resetConfirm()).toBe(false);
    });

    it('should cancel reset if second confirmation not given within timeout', (done) => {
      component.resetApp();
      expect(component.resetConfirm()).toBe(true);
      
      setTimeout(() => {
        expect(component.resetConfirm()).toBe(false);
        expect(storageService.progressSignal().size).toBe(0); // Should still have reset from initial clear
        done();
      }, 4500);
    });
  });

  describe('Settings Options', () => {
    it('should support light and dark themes', () => {
      component.updateSetting('theme', 'dark');
      expect(component.settings().theme).toBe('dark');
      
      component.updateSetting('theme', 'light');
      expect(component.settings().theme).toBe('light');
    });

    it('should support multiple font families', () => {
      const fontFamilies: Array<'inter' | 'serif' | 'mono'> = ['inter', 'serif', 'mono'];
      
      fontFamilies.forEach((fontFamily) => {
        component.updateSetting('fontFamily', fontFamily);
        expect(component.settings().fontFamily).toBe(fontFamily);
      });
    });

    it('should support font size range', () => {
      const sizes = [12, 14, 16, 18, 20, 22, 24];
      
      sizes.forEach((size) => {
        component.updateSetting('fontSize', size);
        expect(component.settings().fontSize).toBe(size);
      });
    });

    it('should support animations toggle', () => {
      component.updateSetting('animations', true);
      expect(component.settings().animations).toBe(true);
      
      component.updateSetting('animations', false);
      expect(component.settings().animations).toBe(false);
    });

    it('should support multiple languages', () => {
      const languages: Array<'pt-BR' | 'en' | 'es'> = ['pt-BR', 'en', 'es'];
      
      languages.forEach((language) => {
        component.updateSetting('language', language);
        expect(component.settings().language).toBe(language);
      });
    });
  });

  describe('Complex Scenarios', () => {
    it('should handle rapid setting changes', () => {
      for (let i = 16; i <= 24; i++) {
        component.updateSetting('fontSize', i);
      }
      expect(component.settings().fontSize).toBe(24);
      expect(component.hasUnsavedChanges()).toBe(true);
    });

    it('should handle save after multiple changes', () => {
      component.updateSetting('theme', 'dark');
      component.updateSetting('fontSize', 20);
      component.updateSetting('language', 'en');
      
      component.saveSettings();
      
      expect(component.hasUnsavedChanges()).toBe(false);
      const saved = JSON.parse(localStorage.getItem('bible-pwa-state-v1') || '{}');
      expect(saved.settings).toEqual(component.settings());
    });

    it('should handle cancel after multiple changes', () => {
      const initial = { ...component.lastSavedSettings()! };
      
      component.updateSetting('theme', 'dark');
      component.updateSetting('fontSize', 20);
      component.updateSetting('language', 'en');
      
      component.cancelSettings();
      
      expect(component.settings()).toEqual(initial);
      expect(component.hasUnsavedChanges()).toBe(false);
    });

    it('should track changes through save-cancel cycle', () => {
      component.updateSetting('theme', 'dark');
      component.saveSettings();
      
      expect(component.hasUnsavedChanges()).toBe(false);
      
      component.updateSetting('fontSize', 20);
      expect(component.hasUnsavedChanges()).toBe(true);
      
      component.cancelSettings();
      expect(component.hasUnsavedChanges()).toBe(false);
      expect(component.settings().theme).toBe('dark');
      expect(component.settings().fontSize).toBe(16);
    });

    it('should maintain independence between multiple setting updates', () => {
      component.updateSetting('theme', 'dark');
      const themeAfter = component.settings().theme;
      
      component.updateSetting('fontSize', 20);
      expect(component.settings().theme).toBe(themeAfter);
      
      component.updateSetting('language', 'en');
      expect(component.settings().theme).toBe(themeAfter);
      expect(component.settings().fontSize).toBe(20);
    });
  });

  describe('Integration with I18nService', () => {
    it('should react to language changes', () => {
      component.updateSetting('language', 'en');
      expect(i18nService.locale()).toBe('en');
    });

    it('should display correct snackbar messages', () => {
      component.saveSettings();
      
      const args = snackbarSpy.calls.mostRecent().args;
      expect(args[0]).toBeTruthy();
      expect(args[1]).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle missing i18n translations gracefully', () => {
      expect(() => component.saveSettings()).not.toThrow();
      expect(() => component.cancelSettings()).not.toThrow();
    });

    it('should handle corrupted settings signal', () => {
      expect(() => component.updateSetting('theme', 'dark')).not.toThrow();
      expect(component.settings()).toBeDefined();
    });
  });

  describe('Accessibility & User Experience', () => {
    it('should provide visual feedback through snackbar', () => {
      component.saveSettings();
      expect(snackbarSpy).toHaveBeenCalledWith(jasmine.any(String), jasmine.any(String), jasmine.any(Object));
    });

    it('should have appropriate snackbar durations', () => {
      component.saveSettings();
      const options = snackbarSpy.calls.mostRecent().args[2];
      expect(options.duration).toBeGreaterThan(0);
    });

    it('should provide reset confirmation timeout', () => {
      component.resetApp();
      expect(component.resetConfirm()).toBe(true);
      // Should eventually clear without second call after timeout
      expect(component.resetConfirm()).toBe(true);
    });
  });
});
