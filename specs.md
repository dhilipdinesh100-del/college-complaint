from pathlib import Path

spec = r"""COLLEGE COMPLAINT MANAGEMENT SYSTEM
MASTER PROJECT SPECIFICATION
For Google Antigravity / AI Coding Agent

==================================================
1. PROJECT OBJECTIVE
==================================================

Build a production-ready, web-based College Complaint Management System.

The platform allows students to report problems or complaints within their college and track each complaint until it is resolved.

The system replaces a manual complaint process with a centralized digital complaint tracking system.

Primary workflow:

Student
  -> Submit Complaint
  -> Admin Reviews
  -> Assign Department / Staff
  -> Complaint In Progress
  -> Issue Resolved
  -> Student Views Resolution
  -> Complaint Closed

The application must be fully functional locally and deployable using:

Frontend  -> Vercel
Backend   -> Render
Database  -> MongoDB Atlas
Source    -> GitHub

Do not build only a static UI. Implement the frontend, backend, database, authentication, APIs, validation, authorization, and complete working workflow.

==================================================
2. DEVELOPMENT PRINCIPLES
==================================================

1. Build a real full-stack application.
2. Do not use mock data for core functionality.
3. Do not leave TODO placeholders for required features.
4. Keep frontend and backend clearly separated.
5. Use environment variables for secrets and URLs.
6. Never hardcode passwords, JWT secrets, database credentials, or private API keys.
7. Use clean, maintainable, modular code.
8. Validate all user input on both frontend and backend.
9. Implement proper authentication and role-based authorization.
10. Handle loading, empty, success, and error states throughout the UI.
11. Make the application responsive on desktop, tablet, and mobile.
12. Keep the design professional and appropriate for a college administration system.
13. Prefer simple, reliable implementations over unnecessary complexity.
14. Make all core features testable.
15. Do not add bonus AI features until the complete core workflow works.

==================================================
3. TECHNOLOGY STACK
==================================================

Use the following stack unless there is a strong technical reason not to:

FRONTEND
- React
- Vite
- React Router
- Modern CSS or a suitable component/UI system
- Fetch or Axios for API communication

BACKEND
- Node.js
- Express.js
- REST API
- JWT-based authentication
- bcrypt/bcryptjs for password hashing

DATABASE
- MongoDB Atlas
- Mongoose

SOURCE CONTROL
- Git
- GitHub

DEPLOYMENT
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

Do not introduce unnecessary frameworks or services.

==================================================
4. USER ROLES
==================================================

Implement two primary roles:

1. STUDENT
2. ADMIN

STUDENT permissions:
- Register
- Login
- Logout
- View own dashboard
- Submit complaints
- Upload complaint attachment
- View own complaints
- Search/filter own complaints
- View complaint details
- View complaint status history
- View admin comments/updates
- View resolution details
- Close a resolved complaint where permitted

ADMIN permissions:
- Login
- Logout
- View admin dashboard
- View all complaints
- Search/filter complaints
- View complaint details
- Assign department
- Assign staff/responsible person
- Change complaint priority
- Change complaint status
- Add comments/updates
- Add resolution details
- View statistics
- Manage departments/staff data if implemented

A student must never be able to view or modify another student's private complaint data.

==================================================
5. AUTHENTICATION
==================================================

Implement:

- Student registration
- Student login
- Admin login
- Logout
- Password hashing
- JWT authentication
- Protected frontend routes
- Protected backend API routes
- Role-based authorization

Registration fields:
- Full name
- Email
- Student ID
- Department
- Password
- Confirm password

Login:
- Email
- Password

Password requirements:
- Minimum reasonable password length
- Confirm password must match
- Never store plaintext passwords

Backend:
- Hash passwords before storing
- Verify passwords during login
- Generate JWT after successful authentication
- Protect private API endpoints with authentication middleware
- Add role middleware for admin-only endpoints

Frontend:
- Store authentication state safely
- Redirect unauthenticated users to login
- Prevent students from accessing admin pages
- Prevent admins from using student-only actions where inappropriate

==================================================
6. PROJECT STRUCTURE
==================================================

Use a structure similar to:

project/
|
+-- frontend/
|   +-- src/
|   |   +-- components/
|   |   +-- pages/
|   |   +-- layouts/
|   |   +-- services/
|   |   +-- hooks/
|   |   +-- utils/
|   |   +-- context/
|   |   +-- App.jsx
|   |   +-- main.jsx
|   +-- public/
|   +-- package.json
|   +-- .env.example
|
+-- backend/
|   +-- src/
|   |   +-- controllers/
|   |   +-- models/
|   |   +-- routes/
|   |   +-- middleware/
|   |   +-- services/
|   |   +-- utils/
|   |   +-- config/
|   |   +-- server.js
|   +-- package.json
|   +-- .env.example
|
+-- README.md
+-- .gitignore

Adapt the exact structure if needed, but keep frontend and backend clearly separated.

==================================================
7. DATABASE DESIGN
==================================================

Use MongoDB with Mongoose.

Create these core models:

A. USER

Fields:
- _id
- fullName
- email
- studentId
- department
- passwordHash
- role
- createdAt
- updatedAt

role values:
- student
- admin

Email must be unique.
Student ID should be unique for students.

B. DEPARTMENT

Fields:
- _id
- name
- description
- createdAt
- updatedAt

Example departments:
- Administration
- IT / Wi-Fi
- Electrical
- Civil / Infrastructure
- Hostel
- Transport
- Cleanliness
- Laboratory
- Academic / Classroom

C. STAFF

Fields:
- _id
- name
- email
- department
- role/title
- active
- createdAt
- updatedAt

D. COMPLAINT

Fields:
- _id
- complaintNumber
- student
- title
- category
- description
- location
- attachment
- status
- priority
- assignedDepartment
- assignedStaff
- resolutionDetails
- createdAt
- updatedAt
- resolvedAt
- closedAt

status values:
- Submitted
- Under Review
- Assigned
- In Progress
- Resolved
- Closed

priority values:
- Low
- Medium
- High
- Critical

Categories:
- Classroom
- Laboratory
- Hostel
- Wi-Fi / Internet
- Infrastructure
- Transportation
- Cleanliness
- Electrical
- Water / Plumbing
- Other

E. COMPLAINT UPDATE / HISTORY

Fields:
- _id
- complaint
- status
- comment
- updatedBy
- createdAt

Every important complaint status change should create a history/update record.

==================================================
8. COMPLAINT NUMBER
==================================================

Every complaint must receive a human-readable unique complaint number.

Example format:

CMP-2026-000001

The exact implementation can differ, but numbers must be unique and easy for students/admins to reference.

==================================================
9. COMPLAINT SUBMISSION
==================================================

Students must be able to submit a complaint.

Form fields:

Required:
- Title
- Category
- Description
- Location
- Priority

Optional:
- Image/file attachment

When submitted:
- Associate complaint with logged-in student
- Set status to Submitted
- Generate complaint number
- Save complaint to MongoDB
- Create initial history entry
- Show success message
- Redirect to complaint details or complaint list

Validation:
- Title required
- Category required
- Description required
- Location required
- Reject empty/invalid values
- Validate attachment type and size
- Prevent malicious file names/types

==================================================
10. COMPLAINT STATUS WORKFLOW
==================================================

Primary workflow:

Submitted
   ->
Under Review
   ->
Assigned
   ->
In Progress
   ->
Resolved
   ->
Closed

Admins can update the status.

Each status change must:
1. Update the complaint
2. Record a history entry
3. Store who made the update
4. Store timestamp
5. Display the change to the student

Do not silently change status without creating history.

Allow sensible validation so invalid status transitions are not accepted.

==================================================
11. PRIORITY
==================================================

Priority levels:

Low
Medium
High
Critical

Display priority clearly in the interface.

Admins can update priority.

Use visual distinction in the UI, but do not rely only on color; include text labels/icons where appropriate.

==================================================
12. DEPARTMENT AND STAFF ASSIGNMENT
==================================================

Admins must be able to assign:

- Department
- Staff/responsible person

Assignment should be available from the complaint management interface.

When assigned:
- Store department
- Store staff
- Update status to Assigned when appropriate
- Add a complaint history/update entry
- Show assignment information on complaint details

Staff choices should preferably be filtered by department.

==================================================
13. ADMIN COMMENTS AND UPDATES
==================================================

Admins can add comments/updates to complaints.

Each update should contain:
- Comment
- Admin who added it
- Timestamp
- Related status if applicable

Students can view these updates on their complaint details page.

Students must not be able to create admin updates.

==================================================
14. RESOLUTION
==================================================

When resolving a complaint, admin must be able to provide:

- Resolution details

When status becomes Resolved:
- Save resolution details
- Set resolvedAt
- Create history entry
- Show resolution to student

When complaint becomes Closed:
- Set closedAt
- Create history entry

==================================================
15. STUDENT DASHBOARD
==================================================

Create a professional student dashboard.

Display summary cards such as:
- Total Complaints
- Submitted
- Under Review
- In Progress
- Resolved
- Closed

Main dashboard sections:
- Recent complaints
- Complaint status
- Priority
- Complaint number
- Date submitted
- Quick action: Submit Complaint
- Quick action: View My Complaints

Students should only see their own complaint statistics.

==================================================
16. STUDENT COMPLAINT LIST
==================================================

Create "My Complaints".

Display:
- Complaint number
- Title
- Category
- Location
- Status
- Priority
- Assigned department
- Date
- Last updated

Features:
- Search by complaint number/title
- Filter by status
- Filter by category
- Filter by priority
- Sort by date
- Pagination if needed

Clicking a complaint opens its details page.

==================================================
17. STUDENT COMPLAINT DETAILS
==================================================

Display:

- Complaint number
- Title
- Category
- Description
- Location
- Attachment
- Priority
- Current status
- Assigned department
- Assigned staff
- Created date
- Last updated
- Resolution details

Also display a chronological timeline/history:

Submitted
Under Review
Assigned
In Progress
Resolved
Closed

Each history item should show:
- Status
- Comment
- Updated by
- Date/time

Make the timeline easy to understand.

==================================================
18. ADMIN DASHBOARD
==================================================

Create a separate admin dashboard.

Show statistics:
- Total complaints
- Submitted
- Under Review
- Assigned
- In Progress
- Resolved
- Closed
- Critical priority complaints

Also show:
- Recent complaints
- High/Critical complaints
- Complaints requiring attention

Statistics should come from real database data.

Do not hardcode statistics.

==================================================
19. ADMIN COMPLAINT MANAGEMENT
==================================================

Create an admin complaints page.

Display all complaints with:
- Complaint number
- Student
- Category
- Title
- Department
- Staff
- Status
- Priority
- Date
- Last updated

Admin features:
- Search
- Filter by status
- Filter by category
- Filter by priority
- Filter by department
- Filter by date if practical
- Sort
- Pagination if needed

Clicking a complaint opens admin complaint details.

==================================================
20. ADMIN COMPLAINT DETAILS
==================================================

Admin detail page must allow:

View:
- Student information
- Complaint details
- Attachment
- Status
- Priority
- Department
- Staff
- History
- Comments
- Resolution

Actions:
- Change status
- Change priority
- Assign department
- Assign staff
- Add comment
- Add resolution details

Every meaningful change must be persisted and reflected in history.

==================================================
21. SEARCH AND FILTERING
==================================================

Implement server-side filtering where appropriate.

Supported filters:
- Status
- Category
- Priority
- Department
- Search text
- Date range if practical

Student search must be restricted to their own complaints.

Admin search can cover all complaints.

Do not expose unauthorized complaint records through API responses.

==================================================
22. FILE ATTACHMENTS
==================================================

Students should be able to attach an image/file to a complaint.

For the MVP, implement a safe attachment mechanism.

Requirements:
- Validate file size
- Validate allowed MIME types/extensions
- Reject dangerous file types
- Store file metadata
- Store a URL/reference in the complaint

Do not store large binary files directly inside normal complaint documents unless there is a clear reason.

Keep storage implementation replaceable so it can later use a dedicated object-storage provider.

If external file storage is not configured during initial development, provide a clean development-safe implementation and document the required environment variables.

==================================================
23. API DESIGN
==================================================

Implement REST APIs similar to:

AUTH

POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

COMPLAINTS

POST   /api/complaints
GET    /api/complaints
GET    /api/complaints/:id
PUT    /api/complaints/:id
DELETE /api/complaints/:id

POST   /api/complaints/:id/comments
PUT    /api/complaints/:id/status
PUT    /api/complaints/:id/priority
PUT    /api/complaints/:id/assignment
PUT    /api/complaints/:id/resolution

DEPARTMENTS

GET    /api/departments
POST   /api/departments
PUT    /api/departments/:id
DELETE /api/departments/:id

STAFF

GET    /api/staff
POST   /api/staff
PUT    /api/staff/:id
DELETE /api/staff/:id

ADMIN

GET    /api/admin/statistics

Use appropriate HTTP status codes.

Return consistent JSON responses.

Example success:

{
  "success": true,
  "message": "Complaint created successfully",
  "data": {}
}

Example error:

{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

==================================================
24. API SECURITY
==================================================

Implement:
- Authentication middleware
- Admin authorization middleware
- Input validation
- Proper error handling
- Password hashing
- Safe MongoDB queries
- Rate limiting where appropriate
- CORS configuration
- Security headers where appropriate

Never return password hashes to clients.

Never expose secrets in API responses.

Never trust role information sent by the frontend.

The backend must determine the authenticated user's identity and role.

==================================================
25. CORS
==================================================

Backend must support a configurable frontend URL.

Use:

FRONTEND_URL

Example:

FRONTEND_URL=https://your-project.vercel.app

Do not permanently allow every origin in production.

Allow localhost during development.

==================================================
26. ENVIRONMENT VARIABLES
==================================================

Backend .env.example should include variables similar to:

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:5173

Add attachment-storage variables only if the selected implementation requires them.

Frontend .env.example:

VITE_API_URL=http://localhost:5000

Never commit actual .env files.

Update .gitignore to include:

.env
.env.local
.env.*.local
node_modules/

==================================================
27. FRONTEND ENVIRONMENT RULE
==================================================

The frontend API URL must come from:

VITE_API_URL

Example:

VITE_API_URL=https://your-project.onrender.com

Do not hardcode localhost URLs throughout the application.

Do not place private secrets in Vite frontend environment variables.

Anything exposed to browser-side code must be treated as public.

==================================================
28. UI / UX REQUIREMENTS
==================================================

Design should feel like a modern college administration portal.

Requirements:
- Clean layout
- Professional typography
- Consistent spacing
- Responsive design
- Accessible forms
- Clear navigation
- Sidebar/dashboard layout for authenticated users
- Mobile-friendly navigation
- Status badges
- Priority badges
- Complaint timeline
- Confirmation dialogs for destructive actions
- Toast/success/error notifications
- Loading indicators
- Empty states
- Error states
- Skeleton/loading states where useful

Avoid:
- Excessive animations
- Unnecessary gradients
- Cluttered dashboards
- Fake metrics
- Placeholder buttons that do nothing

==================================================
29. REQUIRED PAGES
==================================================

PUBLIC:

/login
/register

STUDENT:

/student/dashboard
/student/complaints
/student/complaints/new
/student/complaints/:id
/student/profile

ADMIN:

/admin/dashboard
/admin/complaints
/admin/complaints/:id
/admin/departments
/admin/staff

Add appropriate 404 and unauthorized pages.

==================================================
30. NAVIGATION
==================================================

Student navigation:
- Dashboard
- Submit Complaint
- My Complaints
- Profile
- Logout

Admin navigation:
- Dashboard
- All Complaints
- Departments
- Staff
- Logout

Do not show admin navigation to students.

==================================================
31. VALIDATION
==================================================

Frontend validation:
- Required fields
- Email format
- Password requirements
- Description length
- Attachment validation

Backend validation:
- Repeat all important validation
- Never rely only on frontend validation

Return useful validation errors.

==================================================
32. ERROR HANDLING
==================================================

Implement a centralized backend error-handling strategy.

Handle:
- 400 Bad Request
- 401 Unauthorized
- 403 Forbidden
- 404 Not Found
- 409 Conflict
- 500 Internal Server Error

Frontend should display understandable messages instead of raw stack traces.

Do not expose internal server errors or secrets to users.

==================================================
33. LOADING / EMPTY STATES
==================================================

Every database-driven page must handle:

Loading:
Show a suitable loading indicator.

Empty:
Example:
"You haven't submitted any complaints yet."

Error:
Example:
"Unable to load complaints. Please try again."

Do not leave blank screens.

==================================================
34. CRUD REQUIREMENTS
==================================================

The application must demonstrate real CRUD functionality.

Create:
- Student registration
- Complaint creation
- Department/staff creation where admin management is implemented

Read:
- Complaint lists
- Complaint details
- History
- Dashboard statistics

Update:
- Complaint status
- Priority
- Assignment
- Comments/resolution
- Department/staff

Delete:
- Implement carefully where appropriate.
- Students should not be able to arbitrarily delete complaints that are already being processed.
- If complaint deletion is included, enforce strict authorization and sensible business rules.

==================================================
35. DASHBOARD STATISTICS
==================================================

Admin statistics must be calculated from MongoDB.

At minimum:
- Total
- Submitted
- Under Review
- Assigned
- In Progress
- Resolved
- Closed
- Critical

Optional:
- Department-wise count
- Category-wise count
- Average resolution time

Do not implement fake analytics.

==================================================
36. RESPONSIVE DESIGN
==================================================

The entire application must work on:

- Desktop
- Laptop
- Tablet
- Mobile

Test:
- Navigation
- Forms
- Tables
- Complaint details
- Dashboard cards
- Timeline
- Filters

On mobile, convert wide tables into a usable responsive layout rather than allowing unusable horizontal overflow wherever practical.

==================================================
37. ACCESS CONTROL
==================================================

STUDENT:
Can access only their own complaints.

ADMIN:
Can access all complaints.

Backend must enforce this.

Never rely solely on frontend route protection.

Example:
GET /api/complaints/:id

If the requester is a student:
- Verify complaint.student matches authenticated user.

If admin:
- Allow access.

==================================================
38. AUDITABILITY
==================================================

Complaint history is important.

Record:
- Status changes
- Comments
- Assignment changes
- Resolution
- Important administrative actions

Every history item should identify:
- Actor
- Action/status
- Comment if applicable
- Timestamp

==================================================
39. PRODUCTION CONFIGURATION
==================================================

Backend must use:

const PORT = process.env.PORT || 5000;

Do not hardcode the production port.

Backend start script should be something similar to:

"start": "node src/server.js"

Use the actual entry point selected by the implementation.

==================================================
40. DEPLOYMENT REQUIREMENTS
==================================================

The final application must be deployable as:

GitHub
  |
  +--> Vercel
  |     |
  |     +--> React/Vite Frontend
  |
  +--> Render
        |
        +--> Node/Express Backend
              |
              +--> MongoDB Atlas

Deployment process:

1. Test locally.
2. Push source to GitHub.
3. Create MongoDB Atlas database.
4. Configure MongoDB connection string.
5. Deploy backend to Render.
6. Add Render environment variables.
7. Test backend APIs.
8. Configure frontend CORS URL.
9. Set VITE_API_URL.
10. Deploy frontend to Vercel.
11. Set Vercel environment variables.
12. Update FRONTEND_URL in Render.
13. Test entire production workflow.

==================================================
41. README REQUIREMENTS
==================================================

Create a clear README containing:

- Project description
- Features
- Technology stack
- Folder structure
- Local setup
- Environment variables
- MongoDB setup
- Backend setup
- Frontend setup
- Running locally
- API overview
- User roles
- Deployment instructions
- Production configuration
- Test accounts if a safe demo account is created

Never put actual passwords, API keys, JWT secrets, or database credentials in README.

==================================================
42. SEED / DEMO DATA
==================================================

Provide an optional development seed mechanism.

It may create:
- One admin
- Example departments
- Example staff
- A small set of example complaints

Do not use seed data as a replacement for real functionality.

Do not expose development credentials in production.

==================================================
43. TESTING CHECKLIST
==================================================

Before declaring the project complete, verify:

AUTHENTICATION
[ ] Student registration works
[ ] Student login works
[ ] Admin login works
[ ] Invalid login is handled
[ ] Logout works
[ ] Protected routes work
[ ] Role restrictions work

STUDENT
[ ] Dashboard loads
[ ] Complaint submission works
[ ] Attachment works
[ ] Complaint appears in My Complaints
[ ] Complaint details work
[ ] History is visible
[ ] Search works
[ ] Filters work

ADMIN
[ ] Admin dashboard loads
[ ] Real statistics display
[ ] All complaints display
[ ] Search works
[ ] Filters work
[ ] Complaint details work
[ ] Assignment works
[ ] Priority update works
[ ] Status update works
[ ] Comments work
[ ] Resolution works

WORKFLOW
[ ] Submitted status works
[ ] Under Review status works
[ ] Assigned status works
[ ] In Progress status works
[ ] Resolved status works
[ ] Closed status works
[ ] History is created for changes
[ ] Student sees updated status

SECURITY
[ ] Passwords are hashed
[ ] Secrets are in environment variables
[ ] Student cannot access another student's complaint
[ ] Student cannot call admin-only APIs
[ ] Password hashes are never returned
[ ] CORS is configured
[ ] Input is validated

DATABASE
[ ] MongoDB connection works
[ ] CRUD operations work
[ ] Data persists after restart
[ ] Indexes/unique constraints are configured where useful

DEPLOYMENT
[ ] Backend runs on Render
[ ] Frontend runs on Vercel
[ ] Vercel can call Render API
[ ] Render can connect to MongoDB Atlas
[ ] Production CORS works
[ ] Production environment variables work
[ ] No localhost API URL remains in production
[ ] No secrets are committed to GitHub

==================================================
44. OPTIONAL BONUS FEATURES
==================================================

Only implement these after the entire core system works:

- Email notifications
- Real-time notifications
- Admin analytics
- Department-wise statistics
- Complaint resolution time tracking
- Student feedback
- Resolution rating
- Duplicate complaint detection
- AI complaint categorization
- AI-generated summaries
- Image-based issue classification
- Automatic escalation
- PWA/mobile enhancements

Do not allow bonus features to break or delay the core complaint workflow.

==================================================
45. IMPLEMENTATION ORDER
==================================================

Build in this exact general order:

PHASE 1
Project setup
- Frontend
- Backend
- MongoDB connection
- Environment configuration

PHASE 2
Authentication
- User model
- Registration
- Login
- JWT
- Role authorization

PHASE 3
Core database models
- Department
- Staff
- Complaint
- Complaint history

PHASE 4
Student functionality
- Dashboard
- Submit complaint
- My complaints
- Complaint details
- History

PHASE 5
Admin functionality
- Dashboard
- Complaint management
- Assignment
- Status
- Priority
- Comments
- Resolution

PHASE 6
Search/filtering
- Student filters
- Admin filters
- Pagination if needed

PHASE 7
Attachments
- Validation
- Storage
- Display/download

PHASE 8
UI polish
- Responsive design
- Loading states
- Empty states
- Error handling
- Accessibility

PHASE 9
Testing
- End-to-end workflow
- Security
- API testing
- Mobile testing

PHASE 10
Deployment
- GitHub
- MongoDB Atlas
- Render
- Vercel
- CORS
- Production environment variables

==================================================
46. AGENT BEHAVIOR RULES
==================================================

The AI coding agent must:

1. Inspect the existing project before creating files.
2. Reuse existing working code where appropriate.
3. Do not overwrite working functionality without reason.
4. Explain significant architectural decisions briefly.
5. Implement required functionality completely.
6. Run/build/test the project after major changes.
7. Fix errors instead of ignoring them.
8. Never claim a feature works without verifying it.
9. Keep dependencies reasonable.
10. Keep frontend and backend configuration separate.
11. Use environment variables correctly.
12. Never expose secrets.
13. Never use fake API responses for core functionality.
14. Never create buttons that appear functional but do nothing.
15. Keep API error handling consistent.
16. Maintain role-based security on the server.
17. Ensure database queries respect authorization.
18. Keep code readable and modular.

If a requirement is technically impossible with the current project configuration, explain the issue and implement the closest safe, maintainable alternative.

==================================================
47. DEFINITION OF DONE
==================================================

The project is complete only when a student can:

1. Register.
2. Login.
3. Open the student dashboard.
4. Submit a complaint.
5. Receive a complaint number.
6. View the complaint.
7. See its Submitted status.
8. Admin can log in.
9. Admin can see the complaint.
10. Admin can review it.
11. Admin can assign a department.
12. Admin can assign staff.
13. Admin can change status.
14. Admin can add comments.
15. Admin can set priority.
16. Admin can provide resolution details.
17. Admin can mark the complaint Resolved.
18. Student can see the resolution.
19. Complaint can be Closed.
20. Student can see the complete history.
21. Data persists in MongoDB.
22. The frontend communicates with the deployed backend.
23. The deployed backend communicates with MongoDB Atlas.
24. The production application works from the Vercel URL.

==================================================
48. FINAL OUTPUT EXPECTATION
==================================================

When implementation is finished, provide:

1. Project structure
2. Technologies used
3. Features implemented
4. Environment variables required
5. Local setup commands
6. API endpoint summary
7. Database model summary
8. Test results
9. Known limitations, if any
10. Deployment instructions

Do not say "complete" if core functionality is still mocked, broken, or untested.

END OF SPECIFICATION
"""

path = Path("/mnt/data/specs.txt")
path.write_text(spec, encoding="utf-8")
print(f"Created: {path}")
print(f"Lines: {len(spec.splitlines())}")
