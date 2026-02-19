const { Client } = require('../models/OtherModels') || {};
const Client2 = require('../models/Client');

// GET /api/clients
exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, status, clientType, priority, sortBy = '-createdAt' } = req.query;
    const q = {};
    if (search) q.$text = { $search: search };
    if (status) q.status = status;
    if (clientType) q.clientType = clientType;
    if (priority) q.priority = priority;
    const data = await Client2.find(q).populate('assignedAgent', 'name email avatar').sort(sortBy).limit(+limit).skip((+page - 1) * +limit);
    const total = await Client2.countDocuments(q);
    res.json({ success: true, count: data.length, total, totalPages: Math.ceil(total / +limit), currentPage: +page, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/clients/:id
exports.getOne = async (req, res) => {
  try {
    const doc = await Client2.findById(req.params.id).populate('assignedAgent', 'name email avatar');
    if (!doc) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, data: doc });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// POST /api/clients
exports.create = async (req, res) => {
  try {
    const doc = await Client2.create(req.body);
    res.status(201).json({ success: true, message: 'Client created', data: doc });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// PUT /api/clients/:id
exports.update = async (req, res) => {
  try {
    const doc = await Client2.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client updated', data: doc });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

// DELETE /api/clients/:id
exports.remove = async (req, res) => {
  try {
    const doc = await Client2.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Client not found' });
    res.json({ success: true, message: 'Client deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

// GET /api/clients/stats
exports.stats = async (req, res) => {
  try {
    const total    = await Client2.countDocuments();
    const active   = await Client2.countDocuments({ status: 'Active' });
    const prospect = await Client2.countDocuments({ status: 'Prospect' });
    const byType   = await Client2.aggregate([{ $group: { _id: '$clientType', count: { $sum: 1 } } }]);
    res.json({ success: true, data: { total, active, prospect, inactive: total - active - prospect, byType } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
