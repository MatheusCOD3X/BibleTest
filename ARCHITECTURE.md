# Bible Tracker Frontend PWA — Arquitetura e Estrutura

**Versão**: 0.6.0  
**Tipo**: Progressive Web App (PWA) — Frontend standalone, sem backend incluso  
**Objetivo**: Aplicação de rastreamento de leitura bíblica com suporte a múltiplas versões (protestante, católica, etc.) via integração com API pública de conteúdo bíblico.

---

## 📋 Visão Geral

Bible Tracker é uma aplicação web moderna construída com **Angular 19** em modo **standalone** com **TypeScript**, utilizando o framework de UI **Angular Material 19** para componentes e **RxJS/Signals** para reatividade. O aplicativo é uma **PWA** (funciona offline após download inicial via Service Worker).

### Características principais
- ✅ Rastreamento de progresso de leitura (capítulos completados por livro)
- ✅ Suporte a múltiplos idiomas (PT-BR, English, Español)
- ✅ Mudança de tema (claro/escuro), fonte e tamanho de texto
- ✅ Dashboard com estatísticas e gráficos (ng2-charts)
- ✅ Histórico de leituras com busca, filtro, ordenação
- ✅ Backup/restauração de progresso
- ✅ Otimizações de performance (OnPush change detection, CDK virtual scroll)
- ⏳ **Futura**: Integração com API pública para múltiplas versões bíblicas (protestante, católica, apócrifos, etc.)

---

## 📁 Estrutura de diretórios

```
bible-tracker/                           # Raiz do projeto Angular (cd aqui antes de npm/ng)
├── dist/                                # Build output (production)
├── src/
│   ├── index.html                       # HTML entry point
│   ├── main.ts                          # Bootstrap; Chart.js registration
│   ├── styles.scss                      # Global styles, CSS vars, typography
│   ├── app/
│   │   ├── app.component.ts/html/scss   # Root component; sidenav, toolbar, FAB
│   │   ├── app.config.ts                # Angular config (providers)
│   │   ├── app.routes.ts                # Route table (lazy loading)
│   │   │
│   │   ├── core/                        # Services, utilities, guards
│   │   │   ├── services/
│   │   │   │   ├── bible-data.service.ts      # 66 books canon; static data (NOT touch)
│   │   │   │   ├── storage.service.ts         # Signals-based state; localStorage persistence
│   │   │   │   └── i18n.service.ts            # Translation & locale logic
│   │   │   ├── i18n/                         # i18n data
│   │   │   │   ├── translations.ts            # Dicts: pt-BR/en/es; 9+ namespaces
│   │   │   │   ├── book-name-translations.ts # Book names in en/es (pt-BR canonical)
│   │   │   │   └── locale.util.ts            # BCP47 locale mapping
│   │   │   └── utils/
│   │   │       └── settings-bitmask.ts       # Encode/decode AppSettings to bitmask
│   │   │
│   │   ├── features/                    # Feature modules (lazy-loaded routes)
│   │   │   ├── home/
│   │   │   │   ├── home.component.ts
│   │   │   │   ├── home.component.html
│   │   │   │   └── home.component.scss
│   │   │   ├── books/                   # 66-book list; search, filter, virtual scroll
│   │   │   │   ├── books.component.ts
│   │   │   │   ├── books.component.html (MatAutocomplete)
│   │   │   │   └── books.component.scss (cdk-virtual-scroll-viewport)
│   │   │   ├── book-details/            # Chapter list & notes for a single book; virtual scroll
│   │   │   │   ├── book-details.component.ts
│   │   │   │   ├── book-details.component.html
│   │   │   │   └── book-details.component.scss
│   │   │   ├── statistics/              # Dashboard: progress, metrics, 3 charts (MatTabs), all books (MatExpansion)
│   │   │   │   ├── statistics.component.ts   (ng2-charts BaseChartDirective)
│   │   │   │   ├── statistics.component.html (MatTabsModule, MatExpansionModule)
│   │   │   │   └── statistics.component.scss
│   │   │   ├── history/                 # Full history view; search, sort (MatMenu), filter, virtual scroll
│   │   │   │   ├── history.component.ts
│   │   │   │   ├── history.component.html
│   │   │   │   └── history.component.scss
│   │   │   ├── settings/                # Theme, font, size, language, reset, daily goal
│   │   │   │   ├── settings.component.ts
│   │   │   │   ├── settings.component.html
│   │   │   │   └── settings.component.scss
│   │   │   └── backup/
│   │   │       ├── backup.component.ts
│   │   │       ├── backup.component.html
│   │   │       └── backup.component.scss
│   │   │
│   │   ├── models/
│   │   │   └── bible.models.ts          # Interfaces: ChapterProgress, BookProgress, ReadingHistoryEntry, AppSettings, BibleBook, ReadingStats
│   │   │
│   │   └── shared/
│   │       └── quick-actions-sheet.component.ts  # Bottom-sheet nav (FAB modal)
│   │
│   └── environments/
│       └── version.ts                   # APP_VERSION (auto or manual)
│
├── public/
│   ├── manifest.webmanifest             # PWA manifest (name, icons, display, theme_color, etc.)
│   └── icons/                           # Icon set (72–512px, maskable + any)
│
├── ngsw-config.json                     # Service Worker caching strategy
├── angular.json                         # Build config (output, optimization, budgets)
├── tsconfig.json                        # TypeScript config
├── package.json                         # Dependencies: @angular/*, @angular/material, chart.js, ng2-charts, rxjs, etc.
└── README.md                            # User-facing docs + quick start guide

```

---

## 🏗️ Arquitetura de Dados & Estado

### Modelo de dados (types)
```typescript
interface ChapterProgress {
  id: string;                    // "${bookId}:${chapterNumber}"
  bookId: string;                // ex. "gen"
  chapterNumber: number;         // 1..N
  completed: boolean;
  completedAt: string;           // ISO date
  completedTime: string;         // "14:30"
  notes: string;
}

interface BookProgress {
  bookId: string;
  completedChapters: number;
  totalChapters: number;
  progressPercent: number;
  completed: boolean;
  started: boolean;
}

interface ReadingHistoryEntry {
  id: string;
  bookId: string;
  chapterNumber: number;
  completedAt: string;           // ISO date
  completedTime: string;
  notes: string;
}

interface AppSettings {
  theme: 'light' | 'dark';
  fontFamily: 'inter' | 'serif' | 'mono';
  fontSize: number;              // 12–24px
  animations: boolean;
  language: 'pt-BR' | 'en' | 'es';
}

interface BibleBook {
  id: string;                    // "gen", "exo", "mat", etc.
  name: string;                  // Portuguese (canonical)
  testament: 'Antigo' | 'Novo';
  chapters: number;
  abbreviation: string;
}

interface ReadingStats {
  totalChapters: number;         // 1189 (all)
  completedChapters: number;
  remainingChapters: number;
  completedBooks: number;
  startedBooks: number;
  notStartedBooks: number;
  progressPercent: number;
  streak: number;                // consecutive days
  dailyGoal: number;
  estimatedRemainingTime: string; // "120h 30m"
}
```

### Persistência (StorageService)
- **Key**: `bible-pwa-state-v1`
- **Format**: JSON com estrutura:
  ```json
  {
    "progress": { "<chapterId>": ChapterProgress, ... },
    "settings": AppSettings,
    "settingsMask": number,
    "history": ReadingHistoryEntry[]
  }
  ```
- **Storage backend**: `localStorage` (atualmente) ou futura `IndexedDB` para múltiplas versões de bíblias (volume de dados)
- **Signals**: `progressSignal`, `settingsSignal`, `historySignal` (reactive updates)
- **Métodos principais**:
  - `toggleChapter(book, chapterNum)` — marca/desmarca
  - `updateNotes(book, chapterNum, notes)`
  - `markBookComplete(book)` — todos os capítulos
  - `getStats(books)` — calcula ReadingStats
  - `export()` — JSON backup
  - `import(jsonData)` — restore

---

## 🎨 UI & Componentes Angular Material

### Material Modules usados
- `MatSidenavModule` — menu lateral responsivo
- `MatToolbarModule` — top bar
- `MatButtonModule` — botões
- `MatIconModule` — ícones Material
- `MatListModule` — listas
- `MatCardModule` — cards
- `MatProgressBarModule` — barra de progresso
- `MatProgressSpinnerModule` — spinner
- `MatFormFieldModule`, `MatInputModule` — form fields
- `MatSelectModule` — dropdowns
- `MatSlideToggleModule` — toggles
- `MatChipsModule` — chips de filtro
- `MatBottomSheetModule` — FAB modal (quick actions)
- `MatSnackBarModule` — notificações
- `MatCheckboxModule` — checkboxes
- `MatTabsModule` — abas (estatísticas: 3 gráficos)
- `MatMenuModule` — menu dropdown (ordenação histórico)
- `MatExpansionModule` — painel expansível (ver todos os 66 livros)
- `MatTooltipModule` — dicas em hover
- `MatBadgeModule` — badges (ex. streak count)
- `MatAutocompleteModule` — autocompletar busca (livros)

### CDK (Component Dev Kit)
- `ScrollingModule` (`cdk-virtual-scroll-viewport`) — virtualização de listas longas
  - Usada em: Books (66 items), History (N items), Book-details chapters (até 150)

### Gráficos
- `ng2-charts` (BaseChartDirective) + `chart.js`
  - Doughnut chart — progresso geral (capítulos concluídos vs. restantes)
  - Bar chart — leituras por mês (últimos 6 meses)
  - Horizontal bar chart — progresso por livro (top 8)

---

## 🌍 i18n (Internacionalização)

### Arquitetura
- **Sem** `@angular/localize` (build-time)
- **Com** `I18nService` + `Signals` (runtime)
- **Idiomas**: PT-BR (canonical), English, Español
- **Namespaces**: `common`, `app`, `home`, `books`, `bookDetails`, `statistics`, `history`, `settings`, `backup`
- **Livros**: Nome canônico em PT-BR em `BibleDataService`; tradução de EN/ES em `book-name-translations.ts`
- **Testamentos**: "Antigo/Novo" traduzidos em `TESTAMENT_TRANSLATIONS`

### Como usar nos templates
```html
<!-- Texto simples -->
<h1>{{ i18n.t().settings.title }}</h1>

<!-- Nome de livro traduzido -->
<span>{{ i18n.translateBookName(book) }}</span>

<!-- Testamento traduzido -->
<span>{{ i18n.translateTestament(book.testament) }}</span>
```

---

## 🚀 Performance & Otimizações

1. **ChangeDetectionStrategy.OnPush** — aplicado em TODOS os componentes standalone
   - Reduz detecção de mudanças desnecessária
   - Funciona perfeitamente com Signals (Angular marca dirty automaticamente)

2. **Virtual Scroll (CDK)** — listas longas não renderizam todos os itens
   - Books: 66 items
   - History: N items (filtrados, mas potencialmente centenas)
   - Book-details: até 150 capítulos (Salmos)

3. **Lazy loading** — rotas lazy-load seus componentes
   - Bundles menores, carregamento mais rápido

4. **PWA & Service Worker**
   - `ngsw-config.json` define estratégia de cache
   - App funciona offline após primeiro acesso
   - Atualização automática em background

5. **Tree-shaking & code splitting** — Angular CLI + Tree-shaking automático

---

## 🔄 Fluxo de Dados (Signals)

```
[Usuário interage]
    ↓
[StorageService.toggleChapter() / updateNotes() / ...]
    ↓
[Signal mutado: progressSignal.set() ou updateSignal()]
    ↓
[Computed signals recalculam: topProgress, stats, etc.]
    ↓
[Componentes com OnPush detectam mudança e re-renderizam]
    ↓
[localStorage atualizado em save()]
```

---

## 📡 Integração com API de Conteúdo Bíblico (Futura)

**Status atual**: NENHUMA integração implementada.

**Recomendação**: Quando implementar, aderir ao padrão:

1. **Criar novo `BibleContentService`** em `core/services/`
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class BibleContentService {
     constructor(private http: HttpClient) {}
     
     // getVersions(): Observable<BibleVersion[]>
     // getBook(versionId: string, bookId: string): Observable<VerseArray>
     // getVerse(versionId: string, bookId: string, chapterNum: number, verseNum: number): Observable<Verse>
   }
   ```

2. **Estratégia de cache**:
   - Opção A: JSON estático por versão (domínio público, ex. ACF)
   - Opção B: API pública com `dataGroups` no `ngsw-config.json`
   - Opção C: BFF próprio (requer backend separado)

3. **Modelo de dados para Verse**:
   ```typescript
   interface Verse {
     bookId: string;
     chapter: number;
     verse: number;
     text: string;
     versionId: string; // ex. "acf", "nvi", "naa", etc.
   }
   
   interface BibleVersion {
     id: string;           // "acf", "nvi", "naa", "douay-rheims"
     name: string;         // "Almeida Corrigida Fiel", "Nova Versão Internacional"
     language: string;     // "pt", "en", "es"
     type: 'protestant' | 'catholic' | 'other';
   }
   ```

4. **Adaptação de componentes**:
   - Criar novo `verse-viewer.component.ts` (exibir verso ao lado do checkbox de capítulo)
   - Adicionar `currentVersion` signal em `AppSettings`
   - Modificar `Statistics` para gráficos que incluam versão ativa
   - Cache em `IndexedDB` para grandes volumes de texto

**Não limitar a estrutura agora** — manter `BibleDataService` apenas para metadados de livros/capítulos, todo conteúdo de verso fica no futuro `BibleContentService`.

---

## 🧪 Testes

### Estrutura
- **Test runner**: Karma + Jasmine
- **Existentes**: 
  - `app.component.spec.ts` (10 testes)
  - `i18n.service.spec.ts` (2 testes)
  - `settings-bitmask.spec.ts` (1 teste)
- **Padrão**: Componentes de feature NÃO têm spec isolado (apenas app component)
- **Comando**: `npx ng test --watch=false --browsers=ChromeHeadless`
- **Status**: 13/13 testes passando (2026-07-31)

---

## 📦 Dependências principais

| Pacote | Versão | Uso |
|--------|--------|-----|
| `@angular/core` | 19.1.1 | Framework |
| `@angular/material` | 19.1.0 | UI components |
| `@angular/cdk` | 19.1.0 | Virtual scroll, layout utils |
| `chart.js` | 4.4.0 | Gráficos (canvas) |
| `ng2-charts` | 5.0.1 | Wrapper Angular p/ chart.js |
| `rxjs` | 7.8.0 | Reatividade (Observables) |
| `zone.js` | 0.15.0 | Angular zone management |

---

## 🎯 Próximos Passos (Roadmap)

1. **Versão 1.0.0**
   - [x] History screen (0.6.0)
   - [x] Charts (0.6.0)
   - [x] OnPush + Virtual Scroll (0.6.0)
   - [ ] API de conteúdo bíblico (versões múltiplas)
   - [ ] Sincronização entre dispositivos (opcional, requer backend)

2. **Melhorias futuras**
   - [ ] Planos de leitura customizados
   - [ ] Notas/marcadores por verso
   - [ ] Compartilhamento de planos
   - [ ] Estatísticas detalhadas (heatmaps, tempo médio/livro)
   - [ ] Dark mode aprimorado (OLED)
   - [ ] Notificações push (lembrete de leitura)

---

## 🛠️ Como desenvolver

### Setup
```bash
cd bible-tracker
npm install
npx ng serve
# Abrir http://localhost:4200
```

### Build
```bash
npx ng build --configuration production
# Output em dist/bible-tracker
```

### Deploy
- PWA pronta para Netlify, Vercel, Firebase Hosting, etc.
- `ngsw-worker.js` gerado automaticamente em build

### Modificar textos
1. Adicionar chave em `core/i18n/translations.ts` (interface + 3 dicts)
2. Usar nos templates: `i18n.t().<namespace>.<chave>`

### Adicionar nova feature
1. Criar pasta em `features/`
2. Criar component standalone (com `changeDetection: ChangeDetectionStrategy.OnPush`)
3. Adicionar rota em `app.routes.ts` (lazy loading)
4. Adicionar nav link em `app.component.html` + `quick-actions-sheet.component.ts`
5. Adicionar textos em `translations.ts` (PT-BR/EN/ES)

---

## 📝 Convenções de código

- **Componentes**: standalone, OnPush change detection, injetam `I18nService` pra i18n
- **Services**: `@Injectable({ providedIn: 'root' })`
- **Templates**: Use `i18n.t()` pra todos os textos, `*ngIf`/`*ngFor` → `@if`/`@for` syntax
- **Styles**: CSS variables em `styles.scss` (`--color-primary`, `--color-surface`, etc.)
- **Nomes de arquivos**: kebab-case (ex. `book-details.component.ts`)

---

**Última atualização**: 2026-07-31  
**Versão do documento**: Alinhado com Bible Tracker v0.6.0
