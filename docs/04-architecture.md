# Architecture & Database Schema

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   BROWSER (React 18)                     │
│  Dashboard | Employees | Roles | Tasks                   │
│  React Router + Axios + Tailwind CSS                     │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP REST (JSON)
                     │ http://localhost:3000 → proxy → :5000
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Node.js / Express  (port 5000)              │
│                                                          │
│  Middleware: Helmet | CORS | Rate Limit | Morgan         │
│                                                          │
│  Routes                                                  │
│  /api/roles      → roleController                        │
│  /api/employees  → employeeController                    │
│  /api/tasks      → taskController                        │
│  /api/clients    → clientController                      │
│  /api/policies   → policyController                      │
│  /api/claims     → claimController                       │
│  /api/reminders  → reminderController                    │
│  /api/targets    → targetController                      │
│  /api/reports    → reportController (dashboard)          │
└────────────────────┬────────────────────────────────────┘
                     │ Mongoose ODM
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    MongoDB                               │
│  Collections: roles  employees  tasks                   │
│               clients  policies  claims                 │
│               reminders  targets                        │
└─────────────────────────────────────────────────────────┘
```

---

## Database Collections

### `roles`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `name` | String (unique) | Role name e.g. "Manager" |
| `description` | String | Human-readable description |
| `color` | String | Hex color for UI (#6366f1) |
| `permissions` | String[] | Array of permission strings |
| `isSystem` | Boolean | True = cannot be deleted |
| `createdAt` | Date | Auto timestamp |
| `updatedAt` | Date | Auto timestamp |

**Indexes:** `name` (unique)

---

### `employees`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `name` | String | Full name |
| `email` | String (unique) | Login email |
| `password` | String | bcrypt hash (hidden in API) |
| `phone` | String | Contact number |
| `avatar` | String | Auto-generated initials e.g. "PM" |
| `roleId` | ObjectId → Role | Assigned role |
| `department` | String enum | Sales / Operations / etc. |
| `status` | String enum | Active / Inactive |
| `joinDate` | Date | When they joined |
| `activeTasks` | Number | Auto-synced count |
| `completedTasks` | Number | Auto-synced count |
| `createdAt` | Date | Auto timestamp |

**Indexes:** `email` (unique), `roleId + status` (compound), `name + email` (text search)

**Hooks:** `pre('save')` hashes password and generates avatar initials

---

### `tasks`

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Primary key |
| `title` | String | Task title |
| `description` | String | Detailed instructions |
| `priority` | String enum | Urgent / High / Medium / Low |
| `status` | String enum | Pending / In Progress / Completed / Transfer Requested / Cancelled |
| `category` | String enum | Renewal / Claims / Client / etc. |
| `assignedTo` | ObjectId → Employee | Current assignee |
| `assignedBy` | ObjectId → Employee | Creator |
| `dueDate` | Date | Deadline |
| `completedAt` | Date | Set when Completed |
| `tags` | String[] | Labels e.g. ["LIC","Renewal"] |
| `transferHistory` | Array | See below |
| `notes` | Array | See below |
| `createdAt` | Date | Auto timestamp |

#### `transferHistory` subdocument

| Field | Type | Description |
|-------|------|-------------|
| `from` | ObjectId → Employee | Who requested |
| `to` | ObjectId → Employee | Requested recipient |
| `reason` | String | Explanation |
| `status` | String enum | Pending / Accepted / Rejected |
| `respondedAt` | Date | When the response was given |
| `createdAt` | Date | When the request was made |

#### `notes` subdocument

| Field | Type |
|-------|------|
| `text` | String |
| `addedBy` | ObjectId → Employee |
| `addedAt` | Date |

**Indexes:** `assignedTo + status`, `dueDate + status`, `title` (text)

**Virtual:** `isOverdue` (boolean) — true if dueDate < now and not Completed/Cancelled

**Hooks:** `post('save')` auto-syncs `activeTasks` and `completedTasks` counters on the employee

---

### `clients`

| Field | Type |
|-------|------|
| `name` | String (required) |
| `email` | String |
| `phone` | String (required) |
| `dateOfBirth` | Date |
| `address` | { street, city, state, pincode, country } |
| `clientType` | Individual / Corporate |
| `priority` | Low / Medium / High |
| `status` | Active / Inactive / Prospect |
| `assignedAgent` | ObjectId → Employee |
| `totalPolicies` | Number |
| `totalPremium` | Number |

---

### `policies`

| Field | Type |
|-------|------|
| `client` | ObjectId → Client |
| `policyNumber` | String (unique, auto-gen) |
| `policyType` | Life Insurance / Health / Motor / etc. |
| `company` | LIC / Bajaj / HDFC / etc. |
| `planName` | String |
| `premiumAmount` | Number |
| `premiumFrequency` | Monthly / Quarterly / Yearly / etc. |
| `sumAssured` | Number |
| `policyTerm` | Number (years) |
| `startDate`, `maturityDate`, `renewalDate` | Date |
| `status` | Active / Lapsed / Matured / Surrendered |
| `paymentStatus` | Paid / Pending / Overdue |
| `nominees` | [{ name, relationship, share }] |
| `assignedAgent` | ObjectId → Employee |

---

### `claims`

| Field | Type |
|-------|------|
| `client` | ObjectId → Client |
| `policy` | ObjectId → Policy |
| `claimNumber` | String (auto: CLM-000001) |
| `claimType` | Death / Medical / Accident / etc. |
| `claimAmount` | Number |
| `approvedAmount` | Number |
| `claimDate` | Date |
| `incidentDate` | Date |
| `status` | Pending / Under Review / Approved / Rejected / Settled |
| `priority` | Low / Medium / High / Urgent |
| `statusHistory` | [{ status, date, note }] |
| `settlementDate` | Date |

---

### `reminders`

| Field | Type |
|-------|------|
| `client` | ObjectId → Client |
| `policy` | ObjectId → Policy |
| `reminderType` | Renewal / Birthday / Premium Due / etc. |
| `title` | String |
| `dueDate` | Date |
| `priority` | Low / Medium / High |
| `status` | Pending / Completed / Snoozed / Cancelled |
| `frequency` | One-Time / Weekly / Monthly / Yearly |
| `amount` | Number |
| `assignedAgent` | ObjectId → Employee |
| `snoozeUntil` | Date |

---

### `targets`

| Field | Type |
|-------|------|
| `agent` | ObjectId → Employee |
| `targetPeriod` | Monthly / Quarterly / Half-Yearly / Yearly |
| `startDate`, `endDate` | Date |
| `productType` | Life / General / Health / All |
| `targetAmount` | Number |
| `achievedAmount` | Number |
| `targetPolicies` | Number |
| `achievedPolicies` | Number |
| `achievementPercentage` | Number (auto-calculated) |
| `status` | Active / Completed / Expired |

---

## Entity Relationships

```
Role ◄────────── Employee ──────────────┐
                    │                   │
                    │ assignedBy        │ assignedTo
                    ▼                   ▼
              Task.transferHistory   Task
              ├── from → Employee
              └── to   → Employee

Client ◄─── Policy ◄─── Claim
   └─────────────────── Reminder
   └─── (assignedAgent) Employee

Employee ◄── Target
```

---

## Transfer Workflow State Machine

```
                ┌──────────────────────────────────┐
                │          TASK LIFECYCLE           │
                └──────────────────────────────────┘

  [Created]
      │
      ▼
  [Pending] ──── employee starts ────► [In Progress]
      │                                      │
      │                               employee transfers
      │                                      │
      │                                      ▼
      │                          [Transfer Requested]
      │                               │       │
      │                          accept   decline
      │                               │       │
      │                               ▼       ▼
      │                    [In Progress]   [In Progress]
      │                    (new owner)     (original owner)
      │                               │
      │                        employee completes
      │                               │
      └───────────────────────────────▼
                              [Completed]
```

---

## Security Architecture

```
Request → Helmet (headers) → CORS check → Rate Limiter → Route Handler
                                                              │
                                                      Input Validation
                                                              │
                                                      Mongoose Model
                                                              │
                                               Pre-save hooks (bcrypt, avatar)
                                                              │
                                                         MongoDB
                                                              │
                                                       Response ←
```

**Password hashing:** bcrypt with 10 salt rounds  
**Rate limiting:** 100 requests per 15 minutes per IP  
**CORS:** Restricted to `FRONTEND_URL` env variable  
**JWT:** Structure in place — add auth middleware to protect routes in production
