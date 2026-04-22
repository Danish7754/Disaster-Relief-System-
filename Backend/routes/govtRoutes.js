// backend/routes/govtRoutes.js
const express = require("express");
const router = express.Router();
const { getAllReports, simpleAllocatePendingReports, getAllNgos, manualAssignReport, getNgoWorkloadAnalytics, getOverviewAnalytics,getSeverityAnalytics,getStatusAnalytics} = require("../controllers/govtController");

// Route to get all reports with optional filters and pagination
router.get("/reports", getAllReports);

router.get("/ngos", getAllNgos);

router.post("/reports/simple-allocate", simpleAllocatePendingReports);

router.post("/manual-assign", manualAssignReport);

router.get("/analytics/overview", getOverviewAnalytics);

router.get("/analytics/by-status", getStatusAnalytics);

router.get("/analytics/by-severity", getSeverityAnalytics);

router.get("/analytics/ngo-workload", getNgoWorkloadAnalytics);



module.exports = router;
