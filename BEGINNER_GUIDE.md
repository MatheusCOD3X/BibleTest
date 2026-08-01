# 🎯 Guia Rápido — Bible Tracker Frontend PWA

Bem-vindo! Este é um guia em alto nível para entender a estrutura do projeto.

---

## 📱 O que é?

**Bible Tracker** é um aplicativo web que ajuda você a:
- 📖 Rastrear leitura bíblica (qual capítulo você leu)
- 📊 Ver estatísticas e gráficos
- 📋 Manter histórico de leituras
- 🌙 Trocar tema (claro/escuro)
- 🌍 Usar em português, inglês ou espanhol

**PWA = Progressive Web App** → funciona **offline** (no seu navegador, sem internet)

---

## 🗂️ Estrutura simplificada

```
bible-tracker/
  ├── 📱 src/app/
  │   ├── 🎨 features/          ← As 7 "páginas" do app
  │   │   ├── 🏠 home           ← Tela inicial
  │   │   ├── 📚 books          ← Lista de 66 livros
  │   │   ├── 📄 book-details   ← Capítulos de um livro
  │   │   ├── 📊 statistics     ← Gráficos e dashboard
  │   │   ├── ⏱️ history        ← Histórico de leituras
  │   │   ├── ⚙️ settings       ← Configurações
  │   │   └── 💾 backup        ← Salvar/restaurar progresso
  │   │
  │   ├── 🔧 core/              ← "Motores" da aplicação
  │   │   ├── services/         ← Lógica (guardar dados, tradução, etc)
  │   │   └── i18n/             ← Textos em PT-BR, EN, ES
  │   │
  │   └── app.component.ts      ← Estrutura principal (menu, toolbar)
  │
  └── 📦 build/dist/            ← Arquivo pronto para enviar
```

**Regra de ouro**: Cada pasta `features/*/` é uma página diferente do app.

---

## 🔄 Fluxo de dados (como as coisas se comunicam)

```
┌─────────────────┐
│   Você clica    │  ex. "marcar capítulo como lido"
└────────┬────────┘
         ↓
┌─────────────────────────────┐
│ Componente (ex. Books page) │  Detecta o clique
└────────┬────────────────────┘
         ↓
┌──────────────────┐
│ StorageService   │  Guarda em localStorage
│  (dados)         │
└────────┬─────────┘
         ↓
┌──────────────────────────┐
│ localStorage do navegador│  Dados persistem offline
│ (seu dispositivo)        │
└──────────────────────────┘
```

**Tudo fica no seu navegador** → seus dados são privados, não vão para servidor nenhum (por enquanto).

---

## 🎨 As 7 páginas principais

| Página | Ícone | O que faz |
|--------|-------|----------|
| **Home** | 🏠 | Boas-vindas, seu versículo do dia, continuar leitura |
| **Books** | 📚 | Ver todos os 66 livros, clicar para ler |
| **Book Details** | 📄 | Ver capítulos de um livro, marcar como lido |
| **Statistics** | 📊 | 3 gráficos: progresso, leituras por mês, livros mais lidos |
| **History** | ⏱️ | Histórico completo (buscar, filtrar, ordenar) |
| **Settings** | ⚙️ | Tema, tamanho de fonte, idioma |
| **Backup** | 💾 | Baixar/carregar progresso (JSON) |

---

## 🔐 Dados (onde tudo fica guardado)

### LocalStorage (seu navegador)
```json
{
  "progress": {
    "gen:1": { "completed": true, "date": "2026-07-31", "notes": "" },
    "gen:2": { "completed": true, "date": "2026-07-31", "notes": "" }
  },
  "settings": {
    "theme": "dark",
    "language": "pt-BR",
    "fontSize": 16
  },
  "history": [
    { "book": "gen", "chapter": 1, "date": "2026-07-31" },
    { "book": "gen", "chapter": 2, "date": "2026-07-31" }
  ]
}
```

**Resumo**:
- Três grandes buckets: progresso, configurações, histórico
- Cada um atualiza quando você faz algo no app
- Nunca é enviado para servidor (por enquanto)

---

## 🎨 Componentes (blocos de construção do UI)

Cada página é feita de **componentes** — pequenos blocos reutilizáveis.

```
AppComponent (raiz)
  ├── Sidenav Menu (lateral)
  ├── Toolbar (topo)
  ├── Router Outlet (muda de página)
  │   ├── HomeComponent
  │   ├── BooksComponent (com cards de livro)
  │   ├── BookDetailsComponent (com lista de capítulos)
  │   ├── StatisticsComponent (com gráficos)
  │   ├── HistoryComponent (com lista de histórico)
  │   ├── SettingsComponent (com sliders, dropdowns)
  │   └── BackupComponent (com botões de export/import)
  └── FAB Button (flutuante inferior)
      └── QuickActionsSheet (modal com atalhos)
```

**Como ler código**: Procure pela palavra `Component` no nome do arquivo — é um bloco UI.

---

## 📊 Gráficos (v0.6.0)

Usamos `chart.js` (biblioteca de gráficos) + `ng2-charts` (adaptador para Angular).

**3 gráficos na página Statistics:**

1. **Doughnut (pizza)** → Capítulos concluídos vs. restantes
2. **Bar (colunas)** → Leituras por mês (últimos 6 meses)
3. **Horizontal Bar** → Livros com mais progresso (top 8)

Se não há histórico, mostra "Sem dados" → comece a ler!

---

## 🌍 Idiomas (i18n)

Toda frase do app está traduzida em 3 idiomas:

```
PT-BR: "Livros"
EN:    "Books"
ES:    "Libros"
```

**Como mudar idioma**: Settings → Language → escolher → pronto!

**Onde estão os textos**: `src/app/core/i18n/translations.ts` (um arquivo gigante com todas as frases)

---

## ⚡ Performance (por que é rápido)

1. **OnPush change detection** — a aplicação só re-renderiza quando necessário (não verifica tudo o tempo todo)
2. **Virtual Scroll** — se você tem 66 livros, só renderiza os visíveis na tela (~5 por vez)
3. **Lazy loading** — cada página só carrega quando você a acessa
4. **PWA** — depois do primeiro acesso, tudo funciona offline (Service Worker cacheado)

---

## 🚀 Como começar (dev)

```bash
# 1. Navegar até a pasta
cd bible-tracker

# 2. Instalar dependências
npm install

# 3. Iniciar servidor (abre http://localhost:4200)
npm start

# 4. Ver mudanças em tempo real (salve arquivo → app atualiza)
```

---

## 📝 Como modificar algo

### Adicionar um novo texto
1. Abra `src/app/core/i18n/translations.ts`
2. Procure pela seção (ex. `common`, `home`, `books`)
3. Adicione a chave em **todas** as 3 linguagens:
   ```typescript
   // PT-BR
   common: { myText: "Meu texto" }
   
   // EN
   common: { myText: "My text" }
   
   // ES
   common: { myText: "Mi texto" }
   ```
4. No template HTML, use:
   ```html
   {{ i18n.t().common.myText }}
   ```

### Alterar uma cor/tema
1. Abra `src/styles.scss`
2. Procure por `--color-primary` (ou outra variável CSS)
3. Mude o valor (ex. `#1976d2` → `#FF5733`)
4. Salve → app atualiza automaticamente

### Adicionar um novo ícone
1. Material Icons já está incluído (usado por `<mat-icon>name</mat-icon>`)
2. Procure em https://fonts.google.com/icons
3. Use: `<mat-icon>my_icon</mat-icon>`

---

## 🔮 Futuro (Road Map)

### Versão 0.7.0 (planejado)
- API pública de conteúdo bíblico (para ler os versículos)
- Suporte para múltiplas versões (protestante, católica, etc.)
- Mais idiomas de Bíblia

### Versão 1.0.0 (final)
- Sincronização entre dispositivos
- Planos de leitura customizados
- Notificações push

---

## ❓ Dúvidas?

- **Estrutura de pastas**: Veja `ARCHITECTURE.md` (completo)
- **Como o app funciona**: Veja `ARCHITECTURE_DIAGRAM.md` (visual, em Mermaid)
- **Nomes e branding**: Veja `NAMING_GUIDELINES.md`
- **Histórico de mudanças**: Veja `CHANGELOG.md`

---

**Última atualização**: 2026-07-31  
**Versão do app**: 0.6.0  
**Nível**: 🟢 Iniciante
