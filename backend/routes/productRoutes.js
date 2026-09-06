const express = require("express");

const {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
} = require("../controllers/productController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/roleMiddleware");


const router = express.Router();


/* =========================================
   PUBLIC PRODUCTS
   GET /api/products
========================================= */

router.get(
    "/",
    getProducts
);


/* =========================================
   ADMIN CREATE PRODUCT
   POST /api/products
========================================= */

router.post(
    "/",
    authenticateUser,
    requireAdmin,
    createProduct
);


/* =========================================
   ADMIN UPDATE PRODUCT
   PUT /api/products/:id
========================================= */

router.put(
    "/:id",
    authenticateUser,
    requireAdmin,
    updateProduct
);


/* =========================================
   ADMIN DELETE PRODUCT
   DELETE /api/products/:id
========================================= */

router.delete(
    "/:id",
    authenticateUser,
    requireAdmin,
    deleteProduct
);


module.exports = router;
