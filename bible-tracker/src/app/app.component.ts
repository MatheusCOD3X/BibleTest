import { Component, computed, effect, signal } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, distinctUntilChanged } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BibleDataService } from './core/services/bible-data.service';
import { I18nService } from './core/services/i18n.service';
import { StorageService } from './core/services/storage.service';
import { QuickActionsSheetComponent } from './shared/quick-actions-sheet.component';
import { APP_VERSION } from '../environments/version';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    NgIf,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatBottomSheetModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Bible Tracker';
  readonly appVersion = APP_VERSION;
  readonly isMobile = signal(false);
  readonly recentHistory = computed(() => this.storageService.historySignal().slice(0, 3));

  constructor(
    private readonly bottomSheet: MatBottomSheet,
    readonly bibleDataService: BibleDataService,
    readonly storageService: StorageService,
    readonly i18n: I18nService,
    breakpointObserver: BreakpointObserver
  ) {
    // Observa a largura da tela e atualiza `isMobile` quando ela cruzar 760px.
    // distinctUntilChanged ignora emissões repetidas e takeUntilDestroyed cancela a inscrição
    // sozinho quando o componente é destruído, evitando vazamento de memória.
    breakpointObserver
      .observe('(max-width: 760px)')
      .pipe(
        map((state) => state.matches),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((matches) => this.isMobile.set(matches));

    // `effect` roda de novo automaticamente sempre que um signal lido dentro dele muda
    // (aqui, toda vez que `settingsSignal` é atualizado, veja applySettingsToDocument()).
    effect(() => this.applySettingsToDocument());
  }

  openQuickActions(): void {
    this.bottomSheet.open(QuickActionsSheetComponent, {
      panelClass: 'quick-actions-sheet'
    });
  }

  // Aplica as configurações direto no <body> via classes/CSS custom properties, assim o
  // tema/fonte/tamanho valem para o app inteiro sem repetir essa lógica em cada componente.
  private applySettingsToDocument(): void {
    if (typeof document === 'undefined') {
      return;
    }
    const settings = this.storageService.settingsSignal();
    const body = document.body;

    body.classList.toggle('theme-dark', settings.theme === 'dark');
    body.classList.toggle('theme-light', settings.theme !== 'dark');

    body.classList.remove('font-inter', 'font-serif', 'font-mono');
    body.classList.add(`font-${settings.fontFamily}`);

    body.style.setProperty('--app-font-size', `${settings.fontSize}px`);

    body.classList.toggle('no-animations', !settings.animations);

    // Mantém o atributo `lang` do <html> sincronizado com o idioma escolhido, importante
    // para acessibilidade (leitores de tela) e para o `Intl`/`toLocaleTimeString` do navegador.
    document.documentElement.lang = settings.language;
  }
}
