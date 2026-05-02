// yeh mongoose library ko import kar raha hai
const mongoose = require("mongoose");
// user schema define kar raha hai jisme name, email, password aur role fields hain
const userSchema = new mongoose.Schema({  //Ye ek blueprint banata hai ki user document database mein kaisa dikhna chahiye.
    name: {
        type: String,
        required: [true, "please enter your name"], // means name dena compulsory hai. Agar user name nahi deta, toh error aayega "Please enter your name"
        trim: true, // extra spaces ko hata dega name ke aage ya peeche
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        unique: true, // har user ka email alag hona chahiye
        lowercase: true, // email ko lowercase mein convert kar dega
    },
    password: {
        type: String,
        required: [true, "please enter your password"],
        minlength: [6, "password must be at least 6 characters"], // password kam se kam 6 characters ka hona chahiye
    },
    role: {
        type: String,
        enum: ["citizen", "ngo", "government", "admin"], // role sirf in teeno values mein se ek ho sakta hai agrar koi aur value di gayi toh mogodb reject kar dega
        //enum ka matlab hai ki role sirf in teeno values mein se ek ho sakta hai agrar koi aur value di gayi toh mogodb reject kar dega
        default: "citizen",  // agar user role nahi deta toh default role "citizen" set kar dega
    },
    phone: {
        type: String,
        default: ""
    },

    city: {
        type: String,
        default: ""
    }
},
    { timestamps: true } // yeh automatically createdAt aur updatedAt fields add kar dega har user document mein
);

module.exports = mongoose.model("UserData", userSchema);
// exporting user model