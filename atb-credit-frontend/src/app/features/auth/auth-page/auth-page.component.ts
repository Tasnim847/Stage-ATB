// features/auth/auth-page/auth-page.component.ts
import { Component, inject, HostListener } from '@angular/core';
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

  navItems = [
    { label: 'Découvrir l\'ATB', hasDropdown: true },
    { label: 'Communication financière', hasDropdown: true },
    { label: 'Responsabilité sociétale', hasDropdown: true },
    { label: 'Carrière et opportunité', hasDropdown: false },
    { label: 'Actualités', hasDropdown: false },
    { label: 'Nous contacter', hasDropdown: false }
  ];

  rates = [
    { flag: '🇺🇸', code: 'USD', value: 3.003 },
    { flag: '🇬🇧', code: 'GBP', value: 3.997 },
    { flag: '🇦🇪', code: 'AED', value: 8.203 },
    { flag: '🇨🇭', code: 'CHF', value: 36.292 },
    { flag: '🇸🇦', code: 'SAR', value: 8.027 },
    { flag: '🇨🇳', code: 'CNY', value: 0.448 },
    { flag: '🇴🇲', code: 'OMR', value: 7.826 },
    { flag: '🇱🇾', code: 'LYD', value: 0.471 }
  ];

  newsFilters = [
    'Tout',
    '#Actualités',
    '#Actualités agences',
    '#Actualités financières',
    '#ATB Challenges',
    '#Certifications',
    '#Dernières Actualités',
    '#Espace Finance',
    '#Evénements et mécénat'
  ];

  selectedFilter = 'Tout';

  newsCards = [
    {
      image: 'assets/images/news-back-to-school.jpg',
      title: 'Prix arabe Mustapha Azzouz de littérature pour enfants 2025',
      description: 'Cet événement a été organisé en partenariat entre le Forum de la Littérature pour Enfants et l\'Arab Tunisian Bank (ATB).'
    },
    {
      image: 'assets/images/news-sakan.jpg',
      title: 'ATB Challenge : Quand une banque finance des talents en devenir !',
      description: 'Engagée depuis 9 ans dans une initiative unique visant à encourager et à favoriser la créativité et l\'innovation chez les jeunes.'
    }
  ];

  showBackTop = false;

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.showBackTop = window.scrollY > 400;
  }

  openAuthDialog(tab: 'login' | 'register' = 'login'): void {
    const dialogRef = this.dialog.open(AuthDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      disableClose: false,
      panelClass: 'auth-dialog-panel',
      autoFocus: false,
      data: { tab }
    });
    dialogRef.componentInstance.selectedTabIndex = tab === 'login' ? 0 : 1;
  }

  selectFilter(filter: string): void {
    this.selectedFilter = filter;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}