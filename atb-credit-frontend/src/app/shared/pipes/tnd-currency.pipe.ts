// shared/pipes/tnd-currency.pipe.ts - VERSION CORRIGÉE
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tndCurrency',
  standalone: true
})
export class TndCurrencyPipe implements PipeTransform {
  transform(value: number | string | null | undefined, digitsInfo: string = '1.2-2'): string {
    // Vérifier si la valeur est valide
    if (value === null || value === undefined || value === '' || isNaN(Number(value))) {
      return '0 DT';
    }

    const numberValue = Number(value);
    
    // Extraire les informations de digitsInfo
    let minFractionDigits = 2;
    let maxFractionDigits = 2;
    
    if (digitsInfo) {
      const parts = digitsInfo.split('-');
      if (parts.length === 2) {
        minFractionDigits = parseInt(parts[0], 10) || 2;
        maxFractionDigits = parseInt(parts[1], 10) || 2;
      } else if (parts.length === 1) {
        minFractionDigits = parseInt(parts[0], 10) || 2;
        maxFractionDigits = minFractionDigits;
      }
    }

    // Formater avec les digits corrects
    const formatted = numberValue.toLocaleString('fr-TN', {
      minimumFractionDigits: minFractionDigits,
      maximumFractionDigits: maxFractionDigits
    });
    
    return `${formatted} DT`;
  }
}