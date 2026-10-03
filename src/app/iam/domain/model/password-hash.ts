/**
 * Represents a password value stored as a hash.
 *
 * @remarks Encapsulates the password-hash value used by the IAM domain model.
 * @author Dario Avila de la cruz
 */
export class PasswordHash {
  readonly value: string;

/**
 * Performs the constructor operation.
 *
 * @param value the value used by the operation.
 * @author Dario Avila de la cruz
 */
  constructor(value: string) {
    if (!/^sha256\$[a-f0-9]{64}$/.test(value) && !/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value)) {
      throw new Error('iam.validation.password-hash');
    }
    this.value = value;
  }
}
