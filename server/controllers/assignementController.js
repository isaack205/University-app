// Imports
const Assignment = require('../models/assignement');

// Create a new assignment (Class Rep only)
exports.createAssignment = async (req, res) => {
  try {
    const classRep = req.user;

    if (classRep.cohort.toString() !== req.body.cohort) {
      return res.status(403).json({ message: "You can only create assignments for your cohort" })
    }

    const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create assignment', error: err.message });
  }
};

// Get all assignments for a specific cohort
exports.getMyCohortsAssignements = async (req, res) => {
  try {
    const user = req.user;

    const assignments = await Assignment.find({ cohort: user.cohort });
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
    const classRep = req.user;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Cohort check
    if (assignment.cohort.toString() !== classRep.cohort.toString()) {
      return res.status(403).json({ message: 'You can only update assignments for your own cohort' });
    }

    // Proceed with update
    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'Assignment updated', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update assignment', error: err.message });
  }
};

// Delete an assignment (Class Rep only)
exports.deleteAssignment = async (req, res) => {
  try {
    const classRep = req.user;

    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Cohort check
    if (assignment.cohort.toString() !== classRep.cohort.toString()) {
      return res.status(403).json({ message: 'You can only delete assignments for your own cohort' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
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
