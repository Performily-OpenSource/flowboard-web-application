import {Component, computed, inject, signal} from '@angular/core';
import {SlicePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';
import {AttendanceStatus} from '../../../domain/model/attendance-record.entity';
import {AttendanceJustificationDialog} from '../../components/attendance-justification-dialog/attendance-justification-dialog';
import {WorkspaceStore} from '../../../../workspace/application/workspace.store';

@Component({
  selector:'app-my-attendance', imports:[SlicePipe,MatButton,MatIcon,TranslatePipe], templateUrl:'./my-attendance.html', styleUrl:'./my-attendance.css'
})
export class MyAttendance {
  readonly store=inject(AttendanceStore); readonly workspace=inject(WorkspaceStore); private dialog=inject(MatDialog);
  readonly employeeId=7;
  readonly fromDate=signal('2026-09-01'); readonly toDate=signal('2026-09-09');
  readonly rows=computed(()=>this.store.rows().filter(r=>r.record.employeeId===this.employeeId&&r.record.workDate>=this.fromDate()&&r.record.workDate<=this.toDate()).sort((a,b)=>b.record.workDate.localeCompare(a.record.workDate)));
  readonly workedDays=computed(()=>this.rows().filter(r=>r.record.workedHours!==null).length);
  readonly lateCount=computed(()=>this.rows().filter(r=>r.record.status==='LATE').length);
  readonly absenceCount=computed(()=>this.rows().filter(r=>r.record.status==='ABSENT').length);
  readonly overtime=computed(()=>this.rows().reduce((s,r)=>s+(r.record.overtimeHours??0),0));
  setFrom(v:string){this.fromDate.set(v)} setTo(v:string){this.toDate.set(v)}
  clear(){this.fromDate.set('2026-09-01');this.toDate.set('2026-09-09')}
  openJustification(row:any){ if (!row) return; this.dialog.open(AttendanceJustificationDialog,{data:row,width:'560px',maxWidth:'95vw'}); }
  openFirstJustification(){ this.openJustification(this.rows().find(r=>r.record.status==='ABSENT') || this.rows()[0]); }
  statusClass(s:AttendanceStatus){return s.toLowerCase()}
  statusLabel(s:AttendanceStatus){return AttendanceStore.statusLabel(s)}
  hours(v:number|null){return AttendanceStore.hoursToLabel(v)}
}
