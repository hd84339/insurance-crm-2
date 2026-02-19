const express = require('express');

// Role routes
const roleRouter = express.Router();
const rc = require('../controllers/roleController');
roleRouter.route('/').get(rc.getRoles).post(rc.createRole);
roleRouter.route('/:id').get(rc.getRole).put(rc.updateRole).delete(rc.deleteRole);

// Employee routes
const empRouter = express.Router();
const ec = require('../controllers/employeeController');
empRouter.get('/stats', ec.getStats);
empRouter.route('/').get(ec.getEmployees).post(ec.createEmployee);
empRouter.route('/:id').get(ec.getEmployee).put(ec.updateEmployee).delete(ec.deleteEmployee);

// Task routes
const taskRouter = express.Router();
const tc = require('../controllers/taskController');
taskRouter.get('/stats', tc.getStats);
taskRouter.get('/pending-transfers/:employeeId', tc.getPendingTransfers);
taskRouter.route('/').get(tc.getTasks).post(tc.createTask);
taskRouter.route('/:id').get(tc.getTask).put(tc.updateTask).delete(tc.deleteTask);
taskRouter.patch('/:id/status', tc.updateStatus);
taskRouter.post('/:id/transfer', tc.requestTransfer);
taskRouter.patch('/:id/transfer/respond', tc.respondTransfer);
taskRouter.post('/:id/notes', tc.addNote);

// Client routes
const clientRouter = express.Router();
const cc = require('../controllers/clientController');
clientRouter.get('/stats', cc.stats);
clientRouter.route('/').get(cc.getAll).post(cc.create);
clientRouter.route('/:id').get(cc.getOne).put(cc.update).delete(cc.remove);

// Other controllers (Policy, Claim, Reminder, Target)
const { policyController: pc, claimController: clmc, reminderController: remc, targetController: tgtc } = require('../controllers/otherControllers');

const policyRouter = express.Router();
policyRouter.get('/renewals/upcoming', pc.upcomingRenewals);
policyRouter.route('/').get(pc.getAll).post(pc.create);
policyRouter.route('/:id').get(pc.getOne).put(pc.update).delete(pc.remove);

const claimRouter = express.Router();
claimRouter.route('/').get(clmc.getAll).post(clmc.create);
claimRouter.patch('/:id/status', clmc.updateStatus);
claimRouter.route('/:id').get(clmc.getOne).put(clmc.update).delete(clmc.remove);

const reminderRouter = express.Router();
reminderRouter.route('/').get(remc.getAll).post(remc.create);
reminderRouter.patch('/:id/complete', remc.complete);
reminderRouter.patch('/:id/snooze', remc.snooze);
reminderRouter.route('/:id').get(remc.getOne).put(remc.update).delete(remc.remove);

const targetRouter = express.Router();
targetRouter.route('/').get(tgtc.getAll).post(tgtc.create);
targetRouter.route('/:id').get(tgtc.getOne).put(tgtc.update).delete(tgtc.remove);

// Dashboard report
const reportRouter = express.Router();
reportRouter.get('/dashboard', async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const Task = require('../models/Task');
    const Client = require('../models/Client');
    const { Policy, Claim } = require('../models/OtherModels');
    const [totalEmp, activeEmp, totalClients, totalPolicies, totalTasks, pendingTasks, transfers, claimStats] = await Promise.all([
      Employee.countDocuments(), Employee.countDocuments({ status: 'Active' }),
      Client.countDocuments(), Policy.countDocuments({ status: 'Active' }),
      Task.countDocuments(), Task.countDocuments({ status: { $in: ['Pending','In Progress'] } }),
      Task.countDocuments({ status: 'Transfer Requested' }),
      Claim.aggregate([{ $group: { _id: '$status', count: { $sum:1 }, amount: { $sum:'$claimAmount' } } }])
    ]);
    const byRole = await Employee.aggregate([
      { $lookup: { from:'roles', localField:'roleId', foreignField:'_id', as:'role' } },
      { $unwind:'$role' },
      { $group: { _id:'$role.name', color:{ $first:'$role.color' }, count:{ $sum:1 } } }
    ]);
    res.json({ success:true, data:{ employees:{ total:totalEmp, active:activeEmp }, clients:totalClients, policies:totalPolicies, tasks:{ total:totalTasks, pending:pendingTasks, transfers }, claims:claimStats, teamByRole:byRole } });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = { roleRouter, empRouter, taskRouter, clientRouter, policyRouter, claimRouter, reminderRouter, targetRouter, reportRouter };
