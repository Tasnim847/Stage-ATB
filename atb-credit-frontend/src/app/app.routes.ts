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
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];