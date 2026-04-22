const express = require('express');
const router = express.Router();
const {
	createReport,
	getMyReports,
	getReportById,
	updateReport,
	deleteReport,
	getAllReportsAuthorities,
	getNgoAssignedReports,
	acceptNgoAssignedReport,
	completeNgoAssignedReport,
} = require('../controllers/reportController');
const authenticate = require('../middleware/authMiddleware');

// Apply authentication middleware to all routes in this router
router.use(authenticate);   
// Report routes
router.post('/', createReport);
// static route for authorities to get all reports
router.get('/all', getAllReportsAuthorities);

// NGO specific workflow routes
router.get('/ngo/assigned', getNgoAssignedReports);
router.patch('/ngo/:id/accept', acceptNgoAssignedReport);
router.patch('/ngo/:id/complete', completeNgoAssignedReport);

router.get('/my-reports', getMyReports);
router.get('/:id', getReportById);
router.put('/:id', updateReport);
router.delete('/:id', deleteReport);



module.exports = router;
