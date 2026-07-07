// features/documents/documents.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GroupByPipe, ObjLengthPipe } from './pipes/group-by.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    GroupByPipe,
    ObjLengthPipe
  ],
  exports: [
    GroupByPipe,
    ObjLengthPipe
  ]
})
export class DocumentsModule { }