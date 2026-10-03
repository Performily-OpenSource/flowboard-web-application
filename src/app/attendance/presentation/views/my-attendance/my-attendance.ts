import {Component, computed, inject, signal} from '@angular/core';
import {SlicePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';
import {AttendanceStatus} from '../../../domain/model/attendance-record.entity';
import {CurrentEmployeeStore} from '../../../../shared/application/current-employee.store';
import {AttendanceJustificationDialog} from '../../components/attendance-justification-dialog/attendance-justification-dialog';

/**
 * Presents the authenticated employee attendance view.
 *
 * @remarks Provides personal attendance filtering, status display and justification actions for the current user.
 * @author Dario Avila de la cruz
 */
@Component({
  selector:'app-my-attendance', imports:[SlicePipe,MatButton,MatIcon,TranslatePipe], templateUrl:'./my-attendance.html', styleUrl:'./my-attendance.css'
})
export class MyAttendance {
  readonly store=inject(AttendanceStore);
  private readonly currentEmployee=inject(CurrentEmployeeStore);
  private readonly dialog=inject(MatDialog);
  readonly employeeId=this.currentEmployee.employeeId;
  readonly fromDate=signal(MyAttendance.monthStart()); readonly toDate=signal(MyAttendance.today());
  readonly rows=computed(()=>this.store.rows().filter(r=>r.record.employeeId===this.employeeId()&&r.record.workDate>=this.fromDate()&&r.record.workDate<=this.toDate()).sort((a,b)=>b.record.workDate.localeCompare(a.record.workDate)));
  readonly workedDays=computed(()=>this.rows().filter(r=>r.record.effectiveHours!==null).length);
  readonly lateCount=computed(()=>this.rows().filter(r=>r.record.status==='LATE').length);
  readonly absenceCount=computed(()=>this.rows().filter(r=>r.record.status==='ABSENT').length);
  readonly overtime=computed(()=>this.rows().reduce((s,r)=>s+(r.record.overtimeHours??0),0));

  setFrom(v:string){this.fromDate.set(v)} 
   
  setTo(v:string){this.toDate.set(v)}
/**
 * Restores the default personal attendance date range.
 *
 * @author Dario Avila de la cruz
 */
  clear(){this.fromDate.set(MyAttendance.monthStart());this.toDate.set(MyAttendance.today())}
/**
 * Opens the justification dialog for an attendance row.
 *
 * @param row the attendance row to process.
 * @author Dario Avila de la cruz
 */
  openJustification(row:any){ if (!row) return; this.dialog.open(AttendanceJustificationDialog,{data:row,width:'560px',maxWidth:'95vw'}); }
/**
 * Opens a justification dialog for the first relevant attendance row.
 *
 * @author Dario Avila de la cruz
 */
  openFirstJustification(){ this.openJustification(this.rows().find(r=>r.record.status==='ABSENT') || this.rows()[0]); }
/**
 * Returns the CSS class associated with an attendance status.
 *
 * @param s the attendance status to format.
 * @author Dario Avila de la cruz
 */
  statusClass(s:AttendanceStatus){return s.toLowerCase()}
/**
 * Returns the display value associated with an attendance status.
 *
 * @param s the attendance status to format.
 * @author Dario Avila de la cruz
 */
  statusLabel(s:AttendanceStatus){return s}
/**
 * Formats an hour value for display.
 *
 * @param v the hour value to format.
 * @author Dario Avila de la cruz
 */
  hours(v:number|null){return AttendanceStore.hoursToLabel(v)}
  
/**
 * Returns the current date in ISO date format.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static today(): string { return MyAttendance.toIsoDate(new Date()); }
/**
 * Returns the first day of the current month in ISO date format.
 *
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruz
 */
  static monthStart(): string { const now = new Date(); return MyAttendance.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)); }
/**
 * Converts a Date value into an ISO date string.
 *
 * @param date the date to evaluate.
 * @returns The formatted or calculated value.
 * @author Dario Avila de la cruzs
 */
  private static toIsoDate(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
}
