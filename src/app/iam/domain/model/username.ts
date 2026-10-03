/**
 * Represents the username used to identify an IAM account.
 *
 * @remarks Encapsulates the username value used by the credentials model.
 *
 * @author Dario Avila de la cruz
 */
export class Username {
  readonly value: string;

/**
 * Performs the constructor operation.
 *
 * @param value the value used by the operation.
 * @author Dario Avila de la cruzs
 */
  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized.length < 3 || normalized.length > 120) {
      throw new Error('iam.validation.username');
    }
    this.value = normalized;
  }
}
