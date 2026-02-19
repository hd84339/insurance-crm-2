const { Policy, Claim, Reminder, Target } = require('../models/OtherModels');

// ── Generic CRUD factory ──────────────────────────────────────────────────────
const crud = (Model, populateFields = '') => ({
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 20, sortBy = '-createdAt', ...filters } = req.query;
      const q = {};
      ['status','company','policyType','claimType','reminderType','priority','assignedAgent','agent','client','policy'].forEach(f => {
        if (filters[f]) q[f] = filters[f];
      });
      let query = Model.find(q).sort(sortBy).limit(+limit).skip((+page - 1) * +limit);
      if (populateFields) query = query.populate(populateFields);
      const [data, total] = await Promise.all([query, Model.countDocuments(q)]);
      res.json({ success: true, count: data.length, total, totalPages: Math.ceil(total / +limit), currentPage: +page, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  },
  getOne: async (req, res) => {
    try {
      let query = Model.findById(req.params.id);
      if (populateFields) query = query.populate(populateFields);
      const doc = await query;
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
      res.json({ success: true, data: doc });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  },
  create: async (req, res) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json({ success: true, message: 'Created successfully', data: doc });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  },
  update: async (req, res) => {
    try {
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
      res.json({ success: true, message: 'Updated successfully', data: doc });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  },
  remove: async (req, res) => {
    try {
      const doc = await Model.findByIdAndDelete(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
});

// Policy: auto-generate policyNumber if missing
const policyBase = crud(Policy, 'client assignedAgent');
exports.policyController = {
  ...policyBase,
  create: async (req, res) => {
    try {
      if (!req.body.policyNumber) {
        const count = await Policy.countDocuments();
        req.body.policyNumber = `POL-${Date.now()}-${count + 1}`;
      }
      const doc = await Policy.create(req.body);
      res.status(201).json({ success: true, message: 'Policy created', data: doc });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  },
  upcomingRenewals: async (req, res) => {
    try {
      const days = +req.query.days || 30;
      const limit = new Date(Date.now() + days * 86400000);
      const data = await Policy.find({ renewalDate: { $gte: new Date(), $lte: limit }, status: 'Active' }).populate('client', 'name phone email').sort('renewalDate');
      res.json({ success: true, count: data.length, data });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
};

// Claim: auto-generate claimNumber
const claimBase = crud(Claim, 'client policy');
exports.claimController = {
  ...claimBase,
  create: async (req, res) => {
    try {
      const count = await Claim.countDocuments();
      req.body.claimNumber = `CLM-${String(count + 1).padStart(6, '0')}`;
      const doc = await Claim.create(req.body);
      res.status(201).json({ success: true, message: 'Claim created', data: doc });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  },
  updateStatus: async (req, res) => {
    try {
      const { status, note } = req.body;
      const doc = await Claim.findById(req.params.id);
      if (!doc) return res.status(404).json({ success: false, message: 'Claim not found' });
      doc.status = status;
      doc.statusHistory.push({ status, note, date: new Date() });
      if (status === 'Settled') doc.settlementDate = new Date();
      await doc.save();
      res.json({ success: true, message: `Claim status updated to ${status}`, data: doc });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }
};

// Reminder
exports.reminderController = {
  ...crud(Reminder, 'client policy assignedAgent'),
  complete: async (req, res) => {
    try {
      const doc = await Reminder.findByIdAndUpdate(req.params.id, { status: 'Completed', completedAt: new Date() }, { new: true });
      if (!doc) return res.status(404).json({ success: false, message: 'Reminder not found' });
      res.json({ success: true, message: 'Reminder marked complete', data: doc });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  },
  snooze: async (req, res) => {
    try {
      const days = +req.body.days || 3;
      const snoozeUntil = new Date(Date.now() + days * 86400000);
      const doc = await Reminder.findByIdAndUpdate(req.params.id, { status: 'Snoozed', snoozeUntil }, { new: true });
      if (!doc) return res.status(404).json({ success: false, message: 'Reminder not found' });
      res.json({ success: true, message: `Snoozed for ${days} days`, data: doc });
    } catch (e) { res.status(400).json({ success: false, message: e.message }); }
  }
};

// Target
exports.targetController = crud(Target, 'agent');
