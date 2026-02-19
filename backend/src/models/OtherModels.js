const mongoose = require('mongoose');

// ── Policy ────────────────────────────────────────────────────────────────────
const policySchema = new mongoose.Schema({
  client:     { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  policyNumber: { type: String, required: true, unique: true },
  policyType: { type: String, enum: ['Life Insurance','General Insurance','Mutual Fund','Health','Motor','Travel'], required: true },
  company:    { type: String, enum: ['LIC','Bajaj','HDFC','ICICI','TATA AIA','SBI Life','Max Life','Other'], required: true },
  planName:   { type: String, required: true },
  premiumAmount:    { type: Number, required: true, min: 0 },
  premiumFrequency: { type: String, enum: ['Monthly','Quarterly','Half-Yearly','Yearly','One-Time'], default: 'Yearly' },
  sumAssured: { type: Number, required: true, min: 0 },
  policyTerm: { type: Number, required: true },
  startDate:  { type: Date, required: true },
  maturityDate: { type: Date, required: true },
  renewalDate:  { type: Date },
  nextPremiumDue: { type: Date },
  status:        { type: String, enum: ['Active','Lapsed','Matured','Surrendered','Pending'], default: 'Active' },
  paymentStatus: { type: String, enum: ['Paid','Pending','Overdue'], default: 'Pending' },
  nominees: [{ name: String, relationship: String, share: { type: Number, min: 0, max: 100 } }],
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  notes: String
}, { timestamps: true });
policySchema.index({ client: 1, status: 1 });
policySchema.index({ renewalDate: 1, status: 1 });

// ── Claim ─────────────────────────────────────────────────────────────────────
const claimSchema = new mongoose.Schema({
  client:  { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  policy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Policy', required: true },
  claimNumber: { type: String, required: true, unique: true },
  claimType:   { type: String, enum: ['Death','Maturity','Accident','Medical','Surrender','Partial Withdrawal','Other'], required: true },
  claimAmount:  { type: Number, required: true, min: 0 },
  approvedAmount: { type: Number, min: 0 },
  claimDate:    { type: Date, default: Date.now },
  incidentDate: { type: Date, required: true },
  status:   { type: String, enum: ['Pending','Under Review','Approved','Rejected','Settled','Shortfall'], default: 'Pending' },
  priority: { type: String, enum: ['Low','Medium','High','Urgent'], default: 'Medium' },
  description: String,
  statusHistory: [{ status: String, date: { type: Date, default: Date.now }, note: String }],
  settlementDate: Date,
  notes: String
}, { timestamps: true });
claimSchema.index({ client: 1, status: 1 });

// ── Reminder ──────────────────────────────────────────────────────────────────
const reminderSchema = new mongoose.Schema({
  client:  { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  policy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Policy' },
  reminderType: { type: String, enum: ['Renewal','Premium Due','Maturity','Birthday','Anniversary','Health Checkup','Follow-up','Custom'], required: true },
  title:    { type: String, required: true },
  description: String,
  dueDate:  { type: Date, required: true },
  priority: { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  status:   { type: String, enum: ['Pending','Completed','Cancelled','Snoozed'], default: 'Pending' },
  frequency: { type: String, enum: ['One-Time','Daily','Weekly','Monthly','Yearly'], default: 'One-Time' },
  amount:   { type: Number, min: 0 },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  completedAt: Date,
  snoozeUntil: Date
}, { timestamps: true });
reminderSchema.index({ client: 1, status: 1 });
reminderSchema.index({ dueDate: 1, status: 1 });

// ── Target ────────────────────────────────────────────────────────────────────
const targetSchema = new mongoose.Schema({
  agent:    { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  targetPeriod: { type: String, enum: ['Monthly','Quarterly','Half-Yearly','Yearly'], required: true },
  startDate: { type: Date, required: true },
  endDate:   { type: Date, required: true },
  productType: { type: String, enum: ['Life','General','Mutual Fund','Health','Motor','All'], default: 'All' },
  targetAmount:   { type: Number, required: true, min: 0 },
  achievedAmount: { type: Number, default: 0, min: 0 },
  targetPolicies:   { type: Number, min: 0 },
  achievedPolicies: { type: Number, default: 0 },
  status: { type: String, enum: ['Active','Completed','Expired','Cancelled'], default: 'Active' },
  achievementPercentage: { type: Number, default: 0 }
}, { timestamps: true });

targetSchema.pre('save', function(next) {
  if (this.targetAmount > 0) {
    this.achievementPercentage = Math.min(100, (this.achievedAmount / this.targetAmount) * 100);
  }
  next();
});

module.exports = {
  Policy:   mongoose.model('Policy', policySchema),
  Claim:    mongoose.model('Claim', claimSchema),
  Reminder: mongoose.model('Reminder', reminderSchema),
  Target:   mongoose.model('Target', targetSchema)
};
