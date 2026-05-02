const express = require('express');
const router = express.Router();
const {
    createGovtUser,
    getAllGovernmentUsers,
    getAllCitizenUsers,
    getAllReports,
    getAllNgos,
} = require('../controllers/adminController');
const protect = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/authMiddleware');

router.use(protect, isAdmin);

router.post('/create-govt', createGovtUser);
router.get('/government-users', getAllGovernmentUsers);
router.get('/citizens', getAllCitizenUsers);
router.get('/reports', getAllReports);
router.get('/ngos', getAllNgos);

module.exports = router;