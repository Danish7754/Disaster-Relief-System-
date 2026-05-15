const mongoose = require("mongoose");
// report schema define kar raha hai jisme title, description, location, status aur createdBy fields hain
const reportSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Please enter report title"], // title dena compulsory hai
            trim: true, // extra spaces ko hata dega title ke aage ya peeche
        },
        description: {
            type: String,
            required: [true, "Please enter report description"], // description dena compulsory hai
            trim: true,
        },
        location: {
            city: {
                type: String,
                trim: true,
                required: [true, "Please enter city"], // city dena compulsory hai
            },
        },
        state: {
            type: String,
            trim: true,
            required: [true, "Please enter state"],
        },
        status: {
            type: String,
            enum: ["pending", "in-progress", "resolved" , "waiting"], // status sirf in teeno values mein se ek ho sakta hai
            default: "pending", // agar user status nahi deta toh default status "pending" set kar dega
        },
        category: {
            type: String, 
            required: [false, "Please enter report category"], // category dena optional hai
            trim: true,
        },
        priority: {
            type: String,
            enum: ["low", "medium", "high", "Critical"], // priority sirf in teeno values mein se ek ho sakta hai
            default: "medium", // agar user priority nahi deta toh default priority "medium" set kar dega   
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserData", // yeh reference hai User model ka jisse pata chalega ki yeh report kis user ne banayi hai 
            required: true, // createdBy dena compulsory hai
        },
        assignedNgo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "NGO", // yeh reference hai NGO model ka jisse pata chalega ki yeh report kis NGO ko assign hui hai
        },
        ngoAssignmentState: {
            type: String,
            enum: ["unassigned", "waiting", "accepted"],
            default: "unassigned"
        },
        rejectionHistory: [{
            rejectedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "NGO"
            },
            rejectedAt: {
                type: Date,
                default: Date.now
            }
        }],
    },
    { timestamps: true } // yeh automatically createdAt aur updatedAt fields add kar dega har report document mein
);
reportSchema.pre("save", function(next) {
    if (this.location?.city && typeof this.location.city === "string") {
        this.location.city = this.location.city.trim();
    }
    if (this.state && typeof this.state === "string") {
        this.state = this.state.trim();
  }
  next();
});

module.exports = mongoose.model("Report", reportSchema);