import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Site, CarbonResult, SiteHistory, CompareResult } from '../models/site.model';

@Injectable({ providedIn: 'root' })
export class SiteService {
  private apiUrl = '/api/sites';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Site[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(sites => sites.map(s => this.mapSite(s)))
    );
  }

  getById(id: number): Observable<Site> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(s => this.mapSite(s))
    );
  }

  create(site: Partial<Site>): Observable<Site> {
    return this.http.post<any>(this.apiUrl, site).pipe(
      map(s => this.mapSite(s))
    );
  }

  update(id: number, site: Partial<Site>): Observable<Site> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, site).pipe(
      map(s => this.mapSite(s))
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  calculate(id: number): Observable<CarbonResult> {
    return this.http.post<any>(`${this.apiUrl}/${id}/calculate`, {}).pipe(
      map(r => this.mapCarbonRecord(r))
    );
  }

  getHistory(id: number): Observable<SiteHistory[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/history`).pipe(
      map(records => records.map(r => ({
        year: r.year,
        totalCo2: r.totalEmissions / 1000,
        constructionCo2: r.constructionEmissions / 1000,
        exploitationCo2: r.exploitationEmissions / 1000
      })))
    );
  }

  compare(siteIds: number[]): Observable<CompareResult[]> {
    return this.http.post<CompareResult[]>(`${this.apiUrl}/compare`, { siteIds });
  }

  private mapSite(raw: any): Site {
    const records = raw.carbonRecords || [];
    const latest = records.sort((a: any, b: any) =>
      new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime()
    )[0];

    const site: Site = {
      id: raw.id,
      name: raw.name,
      address: raw.address,
      city: raw.city,
      country: raw.country,
      surfaceArea: raw.surfaceArea,
      parkingSpaces: raw.parkingSpaces,
      energyConsumption: raw.energyConsumption,
      employeeCount: raw.employeeCount,
      workstationCount: raw.workstationCount,
      materials: (raw.materials || []).map((m: any) => ({
        id: m.id,
        materialType: m.materialType,
        quantity: m.quantity,
        emission: m.quantity * 1000 * (this.getMaterialFactor(m.materialType))
      }))
    };

    if (latest) {
      site.carbonResult = this.mapCarbonRecord(latest);
      // Add material breakdown from emission calculations
      if (site.materials && site.materials.length > 0) {
        const totalEmission = site.materials.reduce((sum, m) => sum + (m.emission || 0), 0);
        site.carbonResult.materialBreakdown = site.materials.map(m => ({
          materialType: m.materialType,
          emission: (m.emission || 0) / 1000, // convert to tonnes
          percentage: totalEmission > 0 ? ((m.emission || 0) / totalEmission) * 100 : 0
        }));
      }
    }

    return site;
  }

  private mapCarbonRecord(r: any): CarbonResult {
    return {
      id: r.id,
      totalCo2: r.totalEmissions / 1000,
      constructionCo2: r.constructionEmissions / 1000,
      exploitationCo2: r.exploitationEmissions / 1000,
      co2PerSquareMeter: r.emissionsPerSqm,
      co2PerEmployee: r.emissionsPerEmployee,
      calculatedAt: r.calculatedAt
    };
  }

  private getMaterialFactor(type: string): number {
    const factors: Record<string, number> = {
      BETON: 0.13,
      ACIER: 1.37,
      VERRE: 0.85,
      BOIS: 0.04,
      ALUMINIUM: 6.73,
      CUIVRE: 3.81,
      PLASTIQUE: 2.2,
      LAINE_VERRE: 1.54,
      BRIQUE: 0.23
    };
    return factors[type] || 0;
  }
}
