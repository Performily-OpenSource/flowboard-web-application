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
  /** Indexes of every page. */
  readonly pages = computed(() => Array.from({ length: this.pageCount() }, (_, index) => index));
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
