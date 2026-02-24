// Import
const mongoose = require('mongoose');

// Lecturer model
const lecturerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phoneNumber: { type: String },
    email: { type: String },
    isDeleted: { type: Boolean, default: false },
    cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort', required: true }
});

// Export model
module.exports = mongoose.model('Lecturer', lecturerSchema);