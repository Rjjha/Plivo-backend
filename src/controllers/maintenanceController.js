const Maintenance = require('../models/Maintenance');
const StatusUpdate = require('../models/StatusUpdate');

// Create new maintenance
const createMaintenance = async (req, res) => {
  try {
    const { title, description, services, scheduledStart, scheduledEnd, isPublic } = req.body;
    
    const maintenance = new Maintenance({
      title,
      description,
      services,
      scheduledStart,
      scheduledEnd,
      isPublic: isPublic !== undefined ? isPublic : true,
      organization: req.user.organization,
      createdBy: req.user._id
    });

    await maintenance.save();

    // Create initial status update for each affected service
    for (const serviceId of services) {
      await StatusUpdate.create({
        organization: req.user.organization,
        service: serviceId,
        maintenance: maintenance._id,
        newStatus: 'under_maintenance',
        message: 'Maintenance scheduled',
        triggeredBy: 'maintenance',
        author: req.user._id,
        isPublic: true
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('maintenance-created', {
      maintenance,
      organization: req.user.organization
    });

    res.status(201).json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error creating maintenance:', error);
    res.status(500).json({ error: 'Error creating maintenance.' });
  }
};

// Get all maintenance for organization
const getMaintenance = async (req, res) => {
  try {
    const { status, service, isPublic } = req.query;
    const filter = { organization: req.user.organization };

    if (status) filter.status = status;
    if (service) filter.services = service;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    const maintenance = await Maintenance.find(filter)
      .populate('services', 'name category')
      .sort({ scheduledStart: -1 });

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({ error: 'Error fetching maintenance.' });
  }
};

// Get public maintenance for status page
const getPublicMaintenance = async (req, res) => {
  try {
    const { organizationSlug } = req.params;
    
    const maintenance = await Maintenance.find({ 
      organization: req.organization._id,
      isPublic: true,
      isActive: true
    })
    .populate('services', 'name category')
    .sort({ scheduledStart: -1 });

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error fetching public maintenance:', error);
    res.status(500).json({ error: 'Error fetching maintenance.' });
  }
};

// Get maintenance by ID
const getMaintenanceById = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id)
      .populate('services', 'name category')
      .populate('createdBy', 'firstName lastName')
      .populate('organization', 'name slug');

    if (!maintenance || maintenance.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Maintenance not found.' });
    }

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error fetching maintenance:', error);
    res.status(500).json({ error: 'Error fetching maintenance.' });
  }
};

// Update maintenance
const updateMaintenance = async (req, res) => {
  try {
    const { title, description, services, scheduledStart, scheduledEnd, status, isPublic } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (services) updateData.services = services;
    if (scheduledStart) updateData.scheduledStart = scheduledStart;
    if (scheduledEnd) updateData.scheduledEnd = scheduledEnd;
    if (status) updateData.status = status;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const maintenance = await Maintenance.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!maintenance || maintenance.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Maintenance not found.' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('maintenance-updated', {
      maintenance,
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error updating maintenance:', error);
    res.status(500).json({ error: 'Error updating maintenance.' });
  }
};

// Update maintenance status
const updateMaintenanceStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const maintenanceId = req.params.id;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance || maintenance.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Maintenance not found.' });
    }

    const previousStatus = maintenance.status;
    maintenance.status = status;
    if (message) maintenance.statusMessage = message;
    
    if (status === 'completed') {
      maintenance.completedAt = new Date();
      maintenance.isActive = false;
    } else if (status === 'in_progress') {
      maintenance.isActive = true;
    }

    await maintenance.save();

    // Create status update record for each affected service
    for (const serviceId of maintenance.services) {
      await StatusUpdate.create({
        organization: req.user.organization,
        service: serviceId,
        maintenance: maintenanceId,
        previousStatus,
        newStatus: status,
        message,
        triggeredBy: 'maintenance',
        author: req.user._id,
        isPublic: true
      });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('maintenance-status-updated', {
      maintenance,
      previousStatus,
      newStatus: status,
      message,
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error updating maintenance status:', error);
    res.status(500).json({ error: 'Error updating maintenance status.' });
  }
};

// Delete maintenance
const deleteMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance || maintenance.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Maintenance not found.' });
    }

    await Maintenance.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('maintenance-deleted', {
      maintenanceId: req.params.id,
      organization: req.user.organization
    });

    res.json({
      success: true,
      message: 'Maintenance deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting maintenance:', error);
    res.status(500).json({ error: 'Error deleting maintenance.' });
  }
};

// Add update to maintenance
const addMaintenanceUpdate = async (req, res) => {
  try {
    const { message, status } = req.body;
    const maintenanceId = req.params.id;

    const maintenance = await Maintenance.findById(maintenanceId);
    if (!maintenance || maintenance.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Maintenance not found.' });
    }

    const update = {
      message,
      author: req.user._id,
      timestamp: new Date()
    };

    if (status) {
      update.status = status;
      maintenance.status = status;
      await maintenance.save();
    }

    maintenance.updates.push(update);
    await maintenance.save();

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('maintenance-update-added', {
      maintenance,
      update,
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: maintenance
    });
  } catch (error) {
    console.error('Error adding maintenance update:', error);
    res.status(500).json({ error: 'Error adding maintenance update.' });
  }
};

module.exports = {
  createMaintenance,
  getMaintenance,
  getPublicMaintenance,
  getMaintenanceById,
  updateMaintenance,
  updateMaintenanceStatus,
  deleteMaintenance,
  addMaintenanceUpdate
};
