const cloudinary = require("cloudinary").v2;


/* =========================================
   GENERATE CLOUDINARY UPLOAD SIGNATURE
   POST /api/uploads/signature
========================================= */

async function generateUploadSignature(req, res) {

    try {

        const timestamp =
            Math.round(
                new Date().getTime() / 1000
            );


        /*
         * Products keep using:
         * kokobeads/products
         *
         * Collections can use:
         * kokobeads/collections
         */

        const type =
            req.body && req.body.type
                ? String(req.body.type).toLowerCase()
                : "products";


        const folder =
            type === "collections"
                ? "kokobeads/collections"
                : "kokobeads/products";


        const signature =
            cloudinary.utils.api_sign_request(
                {
                    timestamp,
                    folder
                },
                process.env.CLOUDINARY_API_SECRET
            );


        return res.json({

            success: true,

            timestamp,

            folder,

            signature,

            cloudName:
                process.env.CLOUDINARY_CLOUD_NAME,

            apiKey:
                process.env.CLOUDINARY_API_KEY

        });

    } catch (error) {

        console.error(
            "Cloudinary signature error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to generate upload signature."

        });

    }

}


module.exports = {
    generateUploadSignature
};
