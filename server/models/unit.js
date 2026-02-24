// Imports
const mongoose = require('mongoose');

// Unit model
const unitScheduleSchema = new mongoose.Schema({
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    unitCode: { type: String, required: true },
    unitName: { type: String, required: true },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', required: true },
    venue: { type: String, required: true },
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true }
}, { 
    timestamps: true 
});

// Ensure uniqueness per cohort+unitCode
unitScheduleSchema.index({ cohort: 1, unitCode: 1 }, { unique: true });

// Export
module.exports = mongoose.model('UnitSchedule', unitScheduleSchema);
