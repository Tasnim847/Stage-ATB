// core/services/audit-log.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { AuditLogFilterRequest, AuditLogResponseDTO, AuditLogStatistics } from '../models/audit-log.model';

@Injectable({
  providedIn: 'root'
})
export class AuditLogService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/admin/audit-logs`;

  getAuditLogs(filter: AuditLogFilterRequest): Observable<any> {
    console.log('📡 Calling API:', this.apiUrl);
    return this.http.get<any>(this.apiUrl, { params: this.buildParams(filter) });
  }


  getRecentLogs(limit: number = 50): Observable<AuditLogResponseDTO[]> {
    return this.http.get<AuditLogResponseDTO[]>(`${this.apiUrl}/recent?limit=${limit}`);
  }

  getStatistics(): Observable<AuditLogStatistics> {
    return this.http.get<AuditLogStatistics>(`${this.apiUrl}/statistics`);
  }

  private buildParams(filter: AuditLogFilterRequest): any {
    const params: any = {};
    Object.keys(filter).forEach(key => {
      if (filter[key as keyof AuditLogFilterRequest] !== undefined && 
          filter[key as keyof AuditLogFilterRequest] !== null &&
          filter[key as keyof AuditLogFilterRequest] !== '') {
        params[key] = filter[key as keyof AuditLogFilterRequest];
      }
    });
    return params;
  }
}