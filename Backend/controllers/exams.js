const Exam = require('../models/Exam');
const asyncHandler = require('../middleware/async');

// @desc    Get all exams
// @route   GET /api/v1/exams
// @access  Public
exports.getExams = asyncHandler(async (req, res, next) => {
  const exams = await Exam.find({ isActive: true });

  res.status(200).json({
    success: true,
    count: exams.length,
    data: exams
  });
});

// @desc    Get single exam
// @route   GET /api/v1/exams/:id
// @access  Public
exports.getExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id).populate('colleges');

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Get exam by name
// @route   GET /api/v1/exams/name/:name
// @access  Public
exports.getExamByName = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findOne({ 
    name: { $regex: new RegExp(req.params.name, 'i') } 
  }).populate('colleges');

  if (!exam) {
    return next(new ErrorResponse('Exam not found', 404));
  }

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Get cutoff trends for exam
// @route   GET /api/v1/exams/:id/cutoff-trends
// @access  Public
exports.getExamCutoffTrends = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id).select('cutoffTrends');

  if (!exam) {
    return next(new ErrorResponse('Exam not found', 404));
  }

  // Group by category and year
  const trends = {
    general: [],
    obc: [],
    sc: [],
    st: [],
    ews: []
  };

  exam.cutoffTrends.forEach(trend => {
    Object.keys(trends).forEach(category => {
      trends[category].push({
        year: trend.year,
        opening: trend.openingRank[category],
        closing: trend.closingRank[category]
      });
    });
  });

  // Sort by year
  Object.keys(trends).forEach(category => {
    trends[category].sort((a, b) => a.year - b.year);
  });

  res.status(200).json({
    success: true,
    data: trends
  });
});

// @desc    Get exam resources
// @route   GET /api/v1/exams/:id/resources
// @access  Public
exports.getExamResources = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id).select('resources previousYearPapers syllabus');

  if (!exam) {
    return next(new ErrorResponse('Exam not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      books: exam.resources.books,
      onlinePlatforms: exam.resources.onlinePlatforms,
      coachingCenters: exam.resources.coachingCenters,
      previousYearPapers: exam.previousYearPapers,
      syllabus: exam.syllabus
    }
  });
});

// @desc    Create exam
// @route   POST /api/v1/exams
// @access  Private/Admin
exports.createExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.create(req.body);

  res.status(201).json({
    success: true,
    data: exam
  });
});

// @desc    Update exam
// @route   PUT /api/v1/exams/:id
// @access  Private/Admin
exports.updateExam = asyncHandler(async (req, res, next) => {
  let exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  exam.lastUpdated = Date.now();
  await exam.save();

  res.status(200).json({
    success: true,
    data: exam
  });
});

// @desc    Delete exam
// @route   DELETE /api/v1/exams/:id
// @access  Private/Admin
exports.deleteExam = asyncHandler(async (req, res, next) => {
  const exam = await Exam.findById(req.params.id);

  if (!exam) {
    return next(new ErrorResponse(`Exam not found with id of ${req.params.id}`, 404));
  }

  await exam.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});