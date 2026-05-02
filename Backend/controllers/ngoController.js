const Ngo=require('../models/NGO'); // Import the Ngo model
const Report = require('../models/Report');
const User = require('../models/User');
const mongoose = require('mongoose');

const formatMongooseError = (error) => {
    if (error?.name === 'ValidationError') {
        const firstKey = Object.keys(error.errors || {})[0];
        const message = firstKey ? error.errors[firstKey].message : 'Validation failed';
        return { status: 400, message };
    }

    if (error?.code === 11000) {
        return { status: 400, message: 'Duplicate value found for unique field' };
    }

    return { status: 500, message: 'Server error' };
};

const resolveNgoForUser = async (userId) => {
    let ngo = await Ngo.findOne({ createdBy: userId });
    if (ngo) return ngo;

    const user = await User.findById(userId).lean();
    if (!user || !user.email) return null;

    // Backward compatibility: older NGO records may not have createdBy linked.
    ngo = await Ngo.findOne({ "contactInfo.email": user.email });
    if (!ngo) return null;

    ngo.createdBy = userId;
    await ngo.save();
    return ngo;
};

// Create a new NGO
const createNgo=async(req,res)=>{
    try{
    const existingNgo = await Ngo.findOne({ createdBy: req.user.id });
    if (existingNgo) {
        return res.status(400).json({
            message: "NGO profile already exists for this account",
            ngo: existingNgo,
        });
    }

    const ngodata=req.body; // Get NGO data from request body
    ngodata.createdBy=req.user.id; // Set the creator's ID from authenticated user
    const newNgo=await Ngo.create(ngodata); // Create a new NGO document
    res.status(201).json({
        message:'NGO created successfully',
        ngo:newNgo
    }); // Send the created NGO as response   
    } catch(error){
        const parsed = formatMongooseError(error);
        res.status(parsed.status).json({
            message: parsed.message,
            error:error.message
        });
    }
}
//-----------------------------------------------------------------------------------------------------------------

// get all NGOs
const getAllNgos=async(req,res)=>{
    try{
        const ngos=await Ngo.find(); // Fetch all NGOs from the database
        res.status(200).json({
            message:'NGOs fetched successfully',
            ngos:ngos
        }); // Send the list of NGOs as response
    } catch(error){
        res.status(500).json({
            message:"Server error",
            error:error.message
        });
    }
}
//-----------------------------------------------------------------------------------------------------------------

// get NGO by ID

const getNgoById=async(req,res)=>{
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid NGO id' });
        }

        const ngo= await Ngo.findById(req.params.id); // Fetch NGO by ID from request parameters
        if(!ngo){
            return res.status(404).json({
                message:'NGO not found'
            }); // If NGO not found, send 404 response
        } 
        res.status(200).json({
            message:'NGO fetched successfully',
            ngo:ngo
        }); // Send the fetched NGO as response
    } catch(error){
        res.status(500).json({
            message:"Server error",
            error:error.message
        });
    }
}

//-----------------------------------------------------------------------------------------------------------------

// update NGO by ID only by the creator
const updateNgo= async(req,res)=>{
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid NGO id' });
        }

        const updatedNgo= await Ngo.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true,runValidators:true}); // Update NGO by ID with new data from request body
        if(!updatedNgo){
            return res.status(404).json({ message:'NGO not found' }); // If NGO not found, send 404 response
        }
        res.status(200).json({
            message:'NGO updated successfully',
            ngo:updatedNgo
        }); // Send the updated NGO as response
    } catch(error){
        const parsed = formatMongooseError(error);
        res.status(parsed.status).json({
            message: parsed.message,
            error:error.message
        });
    }
}

//-----------------------------------------------------------------------------------------------------------------

// delete NGO by ID only by the creator

const deleteNgo = async(req,res)=>{
    try{
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid NGO id' });
        }

        const deletengo = await Ngo.findByIdAndDelete(req.params.id); // Delete NGO by ID from request parameters
        if(!deletengo){
            return res.status(404).json({ message : "NGO not found"}); // If NGO not found, send 404 response
        }
        res.status(200).json({ message : "NGO deleted successfully"}); // Send success response
    } catch(error){
        res.status(500).json({
            message:"Server error",
            error:error.message
        });
    }
}

//-----------------------------------------------------------------------------------------------------------------

// logged-in NGO owner ka apna profile fetch karne ke liye
const getMyNgoProfile = async (req, res) => {
    try {
        const resolvedNgo = await resolveNgoForUser(req.user.id);

        if (!resolvedNgo) {
            return res.status(404).json({ message: 'NGO profile not found' });
        }

        const ngo = await Ngo.findById(resolvedNgo._id)
            .populate('createdBy', 'name email role')
            .populate('assignedReports');


        return res.status(200).json({
            message: 'NGO profile fetched successfully',
            ngo,
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};

// logged-in NGO owner apna NGO profile update kar sake
const updateMyNgoProfile = async (req, res) => {
    try {
        const ngo = await resolveNgoForUser(req.user.id);
        if (!ngo) {
            return res.status(404).json({ message: 'NGO profile not found' });
        }

        const {
            name,
            location,
            category,
            specializations,
            contactInfo,
            capacity,
            state,
            activeStatus,
        } = req.body;

        if (name !== undefined) ngo.name = name;
        if (location !== undefined) ngo.location = Array.isArray(location) ? location : [location].filter(Boolean);
        if (category !== undefined) ngo.category = category;
        if (specializations !== undefined) {
            ngo.specializations = Array.isArray(specializations)
                ? specializations
                : String(specializations)
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean);
        }
        if (state !== undefined) ngo.state = state;
        if (contactInfo !== undefined) ngo.contactInfo = { ...ngo.contactInfo, ...contactInfo };
        if (capacity !== undefined) ngo.capacity = { ...ngo.capacity, ...capacity };
        if (activeStatus !== undefined) ngo.activeStatus = activeStatus;

        await ngo.save();

        return res.status(200).json({
            message: 'NGO profile updated successfully',
            ngo,
        });
    } catch (error) {
        const parsed = formatMongooseError(error);
        return res.status(parsed.status).json({
            message: parsed.message,
            error: error.message,
        });
    }
};

// logged-in NGO owner apna NGO profile delete kar sake
const deleteMyNgoProfile = async (req, res) => {
    try {
        const ngo = await resolveNgoForUser(req.user.id);
        if (!ngo) {
            return res.status(404).json({ message: 'NGO profile not found' });
        }

        await Report.updateMany(
            { assignedNgo: ngo._id, status: { $in: ['pending', 'in-progress'] } },
            {
                $set: {
                    assignedNgo: null,
                    status: 'pending',
                },
            }
        );

        await Report.updateMany(
            { assignedNgo: ngo._id, status: 'resolved' },
            {
                $set: {
                    assignedNgo: null,
                },
            }
        );

        await ngo.deleteOne();

        return res.status(200).json({
            message: 'NGO profile deleted successfully',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Server error',
            error: error.message,
        });
    }
};


module.exports={createNgo,getAllNgos,getNgoById,updateNgo,deleteNgo,getMyNgoProfile,updateMyNgoProfile,deleteMyNgoProfile}; 