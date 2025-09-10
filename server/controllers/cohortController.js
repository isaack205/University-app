// Imports
const Cohort = require('../models/cohort');

// Create a new cohort
exports.createCohort = async (req, res) => {
    try {
        const cohort = await Cohort.create(req.body);
        res.status(201).json({ message: 'Cohort created successfully', cohort });
    } catch (error) {
        res.status(500).json({ message: 'Error creating cohort', error: error.message });
    }
};

// Get all cohorts
exports.getAllCohorts = async (req, res) => {
    try {
        const cohorts = await Cohort.find().populate('course').populate('classRep');
        res.status(200).json(cohorts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cohorts', error: error.message });
    }
};

// Get cohorts by course ID
exports.getCohortsByCourse = async (req, res) => {
    try {
        const cohorts = await Cohort.find({ course: req.params.courseId }).populate('classRep');
        res.status(200).json(cohorts);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching cohort by course', error: error.message });
    }
};

// Get a single cohort by ID
exports.getCohortById = async (req, res) => {
    try {
        const cohort = await Cohort.findById(req.params.id).populate('course').populate('classRep');
        if (!cohort) return res.status(404).json({ message: 'Cohort not found' });
        res.status(200).json(cohort);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching specific cohort', error: error.message });
    }
};

// Update a cohort
exports.updateCohort = async (req, res) => {
    try {
        const cohort = await Cohort.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!cohort) return res.status(404).json({ message: 'Cohort not found' });
        res.status(200).json({ message: 'Cohort updated', cohort });
    } catch (error) {
        res.status(500).json({ message: 'Error updating cohort', error: error.message });
    }
};

// Delete a cohort
exports.deleteCohort = async (req, res) => {
    try {
        const cohort = await Cohort.findByIdAndDelete(req.params.id);
        if (!cohort) return res.status(404).json({ message: 'Cohort not found' });
        res.status(200).json({ message: 'Cohort deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting cohort', error: error.message });
    }
};

