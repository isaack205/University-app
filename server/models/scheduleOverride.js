// Imports
const mongoose = require('mongoose');

// ScheduleOverride model — temporary weekly changes to a unit schedule
const scheduleOverrideSchema = new mongoose.Schema({
    unitSchedule: { type: mongoose.Schema.Types.ObjectId, ref: 'UnitSchedule', required: true },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },

    // Override fields (only include what's changing, null = no change)
    venue: { type: String, default: null },
    dayOfWeek: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], default: null },
    startTime: { type: String, default: null },
    endTime: { type: String, default: null },
    lecturer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lecturer', default: null },

    // When does this override apply?
    weekStart: { type: Date, required: true },  // Monday 00:00 of the target week
    weekEnd: { type: Date, required: true },    // Friday 23:59 of the target week

    // Optional reason from class rep
    reason: { type: String, maxLength: 200 },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, {
    timestamps: true
});

// Only one active override per unit at a time
scheduleOverrideSchema.index({ unitSchedule: 1 }, { unique: true });

// TTL: auto-delete expired overrides 7 days after weekEnd
scheduleOverrideSchema.index({ weekEnd: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

// Export
module.exports = mongoose.model('ScheduleOverride', scheduleOverrideSchema);
