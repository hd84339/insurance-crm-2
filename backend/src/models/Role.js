const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, trim: true },
  color: { type: String, default: '#6366f1' },
  permissions: [{
    type: String,
    enum: ['all','clients','policies','claims','reminders','targets','reports','tasks','employees','roles']
  }],
  isSystem: { type: Boolean, default: false }
}, { timestamps: true });

roleSchema.methods.hasPermission = function(p) {
  return this.permissions.includes('all') || this.permissions.includes(p);
};

module.exports = mongoose.model('Role', roleSchema);
