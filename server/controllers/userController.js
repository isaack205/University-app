// Imports
const User = require('../models/user');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Load env variables
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

exports.registerUser = async (req, res) => {

    const { name, studentId, email, phoneNumber, password, role, course, cohort } = req.body;

    try {
        // Check if studentId exists
        const studentIdExist =  await User.findOne({ studentId });

        if(studentIdExist) {
            return res.status(400).json({message: "User with Id already exists"})
        };

        // Check if email exists
        const emailExist = await User.findOne({ email });

        if (emailExist) {
            return res.status(400).json({message: "User with email already exists"})
        };

        // Hash password into 10 string
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ ...req.body, password: hashedPassword });
        
        const token = JWT.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        )

        // Return token and user
        res.status(201).json({ message: "User created successfully", user, token });
    } catch (error) {
        res.status(500).json({message: "Error creating user", error: error.message});
    }
};

exports.loginUser = async (req, res) => {

    const { studentId, password } = req.body;

    try {
        const user = await User.findOne({ studentId });
        if (!user) {
            return res.status(400).json({message: "User not found!"})
        };

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({message: "Invalid email or password"})
        }
        
        const token = JWT.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        )

        res.status(200).json({message: "User logged in successfully", user, token});
    } catch (error) {
        res.status(500).json({message: "Error loggin in user", error: error.message});
    }
};

exports.getOwnProfile = async (req, res) => {

    const { id } = req.user;

    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({message: "User not found"})
        };

        res.status(200).json({message: "Profile found", user});
    } catch (error) {
        res.status(500).json({message: "Error while getting profile", error: error.message});
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const updates = { ...req.body };

        if(updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10)
        };

        const user = await User.findByIdAndUpdate(req.user.id, updates, {
            new: true, runValidators: true, select: '-password'
        })

        if(!user) {
            return res.status(400).json({message: "User profile to be updated not found"})
        }

        res.status(200).json({message: "Profile updated successfully", user})
    } catch (error) {
        res.status(500).json({message: "Error updating profile", error: error.message})
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({message: "User not found"})
        };

        // secure, simple, non-JWT token..
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');


        // 3. Set the hashed token and its expiration on the user model.
        user.resetPasswordToken = hashedResetToken;
        user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // Valid for 10 minutes

        await user.save({ validateBeforeSave: false });

        // Send unhashed token to user's email
        const resetURL = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
        const message = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease go to the following link to reset your password: ${resetURL}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;


        // Send email with reset link (pseudo code)
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `Reset your password using this link: ${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`
        });

        res.status(200).json({message: "Password reset email sent to your email"});

    } catch (error) {
         // If an email sending error occurs, clear the token fields to prevent a security vulnerability.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        console.error('Error sending password reset email:', error);
        res.status(500).json({ message: "Error sending password reset email", error: error.message });
    }
};

exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // Hash the incoming token to compare it with the hashed token in the database.
    const hashedResetToken = crypto.createHash('sha256').update(token).digest('hex');

    try {

        // Find a user with the matching hashed token and a non-expired timestamp.
        const user = await User.findOne({ 
            resetPasswordToken: hashedResetToken,
            resetPasswordExpire: { $gt: Date.now() } // $gt: 'greater than' the current time
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired password reset token." });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        // Invalidate the token immediately by clearing the fields.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();



        await sendEmail({
            to: user.email,
            subject: "Password changed successfully",
            text: 'Your password has been changed successfully.'
        });

        res.status(200).json({message: "Password reset successfully"});

    } catch (error) {
        res.status(500).json({message: "Error resetting password", error: error.message});
    }
};

// Delete user account
exports.deleteUser = async (req, res) => {
    try {
        // Use req.params.id if present (admin deletes any user), otherwise req.user.id (user deletes self)
        const userId = req.params.id || req.user.id;
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
};

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};