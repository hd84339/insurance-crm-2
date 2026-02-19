import { useState, useEffect } from "react";

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
const INITIAL_ROLES = [
  { id: "r1", name: "Admin", color: "#6366f1", permissions: ["all"], description: "Full system access", employeeCount: 1 },
  { id: "r2", name: "Manager", color: "#f59e0b", permissions: ["clients","policies","claims","reminders","targets","reports","tasks"], description: "Team management & reports", employeeCount: 2 },
  { id: "r3", name: "Senior Agent", color: "#10b981", permissions: ["clients","policies","claims","reminders","tasks"], description: "Senior field operations", employeeCount: 3 },
  { id: "r4", name: "Agent", color: "#3b82f6", permissions: ["clients","policies","reminders","tasks"], description: "Field agent operations", employeeCount: 5 },
  { id: "r5", name: "Trainee", color: "#ec4899", permissions: ["clients","reminders"], description: "Limited read-only access", employeeCount: 2 },
];

const INITIAL_EMPLOYEES = [
  { id: "e1", name: "Arun Sharma", email: "arun@crm.com", phone: "+91 98765 43210", roleId: "r1", department: "Administration", status: "Active", joinDate: "2022-01-15", avatar: "AS", tasks: 0, completedTasks: 12 },
  { id: "e2", name: "Priya Mehta", email: "priya@crm.com", phone: "+91 98765 43211", roleId: "r2", department: "Sales", status: "Active", joinDate: "2022-03-20", avatar: "PM", tasks: 3, completedTasks: 28 },
  { id: "e3", name: "Vivek Kumar", email: "vivek@crm.com", phone: "+91 98765 43212", roleId: "r3", department: "Sales", status: "Active", joinDate: "2022-06-10", avatar: "VK", tasks: 2, completedTasks: 41 },
  { id: "e4", name: "Sneha Patel", email: "sneha@crm.com", phone: "+91 98765 43213", roleId: "r4", department: "Operations", status: "Active", joinDate: "2023-01-05", avatar: "SP", tasks: 4, completedTasks: 19 },
  { id: "e5", name: "Rahul Joshi", email: "rahul@crm.com", phone: "+91 98765 43214", roleId: "r4", department: "Sales", status: "Active", joinDate: "2023-04-15", avatar: "RJ", tasks: 1, completedTasks: 15 },
  { id: "e6", name: "Anita Desai", email: "anita@crm.com", phone: "+91 98765 43215", roleId: "r5", department: "Support", status: "Inactive", joinDate: "2023-08-01", avatar: "AD", tasks: 0, completedTasks: 4 },
];

const INITIAL_TASKS = [
  { id: "t1", title: "Follow up with Ajay Verma for LIC renewal", description: "Client renewal due in 7 days. Call and send reminder.", priority: "High", status: "In Progress", assignedTo: "e2", assignedBy: "e1", category: "Renewal", dueDate: "2026-02-20", createdAt: "2026-02-15", transferHistory: [], tags: ["LIC", "Renewal"] },
  { id: "t2", title: "Process HDFC claim for Pooja Gupta", description: "Medical claim submitted. Verify documents and process.", priority: "Urgent", status: "Pending", assignedTo: "e3", assignedBy: "e1", category: "Claims", dueDate: "2026-02-18", createdAt: "2026-02-14", transferHistory: [], tags: ["HDFC", "Medical"] },
  { id: "t3", title: "New client onboarding - Rajesh Khanna", description: "Complete KYC and policy selection process.", priority: "Medium", status: "Pending", assignedTo: "e4", assignedBy: "e2", category: "Client", dueDate: "2026-02-25", createdAt: "2026-02-13", transferHistory: [], tags: ["Onboarding"] },
  { id: "t4", title: "Quarterly target review for Sales team", description: "Compile Q1 performance data and prepare report.", priority: "Low", status: "Completed", assignedTo: "e2", assignedBy: "e1", category: "Reports", dueDate: "2026-02-10", createdAt: "2026-02-01", transferHistory: [], tags: ["Q1", "Review"] },
  { id: "t5", title: "Send birthday wishes to 12 clients", description: "February birthdays - personalized messages required.", priority: "Medium", status: "In Progress", assignedTo: "e5", assignedBy: "e2", category: "Reminders", dueDate: "2026-02-28", createdAt: "2026-02-12", transferHistory: [{ from: "e4", to: "e5", date: "2026-02-13", reason: "Reassigned due to workload", status: "Accepted" }], tags: ["Birthday"] },
  { id: "t6", title: "Update policy documents for TATA AIA clients", description: "New policy terms effective March. Update all records.", priority: "High", status: "Transfer Requested", assignedTo: "e3", assignedBy: "e2", category: "Policies", dueDate: "2026-02-22", createdAt: "2026-02-10", transferHistory: [{ from: "e3", to: "e4", date: "2026-02-16", reason: "I have field visit this week", status: "Pending" }], tags: ["TATA AIA", "Documents"] },
];

const PERMISSIONS = ["clients","policies","claims","reminders","targets","reports","tasks","employees","roles"];
const DEPARTMENTS = ["Administration","Sales","Operations","Support","Finance","IT"];
const CATEGORIES = ["Renewal","Claims","Client","Reports","Reminders","Policies","Follow-up","Other"];
const PRIORITIES = ["Urgent","High","Medium","Low"];

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 16 }) => {
  const icons = {
    dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
    users: "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
    roles: "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z",
    tasks: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z",
    plus: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
    edit: "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z",
    delete: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
    close: "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z",
    check: "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
    transfer: "M7.5 21H2V9h5.5v12zm7.25-18h-5.5v18h5.5V3zM22 11h-5.5v10H22V11z",
    clock: "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z",
    alert: "M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z",
    search: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z",
    bell: "M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z",
    arrow: "M8 5v14l11-7z",
    eye: "M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z",
    logout: "M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z",
    filter: "M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z",
    chart: "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
    grid: "M3 3h8v8H3zm0 10h8v8H3zm10-10h8v8h-8zm0 10h8v8h-8z",
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      {icons[name] ? <path d={icons[name]} /> : <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};

// ─── BADGE ────────────────────────────────────────────────────────────────────
const Badge = ({ children, color, small }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: small ? "2px 8px" : "3px 10px",
    borderRadius: 20, fontSize: small ? 10 : 11, fontWeight: 600,
    background: color + "22", color: color, border: `1px solid ${color}44`,
    whiteSpace: "nowrap", letterSpacing: "0.02em"
  }}>{children}</span>
);

const PriorityBadge = ({ priority }) => {
  const map = { Urgent: "#ef4444", High: "#f97316", Medium: "#f59e0b", Low: "#10b981" };
  return <Badge color={map[priority] || "#6b7280"}>{priority}</Badge>;
};

const StatusBadge = ({ status }) => {
  const map = {
    "Pending": "#6366f1", "In Progress": "#3b82f6", "Completed": "#10b981",
    "Transfer Requested": "#f59e0b", "Accepted": "#10b981", "Active": "#10b981", "Inactive": "#6b7280"
  };
  return <Badge color={map[status] || "#6b7280"}>{status}</Badge>;
};

// ─── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "#1a1f2e", borderRadius: 16, width: "100%", maxWidth: width,
        border: "1px solid #2d3748", boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        maxHeight: "90vh", overflow: "auto"
      }}>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "20px 24px 16px", borderBottom: "1px solid #2d3748"
        }}>
          <h3 style={{ margin: 0, color: "#f1f5f9", fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{
            background: "none", border: "none", color: "#64748b",
            cursor: "pointer", padding: 4, borderRadius: 6, display: "flex",
            transition: "color 0.15s"
          }} onMouseEnter={e => e.currentTarget.style.color = "#f1f5f9"}
            onMouseLeave={e => e.currentTarget.style.color = "#64748b"}>
            <Icon name="close" size={18} />
          </button>
        </div>
        <div style={{ padding: "20px 24px 24px" }}>{children}</div>
      </div>
    </div>
  );
};

// ─── FORM FIELD ───────────────────────────────────────────────────────────────
const Field = ({ label, required, children }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 6, letterSpacing: "0.05em", textTransform: "uppercase" }}>
      {label}{required && <span style={{ color: "#ef4444" }}> *</span>}
    </label>
    {children}
  </div>
);

const Input = ({ ...props }) => (
  <input {...props} style={{
    width: "100%", background: "#0f1420", border: "1px solid #2d3748",
    borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 13,
    outline: "none", boxSizing: "border-box", transition: "border-color 0.15s",
    ...props.style
  }}
    onFocus={e => e.target.style.borderColor = "#6366f1"}
    onBlur={e => e.target.style.borderColor = "#2d3748"}
  />
);

const Select = ({ children, ...props }) => (
  <select {...props} style={{
    width: "100%", background: "#0f1420", border: "1px solid #2d3748",
    borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 13,
    outline: "none", cursor: "pointer", boxSizing: "border-box"
  }}>
    {children}
  </select>
);

const Textarea = ({ ...props }) => (
  <textarea {...props} style={{
    width: "100%", background: "#0f1420", border: "1px solid #2d3748",
    borderRadius: 8, padding: "10px 12px", color: "#f1f5f9", fontSize: 13,
    outline: "none", resize: "vertical", minHeight: 80, boxSizing: "border-box",
    fontFamily: "inherit"
  }}
    onFocus={e => e.target.style.borderColor = "#6366f1"}
    onBlur={e => e.target.style.borderColor = "#2d3748"}
  />
);

// ─── BTN ──────────────────────────────────────────────────────────────────────
const Btn = ({ children, onClick, variant = "primary", small, icon, disabled, style: extraStyle }) => {
  const styles = {
    primary: { background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff", border: "none" },
    secondary: { background: "#1e2535", color: "#94a3b8", border: "1px solid #2d3748" },
    danger: { background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", border: "none" },
    success: { background: "linear-gradient(135deg,#10b981,#059669)", color: "#fff", border: "none" },
    warning: { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#fff", border: "none" },
    ghost: { background: "none", color: "#6366f1", border: "1px solid #6366f1" },
  };
  return (
    <button disabled={disabled} onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 6, cursor: disabled ? "not-allowed" : "pointer",
      padding: small ? "6px 12px" : "9px 16px", borderRadius: 8,
      fontSize: small ? 12 : 13, fontWeight: 600, opacity: disabled ? 0.5 : 1,
      transition: "opacity 0.15s, transform 0.1s", whiteSpace: "nowrap",
      ...styles[variant], ...extraStyle
    }}
      onMouseEnter={e => !disabled && (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={e => !disabled && (e.currentTarget.style.opacity = "1")}
    >
      {icon && <Icon name={icon} size={small ? 13 : 14} />}
      {children}
    </button>
  );
};

// ─── AVATAR ───────────────────────────────────────────────────────────────────
const Avatar = ({ initials, color = "#6366f1", size = 36 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: color + "33", border: `2px solid ${color}66`,
    display: "flex", alignItems: "center", justifyContent: "center",
    color, fontSize: size * 0.33, fontWeight: 700, flexShrink: 0, letterSpacing: "0.05em"
  }}>{initials}</div>
);

// ─── STAT CARD ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "#6366f1", icon }) => (
  <div style={{
    background: "#141824", border: "1px solid #2d3748", borderRadius: 12,
    padding: "20px", flex: 1, minWidth: 140, position: "relative", overflow: "hidden"
  }}>
    <div style={{
      position: "absolute", right: -10, top: -10, width: 70, height: 70,
      background: color + "15", borderRadius: "50%"
    }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
      <div>
        <div style={{ color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>{label}</div>
        <div style={{ color: "#f1f5f9", fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ color: "#64748b", fontSize: 11, marginTop: 4 }}>{sub}</div>}
      </div>
      <div style={{ color, opacity: 0.7 }}><Icon name={icon} size={22} /></div>
    </div>
  </div>
);

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [roles, setRoles] = useState(INITIAL_ROLES);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [currentUser] = useState(INITIAL_EMPLOYEES[0]); // Admin logged in
  const [notification, setNotification] = useState(null);

  const notify = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const getEmployee = (id) => employees.find(e => e.id === id);
  const getRole = (id) => roles.find(r => r.id === id);

  const pendingTransfers = tasks.filter(t =>
    t.status === "Transfer Requested" &&
    t.transferHistory.some(h => h.to === currentUser.id && h.status === "Pending")
  );

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "dashboard" },
    { id: "employees", label: "Employees", icon: "users" },
    { id: "roles", label: "Roles & Permissions", icon: "roles" },
    { id: "tasks", label: "Task Management", icon: "tasks" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#0a0e1a", color: "#f1f5f9", fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#0f1420", borderRight: "1px solid #1e2535",
        display: "flex", flexDirection: "column", flexShrink: 0, position: "sticky", top: 0, height: "100vh"
      }}>
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid #1e2535" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Icon name="roles" size={18} />
            </div>
            <div>
              <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 700, lineHeight: 1 }}>Insurance</div>
              <div style={{ color: "#6366f1", fontSize: 10, fontWeight: 600, letterSpacing: "0.1em" }}>CRM SYSTEM</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 8, border: "none", cursor: "pointer",
              background: page === item.id ? "#6366f122" : "none",
              color: page === item.id ? "#818cf8" : "#64748b",
              fontSize: 13, fontWeight: page === item.id ? 600 : 500,
              marginBottom: 2, transition: "all 0.15s", textAlign: "left"
            }}>
              <Icon name={item.icon} size={16} />
              {item.label}
              {item.id === "tasks" && pendingTransfers.length > 0 && (
                <span style={{
                  marginLeft: "auto", background: "#ef4444", color: "#fff",
                  borderRadius: 10, padding: "1px 6px", fontSize: 10, fontWeight: 700
                }}>{pendingTransfers.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 12px", borderTop: "1px solid #1e2535" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 8px" }}>
            <Avatar initials={currentUser.avatar} size={32} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{currentUser.name}</div>
              <div style={{ color: "#6366f1", fontSize: 10, fontWeight: 600 }}>{getRole(currentUser.roleId)?.name}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", minWidth: 0 }}>
        {notification && (
          <div style={{
            position: "fixed", top: 20, right: 20, zIndex: 2000,
            background: notification.type === "success" ? "#10b981" : notification.type === "error" ? "#ef4444" : "#f59e0b",
            color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.3)", display: "flex", alignItems: "center", gap: 8,
            animation: "slideIn 0.3s ease"
          }}>
            <Icon name="check" size={14} />
            {notification.msg}
          </div>
        )}

        {page === "dashboard" && <DashboardPage employees={employees} roles={roles} tasks={tasks} getEmployee={getEmployee} getRole={getRole} />}
        {page === "employees" && <EmployeesPage employees={employees} setEmployees={setEmployees} roles={roles} getRole={getRole} notify={notify} />}
        {page === "roles" && <RolesPage roles={roles} setRoles={setRoles} employees={employees} notify={notify} />}
        {page === "tasks" && <TasksPage tasks={tasks} setTasks={setTasks} employees={employees} currentUser={currentUser} getEmployee={getEmployee} getRole={getRole} notify={notify} />}
      </main>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function DashboardPage({ employees, roles, tasks, getEmployee, getRole }) {
  const active = employees.filter(e => e.status === "Active").length;
  const pendingTasks = tasks.filter(t => t.status === "Pending").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;
  const completedTasks = tasks.filter(t => t.status === "Completed").length;
  const transfers = tasks.filter(t => t.status === "Transfer Requested").length;

  return (
    <div style={{ padding: 28 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#f1f5f9" }}>Welcome back, Arun 👋</h1>
        <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Here's what's happening in your CRM today.</p>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
        <StatCard label="Total Employees" value={employees.length} sub={`${active} active`} color="#6366f1" icon="users" />
        <StatCard label="Total Roles" value={roles.length} sub="Configured" color="#f59e0b" icon="roles" />
        <StatCard label="Pending Tasks" value={pendingTasks} sub="Awaiting action" color="#ef4444" icon="tasks" />
        <StatCard label="In Progress" value={inProgressTasks} sub="Being worked on" color="#3b82f6" icon="clock" />
        <StatCard label="Completed" value={completedTasks} sub="Tasks done" color="#10b981" icon="check" />
        <StatCard label="Transfers" value={transfers} sub="Awaiting approval" color="#f97316" icon="transfer" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Tasks */}
        <div style={{ background: "#141824", border: "1px solid #2d3748", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>Recent Tasks</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {tasks.slice(0, 5).map(task => {
              const emp = getEmployee(task.assignedTo);
              return (
                <div key={task.id} style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                  background: "#0f1420", borderRadius: 8, border: "1px solid #1e2535"
                }}>
                  <Avatar initials={emp?.avatar || "?"} size={30} color={getRole(emp?.roleId)?.color || "#6366f1"} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "#e2e8f0", fontSize: 12, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>{emp?.name} · {task.dueDate}</div>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Team Overview */}
        <div style={{ background: "#141824", border: "1px solid #2d3748", borderRadius: 12, padding: 20 }}>
          <h3 style={{ margin: "0 0 16px", color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>Team Overview</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {roles.map(role => {
              const count = employees.filter(e => e.roleId === role.id).length;
              return (
                <div key={role.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #1e2535" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: role.color, flexShrink: 0 }} />
                  <span style={{ color: "#e2e8f0", fontSize: 13, flex: 1 }}>{role.name}</span>
                  <Badge color={role.color}>{count} member{count !== 1 ? "s" : ""}</Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
function EmployeesPage({ employees, setEmployees, roles, getRole, notify }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editEmp, setEditEmp] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", roleId: "", department: "", password: "", confirmPassword: "", status: "Active" });

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !filterRole || e.roleId === filterRole;
    return matchSearch && matchRole;
  });

  const openAdd = () => {
    setForm({ name: "", email: "", phone: "", roleId: roles[1]?.id || "", department: DEPARTMENTS[0], password: "", confirmPassword: "", status: "Active" });
    setEditEmp(null);
    setShowAdd(true);
  };

  const openEdit = (emp) => {
    setForm({ ...emp, password: "", confirmPassword: "" });
    setEditEmp(emp);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.phone || !form.roleId) {
      notify("Please fill all required fields", "error"); return;
    }
    if (!editEmp && form.password !== form.confirmPassword) {
      notify("Passwords do not match", "error"); return;
    }
    if (!editEmp && form.password.length < 6) {
      notify("Password must be at least 6 characters", "error"); return;
    }
    if (editEmp) {
      setEmployees(prev => prev.map(e => e.id === editEmp.id ? { ...e, ...form } : e));
      notify("Employee updated successfully");
    } else {
      const newEmp = {
        ...form, id: "e" + Date.now(),
        avatar: form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
        joinDate: new Date().toISOString().split("T")[0],
        tasks: 0, completedTasks: 0
      };
      setEmployees(prev => [...prev, newEmp]);
      notify("Employee registered successfully");
    }
    setShowAdd(false);
  };

  const handleDelete = (id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    notify("Employee removed");
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Employees</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{employees.length} total · {employees.filter(e => e.status === "Active").length} active</p>
        </div>
        <Btn onClick={openAdd} icon="plus">Register Employee</Btn>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, position: "relative", maxWidth: 320 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
            <Icon name="search" size={15} />
          </div>
          <Input placeholder="Search employees..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 34 }} />
        </div>
        <Select value={filterRole} onChange={e => setFilterRole(e.target.value)} style={{ width: 180 }}>
          <option value="">All Roles</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </Select>
      </div>

      {/* Table */}
      <div style={{ background: "#141824", border: "1px solid #2d3748", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f1420", borderBottom: "1px solid #2d3748" }}>
                {["Employee", "Contact", "Role", "Department", "Join Date", "Status", "Tasks", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => {
                const role = getRole(emp.roleId);
                return (
                  <tr key={emp.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #1e2535" : "none" }}>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar initials={emp.avatar} color={role?.color} size={34} />
                        <div>
                          <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{emp.name}</div>
                          <div style={{ color: "#64748b", fontSize: 11 }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>{emp.phone}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {role && <Badge color={role.color}>{role.name}</Badge>}
                    </td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>{emp.department}</td>
                    <td style={{ padding: "12px 16px", color: "#94a3b8", fontSize: 12 }}>{emp.joinDate}</td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={emp.status} /></td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 600 }}>{emp.tasks} active</span>
                        <span style={{ color: "#64748b", fontSize: 10 }}>{emp.completedTasks} done</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small variant="secondary" onClick={() => openEdit(emp)} icon="edit">Edit</Btn>
                        <Btn small variant="danger" onClick={() => handleDelete(emp.id)} icon="delete"></Btn>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 40, color: "#64748b" }}>No employees found</div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editEmp ? "Edit Employee" : "Register New Employee"} width={560}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Full Name" required>
            <Input placeholder="Vikram Singh" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Email Address" required>
            <Input type="email" placeholder="vikram@crm.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Phone Number" required>
            <Input placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Department" required>
            <Select value={form.department} onChange={e => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </Select>
          </Field>
          <Field label="Assign Role" required>
            <Select value={form.roleId} onChange={e => setForm({ ...form, roleId: e.target.value })}>
              <option value="">Select Role</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </Select>
          </Field>
          <Field label="Status">
            <Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </Field>
          {!editEmp && <>
            <Field label="Password" required>
              <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </Field>
            <Field label="Confirm Password" required>
              <Input type="password" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} />
            </Field>
          </>}
        </div>

        {/* Role Preview */}
        {form.roleId && (() => {
          const role = roles.find(r => r.id === form.roleId);
          return role ? (
            <div style={{ background: "#0f1420", border: `1px solid ${role.color}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <Badge color={role.color}>{role.name}</Badge>
                <span style={{ color: "#64748b", fontSize: 11 }}>{role.description}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {role.permissions.map(p => <Badge key={p} color={role.color} small>{p}</Badge>)}
              </div>
            </div>
          ) : null;
        })()}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleSave} icon="check">{editEmp ? "Update Employee" : "Register Employee"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── ROLES ────────────────────────────────────────────────────────────────────
function RolesPage({ roles, setRoles, employees, notify }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", color: "#6366f1", permissions: [] });

  const COLORS = ["#6366f1", "#f59e0b", "#10b981", "#3b82f6", "#ec4899", "#ef4444", "#14b8a6", "#f97316", "#8b5cf6", "#06b6d4"];

  const openAdd = () => {
    setForm({ name: "", description: "", color: COLORS[0], permissions: [] });
    setEditRole(null);
    setShowAdd(true);
  };

  const openEdit = (role) => {
    setForm({ ...role });
    setEditRole(role);
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.name) { notify("Role name is required", "error"); return; }
    if (form.permissions.length === 0) { notify("Select at least one permission", "error"); return; }
    if (editRole) {
      setRoles(prev => prev.map(r => r.id === editRole.id ? { ...r, ...form } : r));
      notify("Role updated");
    } else {
      setRoles(prev => [...prev, { ...form, id: "r" + Date.now(), employeeCount: 0 }]);
      notify("Role created");
    }
    setShowAdd(false);
  };

  const togglePermission = (p) => {
    setForm(prev => ({
      ...prev, permissions: prev.permissions.includes(p)
        ? prev.permissions.filter(x => x !== p)
        : [...prev.permissions, p]
    }));
  };

  const handleDelete = (id) => {
    const count = employees.filter(e => e.roleId === id).length;
    if (count > 0) { notify(`Cannot delete role with ${count} assigned employees`, "error"); return; }
    setRoles(prev => prev.filter(r => r.id !== id));
    notify("Role deleted");
  };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Roles & Permissions</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>Manage access control for your team</p>
        </div>
        <Btn onClick={openAdd} icon="plus">Create Role</Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 16 }}>
        {roles.map(role => {
          const empCount = employees.filter(e => e.roleId === role.id).length;
          return (
            <div key={role.id} style={{
              background: "#141824", border: `1px solid ${role.color}33`,
              borderRadius: 12, padding: 20, position: "relative", overflow: "hidden"
            }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: role.color, borderRadius: "12px 12px 0 0" }} />
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: role.color + "22", border: `1px solid ${role.color}44`, display: "flex", alignItems: "center", justifyContent: "center", color: role.color }}>
                    <Icon name="roles" size={18} />
                  </div>
                  <div>
                    <div style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 700 }}>{role.name}</div>
                    <div style={{ color: "#64748b", fontSize: 11 }}>{role.description}</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <Btn small variant="secondary" onClick={() => openEdit(role)} icon="edit"></Btn>
                  <Btn small variant="danger" onClick={() => handleDelete(role.id)} icon="delete"></Btn>
                </div>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 14 }}>
                {role.permissions.map(p => <Badge key={p} color={role.color} small>{p}</Badge>)}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid #1e2535" }}>
                <span style={{ color: "#64748b", fontSize: 12 }}>
                  <span style={{ color: role.color, fontWeight: 700 }}>{empCount}</span> employee{empCount !== 1 ? "s" : ""} assigned
                </span>
                <span style={{ color: "#64748b", fontSize: 11 }}>{role.permissions.length} permissions</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Role Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title={editRole ? "Edit Role" : "Create New Role"} width={500}>
        <Field label="Role Name" required>
          <Input placeholder="e.g. Senior Manager" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Description">
          <Input placeholder="Brief description of this role" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </Field>

        <Field label="Role Color">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {COLORS.map(c => (
              <button key={c} onClick={() => setForm({ ...form, color: c })} style={{
                width: 28, height: 28, borderRadius: "50%", background: c, border: form.color === c ? "3px solid #f1f5f9" : "3px solid transparent",
                cursor: "pointer", outline: "none", transition: "transform 0.1s",
                transform: form.color === c ? "scale(1.2)" : "scale(1)"
              }} />
            ))}
          </div>
        </Field>

        <Field label="Permissions" required>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PERMISSIONS.map(p => {
              const selected = form.permissions.includes(p);
              return (
                <button key={p} onClick={() => togglePermission(p)} style={{
                  padding: "6px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all 0.15s",
                  background: selected ? form.color + "33" : "#0f1420",
                  border: `1px solid ${selected ? form.color : "#2d3748"}`,
                  color: selected ? form.color : "#64748b"
                }}>{p}</button>
              );
            })}
          </div>
        </Field>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
          <Btn variant="secondary" onClick={() => setShowAdd(false)}>Cancel</Btn>
          <Btn onClick={handleSave} icon="check">{editRole ? "Update Role" : "Create Role"}</Btn>
        </div>
      </Modal>
    </div>
  );
}

// ─── TASKS ────────────────────────────────────────────────────────────────────
function TasksPage({ tasks, setTasks, employees, currentUser, getEmployee, getRole, notify }) {
  const [showCreate, setShowCreate] = useState(false);
  const [viewTask, setViewTask] = useState(null);
  const [transferModal, setTransferModal] = useState(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssignee, setFilterAssignee] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // all | mine | transfers
  const [transferReason, setTransferReason] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [taskForm, setTaskForm] = useState({ title: "", description: "", priority: "Medium", assignedTo: "", category: "Client", dueDate: "", tags: "" });

  const myTasks = tasks.filter(t => t.assignedTo === currentUser.id);
  const pendingTransfers = tasks.filter(t =>
    t.status === "Transfer Requested" &&
    t.transferHistory.some(h => h.to === currentUser.id && h.status === "Pending")
  );

  const filtered = (tab === "mine" ? myTasks : tab === "transfers" ? pendingTransfers : tasks).filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || t.status === filterStatus;
    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchAssignee = !filterAssignee || t.assignedTo === filterAssignee;
    return matchSearch && matchStatus && matchPriority && matchAssignee;
  });

  const createTask = () => {
    if (!taskForm.title || !taskForm.assignedTo || !taskForm.dueDate) {
      notify("Please fill all required fields", "error"); return;
    }
    const newTask = {
      ...taskForm,
      id: "t" + Date.now(),
      assignedBy: currentUser.id,
      status: "Pending",
      createdAt: new Date().toISOString().split("T")[0],
      transferHistory: [],
      tags: taskForm.tags ? taskForm.tags.split(",").map(t => t.trim()).filter(Boolean) : []
    };
    setTasks(prev => [newTask, ...prev]);
    setShowCreate(false);
    notify("Task created and assigned");
  };

  const updateStatus = (id, status) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    notify(`Task marked as ${status}`);
  };

  const requestTransfer = () => {
    if (!transferTo || !transferReason) { notify("Select employee and provide reason", "error"); return; }
    setTasks(prev => prev.map(t => t.id === transferModal.id ? {
      ...t,
      status: "Transfer Requested",
      transferHistory: [...t.transferHistory, {
        from: currentUser.id, to: transferTo,
        date: new Date().toISOString().split("T")[0],
        reason: transferReason, status: "Pending"
      }]
    } : t));
    setTransferModal(null);
    setTransferReason("");
    setTransferTo("");
    notify("Transfer request sent");
  };

  const respondTransfer = (taskId, accept) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updatedHistory = t.transferHistory.map(h =>
        h.to === currentUser.id && h.status === "Pending"
          ? { ...h, status: accept ? "Accepted" : "Rejected" }
          : h
      );
      return {
        ...t,
        status: accept ? "In Progress" : "In Progress",
        assignedTo: accept ? currentUser.id : t.assignedTo,
        transferHistory: updatedHistory
      };
    }));
    notify(accept ? "Transfer accepted! Task is now yours." : "Transfer declined.");
  };

  const STATUS_COLORS = { "Pending": "#6366f1", "In Progress": "#3b82f6", "Completed": "#10b981", "Transfer Requested": "#f59e0b" };

  return (
    <div style={{ padding: 28 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#f1f5f9" }}>Task Management</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 13 }}>{tasks.length} total tasks</p>
        </div>
        <Btn onClick={() => setShowCreate(true)} icon="plus">Assign Task</Btn>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#0f1420", padding: 4, borderRadius: 10, width: "fit-content", border: "1px solid #1e2535" }}>
        {[
          { id: "all", label: `All Tasks (${tasks.length})` },
          { id: "mine", label: `My Tasks (${myTasks.length})` },
          { id: "transfers", label: `Transfers (${pendingTransfers.length})`, badge: pendingTransfers.length },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "7px 16px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: tab === t.id ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "none",
            color: tab === t.id ? "#fff" : "#64748b", display: "flex", alignItems: "center", gap: 6
          }}>
            {t.label}
            {t.badge > 0 && tab !== t.id && (
              <span style={{ background: "#ef4444", color: "#fff", borderRadius: 8, padding: "1px 5px", fontSize: 10 }}>{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ flex: 1, position: "relative", minWidth: 200 }}>
          <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }}><Icon name="search" size={14} /></div>
          <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 32 }} />
        </div>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 160 }}>
          <option value="">All Status</option>
          {["Pending", "In Progress", "Completed", "Transfer Requested"].map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 140 }}>
          <option value="">All Priority</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </Select>
        <Select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} style={{ width: 160 }}>
          <option value="">All Assignees</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
        </Select>
      </div>

      {/* Pending Transfer Alert */}
      {pendingTransfers.length > 0 && tab !== "transfers" && (
        <div style={{
          background: "#f59e0b15", border: "1px solid #f59e0b44",
          borderRadius: 10, padding: "12px 16px", marginBottom: 16,
          display: "flex", alignItems: "center", gap: 10
        }}>
          <div style={{ color: "#f59e0b" }}><Icon name="alert" size={18} /></div>
          <span style={{ color: "#fbbf24", fontSize: 13, fontWeight: 600 }}>
            You have {pendingTransfers.length} pending transfer request{pendingTransfers.length > 1 ? "s" : ""} awaiting your response.
          </span>
          <button onClick={() => setTab("transfers")} style={{
            marginLeft: "auto", background: "#f59e0b", color: "#fff", border: "none",
            borderRadius: 6, padding: "5px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer"
          }}>View Transfers</button>
        </div>
      )}

      {/* Task Cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: 60, color: "#64748b", background: "#141824", borderRadius: 12, border: "1px solid #2d3748" }}>
            <Icon name="tasks" size={36} />
            <div style={{ marginTop: 12, fontSize: 14, fontWeight: 600, color: "#94a3b8" }}>No tasks found</div>
          </div>
        )}
        {filtered.map(task => {
          const assignee = getEmployee(task.assignedTo);
          const assigner = getEmployee(task.assignedBy);
          const assigneeRole = getRole(assignee?.roleId);
          const isAssignedToMe = task.assignedTo === currentUser.id;
          const pendingTransfer = task.transferHistory.find(h => h.to === currentUser.id && h.status === "Pending");
          const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Completed";

          return (
            <div key={task.id} style={{
              background: "#141824", border: `1px solid ${isOverdue ? "#ef444433" : pendingTransfer ? "#f59e0b33" : "#2d3748"}`,
              borderRadius: 12, padding: "16px 20px",
              borderLeft: `4px solid ${STATUS_COLORS[task.status] || "#2d3748"}`
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Task Header */}
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ margin: 0, color: task.status === "Completed" ? "#64748b" : "#f1f5f9", fontSize: 14, fontWeight: 700, textDecoration: task.status === "Completed" ? "line-through" : "none" }}>
                      {task.title}
                    </h3>
                    {isOverdue && task.status !== "Completed" && (
                      <Badge color="#ef4444" small>Overdue</Badge>
                    )}
                  </div>

                  <p style={{ margin: "0 0 10px", color: "#64748b", fontSize: 12, lineHeight: 1.5 }}>{task.description}</p>

                  {/* Meta */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <Badge color="#8b5cf6" small>{task.category}</Badge>
                    <span style={{ display: "flex", alignItems: "center", gap: 4, color: isOverdue ? "#ef4444" : "#64748b", fontSize: 11 }}>
                      <Icon name="clock" size={12} />
                      Due: {task.dueDate}
                    </span>
                    {task.tags?.map(tag => <Badge key={tag} color="#3b82f6" small>#{tag}</Badge>)}
                  </div>

                  {/* Transfer History */}
                  {task.transferHistory.length > 0 && (
                    <div style={{ marginTop: 10, background: "#0f1420", borderRadius: 8, padding: "8px 12px" }}>
                      <div style={{ color: "#64748b", fontSize: 10, fontWeight: 600, marginBottom: 4, textTransform: "uppercase" }}>Transfer History</div>
                      {task.transferHistory.map((h, i) => {
                        const fromEmp = getEmployee(h.from);
                        const toEmp = getEmployee(h.to);
                        return (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#94a3b8", marginBottom: i < task.transferHistory.length - 1 ? 4 : 0 }}>
                            <span style={{ color: "#f59e0b" }}>{fromEmp?.name}</span>
                            <Icon name="arrow" size={10} />
                            <span style={{ color: "#6366f1" }}>{toEmp?.name}</span>
                            <span style={{ color: "#64748b" }}>· {h.date} ·</span>
                            <StatusBadge status={h.status} />
                            {h.reason && <span style={{ color: "#64748b" }}>"{h.reason}"</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Right Side: Assignee + Actions */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#94a3b8", fontSize: 11 }}>Assigned to</div>
                      <div style={{ color: "#f1f5f9", fontSize: 12, fontWeight: 600 }}>{assignee?.name}</div>
                    </div>
                    <Avatar initials={assignee?.avatar || "?"} color={assigneeRole?.color} size={32} />
                  </div>

                  {assigner && (
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: "#64748b", fontSize: 10 }}>by {assigner?.name}</div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {/* Transfer Accept/Reject */}
                    {pendingTransfer && (
                      <>
                        <Btn small variant="success" onClick={() => respondTransfer(task.id, true)} icon="check">Accept Transfer</Btn>
                        <Btn small variant="danger" onClick={() => respondTransfer(task.id, false)} icon="close">Decline</Btn>
                      </>
                    )}

                    {/* Status Updates for assignee */}
                    {isAssignedToMe && !pendingTransfer && task.status !== "Completed" && task.status !== "Transfer Requested" && (
                      <>
                        {task.status === "Pending" && (
                          <Btn small variant="secondary" onClick={() => updateStatus(task.id, "In Progress")}>Start Task</Btn>
                        )}
                        {task.status === "In Progress" && (
                          <Btn small variant="success" onClick={() => updateStatus(task.id, "Completed")} icon="check">Complete</Btn>
                        )}
                        <Btn small variant="warning" onClick={() => { setTransferModal(task); setTransferTo(""); setTransferReason(""); }} icon="transfer">Transfer</Btn>
                      </>
                    )}

                    {/* Admin view button */}
                    <Btn small variant="secondary" onClick={() => setViewTask(task)} icon="eye"></Btn>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Assign New Task" width={540}>
        <Field label="Task Title" required>
          <Input placeholder="e.g. Follow up with Ajay Verma for renewal" value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} />
        </Field>
        <Field label="Description">
          <Textarea placeholder="Provide detailed instructions..." value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} />
        </Field>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 16px" }}>
          <Field label="Assign To" required>
            <Select value={taskForm.assignedTo} onChange={e => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
              <option value="">Select Employee</option>
              {employees.filter(e => e.status === "Active").map(e => {
                const role = INITIAL_ROLES.find(r => r.id === e.roleId);
                return <option key={e.id} value={e.id}>{e.name} ({role?.name})</option>;
              })}
            </Select>
          </Field>
          <Field label="Priority" required>
            <Select value={taskForm.priority} onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </Select>
          </Field>
          <Field label="Category">
            <Select value={taskForm.category} onChange={e => setTaskForm({ ...taskForm, category: e.target.value })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </Field>
          <Field label="Due Date" required>
            <Input type="date" value={taskForm.dueDate} onChange={e => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
          </Field>
        </div>
        <Field label="Tags (comma separated)">
          <Input placeholder="LIC, Renewal, Urgent" value={taskForm.tags} onChange={e => setTaskForm({ ...taskForm, tags: e.target.value })} />
        </Field>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
          <Btn onClick={createTask} icon="tasks">Assign Task</Btn>
        </div>
      </Modal>

      {/* Transfer Request Modal */}
      <Modal open={!!transferModal} onClose={() => setTransferModal(null)} title="Request Task Transfer" width={460}>
        {transferModal && (
          <>
            <div style={{ background: "#0f1420", borderRadius: 8, padding: "12px 14px", marginBottom: 16, border: "1px solid #2d3748" }}>
              <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 4 }}>Transferring task:</div>
              <div style={{ color: "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{transferModal.title}</div>
            </div>
            <Field label="Transfer To" required>
              <Select value={transferTo} onChange={e => setTransferTo(e.target.value)}>
                <option value="">Select Employee</option>
                {employees.filter(e => e.id !== currentUser.id && e.status === "Active").map(e => {
                  const role = INITIAL_ROLES.find(r => r.id === e.roleId);
                  return <option key={e.id} value={e.id}>{e.name} · {role?.name}</option>;
                })}
              </Select>
            </Field>
            <Field label="Reason for Transfer" required>
              <Textarea placeholder="Explain why you're requesting this transfer..." value={transferReason} onChange={e => setTransferReason(e.target.value)} />
            </Field>
            <div style={{ background: "#f59e0b11", border: "1px solid #f59e0b33", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ color: "#fbbf24", fontSize: 12 }}>
                ⚠️ The selected employee will receive a notification and must <strong>accept</strong> before the task transfers.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <Btn variant="secondary" onClick={() => setTransferModal(null)}>Cancel</Btn>
              <Btn variant="warning" onClick={requestTransfer} icon="transfer">Send Transfer Request</Btn>
            </div>
          </>
        )}
      </Modal>

      {/* View Task Detail Modal */}
      <Modal open={!!viewTask} onClose={() => setViewTask(null)} title="Task Details" width={520}>
        {viewTask && (() => {
          const assignee = getEmployee(viewTask.assignedTo);
          const assigner = getEmployee(viewTask.assignedBy);
          return (
            <div>
              <h2 style={{ margin: "0 0 8px", color: "#f1f5f9", fontSize: 16, fontWeight: 700 }}>{viewTask.title}</h2>
              <p style={{ margin: "0 0 16px", color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{viewTask.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                <PriorityBadge priority={viewTask.priority} />
                <StatusBadge status={viewTask.status} />
                <Badge color="#8b5cf6">{viewTask.category}</Badge>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                {[
                  ["Assigned To", assignee?.name, getRole(assignee?.roleId)?.color],
                  ["Assigned By", assigner?.name, getRole(assigner?.roleId)?.color],
                  ["Due Date", viewTask.dueDate, "#64748b"],
                  ["Created", viewTask.createdAt, "#64748b"],
                ].map(([label, value, color]) => (
                  <div key={label} style={{ background: "#0f1420", borderRadius: 8, padding: "10px 12px" }}>
                    <div style={{ color: "#64748b", fontSize: 10, textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                    <div style={{ color: color || "#f1f5f9", fontSize: 13, fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
              {viewTask.tags?.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", marginBottom: 6 }}>Tags</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {viewTask.tags.map(t => <Badge key={t} color="#3b82f6" small>#{t}</Badge>)}
                  </div>
                </div>
              )}
              {viewTask.transferHistory.length > 0 && (
                <div>
                  <div style={{ color: "#64748b", fontSize: 11, textTransform: "uppercase", marginBottom: 8 }}>Transfer Timeline</div>
                  {viewTask.transferHistory.map((h, i) => {
                    const fromEmp = getEmployee(h.from);
                    const toEmp = getEmployee(h.to);
                    return (
                      <div key={i} style={{ background: "#0f1420", borderRadius: 8, padding: "10px 12px", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ color: "#f59e0b", fontWeight: 600, fontSize: 12 }}>{fromEmp?.name}</span>
                          <Icon name="arrow" size={12} />
                          <span style={{ color: "#6366f1", fontWeight: 600, fontSize: 12 }}>{toEmp?.name}</span>
                          <StatusBadge status={h.status} />
                          <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 11 }}>{h.date}</span>
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>Reason: {h.reason}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })()}
      </Modal>
    </div>
  );
}
