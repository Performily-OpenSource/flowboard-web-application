import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

/**
 * Pipe that shows how long ago something happened, e.g. "2 days ago", in the current language.
 *
 * @remarks It is impure so it updates when the language changes.
 * @author Diego Alonso Diaz Villalba
 */
@Pipe({
  name: 'relativeTime',
  pure: false
})
export class RelativeTimePipe implements PipeTransform {
  private translate = inject(TranslateService);

  /**
   * Formats a date as the time elapsed until now.
   *
   * @param value - The date in ISO format.
   * @returns The elapsed time in minutes, hours or days, or '-' when there is no date
   * @author Diego Alonso Diaz Villalba
   */
  transform(value: string | null | undefined): string {
    if (!value) return '-';
    const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
    if (minutes < 1) return this.translate.instant('request-time.now');
    if (minutes < 60) return this.translate.instant('request-time.minutes', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return this.translate.instant('request-time.hours', { count: hours });
    const days = Math.floor(hours / 24);
    return this.translate.instant(days === 1 ? 'request-time.day' : 'request-time.days', { count: days });
  }
}
