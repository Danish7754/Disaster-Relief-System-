const Ngo=require('../models/NGO'); // Import the Ngo model

// Create a new NGO
const createNgo=async(req,res)=>{
    try{
    const ngodata=req.body; // Get NGO data from request body
    ngodata.createdBy=req.user.id; // Set the creator's ID from authenticated user
    const newNgo=await Ngo.create(ngodata); // Create a new NGO document
    await newNgo.save(); // Save the new NGO document to the database
    res.status(201).json({
        message:'NGO created successfully',
        ngo:newNgo
    }); // Send the created NGO as response   
    } catch(error){
        res.status(500).json({
            message:"Server error",
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
        const updatedNgo= await Ngo.findByIdAndUpdate(req.params.id,{$set:req.body},{new:true,runValidators:true}); // Update NGO by ID with new data from request body
        if(!updatedNgo){
            return res.status(404).json({ message:'NGO not found' }); // If NGO not found, send 404 response
        }
        res.status(200).json({
            message:'NGO updated successfully',
            ngo:updatedNgo
        }); // Send the updated NGO as response
    } catch(error){
        res.status(500).json({
            message:"Server error",
            error:error.message
        });
    }
}

//-----------------------------------------------------------------------------------------------------------------

// delete NGO by ID only by the creator

const deleteNgo = async(req,res)=>{
    try{
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


module.exports={createNgo,getAllNgos,getNgoById,updateNgo,deleteNgo}; 