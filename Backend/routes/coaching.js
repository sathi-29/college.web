const express = require('express');
const router = express.Router();
const {
  getCoachingInstitutes,
  getCoachingInstitute,
  bookCourse,
  getCoachingReviews,
  addCoachingReview,
  searchCoaching,
  getCoursesByExam
} = require('../controllers/coaching');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(getCoachingInstitutes);

router.route('/:id')
  .get(getCoachingInstitute);

router.route('/:id/book')
  .post(protect, bookCourse);

router.route('/:id/reviews')
  .get(getCoachingReviews)
  .post(protect, addCoachingReview);

router.get('/search', searchCoaching);
router.get('/exam/:examName/courses', getCoursesByExam);

module.exports = router;