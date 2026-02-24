// Imports
const Lecturer = require('../models/lecturer');
const UnitSchedule = require('../models/unit');

// Create a new Lecturer
exports.createLecturer = async (req, res) => {
    try {
        const classRep = req.user;

        // Role Check
        if (classRep.role !== 'classRep') {
            return res.status(403).json({ message: 'Only class reps can add lecturers' });
        }

        // Cohort matching (Security)
        if (classRep.cohort.toString() !== req.body.cohort) {
            return res.status(403).json({ message: 'You can only add lecturers to your own cohort' });
        }

        const lecturer = await Lecturer.create(req.body);
        res.status(201).json({ message: 'Lecturer created successfully', lecturer });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create lecturer', error: err.message });
    }
};

// Get lecturers split by current vs past (soft-deleted)
exports.getLecturersByCohort = async (req, res) => {
    try {
        const user = req.user;
        const { cohortId } = req.params;

        if (user.cohort.toString() !== cohortId) {
            return res.status(403).json({ message: 'Unauthorized access to this cohort' });
        }

        // Fetch all lecturers for the cohort, then separate by isDeleted flag
        const lecturers = await Lecturer.find({ cohort: cohortId });

        const currentSemester = lecturers.filter(l => !l.isDeleted);
        const pastSemester = lecturers.filter(l => l.isDeleted);

        res.status(200).json({
            count: lecturers.length,
            currentSemester,
            pastSemester
        });
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch lecturers', error: err.message });
    }
};

// Update Lecturer details
exports.updateLecturer = async (req, res) => {
    try {
        const classRep = req.user;
        const { id } = req.params;

        // Check if lecturer exists and belongs to the same cohort
        const lecturer = await Lecturer.findById(id);
        if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });

        if (lecturer.cohort.toString() !== classRep.cohort.toString()) {
            return res.status(403).json({ message: 'Unauthorized: This lecturer is not in your cohort' });
        }

        const updatedLecturer = await Lecturer.findByIdAndUpdate(id, req.body,
            { 
                new: true, 
                runValidators: true 
            }
        );

        res.status(200).json({ message: 'Lecturer updated', updatedLecturer });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update lecturer', error: err.message });
    }
};

// Soft Delete (Mark as Deleted)
// exports.markAsDeleted = async (req, res) => {
//     try {
//         const classRep = req.user;
//         const { id } = req.params;

//         const lecturer = await Lecturer.findById(id);
//         if (!lecturer || lecturer.cohort.toString() !== classRep.cohort.toString()) {
//             return res.status(403).json({ message: 'Unauthorized or Lecturer not found' });
//         }

//         // 1. Mark the lecturer as deleted
//         lecturer.isDeleted = true;
//         await lecturer.save();

//         // 2. Nullify references in UnitSchedules so the spot shows as "TBA/Unassigned"
//         await UnitSchedule.updateMany(
//             { lecturer: id },
//             { $set: { lecturer: null } }
//         );

//         res.status(200).json({ message: 'Lecturer soft-deleted and schedules updated to null' });
//     } catch (err) {
//         res.status(500).json({ message: 'Operation failed', error: err.message });
//     }
// };

// Toggle soft-delete state (set explicitly or flip current)
exports.toggleDeleted = async (req, res) => {
    try {
        const classRep = req.user;
        const { id } = req.params;
        const { isDeleted } = req.body;

        const lecturer = await Lecturer.findById(id);
        if (!lecturer || lecturer.cohort.toString() !== classRep.cohort.toString()) {
            return res.status(403).json({ message: 'Unauthorized or Lecturer not found' });
        }

        const newState = (typeof isDeleted === 'boolean') ? isDeleted : !lecturer.isDeleted;

        // If marking deleted, nullify schedules like before
        if (newState === true) {
            lecturer.isDeleted = true;
            await lecturer.save();

            await UnitSchedule.updateMany(
                { lecturer: id },
                { $set: { lecturer: null } }
            );

            return res.status(200).json({ message: 'Lecturer marked as deleted and schedules nullified', lecturer });
        }

        // If restoring, just unset the flag (schedules remain null; reassigning is a separate operation)
        lecturer.isDeleted = false;
        await lecturer.save();

        return res.status(200).json({ message: 'Lecturer restored (isDeleted=false)', lecturer });
    } catch (err) {
        res.status(500).json({ message: 'Toggle operation failed', error: err.message });
    }
};

// Hard Delete (Permanent Removal)
exports.deleteLecturer = async (req, res) => {
    try {
        const classRep = req.user;
        const { id } = req.params;

        const lecturer = await Lecturer.findById(id);
        if (!lecturer || lecturer.cohort.toString() !== classRep.cohort.toString()) {
            return res.status(403).json({ message: 'Unauthorized or Lecturer not found' });
        }

        // 1. Remove permanently
        await Lecturer.findByIdAndDelete(id);

        // 2. Nullify references in UnitSchedules
        await UnitSchedule.updateMany(
            { lecturer: id },
            { $set: { lecturer: null } }
        );

        res.status(200).json({ message: 'Lecturer permanently deleted and schedules updated' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete lecturer', error: err.message });
    }
};