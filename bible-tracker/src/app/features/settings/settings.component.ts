import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { AppSettings } from '../../models/bible.models';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule, MatIconModule, MatListModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  readonly settings;
  readonly resetConfirm = signal(false);
  readonly lastSavedSettings = signal<AppSettings | null>(null);
  readonly hasUnsavedChanges = computed(() => {
    const current = this.settings();
    const lastSaved = this.lastSavedSettings();
    if (!lastSaved) return false;
    return JSON.stringify(current) !== JSON.stringify(lastSaved);
  });

  private resetConfirmTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly storageService: StorageService,
    readonly i18n: I18nService,
    private readonly snackbar: MatSnackBar
  ) {
    this.settings = this.storageService.settingsSignal;
    // Capture initial saved state
    this.lastSavedSettings.set({ ...this.settings() });
  }

  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.storageService.updateSettings({ [key]: value } as Partial<AppSettings>);
  }

  saveSettings(): void {
    this.storageService.save();
    this.lastSavedSettings.set({ ...this.settings() });
    this.snackbar.open(this.i18n.t().settings.settingsSaved, this.i18n.t().common.close, { duration: 1600 });
  }

  cancelSettings(): void {
    const lastSaved = this.lastSavedSettings();
    if (lastSaved) {
      this.storageService.updateSettings(lastSaved);
      this.snackbar.open(this.i18n.t().settings.settingsCanceled, this.i18n.t().common.close, { duration: 1200 });
    }
  }

  resetApp(): void {
    if (!this.resetConfirm()) {
      this.resetConfirm.set(true);
      clearTimeout(this.resetConfirmTimeout);
      this.resetConfirmTimeout = setTimeout(() => this.resetConfirm.set(false), 4000);
      return;
    }

    clearTimeout(this.resetConfirmTimeout);
    this.resetConfirm.set(false);
    this.storageService.resetProgress();
    this.lastSavedSettings.set({ ...this.settings() });
    this.snackbar.open(this.i18n.t().settings.appReset, this.i18n.t().common.close, { duration: 1600 });
  }
}
