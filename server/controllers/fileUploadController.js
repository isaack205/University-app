// Imports
const { sendAppNotification } = require('../services/notificationService.js');
const { sendSMS } = require('../services/smsService.js');
const cloudinary = require('../config/cloudinaryConfig.js');
const FileUpload = require('../models/fileUpload.js');
const { User } = require('../models/user.js');
const fs = require('fs');

// Create a new file record
exports.createFile = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    // Require authenticated user
    const user = req.user;

    // Normalize provided fileType for checks
    const providedType = (req.body.fileType || 'General').toString()

    // Role-based authorization
    const role = (user.role || '').toString();

    // Admins can create any fileType
    if (role === 'admin') {
      // allowed
    } else if (role === 'classRep') {
      // classreps may only create Assignment/CAT/Notes for their own cohort
      const allowedForClassRep = ['Assignment', 'CAT', 'Notes'];
      if (!allowedForClassRep.includes(providedType)) {
        return res.status(403).json({ error: 'Class reps can only create Assignment, CAT or Notes files' });
      }

      // cohort must be provided and match user's cohort
      const userCohort = user.cohort ? user.cohort.toString() : null;
      const targetCohort = req.body.cohort ? req.body.cohort.toString() : null;
      if (!targetCohort || !userCohort || userCohort !== targetCohort) {
        return res.status(403).json({ message: 'You can only add files for your cohort' });
      }
    } else {
      return res.status(403).json({ error: 'Insufficient permissions to create files' });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: process.env.CLOUDINARY_FOLDER,
      resource_type: 'raw',
    });

    const fileUpload = await FileUpload.create({
        fileName: req.file.originalname || req.body.fileName,
        fileDescription: req.body.fileDescription || '',
        fileUrl: result.secure_url,
        fileType: providedType,
        fileSize: result.bytes,
        course: req.body.course || null,
        cohort: req.body.cohort || null,
        uploadedBy: req.user._id,
    });

    // Remove temporary uploaded file
    try {
      if (req.file && req.file.path) fs.unlink(req.file.path, () => {});
    } catch (e) {
      console.warn('Failed to remove temp file:', e.message || e);
    }

    // Notify students via app notification
    // If cohort is set notify that cohort, otherwise notify all users (admins may create global files)
    const students = fileUpload.cohort
      ? await User.find({ cohort: fileUpload.cohort })
      : await User.find({});

    // Notify students via app notification
    for (const student of students) {

        await sendAppNotification(
        student._id, 
        `📚 New document file posted: ${fileUpload.fileName}`, 
        'document', 
        fileUpload._id,
        );

        if (student.preferences.smsNotifications && student.phoneNumber) {
        await sendSMS(student._id, student.phoneNumber, `📚 New document file posted: ${fileUpload.fileName}`, 'document');
        }

    };
    
    return res.status(201).json(fileUpload);
  } catch (err) {
    return res.status(500).json({ message: 'Upload failed', error: err.message});
  }
}

// Get a file by id with access control
exports.getFileById = async (req, res) => {
  try {
    const file = await FileUpload.findById(req.params.id)
      .populate('course')
      .populate('cohort')
      .populate([ {
        path: 'uploadedBy',
        select: 'name email phoneNumber'
      }]);
    if (!file) return res.status(404).json({ message: 'File not found' });

    // Must be same cohort
    if (file.cohort._id.toString() !== req.user.cohort.toString()) {
        return res.status(403).json({ message: "Not allowed to view this file" });
    }

    return res.status(200).json(file);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch file', error: err.message});
  }
};

// Get all files (Admin only)
exports.getAllFiles = async (req, res) => {
  try {
    const files = await FileUpload.find({})
      .sort({ uploadedAt: -1 })
      .populate('course')
      .populate('cohort')
      .populate([ {
        path: 'uploadedBy',
        select: 'name email phoneNumber'
      }]);

    return res.status(200).json(files);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch all files', error: err.message});
  }
};

// Get files for the caller's cohort
exports.getMyCohortsFiles = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.cohort) return res.status(400).json({ error: 'User cohort not set' });

    const files = await FileUpload.find({ cohort: user.cohort })
      .sort({ uploadedAt: -1 })
      .populate('course')
      .populate('cohort')
      .populate([ {
        path: 'uploadedBy',
        select: 'name email phoneNumber'
      }]);

    return res.status(200).json(files);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch cohort files', error: err.message});
  }
};

// Get general files visible to all (type General or Event)
exports.getGeneralFiles = async (req, res) => {
  try {
    const files = await FileUpload.find({ fileType: { $in: ['General', 'Event'] } })
      .sort({ uploadedAt: -1 })
      .populate('course')
      .populate('cohort')
      .populate([ {
        path: 'uploadedBy',
        select: 'name email phoneNumber'
      }]);

    return res.status(200).json(files);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch general files', error: err.message});
  }
};

// Update file
exports.updateFile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const file = await FileUpload.findById(id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const role = (user.role || '').toString();
    const typeNorm = (file.fileType || '').toString();

    if (role !== 'admin') {
      // only allow updates for cohort files when user is in same cohort and file type allowed
      const allowed = ['Assignment', 'CAT', 'Notes'];
      if (!file.cohort) return res.status(403).json({ error: 'Only admins can update global files' });
      if (!user.cohort || user.cohort.toString() !== file.cohort.toString()) return res.status(403).json({ error: 'Not authorized to update this file' });
      if (!allowed.includes(typeNorm)) return res.status(403).json({ error: 'You can only update assignment, CAT or notes files' });
    }

    // Build update object from allowed fields
    const updatable = ['fileName', 'fileDescription', 'fileType', 'course', 'cohort'];
    const updateObj = {};
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) updateObj[field] = req.body[field];
    });

    // If a new file binary is provided, upload and include URL in update object
    if (req.file) {
      if (file.fileUrl) { 
        const publicId = file.fileUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }); 
      };
      const result = await cloudinary.uploader.upload(req.file.path, { folder: process.env.CLOUDINARY_FOLDER, resource_type: 'raw' });

      updateObj.fileUrl = result.secure_url;
      updateObj.fileName = req.file.originalname;
      updateObj.fileSize = result.bytes;

      try { if (req.file && req.file.path) fs.unlink(req.file.path, () => {}); } catch (e) { console.warn('temp cleanup failed', e.message || e); }
    }

    // Proceed with update using findByIdAndUpdate as requested
    const updatedFile = await FileUpload.findByIdAndUpdate(
      id,
      updateObj,
      { new: true, runValidators: true }
    );

    return res.status(200).json(updatedFile);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update file', error: err.message});
  }
};

// Delete file 
exports.deleteFile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const file = await FileUpload.findById(id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    const role = (user.role || '').toString();
    const typeNorm = (file.fileType || '').toString();

    if (role !== 'admin') {
      const allowed = ['Assignment', 'Cat', 'Notes'];
      if (!file.cohort) return res.status(403).json({ error: 'Only admins can delete global files' });
      if (!user.cohort || user.cohort.toString() !== file.cohort.toString()) return res.status(403).json({ error: 'Not authorized to delete this file' });
      if (!allowed.includes(typeNorm)) return res.status(403).json({ error: 'You can only delete assignment, CAT or notes files' });
    }

    await FileUpload.findByIdAndDelete(id);
    return res.json({ message: 'File deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete file', error: err.message});
  }
};

