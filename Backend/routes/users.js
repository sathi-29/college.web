const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  saveCollege,
  removeSavedCollege,
  addToCompare,
  removeFromCompare,
  updateExamScores,
  updateAcademicInfo,
  updatePreferences,
  getDashboard
} = require('../controllers/users');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(authorize('admin'), getUsers)
  .post(authorize('admin'), createUser);

router.route('/:id')
  .get(authorize('admin'), getUser)
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

router.route('/save-college/:collegeId')
  .post(saveCollege)
  .delete(removeSavedCollege);

router.route('/compare-college/:collegeId')
  .post(addToCompare)
  .delete(removeFromCompare);

router.put('/exam-scores', updateExamScores);
router.put('/academic-info', updateAcademicInfo);
router.put('/preferences', updatePreferences);
router.get('/dashboard', getDashboard);

module.exports = router;