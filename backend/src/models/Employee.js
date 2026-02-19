const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const employeeSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  password:   { type: String, required: true, minlength: 6, select: false },
  phone:      { type: String, required: true },
  avatar:     { type: String },
  roleId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Role', required: true },
  department: { type: String, required: true, enum: ['Administration','Sales','Operations','Support','Finance','IT'] },
  status:     { type: String, enum: ['Active','Inactive'], default: 'Active' },
  joinDate:   { type: Date, default: Date.now },
  activeTasks:    { type: Number, default: 0 },
  completedTasks: { type: Number, default: 0 },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }
}, { timestamps: true, toJSON: { virtuals: true } });

employeeSchema.index({ email: 1 });
employeeSchema.index({ roleId: 1, status: 1 });
employeeSchema.index({ name: 'text', email: 'text' });

employeeSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (!this.avatar && this.name) {
    this.avatar = this.name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  }
  next();
});

employeeSchema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Employee', employeeSchema);
