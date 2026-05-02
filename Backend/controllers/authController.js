const user = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body; // request body se name, email, password aur role le raha hai

        // check if user already exists
        const existingUser = await user.findOne({ email }); // database mein check kar raha hai ki email pehle se exist karta hai ya nahi
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" }); // agar user exist karta hai toh 400 status code ke saath error message bhej raha hai
        }
        // hash the password
        const hashedPassword = await bcrypt.hash(password, 10); // password ko hash kar raha hai taaki secure rahe database mein

        // create a new user
        const newUser = new user({
            name,
            email,
            password: hashedPassword,// hashed password store kar raha hai
            role,
        });
        await newUser.save(); // naya user database mein save kar raha hai
        res.status(201).json({ message: "User registered successfully" }); // success message bhej raha hai
    }
    catch (error) {
        // console.error(error);
        res.status(500).json({ message: " Sorry Server error" }); // agar koi error aata hai toh 500 status code ke saath server error message bhej raha hai
    }
};

//---------------------------------------------------------------------------------------------------------------

const login = async (req, res) => {
    try {
        const { email, password } = req.body; // request body se email aur password le raha hai

        // check if user exists
        const existingUser = await user.findOne({ email }); // database mein check kar raha hai ki email pehle se exist karta hai ya nahi
        if (!existingUser) {
            return res.status(400).json({
                field: "email",
                message: "Invalid Email"
            }); // agar user exist nahi karta toh 400 status code ke saath error message bhej raha hai
        }
        // compare passwords
        const isPasswordValid = await bcrypt.compare(password, existingUser.password); // provided password ko database mein stored hashed password se compare kar raha hai
        if (!isPasswordValid) {
            return res.status(400).json({
                field: "password",
                message: "Invalid Password"
            }); // agar password match nahi karta toh 400 status code ke saath error message bhej raha hai
        }
        // generate JWT token
        const token = jwt.sign(
            { userId: existingUser._id, role: existingUser.role  }, // payload mein userId aur role daal raha hai
            process.env.JWT_SECRET, // secret key environment variable se le raha hai
            { expiresIn: "7d" } // token 7 din ke liye valid rahega
        );
        res.json({
            message: "Login successful",
            token,
            user: {
                id: existingUser._id,
                name: existingUser.name,
                role: existingUser.role,
                email: existingUser.email,
                phone: existingUser.phone,
                city: existingUser.city
            } // success message, token aur user details bhej raha hai
        }); // success message, token aur user details bhej raha hai
    }
    catch (error) {
        res.status(500).json({ message: " Sorry Server error" }); // agar koi error aata hai toh 500 status code ke saath server error message bhej raha hai
    }
};

module.exports = { register, login }; // register aur login functions ko export kar raha hai taaki routes mein use kar sake
