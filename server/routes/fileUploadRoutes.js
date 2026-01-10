//Imports
const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middlewares/auth.js');
const {
	createFile,
	getMyCohortsFiles,
	getFileById,
    getGeneralFiles,
	updateFile,
	deleteFile,
} = require('../controllers/fileUploadController.js');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// POST /uploads - create
router.post('/', upload.single('file'), protect, authorize(['classRep', 'admin']), createFile);

// GET my cohorts files
router.get('/uploads', protect, getMyCohortsFiles);

// GET /uploads/:id - read one
router.get('/:id', protect,  getFileById);

// GET general files
router.get('/', protect, getGeneralFiles);

// PUT /uploads/:id - update metadata or replace file
router.put('/:id', upload.single('file'), protect, authorize(['classRep', 'admin']), updateFile);

// DELETE /uploads/:id - delete record
router.delete('/:id', protect, authorize(['classRep', 'admin']),  deleteFile);

//Export
module.exports = router;

