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

/**
 * Provides the infrastructure API used to access attendance resources.
 *
 * @remarks Delegates attendance record, work-schedule and punch operations to the corresponding API endpoints.
 * @author Dario Avila de la cruz
 */
@Injectable({providedIn: 'root'})
export class AttendanceApi extends BaseApi {
  private readonly recordsEndpoint: AttendanceRecordsApiEndpoint;
  private readonly schedulesEndpoint: WorkSchedulesApiEndpoint;
  private readonly punchesEndpoint: PunchesApiEndpoint;

/**
 * Performs the constructor operation.
 *
 * @param http the HTTP client dependency.
 * @author Dario Avila de la cruz
 */
  constructor(http: HttpClient) {
    super();
    this.recordsEndpoint = new AttendanceRecordsApiEndpoint(http);
    this.schedulesEndpoint = new WorkSchedulesApiEndpoint(http);
    this.punchesEndpoint = new PunchesApiEndpoint(http);
  }

/**
 * Retrieves attendance records from the attendance API.
 *
 * @returns An observable that emits attendance records.
 * @author Dario Avila de la cruz
 */
  getAttendanceRecords(): Observable<AttendanceRecord[]> { return this.recordsEndpoint.getAll(); }
/**
 * Creates an attendance record through the attendance API.
 *
 * @param record the attendance record to update or justify.
 * @returns An observable that emits the persisted attendance record.
 * @author Dario Avila de la cruz
 */
  createAttendanceRecord(record: AttendanceRecord): Observable<AttendanceRecord> { return this.recordsEndpoint.create(record); }
/**
 * Updates an attendance record through the attendance API.
 *
 * @param record the attendance record to update or justify.
 * @returns An observable that emits the persisted attendance record.
 * @author Dario Avila de la cruz
 */
  updateAttendanceRecord(record: AttendanceRecord): Observable<AttendanceRecord> { return this.recordsEndpoint.update(record, record.id); }
/**
 * Deletes an attendance record through the attendance API.
 *
 * @param id the identifier to look up or delete.
 * @returns An observable that completes after deletion.
 * @author Dario Avila de la cruz
 */
  deleteAttendanceRecord(id: number): Observable<void> { return this.recordsEndpoint.delete(id); }
/**
 * Retrieves work schedules from the attendance API.
 *
 * @returns An observable that emits work schedules.
 * @author Dario Avila de la cruz
 */
  getWorkSchedules(): Observable<WorkSchedule[]> { return this.schedulesEndpoint.getAll(); }
/**
 * Retrieves attendance punches from the attendance API.
 *
 * @returns An observable that emits attendance punches.
 * @author Dario Avila de la cruz
 */
  getPunches(): Observable<Punch[]> { return this.punchesEndpoint.getAll(); }
}
