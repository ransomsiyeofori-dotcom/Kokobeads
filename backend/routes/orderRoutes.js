const express = require("express");

const {
    createOrder,
    getCustomerOrders,
    getAllOrders,
    getOrderById,
    updateOrder
} = require("../controllers/orderController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");

const {
    requireAdmin
} = require("../middleware/roleMiddleware");


const router =
    express.Router();


/* =========================================
   CREATE ORDER
   POST /api/orders
========================================= */

router.post(
    "/",
    authenticateUser,
    createOrder
);


/* =========================================
   GET CUSTOMER ORDERS
   GET /api/orders/my-orders
========================================= */

router.get(
    "/my-orders",
    authenticateUser,
    getCustomerOrders
);


/* =========================================
   ADMIN ORDER MANAGEMENT
========================================= */


/* =========================================
   GET ALL ORDERS
   GET /api/orders/admin
========================================= */

router.get(
    "/admin",
    authenticateUser,
    requireAdmin,
    getAllOrders
);


/* =========================================
   GET SINGLE ORDER
   GET /api/orders/admin/:id
========================================= */

router.get(
    "/admin/:id",
    authenticateUser,
    requireAdmin,
    getOrderById
);


/* =========================================
   UPDATE ORDER
   PATCH /api/orders/admin/:id
========================================= */

router.patch(
    "/admin/:id",
    authenticateUser,
    requireAdmin,
    updateOrder
);


module.exports = router;
