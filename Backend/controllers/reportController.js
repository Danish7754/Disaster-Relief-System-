const Report = require("../models/Report");
const NGO = require("../models/NGO");
const setPriority = require("../utils/priorityLogic");

const recalculateNgoMetrics = async (ngoId) => {
    const totalTaken = await Report.countDocuments({
        assignedNgo: ngoId,
        status: { $in: ["in-progress", "resolved"] },
    });

    const resolvedCount = await Report.countDocuments({
        assignedNgo: ngoId,
        status: "resolved",
    });

    let avgResponseTime = 0;
    const resolvedReports = await Report.find({
        assignedNgo: ngoId,
        status: "resolved",
    }).select("createdAt updatedAt");

    if (resolvedReports.length > 0) {
        const totalHours = resolvedReports.reduce((sum, report) => {
            const diffMs = new Date(report.updatedAt).getTime() - new Date(report.createdAt).getTime();
            return sum + diffMs / (1000 * 60 * 60);
        }, 0);
        avgResponseTime = Number((totalHours / resolvedReports.length).toFixed(1));
    }

    const successRate = totalTaken > 0 ? Math.round((resolvedCount / totalTaken) * 100) : 0;

    const efficiencyScore = totalTaken > 0 ? resolvedCount / totalTaken : 0;
    const volumeBonus = Math.min(resolvedCount, 50) / 50;
    const rating = totalTaken > 0
        ? Number(Math.min(5, 2 + efficiencyScore * 2.5 + volumeBonus * 0.5).toFixed(1))
        : 2.5;

    await NGO.findByIdAndUpdate(ngoId, {
        $set: {
            "performanceMetrics.totalReportsHandled": resolvedCount,
            "performanceMetrics.successRate": successRate,
            "performanceMetrics.avgResponseTime": avgResponseTime,
            rating,
        },
    });
};

const ensureReportState = (report, ngo) => {
    if (!report.state || !String(report.state).trim()) {
        report.state = ngo?.state || "Unknown";
    }
};


//------------------------------------------------------------------------------------------------------------------

// naya report create karne ke liye controller function
const createReport = async (req, res) => {
    try {
        const { title, description, category, location, state, urgency } = req.body;
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
            state: state || req.user?.state || "",
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
        const { title, description, location, state, priority } = req.body;
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
        // update only with provided values, falling back to existing values or user defaults
        report.title = title || report.title;
        report.description = description || report.description;
        report.location = { city: (location && String(location).trim()) || report.location?.city || req.user?.city || "" };
        // ensure state is present: prefer provided state, then existing, then user's state
        report.state = (state && String(state).trim()) || report.state || req.user?.state || "";
        report.priority = priority || report.priority;

        try {
            await report.save();
        } catch (saveErr) {
            // surface validation errors clearly to the client
            if (saveErr && saveErr.name === 'ValidationError') {
                const firstKey = Object.keys(saveErr.errors || {})[0];
                const message = firstKey ? saveErr.errors[firstKey].message : 'Validation failed';
                return res.status(400).json({ message });
            }
            throw saveErr;
        }

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
            .populate("createdBy", "name email phone")
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

        ensureReportState(report, ngo);
        report.status = "in-progress";
        report.ngoAssignmentState = "accepted";
        await report.save();

        await recalculateNgoMetrics(ngo._id);

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

        ensureReportState(report, ngo);
        report.status = "resolved";
        await report.save();

        await recalculateNgoMetrics(ngo._id);

        return res.status(200).json({
            message: "Report marked as resolved",
            report,
        });
    }
    catch (err) {
        return res.status(500).json({ message: "Server Error", error: err.message });
    }
};

// NGO pending report reject kar sakta hai, report government ke paas wapas chali jayegi
const rejectNgoAssignedReport = async (req, res) => {
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
                message: "Only pending reports can be rejected",
            });
        }

        ensureReportState(report, ngo);
        report.assignedNgo = null;
        report.status = "pending";
        report.ngoAssignmentState = "unassigned";
        report.rejectionHistory = report.rejectionHistory || [];
        report.rejectionHistory.push({
            rejectedBy: ngo._id,
            rejectedAt: new Date()
        });
        await report.save();

        ngo.assignedReports = (ngo.assignedReports || []).filter(
            (reportId) => reportId.toString() !== report._id.toString()
        );
        await ngo.save();

        await recalculateNgoMetrics(ngo._id);

        return res.status(200).json({
            message: "Report rejected successfully",
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
    rejectNgoAssignedReport,
    completeNgoAssignedReport,
}; // yeh functions ko export kar raha hai taaki routes mein use kiya ja sake
