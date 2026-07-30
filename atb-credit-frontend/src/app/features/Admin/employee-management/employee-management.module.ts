// features/Admin/employee-management/employee-management.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';  // ✅ AJOUTER
import { EmployeeManagementComponent } from './employee-management.component';
import { EmployeeFormComponent } from './employee-form/employee-form.component';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,  // ✅ AJOUTER
    EmployeeManagementComponent,
    EmployeeFormComponent,
    EmployeeDetailComponent
  ],
  exports: [
    EmployeeManagementComponent,
    EmployeeFormComponent,
    EmployeeDetailComponent
  ]
})
export class EmployeeManagementModule { }