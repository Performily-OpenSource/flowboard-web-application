import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {BenefitsConfirmData, BenefitsConfirmDialog} from './benefits-confirm-dialog';

/**
 * Opens the confirmation dialog and emits true only when the user confirms.
 *
 * @remarks Defines the responsibility and main contract of this element within the bounded context.
 * @param dialog MatDialog service of the caller.
 * @param data Texts and style of the dialog.
 * @author Salym
 */
export function confirmAction(dialog: MatDialog, data: BenefitsConfirmData): Observable<boolean> {
  return dialog.open(BenefitsConfirmDialog, { data, width: '440px', maxWidth: '95vw' })
    .afterClosed().pipe(map(result => result === true));
}
