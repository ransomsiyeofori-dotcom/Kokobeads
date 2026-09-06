const mongoose = require("mongoose");


const productSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },


        description: {
            type: String,
            required: true,
            trim: true
        },


        price: {
            type: Number,
            required: true,
            min: 0
        },


        originalPrice: {
            type: Number,
            min: 0,
            default: null
        },


        images: {
            type: [
                {
                    url: {
                        type: String,
                        required: true
                    },
                    publicId: {
                        type: String,
                        required: false
                    }
                }
            ],
            default: []
        },


        category: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },


        stock: {
            type: Number,
            required: true,
            min: 0,
            default: 0
        },


        rating: {
            type: Number,
            min: 0,
            max: 5,
            default: 0
        },


        reviewCount: {
            type: Number,
            min: 0,
            default: 0
        },


        badge: {
            type: String,
            trim: true,
            default: null
        },


        isFeatured: {
            type: Boolean,
            default: false
        },


        isActive: {
            type: Boolean,
            default: true
        }

    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Product",
        productSchema
    );