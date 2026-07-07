import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';

interface DailyVerse {
  text: string;
  reference: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly userName = 'Matheus';
  readonly books: BibleBook[];
  readonly stats: Signal<ReadingStats>;
  readonly history: Signal<ReadingHistoryEntry[]>;

  readonly greeting = computed(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Bom dia';
    }
    if (hour < 18) {
      return 'Boa tarde';
    }
    return 'Boa noite';
  });

  readonly currentReading = computed(() => {
    const latest = this.history()[0];
    if (latest) {
      const book = this.bibleDataService.getBookById(latest.bookId);
      if (book) {
        const progress = this.storageService.getBookProgress(book);
        const nextChapter = Math.min(latest.chapterNumber + 1, book.chapters);
        return {
          book,
          chapterNumber: nextChapter,
          progressPercent: progress.progressPercent,
          completedChapters: progress.completedChapters,
          totalChapters: progress.totalChapters
        };
      }
    }

    const firstPending = this.books.find((book) => !this.storageService.isBookCompleted(book)) ?? this.books[0];
    const pendingProgress = this.storageService.getBookProgress(firstPending);
    return {
      book: firstPending,
      chapterNumber: Math.min(pendingProgress.completedChapters + 1, firstPending.chapters),
      progressPercent: pendingProgress.progressPercent,
      completedChapters: pendingProgress.completedChapters,
      totalChapters: pendingProgress.totalChapters
    };
  });

  readonly streak = computed(() => this.stats().streak);

  readonly todayHistory = computed(() => {
    const today = new Date().toISOString().split('T')[0];
    return this.history().filter((entry) => entry.completedAt.startsWith(today));
  });

  readonly chaptersToday = computed(() => this.todayHistory().length);

  readonly readingMinutesToday = computed(() => this.chaptersToday() * 5);

  readonly dailyVerse = computed<DailyVerse>(() => {
    const verses: DailyVerse[] = [
      { text: 'Lampada para os meus pes e a tua palavra, e luz para o meu caminho.', reference: 'Salmos 119:105' },
      { text: 'Posso todas as coisas naquele que me fortalece.', reference: 'Filipenses 4:13' },
      { text: 'O Senhor e o meu pastor; nada me faltara.', reference: 'Salmos 23:1' },
      { text: 'Entrega o teu caminho ao Senhor; confia nele.', reference: 'Salmos 37:5' },
      { text: 'Alegrei-me com os que me disseram: Vamos a casa do Senhor.', reference: 'Salmos 122:1' }
    ];

    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = new Date().getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return verses[dayOfYear % verses.length];
  });

  constructor(
    private readonly router: Router,
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService
  ) {
    this.books = this.bibleDataService.books;
    this.stats = computed(() => this.storageService.getStats(this.bibleDataService.books));
    this.history = this.storageService.historySignal;
  }

  continueReading(): void {
    this.router.navigate(['/book', this.currentReading().book.id]);
  }
}
