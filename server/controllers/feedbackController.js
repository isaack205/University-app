// Imports
const Feedback = require('../models/feedback');

exports.submitFeedback = async (req, res) => {
    try {
        const { type, message, guestName, guestEmail } = req.body;
        
        const feedbackData = {
            type: type || 'other',
            message
        };

        if (req.user && req.user.id) {
            feedbackData.user = req.user.id;
        } else {
            feedbackData.guestName = guestName;
            feedbackData.guestEmail = guestEmail;
        }

        const feedback = await Feedback.create(feedbackData);
        res.status(201).json({ message: 'Feedback submitted', feedback });
    } catch (err) {
        res.status(500).json({ message: 'Failed to submit feedback', error: err.message });
    }
};

exports.getAllFeedback = async (req, res) => {
    try {
        const feedbacks = await Feedback.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json(feedbacks);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch feedback', error: err.message });
    }
};

exports.updateFeedbackStatus = async (req, res) => {
    try {
        const { status, adminNote } = req.body;
        const updateData = { status };
        
        if (adminNote !== undefined) {
            updateData.adminNote = adminNote;
        }
        
        if (status === 'resolved') {
            updateData.resolvedAt = Date.now();
        }

        const feedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        ).populate('user', 'name email');

        if (!feedback) {
            return res.status(404).json({ message: 'Feedback not found' });
        }

        res.status(200).json({ message: 'Feedback updated', feedback });
    } catch (err) {
        res.status(500).json({ message: 'Failed to update feedback', error: err.message });
    }
};
