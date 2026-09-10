// Imports
const mongoose = require('mongoose');
const { User, Student, Admin } = require('../models/user');
const JWT = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { sendAppNotification } = require('../services/notificationService');
const { sendSMS } = require('../services/smsService');
const logActivity = require('../utils/auditLogger');

// Load env variables
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL;

exports.registerUser = async (req, res) => {

    const { name, studentId, email, phoneNumber, password, role, course, cohort } = req.body;

    try {
        // Prevent admin registration through standard user route
        if (role === 'admin') {
            return res.status(403).json({ message: "Admin registration is not allowed via this endpoint" });
        }

        // Check if studentId exists (if provided)
        if (studentId) {
            const studentIdExist = await User.findOne({ studentId });
            if (studentIdExist) {
                return res.status(400).json({ message: "User with Student Reg ID already exists" });
            }
        }

        // Check if email exists
        const emailExist = await User.findOne({ email });

        if (emailExist) {
            return res.status(400).json({message: "User with email already exists"})
        };

        // Generate Verification Token
        const verificationToken = crypto.randomBytes(20).toString('hex');
        const hashedVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        // Hash password into 10 string
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await Student.create({ 
            name,
            email: email.toLowerCase(),
            studentId: studentId || `STU-${Date.now().toString().slice(-6)}`,
            phoneNumber: phoneNumber || 'Not Provided',
            course: course || null,
            cohort: cohort || null,
            role: role || 'student', 
            password: hashedPassword,
            verificationToken: hashedVerificationToken
        });
        
        // Send Verification Email
        const verifyURL = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #4f46e5; margin: 0;">Welcome to CampusHub! 🎓</h1>
                </div>
                <div style="color: #334155; font-size: 16px; line-height: 1.6;">
                    <p>Hi <strong>${user.name}</strong>,</p>
                    <p>Thanks for registering on CampusHub! We're excited to have you on board.</p>
                    <p>Before you can access your dashboard and stay updated with your classes, we just need to verify your email address.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyURL}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">Verify My Email</a>
                    </div>
                    <p>If the button above doesn't work, you can copy and paste the following link into your browser:</p>
                    <p style="word-break: break-all; color: #64748b; font-size: 14px;">${verifyURL}</p>
                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                    <p style="font-size: 14px; color: #94a3b8;">If you did not create an account, no further action is required.</p>
                </div>
            </div>
        `;

        try {
            await sendEmail({
                to: user.email,
                subject: "🎓 Verify your CampusHub Account",
                html: emailHtml
            });
        } catch (emailError) {
            // Rollback user creation if email fails so they can try again later
            await User.findByIdAndDelete(user._id);
            return res.status(500).json({message: "Registration failed: Could not send verification email. Please check email configuration."});
        }

        // Return user without token
        res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
        res.status(500).json({message: "Error creating user", error: error.message});
    }
};

exports.loginUser = async (req, res) => {

    const { studentId, email, password } = req.body;

    try {
        const identifier = studentId || email;
        const query = identifier?.includes('@') 
            ? { email: identifier }
            : { $or: [{ studentId: identifier }, { adminId: identifier }, { email: identifier }] };

        const user = await User.findOne(query);
        if (!user) {
            await logActivity({
                action: 'LOGIN_FAILED',
                category: 'AUTH',
                severity: 'WARNING',
                details: { identifier },
                req
            });
            return res.status(400).json({message: "User not found!"})
        };

        if (user.role !== 'admin') {
            await user.populate([
                { path: 'course', select: 'name code' }, 
                { path: 'cohort', select: 'name year' }
            ]);
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            await logActivity({
                user,
                action: 'LOGIN_FAILED',
                category: 'AUTH',
                severity: 'WARNING',
                details: { identifier },
                req
            });
            return res.status(400).json({message: "Invalid credentials"})
        }

        if (!user.isVerified) {
            return res.status(403).json({ 
                message: "Please check your inbox and verify your email address before logging in.", 
                isVerified: false 
            });
        }
        
        const token = JWT.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        )

        // Track last login time for activity feed
        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        // Log audit event
        await logActivity({
            user,
            action: 'LOGIN_SUCCESS',
            category: 'AUTH',
            severity: 'INFO',
            details: { role: user.role },
            req
        });

        // Strip sensitive fields before sending to client
        const safeUser = user.toObject();
        delete safeUser.password;
        delete safeUser.resetPasswordToken;
        delete safeUser.resetPasswordExpire;
        delete safeUser.verificationToken;

        res.status(200).json({message: "User logged in successfully", user: safeUser, token});
    } catch (error) {
        res.status(500).json({message: "Error loggin in user", error: error.message});
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: "Verification token is required" });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({ verificationToken: hashedToken });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired verification token." });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: "Email verified successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Error verifying email", error: error.message });
    }
};

exports.getOwnProfile = async (req, res) => {

    const { id } = req.user;

    try {
        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({message: "User not found"})
        };

        if (user.role !== 'admin') {
            await user.populate([
                { path: 'course', select: 'name code' }, 
                { path: 'cohort', select: 'name year' }
            ]);
        }

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
        const message = `👋 Hello ${user.name},\n\nWe received a request to reset your password for your University App account.\n\n🔗 Please click the link below to securely reset your password:\n ${resetURL} \n\n⚠️ If you did not request this, please ignore this email and your password will remain unchanged.\n\nBest regards,\nCHUXEN App Team`;


        // Send email with reset link (pseudo code)
        await sendEmail({
            to: user.email,
            subject: "Password Reset Request",
            text: `${message}`
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
            subject: "🔒 Password Changed Successfully! 🎉",
            text: `Hi ${user.name},\n\n✅ Your password for your University App account has been changed successfully!\n\nIf you made this change, you can safely ignore this message. If you did NOT request this change, please contact our support team immediately for assistance.\n\nFor your security, always keep your password confidential and avoid sharing it with anyone.\n\nIf you have any questions or need help, feel free to reach out to us.\n\nBest regards,\nCHUXEN Team\n\n🔔 Stay safe and secure!`
        });

        res.status(200).json({message: "Password reset successfully"});

    } catch (error) {
        res.status(500).json({message: "Error resetting password", error: error.message});
    }
};

// Change user password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "currentPassword and newPassword are required" });
    }

    // Ensure we fetch the hashed password
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Notify user about password change
    await sendEmail({
      to: user.email,
      subject: "Your password was changed",
      text: `Hi ${user.name},\n\nYour account password was changed successfully.\nIf this wasn't you, contact support immediately.`
    }).catch(() => { /* swallow email errors */ });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error changing password", error: error.message });
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
        const users = await User.find().select('-password').populate([
            { path: 'course', select: 'name' }, 
            { path: 'cohort', select: 'name' }
        ]);
        res.status(200).json({ users });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
};

// Get users filtered by cohort
exports.getUsersByCohort = async (req, res) => {
    try {
        // Find all users belonging to this specific cohort
        const users = await User.find({ cohort: req.params.cohortId })
                                .select('-password')
                                .populate([{ path: 'course', select: 'name'}, {path: 'cohort', select: 'name'}])
                                .sort({ name: 1 }); // Alphabetically

        if (!users) return res.status(404).json({ message: 'No users for specific cohort found'});

        res.status(200).json({count: users.length, users });
    } catch (error) {
        res.status(500).json({ message: "Error fetching cohort users", error: error.message });
    }
};

// Update user role
exports.updateUserRole = async (req, res) => {
    try {
        const { userId } = req.params;
        const { newRole } = req.body;

        // Ensure the role is valid
        const validRoles = ['student', 'classRep', 'admin'];
        if (!validRoles.includes(newRole)) {
            return res.status(400).json({ message: "Invalid role specified" });
        }

        // Prevent Self-Admin-Demotion
        if (req.user.id === userId && req.user.role === 'admin' && newRole !== 'admin') {
            return res.status(403).json({ message: "Admins cannot demote themselves for security reasons" });
        }

        const existingUser = await User.findById(userId);
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Update discriminator key 'role' directly in MongoDB collection
        await User.collection.updateOne(
            { _id: new mongoose.Types.ObjectId(userId) },
            { $set: { role: newRole } }
        );

        // Fetch updated user document
        const user = await User.findById(userId).select('-password');

        await sendAppNotification(
            user._id, 
            `Hi ${user.name},\n\nYour account role has been updated to: ${newRole}.\n\nPlease log out and log back in to see the changes reflected.`, 
            'role_update', 
            req.user.id, 
        );

        // Audit Log Event
        await logActivity({
            user: req.user,
            action: 'ROLE_ELEVATED',
            category: 'SECURITY',
            severity: newRole === 'admin' ? 'CRITICAL' : 'WARNING',
            details: { targetUserId: user._id, targetUserName: user.name, targetEmail: user.email, oldRole: existingUser.role, newRole },
            req
        });

        res.status(200).json({ 
            message: `User role successfully updated to ${newRole}`, 
            user 
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating user role", error: error.message });
    }
};

// Google SSO Authentication
exports.googleAuth = async (req, res) => {
    try {
        const { email, name, googleId } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Google authentication failed — email missing" });
        }

        let user = await User.findOne({ email });

        if (!user) {
            // Create base user for new Google signup (email is auto-verified by Google)
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashedPassword = await bcrypt.hash(randomPassword, 10);
            const tempStudentId = `GOOG-${Date.now().toString().slice(-6)}`;

            user = new User({
                name: name || 'Google User',
                email: email.toLowerCase(),
                phoneNumber: 'Not Provided',
                studentId: tempStudentId,
                password: hashedPassword,
                isVerified: true,
                role: 'student'
            });

            await user.save();

            await logActivity({
                user,
                action: 'GOOGLE_SIGNUP_SUCCESS',
                category: 'AUTH',
                severity: 'INFO',
                details: { email: user.email },
                req
            });
        } else {
            // Ensure Google SSO users are marked verified
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save({ validateBeforeSave: false });
            }

            await logActivity({
                user,
                action: 'GOOGLE_LOGIN_SUCCESS',
                category: 'AUTH',
                severity: 'INFO',
                details: { email: user.email },
                req
            });
        }

        if (user.role !== 'admin' && user.course) {
            await user.populate([
                { path: 'course', select: 'name code' },
                { path: 'cohort', select: 'name year' }
            ]);
        }

        const token = JWT.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        user.lastLoginAt = new Date();
        await user.save({ validateBeforeSave: false });

        const safeUser = user.toObject();
        delete safeUser.password;

        const needsOnboarding = user.role !== 'admin' && (!user.course || !user.cohort || user.studentId?.startsWith('GOOG-'));

        res.status(200).json({
            message: "Google authentication successful",
            token,
            user: safeUser,
            needsOnboarding
        });
    } catch (error) {
        console.error("Error in googleAuth:", error);
        res.status(500).json({ message: "Google authentication failed", error: error.message });
    }
};

// Complete Academic Setup Onboarding
exports.completeAcademicOnboarding = async (req, res) => {
    try {
        const { studentId, course, cohort } = req.body;

        if (!studentId || !course || !cohort) {
            return res.status(400).json({ message: "Student Reg ID, Course, and Cohort are all required" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User account not found" });
        }

        // Check if studentId is already taken by another user
        const existingStudentId = await User.findOne({ studentId: studentId.toUpperCase(), _id: { $ne: user._id } });
        if (existingStudentId) {
            return res.status(409).json({ message: `Student ID "${studentId.toUpperCase()}" is already registered by another account` });
        }

        user.studentId = studentId.toUpperCase();
        user.course = course;
        user.cohort = cohort;
        await user.save();

        await user.populate([
            { path: 'course', select: 'name code' },
            { path: 'cohort', select: 'name year' }
        ]);

        await logActivity({
            user,
            action: 'ACADEMIC_ONBOARDING_COMPLETED',
            category: 'AUTH',
            severity: 'INFO',
            details: { studentId: user.studentId, course: user.course?.name, cohort: user.cohort?.name },
            req
        });

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(200).json({
            message: "Academic profile setup completed successfully! Welcome to CampusHub! 🎉",
            user: safeUser
        });
    } catch (error) {
        console.error("Error in completeAcademicOnboarding:", error);
        res.status(500).json({ message: "Failed to complete academic setup", error: error.message });
    }
};

        // Send email to the user about their new status
        // await sendEmail({
        //     to: user.email,
        //     subject: "Account Role Updated",
        //     text: `Hi ${user.name},\n\nYour account role has been updated to: ${newRole}.\n\nPlease log out and log back in to see the changes reflected in your dashboard.`
        // }).catch(() => { /* silent fail if email provider is down */ });

        // await sendSMS(user._id, user.phoneNumber, `Hi ${user.name},\n\nYour account role has been updated to: ${newRole}.\n\nPlease log out and log back in to see the changes reflected.`, 'role_update');
