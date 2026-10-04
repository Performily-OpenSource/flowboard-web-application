import {Pipe, PipeTransform} from '@angular/core';

/**
 * Formats a 'yyyy-MM-dd' date as 'dd/MM/yyyy' without time zone shifts.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Pipe({
  name: 'localDate',
})
export class LocalDatePipe implements PipeTransform {
  /**
   * Formats the date.
   *
   * @param value - Date as 'yyyy-MM-dd' or ISO date-time.
   * @returns The date as 'dd/MM/yyyy', or '-' when there is no value.
   * @author Oscar Lizandro Vasquez Llave
   */
  transform(value: string | null | undefined): string {
    if (!value) return '-';
    const [year, month, day] = value.substring(0, 10).split('-');
    return day && month && year ? `${day}/${month}/${year}` : value;
  }
}