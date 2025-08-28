const Service = require('../models/Service');
const StatusUpdate = require('../models/StatusUpdate');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');

// Create new service
const createService = async (req, res) => {
  try {
    const { name, description, category, url, team, tags } = req.body;
    
    const service = new Service({
      name,
      description,
      category,
      url,
      team,
      tags,
      organization: req.user.organization
    });

    await service.save();

    // Create initial status update
    await StatusUpdate.create({
      organization: req.user.organization,
      service: service._id,
      newStatus: 'operational',
      message: 'Service created',
      triggeredBy: 'manual',
      author: req.user._id,
      isPublic: true
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('service-created', {
      service,
      organization: req.user.organization
    });

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error creating service:', error);
    res.status(500).json({ error: 'Error creating service.' });
  }
};

// Get all services for organization
const getServices = async (req, res) => {
  try {
    const { category, status, team, isPublic } = req.query;
    const filter = { organization: req.user.organization };

    if (category) filter.category = category;
    if (status) filter.status = status;
    if (team) filter.team = team;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';

    const services = await Service.find(filter)
      .populate('team', 'name color')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ error: 'Error fetching services.' });
  }
};

// Get public services for status page
const getPublicServices = async (req, res) => {
  try {
    const { organizationSlug } = req.params;
    
    const services = await Service.find({ 
      organization: req.organization._id,
      isPublic: true,
      isActive: true
    })
    .populate('team', 'name color')
    .sort({ category: 1, name: 1 });

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Error fetching public services:', error);
    res.status(500).json({ error: 'Error fetching services.' });
  }
};

// Get service by ID
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('team', 'name color description')
      .populate('organization', 'name slug');

    if (!service) {
      return res.status(404).json({ error: 'Service not found.' });
    }
    
    // Check if service belongs to user's organization
    const serviceOrgId = service.organization._id || service.organization;
    if (serviceOrgId.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    res.status(500).json({ error: 'Error fetching service.' });
  }
};



// Update service
const updateService = async (req, res) => {
  try {
    const { name, description, category, url, team, tags, isPublic, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category) updateData.category = category;
    if (url !== undefined) updateData.url = url;
    if (team !== undefined) updateData.team = team;
    if (tags) updateData.tags = tags;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (isActive !== undefined) updateData.isActive = isActive;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!service || service.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('service-updated', {
      service,
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error updating service:', error);
    res.status(500).json({ error: 'Error updating service.' });
  }
};

// Update service status
const updateServiceStatus = async (req, res) => {
  try {
    const { status, message } = req.body;
    const serviceId = req.params.id;

    const service = await Service.findById(serviceId);
    if (!service || service.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const previousStatus = service.status;
    service.status = status;
    if (message) service.statusMessage = message;
    service.lastCheck = new Date();

    await service.save();

    // Create status update record
    await StatusUpdate.create({
      organization: req.user.organization,
      service: serviceId,
      previousStatus,
      newStatus: status,
      message,
      triggeredBy: 'manual',
      author: req.user._id,
      isPublic: true
    });

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('service-status-updated', {
      service,
      previousStatus,
      newStatus: status,
      message,
      organization: req.user.organization
    });

    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Error updating service status:', error);
    res.status(500).json({ error: 'Error updating service status.' });
  }
};

// Delete service
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service || service.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Check if service has active incidents or maintenance
    const activeIncidents = await Incident.countDocuments({ 
      services: service._id, 
      isActive: true 
    });
    
    const activeMaintenance = await Maintenance.countDocuments({ 
      services: service._id, 
      isActive: true 
    });

    if (activeIncidents > 0 || activeMaintenance > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete service with active incidents or maintenance.' 
      });
    }

    await Service.findByIdAndDelete(req.params.id);

    // Emit real-time update
    const io = req.app.get('io');
    io.to(`org-${req.user.organization}`).emit('service-deleted', {
      serviceId: req.params.id,
      organization: req.user.organization
    });

    res.json({
      success: true,
      message: 'Service deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting service:', error);
    res.status(500).json({ error: 'Error deleting service.' });
  }
};

// Get service status history
const getServiceStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50 } = req.query;

    const service = await Service.findById(id);
    if (!service || service.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    const statusUpdates = await StatusUpdate.find({ service: id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('author', 'firstName lastName');

    res.json({
      success: true,
      data: statusUpdates
    });
  } catch (error) {
    console.error('Error fetching service status history:', error);
    res.status(500).json({ error: 'Error fetching service status history.' });
  }
};

module.exports = {
  createService,
  getServices,
  getPublicServices,
  getService,
  updateService,
  updateServiceStatus,
  deleteService,
  getServiceStatusHistory
};
