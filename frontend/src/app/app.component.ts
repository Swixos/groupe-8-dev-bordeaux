import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './layout/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent],
  template: `
    <app-navbar *ngIf="showNavbar"></app-navbar>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  get showNavbar(): boolean {
    const url = this.router.url;
    return !url.startsWith('/login') && !url.startsWith('/register');
  }
  constructor(private router: Router) {}
}
