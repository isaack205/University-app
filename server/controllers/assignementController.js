// Imports
const Assignment = require('../models/assignement');
const User = require('../models/user');
const Notification = require('../models/notification')
const { sendAppNotification } = require('../services/notificationService');
const { sendSMS } = require('../services/smsService');

// Create a new assignment (Class Rep only)
exports.createAssignment = async (req, res) => {
  try {
    const classRep = req.user;

    if (classRep.cohort.toString() !== req.body.cohort) {
      return res.status(403).json({ message: "You can only create assignments for your cohort" })
    }

    const assignment = await Assignment.create({ ...req.body, createdBy: req.user.id });

    // Notify students via app notification
    const students = await User.find({ cohort: assignment.cohort });
    for (const student of students) {

      await sendAppNotification(
        student._id, 
        `📚 New assignment posted: ${assignment.title}, due ${new Date(assignment.dueDate).toDateString()}`, 
        'assignment', 
        assignment._id, 
        assignment.dueDate
      );

      if (student.preferences.smsNotifications && student.phoneNumber) {
        await sendSMS(student._id, student.phoneNumber, `📚 New assignment posted: ${assignment.title}, due ${new Date(assignment.dueDate).toDateString()}`, 'assignment');
      }

    };

    res.status(201).json({ message: 'Assignment created', assignment });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create assignment', error: err.message });
  }
};

// Get all assignments for a specific cohort
exports.getMyCohortsAssignements = async (req, res) => {
  try {
    const user = req.user;

    const assignments = await Assignment.find({ cohort: user.cohort })
                                        .populate('cohort')
                                        .populate([ {path: 'unit', select: 'unitCode unitName'}]);
    res.status(200).json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch assignments', error: err.message });
  }
};

// Get a single assignment by ID
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
                                        .populate([
                                          { path: 'unit', select: 'unitName unitCode lecturer'},
                                          { path: 'cohort', select: 'name'}
                                        ]);
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

    res.status(200).json({ message: 'Assignment updated', updatedAssignment });
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
