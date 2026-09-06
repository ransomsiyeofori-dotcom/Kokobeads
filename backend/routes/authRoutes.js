const express = require("express");

const {
    registerUser,
    loginUser,
    logoutUser
} = require("../controllers/authController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");


const router =
    express.Router();


// =========================================
// REGISTER
// POST /api/auth/register
// =========================================

router.post(
    "/register",
    registerUser
);

// =========================================
// LOGIN
// POST /api/auth/login
// =========================================

router.post(
    "/login",
    loginUser
);

router.get(
    "/test",
    function (req, res) {

        res.json({
            success: true,
            message: "Auth routes are working."
        });

    }
);

router.get(
    "/protected-test",
    authenticateUser,
    function (req, res) {

        res.json({
            success: true,
            message: "Authentication successful.",
            user: req.user
        });

    }
);

// =========================================
// PROTECTED TEST ROUTE
// GET /api/auth/protected-cookie-test
// =========================================

// =========================================
// CURRENT USER
// GET /api/auth/me
// =========================================

router.get(
    "/me",
    authenticateUser,
    async function (req, res) {

        try {

            const User =
                require("../models/User");

            const user =
                await User.findById(
                    req.user.userId
                ).select(
                    "-password"
                );

            if (!user) {

                return res.status(404).json({
                    success: false,
                    message: "User not found."
                });

            }

            return res.json({

                success: true,

                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }

            });

        } catch (error) {

            console.error(
                "Get current user error:",
                error
            );

            return res.status(500).json({
                success: false,
                message: "Unable to retrieve user."
            });

        }

    }
);

// =========================================
// LOGOUT
// POST /api/auth/logout
// =========================================

router.post(
    "/logout",
    logoutUser
);


module.exports = router;