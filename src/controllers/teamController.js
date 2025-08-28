const Team = require('../models/Team');
const User = require('../models/User');

// Get all teams for organization
const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({ organization: req.user.organization })
      .populate('members.user', 'firstName lastName email role isActive lastLogin')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: teams
    });
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Error fetching teams.' });
  }
};

// Get team by ID
const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members.user', 'firstName lastName email role isActive lastLogin')
      .populate('organization', 'name slug');

    if (!team || team.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ error: 'Error fetching team.' });
  }
};

// Create new team
const createTeam = async (req, res) => {
  try {
    const { name, description, color, members } = req.body;
    
    const team = new Team({
      name,
      description,
      color: color || '#3B82F6',
      organization: req.user.organization,
      members: members ? members.map(userId => ({ user: userId })) : []
    });

    await team.save();

    // Add team to members' teams array
    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members }, organization: req.user.organization },
        { $addToSet: { teams: team._id } }
      );
    }

    // Populate the created team
    await team.populate('members.user', 'firstName lastName email role');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('team-created', {
      team,
      organization: req.user.organization
    });

    res.status(201).json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ error: 'Error creating team.' });
  }
};

// Update team
const updateTeam = async (req, res) => {
  try {
    const { name, description, color, members } = req.body;
    
    const team = await Team.findById(req.params.id);
    if (!team || team.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    // Remove team from old members
    if (team.members && team.members.length > 0) {
      const oldMemberIds = team.members.map(m => m.user);
      await User.updateMany(
        { _id: { $in: oldMemberIds } },
        { $pull: { teams: team._id } }
      );
    }

    // Update team
    team.name = name || team.name;
    team.description = description !== undefined ? description : team.description;
    team.color = color || team.color;
    team.members = members ? members.map(userId => ({ user: userId })) : team.members;
    team.updatedAt = new Date();

    await team.save();

    // Add team to new members
    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members }, organization: req.user.organization },
        { $addToSet: { teams: team._id } }
      );
    }

    // Populate the updated team
    await team.populate('members.user', 'firstName lastName email role');

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('team-updated', {
      team,
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: team
    });
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Error updating team.' });
  }
};

// Delete team
const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team || team.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Team not found.' });
    }

    // Remove team from all members
    if (team.members && team.members.length > 0) {
      const memberIds = team.members.map(m => m.user);
      await User.updateMany(
        { _id: { $in: memberIds } },
        { $pull: { teams: team._id } }
      );
    }

    await Team.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('team-deleted', {
      teamId: req.params.id,
      organization: req.user.organization
    });

    res.json({
      success: true,
      message: 'Team deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Error deleting team.' });
  }
};

// Get all users for organization (for team management)
const getOrganizationUsers = async (req, res) => {
  try {
    const { role, team, isActive } = req.query;
    const filter = { organization: req.user.organization };

    if (role) filter.role = role;
    if (team) filter.teams = team;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const users = await User.find(filter)
      .populate('teams', 'name color')
      .select('-password')
      .sort({ firstName: 1, lastName: 1 });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Error fetching users.' });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user || user.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Only admins can change roles
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can change user roles.' });
    }

    user.role = role;
    await user.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('user-role-updated', {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      },
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Error updating user role.' });
  }
};

// Deactivate/activate user
const toggleUserStatus = async (req, res) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (!user || user.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Only admins can deactivate users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can deactivate users.' });
    }

    // Prevent deactivating yourself
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot deactivate your own account.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('user-status-updated', {
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isActive: user.isActive
      },
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Error toggling user status.' });
  }
};

// Get team statistics
const getTeamStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ organization: req.user.organization });
    const activeUsers = await User.countDocuments({ 
      organization: req.user.organization, 
      isActive: true 
    });
    const totalTeams = await Team.countDocuments({ organization: req.user.organization });

    // Role distribution
    const roleStats = await User.aggregate([
      { $match: { organization: req.user.organization } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const roleDistribution = roleStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        totalTeams,
        roleDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching team stats:', error);
    res.status(500).json({ error: 'Error fetching team statistics.' });
  }
};

module.exports = {
  getTeams,
  getTeamById,
  createTeam,
  updateTeam,
  deleteTeam,
  getOrganizationUsers,
  updateUserRole,
  toggleUserStatus,
  getTeamStats
};
