import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {Request} from '../../domain/model/request.entity';

/** Format of a request period: 'short' (dd/MM, with days or hours) or 'long' (dd/MM/yyyy). */
export type PeriodFormat = 'short' | 'long';

/**
 * Formats the period of a request in the current language.
 *
 * @remarks Requests without a period show the 'payrollMonth' field, if any.
 * @param request - The request.
 * @param format - The format to use.
 * @param translate - The translation service.
 * @returns The formatted period, e.g. '12/10 al 23/10 · 10 días'
 * @author Diego Alonso Diaz Villalba
 */
export function formatRequestPeriod(request: Request, format: PeriodFormat, translate: TranslateService): string {
  if (!request.startDate) {
    return request.fieldValue('payrollMonth') ?? translate.instant('request-period.none');
  }
  const date = (value: string) => {
    const [year, month, day] = value.split('-');
    return format === 'short' ? `${day}/${month}` : `${day}/${month}/${year}`;
  };
  if (request.hasTimes()) {
    const hours = request.requestedHours();
    return format === 'short'
      ? `${date(request.startDate)} · ${translate.instant(hours === 1 ? 'request-period.hour' : 'request-period.hours', { count: hours })}`
      : `${date(request.startDate)} · ${request.startTime} - ${request.endTime}`;
  }
  const days = request.requestedDays();
  const daysText = translate.instant(days === 1 ? 'request-period.day' : 'request-period.days', { count: days });
  if (request.isSingleDay()) return `${date(request.startDate)} · ${daysText}`;
  const range = translate.instant('request-period.range', { start: date(request.startDate), end: date(request.endDate ?? request.startDate) });
  return format === 'short' ? `${range} · ${daysText}` : range;
}

/**
 * Pipe that shows the period of a request.
 *
 * @remarks It is impure so it updates when the language changes.
 * @author Diego Alonso Diaz Villalba
 */
@Pipe({
  name: 'requestPeriod',
  pure: false
})
export class RequestPeriodPipe implements PipeTransform {
  private translate = inject(TranslateService);

  /**
   * Formats the period of a request.
   *
   * @param request - The request.
   * @param format - The format; 'short' by default.
   * @returns The formatted period, or '-' when there is no request
   * @author Diego Alonso Diaz Villalba
   */
  transform(request: Request | null | undefined, format: PeriodFormat = 'short'): string {
    return request ? formatRequestPeriod(request, format, this.translate) : '-';
  }
}
