const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  status: {
    type: String,
    enum: ['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'under_maintenance'],
    default: 'operational'
  },
  statusMessage: {
    type: String,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    enum: ['website', 'api', 'database', 'infrastructure', 'third_party', 'other'],
    default: 'other'
  },
  url: {
    type: String,
    trim: true
  },
  uptime: {
    current: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    last24h: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    last7d: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    last30d: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  },
  lastCheck: {
    type: Date,
    default: Date.now
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
serviceSchema.index({ organization: 1 });
serviceSchema.index({ team: 1 });
serviceSchema.index({ status: 1 });
serviceSchema.index({ category: 1 });
serviceSchema.index({ isPublic: 1 });

module.exports = mongoose.model('Service', serviceSchema);
