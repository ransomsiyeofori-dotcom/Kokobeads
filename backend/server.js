const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const orderRoutes = require("./routes/orderRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const productRoutes = require("./routes/productRoutes");

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;


/* =========================================
   MIDDLEWARE
========================================= */

app.use(
    cors({
        origin: true,
        credentials: true
    })
);

app.use(
    express.json()
);

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(cookieParser());


/* =========================================
   AUTH ROUTES
========================================= */

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/orders",
    orderRoutes
);

app.use(
    "/api/uploads",
    uploadRoutes
);

app.use(
    "/api/products",
    productRoutes
);




/* =========================================
   HEALTH CHECK
========================================= */

app.get(
    "/api/health",
    function (req, res) {

        res.json({
            success: true,
            message: "Kokobeeds API is running"
        });

    }
);


/* =========================================
   404 HANDLER
========================================= */

app.use(
    function (req, res) {

        res.status(404).json({
            success: false,
            message: "Route not found."
        });

    }
);


/* =========================================
   ERROR HANDLER
========================================= */

app.use(
    function (err, req, res, next) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Internal server error."
        });

    }
);


/* =========================================
   DATABASE
========================================= */

connectDB();


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    function () {

        console.log(
            `Kokobeeds API running on port ${PORT}`
        );

    }
);
