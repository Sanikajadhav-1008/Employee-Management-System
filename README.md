# Employee Management System — Upgraded

A full-stack Employee Management System with React frontend and Node.js/Express + MySQL backend.

---

## Features

### Admin Portal
- **Dashboard** — Stats overview (employees, attendance, payroll, leave summary)
- **Employee Management** — Add, Edit, Delete, View with search & filter
- **Attendance Management** — Daily attendance tracking, mark present/absent/late/on-leave
- **Leave Management** — Approve/reject leave requests with status tracking
- **Payroll Management** — Monthly salary breakdown, edit allowances, mark paid

### Employee Portal
- **My Profile** — View & edit personal/work information, quick stats
- **My Attendance** — Daily attendance records, attendance %, progress bar
- **My Leaves** — Apply for leave, track history, view balance by leave type
- **Salary History** — Monthly payslip breakdown, net pay calculator

---

## Tech Stack

| Layer     | Technology                                          |
|-----------|-----------------------------------------------------|
| Frontend  | React 18 + Vite, React Router DOM v6, Bootstrap 5, Axios |
| Backend   | Node.js, Express.js (ESM)                           |
| Database  | MySQL 8+                                            |
| Auth      | JWT (jsonwebtoken) + bcryptjs                       |
| File upload | Multer (employee photos)                          |

---

## Quick Start

### 1. Database Setup

```bash
mysql -u root -p < Back_End/database.sql
```

This creates the `employee_ms` database, all tables, and a default admin account:
- **Email:** `admin@ems.com`
- **Password:** `admin123`

### 2. Backend

```bash
cd Back_End
cp .env.example .env          # then edit DB_PASS and JWT_SECRET
npm install
npm run dev                   # runs on http://localhost:5000
```

### 3. Frontend

```bash
cd Front_End
npm install
npm run dev                   # runs on http://localhost:5173
```

---

## API Reference

### Auth (Admin)
| Method | Endpoint               | Description      |
|--------|------------------------|------------------|
| POST   | /auth/adminlogin       | Admin login      |
| GET    | /auth/logout           | Admin logout     |
| GET    | /auth/verify           | Verify JWT token |

### Employees (Admin)
| Method | Endpoint                  | Description                |
|--------|---------------------------|----------------------------|
| GET    | /auth/employee            | List all employees         |
| GET    | /auth/employee/:id        | Get employee by ID         |
| POST   | /auth/add_employee        | Add new employee (+ photo) |
| PUT    | /auth/edit_employee/:id   | Update employee            |
| DELETE | /auth/delete_employee/:id | Delete employee            |

### Dashboard Stats (Admin)
| Method | Endpoint             | Description           |
|--------|----------------------|-----------------------|
| GET    | /auth/employee_count | Total employee count  |
| GET    | /auth/salary_count   | Total monthly payroll |

### Attendance (Admin)
| Method | Endpoint             | Description                       |
|--------|----------------------|-----------------------------------|
| GET    | /auth/attendance     | List attendance (optional ?date=) |
| POST   | /auth/attendance     | Create/update attendance record   |
| PUT    | /auth/attendance/:id | Update attendance status          |

### Leaves (Admin)
| Method | Endpoint         | Description                    |
|--------|------------------|--------------------------------|
| GET    | /auth/leaves     | List leaves (optional ?status=)|
| PUT    | /auth/leaves/:id | Approve / Reject a leave       |

### Payroll (Admin)
| Method | Endpoint           | Description                   |
|--------|--------------------|-------------------------------|
| GET    | /auth/payroll      | List payroll (optional ?month=)|
| POST   | /auth/payroll      | Generate/update payroll record|
| PUT    | /auth/payroll/:id  | Edit salary or mark as Paid   |

### Employee Portal
| Method | Endpoint                     | Description           |
|--------|------------------------------|-----------------------|
| POST   | /employee/employee_login     | Employee login        |
| GET    | /employee/logout             | Employee logout       |
| GET    | /employee/detail/:id         | Get own profile       |
| PUT    | /employee/update_profile/:id | Update phone/address  |
| GET    | /employee/attendance/:id     | My attendance history |
| GET    | /employee/leaves/:id         | My leave history      |
| POST   | /employee/apply_leave        | Apply for a leave     |
| GET    | /employee/salary/:id         | My salary history     |

---

## Project Structure

```
ems/
├── Back_End/
│   ├── index.js              # Express app entry point
│   ├── package.json
│   ├── .env.example          # Copy to .env and fill in values
│   ├── database.sql          # Run once to set up MySQL tables
│   ├── db/
│   │   └── connection.js     # MySQL connection pool
│   ├── middleware/
│   │   ├── auth.js           # JWT verify middleware
│   │   └── upload.js         # Multer image upload config
│   ├── routes/
│   │   ├── adminRoute.js     # All /auth/* endpoints
│   │   └── employeeRoute.js  # All /employee/* endpoints
│   └── Public/
│       └── Images/           # Uploaded employee photos
└── Front_End/
    ├── src/
    │   ├── Admin/Components/ # Admin portal pages
    │   ├── Employee/         # Employee portal pages
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```
