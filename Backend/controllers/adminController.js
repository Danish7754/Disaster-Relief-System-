const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Report = require('../models/Report');
const NGO = require('../models/NGO');

const createGovtUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'name, email, and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'government',
    });

    return res.status(201).json({
      message: 'Government user created successfully',
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        phone: createdUser.phone,
        city: createdUser.city,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      },
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllGovernmentUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'government' }).select('-password').lean();

    return res.status(200).json({
      message: 'Government users fetched successfully',
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllCitizenUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'citizen' }).select('-password').lean();

    return res.status(200).json({
      message: 'Citizen users fetched successfully',
      users,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find({})
      .populate('createdBy', 'name email')
      .populate('assignedNgo', 'name email')
      .lean();

    return res.status(200).json({
      message: 'Reports fetched successfully',
      reports,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

const getAllNgos = async (req, res) => {
  try {
    const ngos = await NGO.find({}).lean();

    return res.status(200).json({
      message: 'NGOs fetched successfully',
      ngos,
    });
  } catch (error) {
    return res.status(500).json({
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = {
  createGovtUser,
  getAllGovernmentUsers,
  getAllCitizenUsers,
  getAllReports,
  getAllNgos,
};