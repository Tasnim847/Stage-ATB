// core/services/document.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { DocumentResponseDTO, DocumentType } from '../models/document.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private apiUrl = `${environment.apiUrl}/documents`;

  constructor(private http: HttpClient) {}

  // ============================================
  // MÉTHODES DE TÉLÉCHARGEMENT
  // ============================================
  
  uploadDocument(formData: FormData): Observable<DocumentResponseDTO> {
    return this.http.post<DocumentResponseDTO>(`${this.apiUrl}/upload`, formData);
  }

  downloadDocument(id: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/download`, { 
      responseType: 'blob' 
    });
  }

  // ============================================
  // MÉTHODES DE RÉCUPÉRATION
  // ============================================
  
  getAllDocuments(): Observable<DocumentResponseDTO[]> {
    return this.http.get<any>(`${this.apiUrl}/all`).pipe(
      map(response => {
        // ✅ Si la réponse est encapsulée dans ApiResponse
        const data = response?.data || response;
        if (Array.isArray(data)) return data;
        if (Array.isArray(response)) return response;
        return [];
      })
    );
  }

  // ✅ Version corrigée avec extraction des données
  getDocumentById(id: string): Observable<DocumentResponseDTO> {
    console.log('📡 Appel API getDocumentById:', id);
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('📡 Réponse brute:', response);
        // ✅ Extraire les données de la réponse ApiResponse
        const documentData = response?.data || response;
        console.log('📡 Document extrait:', documentData);
        return documentData as DocumentResponseDTO;
      }),
      tap(data => console.log('📡 Données finales:', data))
    );
  }

  getDocumentsByClient(clientId: string): Observable<DocumentResponseDTO[]> {
    return this.http.get<any>(`${this.apiUrl}/client/${clientId}`).pipe(
      map(response => {
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      })
    );
  }

  getDocumentsByCreditRequest(creditRequestId: string): Observable<DocumentResponseDTO[]> {
    return this.http.get<any>(`${this.apiUrl}/credit-request/${creditRequestId}`).pipe(
      map(response => {
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      })
    );
  }

  getDocumentsByType(documentType: DocumentType): Observable<DocumentResponseDTO[]> {
    return this.http.get<any>(`${this.apiUrl}/type/${documentType}`).pipe(
      map(response => {
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      })
    );
  }

  getUnverifiedDocuments(): Observable<DocumentResponseDTO[]> {
    return this.http.get<any>(`${this.apiUrl}/unverified`).pipe(
      map(response => {
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      })
    );
  }

  getIncompleteDocuments(): Observable<DocumentResponseDTO[]> {
    return this.http.get<any>(`${this.apiUrl}/incomplete`).pipe(
      map(response => {
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      })
    );
  }

  // ============================================
  // MÉTHODES DE MODIFICATION
  // ============================================
  
  updateDocument(id: string, data: any): Observable<DocumentResponseDTO> {
    return this.http.put<DocumentResponseDTO>(`${this.apiUrl}/${id}`, data);
  }

  deleteDocument(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  verifyDocument(id: string, verified: boolean, notes?: string): Observable<DocumentResponseDTO> {
    return this.http.patch<DocumentResponseDTO>(`${this.apiUrl}/${id}/verify`, { 
      verified, 
      verificationNotes: notes 
    });
  }

  // ============================================
  // MÉTHODES DE TRAITEMENT
  // ============================================
  
  processDocumentWithOCR(id: string): Observable<DocumentResponseDTO> {
    return this.http.post<DocumentResponseDTO>(`${this.apiUrl}/${id}/ocr`, {});
  }

  extractDataFromDocument(id: string): Observable<DocumentResponseDTO> {
    return this.http.post<DocumentResponseDTO>(`${this.apiUrl}/${id}/extract`, {});
  }

  // ============================================
  // MÉTHODES DE GESTION DES DOCUMENTS OBLIGATOIRES
  // ============================================
  
  getMandatoryDocumentTypes(): Observable<DocumentType[]> {
    return this.http.get<any>(`${this.apiUrl}/mandatory-types`).pipe(
      map(response => {
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      })
    );
  }

  getMandatoryDocumentStatus(clientId: string): Observable<Map<DocumentType, boolean>> {
    return this.http.get<any>(`${this.apiUrl}/client/${clientId}/mandatory-status`).pipe(
      map(response => {
        const data = response?.data || response;
        return data instanceof Map ? data : new Map<DocumentType, boolean>();
      })
    );
  }

  getMissingMandatoryDocuments(clientId: string): Observable<DocumentType[]> {
    return this.http.get<any>(`${this.apiUrl}/client/${clientId}/missing-mandatory`).pipe(
      map(response => {
        const data = response?.data || response;
        return Array.isArray(data) ? data : [];
      })
    );
  }
}