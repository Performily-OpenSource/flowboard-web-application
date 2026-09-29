import {Injectable, signal} from '@angular/core';

@Injectable({providedIn: 'root'})
export class LayoutStore {
  private readonly breadcrumbDetailSignal = signal<string | null>(null);
  readonly breadcrumbDetail = this.breadcrumbDetailSignal.asReadonly();

  setBreadcrumbDetail(detail: string | null): void {
    this.breadcrumbDetailSignal.set(detail);
  }
}