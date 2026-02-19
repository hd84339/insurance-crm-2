const Employee = require('../models/Employee');
const Role = require('../models/Role');

exports.getEmployees = async (req, res) => {
  try {
    const { page=1, limit=20, search, roleId, department, status, sortBy='-createdAt' } = req.query;
    const q = {};
    if (search) q.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    if (roleId) q.roleId = roleId;
    if (department) q.department = department;
    if (status) q.status = status;
    const employees = await Employee.find(q).populate('roleId','name color permissions description').sort(sortBy).limit(limit*1).skip((page-1)*limit).lean();
    const total = await Employee.countDocuments(q);
    res.json({ success: true, count: employees.length, total, totalPages: Math.ceil(total/limit), currentPage: +page, data: employees });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).populate('roleId','name color permissions description');
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, data: emp });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createEmployee = async (req, res) => {
  try {
    const { name, email, phone, password, confirmPassword, roleId, department, status } = req.body;
    if (!name || !email || !phone || !password || !roleId || !department)
      return res.status(400).json({ success: false, message: 'All required fields must be filled' });
    if (password !== confirmPassword)
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    if (await Employee.findOne({ email }))
      return res.status(400).json({ success: false, message: 'Email already registered' });
    if (!await Role.findById(roleId))
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    const emp = await Employee.create({ name, email, phone, password, roleId, department, status });
    const populated = await Employee.findById(emp._id).populate('roleId','name color permissions');
    res.status(201).json({ success: true, message: 'Employee registered successfully', data: populated });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.updateEmployee = async (req, res) => {
  try {
    const { password, confirmPassword, ...data } = req.body;
    if (password) {
      if (password !== confirmPassword) return res.status(400).json({ success: false, message: 'Passwords do not match' });
      const emp = await Employee.findById(req.params.id);
      if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
      Object.assign(emp, data); emp.password = password;
      await emp.save();
      return res.json({ success: true, message: 'Employee updated', data: await Employee.findById(emp._id).populate('roleId','name color permissions') });
    }
    const emp = await Employee.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true }).populate('roleId','name color permissions');
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee updated', data: emp });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const Task = require('../models/Task');
    const active = await Task.countDocuments({ assignedTo: req.params.id, status: { $in: ['Pending','In Progress'] } });
    if (active > 0) return res.status(400).json({ success: false, message: `Cannot delete: employee has ${active} active tasks` });
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.json({ success: true, message: 'Employee deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const active = await Employee.countDocuments({ status: 'Active' });
    const byDept = await Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    const byRole = await Employee.aggregate([
      { $lookup: { from: 'roles', localField: 'roleId', foreignField: '_id', as: 'role' } },
      { $unwind: '$role' },
      { $group: { _id: '$role.name', color: { $first: '$role.color' }, count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { total, active, inactive: total - active, byDepartment: byDept, byRole } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
