import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kpi-card glass-card" [style.animation-delay]="delay">
      <div class="kpi-icon" [style.background]="iconBg">
        <span class="material-icons-round">{{ icon }}</span>
      </div>
      <div class="kpi-content">
        <span class="kpi-label">{{ label }}</span>
        <div class="kpi-value-row">
          <span class="kpi-value">{{ displayValue }}</span>
          <span class="kpi-unit" *ngIf="unit">{{ unit }}</span>
        </div>
        <div class="kpi-trend" *ngIf="trend" [class.up]="trend > 0" [class.down]="trend < 0">
          <span class="material-icons-round trend-icon">{{ trend > 0 ? 'trending_up' : 'trending_down' }}</span>
          <span>{{ trend > 0 ? '+' : '' }}{{ trend }}%</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .kpi-card {
      padding: 24px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      animation: slideUp 0.6s ease-out both;
    }
    .kpi-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .kpi-icon .material-icons-round {
      font-size: 24px;
      color: white;
    }
    .kpi-content {
      flex: 1;
      min-width: 0;
    }
    .kpi-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .kpi-value-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-top: 4px;
    }
    .kpi-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
    }
    .kpi-unit {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .kpi-trend {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 8px;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .kpi-trend.up {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }
    .kpi-trend.down {
      background: rgba(16, 185, 129, 0.1);
      color: #10B981;
    }
    .trend-icon {
      font-size: 16px;
    }
  `]
})
export class KpiCardComponent implements OnInit {
  @Input() icon = 'info';
  @Input() label = '';
  @Input() value: number = 0;
  @Input() unit = '';
  @Input() trend?: number;
  @Input() delay = '0s';
  @Input() iconBg = 'linear-gradient(135deg, #10B981, #059669)';

  displayValue = '0';

  ngOnInit() {
    this.animateValue(0, this.value, 1200);
  }

  private animateValue(start: number, end: number, duration: number) {
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = start + (end - start) * eased;
      if (end >= 100) {
        this.displayValue = Math.round(current).toLocaleString('fr-FR');
      } else {
        this.displayValue = current.toFixed(end % 1 !== 0 ? 2 : 0);
      }
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }
}
