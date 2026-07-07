// features/documents/document-management/document-management.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table'; // ✅ AJOUTÉ
import { ToastrService } from 'ngx-toastr';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, debounceTime, takeUntil } from 'rxjs';
import { DocumentService } from '@core/services/document.service';
import { DOCUMENT_TYPE_CONFIG, DocumentResponseDTO, DocumentType } from '@core/models';
import { DocumentUploadComponent } from '../document-upload/document-upload.component';
import { DocumentVerificationComponent } from '../document-verification/document-verification.component';
import { DocumentDetailComponent } from '../document-detail/document-detail.component';
import { GroupByPipe, ObjLengthPipe } from '../pipes/group-by.pipe';

@Component({
  selector: 'app-document-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSlideToggleModule,
    MatBadgeModule,
    MatTableModule, // ✅ AJOUTÉ
    GroupByPipe,
    ObjLengthPipe
  ],
  templateUrl: './document-management.component.html',
  styleUrls: ['./document-management.component.css']
})
export class DocumentManagementComponent implements OnInit, OnDestroy {
  // ============================================
  // 1. PROPRIÉTÉS
  // ============================================
  documents: DocumentResponseDTO[] = [];
  filteredDocuments: DocumentResponseDTO[] = [];
  loading = false;
  documentTypes = Object.values(DocumentType);
  documentTypeConfig = DOCUMENT_TYPE_CONFIG;
  DocumentType = DocumentType;
  Math = Math;

  // Statistiques
  totalDocuments = 0;
  verifiedDocuments = 0;
  unverifiedDocuments = 0;
  completeDocuments = 0;
  incompleteDocuments = 0;
  clientCount = 0;

  // Filtres
  filterForm!: FormGroup;
  viewMode: 'grid' | 'list' = 'grid';
  searchQuery = '';
  selectedType: string = '';
  selectedStatus: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 1;

  // Configuration des documents obligatoires
  mandatoryDocumentsConfig: { [key in DocumentType]?: boolean } = {};
  showAdminSection = false;

  private destroy$ = new Subject<void>();

  // ============================================
  // 2. INJECTIONS
  // ============================================
  private documentService = inject(DocumentService);
  private fb = inject(FormBuilder);
  private toastr = inject(ToastrService);
  private modalService = inject(NgbModal);
  private router = inject(Router);

  // ============================================
  // 3. CYCLE DE VIE
  // ============================================
  ngOnInit(): void {
    this.initFilterForm();
    this.loadDocuments();
    this.setupFilterSubscription();
    this.initMandatoryDocumentsConfig();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ============================================
  // 4. MÉTHODES PRIVÉES
  // ============================================
  private initFilterForm(): void {
    this.filterForm = this.fb.group({
      search: [''],
      documentType: [''],
      status: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  private setupFilterSubscription(): void {
    this.filterForm.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe(() => {
        this.applyFilters();
      });
  }

  private initMandatoryDocumentsConfig(): void {
    this.documentTypes.forEach(type => {
      this.mandatoryDocumentsConfig[type] = this.isDocumentMandatory(type);
    });
  }

  // ============================================
  // 5. CHARGEMENT DES DONNÉES
  // ============================================
  loadDocuments(): void {
    this.loading = true;
    this.documentService.getAllDocuments()
      .subscribe({
        next: (documents) => {
          this.documents = Array.isArray(documents) ? documents : [];
          this.updateStatistics();
          this.applyFilters();
          this.loading = false;
        },
        error: () => {
          this.toastr.error('Erreur lors du chargement des documents', 'Erreur');
          this.documents = [];
          this.filteredDocuments = [];
          this.loading = false;
        }
      });
  }

  updateStatistics(): void {
    const docs = Array.isArray(this.documents) ? this.documents : [];
    this.totalDocuments = docs.length;
    this.verifiedDocuments = docs.filter(d => d?.verified).length;
    this.unverifiedDocuments = docs.filter(d => !d?.verified).length;
    this.completeDocuments = docs.filter(d => d?.complete).length;
    this.incompleteDocuments = docs.filter(d => !d?.complete).length;
    
    // Calculer le nombre de clients uniques
    const clientIds = new Set(docs.map(d => d.clientId));
    this.clientCount = clientIds.size;
  }

  // ============================================
  // 6. FILTRES
  // ============================================
  applyFilters(): void {
    const { search, documentType, status, dateFrom, dateTo } = this.filterForm.value;
    
    const docs = Array.isArray(this.documents) ? this.documents : [];
    
    this.filteredDocuments = docs.filter(doc => {
      if (!doc) return false;
      
      let matchesSearch = true;
      if (search) {
        const searchLower = search.toLowerCase();
        matchesSearch = (doc.fileName?.toLowerCase().includes(searchLower) || false) ||
                        (doc.clientName?.toLowerCase().includes(searchLower) || false) ||
                        (doc.description?.toLowerCase().includes(searchLower) || false);
      }

      let matchesType = true;
      if (documentType) {
        matchesType = doc.documentType === documentType;
      }

      let matchesStatus = true;
      if (status === 'verified') {
        matchesStatus = doc.verified === true;
      } else if (status === 'unverified') {
        matchesStatus = doc.verified === false;
      } else if (status === 'complete') {
        matchesStatus = doc.complete === true;
      } else if (status === 'incomplete') {
        matchesStatus = doc.complete === false;
      }

      let matchesDate = true;
      if (dateFrom) {
        matchesDate = new Date(doc.uploadedAt) >= new Date(dateFrom);
      }
      if (dateTo && matchesDate) {
        matchesDate = new Date(doc.uploadedAt) <= new Date(dateTo);
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    this.totalPages = Math.ceil(this.filteredDocuments.length / this.itemsPerPage);
    this.currentPage = 1;
  }

  resetFilters(): void {
    this.filterForm.reset({
      search: '',
      documentType: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  }

  // ============================================
  // 7. PAGINATION
  // ============================================
  getPaginatedDocuments(): DocumentResponseDTO[] {
    const docs = Array.isArray(this.filteredDocuments) ? this.filteredDocuments : [];
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return docs.slice(start, end);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  // ============================================
  // 8. ACTIONS SUR LES DOCUMENTS
  // ============================================
  // features/documents/document-management/document-management.component.ts
// Modifier la méthode openUploadModal()

  openUploadModal(): void {
    // ✅ Rediriger vers la page de téléchargement au lieu d'ouvrir un modal
    this.router.navigate(['/documents/upload']);
  }


  openDocumentDetail(doc: DocumentResponseDTO): void {
    if (!doc) return;
    const modalRef = this.modalService.open(DocumentDetailComponent, {
      size: 'xl',
      backdrop: 'static'
    });

    modalRef.componentInstance.document = doc;

    modalRef.result
      .then((result) => {
        if (result) {
          this.loadDocuments();
        }
      })
      .catch(() => {});
  }

  verifyDocument(doc: DocumentResponseDTO): void {
    if (!doc) return;
    // ✅ Rediriger vers la page de vérification au lieu d'ouvrir un modal
    this.router.navigate(['/documents/verify', doc.id]);
  }

  deleteDocument(doc: DocumentResponseDTO): void {
    if (!doc) return;
    if (confirm(`Voulez-vous vraiment supprimer le document "${doc.fileName}" ?`)) {
      this.documentService.deleteDocument(doc.id)
        .subscribe({
          next: () => {
            this.loadDocuments();
            this.toastr.success('Document supprimé avec succès', 'Succès');
          },
          error: () => {
            this.toastr.error('Erreur lors de la suppression', 'Erreur');
          }
        });
    }
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

  refresh(): void {
    this.loadDocuments();
  }

  // ============================================
  // 9. GESTION DES DOCUMENTS OBLIGATOIRES
  // ============================================
  toggleAdminSection(): void {
    this.showAdminSection = !this.showAdminSection;
  }

  saveMandatoryDocumentsConfig(): void {
    this.toastr.success('Configuration des documents obligatoires sauvegardée', 'Succès');
  }

  resetMandatoryDocumentsConfig(): void {
    this.documentTypes.forEach(type => {
      this.mandatoryDocumentsConfig[type] = this.isDocumentMandatory(type);
    });
    this.toastr.info('Configuration réinitialisée', 'Info');
  }

  isDocumentMandatory(type: DocumentType): boolean {
    return DOCUMENT_TYPE_CONFIG[type]?.mandatory || false;
  }

  // ============================================
  // 10. MÉTHODES UTILITAIRES
  // ============================================
  getDocumentTypeLabel(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.label || type;
  }

  getDocumentTypeIcon(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.icon || 'fa-file';
  }

  getDocumentTypeColor(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.color || 'secondary';
  }

  getStatusLabel(doc: DocumentResponseDTO): string {
    if (!doc) return 'Inconnu';
    return doc.verified ? 'Vérifié' : 'En attente';
  }

  getFileSize(size: number): string {
    if (!size) return '0 B';
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }

  getDocumentCountByType(type: DocumentType): number {
    const docs = Array.isArray(this.documents) ? this.documents : [];
    return docs.filter(d => d?.documentType === type).length;
  }

  // ============================================
  // 11. GESTION DES PERMISSIONS
  // ============================================
  isAdmin(): boolean {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?.role === 'ADMIN';
    } catch {
      return false;
    }
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