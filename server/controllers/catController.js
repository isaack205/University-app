//Imports
const Cat = require('../models/cat');
const { sendAppNotification } = require('../services/notificationService');
const sendEmail = require('../utils/sendEmail');
const { User } = require('../models/user');
const sendSMS = require('../services/smsService');

// Create CAT
exports.createCAT = async (req, res) => {
    try {
        const classRep = req.user;
    
        if (classRep.cohort.toString() !== req.body.cohort) {
            return res.status(403).json({ message: "You can only create CAT(S) for your cohort" })
        }

        const { title, description, cohort, unit, type, submissionDate, submissionFormat, sittingDate, sittingDay, sittingTime, venue, requiredItems, catNumber, isPublished } = req.body;
        const catData = { title, description, cohort, unit, type, catNumber, createdBy: req.user._id, isPublished: isPublished ?? false };

        // Takeaway fields
        if (type === "takeaway") {
            if (!submissionDate) {
                return res.status(400).json({ error: "Takeaway CAT needs submissionDate" });
            }
            
            catData.submissionDate = submissionDate;
            catData.submissionFormat = submissionFormat;
        }

        // Sitting fileds
        if (type === "sitting") {
            if (!sittingDate || !venue) {
                return res.status(400).json({ error: "Sitting CAT needs sittingDate and venue" });
            }

            catData.sittingDate = sittingDate;
            catData.sittingDay = sittingDay;
            catData.sittingTime = sittingTime;
            catData.venue = venue;
            catData.requiredItems = requiredItems;
        }

        const cat = await Cat.create(catData);
        
        // Notify students via app notification
        const students = await User.find({ cohort: cat.cohort });
        for (const student of students) {

            let message = "";

            if (cat.type === "takeaway") {
                message = `📄 Takeaway CAT Released!\n${cat.title} (${cat.catNumber}) is now available. Check the submission date and instructions.`;
            } else {
                message = `✏️ Sitting CAT Scheduled!\n${cat.title} (${cat.catNumber}) has been posted. Check the date, time and venue.`;
            }
    
            if (cat.isPublished === true) {
                await sendAppNotification(
                    student._id, 
                    message,
                    'CAT', 
                    cat._id, 
                );
            }
    
            // if (student.preferences.smsNotifications && student.phoneNumber) {
            //     await sendSMS(student._id, student.phoneNumber, `📚 New CAT posted: ${cat.title},`, 'CAT');
            // }
    
        };
    
        res.status(201).json({ message: 'CAT created', cat });
    } catch (err) {
        res.status(500).json({ message: 'Failed to create CAT', error: err.message });
    }
}

// Get all CATs for logged-in user's cohort (students see only published)
exports.getCATsForCohort = async (req, res) => {
    try {
        const cohortId = req.user.cohort;

        // Build query: students only get published CATs; staff/classRep/admin see all for cohort
        const query = { cohort: cohortId };
        const role = req.user.role || '';

        const studentRoles = ['student'];
        if (studentRoles.includes(role)) {
            query.isPublished = true;
        }

        const cats = await Cat.find(query)
            .populate([{ path: 'unit', select: 'unitCode' }])
            .populate("createdBy", "name");

        res.status(200).json(cats);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch CATs", error: err.message });
    }
};

// Fetch single CAT by Id
exports.getCATById = async (req, res) => {
    try {
        const cat = await Cat.findById(req.params.id)
            .populate([
                { path: 'unit', select: 'unitName unitCode lecturer' },
                { path: 'cohort', select: 'name' }
            ])
            .populate("createdBy", "name");

        if (!cat) return res.status(404).json({ message: "CAT not found" });

        // Must be same cohort
        if (cat.cohort._id.toString() !== req.user.cohort.toString()) {
            return res.status(403).json({ message: "Not allowed to view this CAT" });
        }

        // If CAT is not published: allow creator or non-student roles (staff/admin); block students
        const role = req.user.role || '';
        const isStudent = role === 'student';
        const isCreator = cat.createdBy && req.user._id.toString() === cat.createdBy._id.toString();

        if (!cat.isPublished && isStudent && !isCreator) {
            return res.status(403).json({ message: "Not allowed to view this CAT" });
        }

        res.status(200).json(cat);
    } catch (err) {
        res.status(500).json({ message: "Error fetching CAT", error: err.message });
    }
};

// Update CAT
exports.updateCAT = async (req, res) => {
    try {
        const cat = await Cat.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: "CAT not found" });

        // Ensure class rep only updates their cohort
        if (cat.cohort.toString() !== req.user.cohort.toString()) {
            return res.status(403).json({ message: "You cannot update CATs outside your cohort" });
        }

        const { title, description, type, submissionDate, submissionFormat, sittingDate, sittingDay, sittingTime, venue, requiredItems, isPublished, catNumber } = req.body;

        const oldCat = cat.toObject(); // Keep old version to compare

        // Apply updates
        if (title) cat.title = title;
        if (description) cat.description = description;
        if (catNumber) cat.catNumber = catNumber;
        if (typeof isPublished === "boolean") cat.isPublished = isPublished;

        // Handle Takeaway
        if (type === "takeaway") {
            if (submissionDate) cat.submissionDate = submissionDate;
            if (submissionFormat) cat.submissionFormat = submissionFormat;

            // Clear sitting fields
            cat.sittingDate = undefined;
            cat.sittingDay = undefined;
            cat.sittingTime = undefined;
            cat.venue = undefined;
            cat.requiredItems = undefined;
        }

        // Handle Sitting
        if (type === "sitting") {
            if (sittingDate) cat.sittingDate = sittingDate;
            if (sittingDay) cat.sittingDay = sittingDay;
            if (sittingTime) cat.sittingTime = sittingTime;
            if (venue) cat.venue = venue;
            if (requiredItems) cat.requiredItems = requiredItems;

            // Clear takeaway fields
            cat.submissionDate = undefined;
            cat.submissionFormat = undefined;
        }

        await cat.save();

        // Prepare change-detection messages
        let message = null;

        if (cat.type === "takeaway") {
            if (oldCat.submissionDate !== cat.submissionDate || oldCat.submissionFormat !== cat.submissionFormat) {

                message = `📄 Takeaway CAT Updated!\n${cat.title} (${cat.catNumber}) instructions or submission date have changed.`;
            }
        }

        if (cat.type === "sitting") {
            if (
                oldCat.sittingDate !== cat.sittingDate ||
                oldCat.sittingDay !== cat.sittingDay ||
                oldCat.sittingTime !== cat.sittingTime ||
                oldCat.venue !== cat.venue ||
                JSON.stringify(oldCat.requiredItems) !== JSON.stringify(cat.requiredItems)
            ) {
                message = `✏️ Sitting CAT Updated!\n${cat.title} (${cat.catNumber}) venue, time, date or required items have changed.`;
            }
        }

        // Send notifications and emails only when important fields changed
        if (message && cat.isPublished) {
            const students = await User.find({ cohort: cat.cohort });
            
            // Prepare the email HTML
            const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h1 style="color: #e11d48; margin: 0;">🚨 URGENT: CAT Updated!</h1>
                    </div>
                    <div style="color: #334155; font-size: 16px; line-height: 1.6;">
                        <p>Hi Student,</p>
                        <p>An important update has been made to a CAT for your cohort.</p>
                        <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #e11d48; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; font-weight: bold; font-size: 18px;">${cat.title} (${cat.catNumber})</p>
                            <p style="margin: 10px 0 0 0;">${message.replace(/\n/g, '<br/>')}</p>
                        </div>
                        <p>Please log in to your dashboard immediately to check the new details, including venue, date, or submission instructions.</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${process.env.FRONTEND_URL}/home" style="background-color: #e11d48; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View in Dashboard</a>
                        </div>
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
                        <p style="font-size: 14px; color: #94a3b8;">This is an automated academic alert from CampusHub. Please do not ignore it.</p>
                    </div>
                </div>
            `;

            // Collect all email addresses for BCC to send in one go (respecting preferences)
            const bccEmails = students
                .filter(s => s.preferences?.emailNotifications !== false)
                .map(s => s.email);

            if (bccEmails.length > 0) {
                // Send single email with all students in BCC
                sendEmail({
                    to: process.env.EMAIL_USER || 'no-reply@campushub.com', // fallback to something generic
                    bcc: bccEmails.join(','),
                    subject: `🚨 URGENT: CAT Rescheduled - ${cat.title}`,
                    html: emailHtml
                }).catch(err => console.error("Error sending CAT update email:", err));
            }

            for (const student of students) {
                await sendAppNotification(student._id, message, "CAT", cat._id);

                // if (student.preferences.smsNotifications && student.phoneNumber) {
                //     await sendSMS(student._id, student.phoneNumber, message, "CAT");
                // }
            }
        }

        res.status(200).json({ message: "CAT updated successfully", cat });
    } catch (err) {
        res.status(500).json({ message: "Failed to update CAT", error: err.message });
    }
};

// Delete CAT
exports.deleteCAT = async (req, res) => {
    try {
        const cat = await Cat.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: "CAT not found" });

        if (cat.cohort.toString() !== req.user.cohort.toString()) {
            return res.status(403).json({ message: "Not allowed to delete this CAT" });
        }

        await cat.deleteOne();

        res.status(200).json({ message: "CAT deleted successfully" });

    } catch (err) {
        res.status(500).json({ message: "Failed to delete CAT", error: err.message });
    }
};

exports.togglePublishCAT = async (req, res) => {
    try {
        const cat = await Cat.findById(req.params.id);
        if (!cat) return res.status(404).json({ message: "CAT not found" });

        // Only allow same cohort rep
        if (cat.cohort.toString() !== req.user.cohort.toString()) {
            return res.status(403).json({ message: "Not allowed" });
        }

        // Flip the value
        cat.isPublished = !cat.isPublished;
        await cat.save();

        // If turning ON -> send notification
        if (cat.isPublished === true) {
            const students = await User.find({ cohort: cat.cohort });

            const message = cat.type === "takeaway" 
              ? `📄 New Takeaway CAT Posted!\n${cat.title} (${cat.catNumber}) is now available.`
              : `✏️ New Sitting CAT Posted!\n${cat.title} (${cat.catNumber}) details are now available.`;

            // Send app & SMS notifications
            for (const student of students) {
                await sendAppNotification(student._id, message, "CAT", cat._id);

                // if (student.preferences.smsNotifications && student.phoneNumber) {
                //     await sendSMS(student._id, student.phoneNumber, message, "CAT");
                // }
            }
        }

        res.status(200).json({
            message: `CAT is now ${cat.isPublished ? "Published" : "Unpublished"}`,
            cat
        });

    } catch (err) {
        res.status(500).json({ message: "Failed to toggle publish state", error: err.message });
    }
};



