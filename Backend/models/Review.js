const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  entityType: {
    type: String,
    enum: ['college', 'coaching', 'exam'],
    required: true
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityType'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: String,
  comment: {
    type: String,
    required: true,
    minlength: 10
  },
  pros: [{
    type: String,
    maxlength: 100
  }],
  cons: [{
    type: String,
    maxlength: 100
  }],
  helpfulCount: {
    type: Number,
    default: 0
  },
  reportedCount: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['email', 'document', 'none']
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderatorNotes: String,
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    reportedAt: Date
  }],
  response: {
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    respondedAt: Date
  }
}, {
  timestamps: true
});

// Compound index for unique user reviews per entity
reviewSchema.index({ user: 1, entityType: 1, entityId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);