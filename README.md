# ImpactHive API — Backend Documentation

Welcome to the **ImpactHive** backend repository. This backend service powers the ImpactHive volunteer management and community impact platform, providing RESTful endpoints for web and mobile client applications.

---

## Table of Contents
- [Tech Stack](#tech-stack)
- [Getting Started & Local Setup](#getting-started--local-setup)
- [Environment Variables](#environment-variables)
- [Authentication & Authorization](#authentication--authorization)
- [API Status Overview](#api-status-overview)
- [Ready Endpoints (Available for Frontend & Mobile)](#ready-endpoints-available-for-frontend--mobile)
  - [1. Authentication (`/auth`)](#1-authentication-auth)
  - [2. Projects (`/projects`)](#2-projects-projects)
  - [3. Tasks (`/projects/:projectId/tasks`)](#3-tasks-projectsprojectidtasks)
  - [4. Volunteer Profiles (`/volunteers`)](#4-volunteer-profiles-volunteers)
  - [5. Attendance (`/attendance`)](#5-attendance-attendance)
- [Endpoints Under Construction / To Be Worked On](#endpoints-under-construction--to-be-worked-on)
  - [6. Organizations (`/organizations`)](#6-organizations-organizations)
  - [7. Notifications (`/notifications`)](#7-notifications-notifications)
  - [8. Users (`/users`)](#8-users-users)
  - [9. Dashboard (`/dashboard`)](#9-dashboard-dashboard)
  - [10. Alerts (`/alerts`)](#10-alerts-alerts)
  - [11. Reports (`/reports`)](#11-reports-reports)
- [Client Integration Notes & Best Practices](#client-integration-notes--best-practices)
- [Error Response Structure](#error-response-structure)

---

## Tech Stack
- **Runtime:** Node.js (ES Modules)
- **Framework:** Express 5.x
- **Database:** MongoDB via Mongoose
- **Authentication:** JSON Web Tokens (JWT) & bcrypt
- **Validation:** Mongoose Schema Validators & Validator.js
- **Media/Uploads:** Multer & Cloudinary (dependencies loaded, integration in progress)
- **CORS:** Configured with credentials support for local development and client production origins

---

## Getting Started & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher recommended)
- A running MongoDB instance (Local or MongoDB Atlas)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd cohort8-capstone-project-backend

# Install dependencies
npm install
```

### Running the Server
```bash
# Start in development mode (with native Node auto-reload)
npm run dev

# Start in production mode
npm start
```
The server will start at `http://localhost:3000` (or the port specified in `config.env`).

---

## Environment Variables

Create a `config.env` file in the project root with the following variables:

```env
PORT=3000
NODE_ENV=development

# MongoDB Connection
ATLAS_STRING=mongodb+srv://<username>:<db_password>@cluster0.mongodb.net/<database_name>
MONGODB_PASSWORD=your_mongodb_password
LOCAL_DB=mongodb://localhost:27017/impacthive

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# CORS Allowed Origin
CLIENT_URL=http://localhost:5173
```

> **Note:** The server expects `config.env` in the root folder and validates `ATLAS_STRING`, `MONGODB_PASSWORD`, and `JWT_SECRET` on boot.

---

## Authentication & Authorization

All protected endpoints require a JWT token passed in the `Authorization` header:

```http
Authorization: Bearer <your_jwt_token>
```

### User Roles
- **`volunteer`**: Default role for new users. Can create and manage their volunteer profile, view projects and tasks, and update status of assigned tasks.
- **`coordinator`**: Manages projects, creates and manages project tasks, and views volunteers.
- **`admin`**: System administrator with elevated management privileges.

---

## API Status Overview

| Resource | Base Path | Status | Notes |
|---|---|---|---|
| **Auth** | `/auth` | ✅ **Ready** | Signup & Login working with JWT generation. |
| **Projects** | `/projects` | ✅ **Ready** | Full CRUD implemented with role restrictions. |
| **Tasks** | `/projects/:projectId/tasks` | ✅ **Ready** | Full CRUD + status update nested under projects. |
| **Volunteer Profiles** | `/volunteers` | ⚠️ **Partially Ready** | Profile creation, listing, and ID-based updates work; see notes on `/volunteers/me`. |
| **Attendance** | `/attendance` | ⚠️ **Partially Ready** | Check-in is working; check-out and verification are still in progress. |
| **Organizations** | `/organizations` | ⏳ **In Progress** | Routes declared, controller handlers currently stubbed. |
| **Notifications** | `/notifications` | ⏳ **In Progress** | Route mounted, controller handler currently stubbed. |
| **Users** | `/users` | ⏳ **To Be Worked On** | Router mounted in `app.js`, endpoints not yet defined. |
| **Dashboard** | `/dashboard` | ⏳ **To Be Worked On** | Router mounted in `app.js`, endpoints not yet defined. |
| **Alerts** | `/alerts` | ⏳ **To Be Worked On** | Router mounted in `app.js`, endpoints not yet defined. |
| **Reports** | `/reports` | ⏳ **To Be Worked On** | Router mounted in `app.js`, endpoints not yet defined. |

---

## Ready Endpoints (Available for Frontend & Mobile)

### 1. Authentication (`/auth`)

#### `POST /auth/signup`
Register a new user account.
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePassword123!",
  "phoneNumber": "+2348012345678",
  "role": "volunteer" 
}
```
*Allowed roles during signup: `"volunteer"` (default) or `"coordinator"`. `"admin"` cannot be self-registered.*

- **Success Response (201 Created):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": "66123456789abcdef1234567",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "volunteer",
      "timestamp": "2026-10-10T10:00:00.000Z"
    }
  }
}
```

---

#### `POST /auth/login`
Authenticate an existing user and receive a JWT.
- **Access:** Public
- **Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePassword123!"
}
```
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login successful",
  "user": {
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "volunteer",
    "organizationId": null,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Projects (`/projects`)

#### `POST /projects`
Create a new project.
- **Access:** Protected (`coordinator` only)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "name": "Clean Water Initiative",
  "description": "Providing clean borehole water across local communities.",
  "organizationId": "65123456789abcdef1234567",
  "startDate": "2026-11-01T08:00:00Z",
  "endDate": "2026-12-01T17:00:00Z",
  "status": "not started",
  "location": "Lagos, Nigeria",
  "maxVolunteers": 50
}
```
*Valid `status` values: `"not started"` (default), `"active"`, `"on hold"`, `"completed"`, `"archived"`.*  
*Validation rule: `startDate` must be earlier than `endDate`.*

- **Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "Project created successfully",
  "data": {
    "project": {
      "_id": "66a0123456789abcdef11111",
      "name": "Clean Water Initiative",
      "description": "Providing clean borehole water across local communities.",
      "organizationId": "65123456789abcdef1234567",
      "startDate": "2026-11-01T08:00:00.000Z",
      "endDate": "2026-12-01T17:00:00.000Z",
      "status": "not started",
      "location": "Lagos, Nigeria",
      "maxVolunteers": 50,
      "createdBy": "66123456789abcdef1234567"
    }
  }
}
```

---

#### `GET /projects`
Retrieve all projects.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "result": 1,
  "data": {
    "projects": [
      {
        "_id": "66a0123456789abcdef11111",
        "name": "Clean Water Initiative",
        "description": "Providing clean borehole water across local communities.",
        "organizationId": "65123456789abcdef1234567",
        "status": "not started",
        "startDate": "2026-11-01T08:00:00.000Z",
        "endDate": "2026-12-01T17:00:00.000Z",
        "location": "Lagos, Nigeria",
        "maxVolunteers": 50,
        "createdBy": "66123456789abcdef1234567"
      }
    ]
  }
}
```

---

#### `GET /projects/:id`
Get a single project by ID.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "project": {
      "_id": "66a0123456789abcdef11111",
      "name": "Clean Water Initiative",
      "description": "Providing clean borehole water across local communities.",
      "organizationId": "65123456789abcdef1234567",
      "status": "not started",
      "startDate": "2026-11-01T08:00:00.000Z",
      "endDate": "2026-12-01T17:00:00.000Z",
      "location": "Lagos, Nigeria",
      "maxVolunteers": 50
    }
  }
}
```

---

#### `PATCH /projects/:id`
Update an existing project.
- **Access:** Protected (`coordinator` only)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Partial project fields to update (`name`, `description`, `status`, `location`, `maxVolunteers`, etc.)
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "project updated successfully",
  "data": {
    "project": {
      "_id": "66a0123456789abcdef11111",
      "name": "Clean Water Initiative (Updated)",
      "status": "active"
    }
  }
}
```

---

#### `DELETE /projects/:id`
Delete a project.
- **Access:** Protected (`coordinator` only)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content)**

---

### 3. Tasks (`/projects/:projectId/tasks`)

> **Important Routing Note for Mobile & Web:**  
> All task endpoints are **nested under projects**: `/projects/:projectId/tasks`.  
> Make sure to supply the appropriate `:projectId` in the path.

#### `POST /projects/:projectId/tasks`
Create a new task within a project.
- **Access:** Protected (`coordinator` only)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "title": "Site Inspection & Soil Testing",
  "description": "Inspect the project location and test soil suitability for drilling.",
  "assignedTo": "66123456789abcdef1234567",
  "status": "not started"
}
```
*Valid `status` values: `"not started"`, `"in progress"`, `"completed"`.*

- **Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "task successfully created",
  "data": {
    "task": {
      "_id": "66b0123456789abcdef22222",
      "projectId": "66a0123456789abcdef11111",
      "title": "Site Inspection & Soil Testing",
      "description": "Inspect the project location and test soil suitability for drilling.",
      "assignedTo": "66123456789abcdef1234567",
      "status": "not started",
      "createdAt": "2026-10-10T10:15:00.000Z",
      "updatedAt": "2026-10-10T10:15:00.000Z"
    }
  }
}
```

---

#### `GET /projects/:projectId/tasks`
Retrieve all tasks for a specific project.
- **Access:** Protected (`coordinator` only)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "result": 1,
  "data": {
    "tasks": [
      {
        "_id": "66b0123456789abcdef22222",
        "projectId": {
          "_id": "66a0123456789abcdef11111",
          "name": "Clean Water Initiative"
        },
        "title": "Site Inspection & Soil Testing",
        "status": "not started"
      }
    ]
  }
}
```
*If no tasks exist, returns: `{ "status": "success", "result": 0, "data": "no task" }`.*

---

#### `GET /projects/:projectId/tasks/:id`
Retrieve details of a single task.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "task": {
      "_id": "66b0123456789abcdef22222",
      "projectId": "66a0123456789abcdef11111",
      "title": "Site Inspection & Soil Testing",
      "description": "Inspect the project location and test soil suitability for drilling.",
      "status": "not started"
    }
  }
}
```

---

#### `PATCH /projects/:projectId/tasks/:id`
Update a task (e.g. description, assignment, title).
- **Access:** Protected (`coordinator` or `volunteer`)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "description": "Updated inspection notes and logistics details.",
  "status": "in progress"
}
```
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "Task updated successfully",
  "data": {
    "task": {
      "_id": "66b0123456789abcdef22222",
      "title": "Site Inspection & Soil Testing",
      "status": "in progress"
    }
  }
}
```

---

#### `PATCH /projects/:projectId/tasks/:id/status`
Quick-update only the task status.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "status": "completed"
}
```
- **Success Response (200 OK):**
```json
{
  "status": "success"
}
```

---

#### `DELETE /projects/:projectId/tasks/:id`
Delete a task.
- **Access:** Protected (`coordinator` only)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content)**

---

### 4. Volunteer Profiles (`/volunteers`)

#### `POST /volunteers`
Create a volunteer profile for the currently logged-in volunteer user.
- **Access:** Protected (`volunteer` role only)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "skills": ["Community Outreach", "First Aid", "Translation"],
  "availability": "Weekends, 10am - 4pm",
  "interests": ["Clean Water", "Education", "Healthcare"],
  "location": "Lagos, Nigeria",
  "bio": "Passionate volunteer dedicated to public health and clean water initiatives.",
  "avatarUrl": "https://example.com/avatar.jpg",
  "emergencyContact": {
    "name": "John Doe",
    "phone": "+2348098765432",
    "relationship": "Brother"
  }
}
```
*Note: A user can only have one volunteer profile (enforced by unique `userId` index).*

- **Success Response (201 Created):**
```json
{
  "status": "success",
  "message": "user successfully created",
  "data": {
    "newProfile": {
      "_id": "66c0123456789abcdef33333",
      "userId": "66123456789abcdef1234567",
      "skills": ["Community Outreach", "First Aid", "Translation"],
      "availability": "Weekends, 10am - 4pm",
      "interests": ["Clean Water", "Education", "Healthcare"],
      "location": "Lagos, Nigeria",
      "bio": "Passionate volunteer dedicated to public health and clean water initiatives."
    }
  }
}
```

---

#### `GET /volunteers/me`
Retrieve the volunteer profile of the currently logged-in user.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "myProfile": {
      "_id": "66c0123456789abcdef33333",
      "userId": {
        "_id": "66123456789abcdef1234567",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phoneNumber": "+2348012345678"
      },
      "skills": ["Community Outreach", "First Aid"],
      "availability": "Weekends",
      "location": "Lagos, Nigeria",
      "bio": "Passionate volunteer..."
    }
  }
}
```

---

#### `GET /volunteers`
List all volunteer profiles with user information populated.
- **Access:** Protected (`admin`, `coordinator`)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "result": 1,
  "data": {
    "volunteers": [
      {
        "_id": "66c0123456789abcdef33333",
        "userId": {
          "_id": "66123456789abcdef1234567",
          "name": "Jane Doe",
          "email": "jane@example.com",
          "phoneNumber": "+2348012345678"
        },
        "skills": ["Community Outreach"],
        "location": "Lagos, Nigeria"
      }
    ]
  }
}
```

---

#### `GET /volunteers/:id`
Get a volunteer profile by profile ID.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "volunteer": {
      "_id": "66c0123456789abcdef33333",
      "userId": {
        "_id": "66123456789abcdef1234567",
        "name": "Jane Doe",
        "email": "jane@example.com",
        "phoneNumber": "+2348012345678"
      },
      "skills": ["Community Outreach"],
      "bio": "Passionate volunteer..."
    }
  }
}
```

---

#### `PATCH /volunteers/:id`
Update a volunteer profile by its profile ID.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:** Partial profile fields to update (`skills`, `availability`, `interests`, `location`, `bio`, `avatarUrl`)
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "message": "successfully updated profile",
  "data": {
    "updatedProfile": {
      "_id": "66c0123456789abcdef33333",
      "skills": ["Community Outreach", "Public Speaking"],
      "bio": "Updated bio..."
    }
  }
}
```

---

#### `DELETE /volunteers/:id`
Delete a volunteer profile by profile ID.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (204 No Content)**

---

#### `DELETE /volunteers/me`
Delete the currently logged-in volunteer's profile.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Success Response (200 OK):**
```json
{
  "status": "success",
  "data": {
    "myProfile": {
      "_id": "66c0123456789abcdef33333"
    }
  }
}
```

> ⚠️ **Developer Notice regarding `PATCH /volunteers/me`:**  
> The endpoint `PATCH /volunteers/me` is currently missing the request body payload parameter in the underlying controller query. Until this is patched on the backend, **frontend and mobile clients should use `PATCH /volunteers/:id`** using the `_id` received from `GET /volunteers/me`.

---

### 5. Attendance (`/attendance`)

#### `POST /attendance/checkIn`
Record a volunteer's check-in for an assigned task.
- **Access:** Protected (Any authenticated user)
- **Headers:** `Authorization: Bearer <token>`
- **Request Body:**
```json
{
  "volunteerId": "66123456789abcdef1234567",
  "taskId": "66b0123456789abcdef22222"
}
```
- **Success Response (201 Created):**
```json
{
  "message": "Volunteer checked in successfully",
  "attendance": {
    "_id": "66d0123456789abcdef44444",
    "volunteerId": "66123456789abcdef1234567",
    "taskId": "66b0123456789abcdef22222",
    "checkInTime": "2026-10-10T10:30:00.000Z",
    "verified": false,
    "createdAt": "2026-10-10T10:30:00.000Z",
    "updatedAt": "2026-10-10T10:30:00.000Z"
  }
}
```

---

## Endpoints Under Construction / To Be Worked On

The following modules and endpoints are currently in progress, have empty route stubs, or are scheduled for upcoming development iterations. **Do not integrate these in client production flows yet.**

---

### 6. Organizations (`/organizations`)
*Status: Routes are registered in Express, but controller actions are empty stubs. Do not call yet (requests will hang until timeout).*

| Method | Endpoint | Planned Role / Purpose | Current Status |
|---|---|---|---|
| `POST` | `/organizations/register` | Register an organization profile (name, email, location, description, owner) | ⏳ Stubbed |
| `GET` | `/organizations` | List all organizations | ⏳ Stubbed |
| `GET` | `/organizations/:id` | Get details for an organization | ⏳ Stubbed |
| `PATCH` | `/organizations/:id/verify` | Verify an organization (`admin` only) | ⏳ Stubbed |
| `PATCH` | `/organizations/suspend` | Suspend an organization (`admin` only) | ⏳ Stubbed |
| `POST` | `/organizations/me/coordinators` | Add coordinators to the caller's organization | ⏳ Stubbed |
| `GET` | `/organizations/me/coordinators` | List coordinators belonging to the organization | ⏳ Stubbed |
| `DELETE` | `/organizations/me/coordinators/:userId` | Remove coordinator from the organization | ⏳ Stubbed |

**Tasks needed by backend team:**
- Implement database queries in `controllers/organizationController.js`.
- Add `authenticate` and `authorize("admin", "coordinator")` middleware to organization routes.
- Link organization status updates to notification triggers.

---

### 7. Notifications (`/notifications`)
*Status: Route mounted at `/notifications`, but controller handler is an empty stub.*

| Method | Endpoint | Planned Purpose | Current Status |
|---|---|---|---|
| `GET` | `/notifications` | Fetch unread and recent notifications for the logged-in user | ⏳ Stubbed |
| `PATCH` | `/notifications/:id/read` | Mark a specific notification as read | ⏳ To be implemented |
| `DELETE` | `/notifications/:id` | Dismiss / delete a notification | ⏳ To be implemented |

**Tasks needed by backend team:**
- Implement `getNotification` in `controllers/notificationController.js` filtering by `req.user.id`.
- Add `authenticate` middleware to `routes/notificationRoutes.js`.
- Implement mark-as-read and batch cleanup.

---

### 8. Users (`/users`)
*Status: Mounted in `app.js` (`app.use("/users", userRouter)`), but `routes/userRoutes.js` contains no routes.*

| Method | Endpoint | Planned Purpose | Current Status |
|---|---|---|---|
| `GET` | `/users/me` | Fetch authenticated user account details (name, email, role, phone) | ⏳ To be implemented |
| `PATCH` | `/users/me` | Update personal account information | ⏳ To be implemented |
| `PATCH` | `/users/change-password` | Update user password with current password verification | ⏳ To be implemented |
| `GET` | `/users` | Search and list users (`admin` / `coordinator` only) | ⏳ To be implemented |
| `GET` | `/users/:id` | Fetch specific user by ID | ⏳ To be implemented |
| `DELETE` | `/users/:id` | Deactivate or delete user account | ⏳ To be implemented |

---

### 9. Dashboard (`/dashboard`)
*Status: Mounted in `app.js` (`app.use("/dashboard", dashboardRouter)`), but `routes/dashboardRoutes.js` contains no routes.*

| Method | Endpoint | Planned Purpose | Current Status |
|---|---|---|---|
| `GET` | `/dashboard/stats` | High-level metrics for coordinators/admins (total projects, active tasks, volunteer count) | ⏳ To be implemented |
| `GET` | `/dashboard/volunteer` | Volunteer-centric summary (assigned tasks, hours logged, upcoming projects) | ⏳ To be implemented |

---

### 10. Alerts (`/alerts`)
*Status: Mounted in `app.js` (`app.use("/alerts", alertRouter)`), but `routes/alertRoutes.js` contains no routes.*

| Method | Endpoint | Planned Purpose | Current Status |
|---|---|---|---|
| `POST` | `/alerts` | Broadcast urgent announcements or field alerts to volunteers | ⏳ To be implemented |
| `GET` | `/alerts` | Get active community/project emergency alerts | ⏳ To be implemented |
| `PATCH` | `/alerts/:id/resolve` | Resolve or archive an alert | ⏳ To be implemented |

---

### 11. Reports (`/reports`)
*Status: Mounted in `app.js` (`app.use("/reports", reportRouter)`), but `routes/reportRoutes.js` contains no routes.*

| Method | Endpoint | Planned Purpose | Current Status |
|---|---|---|---|
| `GET` | `/reports/attendance` | Attendance records and check-in history filtered by project/task | ⏳ To be implemented |
| `GET` | `/reports/impact` | Volunteer hours, completed tasks, and milestone metrics | ⏳ To be implemented |
| `GET` | `/reports/export` | CSV or PDF export generation for coordinators/sponsors | ⏳ To be implemented |

---

### 12. Attendance Extensions Needed (`/attendance`)
While `POST /attendance/checkIn` is ready, the following companion endpoints are pending:
- `POST /attendance/checkOut` — Record volunteer departure time and compute total duration.
- `PATCH /attendance/:id/verify` — Coordinator confirmation/approval of volunteer attendance.
- `GET /attendance/task/:taskId` — View all attendance logs for a specific task.
- `GET /attendance/user/:userId` — View personal attendance history.

---

## Client Integration Notes & Best Practices

1. **Authentication Headers:**
   Always attach the `Authorization` header after a successful login:
   ```javascript
   // Axios Example
   api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
   ```

2. **Nested Tasks Architecture:**
   Do not attempt to call top-level `/tasks`. Always route task requests through their respective project:
   ```http
   GET http://localhost:3000/projects/66a0123456789abcdef11111/tasks
   ```

3. **Status Enums:**
   Ensure client UI pickers adhere to the backend enum definitions:
   - **Project Status:** `"not started"`, `"active"`, `"on hold"`, `"completed"`, `"archived"`
   - **Task Status:** `"not started"`, `"in progress"`, `"completed"`
   - **User Roles:** `"admin"`, `"coordinator"`, `"volunteer"`

4. **CORS Troubleshooting:**
   If testing from a frontend dev server (e.g., Vite on port 5173 or Live Server on 5500), make sure your origin is listed in `config/cors.js` or set via `CLIENT_URL` in `config.env`.

---

## Error Response Structure

The backend utilizes a centralized error handling mechanism. All errors adhere to a standard format:

### Operational Error Response (e.g. 400 Bad Request, 401 Unauthorized, 404 Not Found)
```json
{
  "status": "fail",
  "message": "Invalid email or password"
}
```

### Validation Error Response (400 Bad Request)
When Mongoose validation fails, error messages are combined into the `message` field:
```json
{
  "status": "fail",
  "message": "invalid input data. Project must have a name. end date must be more (later than) start date"
}
```

### Duplicate Key Error (409 Conflict)
```json
{
  "status": "fail",
  "message": "duplicate value for email: jane@example.com. Please use another value"
}
```

### Development Mode (`NODE_ENV=development`)
In development mode, additional debugging fields (`error` and `stack`) are provided:
```json
{
  "status": "fail",
  "message": "Project not found",
  "error": { ... },
  "stack": "Error: Project not found\n    at ..."
}
```
