const Organization = require('../models/Organization');
const User = require('../models/User');

// Create new organization
const createOrganization = async (req, res) => {
  try {
    const { name, description, domain, primaryColor } = req.body;
    
    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    // Check if slug already exists
    const existingOrg = await Organization.findOne({ slug });
    if (existingOrg) {
      return res.status(400).json({ error: 'Organization with this name already exists.' });
    }

    const organization = new Organization({
      name,
      slug,
      description,
      domain,
      primaryColor
    });

    await organization.save();

    // Update user's organization
    await User.findByIdAndUpdate(req.user._id, { organization: organization._id });

    res.status(201).json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Error creating organization.' });
  }
};

// Get organization by slug (public)
const getOrganizationBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const organization = await Organization.findOne({ slug, 'settings.publicPage': true });
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Error fetching organization.' });
  }
};

// Get organization details (authenticated)
const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.user.organization);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found.' });
    }

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    res.status(500).json({ error: 'Error fetching organization.' });
  }
};

// Update organization
const updateOrganization = async (req, res) => {
  try {
    const { name, description, domain, primaryColor, settings } = req.body;
    
    // Only admins can update organization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update organization.' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (domain !== undefined) updateData.domain = domain;
    if (primaryColor) updateData.primaryColor = primaryColor;
    if (settings) updateData.settings = { ...req.user.organization.settings, ...settings };

    const organization = await Organization.findByIdAndUpdate(
      req.user.organization,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: organization
    });
  } catch (error) {
    console.error('Error updating organization:', error);
    res.status(500).json({ error: 'Error updating organization.' });
  }
};

// Delete organization
const deleteOrganization = async (req, res) => {
  try {
    // Only admins can delete organization
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete organization.' });
    }

    await Organization.findByIdAndDelete(req.user.organization);
    
    // Note: In a real app, you'd want to handle cascading deletes for users, services, etc.

    res.json({
      success: true,
      message: 'Organization deleted successfully.'
    });
  } catch (error) {
    console.error('Error deleting organization:', error);
    res.status(500).json({ error: 'Error deleting organization.' });
  }
};

// Get organization statistics
const getOrganizationStats = async (req, res) => {
  try {
    const organizationId = req.user.organization;
    
    // Get counts for various entities
    const stats = await Promise.all([
      User.countDocuments({ organization: organizationId }),
      require('../models/Service').countDocuments({ organization: organizationId }),
      require('../models/Incident').countDocuments({ organization: organizationId, isActive: true }),
      require('../models/Maintenance').countDocuments({ organization: organizationId, isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        users: stats[0],
        services: stats[1],
        activeIncidents: stats[2],
        activeMaintenance: stats[3]
      }
    });
  } catch (error) {
    console.error('Error fetching organization stats:', error);
    res.status(500).json({ error: 'Error fetching organization statistics.' });
  }
};

module.exports = {
  createOrganization,
  getOrganizationBySlug,
  getOrganization,
  updateOrganization,
  deleteOrganization,
  getOrganizationStats
};
