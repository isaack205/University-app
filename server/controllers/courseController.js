// Imports
const Course = require('../models/course');

// Create a new course
exports.createCourse = async (req, res) => {
    try {
        const course = await Course.create(req.body);
        res.status(201).json({ message: 'Course created', course });
    } catch (error) {
        res.status(500).json({ message: 'Error creating course', error: error.message });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error: error.message });
    }
};

// Get a single course by ID
exports.getCourseById = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching specific course', error: error.message });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Course updated successfully!', course });
    } catch (error) {
        res.status(500).json({ message: 'Error updating course', error: error.message });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });
        res.status(200).json({ message: 'Course deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error: error.message });
    }
};
