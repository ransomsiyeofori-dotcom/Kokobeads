
const express = require("express");

const {
    generateUploadSignature
} = require("../controllers/uploadController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* =========================================
   ADMIN CLOUDINARY SIGNATURE
   POST /api/uploads/signature
========================================= */

router.post(
    "/signature",
    authenticateUser,
    requireAdmin,
    generateUploadSignature
);


module.exports = router;
