const Report = require("../models/Report");
const NGO = require("../models/NGO");

// ✅ Centralized severity requirements (used by multiple functions)
const SEVERITY_REQUIREMENTS = {
  high: { volunteers: 10, vehicles: 1 },
  medium: { volunteers: 5, vehicles: 0 },
  low: { volunteers: 2, vehicles: 0 }
};

// ✅ Helper function to assign NGO to report (eliminates duplicate logic)
const assignNgoToReport = async (report, ngo) => {
  report.assignedNgo = ngo._id;
  report.status = "pending";
  report.ngoAssignmentState = "waiting";
  await report.save();

  ngo.assignedReports = ngo.assignedReports || [];
  ngo.assignedReports.push(report._id);
  await ngo.save();

  return {
    reportId: report._id,
    title: report.title || "",
    severity: report.severity,
    assignedNGO: {
      id: ngo._id,
      name: ngo.name
    }
  };
};

// ✅ Helper function to find suitable NGO by state and capacity
const findNgoByStateAndCapacity = async (state, requirements) => {
  const ngoQuery = {
    state: state,
    "capacity.volunteers": { $gte: requirements.volunteers },
    "capacity.vehicles": { $gte: requirements.vehicles }
  };

  const ngos = await NGO.find(ngoQuery);
  if (!ngos || ngos.length === 0) return null;

  // Sort by least workload
  ngos.sort((a, b) => (a.assignedReports?.length || 0) - (b.assignedReports?.length || 0));
  return ngos[0];
};

// ✅ Helper function for analytics aggregation (eliminates duplicate error handling)
const performAggregation = async (req, res, model, pipeline, errorMessage) => {
  try {
    const stats = await model.aggregate(pipeline);
    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query; // query parameters se filters aur pagination values le raha hai
    //pagination woh technique hai jisse hum data ko chhote-chhote parts mein divide karte hain taaki zyada data ek saath na load ho aur performance better ho
    let query = {};

    // If government user has a state assigned, restrict reports to that state
    if (req.user?.state) {
      query.state = req.user.state;
    }

    if (status) {
      query.status = status;
    }
    if (priority) {
      query.priority = priority;
    }
    // page  and limit ko number men convert kar raha hai
    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    // fetch reports for skip and limit use karke
    const reports = await Report.find(query)
      .populate("createdBy", "name email") // createdBy field ko populate kar raha hai taaki user ke name aur email mil sake
      .populate("assignedNgo", "name email")
      .lean() // lean() use karke plain JavaScript objects mil rahe hain instead of Mongoose documents
      .skip((pageNumber - 1) * pageLimit) // skip kar raha hai reports ko based on current page
      .limit(pageLimit); // limit kar raha hai number of reports per page

    // Count total matching reports (for frontend pagination)
    const totalReports = await Report.countDocuments(query);

    res.status(200).json({
      message: "Reports fetched successfully",
      totalReports,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReports / pageLimit),//ceiling function use karke total pages calculate kar raha hai
      reports: reports,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

const getAllNgos = async (req, res) => {
  try {
    const ngos = await NGO.find({}).lean(); // lean() use karke plain JavaScript objects mil rahe hain instead of Mongoose documents
    res.status(200).json({
      message: "NGOs fetched successfully",
      ngos: ngos,
    });
  }
  catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

/**
 * POST /api/govt/reports/auto-allocate
 * Flexible auto-allocation endpoint:
 * - If reportId provided: allocate single report
 * - If reportId not provided: bulk allocate all pending reports (sorted by severity)
 */
const autoAllocateReports = async (req, res) => {
  try {
    const { reportId } = req.body;

    // 🔄 Case 1: Single report auto-allocation
    if (reportId) {
      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ success: false, message: 'Report not found' });
      }

      if (report.assignedNgo) {
        return res.status(400).json({ success: false, message: 'Report already assigned' });
      }

      if (report.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Report is not pending and cannot be auto-assigned' });
      }

      const state = (report.state || '').trim();
      if (!state) {
        return res.status(400).json({ success: false, message: 'Report state unknown; please assign manually' });
      }

      const requirements = SEVERITY_REQUIREMENTS[report.severity] || { volunteers: 0, vehicles: 0 };
      const assignedNGO = await findNgoByStateAndCapacity(state, requirements);

      if (!assignedNGO) {
        return res.status(200).json({ success: false, message: 'No NGO found in this state, please assign manually' });
      }

      await assignNgoToReport(report, assignedNGO);

      return res.status(200).json({
        success: true,
        message: 'Report auto-assigned to NGO',
        data: {
          reportId: report._id,
          ngo: { id: assignedNGO._id, name: assignedNGO.name }
        }
      });
    }

    // 📦 Case 2: Bulk allocation of all pending reports
    const pendingQuery = { status: "pending" };
    if (req.user?.state) {
      pendingQuery.state = req.user.state;
    }
    const pendingReports = await Report.find(pendingQuery);

    // Sort by severity (high → low)
    const severityOrder = { high: 1, medium: 2, low: 3 };
    pendingReports.sort((a, b) => {
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });

    const summary = {
      total: pendingReports.length,
      allocated: [],
      skipped: []
    };

    for (const report of pendingReports) {
      if (report.assignedNgo) {
        summary.skipped.push({
          reportId: report._id,
          reason: "already_assigned"
        });
        continue;
      }

      const state = (report.state || "").trim();
      const requirements = SEVERITY_REQUIREMENTS[report.severity] || { volunteers: 0, vehicles: 0 };

      if (!state) {
        summary.skipped.push({
          reportId: report._id,
          reason: "no_state"
        });
        continue;
      }

      const assignedNGO = await findNgoByStateAndCapacity(state, requirements);

      if (!assignedNGO) {
        summary.skipped.push({
          reportId: report._id,
          reason: "no_ngo_in_state"
        });
        continue;
      }

      const assignmentResult = await assignNgoToReport(report, assignedNGO);
      summary.allocated.push(assignmentResult);
    }

    return res.status(200).json({
      success: true,
      message: "Auto-allocation completed successfully",
      summary
    });
  } catch (error) {
    console.error("Auto-allocation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


const manualAssignReport = async (req, res) => {
  try {
    const { reportId, ngoId } = req.body;

    // 1️⃣ Basic validation
    if (!reportId || !ngoId) {
      return res.status(400).json({
        success: false,
        message: "reportId and ngoId are required"
      });
    }

    // 2️⃣ Find report
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    // 3️⃣ Check if already assigned
    if (report.assignedNgo) {
      return res.status(400).json({
        success: false,
        message: "Report already assigned"
      });
    }

    // 4️⃣ Find NGO
    const ngo = await NGO.findById(ngoId);
    if (!ngo) {
      return res.status(404).json({
        success: false,
        message: "NGO not found"
      });
    }

    // 5️⃣ Get requirements using centralized constant
    const requirements = SEVERITY_REQUIREMENTS[report.severity] || { volunteers: 0, vehicles: 0 };

    // 6️⃣ Capacity check
    if (
      ngo.capacity.volunteers < requirements.volunteers ||
      ngo.capacity.vehicles < requirements.vehicles
    ) {
      return res.status(400).json({
        success: false,
        message: "NGO does not have sufficient capacity"
      });
    }

    // 7️⃣ Assign NGO to report
    await assignNgoToReport(report, ngo);

    // 8️⃣ Success response
    return res.status(200).json({
      success: true,
      message: "Report manually assigned successfully",
      data: {
        reportId: report._id,
        ngo: {
          id: ngo._id,
          name: ngo.name
        }
      }
    });
  } catch (error) {
    console.error("Manual allocation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


// ✅ Helper function for analytics aggregation (eliminates duplicate error handling)
// dashboard ke liye overview analytics data provide karne wala controller function
const getOverviewAnalytics = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();

    const pending = await Report.countDocuments({ status: "pending" });
    const inProgress = await Report.countDocuments({ status: "in-progress" });
    const resolved = await Report.countDocuments({ status: "resolved" });

    return res.status(200).json({
      success: true,
      data: {
        totalReports,
        pending,
        inProgress,
        resolved
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching overview analytics",
      error: error.message
    });
  }
};


// status wise reports count provide karne wala controller function
const getStatusAnalytics = async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ];
  return performAggregation(req, res, Report, pipeline, "Error fetching status analytics");
};


// severity wise reports count provide karne wala controller function
const getSeverityAnalytics = async (req, res) => {
  const pipeline = [
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 }
      }
    }
  ];
  return performAggregation(req, res, Report, pipeline, "Error fetching severity analytics");
};

// NGO workload analytics provide karne wala controller function
const getNgoWorkloadAnalytics = async (req, res) => {
  try {
    const ngos = await NGO.find({}, "name assignedReports");

    const workload = ngos.map((ngo) => ({
      ngoId: ngo._id,
      name: ngo.name,
      assignedCount: ngo.assignedReports?.length || 0
    }));

    return res.status(200).json({
      success: true,
      data: workload
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching NGO workload",
      error: error.message
    });
  }
};





module.exports = {
  getAllReports,
  getAllNgos,
  manualAssignReport,
  autoAllocateReports,
  getOverviewAnalytics,
  getStatusAnalytics,
  getSeverityAnalytics,
  getNgoWorkloadAnalytics,
};