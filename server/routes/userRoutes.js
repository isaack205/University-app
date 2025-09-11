// Imports
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { registerUser, loginUser, getOwnProfile, updateProfile, forgotPassword, resetPassword, deleteUser, getAllUsers } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getOwnProfile);
router.put('/update-profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/me', protect, deleteUser);

// Admin get all users
router.get('/users', protect, authorize(['classRep']), getAllUsers);

// Admin delete user
router.delete('/users/:id', protect, authorize(['classRep']), deleteUser);

// Export
module.exports = router;