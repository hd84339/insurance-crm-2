const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, lowercase: true, trim: true },
  phone:      { type: String, required: true },
  dateOfBirth: Date,
  address: {
    street: String, city: String, state: String, pincode: String,
    country: { type: String, default: 'India' }
  },
  clientType: { type: String, enum: ['Individual','Corporate'], default: 'Individual' },
  priority:   { type: String, enum: ['Low','Medium','High'], default: 'Medium' },
  tags:       [String],
  status:     { type: String, enum: ['Active','Inactive','Prospect'], default: 'Prospect' },
  assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
  totalPolicies: { type: Number, default: 0 },
  totalPremium:  { type: Number, default: 0 },
  notes: String
}, { timestamps: true });

clientSchema.index({ name: 'text', email: 'text', phone: 'text' });
clientSchema.index({ status: 1, assignedAgent: 1 });

module.exports = mongoose.model('Client', clientSchema);
