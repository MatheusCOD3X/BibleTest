/**
 * Traduções dos nomes dos livros e dos testamentos, indexadas pelo `id` do livro
 * (ver `BibleDataService`). O português (`book.name` original) continua sendo a
 * fonte de dados canônica; este arquivo só fornece os nomes equivalentes em
 * inglês e espanhol para exibição, usados pelo `I18nService`.
 */
export interface BookNameTranslation {
  en: string;
  es: string;
}

export const BOOK_NAME_TRANSLATIONS: Record<string, BookNameTranslation> = {
  gen: { en: 'Genesis', es: 'Génesis' },
  exo: { en: 'Exodus', es: 'Éxodo' },
  lev: { en: 'Leviticus', es: 'Levítico' },
  num: { en: 'Numbers', es: 'Números' },
  deu: { en: 'Deuteronomy', es: 'Deuteronomio' },
  jos: { en: 'Joshua', es: 'Josué' },
  jdg: { en: 'Judges', es: 'Jueces' },
  rut: { en: 'Ruth', es: 'Rut' },
  '1sa': { en: '1 Samuel', es: '1 Samuel' },
  '2sa': { en: '2 Samuel', es: '2 Samuel' },
  '1ki': { en: '1 Kings', es: '1 Reyes' },
  '2ki': { en: '2 Kings', es: '2 Reyes' },
  '1ch': { en: '1 Chronicles', es: '1 Crónicas' },
  '2ch': { en: '2 Chronicles', es: '2 Crónicas' },
  ezr: { en: 'Ezra', es: 'Esdras' },
  neh: { en: 'Nehemiah', es: 'Nehemías' },
  est: { en: 'Esther', es: 'Ester' },
  job: { en: 'Job', es: 'Job' },
  ps: { en: 'Psalms', es: 'Salmos' },
  pro: { en: 'Proverbs', es: 'Proverbios' },
  ecc: { en: 'Ecclesiastes', es: 'Eclesiastés' },
  cant: { en: 'Song of Solomon', es: 'Cantares' },
  isa: { en: 'Isaiah', es: 'Isaías' },
  jer: { en: 'Jeremiah', es: 'Jeremías' },
  lam: { en: 'Lamentations', es: 'Lamentaciones' },
  eze: { en: 'Ezekiel', es: 'Ezequiel' },
  dan: { en: 'Daniel', es: 'Daniel' },
  hos: { en: 'Hosea', es: 'Oseas' },
  joe: { en: 'Joel', es: 'Joel' },
  amo: { en: 'Amos', es: 'Amós' },
  oba: { en: 'Obadiah', es: 'Abdías' },
  jon: { en: 'Jonah', es: 'Jonás' },
  mic: { en: 'Micah', es: 'Miqueas' },
  nah: { en: 'Nahum', es: 'Nahúm' },
  hab: { en: 'Habakkuk', es: 'Habacuc' },
  zep: { en: 'Zephaniah', es: 'Sofonías' },
  hag: { en: 'Haggai', es: 'Hageo' },
  zec: { en: 'Zechariah', es: 'Zacarías' },
  mal: { en: 'Malachi', es: 'Malaquías' },
  mat: { en: 'Matthew', es: 'Mateo' },
  mar: { en: 'Mark', es: 'Marcos' },
  luk: { en: 'Luke', es: 'Lucas' },
  joh: { en: 'John', es: 'Juan' },
  act: { en: 'Acts', es: 'Hechos' },
  rom: { en: 'Romans', es: 'Romanos' },
  '1co': { en: '1 Corinthians', es: '1 Corintios' },
  '2co': { en: '2 Corinthians', es: '2 Corintios' },
  gal: { en: 'Galatians', es: 'Gálatas' },
  eph: { en: 'Ephesians', es: 'Efesios' },
  php: { en: 'Philippians', es: 'Filipenses' },
  col: { en: 'Colossians', es: 'Colosenses' },
  '1th': { en: '1 Thessalonians', es: '1 Tesalonicenses' },
  '2th': { en: '2 Thessalonians', es: '2 Tesalonicenses' },
  '1ti': { en: '1 Timothy', es: '1 Timoteo' },
  '2ti': { en: '2 Timothy', es: '2 Timoteo' },
  tit: { en: 'Titus', es: 'Tito' },
  phm: { en: 'Philemon', es: 'Filemón' },
  heb: { en: 'Hebrews', es: 'Hebreos' },
  jas: { en: 'James', es: 'Santiago' },
  '1pe': { en: '1 Peter', es: '1 Pedro' },
  '2pe': { en: '2 Peter', es: '2 Pedro' },
  '1jn': { en: '1 John', es: '1 Juan' },
  '2jn': { en: '2 John', es: '2 Juan' },
  '3jn': { en: '3 John', es: '3 Juan' },
  jud: { en: 'Jude', es: 'Judas' },
  rev: { en: 'Revelation', es: 'Apocalipsis' }
};

export const TESTAMENT_TRANSLATIONS: Record<'Antigo' | 'Novo', BookNameTranslation> = {
  Antigo: { en: 'Old', es: 'Antiguo' },
  Novo: { en: 'New', es: 'Nuevo' }
};
