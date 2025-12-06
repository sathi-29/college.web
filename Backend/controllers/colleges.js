const College = require('../models/College');
const asyncHandler = require('../middleware/async');

// @desc    Get all colleges
// @route   GET /api/v1/colleges
// @access  Public
exports.getColleges = asyncHandler(async (req, res, next) => {
  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let query = College.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await College.countDocuments(JSON.parse(queryStr));

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const colleges = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: colleges.length,
    pagination,
    data: colleges
  });
});

// @desc    Get single college
// @route   GET /api/v1/colleges/:id
// @access  Public
exports.getCollege = asyncHandler(async (req, res, next) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    return next(new ErrorResponse(`College not found with id of ${req.params.id}`, 404));
  }

  // Increment view count
  college.viewCount += 1;
  await college.save();

  res.status(200).json({
    success: true,
    data: college
  });
});

// @desc    Create new college
// @route   POST /api/v1/colleges
// @access  Private/Admin
exports.createCollege = asyncHandler(async (req, res, next) => {
  const college = await College.create(req.body);

  res.status(201).json({
    success: true,
    data: college
  });
});

// @desc    Update college
// @route   PUT /api/v1/colleges/:id
// @access  Private/Admin
exports.updateCollege = asyncHandler(async (req, res, next) => {
  const college = await College.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!college) {
    return next(new ErrorResponse(`College not found with id of ${req.params.id}`, 404));
  }

  // Update lastUpdated
  college.lastUpdated = Date.now();
  await college.save();

  res.status(200).json({
    success: true,
    data: college
  });
});

// @desc    Delete college
// @route   DELETE /api/v1/colleges/:id
// @access  Private/Admin
exports.deleteCollege = asyncHandler(async (req, res, next) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    return next(new ErrorResponse(`College not found with id of ${req.params.id}`, 404));
  }

  await college.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search colleges
// @route   GET /api/v1/colleges/search
// @access  Public
exports.searchColleges = asyncHandler(async (req, res, next) => {
  const { q, filters } = req.query;

  let query = {};

  // Text search
  if (q) {
    query.$text = { $search: q };
  }

  // Apply filters
  if (filters) {
    const filterObj = JSON.parse(filters);

    // Location filters
    if (filterObj.state) {
      query['location.state'] = filterObj.state;
    }
    if (filterObj.city) {
      query['location.city'] = filterObj.city;
    }

    // Course filter
    if (filterObj.course) {
      query['courses.courseName'] = filterObj.course;
    }

    // Fee range
    if (filterObj.minFee || filterObj.maxFee) {
      query['courses.fees.totalFee'] = {};
      if (filterObj.minFee) {
        query['courses.fees.totalFee'].$gte = parseInt(filterObj.minFee);
      }
      if (filterObj.maxFee) {
        query['courses.fees.totalFee'].$lte = parseInt(filterObj.maxFee);
      }
    }

    // Placement range
    if (filterObj.minPlacement) {
      query['placement.averagePackage'] = { $gte: parseInt(filterObj.minPlacement) };
    }

    // College type
    if (filterObj.type) {
      query.type = filterObj.type;
    }

    // Accreditation
    if (filterObj.accreditation) {
      query['accreditation.naacGrade'] = filterObj.accreditation;
    }
  }

  const colleges = await College.find(query)
    .limit(50)
    .sort({ 'ranking.nirf.overall': 1 });

  res.status(200).json({
    success: true,
    count: colleges.length,
    data: colleges
  });
});

// @desc    Compare colleges
// @route   POST /api/v1/colleges/compare
// @access  Public
exports.compareColleges = asyncHandler(async (req, res, next) => {
  const { collegeIds } = req.body;

  if (!collegeIds || !Array.isArray(collegeIds) || collegeIds.length < 2 || collegeIds.length > 4) {
    return next(new ErrorResponse('Please provide 2 to 4 college IDs to compare', 400));
  }

  const colleges = await College.find({ _id: { $in: collegeIds } })
    .select('name type location accreditation ranking courses cutoffs placement infrastructure faculty reviews');

  if (colleges.length !== collegeIds.length) {
    return next(new ErrorResponse('One or more colleges not found', 404));
  }

  // Structure comparison data
  const comparison = {
    basicInfo: colleges.map(college => ({
      name: college.name,
      type: college.type,
      location: college.location,
      establishmentYear: college.establishmentYear
    })),
    accreditation: colleges.map(college => college.accreditation),
    ranking: colleges.map(college => college.ranking),
    fees: colleges.map(college => college.courses.map(course => course.fees)),
    placement: colleges.map(college => college.placement),
    infrastructure: colleges.map(college => college.infrastructure),
    faculty: colleges.map(college => college.faculty),
    ratings: colleges.map(college => {
      if (college.reviews.length === 0) return null;
      const avg = college.reviews.reduce((acc, review) => acc + review.rating.overall, 0) / college.reviews.length;
      return avg;
    })
  };

  res.status(200).json({
    success: true,
    data: {
      colleges,
      comparison
    }
  });
});

// @desc    Get admission prediction
// @route   POST /api/v1/colleges/predict
// @access  Public
exports.getAdmissionPrediction = asyncHandler(async (req, res, next) => {
  const { exam, rank, category, state, course } = req.body;

  if (!exam || !rank || !category) {
    return next(new ErrorResponse('Please provide exam, rank, and category', 400));
  }

  // Find colleges that accept this exam
  let query = {
    'cutoffs.exam': exam,
    'courses.courseName': course ? course : { $exists: true }
  };

  // State preference
  if (state) {
    query['location.state'] = state;
  }

  const colleges = await College.find(query)
    .select('name location courses cutoffs ranking placement')
    .limit(100);

  // Calculate admission chances
  const predictions = colleges.map(college => {
    let chance = 'Low';
    let score = 0;

    // Find relevant cutoff for the exam and course
    const relevantCutoffs = college.cutoffs.filter(cutoff => 
      cutoff.exam === exam && 
      (!course || college.courses.some(c => c.courseName === course))
    );

    if (relevantCutoffs.length > 0) {
      const cutoff = relevantCutoffs[0];
      const categoryCutoff = cutoff.closingRank[category.toLowerCase()] || cutoff.closingRank.general;

      if (categoryCutoff) {
        if (rank <= categoryCutoff * 0.5) {
          chance = 'Very High';
          score = 95;
        } else if (rank <= categoryCutoff * 0.75) {
          chance = 'High';
          score = 75;
        } else if (rank <= categoryCutoff * 0.9) {
          chance = 'Moderate';
          score = 60;
        } else if (rank <= categoryCutoff) {
          chance = 'Low';
          score = 40;
        } else {
          chance = 'Very Low';
          score = 20;
        }
      }
    }

    return {
      college: {
        _id: college._id,
        name: college.name,
        location: college.location,
        ranking: college.ranking
      },
      prediction: {
        chance,
        score,
        recommendation: getRecommendation(chance)
      }
    };
  });

  // Sort by prediction score
  predictions.sort((a, b) => b.prediction.score - a.prediction.score);

  res.status(200).json({
    success: true,
    data: {
      input: { exam, rank, category, state, course },
      predictions: predictions.slice(0, 20) // Return top 20 predictions
    }
  });
});

const getRecommendation = (chance) => {
  const recommendations = {
    'Very High': 'Safe choice. You have a very high chance of admission.',
    'High': 'Good chance. Consider this as a likely option.',
    'Moderate': 'Possible with good preparation. Keep as backup.',
    'Low': 'Unlikely. Consider other options or improve rank.',
    'Very Low': 'Very unlikely. Not recommended.'
  };
  return recommendations[chance];
};

// @desc    Get college reviews
// @route   GET /api/v1/colleges/:id/reviews
// @access  Public
exports.getCollegeReviews = asyncHandler(async (req, res, next) => {
  const college = await College.findById(req.params.id).select('reviews');

  if (!college) {
    return next(new ErrorResponse('College not found', 404));
  }

  // Filter approved reviews
  const approvedReviews = college.reviews.filter(review => 
    review.status === 'approved' || review.status === 'featured'
  );

  // Calculate average ratings
  const averageRatings = {
    overall: 0,
    academics: 0,
    placement: 0,
    infrastructure: 0,
    faculty: 0,
    campusLife: 0
  };

  if (approvedReviews.length > 0) {
    Object.keys(averageRatings).forEach(key => {
      const sum = approvedReviews.reduce((acc, review) => acc + review.rating[key], 0);
      averageRatings[key] = sum / approvedReviews.length;
    });
  }

  res.status(200).json({
    success: true,
    count: approvedReviews.length,
    averageRatings,
    data: approvedReviews
  });
});

// @desc    Add review to college
// @route   POST /api/v1/colleges/:id/reviews
// @access  Private
exports.addCollegeReview = asyncHandler(async (req, res, next) => {
  const college = await College.findById(req.params.id);

  if (!college) {
    return next(new ErrorResponse('College not found', 404));
  }

  const { rating, comment, pros, cons } = req.body;

  // Check if user already reviewed
  const existingReview = college.reviews.find(
    review => review.user.toString() === req.user.id
  );

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this college', 400));
  }

  const review = {
    user: req.user.id,
    rating: {
      overall: rating.overall || 0,
      academics: rating.academics || 0,
      placement: rating.placement || 0,
      infrastructure: rating.infrastructure || 0,
      faculty: rating.faculty || 0,
      campusLife: rating.campusLife || 0
    },
    comment,
    pros: pros || [],
    cons: cons || [],
    isVerifiedStudent: req.body.isVerifiedStudent || false,
    status: 'pending'
  };

  college.reviews.push(review);
  await college.save();

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Get cutoff trends
// @route   GET /api/v1/colleges/:id/cutoff-trends
// @access  Public
exports.getCutoffTrends = asyncHandler(async (req, res, next) => {
  const college = await College.findById(req.params.id).select('cutoffs');

  if (!college) {
    return next(new ErrorResponse('College not found', 404));
  }

  // Group cutoffs by exam and year
  const trends = {};
  
  college.cutoffs.forEach(cutoff => {
    if (!trends[cutoff.exam]) {
      trends[cutoff.exam] = {};
    }
    
    if (!trends[cutoff.exam][cutoff.course]) {
      trends[cutoff.exam][cutoff.course] = [];
    }
    
    trends[cutoff.exam][cutoff.course].push({
      year: cutoff.year,
      openingRank: cutoff.openingRank,
      closingRank: cutoff.closingRank
    });
  });

  // Sort by year
  Object.keys(trends).forEach(exam => {
    Object.keys(trends[exam]).forEach(course => {
      trends[exam][course].sort((a, b) => a.year - b.year);
    });
  });

  res.status(200).json({
    success: true,
    data: trends
  });
});
