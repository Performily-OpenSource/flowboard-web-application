import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';
import {WorkspaceStore} from '../../../../workspace/application/workspace.store';

@Component({selector:'app-attendance-hours',imports:[MatButton,MatIcon,TranslatePipe],templateUrl:'./attendance-hours.html',styleUrl:'./attendance-hours.css'})
export class AttendanceHours {
  readonly store=inject(AttendanceStore); readonly workspace=inject(WorkspaceStore); readonly period=signal('2026-09'); readonly areaFilter=signal<number|null>(null); readonly order=signal('overtime');
  readonly rows=computed(()=>this.workspace.employees().filter(e=>e.status==='ACTIVE').map(e=>{const records=this.store.records().filter(r=>r.employeeId===e.id&&r.workDate.startsWith(this.period()));const effective=records.reduce((s,r)=>s+(r.workedHours??0),0);const overtime=records.reduce((s,r)=>s+(r.overtimeHours??0),0);const expected=this.expectedHours(records,e.id);const variation=expected?overtime/expected*100:0;return {employee:e,effective,overtime,expected,variation};}).filter(r=>this.areaFilter()===null||r.employee.areaId===this.areaFilter()).sort((a,b)=>this.order()==='effective'?b.effective-a.effective:b.overtime-a.overtime));
  expectedHours(_records:any[], employeeId:number){const schedule=this.store.getScheduleForEmployee(employeeId); if(!schedule) return 0; const [year,month]=this.period().split('-').map(Number); const start=new Date(year,month-1,1); const end=new Date(year,month,0); const today=new Date(); const effectiveEnd=new Date(Math.min(end.getTime(),today.getTime())); let days=0; for(let cursor=new Date(start);cursor<=effectiveEnd;cursor.setDate(cursor.getDate()+1)){ const iso=`${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`; if(schedule.isWorkingDay(iso)) days++; } return days*schedule.expectedHours(); }
  level(variation:number){return variation>=8?'high':variation>0?'normal':'low'}
  hours(v:number){return AttendanceStore.hoursToLabel(v)}
}
