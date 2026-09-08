const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

// =========================================
// SET AUTH COOKIE
// =========================================
function setAuthCookie(res, token) {


    res.cookie(
        "kokobeads_access_token",
        token,
        {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            maxAge:
                7 * 24 * 60 * 60 * 1000,

            path: "/"
        }
    );

}


// =========================================
// REGISTER USER
// =========================================

async function registerUser(req, res) {

    try {

        const {
            name,
            email,
            password
        } = req.body;


        // Validate required fields

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required."
            });

        }


        // Check password length

        if (password.length < 8) {

            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters."
            });

        }


        // Check if user already exists

        const existingUser =
            await User.findOne({
                email: email.toLowerCase()
            });


        if (existingUser) {

            return res.status(409).json({
                success: false,
                message: "An account with this email already exists."
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(
                password,
                12
            );


        // Create user

        const user =
            await User.create({

                name: name.trim(),

                email: email.toLowerCase().trim(),

                password: hashedPassword

            });


        // Create JWT

        const token =
            jwt.sign(
                {
                    userId: user._id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );
            
      setAuthCookie(
    res,
    token
);




        // Send response

        return res.status(201).json({

            success: true,

            message: "Account created successfully.",


            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create account."

        });

    }

}

// =========================================
// LOGIN USER
// =========================================

async function loginUser(req, res) {

    try {

        const {
            email,
            password
        } = req.body;


        // Validate required fields

        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required."
            });

        }


        // Find user

        const user =
            await User.findOne({
                email: email.toLowerCase().trim()
            });


        if (!user) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        // Compare password

        const passwordIsCorrect =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordIsCorrect) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password."
            });

        }


        // Generate JWT

        const token =
            jwt.sign(
                {
                    userId: user._id,
                    role: user.role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn: "7d"
                }
            );
setAuthCookie(
    res,
    token
);

        // Return authenticated user

        return res.status(200).json({

            success: true,

            message: "Login successful.",


            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                role: user.role

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to login."

        });

    }

}

// =========================================
// LOGOUT USER
// =========================================

function logoutUser(req, res) {

    res.clearCookie(
        "kokobeads_access_token",
        {
            httpOnly: true,

            secure:
                process.env.NODE_ENV === "production",

            sameSite:
                process.env.NODE_ENV === "production"
                    ? "none"
                    : "lax",

            path: "/"
        }
    );

    return res.status(200).json({

        success: true,

        message: "Logout successful."

    });

}


module.exports = {
    registerUser,
    loginUser,
    logoutUser
};