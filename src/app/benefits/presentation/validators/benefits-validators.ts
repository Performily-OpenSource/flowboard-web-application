import {AbstractControl, ValidationErrors, ValidatorFn} from '@angular/forms';

/**
 * Rejects a text that only has spaces. Validators.required accepts "   ", so it is used together
 * with it in the benefit name and in the adjustment reason.
 *
 * @remarks Returns the 'required' error so the forms keep showing their usual message.
 * @param control Control that holds the text.
 * @author Salym
 */
export function notBlank(control: AbstractControl<string | null>): ValidationErrors | null {
  const value = control.value ?? '';
  return value.length > 0 && value.trim().length === 0 ? { required: true } : null;
}

/**
 * Rejects a date ('yyyy-MM-dd') later than the limit returned by the function.
 *
 * @remarks The limit is read on every validation, so it can depend on other data of the dialog.
 * @param limit Function that returns the latest valid date.
 * @author Salym
 */
export function notAfter(limit: () => string): ValidatorFn {
  return (control: AbstractControl<string | null>): ValidationErrors | null =>
    control.value && control.value > limit() ? { afterLimit: true } : null;
}
