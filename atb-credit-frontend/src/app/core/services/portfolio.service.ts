// src/app/core/services/portfolio.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {
  private apiUrl = environment.apiUrl + '/portfolio';

  constructor(private http: HttpClient) {}

  getGlobalPortfolio(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/global`, { params: httpParams });
  }

  getPortfolioSummary(year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary/${year}`);
  }

  getPortfolioCharts(year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/charts/${year}`);
  }

  getPortfolioRisk(year: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/risk/${year}`);
  }

  // ✅ CORRECTION : Accepter string ou number pour l'ID
  getCreditDetails(creditId: string | number): Observable<any> {
    return this.http.get(`${this.apiUrl}/credit/${creditId}`);
  }

  exportPortfolioData(year: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/${year}`, {
      responseType: 'blob'
    });
  }

  getAnalystPerformance(params: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/analysts/performance`, { params });
  }

  getPortfolioAnalytics(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/analytics`, { params: httpParams });
  }

  getPortfolioRiskMatrix(params: any): Observable<any> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });
    return this.http.get(`${this.apiUrl}/risk-matrix`, { params: httpParams });
  }
}