const express = require('express');
const {
  createCohort,
  getAllCohorts,
  getCohortsByCourse,
  getCohortById,
  updateCohort,
  deleteCohort
} = require('../controllers/cohortController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize(['admin']), createCohort);
router.get('/cohorts', protect, getAllCohorts);
router.get('/course/:courseId', getCohortsByCourse);
router.get('/:id', protect, getCohortById);
router.put('/:id', protect, authorize(['admin']), updateCohort);
router.delete('/:id', protect, authorize(['admin']), deleteCohort);

// Export
module.exports = router;
