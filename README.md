# CampusResolve — College Complaint Management System

A production-ready, full-stack web application designed for higher education institutions to streamline, track, and resolve campus issues and student grievances in real time.

Built according to the Master Project Specification with role-based security, sequential ticket numbering (`CMP-YYYY-XXXXXX`), audit timelines, live MongoDB analytics, department/staff assignment, and file attachments.

---

## 🌟 Key Features

### 🎓 Student Portal
- **Secure Registration & Login**: Student verification with Student ID/Roll No. and department.
- **Interactive Dashboard**: Real-time KPI summary cards (Submitted, Under Review, In Progress, Resolved, Closed) and recent ticket activity.
- **Complaint Submission**: Multi-field submission with category selection, campus location, priority levels, rich descriptions, and image/document attachments.
- **Live Ticket Tracking**: Real-time chronological audit history showing which staff member handled each step.
- **Student Follow-ups**: Comment on active tickets directly from the details view.
- **Resolution Verification**: Review official resolution notes and close verified tickets.

### 🛡️ Admin & Operational Portal
- **Executive Command Center**: Live aggregated statistics (total tickets, pending, in progress, critical issues, resolution rate %) calculated directly from MongoDB.
- **Triage & Complaint Management**: Multi-criteria search and server-side filtering by status, category, priority, and assigned department.
- **Operational Workflow Assignment**: Assign complaints to specific campus departments and specialized staff officers.
- **Lifecycle Management**: Structured status transitions (`Submitted` ➔ `Under Review` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`).
- **Resolution Recording**: Submit official resolution reports and timestamps.
- **Department & Staff Directory**: Complete CRUD management for campus divisions and field staff.

### 🔒 Enterprise Security & Auditability
- **Role-Based Access Control (RBAC)**: Strict separation between students and administrative functions.
- **Data Isolation**: Students can never access or query other students' complaints.
- **Audit Trails**: Every status transition, priority change, assignment, and comment automatically creates an immutable history record.
- **Password Security**: Passwords hashed using bcrypt (salt rounds: 10) and omitted from all JSON responses.
- **JWT Authentication**: Signed Bearer token authentication with configurable expiry.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router DOM 6, Lucide Icons, Date-fns, Vanilla CSS Design System |
| **Backend** | Node.js, Express.js, REST API, Multer, Morgan, CORS, Dotenv |
| **Database** | MongoDB Atlas / Local MongoDB, Mongoose ODM *(with in-memory fallback for instant local dev)* |
| **Authentication** | JSON Web Tokens (JWT), BcryptJS |
| **Deployment Ready** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 📁 Project Structure

```
project2/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection & memory fallback
│   │   ├── controllers/
│   │   │   ├── adminController.js      # Aggregated statistics & analytics
│   │   │   ├── authController.js       # Register, login, profile, JWT
│   │   │   ├── complaintController.js  # CRUD, assignment, status, resolution, comments
│   │   │   ├── departmentController.js # Department management
│   │   │   └── staffController.js      # Staff management
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js       # JWT validation & role protection
│   │   │   ├── errorMiddleware.js      # Centralized error handler
│   │   │   └── uploadMiddleware.js     # Multer attachment handler
│   │   ├── models/
│   │   │   ├── Complaint.js            # Complaint ticket schema
│   │   │   ├── ComplaintHistory.js     # Audit trail schema
│   │   │   ├── Counter.js              # Atomic sequential ID generator
│   │   │   ├── Department.js           # College department schema
│   │   │   ├── Staff.js                # Field staff schema
│   │   │   └── User.js                 # Student & Admin schema
│   │   ├── routes/
│   │   │   ├── adminRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   ├── departmentRoutes.js
│   │   │   └── staffRoutes.js
│   │   ├── utils/
│   │   │   ├── generateToken.js        # JWT signer
│   │   │   └── seed.js                 # Demo data seeder
│   │   ├── server.js                   # Express application entry point
│   │   └── test_api.js                 # Automated API test suite
│   ├── uploads/                        # Local file attachment directory
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   │       ├── ConfirmationModal.jsx
│   │   │       ├── EmptyState.jsx
│   │   │       ├── LoadingSpinner.jsx
│   │   │       ├── Modal.jsx
│   │   │       ├── PriorityBadge.jsx
│   │   │       ├── StatCard.jsx
│   │   │       ├── StatusBadge.jsx
│   │   │       └── Timeline.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx
│   │   │   └── PublicLayout.jsx
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   ├── ComplaintDetails.jsx
│   │   │   │   ├── ComplaintsList.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Departments.jsx
│   │   │   │   └── Staff.jsx
│   │   │   ├── public/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── NotFound.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── Unauthorized.jsx
│   │   │   └── student/
│   │   │       ├── ComplaintDetails.jsx
│   │   │       ├── ComplaintsList.jsx
│   │   │       ├── Dashboard.jsx
│   │   │       ├── NewComplaint.jsx
│   │   │       └── Profile.jsx
│   │   ├── services/
│   │   │   ├── adminService.js
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── complaintService.js
│   │   │   ├── departmentService.js
│   │   │   └── staffService.js
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css                   # University Portal Design System
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── .env.example
│   ├── .env
│   └── package.json
│
├── .gitignore
├── specs.md                            # Single Source of Truth
└── README.md
```

---

## ⚡ Quick Start / Local Setup

Follow these steps to run the complete system locally.

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **Git**

---

### 2. Backend Setup

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env` (already configured with development defaults):
   ```bash
   cp .env.example .env
   ```

   **Environment Variables (`backend/.env`):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/college_complaints
   JWT_SECRET=your_secure_jwt_secret_key
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```
   > **Note:** If you don't have MongoDB running locally, the backend automatically starts an in-memory MongoDB instance with pre-seeded demo data on startup!

4. (Optional) Run the database seeder manually:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm start
   ```
   *The server will start on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   **Environment Variables (`frontend/.env`):**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend application will open at `http://localhost:5173`.*

---

## 👤 Demo Accounts & Credentials

For instant evaluation, the login page features one-click demo pills:

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@college.edu` | `Admin@123456` | Full administrative control, statistics, triage, assignment, resolving complaints, managing departments & staff |
| **Student** | `student@college.edu` | `Student@123456` | Submit complaints, upload attachments, track own history, comment, close verified complaints |
| **Student 2** | `priya@college.edu` | `Student@123456` | Student in Electrical Engineering |

---

## 🧪 Automated Testing

An automated verification test script tests all core endpoints and security checks:

```bash
cd backend
node src/test_api.js
```

### Verified Test Cases:
- [x] Health check endpoint (`GET /api/health`)
- [x] Student registration & login (`POST /api/auth/register`, `POST /api/auth/login`)
- [x] Admin login & token issuance (`POST /api/auth/login`)
- [x] Role authorization enforcement (Students blocked with `403 Forbidden` from admin stats)
- [x] Sequential Complaint Number generation (`CMP-YYYY-XXXXXX`)
- [x] Student complaint creation with category and priority
- [x] Chronological audit timeline recording
- [x] Department and Staff assignment
- [x] Admin status transitions (`Submitted` ➔ `Assigned` ➔ `In Progress` ➔ `Resolved`)
- [x] Official resolution recording with timestamp
- [x] Student verified ticket closure
- [x] Live aggregated MongoDB analytics

---

## 📡 REST API Reference

All protected endpoints require the header:  
`Authorization: Bearer <JWT_TOKEN>`

### Authentication
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new student account |
| `POST` | `/api/auth/login` | Public | Login with email and password |
| `GET` | `/api/auth/me` | Private | Get authenticated user profile |
| `PUT` | `/api/auth/profile` | Private | Update profile info or password |

### Complaints
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/complaints` | Student | Create complaint (supports `multipart/form-data`) |
| `GET` | `/api/complaints` | Private | List complaints (Students: own; Admin: all with search & filters) |
| `GET` | `/api/complaints/:id` | Private | Get complaint details and full audit history |
| `PUT` | `/api/complaints/:id` | Private | Update complaint details |
| `DELETE`| `/api/complaints/:id` | Private | Delete complaint (if authorized) |
| `POST` | `/api/complaints/:id/comments` | Private | Add comment / update to ticket |
| `PUT` | `/api/complaints/:id/status` | Admin | Change status (`Submitted`, `Under Review`, `Assigned`, `In Progress`, `Resolved`, `Closed`) |
| `PUT` | `/api/complaints/:id/priority` | Admin | Change priority (`Low`, `Medium`, `High`, `Critical`) |
| `PUT` | `/api/complaints/:id/assignment` | Admin | Assign department & staff officer |
| `PUT` | `/api/complaints/:id/resolution` | Admin | Record resolution notes and mark resolved |
| `PUT` | `/api/complaints/:id/close` | Student/Admin | Close resolved complaint |

### Departments & Staff
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/departments` | Public/Auth | Get all departments |
| `POST` | `/api/departments` | Admin | Create department |
| `PUT` | `/api/departments/:id` | Admin | Update department |
| `DELETE`| `/api/departments/:id` | Admin | Delete department |
| `GET` | `/api/staff` | Private | Get staff list (filter by department) |
| `POST` | `/api/staff` | Admin | Register staff member |
| `PUT` | `/api/staff/:id` | Admin | Update staff member |
| `DELETE`| `/api/staff/:id` | Admin | Delete staff member |

### Admin Analytics
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/statistics` | Admin | Live KPI aggregation from MongoDB |

---

## 🚀 Production Deployment Guide

### 1. Database (MongoDB Atlas)
1. Log in to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 cluster.
3. Under **Database Access**, create a user with read/write privileges.
4. Under **Network Access**, add `0.0.0.0/0` (allow all incoming connections).
5. Obtain the connection string: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/college_complaints?retryWrites=true&w=majority`.

### 2. Backend Deployment (Render)
1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com/), create a new **Web Service**.
3. Connect your repository and configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Add Environment Variables:
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas connection string>`
   - `JWT_SECRET`: `<Your secure random string>`
   - `FRONTEND_URL`: `https://your-frontend.vercel.app`
   - `NODE_ENV`: `production`
5. Deploy and copy your Render service URL (e.g. `https://college-complaint-api.onrender.com`).

### 3. Frontend Deployment (Vercel)
1. In [Vercel](https://vercel.com/), click **Add New Project** and select your GitHub repo.
2. Configure settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. Add Environment Variable:
   - `VITE_API_URL`: `https://college-complaint-api.onrender.com`
4. Deploy the project.
5. In Render, update `FRONTEND_URL` with your final Vercel domain.

---

## 📄 License
This project is licensed under the ISC License.
