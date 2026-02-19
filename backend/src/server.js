require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/database');
const { roleRouter, empRouter, taskRouter, clientRouter, policyRouter, claimRouter, reminderRouter, targetRouter, reportRouter } = require('./routes/index');

const app = express();
connectDB();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));
app.use('/api/', rateLimit({ windowMs: +(process.env.RATE_LIMIT_WINDOW_MS||900000), max: +(process.env.RATE_LIMIT_MAX||100), message: { success:false, message:'Too many requests' } }));

app.get('/health', (_, res) => res.json({ success:true, message:'Server is running', version:'2.0.0', env:process.env.NODE_ENV, timestamp:new Date() }));

app.use('/api/roles',     roleRouter);
app.use('/api/employees', empRouter);
app.use('/api/tasks',     taskRouter);
app.use('/api/clients',   clientRouter);
app.use('/api/policies',  policyRouter);
app.use('/api/claims',    claimRouter);
app.use('/api/reminders', reminderRouter);
app.use('/api/targets',   targetRouter);
app.use('/api/reports',   reportRouter);

app.get('/', (_, res) => res.json({ success:true, message:'Insurance CRM API v2.0', endpoints:['/api/roles','/api/employees','/api/tasks','/api/clients','/api/policies','/api/claims','/api/reminders','/api/targets','/api/reports'] }));
app.use((req, res) => res.status(404).json({ success:false, message:`Route ${req.originalUrl} not found` }));
app.use((err, req, res, next) => { console.error(err.message); res.status(err.statusCode||500).json({ success:false, message:err.message||'Internal Server Error' }); });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`\n╔══════════════════════════════════╗\n║  Insurance CRM API  v2.0.0       ║\n║  http://localhost:${PORT}          ║\n╚══════════════════════════════════╝\n`));
process.on('unhandledRejection', err => { console.error(err); server.close(()=>process.exit(1)); });
module.exports = app;
