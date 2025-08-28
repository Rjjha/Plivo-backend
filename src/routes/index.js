const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const organizationRoutes = require('./organizationRoutes');
const serviceRoutes = require('./serviceRoutes');
const incidentRoutes = require('./incidentRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const teamRoutes = require('./teamRoutes');
const activityRoutes = require('./activityRoutes');

// API version prefix
const API_VERSION = '/api/v1';

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/organizations`, organizationRoutes);
router.use(`${API_VERSION}/services`, serviceRoutes);
router.use(`${API_VERSION}/incidents`, incidentRoutes);
router.use(`${API_VERSION}/maintenance`, maintenanceRoutes);
router.use(`${API_VERSION}/teams`, teamRoutes);
router.use(`${API_VERSION}/activity`, activityRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
