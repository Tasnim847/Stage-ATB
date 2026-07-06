// core/models/permissions.model.ts
export const PERMISSIONS = {
  ADMIN: [
    { id: 'ADMIN_ACCESS', name: 'Accès Admin', description: 'Accès complet à l\'administration', category: 'Administration', icon: 'admin_panel_settings' },
    { id: 'USER_MANAGEMENT', name: 'Gestion des utilisateurs', description: 'Créer, modifier, supprimer des utilisateurs', category: 'Administration', icon: 'people' },
    { id: 'ROLE_MANAGEMENT', name: 'Gestion des rôles', description: 'Attribuer et modifier les rôles', category: 'Administration', icon: 'admin_panel_settings' },
    { id: 'SYSTEM_CONFIG', name: 'Configuration système', description: 'Configurer les paramètres du système', category: 'Administration', icon: 'settings' },
  ],
  ANALYST: [
    { id: 'ANALYST_ACCESS', name: 'Accès Analyste', description: 'Accès aux fonctionnalités d\'analyse', category: 'Analyse', icon: 'analytics' },
    { id: 'DOCUMENT_ANALYSIS', name: 'Analyse documentaire', description: 'Analyser et vérifier les documents', category: 'Analyse', icon: 'folder_open' },
    { id: 'FINANCIAL_ANALYSIS', name: 'Analyse financière', description: 'Analyser les données financières', category: 'Analyse', icon: 'attach_money' },
    { id: 'RISK_ANALYSIS', name: 'Analyse des risques', description: 'Évaluer les risques', category: 'Analyse', icon: 'warning' },
    { id: 'DECISION_MAKING', name: 'Prise de décision', description: 'Accepter ou refuser des demandes', category: 'Décision', icon: 'gavel' },
    { id: 'REPORT_GENERATION', name: 'Génération de rapports', description: 'Générer des rapports d\'analyse', category: 'Rapports', icon: 'assessment' },
  ],
  ADVISOR: [
    { id: 'ADVISOR_ACCESS', name: 'Accès Conseiller', description: 'Accès aux fonctionnalités de conseiller', category: 'Conseil', icon: 'person' },
    { id: 'CLIENT_MANAGEMENT', name: 'Gestion des clients', description: 'Gérer les clients', category: 'Clients', icon: 'people' },
    { id: 'CREDIT_REQUEST_MANAGEMENT', name: 'Gestion des demandes', description: 'Gérer les demandes de crédit', category: 'Demandes', icon: 'assignment' },
    { id: 'SIMULATION', name: 'Simulation', description: 'Simuler des crédits', category: 'Simulation', icon: 'calculate' },
    { id: 'COMMUNICATION', name: 'Communication', description: 'Communiquer avec les clients', category: 'Communication', icon: 'message' },
  ],
  MANAGER: [
    { id: 'MANAGER_ACCESS', name: 'Accès Responsable', description: 'Accès aux fonctionnalités de responsable', category: 'Management', icon: 'badge' },
    { id: 'VALIDATION', name: 'Validation', description: 'Valider les décisions importantes', category: 'Management', icon: 'verified' },
    { id: 'TEAM_MANAGEMENT', name: 'Gestion d\'équipe', description: 'Gérer les analystes', category: 'Management', icon: 'groups' },
    { id: 'DASHBOARD_VIEW', name: 'Tableau de bord', description: 'Voir les tableaux de bord', category: 'Management', icon: 'dashboard' },
    { id: 'AI_DECISION_ACCESS', name: 'Centre de Décision IA', description: 'Accès aux outils IA', category: 'IA', icon: 'smart_toy' },
  ],
  CLIENT: [
    { id: 'CLIENT_ACCESS', name: 'Accès Client', description: 'Accès à l\'espace client', category: 'Client', icon: 'person' },
    { id: 'PROFILE_MANAGEMENT', name: 'Gestion du profil', description: 'Gérer son profil', category: 'Client', icon: 'edit' },
    { id: 'CREDIT_APPLICATION', name: 'Demande de crédit', description: 'Faire des demandes de crédit', category: 'Client', icon: 'add' },
    { id: 'DOCUMENT_UPLOAD', name: 'Téléchargement', description: 'Télécharger des documents', category: 'Client', icon: 'upload_file' },
    { id: 'CONTRACT_VIEW', name: 'Voir les contrats', description: 'Consulter les contrats', category: 'Client', icon: 'description' },
    { id: 'SIGNATURE', name: 'Signature électronique', description: 'Signer électroniquement', category: 'Client', icon: 'edit_note' },
  ]
};

export const PERMISSION_CATEGORIES = [
  { id: 'ADMIN', name: 'Administration', icon: 'admin_panel_settings' },
  { id: 'ANALYST', name: 'Analyse', icon: 'analytics' },
  { id: 'ADVISOR', name: 'Conseil', icon: 'person' },
  { id: 'MANAGER', name: 'Management', icon: 'badge' },
  { id: 'CLIENT', name: 'Client', icon: 'person' },
];