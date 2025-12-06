const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'College name is required'],
    unique: true,
    trim: true,
    index: true
  },
  shortName: String,
  type: {
    type: String,
    enum: ['Government', 'Private', 'Deemed', 'Autonomous', 'Institute of National Importance'],
    required: true
  },
  establishmentYear: Number,
  
  // Location
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: String,
    country: {
      type: String,
      default: 'India'
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact Information
  contact: {
    phone: [String],
    email: String,
    website: String,
    fax: String
  },
  
  // Rankings & Accreditation
  accreditation: {
    naacGrade: {
      type: String,
      enum: ['A++', 'A+', 'A', 'B++', 'B+', 'B', 'C', null]
    },
    naacScore: Number,
    isUgcApproved: Boolean,
    isAicteApproved: Boolean,
    isNbaAccredited: Boolean
  },
  
  ranking: {
    nirf: {
      overall: Number,
      engineering: Number,
      medical: Number,
      pharmacy: Number,
      management: Number,
      law: Number,
      architecture: Number,
      year: Number
    },
    indiaToday: Number,
    outlook: Number,
    week: Number
  },
  
  // Courses Offered
  courses: [{
    courseName: {
      type: String,
      required: true
    },
    degree: {
      type: String,
      enum: ['Diploma', 'UG', 'PG', 'Doctorate', 'Integrated']
    },
    duration: String,
    specialization: [String],
    fees: {
      tuitionFee: Number,
      hostelFee: Number,
      messFee: Number,
      otherCharges: Number,
      totalFee: Number
    },
    seats: {
      total: Number,
      general: Number,
      obc: Number,
      sc: Number,
      st: Number,
      ews: Number
    },
    eligibility: {
      exam: [String],
      minPercentage: Number,
      categorySpecific: Boolean
    },
    admissionProcess: String
  }],
  
  // Admission Cutoffs
  cutoffs: [{
    exam: String,
    course: String,
    year: Number,
    round: Number,
    openingRank: {
      general: Number,
      obc: Number,
      sc: Number,
      st: Number,
      ews: Number
    },
    closingRank: {
      general: Number,
      obc: Number,
      sc: Number,
      st: Number,
      ews: Number
    }
  }],
  
  // Placement Statistics
  placement: {
    year: Number,
    totalStudents: Number,
    placedStudents: Number,
    placementPercentage: Number,
    averagePackage: Number,
    medianPackage: Number,
    highestPackage: Number,
    topRecruiters: [String],
    internshipPercentage: Number
  },
  
  // Infrastructure
  infrastructure: {
    campusArea: String,
    classrooms: Number,
    labs: Number,
    library: {
      books: Number,
      journals: Number,
      digitalResources: Boolean
    },
    hostels: {
      boys: Boolean,
      girls: Boolean,
      capacity: Number,
      rooms: String
    },
    sportsFacilities: [String],
    medicalFacilities: Boolean,
    wifiCampus: Boolean,
    auditorium: Boolean,
    cafeteria: Boolean
  },
  
  // Faculty
  faculty: {
    total: Number,
    phd: Number,
    studentFacultyRatio: Number,
    guestLecturers: Number,
    visitingFaculty: Number
  },
  
  // Campus Life
  campusLife: {
    clubs: [String],
    festivals: [String],
    annualEvents: [String],
    nssNcc: Boolean
  },
  
  // Media
  images: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['campus', 'lab', 'hostel', 'event', 'other']
    }
  }],
  videos: [{
    url: String,
    caption: String,
    type: {
      type: String,
      enum: ['virtualTour', 'campusTour', 'interview', 'other']
    }
  }],
  
  // Reviews & Ratings
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      overall: { type: Number, min: 1, max: 5 },
      academics: { type: Number, min: 1, max: 5 },
      placement: { type: Number, min: 1, max: 5 },
      infrastructure: { type: Number, min: 1, max: 5 },
      faculty: { type: Number, min: 1, max: 5 },
      campusLife: { type: Number, min: 1, max: 5 }
    },
    comment: String,
    pros: [String],
    cons: [String],
    isVerifiedStudent: {
      type: Boolean,
      default: false
    },
    helpfulCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Social Media
  socialMedia: {
    facebook: String,
    twitter: String,
    linkedin: String,
    instagram: String,
    youtube: String
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  saveCount: {
    type: Number,
    default: 0
  },
  compareCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
collegeSchema.index({ 'location.state': 1, 'location.city': 1 });
collegeSchema.index({ 'courses.courseName': 1 });
collegeSchema.index({ 'courses.fees.totalFee': 1 });
collegeSchema.index({ 'ranking.nirf.overall': 1 });
collegeSchema.index({ 'placement.averagePackage': -1 });
collegeSchema.index({ name: 'text', 'location.city': 'text', 'courses.courseName': 'text' });

module.exports = mongoose.model('College', collegeSchema);
