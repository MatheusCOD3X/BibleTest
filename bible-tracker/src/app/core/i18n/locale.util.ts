import { AppSettings } from '../../models/bible.models';

/** Converte o idioma salvo nas configurações para um código BCP 47 aceito pelas APIs `Intl`/`toLocaleTimeString`. */
export function toBcp47Locale(language: AppSettings['language']): string {
  switch (language) {
    case 'en':
      return 'en-US';
    case 'es':
      return 'es-ES';
    default:
      return 'pt-BR';
  }
}
