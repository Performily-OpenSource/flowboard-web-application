import {PasswordHash} from './password-hash';
import {Username} from './username';

/**
 * Represents the credentials associated with an IAM account.
 *
 * @remarks Groups a username with its password hash and provides a controlled way to replace the password hash.
 * @author Dario Avila de la cruz
 */
export class Credentials {
  readonly username: Username;
  readonly passwordHash: PasswordHash;

/**
 * Performs the constructor operation.
 *
 * @param username the account username.
 * @param passwordHash the value used by the operation.
 * @author Dario Avila de la cruz
 */
  constructor(username: Username, passwordHash: PasswordHash) {
    this.username = username;
    this.passwordHash = passwordHash;
  }

/**
 * Creates credentials with the supplied password hash while preserving the username.
 *
 * @param newHash the replacement password hash.
 * @returns The value produced by the `withPasswordHash` operation.
 * @author Dario Avila de la cruz
 */
  withPasswordHash(newHash: PasswordHash): Credentials {
    return new Credentials(this.username, newHash);
  }
}
