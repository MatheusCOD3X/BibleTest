import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, BookProgress, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly books: BibleBook[];
  readonly stats: Signal<ReadingStats>;
  readonly history: Signal<ReadingHistoryEntry[]>;
  readonly progressByBook: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;
  readonly topProgress: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;

  constructor(
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService
  ) {
    this.books = this.bibleDataService.books;
    this.stats = computed(() => this.storageService.getStats(this.bibleDataService.books));
    this.history = this.storageService.historySignal;
    this.progressByBook = computed(() => this.books.map((book) => ({ book, progress: this.storageService.getBookProgress(book) })));
    this.topProgress = computed(() =>
      this.progressByBook()
        .slice()
        .sort((a, b) => b.progress.progressPercent - a.progress.progressPercent)
        .slice(0, 8)
    );
  }

  getBookName(bookId: string): string {
    return this.books.find((book) => book.id === bookId)?.name ?? 'Livro';
  }
}
