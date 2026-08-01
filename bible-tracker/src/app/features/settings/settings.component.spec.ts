import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SettingsComponent } from './settings.component';
import { StorageService } from '../../core/services/storage.service';

describe('SettingsComponent', () => {
  let storageService: StorageService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [SettingsComponent],
      providers: [provideNoopAnimations()]
    }).compileComponents();
    storageService = TestBed.inject(StorageService);
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SettingsComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('captures the current settings as the saved baseline on init', () => {
    storageService.updateSettings({ theme: 'dark' });
    const fixture = TestBed.createComponent(SettingsComponent);
    const component = fixture.componentInstance;
    expect(component.hasUnsavedChanges()).toBeFalse();
  });

  describe('hasUnsavedChanges', () => {
    it('is false right after creation', () => {
      const fixture = TestBed.createComponent(SettingsComponent);
      expect(fixture.componentInstance.hasUnsavedChanges()).toBeFalse();
    });

    it('becomes true once a setting changes', () => {
      const fixture = TestBed.createComponent(SettingsComponent);
      const component = fixture.componentInstance;

      component.updateSetting('theme', 'dark');

      expect(component.hasUnsavedChanges()).toBeTrue();
    });

    it('becomes false again after saving', () => {
      const fixture = TestBed.createComponent(SettingsComponent);
      const component = fixture.componentInstance;

      component.updateSetting('fontSize', 20);
      expect(component.hasUnsavedChanges()).toBeTrue();

      component.saveSettings();

      expect(component.hasUnsavedChanges()).toBeFalse();
    });
  });

  describe('cancelSettings', () => {
    it('reverts an unsaved change back to the last saved settings', () => {
      const fixture = TestBed.createComponent(SettingsComponent);
      const component = fixture.componentInstance;

      component.updateSetting('theme', 'dark');
      expect(component.settings().theme).toBe('dark');

      component.cancelSettings();

      expect(component.settings().theme).toBe('light');
      expect(component.hasUnsavedChanges()).toBeFalse();
    });

    it('does not touch settings that were already saved', () => {
      const fixture = TestBed.createComponent(SettingsComponent);
      const component = fixture.componentInstance;

      component.updateSetting('fontFamily', 'serif');
      component.saveSettings();

      component.cancelSettings();

      expect(component.settings().fontFamily).toBe('serif');
    });
  });

  describe('saveSettings', () => {
    it('persists the current settings via StorageService', () => {
      const fixture = TestBed.createComponent(SettingsComponent);
      const component = fixture.componentInstance;
      const saveSpy = spyOn(storageService, 'save').and.callThrough();

      component.updateSetting('animations', false);
      component.saveSettings();

      expect(saveSpy).toHaveBeenCalled();
      expect(component.settings().animations).toBeFalse();
    });
  });

  describe('resetApp', () => {
    it('requires a second click to confirm before resetting', () => {
      const fixture = TestBed.createComponent(SettingsComponent);
      const component = fixture.componentInstance;
      const resetSpy = spyOn(storageService, 'resetProgress');

      component.resetApp();
      expect(component.resetConfirm()).toBeTrue();
      expect(resetSpy).not.toHaveBeenCalled();

      component.resetApp();
      expect(resetSpy).toHaveBeenCalled();
      expect(component.resetConfirm()).toBeFalse();
    });
  });
});
