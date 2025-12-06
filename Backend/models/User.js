const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'parent', 'counselor', 'admin', 'college_rep'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: 'default_avatar.png'
  },
  examScores: [{
    examName: {
      type: String,
      enum: ['JEE Main', 'JEE Advanced', 'NEET UG', 'NEET PG', 'CUET', 
             'CAT', 'MAT', 'XAT', 'CLAT', 'AILET', 'KCET', 'MHT-CET', 
             'TNEA', 'AP EAMCET', 'WBJEE', 'NIFT', 'NID', 'Other'],
      required: true
    },
    score: Number,
    rank: Number,
    percentile: Number,
    year: Number,
    attempt: Number
  }],
  academicInfo: {
    tenthPercentage: Number,
    twelfthPercentage: Number,
    graduationPercentage: Number,
    stream: {
      type: String,
      enum: ['Science', 'Commerce', 'Arts', 'Other']
    },
    category: {
      type: String,
      enum: ['General', 'OBC', 'SC', 'ST', 'EWS', 'Other'],
      default: 'General'
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    }
  },
  preferences: {
    preferredCourses: [String],
    preferredLocations: [{
      state: String,
      city: String
    }],
    maxFees: Number,
    minPlacement: Number,
    accommodation: {
      type: String,
      enum: ['Hostel', 'Day Scholar', 'Both']
    }
  },
  savedColleges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  }],
  comparedColleges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  }],
  applications: [{
    college: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'College'
    },
    course: String,
    status: {
      type: String,
      enum: ['Draft', 'Submitted', 'Under Review', 'Accepted', 'Rejected'],
      default: 'Draft'
    },
    applicationDate: Date,
    documents: [{
      name: String,
      url: String,
      uploadedAt: Date
    }]
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: Date,
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

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Update updatedAt timestamp
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);