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

router.post('/', protect, authorize(['admin']), createCourse);
router.get('/courses', getAllCourses);
router.get('/:id', protect, getCourseById);
router.put('/:id', protect, authorize(['admin']), updateCourse);
router.delete('/:id', protect, authorize(['admin']), deleteCourse);

// Export
module.exports = router;
