// features/documents/client/client-documents.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { DocumentService } from '@core/services/document.service';
import { AuthService } from '@core/services/auth.service';
import { DocumentResponseDTO, DocumentType, DOCUMENT_TYPE_CONFIG } from '@core/models/document.model';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-client-documents',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule
  ],
  templateUrl: './client-documents.component.html',
  styleUrls: ['./client-documents.component.css']
})
export class ClientDocumentsComponent implements OnInit, OnDestroy {
  documents: DocumentResponseDTO[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private documentService: DocumentService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  getDocumentLabel(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.label || type;
  }

  getDocumentColor(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.color || 'primary';
  }

  getVerifiedCount(): number {
    return this.documents.filter(doc => doc.verified).length;
  }

  getPendingCount(): number {
    return this.documents.filter(doc => !doc.verified).length;
  }

  getCompleteCount(): number {
    return this.documents.filter(doc => doc.complete).length;
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  ngOnInit(): void {
    this.loadDocuments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDocuments(): void {
    this.loading = true;
    
    const userInfo = this.authService.getUserInfo();
    const userRole = this.authService.getUserRole();
    
    console.log('👤 User Info complet:', userInfo);
    console.log('👤 User Role:', userRole);

    if (userRole !== 'CLIENT') {
      this.snackBar.open('Cette page est réservée aux clients', 'Fermer', { duration: 3000 });
      this.router.navigate(['/dashboard']);
      this.loading = false;
      return;
    }

    console.log('📡 Chargement des documents via /my-documents');

    this.documentService.getMyDocuments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (docs: DocumentResponseDTO[]) => {
          console.log('📄 Documents reçus:', docs);
          this.documents = docs;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('❌ Erreur chargement documents:', err);
          
          let errorMsg = 'Erreur lors du chargement des documents';
          if (err.status === 403) {
            errorMsg = 'Vous n\'avez pas accès à ces documents';
          } else if (err.status === 404) {
            errorMsg = 'Aucun profil client trouvé pour cet utilisateur';
          } else if (err.status === 500) {
            errorMsg = 'Erreur serveur, veuillez réessayer plus tard';
          }
          
          this.snackBar.open(errorMsg, 'Fermer', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  viewDocument(doc: DocumentResponseDTO): void {
    // TODO: Implémenter la visualisation du document
    this.snackBar.open(`Visualisation de "${doc.fileName}"`, 'Fermer', { duration: 2000 });
  }

  downloadDocument(doc: DocumentResponseDTO): void {
    this.documentService.downloadDocument(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = doc.fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.snackBar.open('Téléchargement démarré', 'Fermer', { duration: 2000 });
        },
        error: (err: any) => {
          console.error('❌ Erreur téléchargement:', err);
          this.snackBar.open('Erreur lors du téléchargement', 'Fermer', { duration: 3000 });
        }
      });
  }

  deleteDocument(doc: DocumentResponseDTO): void {
    if (!confirm(`Supprimer le document "${doc.fileName}" ?`)) return;

    this.documentService.deleteDocument(doc.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.documents = this.documents.filter(d => d.id !== doc.id);
          this.snackBar.open('Document supprimé avec succès', 'Fermer', { duration: 2000 });
        },
        error: (err: any) => {
          console.error('❌ Erreur suppression:', err);
          this.snackBar.open('Erreur lors de la suppression', 'Fermer', { duration: 3000 });
        }
      });
  }
}