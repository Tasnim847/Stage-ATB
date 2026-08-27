// core/services/ocr-client-verification.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

export interface ClientDataVerificationResult {
  extractedData: any;
  clientData: any;
  matches: {
    field: string;
    extractedValue: any;
    clientValue: any;
    match: boolean;
  }[];
  globalMatch: boolean;
  confidence: number;
  warnings: string[];
  errors: string[];
}

@Injectable({
  providedIn: 'root'
})
export class OcrClientVerificationService {
  private baseUrl = `${environment.apiUrl}/ocr`;

  constructor(private http: HttpClient) {}

  /**
   * Extrait et vérifie les données d'un document par rapport au client
   */
  extractAndVerifyDocument(
    documentId: string, 
    clientId: string, 
    documentType: string
  ): Observable<ClientDataVerificationResult> {
    return this.http.post<ClientDataVerificationResult>(
      `${this.baseUrl}/extract-and-verify`,
      { 
        documentId, 
        clientId, 
        documentType 
      }
    );
  }

  /**
   * Extrait uniquement les données d'un document
   */
  extractDocument(documentId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/extract/${documentId}`, {});
  }
}