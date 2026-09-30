import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {BaseApi} from '../../shared/infrastructure/base-api';
import {AttendanceRecord} from '../domain/model/attendance-record.entity';
import {WorkSchedule} from '../domain/model/work-schedule.entity';
import {AttendanceRecordsApiEndpoint} from './attendance-records-api-endpoint';
import {WorkSchedulesApiEndpoint} from './work-schedules-api-endpoint';
import {Punch} from '../domain/model/punch.entity';
import {PunchesApiEndpoint} from './punches-api-endpoint';

@Injectable({providedIn: 'root'})
export class AttendanceApi extends BaseApi {
  private readonly recordsEndpoint: AttendanceRecordsApiEndpoint;
  private readonly schedulesEndpoint: WorkSchedulesApiEndpoint;
  private readonly punchesEndpoint: PunchesApiEndpoint;

  constructor(http: HttpClient) {
    super();
    this.recordsEndpoint = new AttendanceRecordsApiEndpoint(http);
    this.schedulesEndpoint = new WorkSchedulesApiEndpoint(http);
    this.punchesEndpoint = new PunchesApiEndpoint(http);
  }

  getAttendanceRecords(): Observable<AttendanceRecord[]> { return this.recordsEndpoint.getAll(); }
  createAttendanceRecord(record: AttendanceRecord): Observable<AttendanceRecord> { return this.recordsEndpoint.create(record); }
  updateAttendanceRecord(record: AttendanceRecord): Observable<AttendanceRecord> { return this.recordsEndpoint.update(record, record.id); }
  deleteAttendanceRecord(id: number): Observable<void> { return this.recordsEndpoint.delete(id); }
  getWorkSchedules(): Observable<WorkSchedule[]> { return this.schedulesEndpoint.getAll(); }
  getPunches(): Observable<Punch[]> { return this.punchesEndpoint.getAll(); }
}
