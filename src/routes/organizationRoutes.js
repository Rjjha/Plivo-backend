const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  createOrganization,
  getOrganizationBySlug,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats
} = require('../controllers/organizationController');

// Public routes
router.get('/public/:slug', getOrganizationBySlug);

// Protected routes
router.use(auth);

router.post('/', createOrganization);
router.get('/me', getOrganization);
router.put('/me', requireRole(['admin']), updateOrganization);
router.delete('/me', requireRole(['admin']), deleteOrganization);
router.get('/stats', getOrganizationStats);

module.exports = router;
