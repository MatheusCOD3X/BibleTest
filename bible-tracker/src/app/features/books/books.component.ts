import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterLink } from '@angular/router';
import { BibleBook } from '../../models/bible.models';
import { BibleDataService } from '../../core/services/bible-data.service';
import { I18nService } from '../../core/services/i18n.service';
import { StorageService } from '../../core/services/storage.service';

type BookFilter = 'all' | 'old' | 'new' | 'completed' | 'progress' | 'not-started';

@Component({
  selector: 'app-books',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ScrollingModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule,
    RouterLink
  ],
  templateUrl: './books.component.html',
  styleUrl: './books.component.scss'
})
export class BooksComponent {
  readonly books: BibleBook[];
  readonly filter = signal<BookFilter>('all');
  readonly searchTerm = signal('');

  readonly filteredBooks = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.books.filter((book) => {
      const matchesText = this.i18n.translateBookName(book).toLowerCase().includes(term);
      const matchesFilter = this.matchesFilter(book);
      return matchesText && matchesFilter;
    });
  });

  // Sugestões de autocomplete: até 6 livros cujo nome traduzido contém o termo digitado.
  // Selecionar uma sugestão navega direto para o livro, sem precisar rolar a lista filtrada.
  readonly searchSuggestions = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) {
      return [];
    }
    return this.books.filter((book) => this.i18n.translateBookName(book).toLowerCase().includes(term)).slice(0, 6);
  });

  constructor(
    private readonly router: Router,
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    readonly i18n: I18nService
  ) {
    this.books = this.bibleDataService.books;
  }

  matchesFilter(book: BibleBook): boolean {
    const progress = this.storageService.getBookProgress(book);
    switch (this.filter()) {
      case 'old':
        return book.testament === 'Antigo';
      case 'new':
        return book.testament === 'Novo';
      case 'completed':
        return progress.completed;
      case 'progress':
        return progress.started && !progress.completed;
      case 'not-started':
        return !progress.started;
      default:
        return true;
    }
  }

  // O evento emitido pelo componente de filtro do Material não vem tipado com precisão,
  // por isso usamos `any` aqui e convertemos manualmente o valor para `BookFilter`.
  onFilterChange(event: any): void {
    this.filter.set(event.value as BookFilter);
  }

  goToBook(bookId: string): void {
    this.router.navigate(['/book', bookId]);
  }

  trackByBook(_index: number, book: BibleBook): string {
    return book.id;
  }

  toggleBookComplete(book: BibleBook): void {
    const progress = this.storageService.getBookProgress(book);
    if (progress.completed) {
      this.storageService.unmarkBookComplete(book);
      return;
    }
    this.storageService.markBookComplete(book);
  }
}
