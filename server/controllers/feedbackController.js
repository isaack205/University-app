// Imports
const Feedback = require('../models/feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.create({
            user: req.user.id,
            type: req.body.type,
            message: req.body.message
        });
        res.status(201).json({ message: 'Feedback submitted', feedback });
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit feedback', error: err.message });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user', 'name email');
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch feedback', error: err.message });
    }
};
