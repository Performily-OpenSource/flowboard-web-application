# User Stories

## Overview
This document contains the user stories for the Flowboard web application, the human resources management platform developed by the Performily team. The user stories are structured to capture the needs and goals of the users, as well as the acceptance criteria for each story. Only the user stories implemented in the frontend project are included.

## Requirement Traceability Matrix

| User Story                                              | Bounded Context   | Implementation Elements                                                                                  |
|:--------------------------------------------------------|:------------------|:---------------------------------------------------------------------------------------------------------|
| US01: Automatic Credential Generation                   | IAM               | `AccountList`, `UserAccount`, `UserAccountAssembler`, `UserAccountsApiEndpoint`                          |
| US02: Log In                                            | IAM               | `Login`, `IamStore`, `IamApi`, `Credentials`, `AccountDisabled`, `authGuard`                             |
| US03: Mandatory Temporary Password Change               | IAM               | `ChangePassword`, `passwordChangeGuard`, `IamStore`                                                      |
| US04: Log Out                                           | IAM, Shared       | `IamStore`, `SessionStore`, `AuthenticatedSession`, `Toolbar`                                            |
| US05: Role Assignment and Change                        | IAM               | `RoleDialog`, `Role`, `RoleAssembler`, `RolesApiEndpoint`                                                |
| US06: Password Reset                                    | IAM               | `ResetPasswordDialog`, `AccountList`, `IamStore`                                                         |
| US07: Role-Based Access Restriction                     | IAM               | `roleGuard`, `authGuard`, `RoleType`, `SessionRole`                                                      |
| US08: New Employee Registration                         | Workspace         | `EmployeeForm`, `Employee`, `EmployeeAssembler`, `EmployeesApiEndpoint`                                  |
| US09: Area Catalog Management                           | Workspace         | `OrganizationStructure`, `AreaFormDialog`, `Area`, `AreaAssembler`                                       |
| US10: Area and Position Assignment                      | Workspace         | `PositionFormDialog`, `JobAssignment`, `JobAssignmentAssembler`, `JobAssignmentHistory`                  |
| US11: Direct Manager Assignment                         | Workspace         | `DirectManagerDialog`, `DirectManagerData`, `EmployeeDetail`                                             |
| US12: General Organization Chart                        | Workspace         | `OrganizationChart`, `OrganizationChartNode`                                                             |
| US13: Organization Chart by Area                        | Workspace         | `OrganizationChart`, `OrganizationChartNode`, `Area`                                                     |
| US14: Employee Data Update                              | Workspace         | `EmployeeForm`, `Employee`, `EmployeeAssembler`                                                          |
| US15: Employee Termination                              | Workspace         | `EmployeeTerminationDialog`, `EmployeeTerminationData`, `EmploymentStatus`                               |
| US16: Employee Reinstatement                            | Workspace         | `EmployeeReinstatementDialog`, `EmployeeReinstatementData`, `EmployeeStatusDialog`                       |
| US17: Employee File Document Upload                     | Workspace         | `DocumentUploadDialog`, `EmployeeDocument`, `EmployeeDocumentsApiEndpoint`, `MAX_DOCUMENT_SIZE_IN_BYTES` |
| US18: Employee File Consultation                        | Workspace         | `EmployeeDocuments`, `EmployeeDocumentTable`, `EmployeeDocumentAssembler`                                |
| US19: Own Job Profile Consultation                      | Workspace         | `MyProfile`, `EmployeeSummaryCard`, `Employee`, `JobAssignment`                                          |
| US20: Employee Search and Filtering                     | Workspace, Shared | `EmployeeList`, `EmployeeAssembler`, `ListPagination`                                                    |
| US21: Punch Processing                                  | Attendance        | `AttendanceStore`, `AttendanceRecord`, `AttendanceRecordAssembler`, `Punch`, `WorkSchedule`              |
| US22: Own Attendance History Consultation               | Attendance        | `MyAttendance`, `AttendanceRecord`, `AttendanceStatus`                                                   |
| US23: Attendance Consultation by Employee               | Attendance        | `AttendanceRecords`, `AttendanceRecordRow`, `EmployeeAttendanceTab`                                      |
| US24: Attendance Report by Area                         | Attendance        | `AttendanceSummary`, `AttendanceArea`                                                                    |
| US25: Worked Hours and Overtime Report                  | Attendance        | `AttendanceHours`, `AttendanceRecord`                                                                    |
| US26: Request Type Catalog                              | Request           | `RequestTypeList`, `RequestTypeForm`, `RequestType`, `RequestField`, `RequestTypeAssembler`              |
| US27: Request Creation                                  | Request           | `RequestForm`, `DynamicField`, `Request`, `RequestAssembler`, `RequestStore`                             |
| US28: Balance Validation When Requesting Vacation       | Request           | `RequestForm`, `VacationBalanceCard`, `BenefitsAcl`, `BalanceDeduction`                                  |
| US29: Request Routing to the Approver                   | Request           | `ApproverCard`, `WorkspaceAcl`, `RequestStore`                                                           |
| US30: Own Request Tracking                              | Request           | `MyRequests`, `RequestStatusBadge`, `LatestRequestsCard`, `RequestStatus`                                |
| US31: Own Request Cancellation                          | Request           | `CancelRequestDialog`, `RequestHistory`, `RequestStore`                                                  |
| US32: Inbox of Requests to Handle                       | Request           | `RequestInbox`, `RequesterSummaryCard`, `RequestStore`                                                   |
| US33: Request Approval                                  | Request           | `ApproveRequestDialog`, `RequestTimeline`, `RequestStore`                                                |
| US34: Rejection with Mandatory Reason                   | Request           | `RejectRequestDialog`, `RequestTimeline`, `RequestStore`                                                 |
| US35: Return for Review                                 | Request           | `ReturnRequestDialog`, `RequestTimeline`, `RequestStore`                                                 |
| US36: Status Change Notification                        | Request, Shared   | `Toolbar`, `RequestStore`                                                                                |
| US37: Benefit Catalog                                   | Benefits          | `BenefitCatalog`, `BenefitTypeFormDialog`, `BenefitType`, `BenefitTypeAssembler`                         |
| US38: Benefit Assignment                                | Benefits          | `BenefitAssignments`, `AssignBenefitDialog`, `AssignBenefitCommand`, `BenefitAssignment`                 |
| US39: Benefit Delivery Registration                     | Benefits          | `BenefitDeliveries`, `RegisterDeliveryDialog`, `BenefitDelivery`                                         |
| US40: Own Benefits Consultation                         | Benefits          | `EmployeeBenefitsTab`, `BenefitsTabs`, `BenefitAssignment`                                               |
| US41: Vacation Balance Calculation                      | Benefits          | `VacationBalances`, `VacationBalanceCard`, `VacationBalance`, `VacationBalanceAssembler`                 |
| US42: Manual Vacation Balance Adjustment                | Benefits          | `VacationAdjustmentDialog`, `VacationMovementsDialog`, `VacationMovement`                                |
| US43: Payslip Upload                                    | Payroll           | `PayslipUpload`, `PayslipUploadDialog`, `Payslip`, `PayslipAssembler`, `PublicationStatus`               |
| US44: Own Payslip Consultation                          | Payroll           | `MyPayslips`, `PayslipViewDialog`, `Payslip`                                                             |
| US45: Payment Status Control                            | Payroll           | `PaymentDialog`, `ObservationDialog`, `PaymentStatus`, `PaymentDetails`                                  |
| US46: Payment Report by Area and Period                 | Payroll           | `PayrollList`, `PayrollPeriod`, `PayrollArea`, `PaymentStatus`                                           |
| US47: Workspace Registration                            | Wellbeing         | `OfficeFormDialog`, `Office`, `OfficeLocation`, `OfficeAssembler`                                        |
| US48: Environmental Device Registration and Association | Wellbeing         | `DeviceDialog`, `Device`, `DeviceCode`, `DeviceStatus`, `DeviceAssembler`                                |
| US49: Threshold Definition by Metric                    | Wellbeing         | `ThresholdDialog`, `MetricThreshold`, `ThresholdRange`, `MetricThresholdAssembler`                       |
| US50: Environmental Indicator Consultation              | Wellbeing         | `WellbeingDashboard`, `HealthIndicator`, `DashboardOffice`, `DashboardMetric`                            |
| US51: Metric History and Trend                          | Wellbeing         | `HistoryDialog`, `EnvironmentalReading`, `EnvironmentalReadingAssembler`                                 |

## User Stories for Flowboard

### US01: Automatic Credential Generation
**As an** HR staff member, **I want** the system to generate access credentials when an employee is registered, **so that** the employee can log in without any additional procedure.
- **Given** an employee is successfully registered with a valid email and no associated account, **when** the system processes the account creation, **then** a unique username and a temporary password stored as a hash are generated, and the account is flagged for a mandatory password change.
- **Given** an account with the same username already exists, **when** the system tries to create the account, **then** the operation is rejected and it is indicated that the username is already in use.
- **Given** the employee already has an active account, **when** the system processes the creation again, **then** no new credentials are generated and the existing credentials are kept.

### US02: Log In
**As a** system user, **I want to** authenticate with my credentials, **so that** I can access the modules that correspond to my role.
- **Given** a user with valid credentials and an active account exists, **when** the user submits their credentials, **then** the system authenticates the user and returns an access token with their role.
- **Given** a user submits an incorrect password, **when** the system verifies the credentials, **then** access is denied and the error message does not reveal whether the mistake is in the username or the password.
- **Given** a user whose associated employee has the terminated status, **when** the user submits correct credentials, **then** access is denied and it is indicated that the account is disabled.

### US03: Mandatory Temporary Password Change
**As an** employee logging in for the first time, **I want to** set my own password, **so that** nobody else knows my access key.
- **Given** an account flagged for a mandatory password change exists, **when** the user authenticates successfully, **then** the system restricts access to any resource other than the password change.
- **Given** a user is in the mandatory password change process, **when** the user sets a password that meets the minimum security requirements, **then** the password is updated and the mandatory change flag is removed.
- **Given** a user is in the mandatory password change process, **when** the user sets a password that does not meet the minimum length or complexity, **then** the operation is rejected and the unmet requirements are indicated.

### US04: Log Out
**As a** system user, **I want to** log out of my session, **so that** nobody else can access my information from the same computer.
- **Given** a user has an active session, **when** the user requests to log out, **then** the access token is invalidated.
- **Given** a token that has already been invalidated exists, **when** it is used to query a protected resource, **then** the system denies the request because the user does not have the required authorization.

### US05: Role Assignment and Change
**As an** HR staff member, **I want to** change the role of an account, **so that** I can grant or remove administrative privileges.
- **Given** an account and a valid role exist, **when** the role change is processed, **then** the account permissions are updated.
- **Given** a role that is not defined in the system, **when** an attempt is made to assign it, **then** the operation is rejected and it is indicated that the role is not valid.
- **Given** there is only one active account with the HR role, **when** an attempt is made to change its role to employee, **then** the operation is rejected and it is indicated that at least one account with the HR role must exist.

### US06: Password Reset
**As an** HR staff member, **I want to** reset an employee's password, **so that** I can give them back access when they have forgotten it.
- **Given** an active account exists, **when** a password reset is requested, **then** a temporary password is generated and the account is flagged for a mandatory password change.
- **Given** an account associated with a terminated employee exists, **when** a password reset is requested, **then** the operation is rejected.

### US07: Role-Based Access Restriction
**As an** organization subject to the Personal Data Protection Law, **I want** each query to be restricted according to the requester's role, **so that** an employee cannot access third-party information.
- **Given** an employee is authenticated, **when** the employee queries their own information, **then** the system returns the requested data.
- **Given** an authenticated employee with a standard role is using the application, **when** the employee queries information associated with another employee, **then** the system denies the request because the user does not have the required authorization.
- **Given** a user with the HR role is using the application, **when** the user queries information of any employee, **then** the system returns the requested data.

### US08: New Employee Registration
**As an** HR staff member, **I want to** register the complete profile of an employee, **so that** I can start their life cycle in the organization.
- **Given** valid personal data with the employee's unique identity document is available, **when** the registration is processed, **then** the employee is created with the active status and the event that originates their access credentials is emitted.
- **Given** a record with empty required fields exists, **when** the system validates the request, **then** the operation is rejected and the missing fields are detailed.
- **Given** an identity document that already belongs to an active employee is entered in the form, **when** an attempt is made to register the new profile, **then** the operation is rejected and the duplication is indicated.

### US09: Area Catalog Management
**As an** HR staff member, **I want to** create and update the organization's areas, **so that** I can reflect its structure without depending on system changes.
- **Given** an area name that does not exist, **when** the area is registered, **then** the created area becomes available for staff assignment.
- **Given** an area name that is already registered is entered, **when** an attempt is made to create the area, **then** the operation is rejected.
- **Given** an area with at least one active employee exists, **when** an attempt is made to deactivate it, **then** the operation is rejected and it is indicated that the employees in it must be reassigned first.

### US10: Area and Position Assignment
**As an** HR staff member, **I want to** assign or update the area and position of an employee, **so that** I can reflect their responsibilities within the organization.
- **Given** an existing employee already has a valid combination of area and position, **when** the new assignment is executed, **then** the job profile is updated.
- **Given** an unregistered area or position identifier is provided, **when** the assignment is attempted, **then** the operation is rejected.
- **Given** an employee already had an assigned position, **when** a new one is assigned, **then** the change is recorded with its date to preserve traceability.

### US11: Direct Manager Assignment
**As an** HR staff member, **I want to** assign a direct manager to each employee, **so that** I can define reporting lines and enable approval routing.
- **Given** two employees are active in the system and are different people, **when** the reporting line is established, **then** the employee's profile references their manager.
- **Given** an employee with the active status exists in the system, **when** an attempt is made to assign them as their own manager, **then** the operation is rejected.
- **Given** an employee is already a direct or indirect manager of the designated person, **when** an attempt is made to establish the inverse relationship, **then** the operation is rejected and it is indicated that it would create a cycle.

### US12: General Organization Chart
**As a** system user, **I want to** view the complete organization chart, **so that** I can understand its hierarchical structure.
- **Given** active employees with defined reporting lines exist, **when** the general organization chart is requested, **then** a hierarchical structure starting from the employees without a direct manager is returned.
- **Given** an active employee whose manager was terminated, **when** the organization chart is built, **then** the employee appears under a pending-reassignment node.
- **Given** no employee has an assigned direct manager, **when** the organization chart is requested, **then** a flat structure with all employees at the first level is returned.

### US13: Organization Chart by Area
**As a** system user, **I want to** view the organization chart of a specific area, **so that** I can understand how that unit is organized.
- **Given** an area with employees and a defined hierarchy exists, **when** its organization chart is requested, **then** only the branch corresponding to that area is returned.
- **Given** an area with no assigned employees exists, **when** its organization chart is requested, **then** an empty structure is returned without raising an error.

### US14: Employee Data Update
**As an** HR staff member, **I want to** update an employee's personal and contact information, **so that** I can keep the record up to date.
- **Given** an employee exists and all their data is valid, **when** the update with the new information is processed, **then** the data is modified and the modification date is recorded.
- **Given** a birth date later than the current date or an email with an incorrect format is entered, **when** the data is validated, **then** the operation is rejected and the validation errors are indicated.
- **Given** an attempt is made to register a data update with an unregistered identifier, **when** the update is attempted, **then** the operation is rejected.

### US15: Employee Termination
**As an** HR staff member, **I want to** record an employee's termination with its reason, **so that** their status reflects their real situation.
- **Given** an active employee with no assigned subordinates exists, **when** the termination is recorded with its reason and date, **then** the status changes to terminated and the event that disables their access account is emitted.
- **Given** an employee is the direct manager of others, **when** an attempt is made to record their termination, **then** the operation is rejected and it is indicated that their subordinates must be reassigned.
- **Given** an employee with the terminated status, **when** an attempt is made to record their termination again, **then** the operation is rejected.

### US16: Employee Reinstatement
**As an** HR staff member, **I want to** reinstate a terminated employee, **so that** I can manage their return to the organization.
- **Given** an employee with the terminated status exists, **when** the reinstatement is recorded with their new area and position assignment, **then** the status changes to active and the rehire date is recorded.
- **Given** an employee has the active or suspended status, **when** reinstatement is attempted, **then** the operation is rejected.

### US17: Employee File Document Upload
**As an** HR staff member, **I want to** attach documents to an employee's file, **so that** I can keep their digital file complete.
- **Given** a valid file with a document type from the allowed catalog, **when** it is associated with the employee, **then** the document is registered and available for consultation.
- **Given** a document type outside the catalog, **when** the upload is attempted, **then** the operation is rejected.
- **Given** a file larger than the established limit, **when** the upload is attempted, **then** the operation is rejected and the current limit is indicated.

### US18: Employee File Consultation
**As an** employee, **I want to** view and download the documents in my file, **so that** I can have my contracts and certificates without requesting them.
- **Given** an authenticated employee with registered documents, **when** the employee queries their file, **then** the list of their documents with their type and upload date is returned.
- **Given** an employee with a standard role, **when** the employee tries to query another employee's file, **then** the system denies the request because the user does not have the required authorization.

### US19: Own Job Profile Consultation
**As an** employee, **I want to** view my personal, job and hierarchy information, **so that** I can verify that my data is correct.
- **Given** an authenticated employee, **when** the employee requests their profile, **then** their personal data, area, position and the name of their direct manager are returned.
- **Given** an employee with no defined reporting line, **when** the employee requests their profile, **then** the profile is returned and the direct manager field is shown as unassigned.

### US20: Employee Search and Filtering
**As an** HR staff member, **I want to** search for employees by different criteria, **so that** I can locate profiles quickly.
- **Given** a search text, **when** the filter is applied, **then** the employees whose first name, last name or document match the applied filter are returned.
- **Given** an area and an employment status are selected, **when** the filter is applied, **then** only the employees who meet both criteria are returned.
- **Given** criteria that no record meets are entered, **when** the query is processed, **then** an empty set is returned without raising an error.

### US21: Punch Processing
**As an** HR staff member, **I want** the system to convert punches into attendance records, **so that** I have interpreted information without manual calculation.
- **Given** a clock-in punch and a clock-out punch are registered for an employee on the same date, **when** the system processes the punches, **then** a record with calculated effective hours is generated and classified as on time or late according to the position's schedule.
- **Given** a clock-in punch is registered without its corresponding clock-out, **when** the system processes the date, **then** the record is classified as incomplete and the effective hours are left uncalculated.
- **Given** a working day with no punches for an active employee, **when** the system processes the date, **then** a record classified as absence is generated.

### US22: Own Attendance History Consultation
**As an** employee, **I want to** review my attendance history, **so that** I can verify my punches and detect discrepancies.
- **Given** an authenticated employee with records in the queried period, **when** the employee requests their history, **then** their records with date, clock-in time, clock-out time and classification are returned.
- **Given** a period with no records for the employee, **when** the employee requests their history, **then** an empty set is returned.
- **Given** an employee with a standard role, **when** the employee tries to query another employee's history, **then** the request is rejected.

### US23: Attendance Consultation by Employee
**As an** HR staff member, **I want to** query an employee's attendance over a date range, **so that** I can review specific cases.
- **Given** an employee and a valid date range are entered in the filter, **when** the query is processed, **then** their records for the period with their classification are returned.
- **Given** a start date later than the end date is entered, **when** the query is validated, **then** the operation is rejected.

### US24: Attendance Report by Area
**As an** HR staff member, **I want to** query the attendance aggregated by area, **so that** I can identify where tardiness and absences are concentrated.
- **Given** an area and a period with records, **when** the report is generated, **then** the totals of on-time arrivals, tardiness and absences of the area are returned.
- **Given** an area with no employees with records in the period, **when** the report is generated, **then** totals of zero are returned without raising an error.

### US25: Worked Hours and Overtime Report
**As an** HR staff member, **I want to** query the hours worked and the overtime by employee and by area, **so that** I can support decisions about workload.
- **Given** an employee with complete records in a period, **when** the report is generated, **then** their effective working hours and accumulated overtime hours are returned.
- **Given** an area with several employees, **when** the report for the period is generated, **then** the total hours and overtime of the area are returned.

### US26: Request Type Catalog
**As an** HR staff member, **I want to** define the request types and the fields each one requires, **so that** I can adapt the system to the organization's procedures.
- **Given** an unregistered type name, **when** the type is created with its required fields and its mandatory attachment indicator, **then** the type becomes available for use.
- **Given** a type name that is already registered, **when** an attempt is made to create it, **then** the operation is rejected.
- **Given** a request type with associated requests exists, **when** an attempt is made to delete it, **then** the operation is rejected and deactivating it instead is offered.

### US27: Request Creation
**As an** employee, **I want to** submit a request by selecting its type, **so that** I can process vacations, leaves or permissions without resorting to informal channels.
- **Given** a request type is selected and all its required fields are complete, **when** the request is submitted, **then** it is registered in the in-progress status and assigned to the corresponding approver.
- **Given** a request type with required fields has some fields left incomplete, **when** an attempt is made to submit it, **then** the operation is rejected and the missing fields are detailed.
- **Given** a request type requires a supporting document, **when** it is submitted without an attached file, **then** the operation is rejected.

### US28: Balance Validation When Requesting Vacation
**As an** HR staff member, **I want** requests that deduct from a balance to be validated before being registered, **so that** days that the employee does not have cannot be approved.
- **Given** an employee has an available vacation balance greater than or equal to the requested days, **when** the request is submitted, **then** the request is registered.
- **Given** an employee has a balance lower than the requested days, **when** an attempt is made to submit the request, **then** the operation is rejected and the available balance is reported.

### US29: Request Routing to the Approver
**As an** HR staff member, **I want** each request to be automatically directed to whoever corresponds, **so that** no request is left without an assigned owner.
- **Given** an employee has an assigned direct manager, **when** their request is created, **then** the request is assigned to that manager.
- **Given** an employee has no defined reporting line, **when** their request is created, **then** the request is assigned to the Human Resources area.

### US30: Own Request Tracking
**As an** employee, **I want to** check the status of my requests, **so that** I know where they stand without asking anyone.
- **Given** an employee has registered requests, **when** the employee queries their list, **then** their requests with type, date, status and assigned approver are returned.
- **Given** a status is selected in the status filter, **when** the filter is applied, **then** only the requests in that status are returned.
- **Given** an employee has no registered requests, **when** the employee queries their list, **then** an empty set is returned.

### US31: Own Request Cancellation
**As an** employee, **I want to** cancel a request that has not yet been resolved, **so that** I can correct a mistaken submission.
- **Given** the employee has their own request in the in-progress status, **when** its cancellation is requested, **then** the request changes its status to cancelled and the movement is recorded in its history.
- **Given** a request is approved or rejected, **when** an attempt is made to cancel it, **then** the operation is rejected.

### US32: Inbox of Requests to Handle
**As a** person in charge of approving certain requests, **I want to** query the requests I am responsible for resolving, **so that** I can prioritize my attention.
- **Given** an approver has assigned requests, **when** the approver queries their inbox filtering by type or age, **then** the pending requests that meet the criteria are returned.
- **Given** an approver with no pending requests, **when** the approver queries their inbox, **then** an empty set is returned.

### US33: Request Approval
**As a** person in charge of approving certain requests, **I want to** approve a request, **so that** I can authorize the employee's procedure.
- **Given** a request assigned to the approver in the in-progress status, **when** the approval is recorded, **then** the status changes to approved and the movement is recorded with its author and date.
- **Given** a request is already in the approved or rejected status, **when** an attempt is made to approve it, **then** the operation is rejected.
- **Given** a request is assigned to another approver, **when** an attempt is made to resolve it, **then** the request is rejected due to lack of authorization.

### US34: Rejection with Mandatory Reason
**As a** person in charge of approving certain requests, **I want to** reject a request by indicating the reason, **so that** the employee understands the decision.
- **Given** a request is in the in-progress status and a rejection reason is given, **when** the rejection is recorded, **then** the status changes to rejected and the reason is stored and visible to the requester.
- **Given** a request in the in-progress status, **when** an attempt is made to reject it without indicating a reason, **then** the operation is rejected and it is indicated that the reason is mandatory.

### US35: Return for Review
**As an** approver, **I want to** return a request to the employee asking for additional information, **so that** I can resolve it with sufficient support.
- **Given** a request is in the in-progress status and has an approver comment, **when** the return is recorded, **then** the status changes to under review and the comment is visible to the requester.
- **Given** a request has the under review status, **when** the requester attaches the requested information and resubmits, **then** the status returns to in progress and the request goes back to the approver's inbox.

### US36: Status Change Notification
**As an** employee, **I want to** receive a notice when the status of my request changes, **so that** I find out without having to check the platform.
- **Given** a request whose status changes to approved, rejected or under review, **when** the status change is recorded, **then** the system emits a notification addressed to the requester with the new status.
- **Given** a request is submitted by an employee, **when** it is assigned to their approver, **then** the system emits a notification addressed to that approver.

### US37: Benefit Catalog
**As an** HR staff member, **I want to** define the types of benefits the organization grants, **so that** I can manage them uniformly.
- **Given** an unregistered benefit name, **when** the type is created indicating whether it handles a balance and in what unit it is measured, **then** the type becomes available for assignment.
- **Given** a benefit name that is already registered, **when** an attempt is made to create it, **then** the operation is rejected.

### US38: Benefit Assignment
**As an** HR staff member, **I want to** assign benefits to an employee or to a whole area, **so that** I can record who is entitled to each incentive.
- **Given** there is an active employee and a current benefit type, **when** the assignment is registered with its period, **then** the benefit is associated with the employee.
- **Given** an area has active employees, **when** the benefit assignment to the area is registered, **then** the benefit is associated with all of its active employees.
- **Given** an employee already has that benefit assigned in the period, **when** an attempt is made to assign it again, **then** the operation is rejected.

### US39: Benefit Delivery Registration
**As an** HR staff member, **I want to** record the actual delivery of a benefit, **so that** I can keep track of what has already been granted.
- **Given** there is an assigned benefit that has not yet been delivered, **when** the delivery is registered with its date, **then** the benefit is marked as delivered.
- **Given** a benefit with a registered delivery, **when** an attempt is made to register it again, **then** the operation is rejected.

### US40: Own Benefits Consultation
**As an** employee, **I want to** see in one place the benefits I am entitled to, **so that** I know what I have a right to without asking.
- **Given** an employee has assigned benefits, **when** the employee queries their panel, **then** their current benefits and the ones already delivered are returned, with their period.
- **Given** an employee appears with no registered benefits, **when** the employee queries their panel, **then** an empty set is returned.

### US41: Vacation Balance Calculation
**As an** HR staff member, **I want to** keep each employee's vacation balance up to date, **so that** I can eliminate manual calculation and discrepancies.
- **Given** an active employee has a registered length of service, **when** their vacation balance is queried, **then** their accrued days, used days and available days are returned.
- **Given** a vacation request changes to the approved status, **when** the change is processed, **then** the request's days are added to the employee's used days.
- **Given** an approved vacation request is later voided, **when** the voiding is processed, **then** the days are subtracted from the used days.

### US42: Manual Vacation Balance Adjustment
**As an** HR staff member, **I want to** adjust an employee's vacation balance by recording the reason, **so that** I can correct cases that the automatic calculation does not cover.
- **Given** an employee with a registered vacation balance and an adjustment reason, **when** the adjustment is registered, **then** the balance is modified and the movement is kept in the history with its author and reason for the change.
- **Given** an adjustment with no reason indicated, **when** an attempt is made to register it, **then** the operation is rejected.

### US43: Payslip Upload
**As an** HR staff member, **I want to** upload the payslips of a period, **so that** I can make them available to employees.
- **Given** the payroll area has sent a valid payslip file for a period, **when** the HR staff member processes the upload and validation, **then** the payslips are registered in the "Under review" status and ready to be published.
- **Given** a batch of previously uploaded payslips in the "Under review" status, **when** the HR staff member authorizes the bulk or individual publication, **then** the system view is updated and the payslips become available for employees to view and download.
- **Given** a file sent by payroll has a format different from the allowed one, **when** the HR staff member tries to process it in the system, **then** the operation is rejected and an error message with the correct format is shown.
- **Given** a payslip is already registered for an employee in the same period, **when** an attempt is made to upload a new version for the same period, **then** the operation warns about the duplication, is temporarily rejected, and the system offers the option to replace the existing one or cancel the action.

### US44: Own Payslip Consultation
**As an** employee, **I want to** view and download my payslips by filtering by period, **so that** I have my receipts when I need them.
- **Given** an employee has registered payslips, **when** the employee queries them filtering by period, **then** their payslips with their issue date are returned.
- **Given** a payslip belonging to the authenticated employee, **when** the employee requests its download, **then** the system delivers the file.

### US45: Payment Status Control
**As an** HR staff member, **I want to** record and update the payment status of each payslip, **so that** I know which deposits are still pending.
- **Given** a payslip has the pending status, **when** the payment is registered with its date, **then** the status changes to paid.
- **Given** a payslip has an issue with the deposit, **when** the observed status is registered with its reason, **then** the reason is stored and visible to Human Resources.

### US46: Payment Report by Area and Period
**As an** HR staff member, **I want to** query the payment status by filtering by area and period, **so that** I can quickly identify pending deposits.
- **Given** an area and a period are selected, **when** the report is generated, **then** the payslips of the period with their payment status are returned.
- **Given** the pending status is selected as a filter, **when** the report is generated, **then** only the payslips whose deposit has not been registered are returned.

### US47: Workspace Registration
**As an** HR staff member, **I want to** register the organization's spaces and offices, **so that** I can associate their environmental measurements.
- **Given** an unregistered space name and its location are entered, **when** the space is created, **then** it becomes available for registering devices to measure its environment.
- **Given** a space name is already registered, **when** an attempt is made to create it, **then** the operation is rejected.

### US48: Environmental Device Registration and Association
**As an** HR staff member, **I want to** register and associate measuring devices with a workspace, **so that** I can start capturing the office's environmental data.
- **Given** a previously registered workspace and a device with a valid, unassigned code, **when** both are linked in the system, **then** the device is associated with the space and enabled to send readings.
- **Given** a device that is already linked to another space in the organization, **when** an attempt is made to register or assign it again, **then** the operation is rejected and a warning message is shown.
- **Given** a device code that does not exist in the system inventory, **when** an attempt is made to associate it with the space, **then** the operation is rejected.

### US49: Threshold Definition by Metric
**As an** HR staff member, **I want to** define the ranges of each environmental metric, **so that** the system classifies readings according to the organization's own criteria.
- **Given** the user selects an environmental metric and defines continuous numeric ranges with no gaps or overlaps for each indicator level (for example: optimal, moderate, critical), **when** the registration of the thresholds is confirmed, **then** the system stores the configuration and it takes effect immediately to classify incoming readings.
- **Given** numeric values that overlap between two categories are entered when defining the levels of a metric (for example, Level A from 0 to 20 and Level B from 15 to 30), **when** the system runs the range validation, **then** the operation is rejected and an alert indicating the overlap conflict is shown.
- **Given** numeric gaps are left uncovered between one level and another when setting the thresholds of a metric, **when** an attempt is made to save the configuration, **then** the operation is rejected and completing the missing intervals is requested.

### US50: Environmental Indicator Consultation
**As an** HR staff member, **I want to** query the environmental status of a space, **so that** I can detect conditions that affect employees.
- **Given** a space with recent temperature, lighting and air quality readings, **when** its status is queried, **then** a health indicator for each metric according to the defined thresholds is returned.
- **Given** a space whose last reading exceeds the validity period, **when** its status is queried, **then** it is reported that the information is not up to date and no indicator is emitted.
- **Given** a reading that falls in the danger range, **when** the space status is queried, **then** the corresponding indicator is returned at the danger level.

### US51: Metric History and Trend
**As an** HR staff member, **I want to** review the evolution of an environmental metric over time, **so that** I can tell a one-off episode from a persistent problem.
- **Given** a specific workspace, an environmental metric and a date range containing stored records are selected, **when** the user requests the historical report, **then** the system returns the complete chronological series of readings for that period.
- **Given** a space and a metric where the queried date range has no stored data, **when** the historical query is requested, **then** the system returns an empty series together with a notice indicating the absence of records in the selected interval.
- **Given** a date range with a start date later than the end date or covering a future period is entered, **when** the historical query is attempted, **then** the operation is rejected and an error message asking to correct the interval limits is shown.
