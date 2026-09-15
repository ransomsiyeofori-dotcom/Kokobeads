const mongoose = require("mongoose");


const collectionSchema = new mongoose.Schema(
    {

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },


        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            unique: true
        },


        description: {
            type: String,
            trim: true,
            default: ""
        },


        image: {
            url: {
                type: String,
                required: true
            },
            publicId: {
                type: String,
                required: false,
                default: null
            }
        },


        isActive: {
            type: Boolean,
            default: true
        },


        sortOrder: {
            type: Number,
            default: 0
        }

    },

    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Collection",
        collectionSchema
    );
