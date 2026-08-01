graph TB
    subgraph PWA["🌐 Bible Tracker Frontend PWA v0.6.0<br/>(Angular 19 Standalone + TypeScript)"]
        
        subgraph UI["🎨 Presentation Layer (UI Components)"]
            AppComp["AppComponent<br/>(Root: Sidenav, Toolbar, Router Outlet)"]
            
            subgraph Features["Feature Modules (Lazy-Loaded Routes)"]
                Home["📖 Home<br/>(Greeting, Continue Reading,<br/>Streak, Daily Verse)"]
                Books["📚 Books<br/>(66-book list,<br/>Search + Autocomplete,<br/>Filter, Virtual Scroll)"]
                BookDet["📄 Book Details<br/>(Chapters + Notes,<br/>Virtual Scroll,<br/>Toggle Complete)"]
                Stats["📊 Statistics<br/>(Dashboard:<br/>Overall Progress,<br/>3 Charts [MatTabs],<br/>All 66 Books [MatExpansion])"]
                History["⏱️ History<br/>(Full Reading Log,<br/>Search, Sort [MatMenu],<br/>Filter, Virtual Scroll)"]
                Settings["⚙️ Settings<br/>(Theme, Font, Size,<br/>Language, Reset)"]
                Backup["💾 Backup<br/>(Export/Import JSON)"]
            end
            
            subgraph Shared["🔧 Shared Components"]
                QuickSheet["Quick Actions Sheet<br/>(FAB Modal Navigation)"]
                MatUI["Angular Material 19<br/>(Sidenav, Tabs, Menu,<br/>Expansion, Tooltip,<br/>Badge, Autocomplete,<br/>Chips, Cards, etc.)"]
            end
            
            subgraph Charts["📈 Charts (ng2-charts + chart.js)"]
                DoughChart["Doughnut:<br/>Chapters Completed"]
                BarMonth["Bar: Monthly<br/>Reading Volume"]
                BarBook["Bar Horizontal:<br/>Progress per Book"]
            end
        end
        
        subgraph State["💾 State Management (Signals-Based)"]
            Storage["StorageService<br/>(Reactive Signals)<br/>━━━━━━━━━━━<br/>• progressSignal<br/>• settingsSignal<br/>• historySignal<br/>• getStats()"]
            
            LocalStorage["🗄️ LocalStorage<br/>Key: 'bible-pwa-state-v1'<br/>Format: JSON<br/>{<br/>  progress: {},<br/>  settings: {},<br/>  settingsMask: number,<br/>  history: []<br/>}"]
        end
        
        subgraph Models["🏗️ Data Models<br/>(interfaces)"]
            ChapModel["ChapterProgress<br/>id, bookId, chapterNum,<br/>completed, completedAt,<br/>notes"]
            BookModel["BookProgress<br/>bookId, completedChapters,<br/>totalChapters, %"]
            HistModel["ReadingHistoryEntry<br/>id, bookId, chapterNum,<br/>completedAt, notes"]
            SettModel["AppSettings<br/>theme, fontFamily,<br/>fontSize, language"]
            StatsModel["ReadingStats<br/>totalChapters, completed,<br/>remaining, books, streak"]
        end
        
        subgraph Core["🔌 Core Services"]
            I18nSvc["I18nService<br/>(pt-BR/en/es)<br/>t(), translateBookName(),<br/>translateTestament()"]
            BibleData["BibleDataService<br/>(Static: 66 books,<br/>OT/NT, chapters)<br/>getBookById()"]
            Bitmask["SettingsBitmask Utility<br/>(encode/decode<br/>AppSettings ↔ number)"]
        end
        
        subgraph I18n["🌍 i18n Data"]
            Trans["translations.ts<br/>(9+ namespaces:<br/>common, app, home,<br/>books, statistics,<br/>history, settings,<br/>backup)"]
            BookNames["book-name-translations.ts<br/>(66 books in en/es<br/>pt-BR = canonical)"]
            Locale["locale.util.ts<br/>(BCP47 mapping)"]
        end
        
        subgraph PWAInfra["🚀 PWA Infrastructure"]
            SW["Service Worker<br/>(ngsw-worker.js)<br/>offline-first strategy"]
            Manifest["Manifest<br/>(name, icons,<br/>display: standalone,<br/>theme_color,<br/>maskable icons)"]
            Perf["Performance<br/>• OnPush (all components)<br/>• Virtual Scroll (CDK)<br/>• Lazy Loading (routes)<br/>• Tree-shaking"]
        end
        
        subgraph Future["🔮 Future: Bible Content API"]
            FutureAPI["BibleContentService<br/>(Not yet implemented)<br/>Fetch verse text from:<br/>• Public API, OR<br/>• Static JSON (per version)<br/>• Custom BFF"]
            Versions["Bible Versions<br/>(Protestant, Catholic,<br/>Apocrypha, etc.)<br/>Multiple translations<br/>Multiple languages"]
            IndexedDB["IndexedDB<br/>(for large volume<br/>of verse text)"]
        end
    end
    
    subgraph Hosting["☁️ Deployment Targets"]
        Netlify["Netlify / Vercel<br/>Firebase Hosting"]
    end
    
    subgraph Browser["🌐 Browser Runtime"]
        Angular["Angular 19<br/>+ Material"]
        Router["Angular Router<br/>(Lazy Routes)"]
        RxJS["RxJS 7.8<br/>+ Signals"]
    end
    
    %% Connections
    AppComp --> Features
    AppComp --> Shared
    Features --> I18nSvc
    Features --> Storage
    Features --> BibleData
    Features --> Charts
    
    Shared --> MatUI
    
    Storage --> LocalStorage
    Storage --> Models
    
    Core --> I18n
    I18nSvc --> Trans
    I18nSvc --> BookNames
    
    Features --> Storage
    Stats --> Charts
    
    PWAInfra --> SW
    PWAInfra --> Manifest
    PWAInfra --> Perf
    
    Future -.->|Future Integration| FutureAPI
    FutureAPI -.->|Store large volumes| IndexedDB
    FutureAPI -.->|Define versions| Versions
    
    PWA -->|Deploy| Hosting
    PWA -->|Runs in| Browser
    Browser --> Angular
    Browser --> Router
    Browser --> RxJS
    
    classDef implemented fill:#4CAF50,stroke:#2E7D32,color:#fff
    classDef future fill:#FF9800,stroke:#E65100,color:#fff
    classDef infrastructure fill:#2196F3,stroke:#1565C0,color:#fff
    classDef data fill:#9C27B0,stroke:#6A1B9A,color:#fff
    
    class Home,Books,BookDet,Stats,History,Settings,Backup,AppComp,Shared,Charts implemented
    class FutureAPI,Versions,IndexedDB future
    class SW,Manifest,Perf,PWAInfra,Browser infrastructure
    class Storage,LocalStorage,Models,I18n data
