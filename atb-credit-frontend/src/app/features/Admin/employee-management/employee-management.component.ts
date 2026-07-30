// features/admin/employee-management/employee-management.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { EmployeeResponseDTO } from '@core/models/employee.model';
import { EmployeeService } from '@core/services/employee.service';

@Component({
  selector: 'app-employee-management',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatTooltipModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatBadgeModule,
    MatMenuModule,
    MatDividerModule
  ],
  templateUrl: './employee-management.component.html',
  styleUrls: ['./employee-management.component.css']
})
export class EmployeeManagementComponent implements OnInit, OnDestroy {
  allEmployees: EmployeeResponseDTO[] = [];
  employees: EmployeeResponseDTO[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  // ✅ Rôles autorisés pour les employés (exclut CLIENT)
  private readonly employeeRoles = ['ADMIN', 'ANALYST', 'ADVISOR', 'MANAGER'];

  // ✅ Statistiques
  get totalEmployees(): number {
    return this.employees.length;
  }

  get activeEmployees(): number {
    return this.employees.filter(e => e.active).length;
  }

  get adminCount(): number {
    return this.employees.filter(e => this.getRoleString(e.role) === 'ADMIN').length;
  }

  get analystCount(): number {
    return this.employees.filter(e => this.getRoleString(e.role) === 'ANALYST').length;
  }

  get advisorCount(): number {
    return this.employees.filter(e => this.getRoleString(e.role) === 'ADVISOR').length;
  }

  get managerCount(): number {
    return this.employees.filter(e => this.getRoleString(e.role) === 'MANAGER').length;
  }

  constructor(
    private employeeService: EmployeeService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEmployees(): void {
    this.loading = true;
    this.employeeService.getAllEmployees()
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.snackBar.open('Erreur lors du chargement des employés', 'Fermer', {
            duration: 3000,
            panelClass: ['error-snackbar']
          });
          console.error('Erreur:', error);
          return [];
        }),
        finalize(() => this.loading = false)
      )
      .subscribe((data) => {
        this.allEmployees = data;
        this.employees = this.filterEmployees(data);
      });
  }

  private filterEmployees(employees: EmployeeResponseDTO[]): EmployeeResponseDTO[] {
    return employees.filter(emp => {
      const roleStr = this.getRoleString(emp.role);
      return this.employeeRoles.includes(roleStr);
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

  // ✅ getRoleClass - AJOUTÉ
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

  getRoleLabel(role: any): string {
    const roleStr = this.getRoleString(role);
    const labels: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'ANALYST': 'Analyste',
      'ADVISOR': 'Conseiller',
      'MANAGER': 'Manager',
      'CLIENT': 'Client'
    };
    return labels[roleStr] || roleStr;
  }

  getRoleIcon(role: any): string {
    const roleStr = this.getRoleString(role);
    const icons: { [key: string]: string } = {
      'ADMIN': 'admin_panel_settings',
      'ANALYST': 'analytics',
      'ADVISOR': 'support_agent',
      'MANAGER': 'manage_accounts',
      'CLIENT': 'person'
    };
    return icons[roleStr] || 'person';
  }

  getRoleColor(role: any): string {
    const roleStr = this.getRoleString(role);
    const colors: { [key: string]: string } = {
      'ADMIN': '#1a237e',
      'ANALYST': '#00695c',
      'ADVISOR': '#4a148c',
      'MANAGER': '#e65100',
      'CLIENT': '#0d47a1'
    };
    return colors[roleStr] || '#1a237e';
  }

  getStatusChipClass(status: string): string {
    switch(status) {
      case 'ACTIVE': return 'status-active';
      case 'INACTIVE': return 'status-inactive';
      case 'SUSPENDED': return 'status-suspended';
      case 'ON_LEAVE': return 'status-on-leave';
      case 'TERMINATED': return 'status-terminated';
      default: return '';
    }
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

  getAvatarColor(employee: EmployeeResponseDTO): string {
    const colors = ['#1a237e', '#00695c', '#4a148c', '#e65100', '#0d47a1', '#004d40', '#880e4f', '#bf360c'];
    const index = employee.id.length % colors.length;
    return colors[index];
  }

  getInitials(employee: EmployeeResponseDTO): string {
    if (!employee) return '';
    const first = employee.firstName?.charAt(0) || '';
    const last = employee.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  getFullName(employee: EmployeeResponseDTO): string {
    return `${employee.firstName} ${employee.lastName}`;
  }

  deleteEmployee(id: string): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
      this.employeeService.deleteEmployee(id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.snackBar.open('Employé supprimé avec succès', 'Fermer', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
            this.loadEmployees();
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

  toggleStatus(employee: EmployeeResponseDTO): void {
    const action = employee.active ? 'désactiver' : 'activer';
    if (confirm(`Êtes-vous sûr de vouloir ${action} cet employé ?`)) {
      const request = employee.active 
        ? this.employeeService.deactivateEmployee(employee.id)
        : this.employeeService.activateEmployee(employee.id);

      request.pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.snackBar.open(`Employé ${action} avec succès`, 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.loadEmployees();
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

  trackByEmployeeId(index: number, employee: EmployeeResponseDTO): string {
    return employee.id;
  }
}