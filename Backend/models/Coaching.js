const mongoose = require('mongoose');

const coachingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Online', 'Offline', 'Hybrid'],
    required: true
  },
  examsPrepared: [String],
  description: String,
  
  // Contact Information
  contact: {
    phone: [String],
    email: String,
    website: String,
    address: String
  },
  
  // Centers (for offline/hybrid)
  centers: [{
    city: String,
    address: String,
    contact: String,
    facilities: [String]
  }],
  
  // Courses Offered
  courses: [{
    name: String,
    exam: String,
    mode: {
      type: String,
      enum: ['Live Online', 'Recorded', 'Classroom', 'Hybrid']
    },
    duration: String,
    batchSize: Number,
    fee: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      installmentOptions: [{
        name: String,
        amount: Number
      }]
    },
    features: [String],
    schedule: {
      startDate: Date,
      classTimings: String,
      days: [String]
    },
    faculty: [String]
  }],
  
  // Faculty
  faculty: [{
    name: String,
    qualification: String,
    experience: String,
    specialization: String,
    rating: Number
  }],
  
  // Infrastructure (for offline centers)
  infrastructure: {
    classrooms: Number,
    seatingCapacity: Number,
    digitalClassrooms: Boolean,
    library: Boolean,
    hostel: Boolean,
    wifi: Boolean,
    parking: Boolean
  },
  
  // Success Stats
  successStats: {
    totalStudents: Number,
    selectionRate: Number,
    topRankers: [{
      name: String,
      rank: Number,
      year: Number,
      exam: String
    }],
    averageImprovement: Number
  },
  
  // Reviews & Ratings
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      overall: { type: Number, min: 1, max: 5 },
      faculty: { type: Number, min: 1, max: 5 },
      material: { type: Number, min: 1, max: 5 },
      infrastructure: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 }
    },
    comment: String,
    pros: [String],
    cons: [String],
    helpfulCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Bookings
  bookings: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coaching.courses'
    },
    bookingDate: Date,
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
      default: 'Pending'
    },
    payment: {
      amount: Number,
      paymentId: String,
      paymentMethod: String,
      paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
        default: 'Pending'
      },
      transactionId: String
    }
  }],
  
  // Social Proof
  socialProof: {
    youtubeChannel: String,
    studentTestimonials: [{
      name: String,
      text: String,
      videoUrl: String,
      rank: String
    }]
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  documents: [{
    name: String,
    url: String,
    verified: Boolean
  }],
  
  // Performance Metrics
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  bookingCount: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  
  // Commission (for platform)
  commissionRate: {
    type: Number,
    default: 15 // 15% commission
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coaching', coachingSchema);