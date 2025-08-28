const express = require('express');
const router = express.Router();
const { auth, requireRole } = require('../middleware/auth');
const {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  addIncidentUpdate,
  resolveIncident
} = require('../controllers/incidentController');

// All routes require authentication
router.use(auth);

router.post('/', requireRole(['admin', 'manager']), createIncident);
router.get('/', getIncidents);
router.get('/:id', getIncident);
router.put('/:id', requireRole(['admin', 'manager']), updateIncident);
router.post('/:id/updates', requireRole(['admin', 'manager']), addIncidentUpdate);
router.patch('/:id/resolve', requireRole(['admin', 'manager']), resolveIncident);

module.exports = router;
