import { AttendanceRecordResponse } from './attendance-records-response';
import { AttendanceRecordsApiEndpoint } from './attendance-records-api-endpoint';

export class AttendanceApi {
  // Ajusta el cliente HTTP (fetch, axios, HttpClient) según lo que uses en workspace-api.ts
  static async getRecordsByEmployee(employeeId: string): Promise<AttendanceRecordResponse[]> {
    const response = await fetch(AttendanceRecordsApiEndpoint.byEmployee(employeeId));
    if (!response.ok) throw new Error('Error fetching attendance records');
    return response.json();
  }

  static async markEntry(data: { employeeId: string; time: string }): Promise<AttendanceRecordResponse> {
    const response = await fetch(AttendanceRecordsApiEndpoint.entry(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Error marking entry');
    return response.json();
  }
}