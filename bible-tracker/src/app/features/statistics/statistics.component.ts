import { ChangeDetectionStrategy, Component, computed, Signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { BibleDataService } from '../../core/services/bible-data.service';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';
import { BibleBook, BookProgress, ReadingHistoryEntry, ReadingStats } from '../../models/bible.models';

@Component({
  selector: 'app-statistics',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTabsModule,
    MatExpansionModule,
    NgChartsModule
  ],
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.scss'
})
export class StatisticsComponent {
  readonly stats: Signal<ReadingStats>;
  readonly history: Signal<ReadingHistoryEntry[]>;
  readonly progressByBook: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;
  readonly topProgress: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;
  readonly allProgressSorted: Signal<Array<{ book: BibleBook; progress: BookProgress }>>;

  readonly progressChartType = 'doughnut' as const;
  readonly progressChartData: Signal<ChartData<'doughnut', number[], string>>;
  readonly progressChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } }
  };

  readonly monthlyChartType = 'bar' as const;
  readonly monthlyChartData: Signal<ChartData<'bar', number[], string>>;
  readonly monthlyChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
    plugins: { legend: { display: false } }
  };

  readonly byBookChartType = 'bar' as const;
  readonly byBookChartData: Signal<ChartData<'bar', number[], string>>;
  readonly byBookChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { beginAtZero: true, max: 100 } },
    plugins: { legend: { display: false } }
  };

  constructor(
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    readonly i18n: I18nService
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
    // Mesma ordenação, porém com os 66 livros - alimenta o painel expansível "ver todos os livros".
    this.allProgressSorted = computed(() =>
      this.progressByBook()
        .slice()
        .sort((a, b) => b.progress.progressPercent - a.progress.progressPercent)
    );

    this.progressChartData = computed(() => ({
      labels: [this.i18n.t().statistics.completedLabel, this.i18n.t().statistics.remainingChapters],
      datasets: [
        {
          data: [this.stats().completedChapters, this.stats().remainingChapters],
          backgroundColor: ['#1976d2', '#e0e0e0']
        }
      ]
    }));

    this.monthlyChartData = computed(() => {
      const grouped = this.groupHistoryByMonth(this.history());
      return {
        labels: grouped.map((item) => item.label),
        datasets: [
          { data: grouped.map((item) => item.count), backgroundColor: '#1976d2', label: this.i18n.t().statistics.chaptersRead }
        ]
      };
    });

    this.byBookChartData = computed(() => {
      const top = this.topProgress();
      return {
        labels: top.map((item) => this.i18n.translateBookName(item.book)),
        datasets: [
          { data: top.map((item) => item.progress.progressPercent), backgroundColor: '#26a69a', label: this.i18n.t().statistics.progressByBook }
        ]
      };
    });
  }

  getBookName(bookId: string): string {
    const book = this.bibleDataService.getBookById(bookId);
    return book ? this.i18n.translateBookName(book) : this.i18n.t().common.unknownBook;
  }

  // Agrupa o histórico de leitura pelo mês/ano de conclusão (ex.: "jan/25"), somando a
  // quantidade de capítulos lidos em cada mês. Retorna só os últimos 6 meses, em ordem
  // cronológica, para manter o gráfico legível.
  private groupHistoryByMonth(entries: ReadingHistoryEntry[]): Array<{ key: string; label: string; count: number }> {
    const formatter = new Intl.DateTimeFormat(this.i18n.locale(), { month: 'short', year: '2-digit' });
    const counts = new Map<string, number>();

    for (const entry of entries) {
      const date = new Date(entry.completedAt);
      if (Number.isNaN(date.getTime())) {
        continue;
      }
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, count]) => {
        const [year, month] = key.split('-').map(Number);
        return { key, label: formatter.format(new Date(year, month - 1, 1)), count };
      });
  }
}

