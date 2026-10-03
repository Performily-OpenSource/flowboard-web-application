/**
 * Represents a password supplied in plain text during credential operations.
 *
 * @remarks Provides validation rules used when creating or changing a password.
 * @author Dario Avila de la cruz
 */
export class PlainPassword {
  readonly value: string;

/**
 * Performs the constructor operation.
 *
 * @param value the value used by the operation.
 * @author Dario Avila de la cruz
 */
  constructor(value: string) {
    const requirements = PlainPassword.validate(value);
    if (requirements.length > 0) {
      throw new Error(requirements[0]);
    }
    this.value = value;
  }

/**
 * Validates a plain-text password against the domain password rules.
 *
 * @param value the value used by the operation.
 * @returns The value produced by the `validate` operation.
 * @author Dario Avila de la cruz
 */
  static validate(value: string): string[] {
    const errors: string[] = [];
    if (value.length < 10) errors.push('iam.password.requirement-length');
    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value)) errors.push('iam.password.requirement-case');
    if (!/\d/.test(value)) errors.push('iam.password.requirement-number');
    if (!/[!@#$%^&*(),.?":{}|<>_\-+[\]\\/]/.test(value)) errors.push('iam.password.requirement-symbol');
    return errors;
  }
}
