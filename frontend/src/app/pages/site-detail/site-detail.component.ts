import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { NavbarComponent } from '../../layout/navbar.component';
import { KpiCardComponent } from '../../shared/kpi-card.component';
import { SiteService } from '../../services/site.service';
import { Site, SiteHistory } from '../../models/site.model';

@Component({
  selector: 'app-site-detail',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, NavbarComponent, KpiCardComponent],
  template: `
    <app-navbar></app-navbar>
    <main class="page-content">
      <div class="container">
        <!-- Loading -->
        <div class="loading-container" *ngIf="loading">
          <div class="spinner"></div>
          <p class="text-secondary" style="margin-top:16px">Chargement du site...</p>
        </div>

        <ng-container *ngIf="!loading && site">
          <!-- Header -->
          <div class="detail-header animate-slide-up">
            <div>
              <div class="breadcrumb">
                <a (click)="goBack()" class="breadcrumb-link">Dashboard</a>
                <span class="material-icons-round" style="font-size:16px;color:var(--text-muted)">chevron_right</span>
                <span class="text-accent">{{ site.name }}</span>
              </div>
              <h1 class="page-title">{{ site.name }}</h1>
              <p class="page-subtitle">
                <span class="material-icons-round" style="font-size:16px;vertical-align:middle">location_on</span>
                {{ site.address ? site.address + ', ' : '' }}{{ site.city }}, {{ site.country }}
              </p>
            </div>
            <div class="header-actions">
              <button class="btn btn-primary" (click)="recalculate()" [disabled]="calculating">
                <div class="spinner spinner-sm" *ngIf="calculating"></div>
                <span class="material-icons-round" *ngIf="!calculating">refresh</span>
                <span *ngIf="!calculating">Recalculer</span>
              </button>
              <button class="btn btn-danger" (click)="deleteSite()">
                <span class="material-icons-round">delete</span>
                <span>Supprimer</span>
              </button>
            </div>
          </div>

          <!-- KPI Row -->
          <div class="kpi-grid" *ngIf="site.carbonResult">
            <app-kpi-card icon="cloud" label="Total CO₂" [value]="site.carbonResult.totalCo2" unit="tonnes"
                          iconBg="linear-gradient(135deg, #10B981, #059669)" delay="0.1s"></app-kpi-card>
            <app-kpi-card icon="construction" label="Construction" [value]="site.carbonResult.constructionCo2" unit="tonnes"
                          iconBg="linear-gradient(135deg, #f59e0b, #d97706)" delay="0.15s"></app-kpi-card>
            <app-kpi-card icon="bolt" label="Exploitation" [value]="site.carbonResult.exploitationCo2" unit="tonnes"
                          iconBg="linear-gradient(135deg, #3b82f6, #1d4ed8)" delay="0.2s"></app-kpi-card>
            <app-kpi-card icon="square_foot" label="CO₂ / m²" [value]="site.carbonResult.co2PerSquareMeter" unit="kg/m²"
                          iconBg="linear-gradient(135deg, #8b5cf6, #6d28d9)" delay="0.25s"></app-kpi-card>
            <app-kpi-card icon="person" label="CO₂ / Employé" [value]="site.carbonResult.co2PerEmployee" unit="kg"
                          iconBg="linear-gradient(135deg, #ec4899, #be185d)" delay="0.3s"></app-kpi-card>
          </div>

          <!-- Charts Row -->
          <div class="charts-grid">
            <div class="chart-card glass-card animate-slide-up" style="animation-delay:0.3s"
                 *ngIf="site.carbonResult?.materialBreakdown?.length">
              <h3 class="chart-title">
                <span class="material-icons-round">pie_chart</span>
                Répartition des émissions
              </h3>
              <div class="chart-container">
                <canvas baseChart [data]="pieChartData" [options]="pieChartOptions" type="pie"></canvas>
              </div>
            </div>
            <div class="chart-card glass-card animate-slide-up" style="animation-delay:0.4s" *ngIf="historyData.labels?.length">
              <h3 class="chart-title">
                <span class="material-icons-round">show_chart</span>
                Historique des émissions
              </h3>
              <div class="chart-container">
                <canvas baseChart [data]="historyData" [options]="lineChartOptions" type="line"></canvas>
              </div>
            </div>
          </div>

          <!-- Materials Table -->
          <div class="table-section glass-card animate-slide-up" style="animation-delay:0.5s"
               *ngIf="site.materials?.length">
            <h3 class="chart-title">
              <span class="material-icons-round">inventory_2</span>
              Matériaux
            </h3>
            <div class="table-wrapper">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Matériau</th>
                    <th>Quantité (t)</th>
                    <th>Émissions (tCO₂)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let mat of site.materials">
                    <td>
                      <div class="mat-cell">
                        <span class="mat-dot"></span>
                        {{ mat.materialType }}
                      </div>
                    </td>
                    <td>{{ mat.quantity | number:'1.1-1' }}</td>
                    <td class="text-accent">{{ (mat.emission || 0) | number:'1.2-2' }}</td>
                  </tr>
                </tbody>
              </table>
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
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
    }
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      gap: 16px;
      flex-wrap: wrap;
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-size: 0.85rem;
    }
    .breadcrumb-link {
      color: var(--text-secondary);
      cursor: pointer;
      text-decoration: none;
      transition: color 0.3s;
    }
    .breadcrumb-link:hover { color: var(--text-primary); }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .header-actions {
      display: flex;
      gap: 12px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 16px;
      margin-bottom: 32px;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
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
    .chart-title .material-icons-round {
      font-size: 22px;
      color: var(--accent);
    }
    .chart-container {
      position: relative;
      height: 280px;
    }
    .table-section { padding: 24px; }
    .table-wrapper { overflow-x: auto; }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th {
      text-align: left;
      padding: 12px 16px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-color);
    }
    .data-table td {
      padding: 14px 16px;
      font-size: 0.925rem;
      border-bottom: 1px solid rgba(255,255,255,0.03);
    }
    .data-table tr:hover td {
      background: rgba(255,255,255,0.02);
    }
    .mat-cell {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .mat-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent);
    }
    @media (max-width: 1200px) {
      .kpi-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media (max-width: 768px) {
      .kpi-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-grid { grid-template-columns: 1fr; }
      .detail-header { flex-direction: column; }
    }
  `]
})
export class SiteDetailComponent implements OnInit {
  site: Site | null = null;
  loading = true;
  calculating = false;
  history: SiteHistory[] = [];

  pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { color: '#94a3b8', padding: 12, font: { family: 'Inter' } } }
    }
  };

  historyData: ChartData<'line'> = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: '#94a3b8', font: { family: 'Inter' } } }
    },
    scales: {
      x: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b' }, grid: { color: 'rgba(255,255,255,0.04)' } }
    }
  };

  private siteId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private siteService: SiteService
  ) {}

  ngOnInit() {
    this.siteId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadSite();
    this.loadHistory();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  loadSite() {
    this.siteService.getById(this.siteId).subscribe({
      next: (site) => {
        this.site = site;
        this.buildPieChart();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      }
    });
  }

  loadHistory() {
    this.siteService.getHistory(this.siteId).subscribe({
      next: (history) => {
        this.history = history;
        this.buildHistoryChart();
      },
      error: () => {}
    });
  }

  recalculate() {
    this.calculating = true;
    this.siteService.calculate(this.siteId).subscribe({
      next: (result) => {
        if (this.site) this.site.carbonResult = result;
        this.buildPieChart();
        this.calculating = false;
      },
      error: () => { this.calculating = false; }
    });
  }

  deleteSite() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce site ? Cette action est irréversible.')) {
      this.siteService.delete(this.siteId).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => {}
      });
    }
  }

  private buildPieChart() {
    if (!this.site?.carbonResult?.materialBreakdown) return;
    const colors = ['#10B981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];
    const breakdown = this.site.carbonResult.materialBreakdown;
    this.pieChartData = {
      labels: breakdown.map(b => b.materialType),
      datasets: [{
        data: breakdown.map(b => b.emission),
        backgroundColor: colors.slice(0, breakdown.length),
        borderWidth: 0
      }]
    };
  }

  private buildHistoryChart() {
    if (!this.history.length) return;
    this.historyData = {
      labels: this.history.map(h => h.year.toString()),
      datasets: [
        {
          label: 'Total CO₂',
          data: this.history.map(h => h.totalCo2),
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#10B981'
        },
        {
          label: 'Construction',
          data: this.history.map(h => h.constructionCo2),
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointBackgroundColor: '#f59e0b'
        },
        {
          label: 'Exploitation',
          data: this.history.map(h => h.exploitationCo2),
          borderColor: '#3b82f6',
          backgroundColor: 'transparent',
          tension: 0.4,
          pointBackgroundColor: '#3b82f6'
        }
      ]
    };
  }
}
