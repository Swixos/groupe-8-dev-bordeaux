import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { NavbarComponent } from '../../layout/navbar.component';
import { KpiCardComponent } from '../../shared/kpi-card.component';
import { SiteService } from '../../services/site.service';
import { Site } from '../../models/site.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BaseChartDirective, NavbarComponent, KpiCardComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header animate-slide-up">
          <div>
            <h1 class="page-title">Tableau de bord</h1>
            <p class="page-subtitle">Vue d'ensemble de votre empreinte carbone</p>
          </div>
          <a routerLink="/sites/new" class="btn btn-primary">
            <span class="material-icons-round">add</span>
            Nouveau site
          </a>
        </div>

        <!-- Loading -->
        <div class="loading-container" *ngIf="loading">
          <div class="spinner"></div>
          <p class="text-secondary" style="margin-top:16px">Chargement des données...</p>
        </div>

        <ng-container *ngIf="!loading">
          <!-- KPI Cards -->
          <div class="kpi-grid">
            <app-kpi-card icon="business" label="Total Sites" [value]="sites.length"
                          iconBg="linear-gradient(135deg, #3b82f6, #1d4ed8)" delay="0.1s"></app-kpi-card>
            <app-kpi-card icon="cloud" label="Total CO₂" [value]="totalCo2" unit="tonnes"
                          iconBg="linear-gradient(135deg, #10B981, #059669)" delay="0.2s"></app-kpi-card>
            <app-kpi-card icon="square_foot" label="CO₂ Moyen / m²" [value]="avgCo2PerM2" unit="kg/m²"
                          iconBg="linear-gradient(135deg, #f59e0b, #d97706)" delay="0.3s"></app-kpi-card>
            <app-kpi-card icon="groups" label="CO₂ Moyen / Employé" [value]="avgCo2PerEmployee" unit="kg"
                          iconBg="linear-gradient(135deg, #8b5cf6, #6d28d9)" delay="0.4s"></app-kpi-card>
          </div>

          <!-- Charts -->
          <div class="charts-grid" *ngIf="sites.length > 0">
            <div class="chart-card glass-card animate-slide-up" style="animation-delay:0.3s">
              <h3 class="chart-title">
                <span class="material-icons-round">bar_chart</span>
                Émissions par site
              </h3>
              <div class="chart-container">
                <canvas baseChart
                        [data]="barChartData"
                        [options]="barChartOptions"
                        type="bar">
                </canvas>
              </div>
            </div>
            <div class="chart-card glass-card animate-slide-up" style="animation-delay:0.4s">
              <h3 class="chart-title">
                <span class="material-icons-round">donut_large</span>
                Répartition des émissions
              </h3>
              <div class="chart-container doughnut-container">
                <canvas baseChart
                        [data]="doughnutChartData"
                        [options]="doughnutChartOptions"
                        type="doughnut">
                </canvas>
              </div>
            </div>
          </div>

          <!-- Sites List -->
          <div class="section-header animate-slide-up" style="animation-delay:0.5s">
            <h2 class="section-title">Vos sites</h2>
          </div>

          <div class="sites-grid" *ngIf="sites.length > 0">
            <a *ngFor="let site of sites; let i = index"
               [routerLink]="['/sites', site.id]"
               class="site-card glass-card"
               [style.animation-delay]="(0.5 + i * 0.1) + 's'">
              <div class="site-card-header">
                <div class="site-icon">
                  <span class="material-icons-round">apartment</span>
                </div>
                <div class="site-info">
                  <h3 class="site-name">{{ site.name }}</h3>
                  <p class="site-location">
                    <span class="material-icons-round" style="font-size:14px">location_on</span>
                    {{ site.city }}, {{ site.country }}
                  </p>
                </div>
              </div>
              <div class="site-stats">
                <div class="site-stat">
                  <span class="stat-value">{{ site.carbonResult?.totalCo2?.toFixed(1) || '—' }}</span>
                  <span class="stat-label">tonnes CO₂</span>
                </div>
                <div class="site-stat">
                  <span class="stat-value">{{ site.surfaceArea | number }}</span>
                  <span class="stat-label">m²</span>
                </div>
                <div class="site-stat">
                  <span class="stat-value">{{ site.employeeCount || '—' }}</span>
                  <span class="stat-label">employés</span>
                </div>
              </div>
              <div class="site-card-arrow">
                <span class="material-icons-round">chevron_right</span>
              </div>
            </a>
          </div>

          <div class="empty-state glass-card animate-slide-up" *ngIf="sites.length === 0">
            <span class="material-icons-round empty-icon">domain_add</span>
            <h3>Aucun site enregistré</h3>
            <p class="text-secondary">Commencez par ajouter votre premier site pour calculer son empreinte carbone.</p>
            <a routerLink="/sites/new" class="btn btn-primary" style="margin-top:16px">
              <span class="material-icons-round">add</span>
              Ajouter un site
            </a>
          </div>
        </ng-container>
      </div>
    </main>
  `,
  styles: [`
    .page-content {
      padding-top: calc(var(--navbar-height) + 32px);
      padding-bottom: 48px;
      min-height: 100vh;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 32px;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 4px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 32px;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 40px;
    }
    .chart-card {
      padding: 24px;
    }
    .chart-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 20px;
      color: var(--text-primary);
    }
    .chart-title .material-icons-round {
      font-size: 22px;
      color: var(--accent);
    }
    .chart-container {
      position: relative;
      height: 280px;
    }
    .doughnut-container {
      height: 260px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .section-header {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 1.3rem;
      font-weight: 700;
    }
    .sites-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 16px;
    }
    .site-card {
      padding: 20px;
      text-decoration: none;
      color: inherit;
      display: block;
      position: relative;
      animation: slideUp 0.6s ease-out both;
      cursor: pointer;
    }
    .site-card:hover .site-card-arrow {
      opacity: 1;
      transform: translateX(0);
    }
    .site-card-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
    }
    .site-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.05));
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .site-icon .material-icons-round {
      color: var(--accent);
      font-size: 22px;
    }
    .site-name {
      font-size: 1.05rem;
      font-weight: 600;
      margin-bottom: 2px;
    }
    .site-location {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--text-muted);
      font-size: 0.825rem;
    }
    .site-stats {
      display: flex;
      gap: 24px;
    }
    .site-stat {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .stat-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    .site-card-arrow {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateX(8px) translateY(-50%);
      opacity: 0;
      transition: all 0.3s ease;
      color: var(--accent);
    }
    .empty-state {
      text-align: center;
      padding: 64px 32px;
    }
    .empty-icon {
      font-size: 56px;
      color: var(--text-muted);
      margin-bottom: 16px;
    }
    @media (max-width: 1024px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 640px) {
      .kpi-grid { grid-template-columns: 1fr; }
      .page-header { flex-direction: column; align-items: flex-start; gap: 16px; }
      .sites-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  sites: Site[] = [];
  loading = true;
  totalCo2 = 0;
  avgCo2PerM2 = 0;
  avgCo2PerEmployee = 0;

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' },
           stacked: true }
    }
  };

  doughnutChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', padding: 16, font: { family: 'Inter' } } }
    }
  };

  constructor(private siteService: SiteService) {}

  ngOnInit() {
    this.loadSites();
  }

  loadSites() {
    this.siteService.getAll().subscribe({
      next: (sites) => {
        this.sites = sites;
        this.loading = false;
        try {
          this.computeKpis();
          this.buildCharts();
        } catch (e) {
          console.error('Dashboard data processing error:', e);
        }
      },
      error: (err) => {
        console.error('Dashboard load error:', err);
        this.loading = false;
      }
    });
  }

  private computeKpis() {
    let totalSurface = 0;
    let totalEmployees = 0;
    this.totalCo2 = 0;
    for (const s of this.sites) {
      const co2 = s.carbonResult?.totalCo2 || 0;
      this.totalCo2 += co2;
      totalSurface += s.surfaceArea || 0;
      totalEmployees += s.employeeCount || 0;
    }
    this.avgCo2PerM2 = totalSurface > 0 ? (this.totalCo2 * 1000) / totalSurface : 0;
    this.avgCo2PerEmployee = totalEmployees > 0 ? (this.totalCo2 * 1000) / totalEmployees : 0;
  }

  private buildCharts() {
    const labels = this.sites.map(s => s.name);
    const construction = this.sites.map(s => s.carbonResult?.constructionCo2 || 0);
    const exploitation = this.sites.map(s => s.carbonResult?.exploitationCo2 || 0);

    this.barChartData = {
      labels,
      datasets: [
        { label: 'Construction', data: construction, backgroundColor: 'rgba(16, 185, 129, 0.7)', borderRadius: 4 },
        { label: 'Exploitation', data: exploitation, backgroundColor: 'rgba(59, 130, 246, 0.7)', borderRadius: 4 }
      ]
    };

    // Material breakdown from all sites
    const materialMap = new Map<string, number>();
    for (const s of this.sites) {
      if (s.carbonResult?.materialBreakdown) {
        for (const mb of s.carbonResult.materialBreakdown) {
          materialMap.set(mb.materialType, (materialMap.get(mb.materialType) || 0) + mb.emission);
        }
      }
    }
    const colors = ['#10B981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
    this.doughnutChartData = {
      labels: Array.from(materialMap.keys()),
      datasets: [{
        data: Array.from(materialMap.values()),
        backgroundColor: colors.slice(0, materialMap.size),
        borderWidth: 0
      }]
    };
  }
}
