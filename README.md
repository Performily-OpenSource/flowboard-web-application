# Flowboard (flowboard-webapp)

## Overview
This project is the web application of Flowboard, a human resources management platform that allows HR staff and employees to manage the employee life cycle, attendance, requests, benefits, payslips and workplace wellbeing in a single place. It was developed by the Performily team for the Open Source Applications course.

## Features
- **Identity and Access Control**: Log in with role-based access (HR staff and employees), mandatory password change on first login, password reset and role assignment.
- **Employee Management**: Register, update, terminate and reinstate employees, assign areas, positions and direct managers, and manage each employee's document file.
- **Organization Chart**: View the general organization chart or the one of a specific area.
- **Attendance Control**: Review punches, attendance records, hours worked and overtime, with reports by employee and by area.
- **Requests and Approvals**: Submit requests of configurable types, route them to the approver, and approve, reject or return them for review with a full history.
- **Benefits and Vacation Balance**: Manage the benefit catalog, assignments and deliveries, and keep each employee's vacation balance up to date.
- **Payslips**: Upload, publish and download payslips, and control the payment status of each one.
- **Workplace Wellbeing**: Monitor environmental metrics of offices through devices, thresholds and historical readings.
- **Multilingual Support**: Switch between English and Spanish seamlessly.

## Technologies
- Angular framework.
- Typescript language.
- Angular Material UI Component Library.
- Angular HTTP client.
- Angular Signals.
- Angular reactive state management.
- NGX-Translate library.
- JSON Server (fake REST API).
- Domain-Driven Design layered architecture (domain, application, infrastructure and presentation) per bounded context.

## Documentation
- **User Stories & RTM**: Detailed requirements and the Requirement Traceability Matrix can be found in [docs/user-stories.md](docs/user-stories.md).
- **Class Diagrams**: The architectural overview of each bounded context (shared, iam, workspace, attendance, request, benefits, payroll and wellbeing) is available in [docs/class-diagrams](docs/class-diagrams).

## Environment Variables
This project does not require API keys. The application consumes a REST API whose base URL and endpoint paths are set in [src/environments/environment.ts](src/environments/environment.ts) and [src/environments/environment.development.ts](src/environments/environment.development.ts):
- `platformProviderApiBaseUrl`: Base URL of the REST API. By default, `http://localhost:3000/api/v1`.
- `platformProvider...EndpointPath`: Path of each resource (for example, `/employees`, `/requests` or `/payslips`).
- `humanResourcesAreaId`: Identifier of the Human Resources area, used to route requests of employees without a direct manager.
- `defaultActingEmployeeId`: Identifier of the employee used by default as the acting user.

## Fake API
The application uses [JSON Server](https://github.com/typicode/json-server) with the data in [server/db.json](server/db.json) and the route rewrite in [server/routes.json](server/routes.json). Install the dependencies first:

```bash
npm install
```

Then start the fake API in a separate terminal:

```bash
npx json-server --watch server/db.json --routes server/routes.json --port 3000
```

## Development server

With the fake API running, start a local development server:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Users
To use the web application, you can log in with the following usernames.

```
For rrhh: 
    user: maria.quispe@flowboard.pe 
    password: Password1! 

For collaborator:
    user: lucia.fernandez@flowboard.pe 
    password: Password1! 
```

## Building

To build the project run:

```bash
ng build
```
This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.