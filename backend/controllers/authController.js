const crypto = require("crypto");
const nodemailer = require("nodemailer");
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


// =========================================
// FORGOT PASSWORD
// =========================================

async function forgotPassword(req, res) {

    try {

        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Please enter your email address."
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const user = await User.findOne({
            email: normalizedEmail
        });

        // Always return the same response for unknown emails.
        if (!user) {
            return res.status(200).json({
                success: true,
                message: "If an account exists with that email, a password reset link has been sent."
            });
        }

        // Generate a secure random token.
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store only a hash of the token in MongoDB.
        user.passwordResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Token expires after 30 minutes.
        user.passwordResetExpires =
            new Date(Date.now() + 30 * 60 * 1000);

        await user.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.CONTACT_EMAIL,
                pass: process.env.CONTACT_EMAIL_PASSWORD
            }
        });

        const resetUrl =
            `${process.env.FRONTEND_URL}/pages/reset-password.html?token=${resetToken}`;

        await transporter.sendMail({
            from: `"Kokobeads" <${process.env.CONTACT_EMAIL}>`,
            to: user.email,
            subject: "Reset your Kokobeads password",
            text: [
                `Hello ${user.name},`,
                "",
                "We received a request to reset your Kokobeads password.",
                "",
                `Reset your password using this link: ${resetUrl}`,
                "",
                "This link will expire in 30 minutes.",
                "",
                "If you did not request a password reset, you can safely ignore this email."
            ].join("\n"),
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h2>Kokobeads Password Reset</h2>
                    <p>Hello ${user.name},</p>
                    <p>We received a request to reset your Kokobeads password.</p>
                    <p>
                        <a
                            href="${resetUrl}"
                            style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px;"
                        >
                            Reset Password
                        </a>
                    </p>
                    <p>This link will expire in 30 minutes.</p>
                    <p>If you did not request a password reset, you can safely ignore this email.</p>
                </div>
            `
        });

        return res.status(200).json({
            success: true,
            message: "If an account exists with that email, a password reset link has been sent."
        });

    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to process your request right now. Please try again later."
        });

    }

}

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



// =========================================
// RESET PASSWORD
// =========================================

async function resetPassword(req, res) {

    try {

        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({
                success: false,
                message: "Reset token and new password are required."
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long."
            });
        }

        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: {
                $gt: new Date()
            }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "This password reset link is invalid or has expired."
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            12
        );

        user.password = hashedPassword;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save();

        return res.status(200).json({
            success: true,
            message: "Your password has been reset successfully."
        });

    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Unable to reset your password right now. Please try again later."
        });

    }

}

module.exports = {
    registerUser,
    loginUser,
    logoutUser
    ,forgotPassword
    ,resetPassword
};
