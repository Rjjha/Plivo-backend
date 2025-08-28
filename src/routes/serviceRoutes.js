const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  createService,
  getServices,
  getPublicServices,
  getService,
  updateService,
  updateServiceStatus,
  deleteService,
  getServiceStatusHistory
} = require('../controllers/serviceController');

// Public routes (for status page)
router.get('/public/:organizationSlug', getPublicServices);

// Protected routes
router.use(auth);

router.post('/', requireRole(['admin', 'manager']), createService);
router.get('/', getServices);
router.get('/:id', getService);
router.put('/:id', requireRole(['admin', 'manager']), updateService);
router.patch('/:id/status', requireRole(['admin', 'manager']), updateServiceStatus);
router.delete('/:id', requireRole(['admin']), deleteService);
router.get('/:id/history', getServiceStatusHistory);

module.exports = router;
