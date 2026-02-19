# API Reference

**Base URL:** `http://localhost:5000/api`  
**Content-Type:** `application/json`

All responses follow this shape:
```json
{ "success": true, "data": {}, "message": "...", "count": 0, "total": 0 }
```

---

## 🔐 Roles API  `/api/roles`

### GET /api/roles
List all roles with employee counts.

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "_id": "...",
      "name": "Admin",
      "description": "Full system access",
      "color": "#6366f1",
      "permissions": ["all"],
      "isSystem": true,
      "employeeCount": 1
    }
  ]
}
```

### GET /api/roles/:id
Get a single role with its assigned employees list.

### POST /api/roles
Create a new role.

**Body:**
```json
{
  "name": "Team Lead",
  "description": "Manages a small team",
  "color": "#14b8a6",
  "permissions": ["clients", "policies", "tasks", "employees"]
}
```

**Available permissions:** `all` `clients` `policies` `claims` `reminders` `targets` `reports` `tasks` `employees` `roles`

### PUT /api/roles/:id
Update a role. Cannot change permissions on `isSystem` roles.

### DELETE /api/roles/:id
Delete a role. **Fails** if any employees are assigned to it.

---

## 👤 Employees API  `/api/employees`

### GET /api/employees
List employees. Supports pagination, search, and filters.

**Query params:**
| Param | Type | Example |
|-------|------|---------|
| page | number | 1 |
| limit | number | 20 |
| search | string | "priya" |
| roleId | ObjectId | "..." |
| department | string | "Sales" |
| status | string | "Active" |
| sortBy | string | "-createdAt" |

### GET /api/employees/:id
Get a single employee with role details populated.

### POST /api/employees  ← Register new employee

**Body:**
```json
{
  "name": "Vikram Singh",
  "email": "vikram@company.com",
  "phone": "+91 98765 43299",
  "password": "mypassword",
  "confirmPassword": "mypassword",
  "roleId": "<role-object-id>",
  "department": "Sales",
  "status": "Active"
}
```

**Departments:** `Administration` `Sales` `Operations` `Support` `Finance` `IT`

**Validations:**
- Email must be unique
- Password minimum 6 characters
- Password and confirmPassword must match
- roleId must point to an existing role

### PUT /api/employees/:id
Update employee details. Include `password` + `confirmPassword` only if changing password.

### DELETE /api/employees/:id
Delete employee. **Fails** if they have active (Pending / In Progress) tasks.

### GET /api/employees/stats
Returns breakdown by department and by role.

---

## ✅ Tasks API  `/api/tasks`

### GET /api/tasks
List all tasks.

**Query params:**
| Param | Type | Example |
|-------|------|---------|
| page | number | 1 |
| limit | number | 20 |
| search | string | "LIC renewal" |
| status | string | "Pending" |
| priority | string | "High" |
| category | string | "Renewal" |
| assignedTo | ObjectId | "..." |
| assignedBy | ObjectId | "..." |

**Status values:** `Pending` `In Progress` `Completed` `Transfer Requested` `Cancelled`  
**Priority values:** `Urgent` `High` `Medium` `Low`  
**Category values:** `Renewal` `Claims` `Client` `Reports` `Reminders` `Policies` `Follow-up` `Other`

### GET /api/tasks/:id
Get task with full transfer history and notes populated.

### POST /api/tasks  ← Assign new task

**Body:**
```json
{
  "title": "Follow up with Ajay Verma for LIC renewal",
  "description": "Call client and send payment link",
  "priority": "High",
  "category": "Renewal",
  "assignedTo": "<employee-id>",
  "assignedBy": "<manager-id>",
  "dueDate": "2026-03-15",
  "tags": ["LIC", "Renewal"]
}
```

### PUT /api/tasks/:id
Update task fields.

### PATCH /api/tasks/:id/status
Update task status only.

**Body:**
```json
{ "status": "In Progress" }
```

### POST /api/tasks/:id/transfer  ← Request a transfer

**Body:**
```json
{
  "fromEmployeeId": "<current-assignee-id>",
  "toEmployeeId": "<target-employee-id>",
  "reason": "I have field visit this entire week"
}
```

**Rules:**
- Only the current assignee can request a transfer
- Cannot transfer Completed or Cancelled tasks
- Only one pending transfer allowed at a time
- Target employee must be Active

**Response adds to `transferHistory`:**
```json
{
  "from": { "name": "Sneha Patel", ... },
  "to": { "name": "Rahul Joshi", ... },
  "reason": "Field visit this week",
  "status": "Pending",
  "createdAt": "2026-02-17T..."
}
```

### PATCH /api/tasks/:id/transfer/respond  ← Accept or Decline

**Body:**
```json
{
  "employeeId": "<target-employee-id>",
  "accept": true
}
```

**If `accept: true`:**
- `assignedTo` changes to `employeeId`
- Task `status` → `In Progress`
- Transfer entry `status` → `Accepted`

**If `accept: false`:**
- `assignedTo` stays with original
- Task `status` → `In Progress`
- Transfer entry `status` → `Rejected`

### POST /api/tasks/:id/notes
Add a note to a task.

**Body:**
```json
{
  "text": "Called client, awaiting callback",
  "addedBy": "<employee-id>"
}
```

### DELETE /api/tasks/:id
Delete a task.

### GET /api/tasks/stats
Returns counts by status, priority, overdue count, and transfer count.

### GET /api/tasks/pending-transfers/:employeeId
Returns all tasks that have a pending transfer request addressed TO this employee.

---

## 👥 Clients API  `/api/clients`

### GET /api/clients
Filter by `status`, `clientType`, `priority`. Supports `search` text search.

### POST /api/clients
```json
{
  "name": "Ajay Verma",
  "email": "ajay@example.com",
  "phone": "+91 98765 43210",
  "clientType": "Individual",
  "priority": "High",
  "status": "Active",
  "address": { "city": "Mumbai", "state": "Maharashtra", "pincode": "400001" },
  "assignedAgent": "<employee-id>"
}
```

### GET /api/clients/stats
Returns totals by status and client type.

---

## 📋 Policies API  `/api/policies`

### POST /api/policies
`policyNumber` auto-generated if not provided.

```json
{
  "client": "<client-id>",
  "policyType": "Life Insurance",
  "company": "LIC",
  "planName": "Jeevan Anand",
  "premiumAmount": 50000,
  "premiumFrequency": "Yearly",
  "sumAssured": 1000000,
  "policyTerm": 20,
  "startDate": "2026-01-01",
  "maturityDate": "2046-01-01",
  "renewalDate": "2027-01-01"
}
```

**Companies:** `LIC` `Bajaj` `HDFC` `ICICI` `TATA AIA` `SBI Life` `Max Life` `Other`

### GET /api/policies/renewals/upcoming?days=30
Returns active policies with `renewalDate` in the next N days.

---

## 🏥 Claims API  `/api/claims`

### POST /api/claims
`claimNumber` auto-generated as `CLM-000001`.

```json
{
  "client": "<client-id>",
  "policy": "<policy-id>",
  "claimType": "Medical",
  "claimAmount": 75000,
  "incidentDate": "2026-02-10",
  "description": "Hospitalization for surgery",
  "priority": "High"
}
```

### PATCH /api/claims/:id/status
```json
{ "status": "Approved", "note": "Documents verified and approved" }
```

Adds entry to `statusHistory` array automatically.

**Status flow:** `Pending` → `Under Review` → `Approved` / `Rejected` → `Settled`

---

## 🔔 Reminders API  `/api/reminders`

### POST /api/reminders
```json
{
  "client": "<client-id>",
  "policy": "<policy-id>",
  "reminderType": "Renewal",
  "title": "LIC Policy Renewal Due",
  "dueDate": "2027-01-01",
  "priority": "High",
  "amount": 50000,
  "frequency": "Yearly",
  "assignedAgent": "<employee-id>"
}
```

**Types:** `Renewal` `Premium Due` `Maturity` `Birthday` `Anniversary` `Health Checkup` `Follow-up` `Custom`

### PATCH /api/reminders/:id/complete
Marks reminder as Completed with timestamp.

### PATCH /api/reminders/:id/snooze
Body: `{ "days": 7 }` — snoozes for N days.

---

## 🎯 Targets API  `/api/targets`

### POST /api/targets
```json
{
  "agent": "<employee-id>",
  "targetPeriod": "Quarterly",
  "startDate": "2026-01-01",
  "endDate": "2026-03-31",
  "productType": "Life",
  "targetAmount": 5000000,
  "targetPolicies": 50
}
```

Achievement % auto-calculated on save.

---

## 📊 Reports API  `/api/reports`

### GET /api/reports/dashboard
Returns aggregated stats:
- Employee counts (total / active)
- Total clients & active policies
- Task counts (total / pending / transfers)
- Claims by status
- Team breakdown by role

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / bad request |
| 403 | Forbidden (e.g. system role) |
| 404 | Not found |
| 429 | Rate limit exceeded |
| 500 | Server error |

---

## Pagination Response Shape

```json
{
  "success": true,
  "count": 10,
  "total": 47,
  "totalPages": 5,
  "currentPage": 1,
  "data": [...]
}
```
