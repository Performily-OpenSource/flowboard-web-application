import {Injectable, signal} from '@angular/core';

/**
 * Application store with the shared state of the application shell.
 *
 * @remarks Views use it to add a dynamic segment to the toolbar breadcrumb, such as the employee name in "Employees / Ana Quispe Torres".
 * @author Oscar Lizandro Vasquez Llave
 */
@Injectable({providedIn: 'root'})
export class LayoutStore {
  /** Dynamic segment shown after the route breadcrumb, or null when there is none. */
  private readonly breadcrumbDetailSignal = signal<string | null>(null);
  /** Read-only breadcrumb detail. */
  readonly breadcrumbDetail = this.breadcrumbDetailSignal.asReadonly();

  /**
   * Sets the dynamic segment of the breadcrumb.
   *
   * @param detail - Text to show, or null to remove it.
   * @author Oscar Lizandro Vasquez Llave
   */
  setBreadcrumbDetail(detail: string | null): void {
    this.breadcrumbDetailSignal.set(detail);
  }
}