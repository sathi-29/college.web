const Coaching = require('../models/Coaching');
const asyncHandler = require('../middleware/async');

// @desc    Get all coaching institutes
// @route   GET /api/v1/coaching
// @access  Public
exports.getCoachingInstitutes = asyncHandler(async (req, res, next) => {
  // Filter by exam
  let query = { isVerified: true };

  if (req.query.exam) {
    query.examsPrepared = req.query.exam;
  }

  if (req.query.type) {
    query.type = req.query.type;
  }

  if (req.query.city) {
    query['centers.city'] = req.query.city;
  }

  const coaching = await Coaching.find(query)
    .sort({ 'rating.average': -1, bookingCount: -1 });

  res.status(200).json({
    success: true,
    count: coaching.length,
    data: coaching
  });
});

// @desc    Get single coaching institute
// @route   GET /api/v1/coaching/:id
// @access  Public
exports.getCoachingInstitute = asyncHandler(async (req, res, next) => {
  const coaching = await Coaching.findById(req.params.id);

  if (!coaching) {
    return next(new ErrorResponse('Coaching institute not found', 404));
  }

  // Increment view count
  coaching.viewCount += 1;
  await coaching.save();

  res.status(200).json({
    success: true,
    data: coaching
  });
});

// @desc    Book coaching course
// @route   POST /api/v1/coaching/:id/book
// @access  Private
exports.bookCourse = asyncHandler(async (req, res, next) => {
  const coaching = await Coaching.findById(req.params.id);

  if (!coaching) {
    return next(new ErrorResponse('Coaching institute not found', 404));
  }

  const { courseId, paymentDetails } = req.body;

  // Find course
  const course = coaching.courses.id(courseId);
  if (!course) {
    return next(new ErrorResponse('Course not found', 404));
  }

  // Check if already booked
  const existingBooking = coaching.bookings.find(
    booking => booking.user.toString() === req.user.id && 
    booking.course.toString() === courseId &&
    booking.status !== 'Cancelled'
  );

  if (existingBooking) {
    return next(new ErrorResponse('You have already booked this course', 400));
  }

  const booking = {
    user: req.user.id,
    course: courseId,
    bookingDate: Date.now(),
    status: 'Pending',
    payment: {
      amount: course.fee.amount,
      paymentId: paymentDetails.paymentId,
      paymentMethod: paymentDetails.method,
      paymentStatus: paymentDetails.status || 'Pending',
      transactionId: paymentDetails.transactionId
    }
  };

  coaching.bookings.push(booking);
  coaching.bookingCount += 1;
  await coaching.save();

  // TODO: Send confirmation email

  res.status(201).json({
    success: true,
    data: booking,
    message: 'Course booking successful. Confirmation email sent.'
  });
});

// @desc    Get coaching reviews
// @route   GET /api/v1/coaching/:id/reviews
// @access  Public
exports.getCoachingReviews = asyncHandler(async (req, res, next) => {
  const coaching = await Coaching.findById(req.params.id).select('reviews');

  if (!coaching) {
    return next(new ErrorResponse('Coaching institute not found', 404));
  }

  // Filter verified reviews
  const verifiedReviews = coaching.reviews.filter(review => 
    review.status === 'approved' || review.status === 'featured'
  );

  // Calculate average ratings
  const averageRatings = {
    overall: coaching.rating.average || 0,
    faculty: 0,
    material: 0,
    infrastructure: 0,
    valueForMoney: 0
  };

  if (verifiedReviews.length > 0) {
    ['faculty', 'material', 'infrastructure', 'valueForMoney'].forEach(key => {
      const sum = verifiedReviews.reduce((acc, review) => acc + review.rating[key], 0);
      averageRatings[key] = sum / verifiedReviews.length;
    });
  }

  res.status(200).json({
    success: true,
    count: verifiedReviews.length,
    averageRatings,
    data: verifiedReviews
  });
});

// @desc    Add coaching review
// @route   POST /api/v1/coaching/:id/reviews
// @access  Private
exports.addCoachingReview = asyncHandler(async (req, res, next) => {
  const coaching = await Coaching.findById(req.params.id);

  if (!coaching) {
    return next(new ErrorResponse('Coaching institute not found', 404));
  }

  // Check if user has booked this coaching
  const hasBooked = coaching.bookings.some(
    booking => booking.user.toString() === req.user.id && 
    booking.status === 'Completed'
  );

  if (!hasBooked) {
    return next(new ErrorResponse('You must complete a course to review', 400));
  }

  const { rating, comment, pros, cons } = req.body;

  // Check if already reviewed
  const existingReview = coaching.reviews.find(
    review => review.user.toString() === req.user.id
  );

  if (existingReview) {
    return next(new ErrorResponse('You have already reviewed this institute', 400));
  }

  const review = {
    user: req.user.id,
    rating: {
      overall: rating.overall || 0,
      faculty: rating.faculty || 0,
      material: rating.material || 0,
      infrastructure: rating.infrastructure || 0,
      valueForMoney: rating.valueForMoney || 0
    },
    comment,
    pros: pros || [],
    cons: cons || [],
    status: 'pending'
  };

  coaching.reviews.push(review);
  
  // Update average rating
  const reviewsCount = coaching.reviews.length;
  const totalRating = coaching.reviews.reduce((sum, rev) => sum + rev.rating.overall, 0);
  coaching.rating.average = totalRating / reviewsCount;
  coaching.rating.count = reviewsCount;

  await coaching.save();

  res.status(201).json({
    success: true,
    data: review
  });
});

// @desc    Search coaching institutes
// @route   GET /api/v1/coaching/search
// @access  Public
exports.searchCoaching = asyncHandler(async (req, res, next) => {
  const { q, exam, city, type } = req.query;

  let query = { isVerified: true };

  if (q) {
    query.$text = { $search: q };
  }

  if (exam) {
    query.examsPrepared = exam;
  }

  if (city) {
    query['centers.city'] = city;
  }

  if (type) {
    query.type = type;
  }

  const coaching = await Coaching.find(query)
    .sort({ 'rating.average': -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: coaching.length,
    data: coaching
  });
});

// @desc    Get coaching courses by exam
// @route   GET /api/v1/coaching/exam/:examName/courses
// @access  Public
exports.getCoursesByExam = asyncHandler(async (req, res, next) => {
  const coaching = await Coaching.find({
    isVerified: true,
    examsPrepared: req.params.examName
  }).select('name courses type centers');

  // Extract and flatten courses
  const courses = [];
  
  coaching.forEach(institute => {
    institute.courses.forEach(course => {
      if (course.exam === req.params.examName) {
        courses.push({
          institute: {
            _id: institute._id,
            name: institute.name,
            type: institute.type,
            centers: institute.centers
          },
          course: {
            _id: course._id,
            name: course.name,
            mode: course.mode,
            duration: course.duration,
            fee: course.fee,
            features: course.features,
            schedule: course.schedule,
            faculty: course.faculty
          }
        });
      }
    });
  });

  // Sort by fee
  courses.sort((a, b) => a.course.fee.amount - b.course.fee.amount);

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses
  });
});