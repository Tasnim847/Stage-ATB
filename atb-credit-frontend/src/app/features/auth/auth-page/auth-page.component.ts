// features/auth/auth-page/auth-page.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './auth-page.component.html',
  styleUrls: ['./auth-page.component.css']
})
export class AuthPageComponent {
  private dialog = inject(MatDialog);

  openAuthDialog(tab: 'login' | 'register' = 'login'): void {
    const dialogRef = this.dialog.open(AuthDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'auth-dialog-panel',
      autoFocus: false,
      data: { tab }
    });

    // Si tu veux forcer l'onglet au démarrage :
    dialogRef.componentInstance.selectedTabIndex = tab === 'login' ? 0 : 1;
  }
}