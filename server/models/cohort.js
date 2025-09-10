// Imports
const mongoose = require('mongoose');

// Cohort model
const cohortSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    name: { type: String, required: true }, // e.g. EB1/2024
    year: { type: Number, required: true }, // e.g. 2024
    classRep: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // optional
});

// Export
module.exports = mongoose.model('Cohort', cohortSchema);