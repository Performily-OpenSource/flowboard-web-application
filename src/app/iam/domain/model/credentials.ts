import {PasswordHash} from './password-hash';
import {Username} from './username';

export class Credentials {
  readonly username: Username;
  readonly passwordHash: PasswordHash;

  constructor(username: Username, passwordHash: PasswordHash) {
    this.username = username;
    this.passwordHash = passwordHash;
  }

  withPasswordHash(newHash: PasswordHash): Credentials {
    return new Credentials(this.username, newHash);
  }
}
