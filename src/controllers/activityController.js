const Service = require('../models/Service');
const Incident = require('../models/Incident');
const Maintenance = require('../models/Maintenance');
const StatusUpdate = require('../models/StatusUpdate');

// Get recent activity for dashboard
const getRecentActivity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent status updates
    let statusUpdates = [];
    try {
      statusUpdates = await StatusUpdate.find({ 
        organization: req.user.organization 
      })
      .populate('service', 'name category')
      .populate('author', 'firstName lastName')
      .populate('incident', 'title')
      .populate('maintenance', 'title')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 2);
    } catch (error) {
      console.log('No status updates found:', error.message);
    }

    // Get recent incidents
    let incidents = [];
    try {
      incidents = await Incident.find({ 
        organization: req.user.organization 
      })
      .populate('services', 'name category')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 4);
    } catch (error) {
      console.log('No incidents found:', error.message);
    }

    // Get recent maintenance
    let maintenance = [];
    try {
      maintenance = await Maintenance.find({ 
        organization: req.user.organization 
      })
      .populate('services', 'name category')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) / 4);
    } catch (error) {
      console.log('No maintenance found:', error.message);
    }

    // Combine and format activities
    const activities = [];

    // Add status updates
    statusUpdates.forEach(update => {
      let description = update.message;
      
      // Enhance description based on context
      if (update.incident) {
        description = `Status changed due to incident: ${update.incident.title}`;
      } else if (update.maintenance) {
        description = `Status changed due to maintenance: ${update.maintenance.title}`;
      } else if (update.triggeredBy === 'manual') {
        description = `Manual status update: ${update.message}`;
      } else if (update.triggeredBy === 'system') {
        description = `System detected issue: ${update.message}`;
      } else if (update.triggeredBy === 'monitoring') {
        description = `Monitoring alert: ${update.message}`;
      }
      
      activities.push({
        id: update._id,
        type: 'status_update',
        title: `Status updated for ${update.service?.name || 'Unknown Service'}`,
        description: description,
        status: update.newStatus,
        timestamp: update.createdAt,
        author: update.author,
        service: update.service,
        incident: update.incident,
        maintenance: update.maintenance,
        triggeredBy: update.triggeredBy
      });
    });

    // Add incidents
    incidents.forEach(incident => {
      let description = incident.description;
      if (!description) {
        const serviceNames = incident.services?.map(s => s.name).join(', ') || 'Unknown services';
        description = `${incident.severity} severity incident affecting ${serviceNames}`;
      }
      
      activities.push({
        id: incident._id,
        type: 'incident',
        title: incident.title,
        description: description,
        status: incident.status,
        severity: incident.severity,
        timestamp: incident.createdAt,
        author: incident.createdBy,
        services: incident.services
      });
    });

    // Add maintenance
    maintenance.forEach(maint => {
      let description = maint.description;
      if (!description) {
        const serviceNames = maint.services?.map(s => s.name).join(', ') || 'Unknown services';
        const startTime = new Date(maint.scheduledStart).toLocaleString();
        description = `Scheduled maintenance for ${serviceNames} starting at ${startTime}`;
      }
      
      activities.push({
        id: maint._id,
        type: 'maintenance',
        title: maint.title,
        description: description,
        status: maint.status,
        timestamp: maint.createdAt,
        author: maint.createdBy,
        services: maint.services,
        scheduledStart: maint.scheduledStart,
        scheduledEnd: maint.scheduledEnd
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    activities.splice(parseInt(limit));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Error fetching recent activity.' });
  }
};

// Get activity for specific service
const getServiceActivity = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { limit = 50 } = req.query;

    // Verify service belongs to organization
    const service = await Service.findById(serviceId);
    if (!service || service.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Service not found.' });
    }

    // Get status updates for this service
    const statusUpdates = await StatusUpdate.find({ 
      service: serviceId,
      organization: req.user.organization 
    })
    .populate('author', 'firstName lastName')
    .populate('incident', 'title')
    .populate('maintenance', 'title')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

    // Get incidents affecting this service
    const incidents = await Incident.find({ 
      services: serviceId,
      organization: req.user.organization 
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) / 2);

    // Get maintenance affecting this service
    const maintenance = await Maintenance.find({ 
      services: serviceId,
      organization: req.user.organization 
    })
    .populate('createdBy', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit) / 2);

    // Combine activities
    const activities = [];

    statusUpdates.forEach(update => {
      activities.push({
        id: update._id,
        type: 'status_update',
        title: `Status updated`,
        description: update.message,
        status: update.newStatus,
        timestamp: update.createdAt,
        author: update.author,
        incident: update.incident,
        maintenance: update.maintenance
      });
    });

    incidents.forEach(incident => {
      activities.push({
        id: incident._id,
        type: 'incident',
        title: incident.title,
        description: incident.description,
        status: incident.status,
        severity: incident.severity,
        timestamp: incident.createdAt,
        author: incident.createdBy
      });
    });

    maintenance.forEach(maint => {
      activities.push({
        id: maint._id,
        type: 'maintenance',
        title: maint.title,
        description: maint.description,
        status: maint.status,
        timestamp: maint.createdAt,
        author: maint.createdBy,
        scheduledStart: maint.scheduledStart,
        scheduledEnd: maint.scheduledEnd
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching service activity:', error);
    res.status(500).json({ error: 'Error fetching service activity.' });
  }
};

module.exports = {
  getRecentActivity,
  getServiceActivity
};
