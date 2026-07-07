import { Component, computed, signal, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router, RouterLink } from '@angular/router';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatProgressSpinnerModule, MatFormFieldModule, MatInputModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  readonly books: BibleBook[];
  readonly stats: Signal<ReadingStats>;
  readonly history: Signal<ReadingHistoryEntry[]>;
  searchTerm = '';

  constructor(
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    private readonly router: Router
  ) {
    this.books = this.bibleDataService.books;
    this.stats = computed(() => this.storageService.getStats(this.bibleDataService.books));
    this.history = this.storageService.historySignal;
  }

  get filteredBooks() {
    const term = this.searchTerm.toLowerCase();
    return this.books.filter((book) => book.name.toLowerCase().includes(term));
  }

  continueReading(): void {
    const latest = this.history()[0];
    if (latest) {
      this.router.navigate(['/book', latest.bookId]);
      return;
    }

    const firstPending = this.books.find((book) => !this.storageService.isBookCompleted(book));
    if (firstPending) {
      this.router.navigate(['/book', firstPending.id]);
    }
  }

  openBook(bookId: string): void {
    this.router.navigate(['/book', bookId]);
  }

  getBookName(bookId: string): string {
    return this.books.find((book) => book.id === bookId)?.name ?? 'Livro';
  }
}
