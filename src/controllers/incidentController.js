const Incident = require('../models/Incident');

// Create new incident
const createIncident = async (req, res) => {
  try {
    const { title, description, services, severity, impact } = req.body;
    
    const incident = new Incident({
      title,
      description,
      services,
      severity,
      impact,
      organization: req.user.organization
    });

    await incident.save();

    res.status(201).json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error creating incident:', error);
    res.status(500).json({ error: 'Error creating incident.' });
  }
};

// Get all incidents for organization
const getIncidents = async (req, res) => {
  try {
    const incidents = await Incident.find({ organization: req.user.organization })
      .populate('services', 'name status')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: incidents
    });
  } catch (error) {
    console.error('Error fetching incidents:', error);
    res.status(500).json({ error: 'Error fetching incidents.' });
  }
};

// Get incident by ID
const getIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id)
      .populate('services', 'name status')
      .populate('assignedTo', 'firstName lastName');

    if (!incident || incident.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error fetching incident:', error);
    res.status(500).json({ error: 'Error fetching incident.' });
  }
};

// Update incident
const updateIncident = async (req, res) => {
  try {
    const { title, description, status, severity, impact } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (status) updateData.status = status;
    if (severity) updateData.severity = severity;
    if (impact) updateData.impact = impact;

    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!incident || incident.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error updating incident:', error);
    res.status(500).json({ error: 'Error updating incident.' });
  }
};

// Add update to incident
const addIncidentUpdate = async (req, res) => {
  try {
    const { message, status } = req.body;
    
    const incident = await Incident.findById(req.params.id);
    if (!incident || incident.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    incident.updates.push({
      message,
      status,
      author: req.user._id
    });

    if (status) {
      incident.status = status;
    }

    await incident.save();

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error adding incident update:', error);
    res.status(500).json({ error: 'Error adding incident update.' });
  }
};

// Resolve incident
const resolveIncident = async (req, res) => {
  try {
    const incident = await Incident.findById(req.params.id);
    if (!incident || incident.organization.toString() !== req.user.organization.toString()) {
      return res.status(404).json({ error: 'Incident not found.' });
    }

    incident.status = 'resolved';
    incident.resolvedAt = new Date();
    await incident.save();

    res.json({
      success: true,
      data: incident
    });
  } catch (error) {
    console.error('Error resolving incident:', error);
    res.status(500).json({ error: 'Error resolving incident.' });
  }
};

module.exports = {
  createIncident,
  getIncidents,
  getIncident,
  updateIncident,
  addIncidentUpdate,
  resolveIncident
};
