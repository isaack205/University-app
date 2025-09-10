// Imports
const Assignment = require('../models/assignement');

// Create a new assignment (Class Rep only)
exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create assignment', error: err.message });
  }
};

// Get all assignments for a specific cohort
exports.getAssignmentsByCohort = async (req, res) => {
  try {
    const assignments = await Assignment.find({ cohort: req.params.cohortId });
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments', error: err.message });
  }
};

// Get a single assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.status(200).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignment', error: err.message });
  }
};

// Update an assignment (Class Rep only)
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.status(200).json({ message: 'Assignment updated', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update assignment', error: err.message });
  }
};

// Delete an assignment (Class Rep only)
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByIdAndDelete(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.status(200).json({ message: 'Assignment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete assignment', error: err.message });
  }
};

// Student marks assignment as completed
exports.markAsCompleted = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const existing = assignment.statusByStudent.find(s => s.student.toString() === req.user.id);
    if (existing) {
      existing.completed = true;
      existing.updatedAt = new Date();
    } else {
      assignment.statusByStudent.push({
        student: req.user.id,
        completed: true,
        updatedAt: new Date()
      });
    }

    await assignment.save();
    res.status(200).json({ message: 'Assignment marked as completed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status', error: err.message });
  }
};
