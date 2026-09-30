export const AttendanceRecordsApiEndpoint = {
  base: '/attendance-records',
  byEmployee: (employeeId: string) => `/attendance-records?employeeId=${employeeId}`,
  entry: () => `/attendance-records/entry`,
  exit: (id: string) => `/attendance-records/${id}/exit`
};