import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, ChapterProgress } from '../../models/bible.models';

@Component({
  selector: 'app-book-details',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule, MatIconModule, MatProgressBarModule, MatSnackBarModule, FormsModule],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss'
})
export class BookDetailsComponent {
  readonly book = signal<BibleBook | undefined>(undefined);
  readonly chapters = computed(() => Array.from({ length: this.book()?.chapters ?? 0 }, (_, index) => index + 1));
  readonly progressMap: () => Map<string, ChapterProgress>;

  constructor(
    private readonly route: ActivatedRoute,
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    private readonly snackbar: MatSnackBar
  ) {
    this.progressMap = this.storageService.progressSignal;
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id') ?? '';
      this.book.set(this.bibleDataService.getBookById(id));
    });
  }

  getChapterProgress(book: BibleBook, chapterNumber: number) {
    return this.progressMap().get(`${book.id}:${chapterNumber}`);
  }

  toggleChapter(book: BibleBook, chapterNumber: number): void {
    this.storageService.toggleChapter(book, chapterNumber);
    this.snackbar.open('Progresso atualizado', 'Fechar', { duration: 1600 });
  }

  updateNotes(book: BibleBook, chapterNumber: number, notes: string): void {
    this.storageService.updateNotes(book, chapterNumber, notes);
  }

  markBookComplete(book: BibleBook): void {
    this.storageService.markBookComplete(book);
    this.snackbar.open('Livro marcado como concluído', 'Fechar', { duration: 1600 });
  }

  unmarkBookComplete(book: BibleBook): void {
    this.storageService.unmarkBookComplete(book);
    this.snackbar.open('Progresso do livro removido', 'Fechar', { duration: 1600 });
  }
}
