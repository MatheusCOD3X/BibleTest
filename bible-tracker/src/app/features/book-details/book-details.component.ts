import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { BibleDataService } from '../../core/services/bible-data.service';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, ChapterProgress } from '../../models/bible.models';

@Component({
  selector: 'app-book-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ScrollingModule,
    MatCardModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatSnackBarModule,
    FormsModule
  ],
  templateUrl: './book-details.component.html',
  styleUrl: './book-details.component.scss'
})
export class BookDetailsComponent {
  readonly book = signal<BibleBook | undefined>(undefined);
  // Truque para gerar a lista [1, 2, 3, ..., N]: `Array.from({ length: N }, ...)` cria um
  // array "vazio" de tamanho N e o callback converte cada posição (index) em index + 1.
  readonly chapters = computed(() => Array.from({ length: this.book()?.chapters ?? 0 }, (_, index) => index + 1));
  readonly progressMap: () => Map<string, ChapterProgress>;

  constructor(
    private readonly route: ActivatedRoute,
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    readonly i18n: I18nService,
    private readonly snackbar: MatSnackBar
  ) {
    this.progressMap = this.storageService.progressSignal;
    // Escuta mudanças no parâmetro de rota (:id). É necessário porque, ao navegar de um livro
    // para outro (ex.: "/book/gen" -> "/book/exo"), o Angular reaproveita este mesmo componente
    // em vez de recriá-lo, então precisamos reagir manualmente à mudança do id.
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
    this.snackbar.open(this.i18n.t().bookDetails.progressUpdated, this.i18n.t().common.close, { duration: 1600 });
  }

  updateNotes(book: BibleBook, chapterNumber: number, notes: string): void {
    this.storageService.updateNotes(book, chapterNumber, notes);
  }

  markBookComplete(book: BibleBook): void {
    this.storageService.markBookComplete(book);
    this.snackbar.open(this.i18n.t().bookDetails.bookMarkedComplete, this.i18n.t().common.close, { duration: 1600 });
  }

  unmarkBookComplete(book: BibleBook): void {
    this.storageService.unmarkBookComplete(book);
    this.snackbar.open(this.i18n.t().bookDetails.bookProgressRemoved, this.i18n.t().common.close, { duration: 1600 });
  }

  trackByChapter(_index: number, chapterNumber: number): number {
    return chapterNumber;
  }
}

