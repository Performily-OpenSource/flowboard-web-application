export class PlainPassword {
  readonly value: string;

  constructor(value: string) {
    const requirements = PlainPassword.validate(value);
    if (requirements.length > 0) {
      throw new Error(requirements[0]);
    }
    this.value = value;
  }

  static validate(value: string): string[] {
    const errors: string[] = [];
    if (value.length < 10) errors.push('iam.password.requirement-length');
    if (!/[A-Z]/.test(value) || !/[a-z]/.test(value)) errors.push('iam.password.requirement-case');
    if (!/\d/.test(value)) errors.push('iam.password.requirement-number');
    if (!/[!@#$%^&*(),.?":{}|<>_\-+[\]\\/]/.test(value)) errors.push('iam.password.requirement-symbol');
    return errors;
  }
}
