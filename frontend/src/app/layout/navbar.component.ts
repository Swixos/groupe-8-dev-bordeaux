import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="nav-container">
        <a routerLink="/dashboard" class="nav-brand">
          <span class="material-icons-round brand-icon">eco</span>
          <span class="brand-text">Carbon<span class="brand-accent">Track</span></span>
        </a>

        <!-- Hamburger button (mobile) -->
        <button class="hamburger" (click)="toggleMenu()" [class.open]="menuOpen">
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div class="nav-links" [class.mobile-open]="menuOpen">
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">
            <span class="material-icons-round">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a routerLink="/sites/new" routerLinkActive="active" class="nav-link">
            <span class="material-icons-round">add_business</span>
            <span>Nouveau Site</span>
          </a>
          <a routerLink="/compare" routerLinkActive="active" class="nav-link">
            <span class="material-icons-round">compare_arrows</span>
            <span>Comparer</span>
          </a>
          <a routerLink="/reference-data" routerLinkActive="active" class="nav-link">
            <span class="material-icons-round">science</span>
            <span>Références</span>
          </a>
          <!-- Logout inside mobile menu -->
          <button class="nav-link mobile-logout" (click)="logout()">
            <span class="material-icons-round">logout</span>
            <span>Déconnexion</span>
          </button>
        </div>

        <div class="nav-user">
          <div class="user-avatar">
            <span class="material-icons-round">person</span>
          </div>
          <button class="btn-logout" (click)="logout()">
            <span class="material-icons-round">logout</span>
            <span class="logout-text">Déconnexion</span>
          </button>
        </div>
      </div>
    </nav>

    <!-- Overlay (mobile) -->
    <div class="mobile-overlay" *ngIf="menuOpen" (click)="toggleMenu()"></div>
  `,
  styles: [`
    .navbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: var(--navbar-height);
      background: rgba(10, 10, 10, 0.8);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      z-index: 1000;
      animation: slideDown 0.5s ease-out;
    }
    .nav-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 24px;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .nav-brand {
      display: flex;
      align-items: center;
      gap: 10px;
      text-decoration: none;
      color: var(--text-primary);
      z-index: 1002;
    }
    .brand-icon {
      font-size: 28px;
      color: var(--accent);
      filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.4));
    }
    .brand-text {
      font-size: 1.3rem;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .brand-accent {
      color: var(--accent);
    }
    .nav-links {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: var(--radius-md);
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.3s ease;
      background: none;
      border: none;
      cursor: pointer;
      font-family: var(--font-family);
    }
    .nav-link .material-icons-round {
      font-size: 20px;
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-link.active {
      color: var(--accent);
      background: rgba(16, 185, 129, 0.1);
    }
    .mobile-logout { display: none; }
    .nav-user {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-avatar .material-icons-round {
      font-size: 20px;
      color: var(--text-secondary);
    }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: var(--radius-md);
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-family: var(--font-family);
      cursor: pointer;
      transition: all 0.3s ease;
    }
    .btn-logout .material-icons-round {
      font-size: 18px;
    }
    .btn-logout:hover {
      color: var(--danger);
      border-color: rgba(239, 68, 68, 0.3);
      background: rgba(239, 68, 68, 0.05);
    }

    /* Hamburger button */
    .hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 36px;
      height: 36px;
      padding: 6px;
      background: none;
      border: none;
      cursor: pointer;
      z-index: 1002;
    }
    .hamburger span {
      display: block;
      width: 100%;
      height: 2px;
      background: var(--text-primary);
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
    }
    .hamburger.open span:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }
    .hamburger.open span:nth-child(2) {
      opacity: 0;
    }
    .hamburger.open span:nth-child(3) {
      transform: rotate(-45deg) translate(5px, -5px);
    }

    /* Mobile overlay */
    .mobile-overlay {
      display: none;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .hamburger {
        display: flex;
      }
      .nav-links {
        position: fixed;
        top: 0;
        right: -280px;
        width: 280px;
        height: 100vh;
        flex-direction: column;
        align-items: stretch;
        gap: 0;
        padding: calc(var(--navbar-height) + 16px) 16px 16px;
        background: rgba(10, 10, 10, 0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-left: 1px solid rgba(255, 255, 255, 0.06);
        z-index: 1001;
        transition: right 0.3s ease;
      }
      .nav-links.mobile-open {
        right: 0;
      }
      .nav-link {
        padding: 14px 16px;
        font-size: 1rem;
        border-radius: var(--radius-md);
      }
      .mobile-logout {
        display: flex;
        margin-top: auto;
        color: var(--danger);
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        padding-top: 16px;
      }
      .nav-user {
        display: none;
      }
      .mobile-overlay {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999;
      }
    }
  `]
})
export class NavbarComponent {
  menuOpen = false;

  constructor(private authService: AuthService, private router: Router) {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.menuOpen = false;
    });
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    this.authService.logout();
  }
}
