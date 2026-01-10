// Disable console logs in production
if (process.env.NODE_ENV === 'production') {
  console.log = () => {};
  console.error = () => {};
  console.warn = () => {};
  console.info = () => {};
}

// Load env variables
require('dotenv').config();

// Imports
const express = require('express');
const helmet = require('helmet');
const logger = require('./middlewares/customLogger');
const cors = require('cors');
const ConnectDb = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const courseRoutes = require('./routes/courseRoutes');
const cohortRoutes = require('./routes/cohortRoutes');
const unitScheduleRoutes = require('./routes/unitScheduleRoutes');
const assignementRoutes = require('./routes/assignememntRoutes');
const scheduleNotifications = require('./services/notificationScheduler');
const feedbackRoutes = require('./routes/feedbackRoutes');
const upcomingRoutes = require('./routes/upcomingsRoutes')
const notificationRoutes = require('./routes/notificationRoutes');
const adminDashboardRoutes = require('./routes/adminRoute');
const catRoutes = require('./routes/catRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes')

// Initialize app
const app = express();

app.use(express.json()); // Parse json bodies

const allowedOrigins = process.env.ALLOWED_ORIGINS ?
                      process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) :
                      [];
// Allow communication with client
app.use(cors({
  origin: (origin, cb) => {
    if(!origin || allowedOrigins.includes(origin)) return cb(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], // Allowed HTTP methods
  credentials: true, // Allow cookies, authorization headers, etc.
  allowedHeaders: ['Content-Type, Authorization']
}));

app.use(helmet()); // Security policy
app.use(logger); // Logger

app.use('/api/course', courseRoutes);
app.use('/api/cohort', cohortRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/schedule', unitScheduleRoutes);
app.use('/api/assignment', assignementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/upcoming', upcomingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminDashboardRoutes);
app.use('/api/CAT', catRoutes);
app.use('/api/upload', fileUploadRoutes);

// Health check
app.get('/', (req, res) => {
    res.send('App is running');
})

// Load port from env
const PORT = process.env.PORT || 5000;

ConnectDb()
    .then(() => {
        // Activate Scheduler
        scheduleNotifications();

        // Fire up the server
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        })
    }).catch((err) => {
        console.error('Error:', err);
        process.exit(1);
    });

