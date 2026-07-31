// src/app/features/admin/ocr-config/ocr-config.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTabsModule } from '@angular/material/tabs';
import { 
  OcrConfig, 
  OcrDocumentType, 
  OcrField, 
  OcrLog, 
  ValidationRule,
  OcrConnectionStatus
} from '@core/models/ocr.models';
import { OcrAdminService } from '@core/services/ocr-admin.service';

@Component({
  selector: 'app-ocr-config',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatChipsModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatDividerModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatSortModule,
    MatTabsModule,
  ],
  templateUrl: './ocr-config.component.html',
  styleUrls: ['./ocr-config.component.css']
})
export class OcrConfigComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Formulaires
  ocrConfigForm!: FormGroup;
  documentTypeForm!: FormGroup;
  fieldForm!: FormGroup;
  validationRuleForm!: FormGroup;
  
  // Données - TOUJOURS initialisées avec des tableaux vides
  ocrConfig!: OcrConfig;
  documentTypes: OcrDocumentType[] = [];
  selectedDocumentType?: OcrDocumentType;
  ocrFields: OcrField[] = [];
  validationRules: ValidationRule[] = [];
  ocrLogs: OcrLog[] = []; // ✅ Initialisé avec un tableau vide
  
  // DataSource pour les tableaux
  logsDataSource = new MatTableDataSource<OcrLog>([]);
  fieldsDataSource = new MatTableDataSource<OcrField>([]);
  rulesDataSource = new MatTableDataSource<ValidationRule>([]);
  
  // États
  isLoading = false;
  isSaving = false;
  showFieldForm = false;
  showRuleForm = false;
  editingFieldId?: number;
  editingRuleId?: number;
  showApiKey = false;
  showDocumentTypeForm = false;
  connectionStatus?: OcrConnectionStatus;
  
  // Colonnes des tableaux
  documentColumns = ['name', 'ocrEnabled', 'fields', 'actions'];
  fieldColumns = ['name', 'type', 'required', 'actions'];
  ruleColumns = ['name', 'condition', 'action', 'status', 'actions'];
  logColumns = ['date', 'user', 'document', 'result', 'confidence', 'status'];
  
  // Fournisseurs OCR
  ocrProviders = [
    { value: 'TESSERACT', label: 'Tesseract' },
    { value: 'AZURE', label: 'Azure Document Intelligence' },
    { value: 'GOOGLE_VISION', label: 'Google Vision' },
    { value: 'AMAZON_TEXTTRACT', label: 'Amazon Textract' },
    { value: 'ABBYY', label: 'ABBYY FineReader' }
  ];
  
  // Langues disponibles
  languages = [
    { value: 'fr', label: 'Français' },
    { value: 'ar', label: 'Arabe' },
    { value: 'en', label: 'Anglais' },
    { value: 'es', label: 'Espagnol' },
    { value: 'de', label: 'Allemand' },
    { value: 'it', label: 'Italien' },
    { value: 'pt', label: 'Portugais' },
    { value: 'ru', label: 'Russe' },
    { value: 'zh', label: 'Chinois' },
    { value: 'ja', label: 'Japonais' }
  ];
  
  // Types de champs
  fieldTypes = [
    { value: 'text', label: 'Texte' },
    { value: 'number', label: 'Nombre' },
    { value: 'date', label: 'Date' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'iban', label: 'IBAN' },
    { value: 'amount', label: 'Montant' },
    { value: 'boolean', label: 'Booléen' }
  ];
  
  // Conditions de validation
  validationConditions = [
    { value: 'CONTAINS', label: 'Contient' },
    { value: 'NOT_CONTAINS', label: 'Ne contient pas' },
    { value: 'EQUALS', label: 'Égal à' },
    { value: 'NOT_EQUALS', label: 'Différent de' },
    { value: 'GREATER_THAN', label: 'Supérieur à' },
    { value: 'LESS_THAN', label: 'Inférieur à' },
    { value: 'BETWEEN', label: 'Entre' },
    { value: 'REGEX', label: 'Regex' },
    { value: 'DATE_EXPIRED', label: 'Date expirée' },
    { value: 'DATE_FRESHER_THAN', label: 'Date plus récente que' },
    { value: 'AGE_OLDER_THAN', label: 'Âge supérieur à' }
  ];
  
  // Actions de validation
  validationActions = [
    { value: 'ALERT', label: 'Alerte' },
    { value: 'WARNING', label: 'Avertissement' },
    { value: 'ERROR', label: 'Erreur' },
    { value: 'REJECT', label: 'Rejeter le document' },
    { value: 'REQUEST_NEW', label: 'Demander nouveau document' }
  ];

  actionColors: { [key: string]: string } = {
    'ALERT': 'warn',
    'WARNING': 'accent',
    'ERROR': 'warn',
    'REJECT': 'warn',
    'REQUEST_NEW': 'primary'
  };

  statusColors: { [key: string]: string } = {
    'SUCCESS': 'primary',
    'ERROR': 'warn',
    'WARNING': 'accent',
    'PENDING': 'primary'
  };

  constructor(
    private fb: FormBuilder,
    private ocrAdminService: OcrAdminService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadData();
  }

  initForms(): void {
    this.ocrConfigForm = this.fb.group({
      provider: ['', Validators.required],
      apiKey: ['', Validators.required],
      endpoint: ['', [Validators.required, Validators.pattern('^https?://.*')]],
      languages: [['fr', 'ar'], Validators.required],
      minConfidence: [85, [Validators.required, Validators.min(0), Validators.max(100)]],
      enabled: [true],
      maxRetries: [3, [Validators.required, Validators.min(0)]],
      timeout: [30, [Validators.required, Validators.min(5)]],
      autoSync: [false]
    });

    this.documentTypeForm = this.fb.group({
      name: ['', Validators.required],
      code: ['', Validators.required],
      description: [''],
      ocrEnabled: [true],
      required: [false],
      maxSize: [10, [Validators.required, Validators.min(1)]],
      allowedFormats: [['PDF', 'JPG', 'PNG'], Validators.required]
    });

    this.fieldForm = this.fb.group({
      name: ['', Validators.required],
      type: ['text', Validators.required],
      required: [false],
      regex: [''],
      description: ['']
    });

    this.validationRuleForm = this.fb.group({
      name: ['', Validators.required],
      condition: ['', Validators.required],
      value: ['', Validators.required],
      value2: [''],
      action: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  loadData(): void {
    this.isLoading = true;
    
    this.ocrAdminService.getConfig().subscribe({
      next: (config) => {
        this.ocrConfig = config;
        this.ocrConfigForm.patchValue(config);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement config', err);
        this.isLoading = false;
        this.showError('Erreur lors du chargement de la configuration');
      }
    });

    this.ocrAdminService.getDocumentTypes().subscribe({
      next: (types) => {
        this.documentTypes = types || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement types documents', err);
        this.documentTypes = [];
        this.isLoading = false;
        this.showError('Erreur lors du chargement des types de documents');
      }
    });

    this.loadLogs();
  }

  loadLogs(): void {
  this.ocrAdminService.getOcrLogs().subscribe({
    next: (response) => {
      // ✅ La réponse est déjà traitée par le service, mais on vérifie quand même
      if (Array.isArray(response)) {
        this.ocrLogs = response;
      } else {
        console.warn('⚠️ loadLogs: la réponse n\'est pas un tableau:', response);
        this.ocrLogs = [];
      }
      this.logsDataSource.data = this.ocrLogs;
      console.log('✅ Logs chargés:', this.ocrLogs.length);
    },
    error: (err) => {
      console.error('❌ Erreur chargement logs:', err);
      this.ocrLogs = [];
      this.logsDataSource.data = [];
    }
  });
}

  // ============================================
  // CONFIGURATION OCR
  // ============================================

  toggleApiKeyVisibility(event: Event): void {
    event.preventDefault();
    this.showApiKey = !this.showApiKey;
    const input = document.querySelector('input[formControlName="apiKey"]') as HTMLInputElement;
    if (input) {
      input.type = this.showApiKey ? 'text' : 'password';
    }
  }

  saveOcrConfig(): void {
    if (this.ocrConfigForm.invalid) {
      this.markFormGroupTouched(this.ocrConfigForm);
      return;
    }

    this.isSaving = true;
    const config = this.ocrConfigForm.value;

    this.ocrAdminService.updateConfig(config).subscribe({
      next: () => {
        this.showSuccess('Configuration OCR sauvegardée avec succès');
        this.isSaving = false;
      },
      error: (err) => {
        console.error('Erreur sauvegarde config', err);
        this.showError('Erreur lors de la sauvegarde de la configuration');
        this.isSaving = false;
      }
    });
  }

  testOcrConnection(): void {
    this.isLoading = true;
    this.connectionStatus = undefined;
    this.ocrAdminService.testConnection().subscribe({
      next: (result) => {
        this.connectionStatus = result;
        this.showSuccess(result.message || 'Connexion OCR réussie');
        this.isLoading = false;
      },
      error: (err) => {
        this.connectionStatus = {
          success: false,
          message: err.message || 'Échec de la connexion'
        };
        this.showError('Échec de la connexion OCR: ' + err.message);
        this.isLoading = false;
      }
    });
  }

  // ============================================
  // TYPES DE DOCUMENTS
  // ============================================

  addNewDocumentType(): void {
    this.showDocumentTypeForm = !this.showDocumentTypeForm;
    if (!this.showDocumentTypeForm) {
      this.documentTypeForm.reset({
        ocrEnabled: true,
        required: false,
        maxSize: 10,
        allowedFormats: ['PDF', 'JPG', 'PNG']
      });
    }
  }

  cancelDocumentTypeForm(): void {
    this.showDocumentTypeForm = false;
    this.documentTypeForm.reset({
      ocrEnabled: true,
      required: false,
      maxSize: 10,
      allowedFormats: ['PDF', 'JPG', 'PNG']
    });
  }

  // src/app/features/admin/ocr-config/ocr-config.component.ts

addDocumentType(): void {
  if (this.documentTypeForm.invalid) {
    this.markFormGroupTouched(this.documentTypeForm);
    return;
  }

  const newType = this.documentTypeForm.value;
  
  // ✅ AJOUTER CE LOG POUR VOIR CE QUI EST ENVOYÉ
  console.log('📤 Données envoyées:', JSON.stringify(newType, null, 2));
  
  this.ocrAdminService.addDocumentType(newType).subscribe({
    next: (type) => {
      this.documentTypes.push(type);
      this.documentTypeForm.reset({
        ocrEnabled: true,
        required: false,
        maxSize: 10,
        allowedFormats: ['PDF', 'JPG', 'PNG']
      });
      this.showDocumentTypeForm = false;
      this.showSuccess('Type de document ajouté avec succès');
    },
    error: (err) => {
      // ✅ AFFICHER PLUS DE DÉTAILS SUR L'ERREUR
      console.error('❌ Erreur ajout type document:', err);
      console.error('❌ Détails:', err.error);
      
      // Afficher le message d'erreur du backend
      const errorMessage = err.error?.message || err.message || 'Erreur lors de l\'ajout du type de document';
      this.showError(errorMessage);
    }
  });
}

  toggleDocumentOcr(documentType: OcrDocumentType): void {
    if (!documentType.id) return;
    documentType.ocrEnabled = !documentType.ocrEnabled;
    this.ocrAdminService.updateDocumentType(documentType.id, documentType).subscribe({
      next: () => {
        this.showSuccess('Mise à jour effectuée avec succès');
      },
      error: (err) => {
        console.error('Erreur mise à jour', err);
        documentType.ocrEnabled = !documentType.ocrEnabled;
        this.showError('Erreur lors de la mise à jour');
      }
    });
  }

  selectDocumentType(type: OcrDocumentType): void {
    this.selectedDocumentType = type;
    this.ocrFields = type.fields || [];
    this.fieldsDataSource.data = this.ocrFields;
    this.validationRules = type.validationRules || [];
    this.rulesDataSource.data = this.validationRules;
    this.showFieldForm = false;
    this.showRuleForm = false;
  }

  deleteDocumentType(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer ce type de document ?')) {
      this.ocrAdminService.deleteDocumentType(id).subscribe({
        next: () => {
          this.documentTypes = this.documentTypes.filter(t => t.id !== id);
          if (this.selectedDocumentType?.id === id) {
            this.selectedDocumentType = undefined;
            this.ocrFields = [];
            this.fieldsDataSource.data = [];
            this.validationRules = [];
            this.rulesDataSource.data = [];
          }
          this.showSuccess('Type de document supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur suppression', err);
          this.showError('Erreur lors de la suppression du type de document');
        }
      });
    }
  }

  // ============================================
  // CHAMPS OCR
  // ============================================

  toggleFieldForm(): void {
    this.showFieldForm = !this.showFieldForm;
    if (!this.showFieldForm) {
      this.fieldForm.reset({ type: 'text', required: false });
      this.editingFieldId = undefined;
    }
  }

  cancelFieldForm(): void {
    this.showFieldForm = false;
    this.editingFieldId = undefined;
    this.fieldForm.reset({ type: 'text', required: false });
  }

  addField(): void {
    if (this.fieldForm.invalid || !this.selectedDocumentType?.id) {
      this.markFormGroupTouched(this.fieldForm);
      return;
    }

    const field = this.fieldForm.value;
    
    if (this.editingFieldId) {
      const index = this.ocrFields.findIndex(f => f.id === this.editingFieldId);
      if (index !== -1) {
        const updatedField = { ...this.ocrFields[index], ...field };
        this.ocrAdminService.updateField(this.selectedDocumentType.id, updatedField).subscribe({
          next: (updated) => {
            this.ocrFields[index] = updated;
            this.fieldsDataSource.data = [...this.ocrFields];
            this.cancelFieldForm();
            this.showSuccess('Champ mis à jour avec succès');
          },
          error: (err) => {
            console.error('Erreur mise à jour champ', err);
            this.showError('Erreur lors de la mise à jour du champ');
          }
        });
      }
    } else {
      this.ocrAdminService.addField(this.selectedDocumentType.id, field).subscribe({
        next: (newField) => {
          this.ocrFields.push(newField);
          this.fieldsDataSource.data = [...this.ocrFields];
          this.fieldForm.reset({ type: 'text', required: false });
          this.showFieldForm = false;
          this.showSuccess('Champ ajouté avec succès');
        },
        error: (err) => {
          console.error('Erreur ajout champ', err);
          this.showError('Erreur lors de l\'ajout du champ');
        }
      });
    }
  }

  editField(field: OcrField): void {
    this.editingFieldId = field.id;
    this.fieldForm.patchValue(field);
    this.showFieldForm = true;
  }

  deleteField(fieldId: number): void {
    if (!this.selectedDocumentType?.id) return;
    if (confirm('Voulez-vous vraiment supprimer ce champ ?')) {
      this.ocrAdminService.deleteField(this.selectedDocumentType.id, fieldId).subscribe({
        next: () => {
          this.ocrFields = this.ocrFields.filter(f => f.id !== fieldId);
          this.fieldsDataSource.data = [...this.ocrFields];
          this.showSuccess('Champ supprimé avec succès');
        },
        error: (err) => {
          console.error('Erreur suppression champ', err);
          this.showError('Erreur lors de la suppression du champ');
        }
      });
    }
  }

  // ============================================
  // RÈGLES DE VALIDATION
  // ============================================

  toggleRuleForm(): void {
    this.showRuleForm = !this.showRuleForm;
    if (!this.showRuleForm) {
      this.validationRuleForm.reset();
      this.editingRuleId = undefined;
    }
  }

  cancelRuleForm(): void {
    this.showRuleForm = false;
    this.editingRuleId = undefined;
    this.validationRuleForm.reset();
  }

  addValidationRule(): void {
    if (this.validationRuleForm.invalid || !this.selectedDocumentType?.id) {
      this.markFormGroupTouched(this.validationRuleForm);
      return;
    }

    const rule = this.validationRuleForm.value;
    
    if (this.editingRuleId) {
      const index = this.validationRules.findIndex(r => r.id === this.editingRuleId);
      if (index !== -1) {
        const updatedRule = { ...this.validationRules[index], ...rule };
        this.ocrAdminService.updateValidationRule(this.selectedDocumentType.id, updatedRule).subscribe({
          next: (updated) => {
            this.validationRules[index] = updated;
            this.rulesDataSource.data = [...this.validationRules];
            this.cancelRuleForm();
            this.showSuccess('Règle mise à jour avec succès');
          },
          error: (err) => {
            console.error('Erreur mise à jour règle', err);
            this.showError('Erreur lors de la mise à jour de la règle');
          }
        });
      }
    } else {
      this.ocrAdminService.addValidationRule(this.selectedDocumentType.id, rule).subscribe({
        next: (newRule) => {
          this.validationRules.push(newRule);
          this.rulesDataSource.data = [...this.validationRules];
          this.validationRuleForm.reset();
          this.showRuleForm = false;
          this.showSuccess('Règle ajoutée avec succès');
        },
        error: (err) => {
          console.error('Erreur ajout règle', err);
          this.showError('Erreur lors de l\'ajout de la règle');
        }
      });
    }
  }

  editValidationRule(rule: ValidationRule): void {
    this.editingRuleId = rule.id;
    this.validationRuleForm.patchValue(rule);
    this.showRuleForm = true;
  }

  deleteValidationRule(ruleId: number): void {
    if (!this.selectedDocumentType?.id) return;
    if (confirm('Voulez-vous vraiment supprimer cette règle ?')) {
      this.ocrAdminService.deleteValidationRule(this.selectedDocumentType.id, ruleId).subscribe({
        next: () => {
          this.validationRules = this.validationRules.filter(r => r.id !== ruleId);
          this.rulesDataSource.data = [...this.validationRules];
          this.showSuccess('Règle supprimée avec succès');
        },
        error: (err) => {
          console.error('Erreur suppression règle', err);
          this.showError('Erreur lors de la suppression de la règle');
        }
      });
    }
  }

  toggleRuleActive(rule: ValidationRule): void {
    if (!this.selectedDocumentType?.id) return;
    rule.active = !rule.active;
    this.ocrAdminService.updateValidationRule(this.selectedDocumentType.id, rule).subscribe({
      next: () => {
        this.showSuccess('Règle ' + (rule.active ? 'activée' : 'désactivée'));
      },
      error: (err) => {
        console.error('Erreur mise à jour règle', err);
        rule.active = !rule.active;
        this.showError('Erreur lors de la mise à jour');
      }
    });
  }

  // ============================================
  // JOURNAL OCR
  // ============================================

  refreshLogs(): void {
    this.loadLogs();
    this.showSuccess('Journal actualisé');
  }

  clearLogs(): void {
    if (confirm('Voulez-vous vraiment effacer tous les logs OCR ?')) {
      this.ocrAdminService.clearLogs().subscribe({
        next: () => {
          this.ocrLogs = [];
          this.logsDataSource.data = [];
          this.showSuccess('Logs effacés avec succès');
        },
        error: (err) => {
          console.error('Erreur effacement logs', err);
          this.showError('Erreur lors de l\'effacement des logs');
        }
      });
    }
  }

  // ============================================
  // MÉTHODES STATISTIQUES - CORRIGÉES ✅
  // ============================================

  getSuccessCount(): number {
  // ✅ Vérification que ocrLogs est un tableau
  if (!this.ocrLogs || !Array.isArray(this.ocrLogs)) {
    console.warn('⚠️ getSuccessCount: ocrLogs n\'est pas un tableau', this.ocrLogs);
    return 0;
  }
  return this.ocrLogs.filter(log => log.result === 'SUCCESS').length;
}

getErrorCount(): number {
  if (!this.ocrLogs || !Array.isArray(this.ocrLogs)) {
    return 0;
  }
  return this.ocrLogs.filter(log => log.result === 'ERROR').length;
}

getWarningCount(): number {
  if (!this.ocrLogs || !Array.isArray(this.ocrLogs)) {
    return 0;
  }
  return this.ocrLogs.filter(log => log.result === 'WARNING').length;
}

  getActionColor(action: string): string {
    return this.actionColors[action] || 'primary';
  }

  getStatusColor(result: string): string {
    return this.statusColors[result] || 'primary';
  }

  // ============================================
  // UTILITAIRES
  // ============================================

  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  showSuccess(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  showError(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }

  getFieldTypeLabel(type: string): string {
    const found = this.fieldTypes.find(t => t.value === type);
    return found ? found.label : type;
  }

  getConditionLabel(condition: string): string {
    const found = this.validationConditions.find(c => c.value === condition);
    return found ? found.label : condition;
  }

  getActionLabel(action: string): string {
    const found = this.validationActions.find(a => a.value === action);
    return found ? found.label : action;
  }

  getStatusLabel(result: string): { label: string, class: string } {
    const statusMap: { [key: string]: { label: string, class: string } } = {
      'SUCCESS': { label: '✅ Succès', class: 'status-success' },
      'ERROR': { label: '❌ Erreur', class: 'status-error' },
      'WARNING': { label: '⚠️ Avertissement', class: 'status-warning' },
      'PENDING': { label: '⏳ En cours', class: 'status-pending' }
    };
    return statusMap[result] || { label: result, class: 'status-unknown' };
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    return new Date(date).toLocaleString('fr-FR');
  }
}