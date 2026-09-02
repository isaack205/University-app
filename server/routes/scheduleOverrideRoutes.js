// Imports
const express = require('express');
const {
    createOverride,
    getOverrides,
    cancelOverride,
} = require('../controllers/scheduleOverrideController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/:id/override', protect, authorize(['classRep']), createOverride);
router.get('/overrides', protect, getOverrides);
router.delete('/override/:overrideId', protect, authorize(['classRep']), cancelOverride);

// Exports
module.exports = router;
