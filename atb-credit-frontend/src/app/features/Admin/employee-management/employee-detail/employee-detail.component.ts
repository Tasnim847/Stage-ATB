// features/admin/employee-management/employee-detail/employee-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { EmployeeService } from '@core/services/employee.service';
import { EmployeeResponseDTO } from '@core/models/employee.model';

@Component({
  selector: 'app-employee-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.css']
})
export class EmployeeDetailComponent implements OnInit, OnDestroy {
  employee: EmployeeResponseDTO | null = null;
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployee();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployee(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/admin/employees']);
      return;
    }

    this.loading = true;
    this.employeeService.getEmployeeById(id)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.snackBar.open('Erreur lors du chargement de l\'employé', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erreur:', error);
          this.router.navigate(['/admin/employees']);
          return [];
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((employee) => {
        this.employee = employee;
      });
  }

  // ✅ Convertir le rôle en chaîne de caractères
  getRoleString(role: any): string {
    if (typeof role === 'string') {
      return role;
    }
    if (role && typeof role === 'object' && role.toString) {
      return role.toString();
    }
    return String(role || '');
  }

  getRoleLabel(role: any): string {
    const roleStr = this.getRoleString(role);
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'ANALYST': 'Analyste de crédit',
      'ADVISOR': 'Conseiller bancaire',
      'MANAGER': 'Responsable des crédits',
      'CLIENT': 'Client'
    };
    return labels[roleStr] || roleStr;
  }

  getRoleClass(role: any): string {
    const roleStr = this.getRoleString(role);
    const classes: { [key: string]: string } = {
      'ADMIN': 'role-admin',
      'ANALYST': 'role-analyst',
      'ADVISOR': 'role-advisor',
      'MANAGER': 'role-manager',
      'CLIENT': 'role-client'
    };
    return classes[roleStr] || '';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'ACTIVE': 'Actif',
      'INACTIVE': 'Inactif',
      'SUSPENDED': 'Suspendu',
      'ON_LEAVE': 'En congé',
      'TERMINATED': 'Résilié'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    const classes: { [key: string]: string } = {
      'ACTIVE': 'status-active',
      'INACTIVE': 'status-inactive',
      'SUSPENDED': 'status-suspended',
      'ON_LEAVE': 'status-on-leave',
      'TERMINATED': 'status-terminated'
    };
    return classes[status] || '';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'ACTIVE': 'check_circle',
      'INACTIVE': 'block',
      'SUSPENDED': 'warning',
      'ON_LEAVE': 'beach_access',
      'TERMINATED': 'cancel'
    };
    return icons[status] || 'help';
  }

  getInitials(): string {
    if (!this.employee) return '';
    return (this.employee.firstName?.charAt(0) || '') + 
           (this.employee.lastName?.charAt(0) || '');
  }

  getFullName(): string {
    if (!this.employee) return '';
    return `${this.employee.firstName} ${this.employee.lastName}`;
  }

  goBack(): void {
    this.router.navigate(['/admin/employees']);
  }

  editEmployee(): void {
    if (this.employee) {
      this.router.navigate(['/admin/employees', this.employee.id, 'edit']);
    }
  }

  deleteEmployee(): void {
    if (!this.employee) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${this.getFullName()} ?`)) {
      this.employeeService.deleteEmployee(this.employee.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Employé supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.router.navigate(['/admin/employees']);
          },
          error: (error) => {
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            console.error('Erreur:', error);
          }
        });
    }
  }

  toggleStatus(): void {
    if (!this.employee) return;

    const action = this.employee.active ? 'désactiver' : 'activer';
    if (confirm(`Êtes-vous sûr de vouloir ${action} cet employé ?`)) {
      const request = this.employee.active
        ? this.employeeService.deactivateEmployee(this.employee.id)
        : this.employeeService.activateEmployee(this.employee.id);

      request.pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open(`Employé ${action} avec succès`, 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadEmployee();
          },
          error: (error) => {
            this.snackBar.open(`Erreur lors de la ${action}`, 'Fermer', {
              duration: 3000,
              panelClass: ['error-snackbar']
            });
            console.error('Erreur:', error);
          }
        });
    }
  }

  getAvatarColor(): string {
    if (!this.employee) return '#1a237e';
    const colors = ['#1a237e', '#1565c0', '#0d47a1', '#283593', '#01579b'];
    const index = this.employee.id.length % colors.length;
    return colors[index];
  }
}