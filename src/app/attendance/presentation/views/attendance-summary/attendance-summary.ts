import {Component, computed, inject, signal} from '@angular/core';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {AttendanceStore} from '../../../application/attendance.store';
import {WorkspaceStore} from '../../../../workspace/application/workspace.store';

@Component({selector:'app-attendance-summary',imports:[MatButton,MatIcon,TranslatePipe],templateUrl:'./attendance-summary.html',styleUrl:'./attendance-summary.css'})
export class AttendanceSummary {
  readonly store=inject(AttendanceStore); readonly workspace=inject(WorkspaceStore); readonly period=signal('2026-09'); readonly compare=signal('2026-08');
  readonly areas=computed(()=>this.workspace.areas().map(area=>{const rows=this.store.rows().filter(r=>r.areaName===area.name&&r.record.workDate.startsWith(this.period()));const onTime=rows.filter(r=>r.record.status==='ON_TIME').length;const late=rows.filter(r=>r.record.status==='LATE').length;const absent=rows.filter(r=>r.record.status==='ABSENT').length;const denominator=onTime+late+absent;return {area,onTime,late,absent,total:rows.length,punctuality:denominator?Math.round(onTime/denominator*100):100};}));
}
