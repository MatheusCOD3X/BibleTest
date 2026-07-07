import { Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgChartsModule } from 'ng2-charts';
import 'chart.js/auto';
import { ChartData, ChartOptions } from 'chart.js';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { BibleDataService } from '../../core/services/bible-data.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, BookProgress, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressBarModule, MatIconModule, NgChartsModule],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
  readonly stats: Signal<ReadingStats>;
  readonly history: Signal<ReadingHistoryEntry[]>;
  readonly progressByBook: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;

  readonly chartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    layout: {
      padding: 12
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 25,
          color: '#475569'
        }
      },
      x: {
        ticks: {
          color: '#475569'
        }
      }
    }
  };

  readonly chapterChartType: 'doughnut' = 'doughnut';
  readonly bookProgressChartType: 'bar' = 'bar';

  readonly chapterChartData = computed<ChartData<'doughnut'>>(() => {
    const stats = this.stats();
    return {
      labels: ['Lidos', 'Restantes'],
      datasets: [
        {
          data: [stats.completedChapters, stats.remainingChapters],
          backgroundColor: ['#2563eb', '#60a5fa'],
          hoverOffset: 12
        }
      ]
    };
  });

  readonly bookProgressChartData = computed<ChartData<'bar'>>(() => {
    const books = [...this.progressByBook()]
      .sort((a, b) => b.progress.progressPercent - a.progress.progressPercent)
      .slice(0, 6);

    return {
      labels: books.map((item) => item.book.name),
      datasets: [
        {
          label: 'Progresso (%)',
          data: books.map((item) => item.progress.progressPercent),
          backgroundColor: '#8b5cf6',
          borderRadius: 10
        }
      ]
    };
  });

  constructor(
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService
  ) {
    this.stats = computed(() => this.storageService.getStats(this.bibleDataService.books));
    this.history = this.storageService.historySignal;
    this.progressByBook = computed(() => this.bibleDataService.books.map((book) => ({ book, progress: this.storageService.getBookProgress(book) })));
  }
}
