const Report = require("../models/Report");
const NGO = require("../models/NGO");

const getAllReports = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query; // query parameters se filters aur pagination values le raha hai
    //pagination woh technique hai jisse hum data ko chhote-chhote parts mein divide karte hain taaki zyada data ek saath na load ho aur performance better ho
    let query = {};

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
 * POST /api/govt/reports/simple-allocate
 * - prefer NGOs in same city (report.city)
 * - fallback to least-loaded NGO overall
 * - keep status pending until NGO accepts request
 * - push report id into NGO.assignedReports
 */
const simpleAllocatePendingReports = async (req, res) => {
  try {
    // 1️⃣ Fetch all pending reports
    const pendingReports = await Report.find({ status: "pending" });

    // 2️⃣ Severity priority order
    const severityOrder = { high: 1, medium: 2, low: 3 };

    // sort reports by severity (high → low)
    pendingReports.sort((a, b) => {
      return (severityOrder[a.severity] || 4) - (severityOrder[b.severity] || 4);
    });

    // 3️⃣ Capacity rules based on severity
    const severityRequirements = {
      high: { volunteers: 10, vehicles: 1 },
      medium: { volunteers: 5, vehicles: 0 },
      low: { volunteers: 2, vehicles: 0 }
    };

    // 4️⃣ Summary object
    const summary = {
      total: pendingReports.length,
      allocated: [],
      skipped: []
    };

    // 5️⃣ Process each report
    for (const report of pendingReports) {
      // skip if already assigned (safety)
      if (report.assignedNgo) {
        summary.skipped.push({
          reportId: report._id,
          reason: "already_assigned"
        });
        continue;
      }

      const city = (report.city || "").trim();
      const requirements =
        severityRequirements[report.severity] || { volunteers: 0, vehicles: 0 };

      let assignedNGO = null;

      // 6️⃣ Try NGOs in same city with sufficient capacity
      if (city) {
        const ngosInCity = await NGO.find({
          location: { $in: [new RegExp(`^${city}$`, "i")] },
          "capacity.volunteers": { $gte: requirements.volunteers },
          "capacity.vehicles": { $gte: requirements.vehicles }
        });

        if (ngosInCity.length > 0) {
          ngosInCity.sort(
            (a, b) =>
              (a.assignedReports?.length || 0) -
              (b.assignedReports?.length || 0)
          );
          assignedNGO = ngosInCity[0];
        }
      }

      // 7️⃣ Fallback: any NGO with sufficient capacity
      if (!assignedNGO) {
        const allNgos = await NGO.find({
          "capacity.volunteers": { $gte: requirements.volunteers },
          "capacity.vehicles": { $gte: requirements.vehicles }
        });

        if (!allNgos || allNgos.length === 0) {
          summary.skipped.push({
            reportId: report._id,
            reason: "insufficient_capacity"
          });
          continue;
        }

        allNgos.sort(
          (a, b) =>
            (a.assignedReports?.length || 0) -
            (b.assignedReports?.length || 0)
        );

        assignedNGO = allNgos[0];
      }

      // 8️⃣ Assign NGO & keep request pending until NGO accepts
      report.assignedNgo = assignedNGO._id;
      report.status = "pending";
      await report.save();

      // 9️⃣ Update NGO side
      assignedNGO.assignedReports = assignedNGO.assignedReports || [];
      assignedNGO.assignedReports.push(report._id);
      await assignedNGO.save();

      // 🔟 Update summary
      summary.allocated.push({
        reportId: report._id,
        title: report.title || "",
        severity: report.severity,
        assignedNGO: {
          id: assignedNGO._id,
          name: assignedNGO.name
        }
      });
    }

    // 1️⃣1️⃣ Final response
    return res.status(200).json({
      success: true,
      message: "Automatic allocation completed successfully",
      summary
    });
  } catch (error) {
    console.error("Auto allocation error:", error);
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

    // 5️⃣ Capacity rules (same as auto logic)
    const severityRequirements = {
      high: { volunteers: 10, vehicles: 1 },
      medium: { volunteers: 5, vehicles: 0 },
      low: { volunteers: 2, vehicles: 0 }
    };

    const requirements =
      severityRequirements[report.severity] || { volunteers: 0, vehicles: 0 };

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

    // 7️⃣ Assign NGO to report and keep status pending for NGO acceptance
    report.assignedNgo = ngo._id;
    report.status = "pending";
    await report.save();

    // 8️⃣ Update NGO assigned reports
    ngo.assignedReports = ngo.assignedReports || [];
    ngo.assignedReports.push(report._id);
    await ngo.save();

    // 9️⃣ Success response
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
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching status analytics",
      error: error.message
    });
  }
};


// severity wise reports count provide karne wala controller function
const getSeverityAnalytics = async (req, res) => {
  try {
    const stats = await Report.aggregate([
      {
        $group: {
          _id: "$severity",
          count: { $sum: 1 }
        }
      }
    ]);

    return res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching severity analytics",
      error: error.message
    });
  }
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
  simpleAllocatePendingReports,
  getAllNgos,
  manualAssignReport,
  getOverviewAnalytics,
  getStatusAnalytics,
  getSeverityAnalytics,
  getNgoWorkloadAnalytics
};