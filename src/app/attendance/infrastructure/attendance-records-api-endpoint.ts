export class AttendanceRecordsApiEndpoint {
  private static readonly basePath = '/api/v1/attendance-records';

  static byEmployee(employeeId: string): string {
    return `${this.basePath}?employeeId=${employeeId}`;
  }

  static entry(): string {
    return `${this.basePath}/entry`;
  }

  static exit(id: string): string {
    return `${this.basePath}/${id}/exit`;
  }
}