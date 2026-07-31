import { Injectable, computed } from '@angular/core';
import { BibleBook } from '../../models/bible.models';
import { BOOK_NAME_TRANSLATIONS, TESTAMENT_TRANSLATIONS } from '../i18n/book-name-translations';
import { Locale, Translations, TRANSLATIONS } from '../i18n/translations';
import { StorageService } from './storage.service';

/**
 * Centraliza a tradução da interface. O idioma ativo vem de `StorageService.settingsSignal`,
 * então basta mudar a configuração de idioma para `t()` (e tudo que depende dele) recalcular
 * sozinho - o mesmo princípio reativo usado pelos outros signals do app.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  constructor(private readonly storageService: StorageService) {}

  readonly locale = computed<Locale>(() => this.storageService.settingsSignal().language);

  /** Dicionário completo de textos do idioma atual. Uso nos templates: `i18n.t().settings.title`. */
  readonly t = computed<Translations>(() => TRANSLATIONS[this.locale()] ?? TRANSLATIONS['pt-BR']);

  /** Nome do livro no idioma atual; em português retorna o nome original (fonte de dados canônica). */
  translateBookName(book: BibleBook): string {
    if (this.locale() === 'pt-BR') {
      return book.name;
    }
    const translation = BOOK_NAME_TRANSLATIONS[book.id];
    return translation?.[this.locale() as 'en' | 'es'] ?? book.name;
  }

  /** Rótulo curto do testamento ("Antigo"/"Novo") traduzido para o idioma atual. */
  translateTestament(testament: 'Antigo' | 'Novo'): string {
    if (this.locale() === 'pt-BR') {
      return testament;
    }
    return TESTAMENT_TRANSLATIONS[testament][this.locale() as 'en' | 'es'];
  }
}
