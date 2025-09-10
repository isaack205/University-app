// Import
const express = require('express');
const { submitFeedback, getAllFeedback } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

router.post('/', protect, authorize(['student']), submitFeedback);
router.get('/', protect, authorize(['admin']), getAllFeedback);

// Export
module.exports = router;
