import {AbstractControl} from '@angular/forms';
import {MatDialog, MatDialogRef} from '@angular/material/dialog';
import {filter} from 'rxjs/operators';
import {confirmAction} from './confirm';

/**
 * Stops Esc and the click outside the dialog from closing a form that has unsaved changes; in that
 * case it asks first "Discard changes?". The close (X) and Cancel buttons still close at once
 * because the user chose them on purpose.
 *
 * @remarks Call it from the constructor of a form dialog.
 * @param dialogRef Reference of the form dialog.
 * @param form Form whose changes are protected.
 * @param dialog MatDialog service, used to open the confirmation.
 * @author Salym
 */
export function guardUnsavedChanges(dialogRef: MatDialogRef<unknown>, form: AbstractControl, dialog: MatDialog): void {
  dialogRef.disableClose = true;
  let asking = false;
  const tryClose = () => {
    if (!form.dirty) {
      dialogRef.close();
      return;
    }
    if (asking) return;
    asking = true;
    confirmAction(dialog, {
      titleKey: 'benefits.confirm.discard.title',
      messageKey: 'benefits.confirm.discard.message',
      confirmKey: 'benefits.confirm.discard.confirm',
      cancelKey: 'benefits.confirm.discard.keep',
      danger: true
    }).subscribe(discard => {
      asking = false;
      if (discard) dialogRef.close();
    });
  };
  dialogRef.backdropClick().subscribe(tryClose);
  dialogRef.keydownEvents().pipe(filter(event => event.key === 'Escape')).subscribe(event => {
    event.preventDefault();
    tryClose();
  });
}
