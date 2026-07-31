import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, BookProgress, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
  readonly stats: Signal<ReadingStats>;
  readonly history: Signal<ReadingHistoryEntry[]>;
  readonly progressByBook: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;
  readonly topProgress: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;

  constructor(
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService
  ) {
    this.stats = computed(() => this.storageService.getStats(this.bibleDataService.books));
    this.history = this.storageService.historySignal;
    this.progressByBook = computed(() => this.bibleDataService.books.map((book) => ({ book, progress: this.storageService.getBookProgress(book) })));
    // `.slice()` sem argumentos copia o array antes de ordenar, porque `sort()` altera o array
    // original - sem a cópia, isso bagunçaria também a ordem usada em `progressByBook`.
    // Depois de ordenar do maior para o menor progresso, ficamos só com os 8 primeiros.
    this.topProgress = computed(() =>
      this.progressByBook()
        .slice()
        .sort((a, b) => b.progress.progressPercent - a.progress.progressPercent)
        .slice(0, 8)
    );
  }

  getBookName(bookId: string): string {
    return this.bibleDataService.getBookById(bookId)?.name ?? 'Livro';
  }
}
