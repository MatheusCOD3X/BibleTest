# 📖 Bible Tracker Frontend PWA

**v0.6.0** | Progressive Web App (PWA) para rastreamento de leitura bíblica  
Built with [Angular 19](https://angular.io) + [TypeScript](https://www.typescriptlang.org/) + [Angular Material 19](https://material.angular.io)

![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)
![Tests](https://img.shields.io/badge/Tests-13%2F13%20Passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Frontend PWA](https://img.shields.io/badge/Type-Frontend%20PWA-blue?logo=angular&logoColor=white)

## Guia rápido para novos desenvolvedores

Este projeto é um **PWA (Progressive Web App) standalone**, 100% frontend, sem backend próprio incluído. Todo o progresso de leitura, histórico e configurações são salvos localmente no navegador (`localStorage`) via `StorageService`. Não é preciso configurar banco de dados, servidor, ou variáveis de ambiente para rodar o projeto localmente.

### 📚 Documentação

- **[BEGINNER_GUIDE.md](../BEGINNER_GUIDE.md)** ← 🟢 Comece aqui se é novo no projeto (explicação em alto nível)
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** — Documentação completa da estrutura, serviços, modelos de dados
- **[ARCHITECTURE_DIAGRAM.md](../ARCHITECTURE_DIAGRAM.md)** — Diagrama visual (Mermaid) da arquitetura
- **[PDF_EXPORT_GUIDE.md](../PDF_EXPORT_GUIDE.md)** — Como exportar o diagrama para PDF
- **[NAMING_GUIDELINES.md](../NAMING_GUIDELINES.md)** — Guia de branding e nomenclatura ("Frontend PWA")
- **[CHANGELOG.md](../CHANGELOG.md)** — Histórico de mudanças por versão


### Pré-requisitos

- **Node.js** (recomendado 20.x LTS ou 18.19+) e **npm** (instalado junto com o Node)
- **Angular CLI** — não precisa instalar globalmente, pode usar `npx ng ...`; se preferir instalar globalmente: `npm install -g @angular/cli`
- Um navegador Chrome/Edge instalado (usado pelo Karma para rodar os testes)

### Passo a passo para rodar o projeto

> ⚠️ O app Angular fica dentro da pasta `bible-tracker/`, não na raiz do repositório. Sempre rode os comandos abaixo de dentro dessa pasta.

```bash
# 1. Entre na pasta do app
cd bible-tracker

# 2. Instale as dependências
npm install

# 3. Suba o servidor de desenvolvimento
npm start
# (equivalente a "ng serve")
```

Depois disso, abra `http://localhost:4200/` no navegador. O app recarrega automaticamente a cada alteração salva.

### Outros comandos úteis

| Comando | O que faz |
| --- | --- |
| `npm start` | Sobe o servidor de dev em `http://localhost:4200` |
| `npm run build` | Gera o build de produção em `dist/bible-tracker` |
| `npm run watch` | Build contínuo em modo desenvolvimento (útil para depurar o bundle) |
| `npm test` | Roda os testes unitários (Karma + Jasmine) |
| `ng generate component nome-do-componente` | Gera um novo componente seguindo o padrão do projeto |
| `npm run release:patch` / `release:minor` / `release:major` | Sobe a versão do `package.json` (usa `npm version`) e cria o commit/tag de release |

### Estrutura do projeto (visão geral)

```
src/app/
  core/services/     -> serviços singleton (dados da Bíblia, persistência/localStorage)
  core/utils/         -> funções utilitárias puras (ex.: bitmask de configurações)
  features/           -> uma pasta por tela (home, books, book-details, statistics, settings, backup)
  models/             -> interfaces/tipos compartilhados (bible.models.ts)
  shared/             -> componentes reutilizáveis entre features
```

- **`StorageService`** (`core/services/storage.service.ts`) é o coração da persistência: guarda progresso de leitura, histórico e configurações (`AppSettings`) no `localStorage`, em formato JSON. As configurações também são espelhadas em um **bitmask** compacto (`core/utils/settings-bitmask.ts`) — veja a seção abaixo.
- **`BibleDataService`** apenas expõe a lista estática de livros/capítulos da Bíblia (dado local, sem chamada de rede).
- Não há chamadas HTTP nem `HttpClient` configurado no projeto hoje — veja a seção "Integração com backend/BFF" mais abaixo.

### Configurações: JSON + Bitmask

Além do objeto `AppSettings` salvo como JSON, o `StorageService` mantém um `settingsMaskSignal` que representa as mesmas configurações como um único número (bitmask), útil para sincronizar de forma compacta com um backend/BFF no futuro. O JSON continua sendo a fonte de verdade; o bitmask é recalculado automaticamente sempre que as configurações mudam e é apenas usado como fallback caso o JSON de um backup esteja ausente/corrompido.

Ver `src/app/core/utils/settings-bitmask.ts` para o layout de bits e as funções `encodeSettingsToBitmask` / `decodeBitmaskFromSettings`.

### Integração com backend/BFF

Atualmente o app **não** possui nenhuma chamada de API: não há `HttpClient` configurado em `app.config.ts`, nem arquivos `environment.ts`/`environment.development.ts`, nem serviços de API. Todo o estado vive no `localStorage` do navegador.

#### 🔮 Futuro: Múltiplas versões bíblicas

Em desenvolvimento futuro (v1.0.0+), o projeto integrará com uma API de conteúdo bíblico para suportar múltiplas versões:
- **Versões protestantes** (ACF, NVI, NVT, etc.)
- **Versões católicas** (Ave Maria, Pastoral, etc.)
- **Apócrifos e outras tradições**
- **Múltiplos idiomas**

**Recomendação arquitetural**: Criar `BibleContentService` separado em `core/services/` que abstrai a origem do conteúdo (API pública, JSON estático, ou BFF customizado). **Nenhuma limitação ou estrutura especial será imposta agora** — a arquitetura é flexível o suficiente para qualquer dessas abordagens.

Para suporte a múltiplas versões com grande volume de dados, considerar:
- Migrar de `localStorage` para `IndexedDB` (suporta gigabytes vs. 5MB do localStorage)
- Adicionar `dataGroups` em `ngsw-config.json` para cache de conteúdo

Ao integrar um BFF/API, sugerimos:

1. Adicionar `provideHttpClient()` em `src/app/app.config.ts`.
2. Criar `src/environments/environment.ts` e `environment.development.ts` com a URL base da API.
3. Criar `src/app/core/services/bible-content.service.ts` para centralizar as chamadas HTTP.
4. Manter `StorageService` como camada de persistência local/offline-first.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
