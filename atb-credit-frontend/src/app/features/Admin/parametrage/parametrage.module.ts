// parametrage.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

// Components (tous sont standalone)
import { ParametrageDashboardComponent } from './components/parametrage-dashboard/parametrage-dashboard.component';
import { CreditTypesComponent } from './components/credit-types/credit-types.component';
import { CreditTypesDialogComponent } from './components/credit-types-dialog/credit-types-dialog.component';
import { InterestRatesComponent } from './components/interest-rates/interest-rates.component';
import { InterestRatesDialogComponent } from './components/interest-rates-dialog/interest-rates-dialog.component';
import { DurationsComponent } from './components/durations/durations.component';
import { DurationsDialogComponent } from './components/durations-dialog/durations-dialog.component';
import { CeilingsComponent } from './components/ceilings/ceilings.component';
import { CeilingsDialogComponent } from './components/ceilings-dialog/ceilings-dialog.component';
import { PARAMETRAGE_ROUTES } from './parametrage-routing.module';

// Routes

@NgModule({
  // ❌ PAS DE declarations
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(PARAMETRAGE_ROUTES),
    ReactiveFormsModule,
    FormsModule,
    
    // ✅ IMPORTER les composants standalone
    ParametrageDashboardComponent,
    CreditTypesComponent,
    CreditTypesDialogComponent,
    InterestRatesComponent,
    InterestRatesDialogComponent,
    DurationsComponent,
    DurationsDialogComponent,
    CeilingsComponent,
    CeilingsDialogComponent,
    
    // Material
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatCardModule,
    MatGridListModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatDividerModule
  ]
})
export class ParametrageModule { }