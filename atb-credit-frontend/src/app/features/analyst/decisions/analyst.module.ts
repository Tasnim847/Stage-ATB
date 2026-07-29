// src/app/features/analyst/analyst.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DecisionsPendingComponent } from './decisions-pending/decisions-pending.component';
import { DecisionsApprovedComponent } from './decisions-approved/decisions-approved.component';
import { DecisionsRejectedComponent } from './decisions-rejected/decisions-rejected.component';
import { DecisionAnalyzeComponent } from './decision-analyze/decision-analyze.component';

@NgModule({
  declarations: [
    // Déclarer les composants si vous utilisez des modules
  ],
  imports: [
    CommonModule,
    RouterModule,
    DecisionsPendingComponent,
    DecisionsApprovedComponent,
    DecisionsRejectedComponent,
    DecisionAnalyzeComponent
  ],
  exports: [
    DecisionsPendingComponent,
    DecisionsApprovedComponent,
    DecisionsRejectedComponent,
    DecisionAnalyzeComponent
  ]
})
export class AnalystModule { }