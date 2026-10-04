import {Injectable, signal} from '@angular/core';
/** Role of the signed-in user account. */
export type SessionRole = 'HR_STAFF' | 'EMPLOYEE';

/** Data of the signed-in user kept by the application. */
export interface AuthenticatedSession {
  /** Authentication token of the session. */
  token: string;
  /** Id of the user account (IAM). */
  accountId: number;
  /** Id of the employee linked to the account (Workspace). */
  employeeId: number;
  /** Name shown in the toolbar. */
  displayName: string;
  /** Role used to filter the menu and protect routes. */
  role: SessionRole;
  /** Whether the user must change the temporary password. */
  mustChangePassword: boolean;
}

/** Key used to keep the session in localStorage. */
const STORAGE_KEY = 'flowboard.session';

/**
 * Application store with the session of the signed-in user.
 *
 * @remarks Keeps the session in a signal and in localStorage, so it survives a page reload.
 */
@Injectable({providedIn: 'root'})
export class SessionStore {
  /** Current session, restored from localStorage on creation. */
  private readonly sessionSignal = signal<AuthenticatedSession | null>(this.read());
  /** Read-only current session. */
  readonly session = this.sessionSignal.asReadonly();
  /** Whether there is a signed-in user. */
  readonly isAuthenticated = () => this.sessionSignal() !== null;
  /** Role of the signed-in user, or null. */
  readonly role = () => this.sessionSignal()?.role ?? null;
  /** Employee id of the signed-in user, or null. */
  readonly employeeId = () => this.sessionSignal()?.employeeId ?? null;
  /** Display name of the signed-in user, or an empty string. */
  readonly displayName = () => this.sessionSignal()?.displayName ?? '';
  /** Whether the signed-in user must change the password. */
  readonly mustChangePassword = () => this.sessionSignal()?.mustChangePassword ?? false;

  /**
   * Starts or replaces the session and saves it in localStorage.
   *
   * @param session - Data of the signed-in user.
   */
  setSession(session: AuthenticatedSession): void {
    this.sessionSignal.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Updates the must-change-password flag of the current session.
   *
   * @param value - New value of the flag.
   */
  updateMustChangePassword(value: boolean): void {
    const current = this.sessionSignal();
    if (!current) return;
    this.setSession({...current, mustChangePassword: value});
  }

  /** Ends the session and removes it from localStorage. */
  clear(): void {
    this.sessionSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Reads the saved session from localStorage.
   *
   * @returns The saved session, or null when there is none or it cannot be read.
   */
  private read(): AuthenticatedSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as AuthenticatedSession : null;
    } catch {
      return null;
    }
  }
}
