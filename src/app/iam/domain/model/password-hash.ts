export class PasswordHash {
  readonly value: string;

  constructor(value: string) {
    if (!/^sha256\$[a-f0-9]{64}$/.test(value) && !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value)) {
      throw new Error('iam.validation.password-hash');
    }
    this.value = value;
  }
}
