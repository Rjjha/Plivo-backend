const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { auth, requireRole } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get team statistics
router.get('/stats', teamController.getTeamStats);

// Get all teams
router.get('/', teamController.getTeams);

// Get team by ID
router.get('/:id', teamController.getTeamById);

// Create new team (requires manager or admin)
router.post('/', requireRole(['admin', 'manager']), teamController.createTeam);

// Update team (requires manager or admin)
router.put('/:id', requireRole(['admin', 'manager']), teamController.updateTeam);

// Delete team (requires admin only)
router.delete('/:id', requireRole(['admin']), teamController.deleteTeam);

// Get organization users (for team management)
router.get('/users/list', teamController.getOrganizationUsers);

// Update user role (requires admin only)
router.patch('/users/:userId/role', requireRole(['admin']), teamController.updateUserRole);

// Toggle user status (requires admin only)
router.patch('/users/:userId/status', requireRole(['admin']), teamController.toggleUserStatus);

module.exports = router;
