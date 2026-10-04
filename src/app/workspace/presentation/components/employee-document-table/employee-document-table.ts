import {Component, input, output} from '@angular/core';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatTooltip} from '@angular/material/tooltip';
import {TranslatePipe} from '@ngx-translate/core';
import {LocalDatePipe} from '../../../../shared/presentation/pipes/local-date-pipe';
import {EmployeeDocument} from '../../../domain/model/employee-document.entity';

/**
 * Table that lists the documents of an employee (US17).
 * Shows the file name, document type, upload date and size, with actions to view or download the file
 * and, when enabled, to delete it. Receives the documents as input and emits the document to delete.
 *
 * @author Oscar Lizandro Vasquez Llave
 */
@Component({
  selector: 'app-employee-document-table',
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatNoDataRow,
    MatIcon,
    MatTooltip,
    TranslatePipe,
    LocalDatePipe
  ],
  templateUrl: './employee-document-table.html',
  styleUrl: './employee-document-table.css',
})
export class EmployeeDocumentTable {
  /** Documents to display. */
  readonly documents = input.required<EmployeeDocument[]>();
  /** Whether the delete action is shown; true by default. */
  readonly showActions = input(true);
  /** Emits the document the user wants to delete. */
  readonly deleteDocument = output<EmployeeDocument>();

  /** Columns displayed in the table. */
  readonly columns = ['fileName', 'documentType', 'uploadedAt', 'size', 'actions'];

  /**
   * Formats a file size in KB or MB with a minimum of 1 KB.
   *
   * @param sizeInBytes - The size in bytes.
   * @returns The size formatted in KB or MB
   * @author Oscar Lizandro Vasquez Llave
   */
  static formatSize(sizeInBytes: number): string {
    return sizeInBytes >= 1024 * 1024
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  /**
   * Formats a file size for the template.
   *
   * @param sizeInBytes - The size in bytes.
   * @returns The size formatted in KB or MB
   * @author Oscar Lizandro Vasquez Llave
   */
  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }
}
