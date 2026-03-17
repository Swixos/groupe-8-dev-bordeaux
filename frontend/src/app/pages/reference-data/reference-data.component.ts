import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReferenceDataService } from '../../services/reference-data.service';
import { ReferenceData } from '../../models/reference-data.model';

@Component({
  selector: 'app-reference-data',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page-content">
      <div class="container">
        <!-- Header -->
        <div class="page-header animate-slide-up">
          <div>
            <h1 class="page-title">Données de <span class="text-accent">référence</span></h1>
            <p class="page-subtitle">Gérez les valeurs de référence environnementales</p>
          </div>
          <button class="btn btn-primary" (click)="openCreateForm()">
            <span class="material-icons-round">add</span>
            Ajouter
          </button>
        </div>

        <!-- Loading -->
        <div class="loading-container" *ngIf="loading">
          <div class="spinner"></div>
          <p class="text-secondary" style="margin-top:16px">Chargement des données...</p>
        </div>

        <ng-container *ngIf="!loading">
          <!-- Form Modal -->
          <div class="modal-overlay" *ngIf="showForm" (click)="closeForm()">
            <div class="modal-card animate-slide-up" (click)="$event.stopPropagation()">
              <div class="modal-header">
                <h2>{{ editingItem ? 'Modifier' : 'Ajouter' }} une donnée</h2>
                <button class="btn-icon" (click)="closeForm()">
                  <span class="material-icons-round">close</span>
                </button>
              </div>
              <form (ngSubmit)="saveItem()">
                <div class="form-grid">
                  <div class="form-group">
                    <label>Clé</label>
                    <input type="text" [(ngModel)]="formData.key" name="key" required [disabled]="!!editingItem" placeholder="ex: panneaux_photovoltaiques">
                  </div>
                  <div class="form-group">
                    <label>Label</label>
                    <input type="text" [(ngModel)]="formData.label" name="label" required placeholder="ex: Panneaux photovoltaïques">
                  </div>
                  <div class="form-group">
                    <label>Valeur</label>
                    <input type="number" [(ngModel)]="formData.value" name="value" required step="any">
                  </div>
                  <div class="form-group">
                    <label>Unité</label>
                    <input type="text" [(ngModel)]="formData.unit" name="unit" required placeholder="ex: kWh/m²/an">
                  </div>
                  <div class="form-group">
                    <label>Catégorie</label>
                    <select [(ngModel)]="formData.category" name="category" required>
                      <option value="">-- Choisir --</option>
                      <option *ngFor="let cat of categories" [value]="cat.key">{{ cat.label }}</option>
                      <option value="__new">+ Nouvelle catégorie</option>
                    </select>
                  </div>
                  <div class="form-group" *ngIf="formData.category === '__new'">
                    <label>Nouvelle catégorie (clé)</label>
                    <input type="text" [(ngModel)]="newCategory" name="newCategory" placeholder="ex: dechets">
                  </div>
                  <div class="form-group full-width">
                    <label>Description</label>
                    <input type="text" [(ngModel)]="formData.description" name="description" placeholder="Description optionnelle">
                  </div>
                </div>
                <div class="form-actions">
                  <button type="button" class="btn btn-secondary" (click)="closeForm()">Annuler</button>
                  <button type="submit" class="btn btn-primary">{{ editingItem ? 'Modifier' : 'Créer' }}</button>
                </div>
              </form>
            </div>
          </div>

          <!-- Categories -->
          <div class="categories-grid">
            <div class="category-card animate-slide-up" *ngFor="let cat of categories; let i = index" [style.animation-delay]="(i * 0.05) + 's'">
              <div class="category-header">
                <span class="material-icons-round category-icon">{{ getCategoryIcon(cat.key) }}</span>
                <h3>{{ cat.label }}</h3>
                <span class="badge">{{ cat.items.length }}</span>
              </div>
              <div class="ref-table">
                <div class="ref-row" *ngFor="let item of cat.items">
                  <div class="ref-info">
                    <span class="ref-label">{{ item.label }}</span>
                    <span class="ref-desc" *ngIf="item.description">{{ item.description }}</span>
                  </div>
                  <div class="ref-value">
                    <strong>{{ item.value }}</strong>
                    <span class="ref-unit">{{ item.unit }}</span>
                  </div>
                  <div class="ref-actions">
                    <button class="btn-icon btn-edit" (click)="openEditForm(item)" title="Modifier">
                      <span class="material-icons-round">edit</span>
                    </button>
                    <button class="btn-icon btn-delete" (click)="deleteItem(item)" title="Supprimer">
                      <span class="material-icons-round">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-state" *ngIf="categories.length === 0">
            <span class="material-icons-round" style="font-size:48px;color:var(--text-muted)">inventory_2</span>
            <p class="text-secondary">Aucune donnée de référence</p>
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
      align-items: center;
      justify-content: space-between;
      margin-bottom: 32px;
    }
    .categories-grid {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .category-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }
    .category-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      background: rgba(255,255,255,0.02);
      border-bottom: 1px solid var(--border-color);
    }
    .category-icon {
      font-size: 22px;
      color: var(--accent);
    }
    .category-header h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
      text-transform: capitalize;
    }
    .badge {
      margin-left: auto;
      background: rgba(16,185,129,0.15);
      color: var(--accent);
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
    }
    .ref-table {
      display: flex;
      flex-direction: column;
    }
    .ref-row {
      display: flex;
      align-items: center;
      padding: 12px 20px;
      border-bottom: 1px solid rgba(255,255,255,0.04);
      transition: background 0.2s;
    }
    .ref-row:last-child { border-bottom: none; }
    .ref-row:hover { background: rgba(255,255,255,0.03); }
    .ref-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .ref-label {
      font-weight: 500;
      font-size: 0.9rem;
    }
    .ref-desc {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .ref-value {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-right: 16px;
    }
    .ref-value strong {
      font-size: 1.1rem;
      color: var(--accent);
    }
    .ref-unit {
      font-size: 0.8rem;
      color: var(--text-secondary);
    }
    .ref-actions {
      display: flex;
      gap: 4px;
    }
    .btn-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-md);
      border: none;
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-icon .material-icons-round { font-size: 18px; }
    .btn-edit:hover { color: var(--accent); background: rgba(16,185,129,0.1); }
    .btn-delete:hover { color: var(--danger); background: rgba(239,68,68,0.1); }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(4px);
      z-index: 1100;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .modal-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--border-color);
    }
    .modal-header h2 {
      margin: 0;
      font-size: 1.1rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      padding: 24px;
    }
    .full-width { grid-column: 1 / -1; }
    .form-group label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .form-group input, .form-group select {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 0.9rem;
      font-family: var(--font-family);
      transition: border-color 0.2s;
      box-sizing: border-box;
    }
    .form-group input:focus, .form-group select:focus {
      outline: none;
      border-color: var(--accent);
    }
    .form-group select option {
      background: #1a1a2e;
      color: #e2e8f0;
    }
    .form-group input:disabled {
      opacity: 0.5;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      padding: 16px 24px;
      border-top: 1px solid var(--border-color);
    }
    .btn-secondary {
      padding: 10px 20px;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-family: var(--font-family);
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      color: var(--text-primary);
      border-color: var(--text-secondary);
    }
    .empty-state {
      text-align: center;
      padding: 60px 20px;
    }
  `]
})
export class ReferenceDataComponent implements OnInit {
  loading = true;
  items: ReferenceData[] = [];
  categories: { key: string; label: string; items: ReferenceData[] }[] = [];
  showForm = false;
  editingItem: ReferenceData | null = null;
  formData: Partial<ReferenceData> = {};
  newCategory = '';

  private categoryLabels: Record<string, string> = {
    energie: 'Énergie',
    ressources: 'Ressources',
    materiaux: 'Matériaux',
    compensation: 'Compensation',
    transport: 'Transport',
    numerique: 'Numérique',
  };

  constructor(
    private refService: ReferenceDataService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.refService.getAll().subscribe({
      next: (data) => {
        this.items = data;
        this.buildCategories();
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  buildCategories() {
    const map = new Map<string, ReferenceData[]>();
    for (const item of this.items) {
      if (!map.has(item.category)) map.set(item.category, []);
      map.get(item.category)!.push(item);
    }
    this.categories = Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, items]) => ({
        key,
        label: this.categoryLabels[key] || key,
        items,
      }));
  }

  getCategoryIcon(key: string): string {
    const icons: Record<string, string> = {
      energie: 'bolt',
      ressources: 'water_drop',
      materiaux: 'construction',
      compensation: 'park',
      transport: 'directions_car',
      numerique: 'computer',
    };
    return icons[key] || 'category';
  }

  openCreateForm() {
    this.editingItem = null;
    this.formData = { key: '', label: '', value: 0, unit: '', category: '', description: '' };
    this.newCategory = '';
    this.showForm = true;
  }

  openEditForm(item: ReferenceData) {
    this.editingItem = item;
    this.formData = { ...item };
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.editingItem = null;
  }

  saveItem() {
    const data = { ...this.formData };
    if (data.category === '__new') {
      data.category = this.newCategory;
    }

    if (this.editingItem) {
      this.refService.update(this.editingItem.id, data).subscribe({
        next: () => {
          this.closeForm();
          this.loadData();
        },
        error: (err) => console.error('Update failed', err),
      });
    } else {
      this.refService.create(data).subscribe({
        next: () => {
          this.closeForm();
          this.loadData();
        },
        error: (err) => console.error('Create failed', err),
      });
    }
  }

  deleteItem(item: ReferenceData) {
    if (!confirm(`Supprimer "${item.label}" ?`)) return;
    this.refService.delete(item.id).subscribe({
      next: () => this.loadData(),
      error: (err) => console.error('Delete failed', err),
    });
  }
}
