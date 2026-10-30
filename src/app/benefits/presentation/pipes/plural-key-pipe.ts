import {Pipe, PipeTransform} from '@angular/core';

/**
 * Picks the singular or plural i18n key of a message: 'benefits.reach-count' | pluralKey: 1 returns
 * 'benefits.reach.one', and any other number returns 'benefits.reach.other'.
 *
 * @remarks ngx-translate has no plural rules, so the Benefits texts keep both forms in the JSON files.
 * @author Salym
 */
@Pipe({
  name: 'pluralKey',
})
export class PluralKeyPipe implements PipeTransform {
  /**
   * Builds the key for the given amount.
   * @param key Base i18n key of the message.
   * @param count Amount that decides the singular or plural form.
   * @author Salym
   */
  transform(key: string, count: number | null | undefined): string {
    return `${key}.${count === 1 ? 'one' : 'other'}`;
  }
}
