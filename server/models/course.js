//Imports 
const mongoose = require('mongoose');

// Course model
const courseSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: String
});

// Export
module.exports = mongoose.model('Course', courseSchema);