const Report = require("../models/Report");
const NGO = require("../models/NGO");
const setPriority = require("../utils/priorityLogic");


//------------------------------------------------------------------------------------------------------------------

// naya report create karne ke liye controller function
const createReport = async (req, res) => {
    try {
        const { title, description, category, location, urgency } = req.body;
        //  if (!location) {
        //     return res.status(400).json({ message: "Location is required" });
        // }
        // console.log("Request body:", req.body);

        const priority = setPriority(category, urgency, description); // priority logic function ko call kar raha hai
        const report = new Report({
            title,
            description,
            category,
            location: {
                city: location,
            },
            priority,
            createdBy: req.user.id // yeh user ID token se milegi jo authentication middleware se aayegi
        });
        await report.save();
        res.status(201).json({ message: "Report created successfully", report }); // 201 status code ka matlab hai resource successfully create ho gaya
    }
    catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
//------------------------------------------------------------------------------------------------------------------
// saare reports ko fetch karne ke liye controller function (user dekh sakta hai apne khud ke reports)
const getMyReports = async (req, res) => {
    try {
        const reports = await Report.find({ createdBy: req.user.id })
            .populate('assignedNgo', 'name contactInfo.phone')    // NGO name ke saath contact phone bhi populate kar raha hai
            .sort({ createdAt: -1 }); // user ke saare reports fetch kar raha hai aur unhe createdAt ke hisaab se sort kar raha hai (naya report pehle aayega)
        res.status(200).json(reports);
    }
    catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------
// ek specific report ko fetch karne ke liye controller function (user dekh sakta hai apne khud ke report)
const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id); // specific report fetch kar raha hai jo user ne banayi hai
        if (!report) {
            return res.status(404).json({ message: "Report not found" }); // agar report nahi milti toh 404 status code bhej raha hai
        }

        // Sirf wahi user apni report dekh sake jo owner hai
        if (report.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" }); // agar user owner nahi hai toh 403 status code bhej raha hai
        }
        res.status(200).json({ message: "Report fetched successfully", report });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
//---------------------------------------------------------------------------------------------------------------
// report ko update karne ke liye controller function (user apne khud ke report ko update kar sakta hai)
const updateReport = async (req, res) => {
    try {
        const { title, description, location, priority } = req.body;
        const report = await Report.findOne({ _id: req.params.id, createdBy: req.user.id }); // specific report fetch kar raha hai jo user ne banayi hai
        if (!report) {
            return res.status(404).json({ message: "Report not found" }); // agar report nahi milti toh 404 status code bhej raha hai
        }
        // Sirf wahi user apni report update kar sake jo owner hai
        if (report.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" }); // agar user owner nahi hai toh 403 status code bhej raha hai
        }
        if (report.assignedNgo || report.status !== "pending") {
            return res.status(400).json({
                message: "Report cannot be edited once assigned or in progress"
            });
        }
        report.title = title;
        report.description = description;
        report.location = location;
        report.priority = priority;
        await report.save();
        res.status(200).json({ message: "Report updated successfully", report });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
//---------------------------------------------------------------------------------------------------------------
// report ko delete karne ke liye controller function (user apne khud ke report ko delete kar sakta hai)
const deleteReport = async (req, res) => {
    try {
        const report = await Report.findOne({ _id: req.params.id, createdBy: req.user.id }); // specific report fetch kar raha hai jo user ne banayi hai
        if (!report) {
            return res.status(404).json({ message: "Report not found" }); // agar report nahi milti toh 404 status code bhej raha hai
        }
        // Sirf wahi user apni report delete kar sake jo owner hai
        if (report.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Access denied" }); // agar user owner nahi hai toh 403 status code bhej raha hai
        }
        if (report.assignedNgo || report.status !== "pending") {
            return res.status(400).json({
                message: "Assigned report cannot be deleted"
            });
        }
        await report.deleteOne();
        res.status(200).json({ message: "Report deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
//---------------------------------------------------------------------------------------------------------------
const getAllReportsAuthorities = async (req, res) => {
    try {

        // roles check kar raha hai ki user authority hai ya nahi
        if (req.user.role !== 'ngo' && req.user.role !== 'government') {
            return res.status(403).json({ message: "Access denied" }); // agar user authority nahi hai toh 403 status code bhej raha hai
        }

        const reports = await Report.find().populate('createdBy', 'name email'); // isse jise report banane wale user ka naam aur email bhi mil jayega
        res.status(200).json({ message: "Reports fetched successfully", reports });
    }
    catch (err) {
        res.status(500).json({ message: "Server Error", error: err.message });
    }
};
//------------------------------------------------------------------------------------------------------------------

// NGO ko assigned reports fetch karne ke liye controller function
const getNgoAssignedReports = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Access denied. NGO role required" });
        }

        const ngo = await NGO.findOne({ createdBy: req.user.id });
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const reports = await Report.find({ assignedNgo: ngo._id })
            .populate("createdBy", "name email")
            .populate("assignedNgo", "name contactInfo.phone")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Assigned reports fetched successfully",
            reports,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// NGO assigned report accept kar sakta hai (pending -> in-progress)
const acceptNgoAssignedReport = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Access denied. NGO role required" });
        }

        const ngo = await NGO.findOne({ createdBy: req.user.id });
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const report = await Report.findOne({ _id: req.params.id, assignedNgo: ngo._id });
        if (!report) {
            return res.status(404).json({ message: "Assigned report not found" });
        }

        if (report.status !== "pending") {
            return res.status(400).json({
                message: "Only pending reports can be accepted",
            });
        }

        report.status = "in-progress";
        await report.save();

        return res.status(200).json({
            message: "Report accepted successfully",
            report,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// NGO in-progress report complete kar sakta hai (in-progress -> resolved)
const completeNgoAssignedReport = async (req, res) => {
    try {
        if (req.user.role !== "ngo") {
            return res.status(403).json({ message: "Access denied. NGO role required" });
        }

        const ngo = await NGO.findOne({ createdBy: req.user.id });
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const report = await Report.findOne({ _id: req.params.id, assignedNgo: ngo._id });
        if (!report) {
            return res.status(404).json({ message: "Assigned report not found" });
        }

        if (report.status !== "in-progress") {
            return res.status(400).json({
                message: "Only in-progress reports can be completed",
            });
        }

        report.status = "resolved";
        await report.save();

        return res.status(200).json({
            message: "Report marked as resolved",
            report,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

//------------------------------------------------------------------------------------------------------------------

module.exports = {
    createReport,
    getMyReports,
    getReportById,
    updateReport,
    deleteReport,
    getAllReportsAuthorities,
    getNgoAssignedReports,
    acceptNgoAssignedReport,
    completeNgoAssignedReport,
}; // yeh functions ko export kar raha hai taaki routes mein use kiya ja sake
