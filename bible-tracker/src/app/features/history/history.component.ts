import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BibleDataService } from '../../core/services/bible-data.service';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';
import { ReadingHistoryEntry } from '../../models/bible.models';

type HistorySort = 'recent' | 'oldest' | 'book';
type HistoryFilter = 'all' | 'old' | 'new';

@Component({
  selector: 'app-history',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ScrollingModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatMenuModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent {
  readonly searchTerm = signal('');
  readonly sortMode = signal<HistorySort>('recent');
  readonly filter = signal<HistoryFilter>('all');

  // Filtra pelo termo pesquisado (nome do livro traduzido) e pelo testamento selecionado,
  // depois ordena de acordo com o modo escolhido (mais recentes, mais antigas ou por livro).
  readonly entries = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const filterValue = this.filter();

    const filtered = this.storageService.historySignal().filter((entry) => {
      const book = this.bibleDataService.getBookById(entry.bookId);
      if (!book) {
        return false;
      }
      if (filterValue === 'old' && book.testament !== 'Antigo') {
        return false;
      }
      if (filterValue === 'new' && book.testament !== 'Novo') {
        return false;
      }
      if (!term) {
        return true;
      }
      return this.i18n.translateBookName(book).toLowerCase().includes(term);
    });

    return this.sortEntries(filtered);
  });

  constructor(
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    readonly i18n: I18nService
  ) {}

  getBookName(bookId: string): string {
    const book = this.bibleDataService.getBookById(bookId);
    return book ? this.i18n.translateBookName(book) : this.i18n.t().common.unknownBook;
  }

  setSort(mode: HistorySort): void {
    this.sortMode.set(mode);
  }

  sortLabel(): string {
    const sort = this.sortMode();
    if (sort === 'oldest') {
      return this.i18n.t().history.sortOldest;
    }
    if (sort === 'book') {
      return this.i18n.t().history.sortBook;
    }
    return this.i18n.t().history.sortRecent;
  }

  // O evento emitido pelo mat-chip-listbox não vem tipado com precisão, por isso usamos `any`
  // aqui e convertemos manualmente o valor para `HistoryFilter`.
  onFilterChange(event: any): void {
    this.filter.set(event.value as HistoryFilter);
  }

  trackByEntry(_index: number, entry: ReadingHistoryEntry): string {
    return entry.id;
  }

  private sortEntries(entries: ReadingHistoryEntry[]): ReadingHistoryEntry[] {
    const sort = this.sortMode();
    const copy = entries.slice();

    if (sort === 'book') {
      return copy.sort((a, b) => {
        const nameCompare = this.getBookName(a.bookId).localeCompare(this.getBookName(b.bookId));
        return nameCompare !== 0 ? nameCompare : a.chapterNumber - b.chapterNumber;
      });
    }

    return copy.sort((a, b) => {
      const diff = new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
      return sort === 'oldest' ? -diff : diff;
    });
  }
}
