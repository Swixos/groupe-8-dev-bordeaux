import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-page">
      <div class="auth-bg">
        <div class="bg-orb orb-1"></div>
        <div class="bg-orb orb-2"></div>
        <div class="bg-orb orb-3"></div>
      </div>

      <div class="auth-card glass-card animate-slide-up">
        <div class="auth-header">
          <div class="auth-logo">
            <span class="material-icons-round">eco</span>
          </div>
          <h1 class="auth-title">Créer un <span class="text-accent">compte</span></h1>
          <p class="auth-subtitle">Rejoignez CarbonTrack et mesurez votre impact</p>
        </div>

        <div class="error-msg" *ngIf="error" style="display:flex;align-items:center;gap:8px">
          <span class="material-icons-round" style="font-size:18px;flex-shrink:0">error_outline</span>
          {{ error }}
        </div>

        <form (ngSubmit)="onRegister()" class="auth-form">
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">person</span>
              <input type="text" id="username" class="form-control with-icon"
                     [(ngModel)]="username" name="username"
                     placeholder="Choisissez un nom d'utilisateur" required>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">email</span>
              <input type="email" id="email" class="form-control with-icon"
                     [(ngModel)]="email" name="email"
                     placeholder="votre@email.com" required>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">lock</span>
              <input type="password" id="password" class="form-control with-icon"
                     [(ngModel)]="password" name="password"
                     placeholder="Minimum 6 caractères" required>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le mot de passe</label>
            <div class="input-with-icon">
              <span class="material-icons-round input-icon">lock_outline</span>
              <input type="password" id="confirmPassword" class="form-control with-icon"
                     [(ngModel)]="confirmPassword" name="confirmPassword"
                     placeholder="Retapez votre mot de passe" required>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-block" [disabled]="loading">
            <div class="spinner spinner-sm" *ngIf="loading"></div>
            <span *ngIf="!loading">Créer mon compte</span>
          </button>
        </form>

        <div class="auth-footer">
          <span class="text-secondary">Déjà un compte ?</span>
          <a routerLink="/login" class="auth-link">Se connecter</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      position: relative;
      overflow: hidden;
    }
    .auth-bg {
      position: fixed;
      inset: 0;
      z-index: 0;
      overflow: hidden;
    }
    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.3;
    }
    .orb-1 {
      width: 400px; height: 400px;
      background: radial-gradient(circle, #10B981, transparent);
      top: -100px; left: -100px;
      animation: float 8s ease-in-out infinite;
    }
    .orb-2 {
      width: 300px; height: 300px;
      background: radial-gradient(circle, #8b5cf6, transparent);
      bottom: -50px; right: -50px;
      animation: float 10s ease-in-out infinite reverse;
    }
    .orb-3 {
      width: 200px; height: 200px;
      background: radial-gradient(circle, #3b82f6, transparent);
      top: 40%; right: 30%;
      animation: float 6s ease-in-out infinite;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 40px;
      position: relative;
      z-index: 1;
    }
    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }
    .auth-logo {
      width: 64px;
      height: 64px;
      margin: 0 auto 16px;
      border-radius: 16px;
      background: linear-gradient(135deg, #10B981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
    }
    .auth-logo .material-icons-round {
      font-size: 32px;
      color: white;
    }
    .auth-title {
      font-size: 1.75rem;
      font-weight: 800;
      margin-bottom: 8px;
    }
    .auth-subtitle {
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .input-with-icon {
      position: relative;
    }
    .input-icon {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      font-size: 20px;
      color: var(--text-muted);
      transition: color 0.3s;
    }
    .form-control.with-icon {
      padding-left: 44px;
    }
    .input-with-icon:focus-within .input-icon {
      color: var(--accent);
    }
    .btn-block {
      width: 100%;
      padding: 14px;
      font-size: 1rem;
      margin-top: 8px;
    }
    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.9rem;
    }
    .auth-link {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
      margin-left: 6px;
      transition: color 0.3s;
    }
    .auth-link:hover {
      color: var(--accent-light);
    }
  `]
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  error = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onRegister() {
    if (!this.username || !this.email || !this.password || !this.confirmPassword) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.authService.register({ username: this.username, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || "Erreur lors de l'inscription.";
      }
    });
  }
}
