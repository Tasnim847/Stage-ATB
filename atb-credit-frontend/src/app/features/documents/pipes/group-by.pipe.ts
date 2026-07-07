// features/documents/pipes/group-by.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'groupBy',
  standalone: true
})
export class GroupByPipe implements PipeTransform {
  transform(array: any[], key: string): any {
    if (!array || !key) return {};
    return array.reduce((result, currentValue) => {
      const groupKey = currentValue[key];
      (result[groupKey] = result[groupKey] || []).push(currentValue);
      return result;
    }, {});
  }
}

@Pipe({
  name: 'objLength',
  standalone: true
})
export class ObjLengthPipe implements PipeTransform {
  transform(obj: any): number {
    return obj ? Object.keys(obj).length : 0;
  }
}