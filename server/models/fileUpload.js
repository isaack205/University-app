// Imports
const mongoose = require ('mongoose');

// File Schema
const fileUploadSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileDescription: { type: String, max: 50},
  fileUrl: { type: String, required: true },   // Cloudinary secure_url
  fileType: { type: String, enum: ['General', 'Event', 'Assignment', 'Notes', 'CAT'], required: true},
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  cohort: { type: mongoose.Schema.Types.ObjectId, ref: 'Cohort' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },                // optional: lecturer/student name
  uploadedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Export
module.exports = mongoose.model('FileUpload', fileUploadSchema);