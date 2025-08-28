const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');
const { auth, requireRole } = require('../middleware/auth');

// Public routes (for status page)
router.get('/public/:organizationSlug', maintenanceController.getPublicMaintenance);

// Protected routes
router.use(auth);

// Get all maintenance for organization
router.get('/', maintenanceController.getMaintenance);

// Get maintenance by ID
router.get('/:id', maintenanceController.getMaintenanceById);

// Create new maintenance (requires manager or admin)
router.post('/', requireRole(['admin', 'manager']), maintenanceController.createMaintenance);

// Update maintenance (requires manager or admin)
router.put('/:id', requireRole(['admin', 'manager']), maintenanceController.updateMaintenance);

// Update maintenance status (requires manager or admin)
router.patch('/:id/status', requireRole(['admin', 'manager']), maintenanceController.updateMaintenanceStatus);

// Add update to maintenance (requires manager or admin)
router.post('/:id/updates', requireRole(['admin', 'manager']), maintenanceController.addMaintenanceUpdate);

// Delete maintenance (requires admin only)
router.delete('/:id', requireRole(['admin']), maintenanceController.deleteMaintenance);

module.exports = router;
