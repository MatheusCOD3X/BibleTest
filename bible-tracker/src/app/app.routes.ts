import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent)
  },
  {
    path: 'dashboard',
    redirectTo: 'statistics',
    pathMatch: 'full'
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
