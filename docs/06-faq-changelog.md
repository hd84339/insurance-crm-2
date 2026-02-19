# FAQ & Changelog

---

## Frequently Asked Questions

### General

**Q: Can multiple employees log in at the same time?**  
Yes. The system is stateless — each API request is independent. Multiple users can use it simultaneously without conflict.

**Q: Is internet required?**  
For MongoDB Atlas (cloud), yes. For local MongoDB, the app runs fully offline.

**Q: Can I add more insurance companies to the dropdown?**  
Yes. Edit `backend/src/models/OtherModels.js`, find the `company` field enum, and add your company. Restart the server.

**Q: How do I change the app name or branding?**  
- Frontend title: `frontend/index.html` → `<title>` tag
- Sidebar name: `frontend/src/App.jsx` → search "Insurance" in the Layout section
- API welcome: `backend/src/server.js` → root GET handler

---

### Roles & Employees

**Q: Why can't I delete a role?**  
The role still has employees assigned to it. Go to Employees, change those employees to a different role, then retry.

**Q: Why can't I delete an employee?**  
The employee has active tasks (Pending or In Progress). Complete, reassign, or cancel those tasks first.

**Q: Can an employee have multiple roles?**  
No. Each employee has exactly one role. This is intentional for clear permission boundaries.

**Q: What does the "isSystem" flag mean on roles?**  
System roles (like Admin) are seeded on first setup and cannot be deleted. Their permissions are also protected from changes via the API.

**Q: Can I change a role's color after creating it?**  
Yes. Click the edit button on the role card, change the color, and save.

---

### Tasks

**Q: Who can assign tasks?**  
Any active employee can assign tasks via the API. In a real deployment, you'd protect this endpoint with an auth middleware check for `Manager` or `Admin` roles.

**Q: Can a task be transferred multiple times?**  
Yes. Each transfer creates a new entry in `transferHistory`. However, only one transfer can be **pending** at a time.

**Q: What happens if the target employee declines a transfer?**  
The task stays with the original employee. The task status returns to "In Progress" and the decline is recorded in the transfer history.

**Q: Can I set recurring tasks?**  
Not yet — tasks are one-time. For recurring work (like monthly reports), create a new task each period. Recurring task support is a planned future feature.

**Q: Is there a limit on how many tasks one employee can have?**  
No hard limit. The `activeTasks` counter on each employee profile shows their current workload.

**Q: Can tasks be linked to specific clients or policies?**  
Yes. The Task model has `relatedClient`, `relatedPolicy`, and `relatedClaim` ObjectId fields. These are available via the API but not yet shown in the frontend UI.

---

### Technical

**Q: How are passwords stored?**  
All passwords are hashed using bcrypt with 10 salt rounds. Plain-text passwords are never stored or logged.

**Q: Is JWT authentication fully implemented?**  
The structure is in place (JWT package installed, login endpoint ready). In the current version, routes are open for development ease. Add auth middleware to protect routes before going to production.

**Q: How do I add a new department option?**  
Edit the `department` enum in `backend/src/models/Employee.js` and `frontend/src/App.jsx` (look for the `DEPARTMENTS` array).

**Q: Can I use PostgreSQL instead of MongoDB?**  
Not without significant refactoring. The system is designed around MongoDB's document model, especially for the nested `transferHistory` array in tasks.

**Q: How do I add email notifications for task assignments?**  
Install `nodemailer`, configure SMTP in `.env`, and call a send function in `taskController.js` after creating or transferring a task.

---

## Changelog

### v2.0.0 — February 2026
**New Features:**
- ✅ Employee Registration with full form validation
- ✅ Role & Permission management (10 permission types, custom colors)
- ✅ Task Management system — assign, start, complete tasks
- ✅ Task Transfer Workflow — request, accept, decline with full history
- ✅ Pending transfer badge counter in sidebar navigation
- ✅ Overdue task detection and visual indicator
- ✅ Employee task counter sync (activeTasks, completedTasks)
- ✅ Database seed script with sample data
- ✅ Dashboard aggregates employee, task, and claim stats
- ✅ System role protection (Admin cannot be deleted/modified)
- ✅ Employee deletion guard (blocks if active tasks exist)
- ✅ Role deletion guard (blocks if employees assigned)

**Improvements:**
- Unified API error format with `success: false`
- Rate limiting on all `/api/` routes
- Helmet security headers
- Compression middleware
- Mongoose post-save hooks for employee task counter sync

### v1.0.0 — January 2026
**Initial Release:**
- Client, Policy, Claim, Reminder, Target, Report APIs
- React frontend with Dashboard wireframe
- MongoDB models and indexes
- Excel/PDF export capability
- Postman collection
