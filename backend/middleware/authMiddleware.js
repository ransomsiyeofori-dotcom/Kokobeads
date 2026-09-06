const jwt = require("jsonwebtoken");


// =========================================
// AUTHENTICATION MIDDLEWARE
// =========================================

function authenticateUser(req, res, next) {

    try {

        const token =
            req.cookies.kokobeeds_access_token;


        // No cookie

        if (!token) {

            return res.status(401).json({
                success: false,
                message: "Authentication required."
            });

        }


        // Verify JWT

        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        // Attach authenticated user

        req.user = decoded;


        next();


    } catch (error) {

        console.error(
            "Authentication error:",
            error.message
        );


        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication."
        });

    }

}


module.exports = {
    authenticateUser
};