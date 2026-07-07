// features/documents/document-verification/document-verification-page.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ToastrService } from 'ngx-toastr';
import { DocumentService } from '@core/services/document.service';
import { DOCUMENT_TYPE_CONFIG, DocumentResponseDTO } from '@core/models';

@Component({
  selector: 'app-document-verification-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './document-verification.component.html',
  styleUrls: ['./document-verification.component.css']
})
export class DocumentVerificationComponent implements OnInit {
  document!: DocumentResponseDTO;
  documentTypeConfig = DOCUMENT_TYPE_CONFIG;
  verificationForm!: FormGroup;
  loading = true;
  verifying = false;
  error = false;
  errorMessage = '';

  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // ✅ Récupérer l'ID depuis les paramètres de la route
    const id = this.route.snapshot.paramMap.get('id');
    console.log('📄 ID du document à vérifier:', id);
    
    if (id) {
      this.loadDocument(id);
    } else {
      this.error = true;
      this.errorMessage = 'ID du document manquant';
      this.loading = false;
      this.toastr.error('ID du document manquant', 'Erreur');
    }
  }

  // features/documents/document-verification/document-verification-page.component.ts

loadDocument(id: string): void {
  this.loading = true;
  console.log('🔍 Chargement du document avec ID:', id);
  
  this.documentService.getDocumentById(id).subscribe({
    next: (doc) => {
      console.log('✅ Document chargé:', doc);
      
      // ✅ Ajouter des valeurs par défaut si manquantes
      this.document = {
        ...doc,
        uploadedByName: doc.uploadedByName || `Utilisateur ${doc.uploadedBy?.substring(0, 8) || 'inconnu'}`
      };
      
      this.initForm();
      this.loading = false;
    },
    error: (err) => {
      console.error('❌ Erreur lors du chargement du document:', err);
      this.error = true;
      this.errorMessage = err.error?.message || 'Impossible de charger le document';
      this.loading = false;
      this.toastr.error(this.errorMessage, 'Erreur');
    }
  });
}

  initForm(): void {
    this.verificationForm = this.fb.group({
      verified: [this.document?.verified || false, Validators.required],
      verificationNotes: [this.document?.verificationNotes || '']
    });
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

  getStatusLabel(): string {
    if (!this.document) return 'Inconnu';
    return this.document.verified ? 'Vérifié ✅' : 'En attente de vérification ⏳';
  }

  onSubmit(): void {
    if (this.verificationForm.invalid || !this.document) {
      this.toastr.warning('Veuillez remplir tous les champs obligatoires', 'Attention');
      return;
    }

    this.verifying = true;
    const { verified, verificationNotes } = this.verificationForm.value;

    console.log('📝 Vérification du document:', {
      id: this.document.id,
      verified,
      verificationNotes
    });

    this.documentService.verifyDocument(this.document.id, verified, verificationNotes)
      .subscribe({
        next: (updatedDoc) => {
          console.log('✅ Document vérifié avec succès:', updatedDoc);
          this.verifying = false;
          this.toastr.success(
            verified ? 'Document approuvé avec succès ✅' : 'Document rejeté ❌',
            'Succès'
          );
          this.router.navigate(['/documents']);
        },
        error: (err) => {
          console.error('❌ Erreur lors de la vérification:', err);
          this.verifying = false;
          this.toastr.error(
            err.error?.message || 'Erreur lors de la vérification du document',
            'Erreur'
          );
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/documents']);
  }

  download(): void {
    if (!this.document) return;
    console.log('📥 Téléchargement du document:', this.document.id);
    
    this.documentService.downloadDocument(this.document.id)
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement('a');
          a.href = url;
          a.download = this.document.fileName;
          a.click();
          window.URL.revokeObjectURL(url);
          this.toastr.success('Téléchargement démarré', 'Succès');
        },
        error: (err) => {
          console.error('❌ Erreur lors du téléchargement:', err);
          this.toastr.error('Erreur lors du téléchargement', 'Erreur');
        }
      });
  }
}