const Application = require('../models/Application');
const College = require('../models/College');
const asyncHandler = require('../middleware/async');

// @desc    Get user's applications
// @route   GET /api/v1/applications
// @access  Private
exports.getApplications = asyncHandler(async (req, res, next) => {
  const applications = await Application.find({ user: req.user.id })
    .populate('college', 'name location')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: applications.length,
    data: applications
  });
});

// @desc    Get single application
// @route   GET /api/v1/applications/:id
// @access  Private
exports.getApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id)
    .populate('college')
    .populate('user', 'name email phone');

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check ownership
  if (application.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this application', 401));
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Create new application
// @route   POST /api/v1/applications
// @access  Private
exports.createApplication = asyncHandler(async (req, res, next) => {
  // Check if college exists
  const college = await College.findById(req.body.college);
  if (!college) {
    return next(new ErrorResponse('College not found', 404));
  }

  // Check if course exists in college
  const courseExists = college.courses.some(course => 
    course.courseName === req.body.course
  );

  if (!courseExists) {
    return next(new ErrorResponse('Course not offered by this college', 400));
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    user: req.user.id,
    college: req.body.college,
    course: req.body.course
  });

  if (existingApplication) {
    return next(new ErrorResponse('You have already applied for this course in this college', 400));
  }

  // Create application
  const application = await Application.create({
    ...req.body,
    user: req.user.id,
    status: 'draft'
  });

  res.status(201).json({
    success: true,
    data: application
  });
});

// @desc    Update application
// @route   PUT /api/v1/applications/:id
// @access  Private
exports.updateApplication = asyncHandler(async (req, res, next) => {
  let application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check ownership
  if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to update this application', 401));
  }

  // Cannot update submitted application
  if (application.status !== 'draft' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Cannot update submitted application', 400));
  }

  application = await Application.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  // Add status history entry if status changed
  if (req.body.status && req.body.status !== application.status) {
    application.statusHistory.push({
      status: req.body.status,
      changedAt: Date.now(),
      changedBy: req.user.role === 'admin' ? 'admin' : 'user'
    });
    await application.save();
  }

  res.status(200).json({
    success: true,
    data: application
  });
});

// @desc    Delete application
// @route   DELETE /api/v1/applications/:id
// @access  Private
exports.deleteApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check ownership
  if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to delete this application', 401));
  }

  // Only allow deletion of draft applications
  if (application.status !== 'draft' && req.user.role !== 'admin') {
    return next(new ErrorResponse('Cannot delete submitted application', 400));
  }

  await application.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Submit application
// @route   POST /api/v1/applications/:id/submit
// @access  Private
exports.submitApplication = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check ownership
  if (application.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to submit this application', 401));
  }

  // Validate required fields
  const requiredFields = [
    'personalInfo.name',
    'personalInfo.dob',
    'personalInfo.gender',
    'academicInfo.tenth',
    'academicInfo.twelfth',
    'examDetails'
  ];

  const missingFields = requiredFields.filter(field => {
    const keys = field.split('.');
    let value = application;
    for (const key of keys) {
      value = value[key];
      if (value === undefined || value === null) return true;
    }
    return false;
  });

  if (missingFields.length > 0) {
    return next(new ErrorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400));
  }

  // Validate documents
  const requiredDocuments = ['photo', 'signature', 'marksheet'];
  const hasRequiredDocs = requiredDocuments.every(docType => 
    application.documents.some(doc => doc.type === docType && doc.verified !== false)
  );

  if (!hasRequiredDocs) {
    return next(new ErrorResponse('Missing required documents', 400));
  }

  // Update application
  application.status = 'submitted';
  application.timeline.submittedAt = Date.now();
  
  application.statusHistory.push({
    status: 'submitted',
    changedAt: Date.now(),
    changedBy: 'user'
  });

  await application.save();

  // TODO: Send confirmation email

  res.status(200).json({
    success: true,
    data: application,
    message: 'Application submitted successfully'
  });
});

// @desc    Upload document
// @route   POST /api/v1/applications/:id/documents
// @access  Private
exports.uploadDocument = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id);

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check ownership
  if (application.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to upload documents for this application', 401));
  }

  const { name, type, url } = req.body;

  // Check if document type already exists
  const existingDocIndex = application.documents.findIndex(doc => doc.type === type);
  
  if (existingDocIndex > -1) {
    // Update existing document
    application.documents[existingDocIndex] = {
      name,
      type,
      url,
      uploadedAt: Date.now(),
      verified: false
    };
  } else {
    // Add new document
    application.documents.push({
      name,
      type,
      url,
      uploadedAt: Date.now(),
      verified: false
    });
  }

  await application.save();

  res.status(200).json({
    success: true,
    data: application.documents
  });
});

// @desc    Get application statistics
// @route   GET /api/v1/applications/stats
// @access  Private
exports.getApplicationStats = asyncHandler(async (req, res, next) => {
  const stats = await Application.aggregate([
    { $match: { user: req.user._id } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const total = stats.reduce((sum, stat) => sum + stat.count, 0);

  res.status(200).json({
    success: true,
    data: {
      stats,
      total
    }
  });
});

// @desc    Get application timeline
// @route   GET /api/v1/applications/:id/timeline
// @access  Private
exports.getApplicationTimeline = asyncHandler(async (req, res, next) => {
  const application = await Application.findById(req.params.id).select('statusHistory timeline');

  if (!application) {
    return next(new ErrorResponse('Application not found', 404));
  }

  // Check ownership
  if (application.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized to access this application', 401));
  }

  const timeline = [
    {
      title: 'Application Created',
      date: application.createdAt,
      description: 'Application draft created'
    },
    ...application.statusHistory.map(history => ({
      title: `Status changed to ${history.status.replace('_', ' ')}`,
      date: history.changedAt,
      description: history.notes || `Changed by ${history.changedBy}`
    })),
    ...Object.entries(application.timeline || {})
      .filter(([_, date]) => date)
      .map(([key, date]) => ({
        title: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        date,
        description: `${key} completed`
      }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  res.status(200).json({
    success: true,
    data: timeline
  });
});