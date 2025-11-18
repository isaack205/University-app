//Imports
const Cat = require('../models/cat');
const sendAppNotification = require('../services/notificationService');
const User = require('../models/user');
const sendSMS = require('../services/smsService');

// Create CAT
exports.createCAT = async (req, res) => {
    try {
        const classRep = req.user;
    
        if (classRep.cohort.toString() !== req.body.cohort) {
            return res.status(403).json({ message: "You can only create CAT(S) for your cohort" })
        }

        const { title, description, cohort, unit, type, submissionDate, submissionFormat, sittingDate, sittingDay, sittingTime, venue, requiredItems, catNumber } = req.body;
        const catData = { title, description, cohort, unit, type, catNumber, createdBy: req.user._id, isPublished: isPublished ?? false };

        // Takeaway fields
        if (type === "takeaway") {
            if (!submissionDate) {
                return res.status(400).json({ error: "Takeaway CAT needs submissionDate" });
            }
            
            catData.submissionDate = submissionDate;
            catData.submissionFormat = submissionFormat;

            // Remove sitting fields
            // catData.sittingDate = undefined;
            // catData.sittingDay = undefined;
            // catData.sittingTime = undefined;
            // catData.venue = undefined;
            // catData.requiredItems = undefined;
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

            // Remove takeaway fields
            // catData.submissionDate = undefined;
            // catData.submissionFormat = undefined;
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

// Get all CATs for logged-in user's cohort
exports.getCATsForCohort = async (req, res) => {
    try {
        const cohortId = req.user.cohort;

        const cats = await Cat.find({ cohort: cohortId })
            .populate([ {path: 'unit', select: 'unitCode'}])
            .populate("createdBy", "name");

        res.status(200).json({ cats });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch CATs", error: err.message });
    }
};

// Fetch single CAT by Id
exports.getCATById = async (req, res) => {
    try {
        const cat = await Cat.findById(req.params.id)
            .populate([
                { path: 'unit', select: 'unitCode lecturer'},
                { path: 'cohort', select: 'name'}
            ])
            .populate("createdBy", "name");

        if (!cat) return res.status(404).json({ message: "CAT not found" });

        if (cat.cohort.toString() !== req.user.cohort.toString()) {
            return res.status(403).json({ message: "Not allowed to view this CAT" });
        }

        res.status(200).json({ cat });
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

        // Send notifications only when important fields changed
        if (message && cat.isPublished) {
            const students = await User.find({ cohort: cat.cohort });

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



