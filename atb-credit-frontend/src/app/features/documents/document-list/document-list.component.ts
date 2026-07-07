// features/documents/document-list/document-list.component.ts
import { Component, OnInit, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DocumentResponseDTO, DocumentType, DOCUMENT_TYPE_CONFIG } from '@core/models';
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { DocumentVerificationComponent } from '../document-verification/document-verification.component';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { DocumentService } from '@core/services/document.service';

@Component({
  selector: 'app-document-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './document-list.component.html',
  styleUrls: ['./document-list.component.css']
})
export class DocumentListComponent implements OnInit, OnChanges {
  @Input() clientId!: string;
  @Input() creditRequestId?: string;
  @Input() viewMode: 'client' | 'credit-request' = 'client';

  documents: DocumentResponseDTO[] = [];
  mandatoryStatus: Map<DocumentType, boolean> = new Map();
  missingMandatory: DocumentType[] = [];
  loading = false;
  documentTypeConfig = DOCUMENT_TYPE_CONFIG;
  DocumentType = DocumentType;

  private documentService = inject(DocumentService);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);

  ngOnInit(): void {
    if (this.clientId) {
      this.loadDocuments();
      this.loadMandatoryStatus();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['clientId'] && this.clientId) {
      this.loadDocuments();
      this.loadMandatoryStatus();
    }
    if (changes['creditRequestId'] && this.creditRequestId) {
      this.loadDocuments();
    }
  }

  loadDocuments(): void {
    if (!this.clientId) return;

    this.loading = true;
    let request;

    if (this.viewMode === 'credit-request' && this.creditRequestId) {
      request = this.documentService.getDocumentsByCreditRequest(this.creditRequestId);
    } else {
      request = this.documentService.getDocumentsByClient(this.clientId);
    }

    request
      .pipe(
        catchError(error => {
          this.toastr.error('Erreur lors du chargement des documents', 'Erreur');
          return of([]);
        }),
        finalize(() => this.loading = false)
      )
      .subscribe(documents => {
        this.documents = Array.isArray(documents) ? documents : [];
      });
  }

  loadMandatoryStatus(): void {
    if (!this.clientId) return;

    this.documentService.getMandatoryDocumentStatus(this.clientId)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement du statut des documents obligatoires', error);
          return of(new Map<DocumentType, boolean>());
        })
      )
      .subscribe(status => {
        this.mandatoryStatus = status;
      });

    this.documentService.getMissingMandatoryDocuments(this.clientId)
      .pipe(
        catchError(error => {
          console.error('Erreur lors du chargement des documents manquants', error);
          return of([]);
        })
      )
      .subscribe(missing => {
        this.missingMandatory = missing;
      });
  }

  getDocumentTypeLabel(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.label || type;
  }

  getDocumentTypeIcon(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.icon || 'fa-file';
  }

  getDocumentTypeColor(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.color || 'secondary';
  }

  isMandatory(type: DocumentType): boolean {
    return DOCUMENT_TYPE_CONFIG[type]?.mandatory || false;
  }

  isMandatoryMissing(type: DocumentType): boolean {
    return this.missingMandatory.includes(type);
  }

  getFileSize(size: number): string {
    if (!size) return '0 B';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  uploadDocument(): void {
    const modalRef = this.modalService.open(DocumentUploadComponent, {
      size: 'lg',
      backdrop: 'static'
    });

    modalRef.componentInstance.clientId = this.clientId;
    modalRef.componentInstance.creditRequestId = this.creditRequestId;

    modalRef.result
      .then((result) => {
        if (result) {
          this.loadDocuments();
          this.loadMandatoryStatus();
          this.toastr.success('Document téléchargé avec succès', 'Succès');
        }
      })
      .catch(() => {});
  }

  verifyDocument(doc: DocumentResponseDTO): void {
    if (!doc) return;
    const modalRef = this.modalService.open(DocumentVerificationComponent, {
      size: 'md',
      backdrop: 'static'
    });

    modalRef.componentInstance.document = doc;

    modalRef.result
      .then((result) => {
        if (result) {
          this.loadDocuments();
          this.toastr.success('Document vérifié avec succès', 'Succès');
        }
      })
      .catch(() => {});
  }

  downloadDocument(doc: DocumentResponseDTO): void {
    if (!doc) return;
    this.documentService.downloadDocument(doc.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = doc.fileName;
          a.click();
          window.URL.revokeObjectURL(url);
          this.toastr.success('Téléchargement démarré', 'Succès');
        },
        error: () => {
          this.toastr.error('Erreur lors du téléchargement', 'Erreur');
        }
      });
  }

  deleteDocument(doc: DocumentResponseDTO): void {
    if (!doc) return;
    if (confirm(`Voulez-vous vraiment supprimer le document "${doc.fileName}" ?`)) {
      this.documentService.deleteDocument(doc.id)
        .subscribe({
          next: () => {
            this.loadDocuments();
            this.loadMandatoryStatus();
            this.toastr.success('Document supprimé avec succès', 'Succès');
          },
          error: () => {
            this.toastr.error('Erreur lors de la suppression', 'Erreur');
          }
        });
    }
  }

  processOCR(doc: DocumentResponseDTO): void {
    if (!doc) return;
    this.documentService.processDocumentWithOCR(doc.id)
      .subscribe({
        next: (updatedDoc: DocumentResponseDTO) => {
          const index = this.documents.findIndex(d => d.id === updatedDoc.id);
          if (index !== -1) {
            this.documents[index] = updatedDoc;
          }
          this.toastr.success('OCR traité avec succès', 'Succès');
        },
        error: () => {
          this.toastr.error('Erreur lors du traitement OCR', 'Erreur');
        }
      });
  }

  extractData(doc: DocumentResponseDTO): void {
    if (!doc) return;
    this.documentService.extractDataFromDocument(doc.id)
      .subscribe({
        next: (updatedDoc: DocumentResponseDTO) => {
          const index = this.documents.findIndex(d => d.id === updatedDoc.id);
          if (index !== -1) {
            this.documents[index] = updatedDoc;
          }
          this.toastr.success('Données extraites avec succès', 'Succès');
        },
        error: () => {
          this.toastr.error('Erreur lors de l\'extraction des données', 'Erreur');
        }
      });
  }

  canVerifyDocument(): boolean {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.role === 'ADMIN' || user?.role === 'ANALYST';
    } catch {
      return false;
    }
  }

  canDeleteDocument(doc: DocumentResponseDTO): boolean {
    if (!doc) return false;
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.role === 'ADMIN' || doc.uploadedBy === user?.id;
    } catch {
      return false;
    }
  }
}