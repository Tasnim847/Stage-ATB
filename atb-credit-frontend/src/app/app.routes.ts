import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./features/auth/auth-page/auth-page.component')
      .then(m => m.AuthPageComponent)
  },
  // Redirection pour compatibilité avec les anciennes routes
  {
    path: 'login',
    redirectTo: '/auth'  
  },
  {
    path: 'register',
    redirectTo: '/auth'
  },
  {
    path: '',
    loadComponent: () => import('./features/layout/layout.component')
      .then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      // ============================================
      // DASHBOARD - POINT D'ENTRÉE
      // ============================================
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component')
          .then(m => m.DashboardComponent)
      },
      
      // ============================================
      // DASHBOARDS PAR RÔLE
      // ============================================
      
      // 👤 Dashboard Client
      {
        path: 'client-dashboard',
        loadComponent: () => import('./features/dashboard/client-dashboard/client-dashboard.component')
          .then(m => m.ClientDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },
      
      // 🛡️ Dashboard Admin
      {
        path: 'admin-dashboard',
        loadComponent: () => import('./features/dashboard/admin-dashboard/admin-dashboard.component')
          .then(m => m.AdminDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // 📊 Dashboard Analyste
      {
        path: 'analyst-dashboard',
        loadComponent: () => import('./features/dashboard/analyst-dashboard/analyst-dashboard.component')
          .then(m => m.AnalystDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST'] }
      },
      
      // 💼 Dashboard Conseiller
      {
        path: 'advisor-dashboard',
        loadComponent: () => import('./features/dashboard/advisor-dashboard/advisor-dashboard.component')
          .then(m => m.AdvisorDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR'] }
      },
      
      // 📈 Dashboard Manager
      {
        path: 'manager-dashboard',
        loadComponent: () => import('./features/dashboard/manager-dashboard/manager-dashboard.component')
          .then(m => m.ManagerDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },

      // ============================================
      // GESTION DES CLIENTS
      // ============================================
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

      // ============================================
      // CRÉDITS - NOUVELLES ROUTES POUR CONSEILLER
      // ============================================
      
      // 📝 Création d'une demande de crédit (pour conseiller)
      {
        path: 'credit-requests/new',
        loadComponent: () => import('./features/credits/advisor/credit-request-create/credit-request-create.component')
          .then(m => m.CreditRequestCreateComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'MANAGER', 'ADMIN'] }
      },
      
      // 📝 Création d'une demande de crédit avec client pré-sélectionné
      {
        path: 'credit-requests/new/:clientId',
        loadComponent: () => import('./features/credits/advisor/credit-request-create/credit-request-create.component')
          .then(m => m.CreditRequestCreateComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'MANAGER', 'ADMIN'] }
      },
      
      // 📋 Liste des demandes de crédit (pour conseiller)
      {
        path: 'credit-requests',
        loadComponent: () => import('./features/credits/advisor/credit-request-list/credit-request-list.component')
          .then(m => m.CreditRequestListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'ANALYST', 'MANAGER', 'ADMIN'] }
      },
      
      // 🔍 Détail d'une demande de crédit
      {
        path: 'credit-requests/:id',
        loadComponent: () => import('./features/credits/advisor/credit-request-detail/credit-request-detail.component')
          .then(m => m.CreditRequestDetailComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'ANALYST', 'MANAGER', 'ADMIN'] }
      },

      // ============================================
      // SIMULATIONS POUR CONSEILLER (AJOUTÉ)
      // ============================================
      
      // 🧮 Simulation de crédit pour conseiller
      {
        path: 'simulation',
        loadComponent: () => import('./features/credits/advisor/credit-simulation/credit-simulation.component')
          .then(m => m.CreditSimulationComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'MANAGER', 'ADMIN'] }
      },
      
      // 📊 Simulation avec client pré-sélectionné
      {
        path: 'simulation/:clientId',
        loadComponent: () => import('./features/credits/advisor/credit-simulation/credit-simulation.component')
          .then(m => m.CreditSimulationComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADVISOR', 'MANAGER', 'ADMIN'] }
      },

      // ============================================
      // CRÉDITS - ROUTES POUR CLIENTS
      // ============================================
      
      // 📋 Mes crédits (client)
      {
        path: 'my-credits',
        loadComponent: () => import('./features/credits/client/credit-client/credit-client.component')
          .then(m => m.CreditClientComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },
      
      // ➕ Nouvelle demande de crédit (client)
      {
        path: 'my-credits/new',
        loadComponent: () => import('./features/credits/client/add-credit/add-credit.component')
          .then(m => m.AddCreditComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },

      // ============================================
      // CRÉDITS - ROUTES POUR ADMIN
      // ============================================

      // 📋 Liste des demandes de crédit (admin)
      {    
        path: 'admin/credit-requests',
        loadComponent: () => import('./features/credits/admin/credit-admin-list/credit-admin-list.component')
          .then(m => m.CreditAdminListComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      // ➕ Nouvelle demande de crédit par admin
      {
        path: 'admin/credit-requests/new',
        loadComponent: () => import('./features/credits/admin/credit-admin/credit-admin.component')
          .then(m => m.CreditAdminComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },

      // ➕ Nouvelle demande de crédit pour un client spécifique
      {
        path: 'admin/credit-requests/new/:clientId',
        loadComponent: () => import('./features/credits/admin/credit-admin/credit-admin.component')
          .then(m => m.CreditAdminComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // ============================================
      // SIMULATIONS - ROUTES POUR CLIENTS
      // ============================================
      
      {
        path: 'simulations',
        loadComponent: () => import('./features/credits/client/simulation-list/simulation-list.component')
          .then(m => m.SimulationListComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },
      {
        path: 'simulation-new',
        loadComponent: () => import('./features/credits/client/simulation-new/simulation-new.component')
          .then(m => m.SimulationNewComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },
      {
        path: 'simulation-result/:id',
        loadComponent: () => import('./features/credits/client/simulation-result/simulation-result.component')
          .then(m => m.SimulationResultComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT', 'ADVISOR', 'ANALYST', 'MANAGER', 'ADMIN'] }
      },
      {
        path: 'simulation-edit/:id',
        loadComponent: () => import('./features/credits/client/simulation-edit/simulation-edit.component')
          .then(m => m.SimulationEditComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      },

      // ============================================
      // ANALYSES FINANCIÈRES - PAGE PRINCIPALE
      // ============================================
      {
        path: 'financial-analysis',
        loadComponent: () => import('./features/financial-analysis/financial-analysis.component')
          .then(m => m.FinancialAnalysisComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'MANAGER', 'ADMIN'] }
      },
      
      // ============================================
      // ANALYSES FINANCIÈRES - CALCUL DES RATIOS
      // ============================================
      {
        path: 'financial-analysis/calculate',
        loadComponent: () => import('./features/financial-analysis/ratio-calculator/ratio-calculator.component')
          .then(m => m.RatioCalculatorComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'MANAGER', 'ADMIN'] }
      },
      
      // ============================================
      // ANALYSES FINANCIÈRES - ANALYSE FINANCIÈRE
      // ============================================
      {
        path: 'financial-analysis/analyze',
        loadComponent: () => import('./features/financial-analysis/financial-analyzer/financial-analyzer.component')
          .then(m => m.FinancialAnalyzerComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'MANAGER', 'ADMIN'] }
      },
      {
        path: 'financial-analysis/analyze/:clientId',
        loadComponent: () => import('./features/financial-analysis/financial-analyzer/financial-analyzer.component')
          .then(m => m.FinancialAnalyzerComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'MANAGER', 'ADMIN'] }
      },

      // ============================================
      // RISK ANALYSIS
      // ============================================
      {
        path: 'risk-analysis',
        loadComponent: () => import('./features/risk-analysis/risk-analysis.component')
          .then(m => m.RiskAnalysisComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'MANAGER', 'ADMIN'] }
      },
      {
        path: 'fraud-alerts',
        loadComponent: () => import('./features/risk-analysis/components/fraud-detection/fraud-detection.component')
          .then(m => m.FraudDetectionComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'MANAGER', 'ADMIN'] }
      },
      {
        path: 'kyc',
        loadComponent: () => import('./features/risk-analysis/components/kyc-aml-config/kyc-aml-config.component')
          .then(m => m.KycAmlConfigComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'MANAGER', 'ADMIN'] }
      },
      // 🤖 CONFIGURATION IA - NOUVELLE ROUTE
      {
        path: 'admin/ai-config',
        loadComponent: () => import('./features/risk-analysis/components/ai-model-config/ai-model-config.component')
          .then(m => m.AiModelConfigComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }  // Seul l'admin peut configurer l'IA
      },
     // 🔔 CONFIGURATION ALERTES - NOUVELLE ROUTE
      {
        path: 'admin/alert-config',
        loadComponent: () => import('./features/risk-analysis/components/alerts-config/alerts-config.component')
          .then(m => m.AlertsConfigComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/financial-ratio',
        loadComponent: () => import('./features/risk-analysis/components/financial-ratios/financial-ratios.component')
          .then(m => m.FinancialRatiosComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/historie',
        loadComponent: () => import('./features/risk-analysis/components/audit-history/audit-history.component')
          .then(m => m.AuditHistoryComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      {
        path: 'admin/décision',
        loadComponent: () => import('./features/risk-analysis/components/decision-rules/decision-rules.component')
          .then(m => m.DecisionRulesComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      // ============================================
      // CRÉDITS - ROUTES POUR ANALYSTE
      // ============================================

      // 📋 Liste des demandes de crédit (analyste)
      {
        path: 'analyst/credit-requests',
        loadComponent: () => import('./features/credits/analyst/analyst-credit-requests/analyst-credit-requests.component')
          .then(m => m.AnalystCreditRequestsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'ADMIN'] }
      },

      // ============================================
      // KYC
      // ============================================
      {
        path: 'kyc',
        loadComponent: () => import('./features/kyc/kyc.component')
          .then(m => m.KycComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ANALYST', 'ADVISOR'] }
      },

      // ============================================
      // COPILOT
      // ============================================
      {
        path: 'copilot',
        loadComponent: () => import('./features/copilot/copilot.component')
          .then(m => m.CopilotComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ANALYST', 'MANAGER'] }
      },

      // ============================================
      // NOTIFICATIONS
      // ============================================
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component')
          .then(m => m.NotificationsComponent)
      },

      // ============================================
      // PROFIL
      // ============================================
      {
        path: 'profile',
        loadComponent: () => import('./features/profile/profile.component')
          .then(m => m.ProfileComponent)
      },

      // ============================================
      // ADMINISTRATION
      // ============================================
      
      // Gestion des utilisateurs
      {
        path: 'admin/users',
        loadComponent: () => import('./features/Admin/user-management/user-management.component')
          .then(m => m.UserManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // Gestion des rôles
      {
        path: 'admin/roles',
        loadComponent: () => import('./features/Admin/role-management/role-management.component')
          .then(m => m.RoleManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // Affectation des clients
      {
        path: 'admin/client-assignment',
        loadComponent: () => import('./features/Admin/client-assignment/client-assignment.component')
          .then(m => m.ClientAssignmentComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // Journal d'audit
      {
        path: 'admin/audit-logs',
        loadComponent: () => import('./features/Admin/audit-logs/audit-logs.component')
          .then(m => m.AuditLogsComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // ⚠️ OCR CONFIGURATION
      {
        path: 'admin/ocr-config',
        loadComponent: () => import('./features/Admin/ocr-config/ocr-config.component')
          .then(m => m.OcrConfigComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      
      // Paramétrage
      {
        path: 'admin/parametrage',
        loadChildren: () => import('./features/Admin/parametrage/parametrage.module')
          .then(m => m.ParametrageModule),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },

      // ============================================
      // GESTION DES EMPLOYÉS
      // ============================================
      {
        path: 'admin/employees',
        loadComponent: () => import('./features/Admin/employee-management/employee-management.component')
          .then(m => m.EmployeeManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/employees/new',
        loadComponent: () => import('./features/Admin/employee-management/employee-form/employee-form.component')
          .then(m => m.EmployeeFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/employees/:id',
        loadComponent: () => import('./features/Admin/employee-management/employee-detail/employee-detail.component')
          .then(m => m.EmployeeDetailComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
      {
        path: 'admin/employees/:id/edit',
        loadComponent: () => import('./features/Admin/employee-management/employee-form/employee-form.component')
          .then(m => m.EmployeeFormComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },

      // ============================================
      // GESTION DES DOCUMENTS
      // ============================================
      // ============================================
      // GESTION DES DOCUMENTS - CLIENT
      // ============================================

      {
        path: 'my-documents',
        loadComponent: () => import('./features/documents/client/client-documents/client-documents.component')
          .then(m => m.ClientDocumentsComponent),
        canActivate: [roleGuard],
        data: { roles: ['CLIENT'] }
      }, 
      {
        path: 'documents',
        loadComponent: () => import('./features/documents/document-management/document-management.component')
          .then(m => m.DocumentManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ANALYST'] }
      },
      {
        path: 'documents/upload',
        loadComponent: () => import('./features/documents/document-upload/document-upload.component')
          .then(m => m.DocumentUploadComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ANALYST', 'ADVISOR'] }
      },
      {
        path: 'documents/verify/:id',
        loadComponent: () => import('./features/documents/document-verification/document-verification.component')
          .then(m => m.DocumentVerificationComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'ANALYST'] }
      },
      {
        path: 'clients/:id/documents',
        loadComponent: () => import('./features/documents/document-list/document-list.component')
          .then(m => m.DocumentListComponent),
        canActivate: [authGuard]
      },
      {
        path: 'admin/documents',
        loadComponent: () => import('./features/documents/document-management/document-management.component')
          .then(m => m.DocumentManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] }
      },
     
      // ============================================
      // DÉCISIONS - ROUTES POUR ANALYSTE
      // ============================================

      {
        path: 'decisions/pending',
        loadComponent: () => import('./features/analyst/decisions/decisions-pending/decisions-pending.component')
          .then(m => m.DecisionsPendingComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'ADMIN'] }
      },
      {
        path: 'decisions/approved',
        loadComponent: () => import('./features/analyst/decisions/decisions-approved/decisions-approved.component')
          .then(m => m.DecisionsApprovedComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'ADMIN'] }
      },
      {
        path: 'decisions/rejected',
        loadComponent: () => import('./features/analyst/decisions/decisions-rejected/decisions-rejected.component')
          .then(m => m.DecisionsRejectedComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'ADMIN'] }
      },
      {
        path: 'decisions/analyze/:id',
        loadComponent: () => import('./features/analyst/decisions/decision-analyze/decision-analyze.component')
          .then(m => m.DecisionAnalyzeComponent),
        canActivate: [roleGuard],
        data: { roles: ['ANALYST', 'ADMIN'] }
      },

      // ============================================
      // RESPONSABLE DES CRÉDITS - ROUTES COMPLÈTES
      // ============================================

      // Dashboard Manager
      {
        path: 'manager-dashboard',
        loadComponent: () => import('./features/dashboard/manager-dashboard/manager-dashboard.component')
          .then(m => m.ManagerDashboardComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },

      // 📊 Portefeuille Global
      {
        path: 'manager/portfolio',
        loadComponent: () => import('./features/manager/portfolio/portfolio.component')
          .then(m => m.PortfolioComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },

      // ============================================
      // GESTION DES ANALYSTES - MANAGER
      // ============================================

      {
        path: 'manager/analysts',
        loadComponent: () => import('./features/manager/analyst-management/analyst-management.component')
          .then(m => m.AnalystManagementComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },



      // ============================================
      // ✅ VALIDATION MANAGER - ROUTES CORRIGÉES
      // ============================================
      
      // Route principale pour la validation manager
      {
        path: 'manager/validation',
        loadComponent: () => import('./features/manager/validation/manager-validation.component')
          .then(m => m.ManagerValidationComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },
      
      // Route pour les validations en attente (alias)
      {
        path: 'manager/validation/pending',
        loadComponent: () => import('./features/manager/validation/manager-validation.component')
          .then(m => m.ManagerValidationComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },
      
      // Route pour les crédits élevés (alias)
      {
        path: 'manager/validation/high-amount',
        loadComponent: () => import('./features/manager/validation/manager-validation.component')
          .then(m => m.ManagerValidationComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },
      
      // Route pour les dossiers retournés (alias)
      {
        path: 'manager/validation/return',
        loadComponent: () => import('./features/manager/validation/manager-validation.component')
          .then(m => m.ManagerValidationComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },
      // ============================================
        // KPIs MANAGER
      // ============================================
      {
        path: 'manager/kpis',
        loadComponent: () => import('./features/manager/kpis/manager-kpis.component')
          .then(m => m.ManagerKPIsComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },

      // ============================================
      // PERFORMANCE DES ANALYSTES - MANAGER
      // ============================================
      {
        path: 'manager/analysts/performance',
        loadComponent: () => import('./features/manager/analyst-performance/analyst-performance.component')
          .then(m => m.AnalystPerformanceComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      },
      {
        path: 'manager/ai/strategy',
        loadComponent: () => import('./features/manager/ai-strategy/ai-strategy.component')
          .then(m => m.AIStrategyComponent),
        canActivate: [roleGuard],
        data: { roles: ['MANAGER'] }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];