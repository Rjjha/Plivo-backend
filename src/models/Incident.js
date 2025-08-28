const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  }],
  status: {
    type: String,
    enum: ['investigating', 'identified', 'monitoring', 'resolved', 'postmortem'],
    default: 'investigating'
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  impact: {
    type: String,
    enum: ['none', 'minor', 'major', 'critical'],
    default: 'minor'
  },
  startedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  resolvedAt: {
    type: Date
  },
  estimatedResolution: {
    type: Date
  },
  updates: [{
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['investigating', 'identified', 'monitoring', 'resolved', 'postmortem']
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
incidentSchema.index({ organization: 1 });
incidentSchema.index({ services: 1 });
incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ startedAt: -1 });
incidentSchema.index({ isActive: 1 });

// Virtual for duration
incidentSchema.virtual('duration').get(function() {
  if (this.resolvedAt) {
    return this.resolvedAt - this.startedAt;
  }
  return Date.now() - this.startedAt;
});

module.exports = mongoose.model('Incident', incidentSchema);
