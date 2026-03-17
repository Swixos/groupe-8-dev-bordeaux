import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReferenceData } from '../models/reference-data.model';

@Injectable({ providedIn: 'root' })
export class ReferenceDataService {
  private apiUrl = '/api/reference-data';

  constructor(private http: HttpClient) {}

  getAll(): Observable<ReferenceData[]> {
    return this.http.get<ReferenceData[]>(this.apiUrl);
  }

  getByCategory(category: string): Observable<ReferenceData[]> {
    return this.http.get<ReferenceData[]>(`${this.apiUrl}/${category}`);
  }

  create(data: Partial<ReferenceData>): Observable<ReferenceData> {
    return this.http.post<ReferenceData>(this.apiUrl, data);
  }

  update(id: number, data: Partial<ReferenceData>): Observable<ReferenceData> {
    return this.http.put<ReferenceData>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
