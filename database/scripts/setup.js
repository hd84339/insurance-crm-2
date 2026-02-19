// MongoDB Setup Script for Insurance CRM v2.0
// Run: mongosh < setup.js

use('insurance-crm');

// Create collections
['clients','policies','claims','reminders','targets','roles','employees','tasks'].forEach(name => {
  try { db.createCollection(name); print(`✅ Collection: ${name}`); }
  catch(e) { print(`⚠️  ${name} already exists`); }
});

// Indexes for performance
db.employees.createIndex({ email: 1 }, { unique: true });
db.employees.createIndex({ roleId: 1, status: 1 });
db.employees.createIndex({ name: 'text', email: 'text' });

db.roles.createIndex({ name: 1 }, { unique: true });

db.tasks.createIndex({ assignedTo: 1, status: 1 });
db.tasks.createIndex({ dueDate: 1, status: 1 });
db.tasks.createIndex({ 'transferHistory.to': 1, 'transferHistory.status': 1 });

db.clients.createIndex({ name: 'text', email: 'text', phone: 'text' });
db.clients.createIndex({ status: 1, assignedAgent: 1 });

db.policies.createIndex({ client: 1, status: 1 });
db.policies.createIndex({ policyNumber: 1 }, { unique: true });
db.policies.createIndex({ renewalDate: 1, status: 1 });

db.claims.createIndex({ client: 1, status: 1 });
db.claims.createIndex({ claimNumber: 1 }, { unique: true });

db.reminders.createIndex({ dueDate: 1, status: 1 });
db.reminders.createIndex({ client: 1, status: 1 });

db.targets.createIndex({ agent: 1, status: 1 });

print('\n✅ Database setup complete!');
print('📌 Run: npm run seed   (from backend folder) to add sample data');
