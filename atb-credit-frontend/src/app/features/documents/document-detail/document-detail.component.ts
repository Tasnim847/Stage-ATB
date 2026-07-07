// features/documents/document-detail/document-detail.component.ts
import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT_TYPE_CONFIG, DocumentResponseDTO } from '@core/models';
import { DocumentService } from '@core/services/document.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-document-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './document-detail.component.html',
  styleUrls: ['./document-detail.component.css']
})
export class DocumentDetailComponent implements OnInit {
  @Input() document!: DocumentResponseDTO;
  documentTypeConfig = DOCUMENT_TYPE_CONFIG;
  ocrData: any = null;
  extractedData: any = null;
  downloading = false;

  private activeModal = inject(NgbActiveModal);
  private documentService = inject(DocumentService);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    if (this.document) {
      this.parseJsonData();
    }
  }

  parseJsonData(): void {
    try {
      if (this.document.ocrResult) {
        this.ocrData = JSON.parse(this.document.ocrResult);
      }
    } catch {
      this.ocrData = { text: this.document.ocrResult };
    }

    try {
      if (this.document.extractedData) {
        this.extractedData = JSON.parse(this.document.extractedData);
      }
    } catch {
      this.extractedData = { data: this.document.extractedData };
    }
  }

  getDocumentTypeLabel(type: string): string {
    return DOCUMENT_TYPE_CONFIG[type as keyof typeof DOCUMENT_TYPE_CONFIG]?.label || type;
  }

  getDocumentTypeIcon(type: string): string {
    return DOCUMENT_TYPE_CONFIG[type as keyof typeof DOCUMENT_TYPE_CONFIG]?.icon || 'fa-file';
  }

  getDocumentTypeColor(type: string): string {
    return DOCUMENT_TYPE_CONFIG[type as keyof typeof DOCUMENT_TYPE_CONFIG]?.color || 'secondary';
  }

  getFileSize(size: number): string {
    if (!size) return '0 B';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  download(): void {
    if (!this.document) return;
    this.downloading = true;
    this.documentService.downloadDocument(this.document.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = this.document.fileName;
          a.click();
          window.URL.revokeObjectURL(url);
          this.downloading = false;
          this.toastr.success('Téléchargement démarré', 'Succès');
        },
        error: () => {
          this.downloading = false;
          this.toastr.error('Erreur lors du téléchargement', 'Erreur');
        }
      });
  }

  close(): void {
    this.activeModal.close();
  }

  getStatusClass(): string {
    return this.document?.verified ? 'verified' : 'unverified';
  }

  getStatusLabel(): string {
    return this.document?.verified ? 'Vérifié' : 'En attente de vérification';
  }
}