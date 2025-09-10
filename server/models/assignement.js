// Imports
const mongoose = require('mongoose');

// Assignment model
const assignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    unitCode: { type: String, required: true },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true },
    dueDate: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // class rep
    statusByStudent: [
        {
            student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            completed: { type: Boolean, default: false },
            updatedAt: Date
        }
    ]
}, { 
    timestamps: true 
});

// Export
module.exports = mongoose.model('Assignment', assignmentSchema);
