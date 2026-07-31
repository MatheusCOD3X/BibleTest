import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { BibleDataService } from '../../core/services/bible-data.service';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';
import { DailyVerse } from '../../core/i18n/translations';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatProgressBarModule, MatBadgeModule, MatTooltipModule],
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
    const texts = this.i18n.t().home;
    if (hour < 12) {
      return texts.greetingMorning;
    }
    if (hour < 18) {
      return texts.greetingAfternoon;
    }
    return texts.greetingEvening;
  });

  readonly currentReading = computed(() => {
    const latest = this.history()[0];
    if (latest) {
      const book = this.bibleDataService.getBookById(latest.bookId);
      if (book) {
        const progress = this.storageService.getBookProgress(book);
        // Se o livro do registro mais recente já foi concluído por completo, avançamos
        // para o próximo livro pendente, em vez de sugerir de novo um capítulo já finalizado.
        if (!progress.completed) {
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

  readonly readingMinutesToday = computed(() => this.storageService.getMinutesForChapters(this.chaptersToday()));

  readonly dailyVerse = computed<DailyVerse>(() => {
    const verses = this.i18n.t().home.dailyVerses;

    // Conta quantos dias já se passaram desde 1º de janeiro ("dia do ano") e usa o resto da
    // divisão (%) pelo tamanho da lista para sempre escolher o mesmo versículo no mesmo dia,
    // voltando ao início da lista quando os dias passarem da quantidade de versículos.
    const start = new Date(new Date().getFullYear(), 0, 0);
    const diff = new Date().getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return verses[dayOfYear % verses.length];
  });

  constructor(
    private readonly router: Router,
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    readonly i18n: I18nService
  ) {
    this.books = this.bibleDataService.books;
    this.stats = computed(() => this.storageService.getStats(this.bibleDataService.books));
    this.history = this.storageService.historySignal;
  }

  continueReading(): void {
    this.router.navigate(['/book', this.currentReading().book.id]);
  }
}
