import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-backup',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSnackBarModule],
  templateUrl: './backup.component.html',
  styleUrl: './backup.component.scss'
})
export class BackupComponent {
  backupData = '';
  importError = '';

  constructor(
    private readonly storageService: StorageService,
    readonly i18n: I18nService,
    private readonly snackbar: MatSnackBar
  ) {
    this.backupData = this.storageService.export();
  }

  exportBackup(): void {
    this.backupData = this.storageService.export();
    this.snackbar.open(this.i18n.t().backup.exported, this.i18n.t().common.close, { duration: 1600 });
  }

  importBackup(): void {
    try {
      this.storageService.import(this.backupData);
      this.snackbar.open(this.i18n.t().backup.restored, this.i18n.t().common.close, { duration: 1600 });
      this.importError = '';
    } catch {
      // Mostramos sempre uma mensagem genérica traduzida aqui (em vez do `error.message` bruto),
      // assim o StorageService não precisa conhecer o I18nService nem os textos de cada idioma.
      this.importError = this.i18n.t().backup.invalidBackup;
    }
  }
}
