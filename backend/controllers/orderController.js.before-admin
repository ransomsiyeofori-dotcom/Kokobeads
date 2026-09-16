const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");


/* =========================================
   CREATE ORDER
========================================= */

async function createOrder(req, res) {

    const session =
        await mongoose.startSession();

    try {

        const {
            items,
            shippingAddress
        } = req.body;


        /* =====================================
           VALIDATE REQUEST
        ===================================== */

        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Your cart is empty."
            });

        }


        if (!shippingAddress) {

            return res.status(400).json({
                success: false,
                message: "Shipping address is required."
            });

        }


        const requiredAddressFields = [
            "fullName",
            "phone",
            "addressLine",
            "city",
            "state",
            "country"
        ];


        for (
            const field of requiredAddressFields
        ) {

            if (
                !shippingAddress[field] ||
                typeof shippingAddress[field] !== "string" ||
                !shippingAddress[field].trim()
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `${field} is required.`
                });

            }

        }


        /* =====================================
           VALIDATE CART ITEMS
        ===================================== */

        const productIds =
            items.map(
                function (item) {
                    return item.productId;
                }
            );


        if (
            productIds.some(
                function (id) {
                    return !mongoose.Types.ObjectId.isValid(id);
                }
            )
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid product ID."
            });

        }


        const uniqueProductIds =
            [...new Set(productIds.map(String))];


        if (
            uniqueProductIds.length !==
            productIds.length
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Duplicate products are not allowed."
            });

        }


        /* =====================================
           LOAD PRODUCTS
        ===================================== */

        await session.startTransaction();


        const products =
            await Product.find({
                _id: {
                    $in: uniqueProductIds
                },
                isActive: true
            }).session(session);


        if (
            products.length !==
            uniqueProductIds.length
        ) {

            await session.abortTransaction();

            return res.status(400).json({
                success: false,
                message:
                    "One or more products are unavailable."
            });

        }


        /* =====================================
           BUILD ORDER ITEMS
        ===================================== */

        const orderItems = [];

        let totalAmount = 0;


        for (
            const item of items
        ) {

            const quantity =
                Number(item.quantity);


            if (
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product quantity."
                });

            }


            const product =
                products.find(
                    function (currentProduct) {

                        return String(
                            currentProduct._id
                        ) ===
                        String(
                            item.productId
                        );

                    }
                );


            if (!product) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message:
                        "Product not found."
                });

            }


            /* =================================
               STOCK CHECK
            ================================= */

            if (
                product.stock <
                quantity
            ) {

                await session.abortTransaction();

                return res.status(400).json({
                    success: false,
                    message:
                        `${product.name} does not have enough stock.`
                });

            }


            /* =================================
               SERVER-SIDE PRICE
            ================================= */

            const subtotal =
                product.price *
                quantity;


            totalAmount +=
                subtotal;


            orderItems.push({

                product:
                    product._id,

                name:
                    product.name,

                price:
                    product.price,

                quantity,

                subtotal

            });

        }


        /* =====================================
           REDUCE STOCK
        ===================================== */

        for (
            const item of orderItems
        ) {

            const updatedProduct =
                await Product.findOneAndUpdate(

                    {
                        _id: item.product,
                        stock: {
                            $gte: item.quantity
                        }
                    },

                    {
                        $inc: {
                            stock:
                                -item.quantity
                        }
                    },

                    {
                        new: true,
                        session
                    }

                );


            if (!updatedProduct) {

                await session.abortTransaction();

                return res.status(409).json({
                    success: false,
                    message:
                        "Stock changed. Please review your cart and try again."
                });

            }

        }


        /* =====================================
           CREATE ORDER
        ===================================== */

        const createdOrders =
            await Order.create(
                [
                    {

                        customer:
                            req.user.userId,

                        items:
                            orderItems,

                        totalAmount,

                        status:
                            "pending",

                        paymentStatus:
                            "pending",

                        shippingAddress: {

                            fullName:
                                shippingAddress.fullName.trim(),

                            phone:
                                shippingAddress.phone.trim(),

                            addressLine:
                                shippingAddress.addressLine.trim(),

                            city:
                                shippingAddress.city.trim(),

                            state:
                                shippingAddress.state.trim(),

                            country:
                                shippingAddress.country.trim()

                        }

                    }
                ],
                {
                    session
                }
            );


        const order =
            createdOrders[0];


        await session.commitTransaction();


        return res.status(201).json({

            success: true,

            message:
                "Order created successfully.",

            order

        });


    } catch (error) {

        await session.abortTransaction();


        console.error(
            "Create order error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create order."

        });


    } finally {

        await session.endSession();

    }

}


/* =========================================
   GET CUSTOMER ORDERS
========================================= */

async function getCustomerOrders(
    req,
    res
) {

    try {

        const orders =
            await Order.find({
                customer:
                    req.user.userId
            })
            .populate(
                "items.product",
                "name images"
            )
            .sort({
                createdAt: -1
            });


        return res.status(200).json({

            success: true,

            orders

        });


    } catch (error) {

        console.error(
            "Get customer orders error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to retrieve orders."

        });

    }

}


module.exports = {

    createOrder,

    getCustomerOrders

};