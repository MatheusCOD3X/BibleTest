import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'books',
    loadComponent: () => import('./features/books/books.component').then((m) => m.BooksComponent)
  },
  {
    path: 'book/:id',
    loadComponent: () => import('./features/book-details/book-details.component').then((m) => m.BookDetailsComponent)
  },
  {
    path: 'statistics',
    loadComponent: () => import('./features/statistics/statistics.component').then((m) => m.StatisticsComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then((m) => m.SettingsComponent)
  },
  {
    path: 'backup',
    loadComponent: () => import('./features/backup/backup.component').then((m) => m.BackupComponent)
  }
];
