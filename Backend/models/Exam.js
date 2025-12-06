const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  fullName: String,
  type: {
    type: String,
    enum: ['Engineering', 'Medical', 'Management', 'Law', 'Design', 'General', 'State Level'],
    required: true
  },
  conductingBody: String,
  website: String,
  eligibility: {
    minAge: Number,
    maxAge: Number,
    educationalQualification: String,
    minPercentage: Number,
    subjectsRequired: [String]
  },
  examPattern: {
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Both']
    },
    duration: Number,
    totalMarks: Number,
    negativeMarking: Boolean,
    sections: [{
      name: String,
      questions: Number,
      marks: Number,
      duration: Number
    }]
  },
  importantDates: [{
    event: String,
    date: Date,
    description: String
  }],
  syllabus: [{
    subject: String,
    topics: [String]
  }],
  applicationProcess: {
    fee: {
      general: Number,
      obc: Number,
      sc: Number,
      st: Number,
      ews: Number
    },
    documentsRequired: [String],
    steps: [String]
  },
  colleges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'College'
  }],
  previousYearPapers: [{
    year: Number,
    paperUrl: String,
    solutionUrl: String,
    analysisUrl: String
  }],
  cutoffTrends: [{
    year: Number,
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
  resources: {
    books: [{
      name: String,
      author: String,
      publisher: String
    }],
    onlinePlatforms: [{
      name: String,
      url: String
    }],
    coachingCenters: [{
      name: String,
      location: String,
      contact: String
    }]
  },
  faqs: [{
    question: String,
    answer: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exam', examSchema);