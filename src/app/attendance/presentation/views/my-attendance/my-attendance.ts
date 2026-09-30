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

  setFrom(v:string){this.fromDate.set(v)} setTo(v:string){this.toDate.set(v)}
  clear(){this.fromDate.set(MyAttendance.monthStart());this.toDate.set(MyAttendance.today())}
  openJustification(row:any){ if (!row) return; this.dialog.open(AttendanceJustificationDialog,{data:row,width:'560px',maxWidth:'95vw'}); }
  openFirstJustification(){ this.openJustification(this.rows().find(r=>r.record.status==='ABSENT') || this.rows()[0]); }
  statusClass(s:AttendanceStatus){return s.toLowerCase()}
  statusLabel(s:AttendanceStatus){return s}
  hours(v:number|null){return AttendanceStore.hoursToLabel(v)}
  
  static today(): string { return MyAttendance.toIsoDate(new Date()); }
  static monthStart(): string { const now = new Date(); return MyAttendance.toIsoDate(new Date(now.getFullYear(), now.getMonth(), 1)); }
  private static toIsoDate(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
}
