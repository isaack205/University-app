// Imports
const express = require('express');
const {
    createAssignment,
    getAssignmentsByCohort,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    markAsCompleted
} = require('../controllers/assignementController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize(['classRep']), createAssignment);
router.get('/cohort/:cohortId', protect, getAssignmentsByCohort);
router.get('/:id', protect, getAssignmentById);
router.put('/:id', protect, authorize(['classRep']), updateAssignment);
router.delete('/:id', protect, authorize(['classRep']), deleteAssignment);
router.put('/:id/complete', protect, authorize(['student']), markAsCompleted);

module.exports = router;
