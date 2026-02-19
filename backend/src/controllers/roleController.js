const Role = require('../models/Role');
const Employee = require('../models/Employee');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort('name').lean();
    const data = await Promise.all(roles.map(async r => ({
      ...r, employeeCount: await Employee.countDocuments({ roleId: r._id })
    })));
    res.json({ success: true, count: data.length, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    const employeeCount = await Employee.countDocuments({ roleId: role._id });
    const employees = await Employee.find({ roleId: role._id }).select('name email avatar status department');
    res.json({ success: true, data: { ...role.toObject(), employeeCount, employees } });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, color, permissions } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Role name is required' });
    if (!permissions?.length) return res.status(400).json({ success: false, message: 'At least one permission required' });
    const exists = await Role.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (exists) return res.status(400).json({ success: false, message: 'Role name already exists' });
    const role = await Role.create({ name, description, color, permissions });
    res.status(201).json({ success: true, message: 'Role created', data: role });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSystem && req.body.permissions) return res.status(403).json({ success: false, message: 'Cannot modify system role permissions' });
    const updated = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Role updated', data: updated });
  } catch (e) { res.status(400).json({ success: false, message: e.message }); }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    if (role.isSystem) return res.status(403).json({ success: false, message: 'Cannot delete system roles' });
    const count = await Employee.countDocuments({ roleId: req.params.id });
    if (count > 0) return res.status(400).json({ success: false, message: `Cannot delete: ${count} employees use this role` });
    await Role.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Role deleted' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
