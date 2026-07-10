// features/credits/advisor/credit-request-create/components/document-upload-inline.component.ts
import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { DocumentService } from '@core/services/document.service';
import { DocumentType, DOCUMENT_TYPE_CONFIG } from '@core/models';

@Component({
  selector: 'app-document-upload-inline',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="inline-upload-container">
      <div class="upload-header">
        <h4>Télécharger un document</h4>
        <span class="upload-hint">Formats acceptés: PDF, JPG, PNG (Max 10MB)</span>
      </div>

      <form [formGroup]="uploadForm" (ngSubmit)="onSubmit()" class="upload-form">
        <div class="upload-row">
          <mat-form-field appearance="outline" class="upload-field">
            <mat-label>Type de document *</mat-label>
            <mat-select formControlName="documentType" required>
              <mat-option value="">Sélectionnez un type</mat-option>
              <mat-option *ngFor="let type of documentTypes" [value]="type">
                {{ getDocumentLabel(type) }}
                <span *ngIf="isMandatory(type)" class="mandatory-badge">Obligatoire</span>
              </mat-option>
            </mat-select>
            <mat-error *ngIf="uploadForm.get('documentType')?.hasError('required')">
              Type requis
            </mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="upload-field">
            <mat-label>Description</mat-label>
            <input matInput formControlName="description" placeholder="Description du document">
          </mat-form-field>
        </div>

        <div class="upload-row">
          <div class="file-drop-zone" 
               (dragover)="$event.preventDefault(); isDragover = true"
               (dragleave)="isDragover = false"
               (drop)="onFileDrop($event); isDragover = false"
               [class.dragover]="isDragover">
            <input type="file" 
                   #fileInput
                   (change)="onFileSelected($event)" 
                   accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                   class="file-input-hidden">
            <div class="drop-zone-content" *ngIf="!selectedFile">
              <mat-icon>cloud_upload</mat-icon>
              <p>Glissez-déposez votre fichier ici</p>
              <p class="small">ou <span class="clickable" (click)="fileInput.click()">cliquez pour sélectionner</span></p>
            </div>
            <div class="file-preview" *ngIf="selectedFile">
              <mat-icon>insert_drive_file</mat-icon>
              <div class="file-info">
                <strong>{{ selectedFile.name }}</strong>
                <span>{{ (selectedFile.size / 1024).toFixed(1) }} KB</span>
              </div>
              <button type="button" mat-icon-button color="warn" (click)="removeFile()">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <button type="submit" 
                  mat-raised-button 
                  color="primary"
                  [disabled]="uploadForm.invalid || !selectedFile || isUploading"
                  class="upload-btn">
            <mat-spinner diameter="20" *ngIf="isUploading"></mat-spinner>
            <mat-icon *ngIf="!isUploading">upload</mat-icon>
            {{ isUploading ? 'Téléchargement...' : 'Télécharger' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .inline-upload-container {
      padding: 16px;
      background: #f8f9fa;
      border-radius: 10px;
      border: 1px solid #e0e0e0;
      margin-bottom: 16px;
    }

    .upload-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .upload-header h4 {
      margin: 0;
      color: #1a2332;
      font-size: 15px;
    }

    .upload-hint {
      font-size: 12px;
      color: #718096;
    }

    .upload-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .upload-row {
      display: flex;
      gap: 12px;
      align-items: flex-start;
    }

    .upload-field {
      flex: 1;
    }

    .mandatory-badge {
      background: #FFEBEE;
      color: #C62828;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 10px;
      font-weight: 600;
      margin-left: 8px;
    }

    .file-drop-zone {
      flex: 2;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 16px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: white;
      min-height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .file-drop-zone.dragover {
      border-color: #8B1A1A;
      background: #FFF5F5;
    }

    .file-input-hidden {
      display: none;
    }

    .drop-zone-content mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: #718096;
    }

    .drop-zone-content p {
      margin: 4px 0;
      color: #4a5568;
    }

    .drop-zone-content .small {
      font-size: 12px;
      color: #718096;
    }

    .drop-zone-content .clickable {
      color: #8B1A1A;
      font-weight: 500;
      cursor: pointer;
      text-decoration: underline;
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .file-preview mat-icon {
      color: #8B1A1A;
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .file-info {
      flex: 1;
      text-align: left;
    }

    .file-info strong {
      display: block;
      font-size: 14px;
    }

    .file-info span {
      font-size: 12px;
      color: #718096;
    }

    .upload-btn {
      height: 56px;
      min-width: 140px;
      border-radius: 8px !important;
      background: linear-gradient(135deg, #8B1A1A, #C0392B) !important;
    }

    .upload-btn:disabled {
      opacity: 0.6;
    }

    @media (max-width: 768px) {
      .upload-row {
        flex-direction: column;
      }

      .upload-btn {
        width: 100%;
      }
    }
  `]
})
export class DocumentUploadInlineComponent implements OnInit {
  @Input() clientId!: string;
  @Input() creditRequestId: string | null = null; // ✅ Accepter null
  @Output() documentUploaded = new EventEmitter<DocumentType>();

  private fb = inject(FormBuilder);
  private documentService = inject(DocumentService);
  private snackBar = inject(MatSnackBar);

  uploadForm!: FormGroup;
  selectedFile: File | null = null;
  isUploading = false;
  isDragover = false;
  documentTypes = Object.values(DocumentType);

  ngOnInit(): void {
    this.uploadForm = this.fb.group({
      documentType: ['', Validators.required],
      description: ['']
    });
  }

  getDocumentLabel(type: DocumentType): string {
    return DOCUMENT_TYPE_CONFIG[type]?.label || type;
  }

  isMandatory(type: DocumentType): boolean {
    return DOCUMENT_TYPE_CONFIG[type]?.mandatory || false;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFile = files[0];
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    const fileInput = document.querySelector('.file-input-hidden') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  onSubmit(): void {
    if (this.uploadForm.invalid || !this.selectedFile || !this.clientId) {
      this.snackBar.open('Veuillez remplir tous les champs', 'Fermer', { duration: 3000 });
      return;
    }

    this.isUploading = true;
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('clientId', this.clientId);
    formData.append('documentType', this.uploadForm.get('documentType')?.value);
    if (this.uploadForm.get('description')?.value) {
      formData.append('description', this.uploadForm.get('description')?.value);
    }
    if (this.creditRequestId) {
      formData.append('creditRequestId', this.creditRequestId);
    }

    this.documentService.uploadDocument(formData).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.snackBar.open('✅ Document téléchargé avec succès', 'Fermer', { duration: 3000 });
        this.selectedFile = null;
        this.uploadForm.reset();
        this.documentUploaded.emit(response.documentType);
      },
      error: (error) => {
        console.error('Erreur upload:', error);
        this.isUploading = false;
        this.snackBar.open('❌ Erreur lors du téléchargement', 'Fermer', { duration: 5000 });
      }
    });
  }
}