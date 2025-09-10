// Imports
const express = require('express');
const {
    createSchedule,
    getSchedulesByCohort,
    getScheduleById,
    updateSchedule,
    deleteSchedule
} = require('../controllers/unitController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize(['classRep']), createSchedule);
router.get('/cohort/:cohortId', protect, getSchedulesByCohort);
router.get('/:id', protect, getScheduleById);
router.put('/:id', protect, authorize(['classRep']), updateSchedule);
router.delete('/:id', protect, authorize(['classRep']), deleteSchedule);

// Exports
module.exports = router;
