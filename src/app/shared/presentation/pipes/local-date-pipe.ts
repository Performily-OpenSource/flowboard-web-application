import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'localDate',
})
export class LocalDatePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '-';
    const [year, month, day] = value.substring(0, 10).split('-');
    return day && month && year ? `${day}/${month}/${year}` : value;
  }
}