import {inject, Pipe, PipeTransform} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Pipe({
  name: 'relativeTime',
  pure: false
})
export class RelativeTimePipe implements PipeTransform {
  private translate = inject(TranslateService);

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
