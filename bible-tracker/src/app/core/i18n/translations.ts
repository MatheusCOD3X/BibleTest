import { AppSettings } from '../../models/bible.models';

/** Idioma suportado pelo app; reaproveita o mesmo tipo já usado em `AppSettings`. */
export type Locale = AppSettings['language'];

export interface DailyVerse {
  text: string;
  reference: string;
}

/**
 * Dicionário de textos da interface, organizado por tela/área (mesmo agrupamento das
 * pastas em `features/`). Cada componente injeta o `I18nService` e lê `i18n.t().<area>.<chave>`.
 */
export interface Translations {
  common: {
    home: string;
    books: string;
    statistics: string;
    history: string;
    backup: string;
    settings: string;
    save: string;
    cancel: string;
    close: string;
    chapter: string;
    chapters: string;
    of: string;
    chaptersRead: string;
    daysInARow: string;
    testamentOld: string;
    testamentNew: string;
    unknownBook: string;
  };
  app: {
    tagline: string;
    recentHistory: string;
    noHistoryYet: string;
    openMenuAria: string;
    closeMenuAria: string;
    goHomeAria: string;
    goStatisticsAria: string;
    quickActionsAria: string;
  };
  home: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    continueJourney: string;
    continueReadingCta: string;
    todayReading: string;
    currentStreak: string;
    keepGoing: string;
    dailySuggestion: string;
    favoriteVerseAria: string;
    chaptersToday: string;
    readingTime: string;
    dailyVerses: DailyVerse[];
  };
  books: {
    title: string;
    searchLabel: string;
    searchAria: string;
    filterAll: string;
    filterOld: string;
    filterNew: string;
    filterCompleted: string;
    filterInProgress: string;
    filterNotStarted: string;
  };
  bookDetails: {
    markComplete: string;
    unmark: string;
    percentComplete: string;
    pending: string;
    notes: string;
    bookNotFound: string;
    progressUpdated: string;
    bookMarkedComplete: string;
    bookProgressRemoved: string;
    completedLabel: string;
    remainingLabel: string;
    chaptersLabel: string;
  };
  statistics: {
    title: string;
    subtitle: string;
    overallProgress: string;
    chaptersCompletedOf: string;
    completedLabel: string;
    accumulatedSummary: string;
    totalChapters: string;
    remainingChapters: string;
    booksStarted: string;
    estimatedTime: string;
    completedBooks: string;
    daysInARow: string;
    chaptersRead: string;
    chaptersRemaining: string;
    progressByBook: string;
    recentReadings: string;
    noReadingsYet: string;
    chartProgressTab: string;
    chartMonthlyTab: string;
    chartBookTab: string;
    chartNoData: string;
    viewAllBooks: string;
  };
  history: {
    title: string;
    subtitle: string;
    searchLabel: string;
    searchAria: string;
    sortAria: string;
    sortRecent: string;
    sortOldest: string;
    sortBook: string;
    emptyState: string;
  };
  settings: {
    title: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    font: string;
    fontInter: string;
    fontSerif: string;
    fontMono: string;
    size: string;
    animations: string;
    language: string;
    languagePtBr: string;
    languageEn: string;
    languageEs: string;
    save: string;
    resetApp: string;
    confirmReset: string;
    settingsSaved: string;
    settingsCanceled: string;
    appReset: string;
  };
  backup: {
    title: string;
    intro: string;
    exportJson: string;
    importJson: string;
    dataLabel: string;
    exported: string;
    restored: string;
    invalidBackup: string;
  };
}

const PT_BR: Translations = {
  common: {
    home: 'Home',
    books: 'Livros',
    statistics: 'Estatísticas',
    history: 'Histórico',
    backup: 'Backup',
    settings: 'Configurações',
    save: 'Salvar',
    cancel: 'Cancelar',
    close: 'Fechar',
    chapter: 'Capítulo',
    chapters: 'capítulos',
    of: 'de',
    chaptersRead: 'capítulos lidos',
    daysInARow: 'dias consecutivos',
    testamentOld: 'Antigo',
    testamentNew: 'Novo',
    unknownBook: 'Livro'
  },
  app: {
    tagline: 'Leitura diária com progresso.',
    recentHistory: 'Histórico recente',
    noHistoryYet: 'Nenhuma leitura registrada ainda.',
    openMenuAria: 'Abrir menu de navegação',
    closeMenuAria: 'Fechar menu',
    goHomeAria: 'Ir para home',
    goStatisticsAria: 'Ir para estatisticas',
    quickActionsAria: 'Ações rápidas'
  },
  home: {
    greetingMorning: 'Bom dia',
    greetingAfternoon: 'Boa tarde',
    greetingEvening: 'Boa noite',
    continueJourney: 'Continue sua jornada de leitura',
    continueReadingCta: 'Continuar Leitura',
    todayReading: 'Leitura de Hoje',
    currentStreak: 'Sequência Atual',
    keepGoing: 'Continue assim! Você está indo muito bem.',
    dailySuggestion: 'Sugestão do Dia',
    favoriteVerseAria: 'Favoritar versículo',
    chaptersToday: 'Capítulos Hoje',
    readingTime: 'Tempo de Leitura',
    dailyVerses: [
      { text: 'Lampada para os meus pes e a tua palavra, e luz para o meu caminho.', reference: 'Salmos 119:105' },
      { text: 'Posso todas as coisas naquele que me fortalece.', reference: 'Filipenses 4:13' },
      { text: 'O Senhor e o meu pastor; nada me faltara.', reference: 'Salmos 23:1' },
      { text: 'Entrega o teu caminho ao Senhor; confia nele.', reference: 'Salmos 37:5' },
      { text: 'Alegrei-me com os que me disseram: Vamos a casa do Senhor.', reference: 'Salmos 122:1' }
    ]
  },
  books: {
    title: 'Livros',
    searchLabel: 'Pesquisar livro',
    searchAria: 'Buscar livro',
    filterAll: 'Todos',
    filterOld: 'Antigo Testamento',
    filterNew: 'Novo Testamento',
    filterCompleted: 'Concluídos',
    filterInProgress: 'Em andamento',
    filterNotStarted: 'Não iniciados'
  },
  bookDetails: {
    markComplete: 'Marcar livro completo',
    unmark: 'Desmarcar',
    percentComplete: 'concluído',
    pending: 'Pendente',
    notes: 'Observações',
    bookNotFound: 'Livro não encontrado.',
    progressUpdated: 'Progresso atualizado',
    bookMarkedComplete: 'Livro marcado como concluído',
    bookProgressRemoved: 'Progresso do livro removido',
    completedLabel: 'Concluídos',
    remainingLabel: 'Restantes',
    chaptersLabel: 'Capítulos'
  },
  statistics: {
    title: 'Dashboard e Estatísticas',
    subtitle: 'Progresso geral, métricas acumuladas e histórico em uma única visão.',
    overallProgress: 'Progresso geral',
    chaptersCompletedOf: 'capítulos concluídos',
    completedLabel: 'Concluído',
    accumulatedSummary: 'Resumo acumulado',
    totalChapters: 'Total de capítulos',
    remainingChapters: 'Capítulos restantes',
    booksStarted: 'Livros iniciados',
    estimatedTime: 'Tempo estimado',
    completedBooks: 'Livros Completos',
    daysInARow: 'Dias Consecutivos',
    chaptersRead: 'Capítulos Lidos',
    chaptersRemaining: 'Capítulos Restantes',
    progressByBook: 'Progresso por livro',
    recentReadings: 'Últimas leituras',
    noReadingsYet: 'Nenhuma leitura registrada ainda.',
    chartProgressTab: 'Progresso',
    chartMonthlyTab: 'Por mês',
    chartBookTab: 'Por livro',
    chartNoData: 'Ainda não há dados suficientes para exibir o gráfico.',
    viewAllBooks: 'Ver todos os 66 livros'
  },
  history: {
    title: 'Histórico',
    subtitle: 'Todas as suas leituras registradas, com busca, ordenação e filtros.',
    searchLabel: 'Pesquisar por livro',
    searchAria: 'Buscar por livro',
    sortAria: 'Ordenar histórico',
    sortRecent: 'Mais recentes',
    sortOldest: 'Mais antigas',
    sortBook: 'Livro (A-Z)',
    emptyState: 'Nenhum registro encontrado.'
  },
  settings: {
    title: 'Configurações',
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Escuro',
    font: 'Fonte',
    fontInter: 'Inter',
    fontSerif: 'Serif',
    fontMono: 'Mono',
    size: 'Tamanho',
    animations: 'Animações',
    language: 'Idioma',
    languagePtBr: 'Português (Brasil)',
    languageEn: 'English',
    languageEs: 'Español',
    save: 'Salvar',
    resetApp: 'Resetar aplicativo',
    confirmReset: 'Confirmar reset',
    settingsSaved: 'Configurações salvas',
    settingsCanceled: 'Alterações descartadas',
    appReset: 'App resetado'
  },
  backup: {
    title: 'Backup e restauração',
    intro: 'Exporte seu progresso em JSON e restaure quando necessário',
    exportJson: 'Exportar JSON',
    importJson: 'Importar JSON',
    dataLabel: 'Dados de backup',
    exported: 'Backup exportado',
    restored: 'Backup restaurado',
    invalidBackup: 'Arquivo de backup inválido.'
  }
};

const EN: Translations = {
  common: {
    home: 'Home',
    books: 'Books',
    statistics: 'Statistics',
    history: 'History',
    backup: 'Backup',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    chapter: 'Chapter',
    chapters: 'chapters',
    of: 'of',
    chaptersRead: 'chapters read',
    daysInARow: 'days in a row',
    testamentOld: 'Old',
    testamentNew: 'New',
    unknownBook: 'Book'
  },
  app: {
    tagline: 'Daily reading with progress tracking.',
    recentHistory: 'Recent history',
    noHistoryYet: 'No reading recorded yet.',
    openMenuAria: 'Open navigation menu',
    closeMenuAria: 'Close menu',
    goHomeAria: 'Go to home',
    goStatisticsAria: 'Go to statistics',
    quickActionsAria: 'Quick actions'
  },
  home: {
    greetingMorning: 'Good morning',
    greetingAfternoon: 'Good afternoon',
    greetingEvening: 'Good evening',
    continueJourney: 'Continue your reading journey',
    continueReadingCta: 'Continue Reading',
    todayReading: "Today's Reading",
    currentStreak: 'Current Streak',
    keepGoing: "Keep it up! You're doing great.",
    dailySuggestion: "Today's Suggestion",
    favoriteVerseAria: 'Favorite verse',
    chaptersToday: 'Chapters Today',
    readingTime: 'Reading Time',
    dailyVerses: [
      { text: 'Thy word is a lamp unto my feet, and a light unto my path.', reference: 'Psalm 119:105' },
      { text: 'I can do all things through Christ which strengtheneth me.', reference: 'Philippians 4:13' },
      { text: 'The Lord is my shepherd; I shall not want.', reference: 'Psalm 23:1' },
      { text: 'Commit thy way unto the Lord; trust also in him.', reference: 'Psalm 37:5' },
      { text: 'I was glad when they said unto me, Let us go into the house of the Lord.', reference: 'Psalm 122:1' }
    ]
  },
  books: {
    title: 'Books',
    searchLabel: 'Search book',
    searchAria: 'Search book',
    filterAll: 'All',
    filterOld: 'Old Testament',
    filterNew: 'New Testament',
    filterCompleted: 'Completed',
    filterInProgress: 'In progress',
    filterNotStarted: 'Not started'
  },
  bookDetails: {
    markComplete: 'Mark book complete',
    unmark: 'Unmark',
    percentComplete: 'complete',
    pending: 'Pending',
    notes: 'Notes',
    bookNotFound: 'Book not found.',
    progressUpdated: 'Progress updated',
    bookMarkedComplete: 'Book marked as complete',
    bookProgressRemoved: 'Book progress removed',
    completedLabel: 'Completed',
    remainingLabel: 'Remaining',
    chaptersLabel: 'Chapters'
  },
  statistics: {
    title: 'Dashboard & Statistics',
    subtitle: 'Overall progress, accumulated metrics and history in a single view.',
    overallProgress: 'Overall progress',
    chaptersCompletedOf: 'chapters completed',
    completedLabel: 'Completed',
    accumulatedSummary: 'Accumulated summary',
    totalChapters: 'Total chapters',
    remainingChapters: 'Remaining chapters',
    booksStarted: 'Books started',
    estimatedTime: 'Estimated time',
    completedBooks: 'Completed Books',
    daysInARow: 'Days in a Row',
    chaptersRead: 'Chapters Read',
    chaptersRemaining: 'Chapters Remaining',
    progressByBook: 'Progress by book',
    recentReadings: 'Recent readings',
    noReadingsYet: 'No reading recorded yet.',
    chartProgressTab: 'Progress',
    chartMonthlyTab: 'By month',
    chartBookTab: 'By book',
    chartNoData: 'Not enough data yet to show the chart.',
    viewAllBooks: 'View all 66 books'
  },
  history: {
    title: 'History',
    subtitle: 'All your recorded readings, with search, sorting and filters.',
    searchLabel: 'Search by book',
    searchAria: 'Search by book',
    sortAria: 'Sort history',
    sortRecent: 'Most recent',
    sortOldest: 'Oldest',
    sortBook: 'Book (A-Z)',
    emptyState: 'No records found.'
  },
  settings: {
    title: 'Settings',
    theme: 'Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    font: 'Font',
    fontInter: 'Inter',
    fontSerif: 'Serif',
    fontMono: 'Mono',
    size: 'Size',
    animations: 'Animations',
    language: 'Language',
    languagePtBr: 'Português (Brasil)',
    languageEn: 'English',
    languageEs: 'Español',
    save: 'Save',
    resetApp: 'Reset app',
    confirmReset: 'Confirm reset',
    settingsSaved: 'Settings saved',
    settingsCanceled: 'Changes discarded',
    appReset: 'App reset'
  },
  backup: {
    title: 'Backup & restore',
    intro: 'Export your progress as JSON and restore it whenever you need',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    dataLabel: 'Backup data',
    exported: 'Backup exported',
    restored: 'Backup restored',
    invalidBackup: 'Invalid backup file.'
  }
};

const ES: Translations = {
  common: {
    home: 'Inicio',
    books: 'Libros',
    statistics: 'Estadísticas',
    history: 'Historial',
    backup: 'Copia de seguridad',
    settings: 'Configuración',
    save: 'Guardar',
    cancel: 'Cancelar',
    close: 'Cerrar',
    chapter: 'Capítulo',
    chapters: 'capítulos',
    of: 'de',
    chaptersRead: 'capítulos leídos',
    daysInARow: 'días consecutivos',
    testamentOld: 'Antiguo',
    testamentNew: 'Nuevo',
    unknownBook: 'Libro'
  },
  app: {
    tagline: 'Lectura diaria con seguimiento de progreso.',
    recentHistory: 'Historial reciente',
    noHistoryYet: 'Aún no hay lecturas registradas.',
    openMenuAria: 'Abrir menú de navegación',
    closeMenuAria: 'Cerrar menú',
    goHomeAria: 'Ir a inicio',
    goStatisticsAria: 'Ir a estadísticas',
    quickActionsAria: 'Acciones rápidas'
  },
  home: {
    greetingMorning: 'Buenos días',
    greetingAfternoon: 'Buenas tardes',
    greetingEvening: 'Buenas noches',
    continueJourney: 'Continúa tu camino de lectura',
    continueReadingCta: 'Continuar Lectura',
    todayReading: 'Lectura de Hoy',
    currentStreak: 'Racha Actual',
    keepGoing: '¡Sigue así! Lo estás haciendo muy bien.',
    dailySuggestion: 'Sugerencia del Día',
    favoriteVerseAria: 'Marcar versículo como favorito',
    chaptersToday: 'Capítulos Hoy',
    readingTime: 'Tiempo de Lectura',
    dailyVerses: [
      { text: 'Lámpara es a mis pies tu palabra, y lumbrera a mi camino.', reference: 'Salmos 119:105' },
      { text: 'Todo lo puedo en Cristo que me fortalece.', reference: 'Filipenses 4:13' },
      { text: 'Jehová es mi pastor; nada me faltará.', reference: 'Salmos 23:1' },
      { text: 'Encomienda a Jehová tu camino, y confía en él.', reference: 'Salmos 37:5' },
      { text: 'Me alegré cuando me dijeron: A la casa de Jehová iremos.', reference: 'Salmos 122:1' }
    ]
  },
  books: {
    title: 'Libros',
    searchLabel: 'Buscar libro',
    searchAria: 'Buscar libro',
    filterAll: 'Todos',
    filterOld: 'Antiguo Testamento',
    filterNew: 'Nuevo Testamento',
    filterCompleted: 'Completados',
    filterInProgress: 'En progreso',
    filterNotStarted: 'No iniciados'
  },
  bookDetails: {
    markComplete: 'Marcar libro completo',
    unmark: 'Desmarcar',
    percentComplete: 'completado',
    pending: 'Pendiente',
    notes: 'Notas',
    bookNotFound: 'Libro no encontrado.',
    progressUpdated: 'Progreso actualizado',
    bookMarkedComplete: 'Libro marcado como completado',
    bookProgressRemoved: 'Progreso del libro eliminado',
    completedLabel: 'Completados',
    remainingLabel: 'Restantes',
    chaptersLabel: 'Capítulos'
  },
  statistics: {
    title: 'Panel y Estadísticas',
    subtitle: 'Progreso general, métricas acumuladas e historial en una sola vista.',
    overallProgress: 'Progreso general',
    chaptersCompletedOf: 'capítulos completados',
    completedLabel: 'Completado',
    accumulatedSummary: 'Resumen acumulado',
    totalChapters: 'Total de capítulos',
    remainingChapters: 'Capítulos restantes',
    booksStarted: 'Libros iniciados',
    estimatedTime: 'Tiempo estimado',
    completedBooks: 'Libros Completos',
    daysInARow: 'Días Consecutivos',
    chaptersRead: 'Capítulos Leídos',
    chaptersRemaining: 'Capítulos Restantes',
    progressByBook: 'Progreso por libro',
    recentReadings: 'Últimas lecturas',
    noReadingsYet: 'Aún no hay lecturas registradas.',
    chartProgressTab: 'Progreso',
    chartMonthlyTab: 'Por mes',
    chartBookTab: 'Por libro',
    chartNoData: 'Aún no hay suficientes datos para mostrar el gráfico.',
    viewAllBooks: 'Ver los 66 libros'
  },
  history: {
    title: 'Historial',
    subtitle: 'Todas tus lecturas registradas, con búsqueda, orden y filtros.',
    searchLabel: 'Buscar por libro',
    searchAria: 'Buscar por libro',
    sortAria: 'Ordenar historial',
    sortRecent: 'Más recientes',
    sortOldest: 'Más antiguas',
    sortBook: 'Libro (A-Z)',
    emptyState: 'No se encontraron registros.'
  },
  settings: {
    title: 'Configuración',
    theme: 'Tema',
    themeLight: 'Claro',
    themeDark: 'Oscuro',
    font: 'Fuente',
    fontInter: 'Inter',
    fontSerif: 'Serif',
    fontMono: 'Mono',
    size: 'Tamaño',
    animations: 'Animaciones',
    language: 'Idioma',
    languagePtBr: 'Português (Brasil)',
    languageEn: 'English',
    languageEs: 'Español',
    save: 'Guardar',
    resetApp: 'Restablecer aplicación',
    confirmReset: 'Confirmar restablecimiento',
    settingsSaved: 'Configuración guardada',
    settingsCanceled: 'Cambios descartados',
    appReset: 'Aplicación restablecida'
  },
  backup: {
    title: 'Copia de seguridad y restauración',
    intro: 'Exporta tu progreso en JSON y restáuralo cuando lo necesites',
    exportJson: 'Exportar JSON',
    importJson: 'Importar JSON',
    dataLabel: 'Datos de respaldo',
    exported: 'Copia de seguridad exportada',
    restored: 'Copia de seguridad restaurada',
    invalidBackup: 'Archivo de respaldo inválido.'
  }
};

export const TRANSLATIONS: Record<Locale, Translations> = {
  'pt-BR': PT_BR,
  en: EN,
  es: ES
};
