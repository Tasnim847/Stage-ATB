// parametrage-routing.module.ts
import { Routes } from '@angular/router';
import { roleGuard } from '@core/guards/role.guard';
import { ParametrageDashboardComponent } from './components/parametrage-dashboard/parametrage-dashboard.component';
import { CreditTypesComponent } from './components/credit-types/credit-types.component';
import { InterestRatesComponent } from './components/interest-rates/interest-rates.component';
import { DurationsComponent } from './components/durations/durations.component';
import { CeilingsComponent } from './components/ceilings/ceilings.component';

export const PARAMETRAGE_ROUTES: Routes = [
  {
    path: '',
    component: ParametrageDashboardComponent,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'credit-types',
    component: CreditTypesComponent,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'interest-rates',
    component: InterestRatesComponent,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'durations',
    component: DurationsComponent,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'ceilings',
    component: CeilingsComponent,
    canActivate: [roleGuard],
    data: { roles: ['ADMIN'] }
  }
];