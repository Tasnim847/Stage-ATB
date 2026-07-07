import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component')
      .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component')
      .then(m => m.RegisterComponent)
  },
  {
    path: '',
    loadComponent: () => import('./features/layout/layout.component')
      .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      {
        path: 'clients',
        loadComponent: () => import('./features/clients/clients.component')
          .then(m => m.ClientsComponent)
      },
      {
        path: 'clients/new',
        loadComponent: () => import('./features/clients/client-form/client-form.component')
          .then(m => m.ClientFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'ADMIN'] }
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () => import('./features/clients/client-form/client-form.component')
          .then(m => m.ClientFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'ADMIN'] }
      },
      {
        path: 'clients/:id',
        loadComponent: () => import('./features/clients/client-detail/client-detail.component')
          .then(m => m.ClientDetailComponent)
      },
      {
        path: 'credit-requests',
        loadComponent: () => import('./features/credit-requests/credit-requests.component')
          .then(m => m.CreditRequestsComponent)
      },
      // ✅ Route pour les crédits du client (my-credits)
      {
        path: 'my-credits',
        loadComponent: () => import('./features/credits/client/credit-client/credit-client.component')
          .then(m => m.CreditClientComponent)
      },
      // ✅ Route pour nouvelle demande de crédit
      {
        path: 'credit-requests/new',
        loadComponent: () => import('./features/credits/client/add-credit/add-credit.component')
          .then(m => m.AddCreditComponent)
      },
      // ✅ Route pour le résultat de la simulation - CORRIGÉ
      {
        path: 'simulation-result/:id',
        loadComponent: () => import('./features/credits/client/simulation-result/simulation-result.component')
          .then(m => m.SimulationResultComponent)
      },
      {
        path: 'financial-analysis',
        loadComponent: () => import('./features/financial-analysis/financial-analysis.component')
          .then(m => m.FinancialAnalysisComponent)
      },
      {
        path: 'risk-analysis',
        loadComponent: () => import('./features/risk-analysis/risk-analysis.component')
          .then(m => m.RiskAnalysisComponent)
      },
      {
        path: 'fraud-alerts',
        loadComponent: () => import('./features/fraud-alerts/fraud-alerts.component')
          .then(m => m.FraudAlertsComponent)
      },
      {
        path: 'kyc',
        loadComponent: () => import('./features/kyc/kyc.component')
          .then(m => m.KycComponent)
      },
      {
        path: 'copilot',
        loadComponent: () => import('./features/copilot/copilot.component')
          .then(m => m.CopilotComponent)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component')
          .then(m => m.NotificationsComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component')
          .then(m => m.ProfileComponent)
      },
      // app.routes.ts - AJOUTER LA ROUTE
      {
        path: 'admin/client-assignment',
        loadComponent: () => import('./features/Admin/client-assignment/client-assignment.component')
          .then(m => m.ClientAssignmentComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      // ✅ Route pour la gestion des rôles
      {
        path: 'admin/roles',
        loadComponent: () => import('./features/Admin/role-management/role-management.component')
          .then(m => m.RoleManagementComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      // app.routes.ts - AJOUTER LA ROUTE
      {
        path: 'admin/users',
        loadComponent: () => import('./features/Admin/user-management/user-management.component')
          .then(m => m.UserManagementComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      // app.routes.ts - AJOUTER
      {
        path: 'admin/audit-logs',
        loadComponent: () => import('./features/Admin/audit-logs/audit-logs.component')
          .then(m => m.AuditLogsComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/documents',
        loadComponent: () => import('./features/documents/document-management/document-management.component')
          .then(m => m.DocumentManagementComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN'] }
      },
      // Ajouter dans app.routes.ts
      {
        path: 'documents',
        loadComponent: () => import('./features/documents/document-management/document-management.component')
          .then(m => m.DocumentManagementComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'ANALYST'] }
      },
      {
        path: 'documents/upload',
        loadComponent: () => import('./features/documents/document-upload/document-upload.component')
          .then(m => m.DocumentUploadComponent),
        canActivate: [authGuard],
        data: { roles: ['ADMIN', 'ANALYST', 'ADVISOR'] }
      },
      {
        path: 'documents/verify/:id',
        loadComponent: () => import('./features/documents/document-verification/document-verification.component')
          .then(m => m.DocumentVerificationComponent),
        canActivate: [authGuard, roleGuard],
        data: { roles: ['ADMIN', 'ANALYST'] }
      },
      {
        path: 'clients/:id/documents',
        loadComponent: () => import('./features/documents/document-list/document-list.component')
          .then(m => m.DocumentListComponent),
        canActivate: [authGuard]
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];