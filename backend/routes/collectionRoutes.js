const express = require("express");

const {
    getCollections,
    createCollection,
    updateCollection,
    deleteCollection
} = require("../controllers/collectionController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* =========================================
   PUBLIC COLLECTIONS
   GET /api/collections
========================================= */

router.get(
    "/",
    getCollections
);


/* =========================================
   ADMIN COLLECTIONS
========================================= */

router.post(
    "/",
    authenticateUser,
    requireAdmin,
    createCollection
);


router.put(
    "/:id",
    authenticateUser,
    requireAdmin,
    updateCollection
);


router.delete(
    "/:id",
    authenticateUser,
    requireAdmin,
    deleteCollection
);


module.exports = router;
