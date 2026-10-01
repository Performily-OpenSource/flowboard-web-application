export class Username {
  readonly value: string;

  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized.length < 3 || normalized.length > 120) {
      throw new Error('iam.validation.username');
    }
    this.value = normalized;
  }
}
