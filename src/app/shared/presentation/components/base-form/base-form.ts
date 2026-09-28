import {FormGroup} from '@angular/forms';

export class BaseForm {
  /**
   * Checks if a form control is invalid and has been touched.
   * @param form        - The form group containing the control.
   * @param controlName - The name of the control to check.
   * @returns True if the control is invalid and touched, false otherwise.
   * @protected
   */
  protected isInvalidControl(form: FormGroup, controlName: string): boolean {
    return form.controls[controlName].invalid && form.controls[controlName].touched;
  }

  /**
   * Generates an error message for a specific error key on a control.
   * @param controlName - The name of the control.
   * @param errorKey    - The error key.
   * @returns The error message string.
   * @private
   */
  private errorMessageForControl(controlName: string, errorKey: string): string {
    switch (errorKey) {
      case 'required': return `The field ${controlName} is required.`;
      case 'maxlength': return `The field ${controlName} is too long.`;
      case 'pattern': return `The field ${controlName} has an invalid format.`;
      case 'email': return `The field ${controlName} must be a valid email.`;
      default: return `The field ${controlName} is invalid.`;
    }
  }

  /**
   * Retrieves all error messages for a form control.
   * @param form        - The form group containing the control.
   * @param controlName - The name of the control to check.
   * @returns A concatenated string of error messages.
   * @protected
   */
  protected errorMessagesForControl(form: FormGroup, controlName: string): string {
    const control = form.controls[controlName];
    let errorMessages = '';
    const errors = control.errors;
    if (!errors) return errorMessages;
    Object.keys(errors).forEach((errorKey) =>
      errorMessages += this.errorMessageForControl(controlName, errorKey));
    return errorMessages;
  }
}