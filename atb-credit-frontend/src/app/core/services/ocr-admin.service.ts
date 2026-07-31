// src/app/core/services/ocr-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '@environments/environment';
import {
  OcrConfig,
  OcrDocumentType,
  OcrField,
  ValidationRule,
  OcrLog,
  OcrConnectionStatus,
  OcrExtractionResult,
  OcrStatistics
} from '@core/models/ocr.models';

@Injectable({
  providedIn: 'root'
})
export class OcrAdminService {
  private baseUrl = `${environment.apiUrl}/ocr`;

  constructor(private http: HttpClient) {}

  // ============================================
  // CONFIGURATION
  // ============================================

  getConfig(): Observable<OcrConfig> {
    return this.http.get<OcrConfig>(`${this.baseUrl}/config`);
  }

  updateConfig(config: OcrConfig): Observable<OcrConfig> {
    return this.http.put<OcrConfig>(`${this.baseUrl}/config`, config);
  }

  testConnection(): Observable<OcrConnectionStatus> {
    return this.http.post<OcrConnectionStatus>(`${this.baseUrl}/test`, {});
  }

  // ============================================
  // TYPES DE DOCUMENTS
  // ============================================

  getDocumentTypes(): Observable<OcrDocumentType[]> {
    return this.http.get<OcrDocumentType[]>(`${this.baseUrl}/document-types`);
  }

  getDocumentType(id: number): Observable<OcrDocumentType> {
    return this.http.get<OcrDocumentType>(`${this.baseUrl}/document-types/${id}`);
  }

  addDocumentType(type: OcrDocumentType): Observable<OcrDocumentType> {
    return this.http.post<OcrDocumentType>(`${this.baseUrl}/document-types`, type);
  }

  updateDocumentType(id: number, type: OcrDocumentType): Observable<OcrDocumentType> {
    return this.http.put<OcrDocumentType>(`${this.baseUrl}/document-types/${id}`, type);
  }

  deleteDocumentType(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/document-types/${id}`);
  }

  // ============================================
  // CHAMPS OCR
  // ============================================

  getFields(documentTypeId: number): Observable<OcrField[]> {
    return this.http.get<OcrField[]>(`${this.baseUrl}/document-types/${documentTypeId}/fields`);
  }

  addField(documentTypeId: number, field: OcrField): Observable<OcrField> {
    return this.http.post<OcrField>(`${this.baseUrl}/document-types/${documentTypeId}/fields`, field);
  }

  updateField(documentTypeId: number, field: OcrField): Observable<OcrField> {
    return this.http.put<OcrField>(`${this.baseUrl}/document-types/${documentTypeId}/fields/${field.id}`, field);
  }

  deleteField(documentTypeId: number, fieldId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/document-types/${documentTypeId}/fields/${fieldId}`);
  }

  // ============================================
  // RÈGLES DE VALIDATION
  // ============================================

  getValidationRules(documentTypeId: number): Observable<ValidationRule[]> {
    return this.http.get<ValidationRule[]>(`${this.baseUrl}/document-types/${documentTypeId}/rules`);
  }

  addValidationRule(documentTypeId: number, rule: ValidationRule): Observable<ValidationRule> {
    return this.http.post<ValidationRule>(`${this.baseUrl}/document-types/${documentTypeId}/rules`, rule);
  }

  updateValidationRule(documentTypeId: number, rule: ValidationRule): Observable<ValidationRule> {
    return this.http.put<ValidationRule>(`${this.baseUrl}/document-types/${documentTypeId}/rules/${rule.id}`, rule);
  }

  deleteValidationRule(documentTypeId: number, ruleId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/document-types/${documentTypeId}/rules/${ruleId}`);
  }

  // ============================================
  // LOGS OCR - CORRIGÉ POUR SPRING DATA PAGE
  // ============================================

  getOcrLogs(params?: { limit?: number; offset?: number; result?: string }): Observable<OcrLog[]> {
    return this.http.get<any>(`${this.baseUrl}/logs`, { params: params as any }).pipe(
      map((response: any) => {
        // ✅ SPRING DATA PAGE - La réponse a une propriété 'content'
        if (response && response.content && Array.isArray(response.content)) {
          return response.content;
        }
        // ✅ Si la réponse est directement un tableau
        if (Array.isArray(response)) {
          return response;
        }
        // ✅ Si la réponse est un objet avec un tableau
        if (response && typeof response === 'object') {
          const keys = Object.keys(response);
          for (const key of keys) {
            if (Array.isArray(response[key])) {
              return response[key];
            }
          }
        }
        // ✅ Par défaut, retourner un tableau vide
        console.warn('Format de réponse inattendu pour les logs:', response);
        return [];
      })
    );
  }

  getOcrLog(id: number): Observable<OcrLog> {
    return this.http.get<OcrLog>(`${this.baseUrl}/logs/${id}`);
  }

  clearLogs(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/logs`);
  }

  deleteOldLogs(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/logs/old`);
  }

  // ============================================
  // STATISTIQUES
  // ============================================

  getStatistics(): Observable<OcrStatistics> {
    return this.http.get<OcrStatistics>(`${this.baseUrl}/statistics`);
  }

  // ============================================
  // EXTRACTION OCR
  // ============================================

  extractDocument(documentTypeId: number, file: File): Observable<OcrExtractionResult> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentTypeId', documentTypeId.toString());
    
    return this.http.post<OcrExtractionResult>(`${this.baseUrl}/extract`, formData);
  }
}