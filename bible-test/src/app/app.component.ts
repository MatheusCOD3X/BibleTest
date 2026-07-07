import { Component, signal } from '@angular/core';
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
import { QuickActionsSheetComponent } from './shared/quick-actions-sheet.component';

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
  readonly isMobile = signal(false);

  constructor(
    private readonly bottomSheet: MatBottomSheet,
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
  }

  openQuickActions(): void {
    this.bottomSheet.open(QuickActionsSheetComponent, {
      panelClass: 'quick-actions-sheet'
    });
  }
}
