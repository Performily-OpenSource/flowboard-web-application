/**
 * Employee of Workspace as returned by the Flowboard Web Service (EmployeeResource).
 *
 * @remarks Only the properties the Request bounded context reads are declared; the web service sends more.
 * @author Diego Alonso Diaz Villalba
 */
export interface WorkspaceEmployeeResource {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  status: string;
  areaId: number;
  areaName: string;
  positionId: number;
  positionTitle: string;
  directManagerId: number | null;
}
