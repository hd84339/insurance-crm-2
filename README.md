# 🏦 Insurance & Mutual Fund CRM — Complete System v2.0

A full-stack CRM system for insurance agents and brokers with **Employee Registration**, **Role & Permission Management**, and **Task Management with Transfer Workflow**.

---

## 📦 Project Structure

```
insurance-crm-complete/
├── backend/              ← Node.js + Express REST API
├── frontend/             ← React + Vite + Tailwind CSS
├── database/             ← MongoDB setup scripts
└── docs/                 ← Full documentation
```

---

## ✨ Key Features

### 👥 Employee Registration & Management
- Register employees with name, email, phone, department, password
- Assign roles during registration with live permission preview
- Edit employee details & change roles
- Prevent deletion of employees with active tasks
- Search & filter by role, department, status

### 🔐 Roles & Permissions
- Create custom roles with color-coded visual identity
- 10 granular permissions: `clients` `policies` `claims` `reminders` `targets` `reports` `tasks` `employees` `roles` `all`
- System roles (Admin) are protected from deletion
- Live employee count per role
- Full CRUD for roles

### ✅ Task Management with Transfer Workflow
- Admin/Manager assigns tasks with priority, category, due date, tags
- Employee views their tasks → starts → completes
- **Transfer Request:** Employee can request to transfer a task to a colleague with a reason
- **Accept / Decline:** Target employee is notified and must explicitly accept or reject
- Full **transfer history** stored on every task with timestamps & statuses
- Overdue detection, status badges, multi-filter view

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)
- npm

### Step 1 — Database

**Option A: MongoDB Atlas (recommended)**
1. Sign up at https://www.mongodb.com/cloud/atlas
2. Create free M0 cluster
3. Get connection string
4. Use it in backend `.env`

**Option B: Local MongoDB**
```bash
# Linux
sudo systemctl start mongod

# macOS
brew services start mongodb-community

# Run setup script
cd database/scripts
mongosh < setup.js
```

### Step 2 — Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI
npm run dev           # starts on http://localhost:5000
npm run seed          # loads sample data (optional)
```

### Step 3 — Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev           # starts on http://localhost:3000
```

### Step 4 — Open Browser
Go to **http://localhost:3000**

---

## 🔑 Default Login (after seeding)

| Field    | Value            |
|----------|------------------|
| Email    | arun@crm.com     |
| Password | password123      |
| Role     | Admin            |

Other seeded employees use the same password `password123`.

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:5000/api`

### Roles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/roles` | List all roles with employee counts |
| GET    | `/roles/:id` | Get role + assigned employees |
| POST   | `/roles` | Create new role |
| PUT    | `/roles/:id` | Update role |
| DELETE | `/roles/:id` | Delete role (fails if employees assigned) |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/employees` | List all employees (paginated, filterable) |
| GET    | `/employees/:id` | Get single employee |
| POST   | `/employees` | Register new employee |
| PUT    | `/employees/:id` | Update employee |
| DELETE | `/employees/:id` | Delete employee |
| GET    | `/employees/stats` | Department & role breakdown |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/tasks` | List all tasks |
| GET    | `/tasks/:id` | Get task detail |
| POST   | `/tasks` | Assign new task |
| PUT    | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |
| PATCH  | `/tasks/:id/status` | Update task status |
| POST   | `/tasks/:id/transfer` | Request task transfer |
| PATCH  | `/tasks/:id/transfer/respond` | Accept or decline transfer |
| POST   | `/tasks/:id/notes` | Add a note |
| GET    | `/tasks/stats` | Task statistics |
| GET    | `/tasks/pending-transfers/:empId` | Get transfers awaiting employee response |

---

## 📝 Sample API Requests

### Register Employee
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vikram Singh",
    "email": "vikram@crm.com",
    "phone": "+91 98765 43299",
    "password": "password123",
    "confirmPassword": "password123",
    "roleId": "<role-id-from-db>",
    "department": "Sales",
    "status": "Active"
  }'
```

### Create Role
```bash
curl -X POST http://localhost:5000/api/roles \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Team Lead",
    "description": "Leads a small team",
    "color": "#14b8a6",
    "permissions": ["clients","policies","tasks","employees"]
  }'
```

### Assign Task
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Follow up with ABC client for renewal",
    "description": "Client renewal due in 7 days",
    "priority": "High",
    "category": "Renewal",
    "assignedTo": "<employee-id>",
    "assignedBy": "<manager-id>",
    "dueDate": "2026-03-01",
    "tags": ["LIC","Renewal"]
  }'
```

### Request Transfer
```bash
curl -X POST http://localhost:5000/api/tasks/<task-id>/transfer \
  -H "Content-Type: application/json" \
  -d '{
    "fromEmployeeId": "<current-assignee-id>",
    "toEmployeeId": "<target-employee-id>",
    "reason": "I have field duty this week"
  }'
```

### Respond to Transfer
```bash
curl -X PATCH http://localhost:5000/api/tasks/<task-id>/transfer/respond \
  -H "Content-Type: application/json" \
  -d '{
    "employeeId": "<target-employee-id>",
    "accept": true
  }'
```

---

## 🏗️ Architecture

```
Browser (React)
    │
    │  HTTP / REST
    ▼
Express.js Server (Node.js :5000)
    │
    ├── /api/roles     → RoleController
    ├── /api/employees → EmployeeController
    └── /api/tasks     → TaskController
                │
                ▼
           MongoDB
     ┌─────┬──────┬───────┐
     │roles│emps  │tasks  │
     └─────┴──────┴───────┘
```

### Models & Relationships

```
Role
 └─ has many → Employee (roleId)

Employee
 ├─ assigned to → Task (assignedTo)
 ├─ created     → Task (assignedBy)
 └─ transfers   → Task.transferHistory (from / to)

Task
 ├─ assignedTo → Employee
 ├─ assignedBy → Employee
 └─ transferHistory[]
      ├─ from  → Employee
      ├─ to    → Employee
      ├─ reason: string
      └─ status: Pending | Accepted | Rejected
```

### Task Transfer Flow

```
Employee A (assignee)
    │ clicks "Transfer"
    │ selects Employee B + reason
    ▼
POST /tasks/:id/transfer
    → status: "Transfer Requested"
    → transferHistory entry: { from: A, to: B, status: "Pending" }

Employee B sees notification
    │ clicks "Accept" or "Decline"
    ▼
PATCH /tasks/:id/transfer/respond
    Accept: → assignedTo = B, status = "In Progress"
    Decline: → stays with A, status = "In Progress"
    → transferHistory entry updated: status = "Accepted" | "Rejected"
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (salt rounds: 10)
- **JWT** ready (token middleware in place)
- **Helmet** for security headers
- **CORS** configured for frontend URL
- **Rate limiting**: 100 req/15min per IP
- Input validation on all create/update endpoints
- System roles protected from deletion
- Cannot delete employees with active tasks

---

## 🗃️ Environment Variables

### Backend `.env`
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/insurance-crm
JWT_SECRET=change-this-to-random-string-in-production
JWT_EXPIRE=7d
FRONTEND_URL=http://localhost:3000
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Insurance CRM
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js    | 18+     | Runtime |
| Express.js | 4.18    | Web framework |
| MongoDB    | 4.4+    | Database |
| Mongoose   | 8.x     | ODM |
| bcryptjs   | 2.4     | Password hashing |
| JWT        | 9.x     | Authentication |
| Helmet     | 7.x     | Security headers |
| CORS       | 2.8     | Cross-origin |
| Morgan     | 1.10    | HTTP logging |
| ExcelJS    | 4.4     | Excel export |
| PDFKit     | 0.13    | PDF export |

### Frontend
| Technology    | Version | Purpose |
|---------------|---------|---------|
| React         | 18.2    | UI library |
| React Router  | 6.20    | Client routing |
| Vite          | 5.0     | Build tool |
| Tailwind CSS  | 3.3     | Styling |
| Axios         | 1.6     | HTTP client |
| React Hot Toast | 2.4   | Notifications |
| Lucide React  | 0.263   | Icons |
| Recharts      | 2.10    | Charts |

---

## 🚢 Production Deployment

### Backend (PM2)
```bash
npm install -g pm2
cd backend
npm install --production
cp .env.example .env
# Set NODE_ENV=production and real MONGODB_URI
pm2 start src/server.js --name insurance-crm-api
pm2 save && pm2 startup
```

### Frontend (Vercel / Netlify)
```bash
cd frontend
npm run build         # creates dist/ folder
# Deploy dist/ to Vercel, Netlify, or any static host
```

### Docker (Optional)
```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 5000
CMD ["node","src/server.js"]
```

```bash
docker build -t insurance-crm-backend ./backend
docker run -p 5000:5000 --env-file .env insurance-crm-backend
```

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| `Cannot connect to MongoDB` | Check mongod is running, verify MONGODB_URI |
| `Email already registered` | Use unique email for each employee |
| `Cannot delete role` | Reassign all employees first |
| `Cannot delete employee` | Complete or reassign their active tasks |
| `Transfer already pending` | Only one pending transfer allowed per task |
| Frontend blank page | Check VITE_API_URL, ensure backend is running |
| CORS errors | Set FRONTEND_URL in backend .env |
| Port in use | Change PORT in .env |

---

## 📋 Changelog

### v2.0.0 (February 2026)
- ✅ Added Employee Registration with role assignment
- ✅ Added Roles & Permissions management (10 permission types)
- ✅ Added Task Management with full transfer workflow
- ✅ Transfer Accept/Decline notification system
- ✅ Task history tracking
- ✅ Seed script for sample data
- ✅ Overdue task detection
- ✅ Employee task counter sync

### v1.0.0
- ✅ Client, Policy, Claims, Reminders, Targets, Reports APIs
- ✅ React frontend wireframe
- ✅ MongoDB models and indexes

---

## 📄 License
ISC — Free for personal and commercial use.

---

**Built with ❤️ for Insurance Professionals**
#   i n s u r a n c e - c r m - 2  
 