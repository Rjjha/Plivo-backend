const mongoose = require('mongoose');

const statusUpdateSchema = new mongoose.Schema({
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  previousStatus: {
    type: String,
    enum: ['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'under_maintenance']
  },
  newStatus: {
    type: String,
    enum: ['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'under_maintenance'],
    required: true
  },
  message: {
    type: String,
    trim: true,
    maxlength: 500
  },
  triggeredBy: {
    type: String,
    enum: ['manual', 'incident', 'maintenance', 'system', 'monitoring'],
    default: 'manual'
  },
  incident: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  },
  maintenance: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Maintenance'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
statusUpdateSchema.index({ organization: 1 });
statusUpdateSchema.index({ service: 1 });
statusUpdateSchema.index({ createdAt: -1 });
statusUpdateSchema.index({ newStatus: 1 });

module.exports = mongoose.model('StatusUpdate', statusUpdateSchema);
