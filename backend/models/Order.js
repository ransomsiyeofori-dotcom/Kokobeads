const mongoose = require("mongoose");


const orderItemSchema = new mongoose.Schema(
    {

        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },

        name: {
            type: String,
            required: true,
            trim: true
        },

        price: {
            type: Number,
            required: true,
            min: 0
        },

        quantity: {
            type: Number,
            required: true,
            min: 1
        },

        subtotal: {
            type: Number,
            required: true,
            min: 0
        }

    },
    {
        _id: false
    }
);


const orderSchema = new mongoose.Schema(
    {

        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },


        items: {
            type: [orderItemSchema],
            required: true,
            validate: {
                validator: function (items) {
                    return items.length > 0;
                },
                message: "An order must contain at least one item."
            }
        },


        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },


        status: {
            type: String,
            enum: [
                "pending",
                "confirmed",
                "processing",
                "shipped",
                "delivered",
                "cancelled"
            ],
            default: "pending",
            index: true
        },


        paymentStatus: {
            type: String,
            enum: [
                "pending",
                "paid",
                "failed",
                "refunded"
            ],
            default: "pending",
            index: true
        },


        shippingAddress: {
            fullName: {
                type: String,
                required: true,
                trim: true
            },

            phone: {
                type: String,
                required: true,
                trim: true
            },

            addressLine: {
                type: String,
                required: true,
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            state: {
                type: String,
                required: true,
                trim: true
            },

            country: {
                type: String,
                required: true,
                trim: true,
                default: "Nigeria"
            }
        }

    },
    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Order",
        orderSchema
    );