const express = require('express');
const router = express.Router();
const {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  submitApplication,
  uploadDocument,
  getApplicationStats,
  getApplicationTimeline
} = require('../controllers/applications');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getApplications)
  .post(createApplication);

router.route('/:id')
  .get(getApplication)
  .put(updateApplication)
  .delete(deleteApplication);

router.post('/:id/submit', submitApplication);
router.post('/:id/documents', uploadDocument);
router.get('/stats', getApplicationStats);
router.get('/:id/timeline', getApplicationTimeline);

module.exports = router;