const Task = require('../models/Task');
const Employee = require('../models/Employee');

const populate = q => q
  .populate('assignedTo','name email avatar roleId')
  .populate('assignedBy','name email avatar')
  .populate('transferHistory.from','name avatar')
  .populate('transferHistory.to','name avatar');

exports.getTasks = async (req, res) => {
  try {
    const { page=1, limit=20, search, status, priority, category, assignedTo, assignedBy, sortBy='-createdAt' } = req.query;
    const q = {};
    if (search) q.$or = [{ title: { $regex: search, $options:'i' } }, { description: { $regex: search, $options:'i' } }];
    if (status) q.status = status;
    if (priority) q.priority = priority;
    if (category) q.category = category;
    if (assignedTo) q.assignedTo = assignedTo;
    if (assignedBy) q.assignedBy = assignedBy;
    const tasks = await populate(Task.find(q)).sort(sortBy).limit(limit*1).skip((page-1)*limit).lean();
    const total = await Task.countDocuments(q);
    res.json({ success: true, count: tasks.length, total, totalPages: Math.ceil(total/limit), currentPage: +page, data: tasks });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getTask = async (req, res) => {
  try {
    const task = await populate(Task.findById(req.params.id)).populate('notes.addedBy','name avatar');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, category, assignedTo, assignedBy, dueDate, tags } = req.body;
    if (!title || !assignedTo || !assignedBy || !dueDate)
      return res.status(400).json({ success: false, message: 'Title, assignedTo, assignedBy and dueDate are required' });
    const emp = await Employee.findById(assignedTo);
    if (!emp || emp.status !== 'Active') return res.status(400).json({ success: false, message: 'Assignee must be an active employee' });
    const task = await Task.create({ title, description, priority, category, assignedTo, assignedBy, dueDate, tags });
    const populated = await populate(Task.findById(task._id));
    res.status(201).json({ success: true, message: 'Task assigned successfully', data: populated });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await populate(Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task updated', data: task });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.updateStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.status = req.body.status;
    if (req.body.status === 'Completed') task.completedAt = new Date();
    await task.save();
    res.json({ success: true, message: `Task marked as ${req.body.status}`, data: task });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.requestTransfer = async (req, res) => {
  try {
    const { fromEmployeeId, toEmployeeId, reason } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.assignedTo.toString() !== fromEmployeeId)
      return res.status(403).json({ success: false, message: 'Only the assigned employee can request a transfer' });
    if (['Completed','Cancelled'].includes(task.status))
      return res.status(400).json({ success: false, message: 'Cannot transfer a completed or cancelled task' });
    if (task.transferHistory.some(h => h.status === 'Pending'))
      return res.status(400).json({ success: false, message: 'A transfer request is already pending' });
    const toEmp = await Employee.findById(toEmployeeId);
    if (!toEmp || toEmp.status !== 'Active')
      return res.status(400).json({ success: false, message: 'Target employee not found or inactive' });
    task.transferHistory.push({ from: fromEmployeeId, to: toEmployeeId, reason });
    task.status = 'Transfer Requested';
    await task.save();
    const populated = await populate(Task.findById(task._id));
    res.json({ success: true, message: 'Transfer request sent', data: populated });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.respondTransfer = async (req, res) => {
  try {
    const { employeeId, accept } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const transfer = task.transferHistory.find(h => h.to.toString() === employeeId && h.status === 'Pending');
    if (!transfer) return res.status(400).json({ success: false, message: 'No pending transfer found for this employee' });
    transfer.status = accept ? 'Accepted' : 'Rejected';
    transfer.respondedAt = new Date();
    if (accept) { task.assignedTo = employeeId; task.status = 'In Progress'; }
    else { task.status = 'In Progress'; }
    await task.save();
    const populated = await populate(Task.findById(task._id));
    res.json({ success: true, message: accept ? 'Transfer accepted! Task is now yours.' : 'Transfer declined.', data: populated });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.addNote = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    task.notes.push({ text: req.body.text, addedBy: req.body.addedBy });
    await task.save();
    res.json({ success: true, message: 'Note added', data: task });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const byStatus   = await Task.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const byPriority = await Task.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]);
    const total    = await Task.countDocuments();
    const overdue  = await Task.countDocuments({ dueDate: { $lt: new Date() }, status: { $nin: ['Completed','Cancelled'] } });
    const transfers = await Task.countDocuments({ status: 'Transfer Requested' });
    res.json({ success: true, data: { total, overdue, transfers, byStatus, byPriority } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getPendingTransfers = async (req, res) => {
  try {
    const tasks = await populate(Task.find({ status:'Transfer Requested', 'transferHistory': { $elemMatch: { to: req.params.employeeId, status: 'Pending' } } }));
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
