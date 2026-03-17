import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Site, CarbonResult, SiteHistory, CompareResult } from '../models/site.model';

@Injectable({ providedIn: 'root' })
export class SiteService {
  private apiUrl = '/api/sites';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Site[]> {
    return this.http.get<Site[]>(this.apiUrl);
  }

  getById(id: number): Observable<Site> {
    return this.http.get<Site>(`${this.apiUrl}/${id}`);
  }

  create(site: Partial<Site>): Observable<Site> {
    return this.http.post<Site>(this.apiUrl, site);
  }

  update(id: number, site: Partial<Site>): Observable<Site> {
    return this.http.put<Site>(`${this.apiUrl}/${id}`, site);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  calculate(id: number): Observable<CarbonResult> {
    return this.http.post<CarbonResult>(`${this.apiUrl}/${id}/calculate`, {});
  }

  getHistory(id: number): Observable<SiteHistory[]> {
    return this.http.get<SiteHistory[]>(`${this.apiUrl}/${id}/history`);
  }

  compare(siteIds: number[]): Observable<CompareResult[]> {
    return this.http.post<CompareResult[]>(`${this.apiUrl}/compare`, { siteIds });
  }
}
