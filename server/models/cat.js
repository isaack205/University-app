// Imports
const mongoose = require('mongoose');

// CAT Schema
const catSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    unit: { type: mongoose.Schema.Types.ObjectId, ref: 'UnitSchedule', required: true },
    type: { type: String, enum: ["takeaway", "sitting"], required: true },
    // 🟦 Common for both types
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // class rep
    // 🟧 Fields for Takeaway CATs
    submissionDate: { type: Date },
    submissionFormat: { type: String },
    // providedFileId: { type: mongoose.Schema.Types.ObjectId, ref: "File", default: null },
    // 🟥 Fields for Sitting CATs
    sittingDate: { type: Date },
    sittingDay: { type: String, enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] },
    sittingTime: { type: String },
    venue: { type: String },
    requiredItems: {type: [String] },
    isPublished: { type: Boolean, default: false }, 
    catNumber: { type: String, enum: ["CAT 1", "CAT 2", "CAT 3", "CAT 4", "CAT 5"], required: true } 
}, {
    timestamps: true,
})

// Exports
module.exports = mongoose.model('Cat', catSchema);