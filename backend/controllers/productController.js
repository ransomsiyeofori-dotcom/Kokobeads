const Product = require("../models/Product");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
    cloud_name:
        process.env.CLOUDINARY_CLOUD_NAME,
    api_key:
        process.env.CLOUDINARY_API_KEY,
    api_secret:
        process.env.CLOUDINARY_API_SECRET
});


/* =========================================
   GET ALL PRODUCTS
========================================= */

async function getProducts(req, res) {

    try {

        const products =
            await Product.find({
                isActive: true
            })
            .sort({
                createdAt: -1
            });

        return res.status(200).json({
            success: true,
            products
        });

    } catch (error) {

        console.error(
            "Failed to get products:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Failed to retrieve products."
        });

    }

}


/* =========================================
   CREATE PRODUCT
========================================= */

async function createProduct(req, res) {

    try {

        const {
            name,
            description,
            price,
            originalPrice,
            images,
            category,
            stock,
            badge,
            isFeatured
        } = req.body;


        if (
            !name ||
            !description ||
            price === undefined ||
            !category ||
            stock === undefined
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Name, description, price, category and stock are required."
            });

        }


        const product =
            await Product.create({

                name: name.trim(),

                description:
                    description.trim(),

                price,

                originalPrice:
                    originalPrice ?? null,

                images:
                    Array.isArray(images)
                        ? images
                        : [],

                category:
                    category.trim().toLowerCase(),

                stock,

                badge:
                    badge || null,

                isFeatured:
                    Boolean(isFeatured)

            });


        return res.status(201).json({

            success: true,

            message:
                "Product created successfully.",

            product

        });


    } catch (error) {

        console.error(
            "Failed to create product:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to create product."

        });

    }

}


/* =========================================
   UPDATE PRODUCT
   PUT /api/products/:id
========================================= */

async function updateProduct(req, res) {

    try {

        const { id } = req.params;

        const {
            name,
            description,
            price,
            originalPrice,
            images,
            category,
            stock,
            badge,
            isFeatured,
            isActive
        } = req.body;


        const updateData = {};

        // Get the existing product before applying updates.
        const existingProduct =
            await Product.findById(id).lean();

        if (!existingProduct) {
            return res.status(404).json({
                success: false,
                message: "Product not found."
            });
        }


        if (name !== undefined) {

            if (!String(name).trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Product name cannot be empty."
                });

            }

            updateData.name =
                String(name).trim();

        }


        if (description !== undefined) {

            if (!String(description).trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Product description cannot be empty."
                });

            }

            updateData.description =
                String(description).trim();

        }


        if (price !== undefined) {

            const numericPrice =
                Number(price);

            if (
                !Number.isFinite(numericPrice) ||
                numericPrice < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid product price."
                });

            }

            updateData.price =
                numericPrice;

        }


        if (originalPrice !== undefined) {

            if (
                originalPrice === null ||
                originalPrice === ""
            ) {

                updateData.originalPrice = null;

            } else {

                const numericOriginalPrice =
                    Number(originalPrice);

                if (
                    !Number.isFinite(numericOriginalPrice) ||
                    numericOriginalPrice < 0
                ) {

                    return res.status(400).json({
                        success: false,
                        message: "Invalid original price."
                    });

                }

                updateData.originalPrice =
                    numericOriginalPrice;

            }

        }


        if (images !== undefined) {

            updateData.images =
                Array.isArray(images)
                    ? images
                    : [];

        }


        if (category !== undefined) {

            if (!String(category).trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Product category cannot be empty."
                });

            }

            updateData.category =
                String(category)
                    .trim()
                    .toLowerCase();

        }


        if (stock !== undefined) {

            const numericStock =
                Number(stock);

            if (
                !Number.isInteger(numericStock) ||
                numericStock < 0
            ) {

                return res.status(400).json({
                    success: false,
                    message: "Stock must be a non-negative integer."
                });

            }

            updateData.stock =
                numericStock;

        }


        if (badge !== undefined) {

            updateData.badge =
                badge
                    ? String(badge).trim()
                    : null;

        }


        if (isFeatured !== undefined) {

            updateData.isFeatured =
                Boolean(isFeatured);

        }


        if (isActive !== undefined) {

            updateData.isActive =
                Boolean(isActive);

        }


        const product =
            await Product.findByIdAndUpdate(
                id,
                {
                    $set: updateData
                },
                {
                    new: true,
                    runValidators: true
                }
            );

        // Clean up the previous Cloudinary image only after
        // the database update succeeds.
        if (images !== undefined) {

            const oldImages =
                Array.isArray(existingProduct.images)
                    ? existingProduct.images
                    : [];

            const newImages =
                Array.isArray(product.images)
                    ? product.images
                    : [];

            const oldImage =
                oldImages.length > 0
                    ? oldImages[0]
                    : null;

            const newImage =
                newImages.length > 0
                    ? newImages[0]
                    : null;

            const oldPublicId =
                oldImage &&
                typeof oldImage === "object"
                    ? oldImage.publicId
                    : null;

            const newPublicId =
                newImage &&
                typeof newImage === "object"
                    ? newImage.publicId
                    : null;

            if (
                oldPublicId &&
                oldPublicId !== newPublicId
            ) {

                try {

                    await cloudinary.uploader.destroy(
                        oldPublicId,
                        {
                            resource_type: "image"
                        }
                    );

                    console.log(
                        "Deleted old Cloudinary image:",
                        oldPublicId
                    );

                } catch (cloudinaryError) {

                    console.error(
                        "Failed to delete old Cloudinary image:",
                        cloudinaryError
                    );

                }

            }

        }


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Product updated successfully.",

            product

        });


    } catch (error) {

        console.error(
            "Failed to update product:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to update product."

        });

    }

}


/* =========================================
   DELETE PRODUCT
   DELETE /api/products/:id

   Soft delete:
   Product remains in database but becomes
   inactive and disappears from public shop.
========================================= */

async function deleteProduct(req, res) {

    try {

        const { id } = req.params;


        const product =
            await Product.findByIdAndUpdate(
                id,
                {
                    $set: {
                        isActive: false
                    }
                },
                {
                    new: true
                }
            );


        if (!product) {

            return res.status(404).json({
                success: false,
                message: "Product not found."
            });

        }


        return res.status(200).json({

            success: true,

            message:
                "Product deleted successfully."

        });


    } catch (error) {

        console.error(
            "Failed to delete product:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Failed to delete product."

        });

    }

}


module.exports = {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
