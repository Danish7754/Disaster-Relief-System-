const express = require('express');
const router = express.Router();
const {createNgo, getAllNgos ,getNgoById ,updateNgo ,deleteNgo} = require('../controllers/ngoController');
const protect = require('../middleware/authMiddleware');

//router
router.post('/',protect,createNgo); // Create a new NGO (protected route)
router.get('/all',getAllNgos); // Get all NGOs 
router.get('/:id',getNgoById); // Get NGO by ID 
router.patch('/:id',protect,updateNgo); // Update NGO by ID (protected route)
router.delete('/:id',protect,deleteNgo); // Delete NGO by ID (protected route)

module.exports = router;
