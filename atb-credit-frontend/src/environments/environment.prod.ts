// environments/environment.prod.ts - PRODUCTION
export const environment = {
  production: true,
  
  // URLs de l'API - ✅ CORRIGÉ
  apiUrl: 'https://api.atb-ci.com/api',
  authUrl: 'https://api.atb-ci.com/api/auth',
  
  // Informations de l'application
  appName: 'ATB Credit Intelligence',
  version: '1.0.0',
  
  // Clés pour le stockage local
  tokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
  userKey: 'user',
  
  // Configuration des timeouts
  apiTimeout: 30000,
  
  // Configuration des uploads
  maxFileSize: 10 * 1024 * 1024, // 10 MB
  
  // Configuration des logs
  enableLogs: false,
  
  // Configuration des features
  features: {
    enableCopilot: true,
    enableKYC: true,
    enableFraudDetection: true,
    enableAI: true
  }
};