import {Injectable, signal} from '@angular/core';
export type SessionRole = 'HR_STAFF' | 'EMPLOYEE';

export interface AuthenticatedSession {
  token: string;
  accountId: number;
  employeeId: number;
  displayName: string;
  role: SessionRole;
  mustChangePassword: boolean;
}

const STORAGE_KEY = 'flowboard.session';

@Injectable({providedIn: 'root'})
export class SessionStore {
  private readonly sessionSignal = signal<AuthenticatedSession | null>(this.read());
  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = () => this.sessionSignal() !== null;
  readonly role = () => this.sessionSignal()?.role ?? null;
  readonly employeeId = () => this.sessionSignal()?.employeeId ?? null;
  readonly displayName = () => this.sessionSignal()?.displayName ?? '';
  readonly mustChangePassword = () => this.sessionSignal()?.mustChangePassword ?? false;

  setSession(session: AuthenticatedSession): void {
    this.sessionSignal.set(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  updateMustChangePassword(value: boolean): void {
    const current = this.sessionSignal();
    if (!current) return;
    this.setSession({...current, mustChangePassword: value});
  }

  clear(): void {
    this.sessionSignal.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }

  private read(): AuthenticatedSession | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as AuthenticatedSession : null;
    } catch {
      return null;
    }
  }
}
