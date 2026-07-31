// main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeFrTN from '@angular/common/locales/fr-TN';
import { LOCALE_ID } from '@angular/core';

// Enregistrer les locales françaises
registerLocaleData(localeFr, 'fr');
registerLocaleData(localeFrTN, 'fr-TN');

// Ajouter la locale dans la configuration
const configWithLocale = {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    { provide: LOCALE_ID, useValue: 'fr-TN' } // Utiliser la locale Tunisie
  ]
};

bootstrapApplication(AppComponent, configWithLocale)
  .catch((err) => console.error(err));