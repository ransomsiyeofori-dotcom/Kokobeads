const express = require("express");

const {
    createOrder,
    getCustomerOrders
} = require("../controllers/orderController");

const {
    authenticateUser
} = require("../middleware/authMiddleware");


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


module.exports = router;