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

/** Table of the employee file (WA-53): document, type, upload date, size and actions. */
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
  readonly documents = input.required<EmployeeDocument[]>();
  readonly showActions = input(true);
  readonly deleteDocument = output<EmployeeDocument>();

  readonly columns = ['fileName', 'documentType', 'uploadedAt', 'size', 'actions'];

  static formatSize(sizeInBytes: number): string {
    return sizeInBytes >= 1024 * 1024
      ? `${(sizeInBytes / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.max(1, Math.round(sizeInBytes / 1024))} KB`;
  }

  formatSize(sizeInBytes: number): string {
    return EmployeeDocumentTable.formatSize(sizeInBytes);
  }
}
