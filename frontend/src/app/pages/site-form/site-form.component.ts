import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SiteService } from '../../services/site.service';
import { SiteMaterial } from '../../models/site.model';

@Component({
  selector: 'app-site-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="page-content">
      <div class="container">
        <div class="page-header animate-slide-up">
          <h1 class="page-title">{{ isEditMode ? 'Modifier le' : 'Nouveau' }} <span class="text-accent">site</span></h1>
          <p class="page-subtitle">{{ isEditMode ? 'Modifiez les informations de votre site' : 'Renseignez les informations de votre site pour calculer son empreinte carbone' }}</p>
        </div>

        <!-- Loading -->
        <div class="loading-container" *ngIf="loadingData">
          <div class="spinner"></div>
          <p class="text-secondary" style="margin-top:16px">Chargement du site...</p>
        </div>

        <ng-container *ngIf="!loadingData">
          <div class="error-msg" *ngIf="error">{{ error }}</div>

          <form (ngSubmit)="onSubmit()" class="form-sections">
            <!-- Section 1: General Info -->
            <div class="form-section glass-card animate-slide-up" style="animation-delay:0.1s">
              <div class="section-header-row">
                <span class="section-number">1</span>
                <div>
                  <h2 class="section-title">Informations générales</h2>
                  <p class="text-secondary" style="font-size:0.85rem">Identité et localisation du site</p>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Nom du site *</label>
                  <input class="form-control" [(ngModel)]="site.name" name="name"
                         placeholder="Ex: Siège social Bordeaux" required>
                </div>
                <div class="form-group">
                  <label>Adresse</label>
                  <input class="form-control" [(ngModel)]="site.address" name="address"
                         placeholder="123 rue de la République">
                </div>
                <div class="form-group">
                  <label>Ville *</label>
                  <input class="form-control" [(ngModel)]="site.city" name="city"
                         placeholder="Bordeaux" required>
                </div>
                <div class="form-group">
                  <label>Pays</label>
                  <input class="form-control" [(ngModel)]="site.country" name="country"
                         placeholder="France">
                </div>
              </div>
            </div>

            <!-- Section 2: Characteristics -->
            <div class="form-section glass-card animate-slide-up" style="animation-delay:0.2s">
              <div class="section-header-row">
                <span class="section-number">2</span>
                <div>
                  <h2 class="section-title">Caractéristiques</h2>
                  <p class="text-secondary" style="font-size:0.85rem">Dimensions et équipements du site</p>
                </div>
              </div>
              <div class="form-grid">
                <div class="form-group">
                  <label>Surface (m²) *</label>
                  <input type="number" class="form-control" [(ngModel)]="site.surfaceArea" name="surfaceArea"
                         placeholder="5000" required min="1">
                </div>
                <div class="form-group">
                  <label>Places de parking</label>
                  <input type="number" class="form-control" [(ngModel)]="site.parkingSpaces" name="parkingSpaces"
                         placeholder="100" min="0">
                </div>
                <div class="form-group">
                  <label>Consommation énergétique (MWh/an)</label>
                  <input type="number" class="form-control" [(ngModel)]="site.energyConsumption" name="energyConsumption"
                         placeholder="1840" min="0" step="1">
                </div>
                <div class="form-group">
                  <label>Nombre d'employés</label>
                  <input type="number" class="form-control" [(ngModel)]="site.employeeCount" name="employeeCount"
                         placeholder="250" min="0">
                </div>
                <div class="form-group">
                  <label>Postes de travail</label>
                  <input type="number" class="form-control" [(ngModel)]="site.workstationCount" name="workstationCount"
                         placeholder="200" min="0">
                </div>
              </div>
            </div>

            <!-- Section 3: Materials -->
            <div class="form-section glass-card animate-slide-up" style="animation-delay:0.3s">
              <div class="section-header-row">
                <span class="section-number">3</span>
                <div>
                  <h2 class="section-title">Matériaux de construction</h2>
                  <p class="text-secondary" style="font-size:0.85rem">Ajoutez les matériaux utilisés dans la construction</p>
                </div>
              </div>

              <div class="materials-list">
                <div *ngFor="let mat of materials; let i = index" class="material-row animate-fade-in">
                  <div class="form-group" style="flex:2">
                    <label *ngIf="i === 0">Type de matériau</label>
                    <select class="form-control" [(ngModel)]="mat.materialType" [name]="'matType'+i">
                      <option value="">-- Sélectionner --</option>
                      <option *ngFor="let t of materialTypes" [value]="t.value">{{ t.label }}</option>
                    </select>
                  </div>
                  <div class="form-group" style="flex:1">
                    <label *ngIf="i === 0">Quantité (tonnes)</label>
                    <input type="number" class="form-control" [(ngModel)]="mat.quantity" [name]="'matQty'+i"
                           placeholder="0" min="0" step="0.1">
                  </div>
                  <button type="button" class="btn btn-danger btn-sm btn-icon"
                          [style.margin-top]="i === 0 ? '24px' : '0'"
                          (click)="removeMaterial(i)">
                    <span class="material-icons-round">close</span>
                  </button>
                </div>
              </div>

              <button type="button" class="btn btn-secondary" (click)="addMaterial()" style="margin-top:12px">
                <span class="material-icons-round">add</span>
                Ajouter un matériau
              </button>
            </div>

            <!-- Submit -->
            <div class="form-actions animate-slide-up" style="animation-delay:0.4s">
              <button type="submit" class="btn btn-primary btn-lg" [disabled]="submitting">
                <div class="spinner spinner-sm" *ngIf="submitting"></div>
                <span class="material-icons-round" *ngIf="!submitting">{{ isEditMode ? 'save' : 'calculate' }}</span>
                <span *ngIf="!submitting">{{ isEditMode ? 'Enregistrer les modifications' : "Créer et calculer l'empreinte" }}</span>
              </button>
            </div>
          </form>
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
      margin-bottom: 32px;
    }
    .page-title {
      font-size: 2rem;
      font-weight: 800;
    }
    .page-subtitle {
      color: var(--text-secondary);
      margin-top: 4px;
    }
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 0;
    }
    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    .form-section {
      padding: 28px;
    }
    .section-header-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 24px;
    }
    .section-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, var(--accent), var(--accent-dark));
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.95rem;
      flex-shrink: 0;
    }
    .section-title {
      font-size: 1.15rem;
      font-weight: 700;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px 24px;
    }
    .materials-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .material-row {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }
    .btn-icon {
      width: 40px;
      height: 40px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .btn-icon .material-icons-round {
      font-size: 20px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
    }
    .btn-lg {
      padding: 14px 32px;
      font-size: 1rem;
    }
    @media (max-width: 640px) {
      .form-grid { grid-template-columns: 1fr; }
      .material-row { flex-wrap: wrap; }
    }
  `]
})
export class SiteFormComponent implements OnInit {
  site: any = { name: '', address: '', city: '', country: 'France', surfaceArea: null, parkingSpaces: null,
    energyConsumption: null, employeeCount: null, workstationCount: null };
  materials: SiteMaterial[] = [];
  error = '';
  submitting = false;
  loadingData = false;
  isEditMode = false;
  siteId: number | null = null;

  materialTypes = [
    { value: 'BETON', label: 'Béton' },
    { value: 'ACIER', label: 'Acier' },
    { value: 'BOIS', label: 'Bois' },
    { value: 'VERRE', label: 'Verre' },
    { value: 'ALUMINIUM', label: 'Aluminium' },
    { value: 'CUIVRE', label: 'Cuivre' },
    { value: 'PLASTIQUE', label: 'Plastique' },
    { value: 'LAINE_VERRE', label: 'Laine de verre' },
    { value: 'BRIQUE', label: 'Brique' }
  ];

  constructor(
    private siteService: SiteService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.siteId = Number(id);
      this.loadingData = true;
      this.siteService.getById(this.siteId).subscribe({
        next: (site) => {
          this.site = {
            name: site.name,
            address: site.address,
            city: site.city,
            country: site.country,
            surfaceArea: site.surfaceArea,
            parkingSpaces: site.parkingSpaces,
            energyConsumption: site.energyConsumption,
            employeeCount: site.employeeCount,
            workstationCount: site.workstationCount
          };
          this.materials = (site.materials || []).map(m => ({
            materialType: m.materialType,
            quantity: m.quantity
          }));
          this.loadingData = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.loadingData = false;
          this.cdr.detectChanges();
          this.router.navigate(['/dashboard']);
        }
      });
    }
  }

  addMaterial() {
    this.materials.push({ materialType: '', quantity: 0 });
  }

  removeMaterial(index: number) {
    this.materials.splice(index, 1);
  }

  onSubmit() {
    if (!this.site.name || !this.site.city || !this.site.surfaceArea) {
      this.error = 'Veuillez remplir les champs obligatoires (nom, ville, surface).';
      this.cdr.detectChanges();
      return;
    }
    this.submitting = true;
    this.error = '';
    this.cdr.detectChanges();
    const payload = { ...this.site, materials: this.materials.filter(m => m.materialType && m.quantity > 0) };

    if (this.isEditMode && this.siteId) {
      this.siteService.update(this.siteId, payload).subscribe({
        next: () => {
          this.siteService.calculate(this.siteId!).subscribe({
            next: () => this.router.navigate(['/sites', this.siteId]),
            error: () => this.router.navigate(['/sites', this.siteId])
          });
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Erreur lors de la modification du site.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.siteService.create(payload).subscribe({
        next: (created) => {
          if (created.id) {
            this.siteService.calculate(created.id).subscribe({
              next: () => this.router.navigate(['/sites', created.id]),
              error: () => this.router.navigate(['/sites', created.id])
            });
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (err) => {
          this.submitting = false;
          this.error = err.error?.message || 'Erreur lors de la création du site.';
          this.cdr.detectChanges();
        }
      });
    }
  }
}
