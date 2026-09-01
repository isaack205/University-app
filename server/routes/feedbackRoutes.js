// Import
const express = require('express');
const { submitFeedback, getAllFeedback, updateFeedbackStatus } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middlewares/auth');
const optionalAuth = require('../middlewares/optionalAuth');

const router = express.Router();

router.post('/', optionalAuth, submitFeedback);
router.get('/feedbacks', protect, authorize(['admin']), getAllFeedback);
router.put('/:id', protect, authorize(['admin']), updateFeedbackStatus);

// Export
module.exports = router;
