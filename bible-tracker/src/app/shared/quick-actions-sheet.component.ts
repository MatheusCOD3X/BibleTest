import { Component } from '@angular/core';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { I18nService } from '../core/services/i18n.service';

@Component({
  selector: 'app-quick-actions-sheet',
  standalone: true,
  imports: [MatListModule, MatIconModule, RouterLink],
  template: `
    <mat-nav-list>
      <a mat-list-item routerLink="/" (click)="close()">
        <mat-icon>home</mat-icon>
        <span>{{ i18n.t().common.home }}</span>
      </a>
      <a mat-list-item routerLink="/books" (click)="close()">
        <mat-icon>menu_book</mat-icon>
        <span>{{ i18n.t().common.books }}</span>
      </a>
      <a mat-list-item routerLink="/statistics" (click)="close()">
        <mat-icon>insights</mat-icon>
        <span>{{ i18n.t().common.statistics }}</span>
      </a>
      <a mat-list-item routerLink="/backup" (click)="close()">
        <mat-icon>backup</mat-icon>
        <span>{{ i18n.t().common.backup }}</span>
      </a>
      <a mat-list-item routerLink="/settings" (click)="close()">
        <mat-icon>settings</mat-icon>
        <span>{{ i18n.t().common.settings }}</span>
      </a>
    </mat-nav-list>
  `,
  styles: [
    `mat-icon { margin-right: 12px; color: rgba(15, 23, 42, 0.75); }`
  ]
})
export class QuickActionsSheetComponent {
  constructor(
    private readonly bottomSheetRef: MatBottomSheetRef<QuickActionsSheetComponent>,
    readonly i18n: I18nService
  ) {}

  close(): void {
    this.bottomSheetRef.dismiss();
  }
}
