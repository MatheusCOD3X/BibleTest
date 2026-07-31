import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppSettings } from '../../models/bible.models';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatSlideToggleModule, MatSnackBarModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  readonly settings;
  readonly resetConfirm = signal(false);
  private resetConfirmTimeout: ReturnType<typeof setTimeout> | undefined;

  constructor(
    private readonly storageService: StorageService,
    readonly i18n: I18nService,
    private readonly snackbar: MatSnackBar
  ) {
    this.settings = this.storageService.settingsSignal;
  }

  updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void {
    this.storageService.updateSettings({ [key]: value } as Partial<AppSettings>);
  }

  saveSettings(): void {
    this.storageService.save();
    this.snackbar.open(this.i18n.t().settings.settingsSaved, this.i18n.t().common.close, { duration: 1600 });
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
    this.snackbar.open(this.i18n.t().settings.appReset, this.i18n.t().common.close, { duration: 1600 });
  }
}
