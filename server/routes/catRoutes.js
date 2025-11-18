// Imports
const express = require('express');
const router = express.Router();
const { createCAT, getCATById, getCATsForCohort, updateCAT, deleteCAT, togglePublishCAT } = require('../controllers/catController');
const { protect, authorize } = require('../middlewares/auth');

// Routes
router.post('/', protect, authorize(["classRep"]), createCAT);
router.get('/', protect, getCATsForCohort);
router.get('/:id' , protect, getCATById);
router.put('/:id', protect, authorize(["classRep"]), updateCAT);
router.delete('/:id', protect, authorize(["classRep"]), deleteCAT);
router.patch('/:id/publish', protect, authorize(["classRep"]), togglePublishCAT);

// Export
module.exports = router;
