require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const connectDB = require('./database');

async function seed() {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Load models
  const Role     = require('../models/Role');
  const Employee = require('../models/Employee');
  const Task     = require('../models/Task');

  // Clear collections
  await Promise.all([Role.deleteMany(), Employee.deleteMany(), Task.deleteMany()]);
  console.log('🗑  Cleared existing data');

  // Seed Roles
  const roles = await Role.insertMany([
    { name: 'Admin',        description: 'Full system access',          color: '#6366f1', permissions: ['all'],                                                              isSystem: true  },
    { name: 'Manager',      description: 'Team management & reports',   color: '#f59e0b', permissions: ['clients','policies','claims','reminders','targets','reports','tasks','employees'] },
    { name: 'Senior Agent', description: 'Senior field operations',     color: '#10b981', permissions: ['clients','policies','claims','reminders','tasks']                               },
    { name: 'Agent',        description: 'Field agent operations',      color: '#3b82f6', permissions: ['clients','policies','reminders','tasks']                                        },
    { name: 'Trainee',      description: 'Limited read-only access',    color: '#ec4899', permissions: ['clients','reminders']                                                           },
  ]);
  console.log(`✅ Seeded ${roles.length} roles`);

  // Seed Employees (password = "password123")
  const password = await bcrypt.hash('password123', 10);
  const employees = await Employee.insertMany([
    { name: 'Arun Sharma',  email: 'arun@crm.com',   phone: '+91 98765 43210', roleId: roles[0]._id, department: 'Administration', status: 'Active', avatar: 'AS', password },
    { name: 'Priya Mehta',  email: 'priya@crm.com',  phone: '+91 98765 43211', roleId: roles[1]._id, department: 'Sales',          status: 'Active', avatar: 'PM', password },
    { name: 'Vivek Kumar',  email: 'vivek@crm.com',  phone: '+91 98765 43212', roleId: roles[2]._id, department: 'Sales',          status: 'Active', avatar: 'VK', password },
    { name: 'Sneha Patel',  email: 'sneha@crm.com',  phone: '+91 98765 43213', roleId: roles[3]._id, department: 'Operations',     status: 'Active', avatar: 'SP', password },
    { name: 'Rahul Joshi',  email: 'rahul@crm.com',  phone: '+91 98765 43214', roleId: roles[3]._id, department: 'Sales',          status: 'Active', avatar: 'RJ', password },
    { name: 'Anita Desai',  email: 'anita@crm.com',  phone: '+91 98765 43215', roleId: roles[4]._id, department: 'Support',        status: 'Inactive',avatar: 'AD', password },
  ]);
  console.log(`✅ Seeded ${employees.length} employees`);

  // Seed Tasks
  const tasks = await Task.insertMany([
    {
      title: 'Follow up with Ajay Verma for LIC renewal',
      description: 'Client renewal due in 7 days. Call and send reminder.',
      priority: 'High', status: 'In Progress', category: 'Renewal',
      assignedTo: employees[1]._id, assignedBy: employees[0]._id,
      dueDate: new Date(Date.now() + 7 * 86400000), tags: ['LIC','Renewal'],
      transferHistory: []
    },
    {
      title: 'Process HDFC claim for Pooja Gupta',
      description: 'Medical claim submitted. Verify documents and process.',
      priority: 'Urgent', status: 'Pending', category: 'Claims',
      assignedTo: employees[2]._id, assignedBy: employees[0]._id,
      dueDate: new Date(Date.now() + 3 * 86400000), tags: ['HDFC','Medical'],
      transferHistory: []
    },
    {
      title: 'New client onboarding - Rajesh Khanna',
      description: 'Complete KYC and policy selection process.',
      priority: 'Medium', status: 'Pending', category: 'Client',
      assignedTo: employees[3]._id, assignedBy: employees[1]._id,
      dueDate: new Date(Date.now() + 10 * 86400000), tags: ['Onboarding'],
      transferHistory: []
    },
    {
      title: 'Send birthday wishes to 12 clients',
      description: 'February birthdays — personalized messages required.',
      priority: 'Medium', status: 'Transfer Requested', category: 'Reminders',
      assignedTo: employees[3]._id, assignedBy: employees[1]._id,
      dueDate: new Date(Date.now() + 14 * 86400000), tags: ['Birthday'],
      transferHistory: [{
        from: employees[3]._id, to: employees[4]._id,
        reason: 'I have field duty this week', status: 'Pending'
      }]
    },
    {
      title: 'Quarterly target review for Sales team',
      description: 'Compile Q1 performance data and prepare report.',
      priority: 'Low', status: 'Completed', category: 'Reports',
      assignedTo: employees[1]._id, assignedBy: employees[0]._id,
      dueDate: new Date(Date.now() - 5 * 86400000), completedAt: new Date(),
      tags: ['Q1','Review'], transferHistory: []
    },
  ]);
  console.log(`✅ Seeded ${tasks.length} tasks`);

  console.log(`
╔════════════════════════════════════════════╗
║         Seed completed successfully!        ║
╠════════════════════════════════════════════╣
║  Default login credentials:                 ║
║  Email:    arun@crm.com (Admin)             ║
║  Password: password123                      ║
╚════════════════════════════════════════════╝`);
  process.exit(0);
}

seed().catch(err => { console.error('Seed failed:', err); process.exit(1); });
