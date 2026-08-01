# Changelog

Todas as mudanças importantes neste projeto estão documentadas neste arquivo.  
Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/) e [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [0.6.0] - 2026-07-31

### 📝 Contexto
Implementação de 4 prioridades chave: History screen, Charts & Statistics, Performance optimizations (OnPush + Virtual Scroll), e componentes Material faltantes. Também melhorias na documentação com foco em clarificar que é uma **aplicação frontend standalone (PWA)** sem backend incluso.

### ✨ Adicionado

#### Features
- **📖 History Screen** (`features/history/`)
  - Tela completa dedicada ao histórico de leituras
  - Rota lazy-loaded em `/history`
  - Busca por nome de livro (traduzido em tempo real)
  - Ordenação via MatMenu: mais recentes / mais antigas / por livro (A-Z)
  - Filtro por testamento (chips reutilizando `books.filter*` keys)
  - Lista virtualizada com CDK (`cdk-virtual-scroll-viewport`)
  - Novos textos i18n: namespace `history` (pt-BR/en/es)
  - Integração em nav links: sidenav (`app.component.html`) + quick-actions-sheet

- **📊 Statistics & Charts Enhancements** (rewrote `statistics.component.ts`)
  - 3 gráficos via ng2-charts (Chart.js v4.4.0):
    - **Doughnut chart**: Capítulos concluídos vs. restantes (progresso geral)
    - **Bar chart**: Volume de leituras nos últimos 6 meses (tendência)
    - **Horizontal bar chart**: Progresso percentual dos top 8 livros
  - Organização em `MatTabsModule` com lazy render (`<ng-template matTabContent>`)
  - Novo painel `MatExpansionModule`: "Ver todos os 66 livros" (lista completa com barra de progresso)
  - Helper método: `groupHistoryByMonth()` para agregar histórico por mês/ano
  - Novos textos i18n: `chartProgressTab`, `chartMonthlyTab`, `chartBookTab`, `chartNoData`, `viewAllBooks`

- **⚡ Performance Optimizations**
  - `ChangeDetectionStrategy.OnPush` aplicado em **todos** os componentes standalone:
    - AppComponent, HomeComponent, BooksComponent, BookDetailsComponent, StatisticsComponent, HistoryComponent, SettingsComponent, BackupComponent, QuickActionsSheetComponent
    - Funciona perfeitamente com Signals (Angular auto-marca dirty ao mudar signal)
  - CDK Virtual Scroll integrado em 3 listas:
    - **Books** (`books.component.html`): 66 cards com altura fixa (viewport 720px)
    - **History** (`history.component.html`): N entries com altura fixa (viewport 560px)
    - **BookDetails chapters** (`book-details.component.html`): até 150 capítulos (ex. Salmos) com altura fixa (viewport 640px)
  - Padrão: `itemSize` exato + altura CSS + `margin-bottom` alinhados (evita overlap)

- **🎨 Material Components Integration**
  - `MatTabsModule` — estatísticas com abas (3 gráficos)
  - `MatMenuModule` — ordenação do histórico (dropdown)
  - `MatTooltipModule` — dicas em hover nos botões (ícone-only, FAB, nav icons)
  - `MatBadgeModule` — badge na sequência de dias (Home > icon fire)
  - `MatExpansionModule` — painel expansível (ver todos os livros)
  - `MatAutocompleteModule` — autocompletar busca de livros (top 6 suggestions com navegação direta)

#### Infrastructure
- Chart.js registration in `src/main.ts` — `Chart.register(...registerables)` global (obrigatório no chart.js v4)
- Update i18n: adicionados 4 chaves em `statistics` namespace
- Atualização de versão semântica: 0.5.1 → **0.6.0** (minor bump)

#### Documentation
- **ARCHITECTURE.md** — documentação completa:
  - Visão geral do projeto (PWA, frontend-only)
  - Estrutura de diretórios com descrições
  - Modelo de dados (interfaces)
  - Persistência (StorageService + localStorage)
  - Componentes Angular Material
  - i18n runtime
  - Performance optimizations
  - Fluxo de dados (Signals)
  - Integração futura com Bible Content API (recomendações)
  - Roadmap até v1.0.0
  - Convenções de código

- **ARCHITECTURE_DIAGRAM.md** — diagrama Mermaid interativo:
  - Visualização de todas as camadas (UI, State, Models, Services, i18n, PWA, Future)
  - Conexões entre componentes
  - Color-coded por status (implemented, future, infrastructure, data)
  - Facilita compreensão de iniciantes

- **NAMING_GUIDELINES.md** — sugestões de branding:
  - 3 opções de nomenclatura (recomendação: "Bible Tracker Frontend PWA")
  - Guia de referências em documentação (evitar confusão frontend/backend)
  - Checklist de updates necessários
  - Badges/tags de branding

- **CHANGELOG.md** (este arquivo) — histórico de releases

### 🔄 Alterado

- **book-details.component.ts** — adicionado trackBy para virtual scroll
- **books.component.ts** — adicionado MatAutocompleteModule, Router injection, goToBook(), trackByBook()
- **statistics.component.html** — substituída lista estática por 3 charts em tabs + expansion panel
- **app.component.html** — adicionado link de navegação para History (`/history`)
- **quick-actions-sheet.component.ts** — adicionado link de navegação para History
- **i18n/translations.ts** — adicionados namespaces `history` e chaves para charts
- **package.json** — versão: 0.5.1 → 0.6.0

### 🐛 Corrigido
- N/A (nenhum bug crítico encontrado; todas as adições são novas features)

### ⚠️ Breaking Changes
- **Nenhum**. Todas as mudanças são backward-compatible.

### 📦 Dependências
- Sem novas dependências (chart.js + ng2-charts já estavam instaladas)
- Sem upgrades de versão

### 🧪 Testes
- Build: ✅ `npx ng build --configuration development` (sem erros)
- Tests: ✅ 13/13 tests passing (sem regressões)
- Coverage: Feature components NÃO têm testes isolados (convenção do projeto)

### 🚀 Deploy
- PWA pronta para deploy em Netlify, Vercel, Firebase Hosting
- Service Worker auto-gerado em build

---

## [0.5.0] - 2026-07-15

### ✨ Adicionado
- Full i18n implementation (PT-BR canonical, EN, ES)
- Runtime language switching via signal
- Settings bitmask utility (AppSettings ↔ number encoding)
- Language selector em Settings
- Novos testes: `i18n.service.spec.ts` (13 testes total)

### 🐛 Corrigido
- Font-size CSS var moved to `html` (was on `body`, broke `rem` units)
- Google Fonts link added (Inter, JetBrains Mono loading)

### 📚 Docs
- README.md: Added "Quick Start Guide for Developers" section

---

## [0.4.0] - 2026-07-01

### ✨ Adicionado
- Statistics page (progress card, summary, metrics)
- Reading history recent list (sidebar)
- Book-details chapter list with notes
- Material components (cards, progress bar, chips)
- Backup/import/export functionality

---

## [0.3.0] - 2026-06-15

### ✨ Adicionado
- Settings page (theme, font, size, reset)
- AppSettings model + bitmask encoding
- Theme switcher + CSS variables

---

## [0.2.0] - 2026-06-01

### ✨ Adicionado
- Books list (66 bible books)
- Book-details chapter view
- Chapter completion tracking
- StorageService with signals

---

## [0.1.0] - 2026-05-15

### ✨ Adicionado
- Initial project setup (Angular 19 standalone)
- Home page (greeting, daily verse, current reading)
- AppComponent (sidenav, toolbar)
- App routing
- BibleDataService (66 books canon)
- Basic styling (SCSS, CSS variables)
- PWA manifest + service worker

---

## Notas de versionamento

**Semântica de versão seguida**:
- **MAJOR** (1.x.0): Features transformacionais (ex. integração de conteúdo bíblico)
- **MINOR** (0.6.0): Features/improvements significativas
- **PATCH** (0.6.1): Bug fixes, typos, small tweaks

**Roadmap até v1.0.0**:
- [ ] Integração com Bible Content API (suporte a múltiplas versões)
- [ ] Sincronização entre dispositivos (requer BFF)
- [ ] Planos de leitura customizados
- [ ] Marcadores/notas por verso

---

**Última atualização**: 2026-07-31  
**Mantenedor**: Projeto Bible Tracker  
**Repositório**: https://github.com/usuario/bible-tracker-frontend-pwa
