// Imports
const express = require('express');
const {
    createCourse,
    getAllCourses,
    getCourseById,
    updateCourse,
    deleteCourse
} = require('../controllers/courseController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize(['classRep']), createCourse);
router.get('/courses', protect, getAllCourses);
router.get('/:id', protect, getCourseById);
router.put('/:id', protect, authorize(['classRep']), updateCourse);
router.delete('/:id', protect, authorize(['classRep']), deleteCourse);

// Export
module.exports = router;
