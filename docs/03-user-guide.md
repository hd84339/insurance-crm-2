# User Guide

## Dashboard

The dashboard gives you an instant overview of your business:

- **Total Employees** — headcount with active/inactive breakdown
- **Total Roles** — number of permission groups configured
- **Pending Tasks** — tasks awaiting action
- **In Progress** — tasks being actively worked
- **Completed** — tasks finished
- **Transfers** — tasks currently awaiting transfer acceptance

The **Recent Tasks** panel shows the 5 most recent tasks with assignee, due date, and priority.  
The **Team Overview** panel shows how many employees belong to each role.

---

## Roles & Permissions

### What is a Role?
A role is a named set of permissions assigned to employees. Every employee must have exactly one role. Roles determine what sections of the system an employee can access.

### Available Permissions

| Permission | What it allows |
|------------|----------------|
| `all` | Full access to everything (Admin only) |
| `clients` | View and manage client records |
| `policies` | View and manage insurance policies |
| `claims` | View and process claims |
| `reminders` | View and manage reminders |
| `targets` | View and manage performance targets |
| `reports` | Generate and view reports |
| `tasks` | View and manage tasks |
| `employees` | Register and manage employees |
| `roles` | Create and modify roles |

### Creating a Role

1. Navigate to **Roles & Permissions** in the sidebar
2. Click **Create Role**
3. Enter a **Role Name** (e.g. "Team Lead")
4. Add a **Description** (optional but helpful)
5. Pick a **Color** to visually identify this role
6. Toggle on the **Permissions** this role should have
7. Click **Create Role**

### Editing a Role

Click the pencil icon on any role card. All fields including permissions can be changed.  
> ⚠️ **System roles** (Admin) have protected permissions that cannot be changed.

### Deleting a Role

Click the red delete icon. This will **fail** if any employees are currently assigned to that role — you must reassign those employees to another role first.

---

## Employee Registration

### Registering a New Employee

1. Navigate to **Employees** in the sidebar
2. Click **Register Employee**
3. Fill in the form:
   - **Full Name** *(required)*
   - **Email Address** *(required, must be unique)*
   - **Phone Number** *(required)*
   - **Department** — Administration, Sales, Operations, Support, Finance, IT
   - **Assign Role** *(required)* — choose from existing roles
   - **Status** — Active or Inactive
   - **Password** *(required, min 6 chars)*
   - **Confirm Password** *(must match)*
4. A **Role Preview** box appears showing the selected role's color, description, and permissions
5. Click **Register Employee**

### Editing an Employee

Click the pencil icon on any row. You can change all fields. Leave password blank to keep the existing password.

### Employee Status

- **Active** — can be assigned tasks, appears in assignment dropdowns
- **Inactive** — cannot be assigned new tasks, hidden from assignment

### Deleting an Employee

Employees with active tasks (**Pending** or **In Progress**) cannot be deleted. First complete, reassign, or cancel their tasks, then delete.

---

## Task Management

### How Tasks Work

1. An **Admin or Manager** creates a task and assigns it to an active employee
2. The assigned employee sees it in **My Tasks** tab
3. The employee can:
   - Click **Start Task** to move it to *In Progress*
   - Click **Complete** when done
   - Click **Transfer** to request reassignment

### Creating a Task

1. Navigate to **Task Management**
2. Click **Assign Task**
3. Fill in:
   - **Task Title** *(required)*
   - **Description** — detailed instructions for the employee
   - **Assign To** — select from active employees
   - **Priority** — Urgent, High, Medium, Low
   - **Category** — Renewal, Claims, Client, Reports, etc.
   - **Due Date** *(required)*
   - **Tags** — comma-separated labels (e.g. "LIC, Renewal")
4. Click **Assign Task** — the employee is immediately notified

### Task Status Flow

```
Pending  →  In Progress  →  Completed
                ↓
         Transfer Requested
                ↓
         (other employee accepts)
                ↓
           In Progress (new owner)
```

### Filtering Tasks

Use the filter bar at the top of the Task Management page:
- **Search** — keyword search in title and description
- **Status filter** — All, Pending, In Progress, Completed, Transfer Requested
- **Priority filter** — All, Urgent, High, Medium, Low
- **Assignee filter** — filter by specific employee

### Tabs

| Tab | Shows |
|-----|-------|
| All Tasks | Every task in the system |
| My Tasks | Tasks assigned to you (logged-in user) |
| Transfers | Pending transfer requests addressed to you |

---

## Transfer Workflow (Step by Step)

### As the Assigned Employee (requesting transfer)

1. Find your task in **My Tasks** or **All Tasks**
2. Click the yellow **Transfer** button
3. A modal opens — select the **employee to transfer to**
4. Write a **reason** (e.g. "Field visit this week" or "Outside my expertise")
5. Click **Send Transfer Request**
6. Task status changes to **Transfer Requested**
7. The target employee receives a notification badge in the sidebar

### As the Target Employee (responding to transfer)

1. You see a badge on the **Task Management** nav item
2. A yellow alert banner appears at the top of the task list
3. Click **View Transfers** tab or go directly to the Transfers tab
4. Find the task with the transfer request
5. Read the reason from the requesting employee
6. Click **Accept Transfer** — task is now yours, status becomes *In Progress*
7. OR click **Decline** — task stays with the original employee, status reverts to *In Progress*

### Transfer History

Every task keeps a permanent record of all transfer events:
- Who requested (From → To)
- Date & time
- Reason
- Final status (Pending / Accepted / Rejected)

This history is visible in the task detail view (click the eye icon).

---

## Tips & Best Practices

### For Administrators
- Create roles before registering employees
- Use descriptive role names that clearly indicate access level
- Keep "Admin" role limited to 1–2 people
- Review pending transfers daily via the badge counter

### For Managers
- Set realistic due dates — overdue tasks show a red badge
- Add tags like "LIC", "Urgent", "Client Name" for easy filtering
- Use the category field to group related tasks
- Check the All Tasks view regularly to spot bottlenecks

### For Agents
- Check **My Tasks** first thing each day
- Mark tasks as *In Progress* when you start working on them
- If you need to transfer, do it early — don't wait until the due date
- Add notes to tasks for important updates or context

---

## Notifications & Badges

| Badge Location | Meaning |
|----------------|---------|
| Sidebar → Task Management (red number) | You have pending transfer requests to accept/decline |
| Yellow banner on task page | Quick reminder of pending transfers with a "View Transfers" button |
| Red "Overdue" badge on task card | Task is past its due date and not yet completed |
