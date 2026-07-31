// shared/pipes/tnd-currency.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'tndCurrency',
  standalone: true
})
export class TndCurrencyPipe implements PipeTransform {
  constructor(private currencyPipe: CurrencyPipe) {}

  transform(value: number | string | null | undefined, digitsInfo: string = '1.2-2'): string {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0 DT';
    }

    const numberValue = Number(value);
    
    // Formater avec le CurrencyPipe
    const formatted = this.currencyPipe.transform(
      numberValue,
      'TND',
      'symbol',
      digitsInfo,
      'fr-TN'
    );

    // Remplacer TND par DT
    return formatted ? formatted.replace(/TND/g, 'DT') : `${numberValue.toFixed(2)} DT`;
  }
}