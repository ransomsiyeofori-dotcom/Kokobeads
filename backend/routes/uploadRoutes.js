
const express = require("express");

const {
    generateUploadSignature,
    generateProfileUploadSignature
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


/* CUSTOMER PROFILE PHOTO SIGNATURE
   POST /api/uploads/profile-signature
*/
router.post(
    "/profile-signature",
    authenticateUser,
    generateProfileUploadSignature
);

module.exports = router;
