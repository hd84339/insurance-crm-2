const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  from:   { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  to:     { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['Pending','Accepted','Rejected'], default: 'Pending' },
  respondedAt: Date
}, { timestamps: true });

const taskSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  priority:    { type: String, enum: ['Urgent','High','Medium','Low'], default: 'Medium' },
  status:      { type: String, enum: ['Pending','In Progress','Completed','Transfer Requested','Cancelled'], default: 'Pending' },
  category:    { type: String, enum: ['Renewal','Claims','Client','Reports','Reminders','Policies','Follow-up','Other'], default: 'Other' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  assignedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  dueDate:     { type: Date, required: true },
  completedAt: Date,
  tags:        [{ type: String, trim: true }],
  transferHistory: [transferSchema],
  notes: [{
    text: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    addedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true, toJSON: { virtuals: true } });

taskSchema.virtual('isOverdue').get(function() {
  if (['Completed','Cancelled'].includes(this.status)) return false;
  return new Date(this.dueDate) < new Date();
});

taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1, status: 1 });
taskSchema.index({ title: 'text' });

// Keep employee task counters in sync
taskSchema.post('save', async function() {
  try {
    const Employee = mongoose.model('Employee');
    const [active, done] = await Promise.all([
      mongoose.model('Task').countDocuments({ assignedTo: this.assignedTo, status: { $in: ['Pending','In Progress','Transfer Requested'] }}),
      mongoose.model('Task').countDocuments({ assignedTo: this.assignedTo, status: 'Completed' })
    ]);
    await Employee.findByIdAndUpdate(this.assignedTo, { activeTasks: active, completedTasks: done });
  } catch(_) {}
});

module.exports = mongoose.model('Task', taskSchema);
