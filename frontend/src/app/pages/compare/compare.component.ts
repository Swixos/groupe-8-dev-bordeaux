import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { NavbarComponent } from '../../layout/navbar.component';
import { SiteService } from '../../services/site.service';
import { Site, CompareResult } from '../../models/site.model';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective, NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page-content">
      <div class="container">
        <div class="page-header animate-slide-up">
          <h1 class="page-title">Comparer les <span class="text-accent">sites</span></h1>
          <p class="page-subtitle">Sélectionnez 2 à 4 sites pour comparer leurs émissions carbone</p>
        </div>

        <!-- Site Selection -->
        <div class="selection-card glass-card animate-slide-up" style="animation-delay:0.1s">
          <h3 class="section-title">
            <span class="material-icons-round" style="color:var(--accent)">checklist</span>
            Sélection des sites
          </h3>
          <div class="site-checkboxes">
            <label *ngFor="let site of allSites" class="checkbox-label"
                   [class.selected]="selectedIds.has(site.id!)">
              <input type="checkbox" [checked]="selectedIds.has(site.id!)"
                     (change)="toggleSite(site.id!)" [disabled]="!selectedIds.has(site.id!) && selectedIds.size >= 4">
              <span class="checkbox-custom">
                <span class="material-icons-round" *ngIf="selectedIds.has(site.id!)">check</span>
              </span>
              <span class="checkbox-text">
                <strong>{{ site.name }}</strong>
                <small>{{ site.city }}</small>
              </span>
            </label>
          </div>
          <button class="btn btn-primary" (click)="compare()"
                  [disabled]="selectedIds.size < 2 || comparing" style="margin-top:20px">
            <div class="spinner spinner-sm" *ngIf="comparing"></div>
            <span class="material-icons-round" *ngIf="!comparing">compare_arrows</span>
            <span *ngIf="!comparing">Comparer ({{ selectedIds.size }} sites)</span>
          </button>
        </div>

        <!-- Results -->
        <ng-container *ngIf="results.length > 0">
          <!-- Side-by-side cards -->
          <div class="compare-cards animate-slide-up" style="animation-delay:0.2s">
            <div *ngFor="let r of results" class="compare-card glass-card">
              <h3 class="compare-name">{{ r.siteName }}</h3>
              <div class="compare-stats">
                <div class="compare-stat">
                  <span class="compare-stat-label">Total CO₂</span>
                  <span class="compare-stat-value text-accent">{{ r.totalCo2 | number:'1.1-1' }} t</span>
                </div>
                <div class="compare-stat">
                  <span class="compare-stat-label">Construction</span>
                  <span class="compare-stat-value">{{ r.constructionCo2 | number:'1.1-1' }} t</span>
                </div>
                <div class="compare-stat">
                  <span class="compare-stat-label">Exploitation</span>
                  <span class="compare-stat-value">{{ r.exploitationCo2 | number:'1.1-1' }} t</span>
                </div>
                <div class="compare-stat">
                  <span class="compare-stat-label">CO₂/m²</span>
                  <span class="compare-stat-value">{{ r.co2PerSquareMeter | number:'1.2-2' }}</span>
                </div>
                <div class="compare-stat">
                  <span class="compare-stat-label">CO₂/employé</span>
                  <span class="compare-stat-value">{{ r.co2PerEmployee | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Charts -->
          <div class="charts-grid">
            <div class="chart-card glass-card animate-slide-up" style="animation-delay:0.3s">
              <h3 class="chart-title">
                <span class="material-icons-round">bar_chart</span>
                Comparaison des émissions
              </h3>
              <div class="chart-container">
                <canvas baseChart [data]="barChartData" [options]="barChartOptions" type="bar"></canvas>
              </div>
            </div>
            <div class="chart-card glass-card animate-slide-up" style="animation-delay:0.4s">
              <h3 class="chart-title">
                <span class="material-icons-round">radar</span>
                Profil comparatif
              </h3>
              <div class="chart-container">
                <canvas baseChart [data]="radarChartData" [options]="radarChartOptions" type="radar"></canvas>
              </div>
            </div>
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
    .page-header { margin-bottom: 32px; }
    .page-title { font-size: 2rem; font-weight: 800; }
    .page-subtitle { color: var(--text-secondary); margin-top: 4px; }
    .selection-card { padding: 28px; margin-bottom: 32px; }
    .section-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1.1rem;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .site-checkboxes {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 12px;
    }
    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(255,255,255,0.02);
    }
    .checkbox-label:hover {
      border-color: rgba(255,255,255,0.15);
      background: rgba(255,255,255,0.04);
    }
    .checkbox-label.selected {
      border-color: var(--accent);
      background: rgba(16, 185, 129, 0.08);
    }
    .checkbox-label input { display: none; }
    .checkbox-custom {
      width: 22px;
      height: 22px;
      border-radius: 6px;
      border: 2px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: all 0.3s ease;
    }
    .checkbox-label.selected .checkbox-custom {
      background: var(--accent);
      border-color: var(--accent);
    }
    .checkbox-custom .material-icons-round {
      font-size: 16px;
      color: white;
    }
    .checkbox-text {
      display: flex;
      flex-direction: column;
    }
    .checkbox-text strong {
      font-size: 0.9rem;
      font-weight: 600;
    }
    .checkbox-text small {
      font-size: 0.78rem;
      color: var(--text-muted);
    }
    .compare-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px;
      margin-bottom: 32px;
    }
    .compare-card { padding: 24px; text-align: center; }
    .compare-name {
      font-size: 1.05rem;
      font-weight: 700;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .compare-stats { display: flex; flex-direction: column; gap: 10px; }
    .compare-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .compare-stat-label { font-size: 0.825rem; color: var(--text-secondary); }
    .compare-stat-value { font-weight: 700; font-size: 0.95rem; }
    .charts-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .chart-card { padding: 24px; }
    .chart-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 20px;
    }
    .chart-title .material-icons-round { font-size: 22px; color: var(--accent); }
    .chart-container { position: relative; height: 300px; }
    @media (max-width: 768px) {
      .charts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CompareComponent implements OnInit {
  allSites: Site[] = [];
  selectedIds = new Set<number>();
  results: CompareResult[] = [];
  comparing = false;

  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  radarChartData: ChartData<'radar'> = { labels: [], datasets: [] };
  radarChartOptions: ChartConfiguration<'radar'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } } },
    scales: {
      r: {
        ticks: { color: '#64748b', backdropColor: 'transparent' },
        grid: { color: 'rgba(255,255,255,0.06)' },
        angleLines: { color: 'rgba(255,255,255,0.06)' },
        pointLabels: { color: '#94a3b8', font: { family: 'Inter' } }
      }
    }
  };

  constructor(private siteService: SiteService) {}

  ngOnInit() {
    this.siteService.getAll().subscribe(sites => this.allSites = sites);
  }

  toggleSite(id: number) {
    if (this.selectedIds.has(id)) {
      this.selectedIds.delete(id);
    } else if (this.selectedIds.size < 4) {
      this.selectedIds.add(id);
    }
  }

  compare() {
    this.comparing = true;
    const ids = Array.from(this.selectedIds);
    this.siteService.compare(ids).subscribe({
      next: (results) => {
        this.results = results;
        this.buildCharts();
        this.comparing = false;
      },
      error: () => { this.comparing = false; }
    });
  }

  private buildCharts() {
    const labels = this.results.map(r => r.siteName);
    const colors = ['#10B981', '#3b82f6', '#f59e0b', '#8b5cf6'];

    this.barChartData = {
      labels,
      datasets: [
        { label: 'Construction', data: this.results.map(r => r.constructionCo2),
          backgroundColor: colors.map(c => c + 'B3'), borderRadius: 4 },
        { label: 'Exploitation', data: this.results.map(r => r.exploitationCo2),
          backgroundColor: colors.map(c => c + '66'), borderRadius: 4 }
      ]
    };

    // Radar: normalize values
    const maxCo2 = Math.max(...this.results.map(r => r.totalCo2), 1);
    const maxSurface = Math.max(...this.results.map(r => r.surfaceArea), 1);
    const maxEmp = Math.max(...this.results.map(r => r.employeeCount), 1);
    const maxPerM2 = Math.max(...this.results.map(r => r.co2PerSquareMeter), 1);
    const maxPerEmp = Math.max(...this.results.map(r => r.co2PerEmployee), 1);

    this.radarChartData = {
      labels: ['Total CO₂', 'Surface', 'Employés', 'CO₂/m²', 'CO₂/employé'],
      datasets: this.results.map((r, i) => ({
        label: r.siteName,
        data: [
          (r.totalCo2 / maxCo2) * 100,
          (r.surfaceArea / maxSurface) * 100,
          (r.employeeCount / maxEmp) * 100,
          (r.co2PerSquareMeter / maxPerM2) * 100,
          (r.co2PerEmployee / maxPerEmp) * 100
        ],
        borderColor: colors[i],
        backgroundColor: colors[i] + '20',
        pointBackgroundColor: colors[i]
      }))
    };
  }
}
