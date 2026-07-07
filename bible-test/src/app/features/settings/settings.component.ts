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

  constructor(
    private readonly storageService: StorageService,
    private readonly snackbar: MatSnackBar
  ) {
    this.settings = this.storageService.settingsSignal;
  }

  saveSettings(): void {
    this.storageService.save();
    this.snackbar.open('Configurações salvas', 'Fechar', { duration: 1600 });
  }

  resetApp(): void {
    if (!this.resetConfirm()) {
      this.resetConfirm.set(true);
      return;
    }

    this.storageService.resetProgress();
    this.snackbar.open('App resetado', 'Fechar', { duration: 1600 });
  }
}
