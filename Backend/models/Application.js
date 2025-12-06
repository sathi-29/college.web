const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  college: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College',
    required: true
  },
  course: {
    type: String,
    required: true
  },
  examDetails: {
    examName: String,
    score: Number,
    rank: Number,
    percentile: Number,
    rollNumber: String
  },
  personalInfo: {
    name: String,
    dob: Date,
    gender: String,
    category: String,
    nationality: String,
    contact: {
      phone: String,
      email: String,
      address: String
    }
  },
  academicInfo: {
    tenth: {
      board: String,
      school: String,
      percentage: Number,
      year: Number
    },
    twelfth: {
      board: String,
      school: String,
      percentage: Number,
      stream: String,
      year: Number
    },
    graduation: {
      degree: String,
      university: String,
      percentage: Number,
      year: Number
    }
  },
  documents: [{
    name: String,
    type: {
      type: String,
      enum: ['photo', 'signature', 'marksheet', 'certificate', 'id', 'other']
    },
    url: String,
    uploadedAt: Date,
    verified: {
      type: Boolean,
      default: false
    }
  }],
  payment: {
    amount: Number,
    paymentId: String,
    transactionId: String,
    method: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'shortlisted', 
           'rejected', 'accepted', 'waitlisted', 'withdrawn'],
    default: 'draft'
  },
  statusHistory: [{
    status: String,
    changedAt: Date,
    notes: String,
    changedBy: String
  }],
  timeline: {
    submittedAt: Date,
    reviewedAt: Date,
    decisionAt: Date
  },
  notes: String,
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  isScholarshipApplied: {
    type: Boolean,
    default: false
  },
  scholarshipDetails: {
    type: String,
    amount: Number,
    status: String
  },
  communication: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'notification', 'call']
    },
    subject: String,
    message: String,
    sentAt: Date,
    read: Boolean
  }]
}, {
  timestamps: true
});

// Index for faster queries
applicationSchema.index({ user: 1, college: 1, course: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ 'timeline.decisionAt': 1 });

module.exports = mongoose.model('Application', applicationSchema);