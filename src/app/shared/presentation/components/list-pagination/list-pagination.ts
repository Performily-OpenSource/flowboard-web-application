import {Component, computed, effect, input, model} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

/** "Showing 1 to 8 of 10 benefits" + previous / pages / next, as in the mockups. */
@Component({
  selector: 'app-list-pagination',
  imports: [TranslatePipe],
  templateUrl: './list-pagination.html',
  styleUrl: './list-pagination.css',
})
export class ListPagination {
  /** Total number of rows. */
  readonly total = input.required<number>();
  /** Rows per page. */
  readonly pageSize = input(8);
  /** i18n key of the plural noun shown in the summary, e.g. 'employees.pagination-items'. */
  readonly itemsKey = input.required<string>();
  /** Current page (zero-based), two-way bound. */
  readonly page = model(0);

  /** Number of pages, at least one. */
  readonly pageCount = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  /**
   * Compact list of page buttons (zero-based) with at most 7 slots; `null` is a "…" gap.
   * Always keeps the first and last page, e.g. `1 2 3 4 5 … 11`, `1 … 5 6 7 … 11`.
   */
  readonly pages = computed<(number | null)[]>(() => {
    const count = this.pageCount();
    const current = this.page();
    if (count <= 7) return Array.from({ length: count }, (_, index) => index);
    const last = count - 1;
    if (current <= 3) return [0, 1, 2, 3, 4, null, last];
    if (current >= last - 3) return [0, null, last - 4, last - 3, last - 2, last - 1, last];
    return [0, null, current - 1, current, current + 1, null, last];
  });
  /** Number of the first row shown. */
  readonly from = computed(() => this.total() === 0 ? 0 : this.page() * this.pageSize() + 1);
  /** Number of the last row shown. */
  readonly to = computed(() => Math.min((this.page() + 1) * this.pageSize(), this.total()));

  /** Keeps the page inside the range when filters reduce the number of rows. */
  constructor() {
    // Keeps the page inside the range when filters reduce the number of rows.
    effect(() => {
      if (this.page() > this.pageCount() - 1) this.page.set(this.pageCount() - 1);
    });
  }
}
