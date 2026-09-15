const Collection = require("../models/Collection");


/* =========================================
   GET ALL COLLECTIONS
   GET /api/collections
========================================= */

async function getCollections(req, res) {

    try {

        const collections =
            await Collection
                .find()
                .sort({
                    sortOrder: 1,
                    name: 1
                });


        return res.json({

            success: true,

            collections

        });

    } catch (error) {

        console.error(
            "Get collections error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to load collections."

        });

    }

}


/* =========================================
   CREATE COLLECTION
   POST /api/collections
========================================= */

async function createCollection(req, res) {

    try {

        const {
            name,
            slug,
            description,
            image,
            isActive,
            sortOrder
        } = req.body;


        if (!name) {

            return res.status(400).json({

                success: false,

                message:
                    "Collection name is required."

            });

        }


        if (!slug) {

            return res.status(400).json({

                success: false,

                message:
                    "Collection slug is required."

            });

        }


        if (
            !image ||
            !image.url
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Collection image is required."

            });

        }


        const existingCollection =
            await Collection.findOne({
                slug: String(slug)
                    .trim()
                    .toLowerCase()
            });


        if (existingCollection) {

            return res.status(409).json({

                success: false,

                message:
                    "A collection with this slug already exists."

            });

        }


        const collection =
            await Collection.create({

                name:
                    String(name).trim(),

                slug:
                    String(slug)
                        .trim()
                        .toLowerCase(),

                description:
                    description
                        ? String(description).trim()
                        : "",

                image: {

                    url:
                        String(image.url).trim(),

                    publicId:
                        image.publicId || null

                },

                isActive:
                    typeof isActive === "boolean"
                        ? isActive
                        : true,

                sortOrder:
                    Number.isFinite(Number(sortOrder))
                        ? Number(sortOrder)
                        : 0

            });


        return res.status(201).json({

            success: true,

            collection

        });

    } catch (error) {

        console.error(
            "Create collection error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to create collection."

        });

    }

}


/* =========================================
   UPDATE COLLECTION
   PUT /api/collections/:id
========================================= */

async function updateCollection(req, res) {

    try {

        const {
            name,
            slug,
            description,
            image,
            isActive,
            sortOrder
        } = req.body;


        const collection =
            await Collection.findById(
                req.params.id
            );


        if (!collection) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection not found."

            });

        }


        if (name !== undefined) {

            collection.name =
                String(name).trim();

        }


        if (slug !== undefined) {

            const newSlug =
                String(slug)
                    .trim()
                    .toLowerCase();


            const duplicate =
                await Collection.findOne({

                    slug: newSlug,

                    _id: {
                        $ne:
                            collection._id
                    }

                });


            if (duplicate) {

                return res.status(409).json({

                    success: false,

                    message:
                        "A collection with this slug already exists."

                });

            }


            collection.slug =
                newSlug;

        }


        if (description !== undefined) {

            collection.description =
                String(description).trim();

        }


        if (
            image &&
            image.url
        ) {

            collection.image = {

                url:
                    String(image.url).trim(),

                publicId:
                    image.publicId || null

            };

        }


        if (typeof isActive === "boolean") {

            collection.isActive =
                isActive;

        }


        if (sortOrder !== undefined) {

            collection.sortOrder =
                Number.isFinite(Number(sortOrder))
                    ? Number(sortOrder)
                    : 0;

        }


        await collection.save();


        return res.json({

            success: true,

            collection

        });

    } catch (error) {

        console.error(
            "Update collection error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to update collection."

        });

    }

}


/* =========================================
   DELETE COLLECTION
   DELETE /api/collections/:id
========================================= */

async function deleteCollection(req, res) {

    try {

        const collection =
            await Collection.findById(
                req.params.id
            );


        if (!collection) {

            return res.status(404).json({

                success: false,

                message:
                    "Collection not found."

            });

        }


        await collection.deleteOne();


        return res.json({

            success: true,

            message:
                "Collection deleted successfully."

        });

    } catch (error) {

        console.error(
            "Delete collection error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "Unable to delete collection."

        });

    }

}


module.exports = {

    getCollections,

    createCollection,

    updateCollection,

    deleteCollection

};
