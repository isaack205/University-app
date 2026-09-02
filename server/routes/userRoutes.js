// Imports
const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { registerUser, loginUser, getOwnProfile, updateProfile, changePassword, forgotPassword, resetPassword, deleteUser, getAllUsers, getUsersByCohort, updateUserRole, verifyEmail, googleAuth, completeAcademicOnboarding } = require('../controllers/userController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.post('/verify-email', verifyEmail);
router.get('/me', protect, getOwnProfile);
router.put('/update-profile', protect, updateProfile);
router.put('/complete-onboarding', protect, completeAcademicOnboarding);
router.put('/change-password', protect, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.delete('/me', protect, deleteUser);

// Admin get all users
router.get('/users', protect, authorize(['admin']), getAllUsers);

router.get('/cohort/:cohortId', protect, authorize(['admin']), getUsersByCohort);
router.patch('/update-role/:userId', protect, authorize(['admin']), updateUserRole);

// Admin delete user
router.delete('/users/:id', protect, authorize(['admin']), deleteUser);

// Export
module.exports = router;