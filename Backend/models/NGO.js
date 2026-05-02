const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
    name : {
        type: String,
        required: [true, "Please enter NGO name"], // NGO name dena compulsory hai
    },
    location: {
        type: [String + ", "], // NGO multiple cities mein operate kar sakta hai and cities ko comma se separate karke dena hoga
        required: [true, "Please enter regions served by the NGO"], // region dena compulsory hai
    },
    contactInfo: {
        email: String,
        phone: String,
        website: String,
      address: String,
    },
    state: {
      type: String,
      default: ""
    },
    category: {
        type: String,
        required: [true, "Please enter NGO category"], // category dena compulsory hai ex private government-aided etc
        trim: true,
    },
    performanceMetrics: {
    totalReportsHandled: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }, // percentage of resolved cases
    avgResponseTime: { type: Number, default: 0 }, // in hours
    },
    specializations: {
        type: [String], // example ["Health", "Education", "Environment"]
        required: [true, "Please enter NGO specializations"], // specializations dena compulsory hai    
    },
      capacity: {
    volunteers: { type: Number, default: 0 },
    vehicles: { type: Number, default: 0 },
    supplies: { type: Number, default: 0 },
  },
    assignedReports: [ // yeh array of report IDs hoga jo NGO handle kar raha hai
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report", // yeh reference hai Report model ka jisse pata chalega ki yeh NGO kis report ko handle kar raha hai
    },
  ],
    joinedAt: {
        type: Date,
        default: Date.now, // yeh automatically current date set kar dega jab NGO document create hoga
    },
    rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 2.5, // government or citizen feedback
  },
    activeStatus: {
    type: Boolean,
    default: true,
  },
    createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "UserData", // yeh reference hai User model ka jisse pata chalega ki yeh NGO kis user ne banaya hai
  },
},
{ timestamps: true } // yeh automatically createdAt aur updatedAt fields add kar dega har NGO document mein
);


module.exports = mongoose.model('NGO', ngoSchema);
