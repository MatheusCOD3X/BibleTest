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
    breakpointObserver: BreakpointObserver
  ) {
    breakpointObserver
      .observe('(max-width: 760px)')
      .pipe(
        map((state) => state.matches),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((matches) => this.isMobile.set(matches));

    effect(() => this.applySettingsToDocument());
  }

  openQuickActions(): void {
    this.bottomSheet.open(QuickActionsSheetComponent, {
      panelClass: 'quick-actions-sheet'
    });
  }

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
  }
}
