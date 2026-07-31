import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { StorageService } from '../../core/services/storage.service';

@Component({
  selector: 'app-backup',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatIconModule, MatSnackBarModule],
  templateUrl: './backup.component.html',
  styleUrl: './backup.component.scss'
})
export class BackupComponent {
  backupData = '';
  importError = '';

  constructor(
    private readonly storageService: StorageService,
    private readonly snackbar: MatSnackBar
  ) {
    this.backupData = this.storageService.export();
  }

  exportBackup(): void {
    this.backupData = this.storageService.export();
    this.snackbar.open('Backup exportado', 'Fechar', { duration: 1600 });
  }

  importBackup(): void {
    try {
      this.storageService.import(this.backupData);
      this.snackbar.open('Backup restaurado', 'Fechar', { duration: 1600 });
      this.importError = '';
    } catch (error) {
      this.importError = error instanceof Error ? error.message : 'Erro ao restaurar backup';
    }
  }
}
