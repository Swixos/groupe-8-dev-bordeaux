import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sites/new',
    loadComponent: () => import('./pages/site-form/site-form.component').then(m => m.SiteFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sites/:id/edit',
    loadComponent: () => import('./pages/site-form/site-form.component').then(m => m.SiteFormComponent),
    canActivate: [authGuard]
  },
  {
    path: 'sites/:id',
    loadComponent: () => import('./pages/site-detail/site-detail.component').then(m => m.SiteDetailComponent),
    canActivate: [authGuard]
  },
  {
    path: 'compare',
    loadComponent: () => import('./pages/compare/compare.component').then(m => m.CompareComponent),
    canActivate: [authGuard]
  },
  {
    path: 'reference-data',
    loadComponent: () => import('./pages/reference-data/reference-data.component').then(m => m.ReferenceDataComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
