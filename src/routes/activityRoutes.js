const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get recent activity for dashboard
router.get('/recent', activityController.getRecentActivity);

// Get activity for specific service
router.get('/service/:serviceId', activityController.getServiceActivity);

module.exports = router;
