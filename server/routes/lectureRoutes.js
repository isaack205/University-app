// Imports
const express = require('express');
const router = express.Router();
const { createLecturer, getLecturersByCohort, updateLecturer, markAsDeleted, toggleDeleted, deleteLecturer } = require('../controllers/lecturerController');
const { protect, authorize } = require('../middlewares/auth');

// Routes
router.post('/', protect, authorize(["classRep"]), createLecturer);
router.get('/cohort/:cohortId', protect, getLecturersByCohort);
// router.get('/:id' , protect);
router.put('/:id', protect, authorize(["classRep"]), updateLecturer);
router.patch('/:id/toggle-deleted', protect, authorize(['classRep','admin']), toggleDeleted);
// router.patch('/:id', protect, authorize(["classRep"]), markAsDeleted);
router.delete('/:id', protect, authorize(["classRep"]), deleteLecturer);

// Export
module.exports = router;
