import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';
import { ClientService, ClientRequestDTO } from '@core/services/client.service';
import { AuthService } from '@core/services/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip'; // ✅ AJOUTÉ


@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatTooltipModule // ✅ AJOUTÉ

  ],
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css']
})
export class ClientFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private clientService = inject(ClientService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  clientForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  clientId: string | null = null;
  currentUser: any = null;
  errorMessage: string = '';

  // Options pour les sélecteurs
  genders = ['M', 'F', 'Autre'];
  maritalStatuses = ['Célibataire', 'Marié(e)', 'Divorcé(e)', 'Veuf/Veuve', 'Séparé(e)'];
  identityTypes = ['CIN', 'Passeport', 'Carte de séjour', 'Autre'];
  nationalities = ['Tunisienne', 'Française', 'Algérienne', 'Marocaine', 'Libyenne', 'Autre'];

  ngOnInit(): void {
    this.currentUser = this.authService.getUserInfo();
    console.log('Current user (ADVISOR):', this.currentUser); // ✅ Vérifier l'utilisateur
    this.initForm();
    
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.clientId = params['id'];
        if (this.clientId) {
          this.loadClientData(this.clientId);
        }
      }
    });
  }

  initForm(): void {
    this.clientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      middleName: [''],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      dateOfBirth: [''],
      placeOfBirth: [''],
      nationality: [''],
      maritalStatus: [''],
      gender: [''],
      identityNumber: [''],
      identityType: [''],
      profession: [''],
      employer: [''],
      monthlyIncome: [''],
      address: [''],
      city: [''],
      country: [''],
      postalCode: [''],
      notes: ['']
    });
  }

  loadClientData(id: string): void {
    this.isLoading = true;
    this.clientService.getClientById(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          firstName: client.firstName,
          lastName: client.lastName,
          email: client.email,
          phoneNumber: client.phoneNumber,
          dateOfBirth: client.dateOfBirth,
          nationality: client.nationality,
          profession: client.profession,
          employer: client.employer,
          monthlyIncome: client.monthlyIncome,
          address: client.address,
          city: client.city,
          country: client.country
        });
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement client:', error);
        this.toastr.error('Erreur lors du chargement du client', 'Erreur');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    // ✅ Vérifier si le formulaire est valide
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      
      // Afficher les erreurs spécifiques
      const errors = this.getFormErrors();
      this.toastr.error('Veuillez corriger les erreurs du formulaire', 'Formulaire invalide');
      console.error('Erreurs du formulaire:', errors);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    
    // ✅ Récupérer les données du formulaire
    const formValue = this.clientForm.value;
    
    // ✅ Créer l'objet client
    const clientData: ClientRequestDTO = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      middleName: formValue.middleName || '',
      email: formValue.email,
      phoneNumber: formValue.phoneNumber || '',
      dateOfBirth: formValue.dateOfBirth || '',
      placeOfBirth: formValue.placeOfBirth || '',
      nationality: formValue.nationality || '',
      maritalStatus: formValue.maritalStatus || '',
      gender: formValue.gender || '',
      identityNumber: formValue.identityNumber || '',
      identityType: formValue.identityType || '',
      profession: formValue.profession || '',
      employer: formValue.employer || '',
      monthlyIncome: formValue.monthlyIncome || '',
      address: formValue.address || '',
      city: formValue.city || '',
      country: formValue.country || '',
      postalCode: formValue.postalCode || '',
      notes: formValue.notes || ''
    };

    // ✅ Ajouter l'ID du conseiller connecté
    if (this.currentUser && this.currentUser.id) {
      clientData.advisorId = this.currentUser.id;
      console.log('Advisor ID ajouté:', clientData.advisorId); // ✅ Vérifier l'ID
    }

    console.log('Données du client à envoyer:', clientData); // ✅ Vérifier les données

    if (this.isEditMode && this.clientId) {
      // ✅ Mise à jour
      this.clientService.updateClient(this.clientId, clientData).subscribe({
        next: (response) => {
          console.log('Client mis à jour:', response);
          this.isLoading = false;
          this.toastr.success('Client modifié avec succès', 'Succès');
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          console.error('Erreur modification:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la modification';
          this.toastr.error(this.errorMessage, 'Erreur');
        }
      });
    } else {
      // ✅ Création
      this.clientService.createClient(clientData).subscribe({
        next: (response) => {
          console.log('Client créé:', response);
          this.isLoading = false;
          this.toastr.success('Client créé avec succès', 'Succès');
          this.router.navigate(['/clients']);
        },
        error: (error) => {
          console.error('Erreur création:', error);
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Erreur lors de la création';
          this.toastr.error(this.errorMessage, 'Erreur');
        }
      });
    }
  }

  // ✅ Fonction pour récupérer les erreurs du formulaire
  getFormErrors(): any {
    const errors: any = {};
    Object.keys(this.clientForm.controls).forEach(key => {
      const control = this.clientForm.get(key);
      if (control?.invalid) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  goBack(): void {
    this.router.navigate(['/clients']);
  }

  // ✅ Getters pour le template
  get firstName() { return this.clientForm.get('firstName'); }
  get lastName() { return this.clientForm.get('lastName'); }
  get email() { return this.clientForm.get('email'); }
  get phoneNumber() { return this.clientForm.get('phoneNumber'); }
  get dateOfBirth() { return this.clientForm.get('dateOfBirth'); }
}