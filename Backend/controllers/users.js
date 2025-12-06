const User = require('../models/User');
const College = require('../models/College');
const asyncHandler = require('../middleware/async');

// @desc    Get all users
// @route   GET /api/v1/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/v1/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Create user
// @route   POST /api/v1/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
  const user = await User.create(req.body);

  res.status(201).json({
    success: true,
    data: user
  });
});

// @desc    Update user
// @route   PUT /api/v1/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/v1/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Save college to user's list
// @route   POST /api/v1/users/save-college/:collegeId
// @access  Private
exports.saveCollege = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const college = await College.findById(req.params.collegeId);

  if (!college) {
    return next(new ErrorResponse('College not found', 404));
  }

  // Check if already saved
  if (user.savedColleges.includes(req.params.collegeId)) {
    return next(new ErrorResponse('College already saved', 400));
  }

  user.savedColleges.push(req.params.collegeId);
  await user.save();

  // Increment save count in college
  college.saveCount += 1;
  await college.save();

  res.status(200).json({
    success: true,
    data: user.savedColleges
  });
});

// @desc    Remove college from saved list
// @route   DELETE /api/v1/users/save-college/:collegeId
// @access  Private
exports.removeSavedCollege = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.savedColleges = user.savedColleges.filter(
    collegeId => collegeId.toString() !== req.params.collegeId
  );

  await user.save();

  // Decrement save count in college
  const college = await College.findById(req.params.collegeId);
  if (college) {
    college.saveCount = Math.max(0, college.saveCount - 1);
    await college.save();
  }

  res.status(200).json({
    success: true,
    data: user.savedColleges
  });
});

// @desc    Add college to compare list
// @route   POST /api/v1/users/compare-college/:collegeId
// @access  Private
exports.addToCompare = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const college = await College.findById(req.params.collegeId);

  if (!college) {
    return next(new ErrorResponse('College not found', 404));
  }

  // Check if already in compare list
  if (user.comparedColleges.includes(req.params.collegeId)) {
    return next(new ErrorResponse('College already in compare list', 400));
  }

  // Limit to 4 colleges
  if (user.comparedColleges.length >= 4) {
    return next(new ErrorResponse('Cannot compare more than 4 colleges', 400));
  }

  user.comparedColleges.push(req.params.collegeId);
  await user.save();

  // Increment compare count in college
  college.compareCount += 1;
  await college.save();

  res.status(200).json({
    success: true,
    data: user.comparedColleges
  });
});

// @desc    Remove college from compare list
// @route   DELETE /api/v1/users/compare-college/:collegeId
// @access  Private
exports.removeFromCompare = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.comparedColleges = user.comparedColleges.filter(
    collegeId => collegeId.toString() !== req.params.collegeId
  );

  await user.save();

  // Decrement compare count in college
  const college = await College.findById(req.params.collegeId);
  if (college) {
    college.compareCount = Math.max(0, college.compareCount - 1);
    await college.save();
  }

  res.status(200).json({
    success: true,
    data: user.comparedColleges
  });
});

// @desc    Update exam scores
// @route   PUT /api/v1/users/exam-scores
// @access  Private
exports.updateExamScores = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const { examScores } = req.body;

  // Validate exam scores
  if (!examScores || !Array.isArray(examScores)) {
    return next(new ErrorResponse('Invalid exam scores data', 400));
  }

  user.examScores = examScores;
  await user.save();

  res.status(200).json({
    success: true,
    data: user.examScores
  });
});

// @desc    Update academic info
// @route   PUT /api/v1/users/academic-info
// @access  Private
exports.updateAcademicInfo = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const { academicInfo } = req.body;

  if (!academicInfo) {
    return next(new ErrorResponse('Academic info is required', 400));
  }

  user.academicInfo = { ...user.academicInfo, ...academicInfo };
  await user.save();

  res.status(200).json({
    success: true,
    data: user.academicInfo
  });
});

// @desc    Update preferences
// @route   PUT /api/v1/users/preferences
// @access  Private
exports.updatePreferences = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  const { preferences } = req.body;

  if (!preferences) {
    return next(new ErrorResponse('Preferences are required', 400));
  }

  user.preferences = { ...user.preferences, ...preferences };
  await user.save();

  res.status(200).json({
    success: true,
    data: user.preferences
  });
});

// @desc    Get user dashboard data
// @route   GET /api/v1/users/dashboard
// @access  Private
exports.getDashboard = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('savedColleges')
    .populate('comparedColleges')
    .populate('applications');

  // Get personalized recommendations
  const recommendations = await getPersonalizedRecommendations(user);

  res.status(200).json({
    success: true,
    data: {
      user,
      recommendations,
      stats: {
        savedColleges: user.savedColleges.length,
        comparedColleges: user.comparedColleges.length,
        applications: user.applications.length
      }
    }
  });
});

// Helper function for personalized recommendations
const getPersonalizedRecommendations = async (user) => {
  let query = {};

  // Filter by preferences
  if (user.preferences) {
    if (user.preferences.preferredCourses && user.preferences.preferredCourses.length > 0) {
      query['courses.courseName'] = { $in: user.preferences.preferredCourses };
    }

    if (user.preferences.preferredLocations && user.preferences.preferredLocations.length > 0) {
      const states = user.preferences.preferredLocations.map(loc => loc.state);
      query['location.state'] = { $in: states };
    }

    if (user.preferences.maxFees) {
      query['courses.fees.totalFee'] = { $lte: user.preferences.maxFees };
    }

    if (user.preferences.minPlacement) {
      query['placement.averagePackage'] = { $gte: user.preferences.minPlacement };
    }
  }

  // Filter by exam scores
  if (user.examScores && user.examScores.length > 0) {
    const examNames = user.examScores.map(score => score.examName);
    query['cutoffs.exam'] = { $in: examNames };
  }

  // Filter out already saved colleges
  if (user.savedColleges && user.savedColleges.length > 0) {
    query._id = { $nin: user.savedColleges.map(college => college._id) };
  }

  const recommendations = await College.find(query)
    .sort({ 'ranking.nirf.overall': 1, 'placement.averagePackage': -1 })
    .limit(10);

  return recommendations;
};