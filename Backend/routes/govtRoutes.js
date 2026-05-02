// backend/routes/govtRoutes.js
const express = require("express");
const router = express.Router();
const { getAllReports, getAllNgos, manualAssignReport, getNgoWorkloadAnalytics, getOverviewAnalytics, getSeverityAnalytics, getStatusAnalytics, autoAllocateReports } = require("../controllers/govtController");

// Route to get all reports with optional filters and pagination
router.get("/reports", getAllReports);

router.get("/ngos", getAllNgos);

// Flexible auto-allocation: bulk allocate all pending reports OR allocate single report (if reportId provided)
router.post("/reports/auto-allocate", autoAllocateReports);

router.post("/manual-assign", manualAssignReport);

router.get("/analytics/overview", getOverviewAnalytics);

router.get("/analytics/by-status", getStatusAnalytics);

router.get("/analytics/by-severity", getSeverityAnalytics);

router.get("/analytics/ngo-workload", getNgoWorkloadAnalytics);



module.exports = router;
