const express = require('express');
const router = express.Router();
const {
  getColleges,
  getCollege,
  createCollege,
  updateCollege,
  deleteCollege,
  searchColleges,
  compareColleges,
  getAdmissionPrediction,
  getCollegeReviews,
  addCollegeReview,
  getCutoffTrends
} = require('../controllers/colleges');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(getColleges)
  .post(protect, authorize('admin'), createCollege);

router.route('/:id')
  .get(getCollege)
  .put(protect, authorize('admin'), updateCollege)
  .delete(protect, authorize('admin'), deleteCollege);

router.get('/search', searchColleges);
router.post('/compare', compareColleges);
router.post('/predict', getAdmissionPrediction);
router.get('/:id/reviews', getCollegeReviews);
router.post('/:id/reviews', protect, addCollegeReview);
router.get('/:id/cutoff-trends', getCutoffTrends);

module.exports = router;