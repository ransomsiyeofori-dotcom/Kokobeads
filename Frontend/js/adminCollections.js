const COLLECTIONS_API_URL =
    `${window.KOKOBEADS_API_URL || "https://kokobeads-api.onrender.com/api"}/collections`;

let adminCollections = [];
let editingCollectionId = null;
let uploadedCollectionImage = null;
let collectionImageUploading = false;

document.addEventListener("DOMContentLoaded", function () {
    initializeCollectionsAdmin();
});

async function initializeCollectionsAdmin() {
    const addButton = document.getElementById("addCollectionBtn");
    const closeButton = document.getElementById("closeCollectionModal");
    const cancelButton = document.getElementById("cancelCollectionBtn");
    const form = document.getElementById("collectionForm");
    const imageInput = document.getElementById("collectionImageFile");
    const deleteButton = document.getElementById("deleteCollectionBtn");

    if (!form) return;

    if (addButton) addButton.addEventListener("click", () => openCollectionModal());
    if (closeButton) closeButton.addEventListener("click", closeCollectionModal);
    if (cancelButton) cancelButton.addEventListener("click", closeCollectionModal);
    if (imageInput) imageInput.addEventListener("change", handleCollectionImageUpload);
    if (form) form.addEventListener("submit", saveCollection);
    if (deleteButton) deleteButton.addEventListener("click", deleteCurrentCollection);

    const list = document.getElementById("adminCollectionsList");

    if (list) {
        list.addEventListener("click", async function (event) {
            const editButton =
                event.target.closest(".admin-edit-collection-button");

            const deleteCardButton =
                event.target.closest(".admin-delete-collection-button");

            if (editButton) {
                const collectionId =
                    editButton.dataset.collectionId;

                openCollectionModal(collectionId);
                return;
            }

            if (deleteCardButton) {
                const collectionId =
                    deleteCardButton.dataset.collectionId;

                await deleteCollection(collectionId);
            }
        });
    }

    await loadAdminCollections();
}

async function loadAdminCollections() {
    const list = document.getElementById("adminCollectionsList");

    if (list) {
        list.innerHTML = '<div class="admin-loading">Loading collections...</div>';
    }

    try {
        const response = await fetch(COLLECTIONS_API_URL, { credentials: "include" });
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load collections.");
        }

        adminCollections = Array.isArray(data.collections)
            ? data.collections
            : [];

        renderAdminCollections();
    } catch (error) {
        console.error("Load collections error:", error);

        if (list) {
            list.innerHTML = `
                <div class="admin-empty-state">
                    <p>Unable to load collections.</p>
                    <button type="button" class="btn btn-primary" onclick="loadAdminCollections()">
                        Try Again
                    </button>
                </div>
            `;
        }
    }
}

function renderAdminCollections() {
    const list = document.getElementById("adminCollectionsList");

    if (!list) return;

    if (!adminCollections.length) {
        list.innerHTML = `
            <div class="admin-empty-state">
                <p>No collections have been created yet.</p>
                <button type="button" class="btn btn-primary" onclick="openCollectionModal()">
                    Add Your First Collection
                </button>
            </div>
        `;
        return;
    }

    list.innerHTML = adminCollections.map(function (collection) {
        const imageUrl =
            collection.image && collection.image.url
                ? collection.image.url
                : "";

        return `
            <article class="admin-collection-card">
                <div class="admin-collection-image">
                    ${
                        imageUrl
                            ? `<img src="${escapeCollectionHtml(imageUrl)}" alt="${escapeCollectionHtml(collection.name)}">`
                            : `<div class="admin-collection-no-image">No image</div>`
                    }
                </div>

                <div class="admin-collection-content">
                    <h3>${escapeCollectionHtml(collection.name)}</h3>
                    <p class="admin-collection-slug">
                        ${escapeCollectionHtml(collection.slug)}
                    </p>

                    ${
                        collection.description
                            ? `<p>${escapeCollectionHtml(collection.description)}</p>`
                            : ""
                    }

                    <div class="admin-collection-meta">
                        <span>${collection.isActive ? "Active" : "Inactive"}</span>
                        <span>Sort: ${Number(collection.sortOrder) || 0}</span>
                    </div>

                    <div class="admin-collection-actions">
                        <button
                            type="button"
                            class="btn btn-secondary admin-edit-collection-button"
                            data-collection-id="${escapeCollectionHtml(collection._id)}"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger admin-delete-collection-button"
                            data-collection-id="${escapeCollectionHtml(collection._id)}"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function openCollectionModal(collectionId) {
    const modal = document.getElementById("collectionModal");
    const form = document.getElementById("collectionForm");
    const title = document.getElementById("collectionModalTitle");
    const deleteButton = document.getElementById("deleteCollectionBtn");
    const imagePreview = document.getElementById("collectionImagePreview");
    const previewImage = document.getElementById("collectionPreviewImg");

    if (!modal || !form) return;

    editingCollectionId = collectionId || null;
    uploadedCollectionImage = null;
    collectionImageUploading = false;

    form.reset();

    if (imagePreview) imagePreview.style.display = "none";
    if (previewImage) previewImage.removeAttribute("src");

    if (editingCollectionId) {
        const collection = adminCollections.find(
            item => item._id === editingCollectionId
        );

        if (!collection) return;

        title.textContent = "Edit Collection";

        document.getElementById("collectionName").value =
            collection.name || "";

        document.getElementById("collectionSlug").value =
            collection.slug || "";

        document.getElementById("collectionDescription").value =
            collection.description || "";

        document.getElementById("collectionSortOrder").value =
            Number(collection.sortOrder) || 0;

        document.getElementById("collectionIsActive").checked =
            collection.isActive !== false;

        if (collection.image && collection.image.url) {
            uploadedCollectionImage = {
                url: collection.image.url,
                publicId: collection.image.publicId || null
            };

            if (previewImage && imagePreview) {
                previewImage.src = collection.image.url;
                previewImage.alt = collection.name || "Collection image";
                imagePreview.style.display = "block";
            }
        }

        if (deleteButton) deleteButton.style.display = "inline-flex";
    } else {
        title.textContent = "Add Collection";

        document.getElementById("collectionIsActive").checked = true;

        if (deleteButton) deleteButton.style.display = "none";
    }

    modal.style.display = "flex";
}

function closeCollectionModal() {
    const modal = document.getElementById("collectionModal");

    if (modal) modal.style.display = "none";

    editingCollectionId = null;
    uploadedCollectionImage = null;
    collectionImageUploading = false;
}

async function handleCollectionImageUpload(event) {
    const file = event.target.files && event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
        alert("Please select an image file.");
        event.target.value = "";
        return;
    }

    collectionImageUploading = true;

    try {

        const signatureResponse = await fetch(
            `${window.KOKOBEADS_API_URL || "https://kokobeads-api.onrender.com/api"}/uploads/signature`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    type: "collections"
                })
            }
        );

        const signatureData = await signatureResponse.json();

        if (!signatureResponse.ok || !signatureData.success) {
            throw new Error(
                signatureData.message || "Unable to prepare image upload."
            );
        }

        const formData = new FormData();

        formData.append("file", file);
        formData.append("api_key", signatureData.apiKey);
        formData.append("timestamp", signatureData.timestamp);
        formData.append("signature", signatureData.signature);
        formData.append("folder", signatureData.folder);

        const cloudinaryResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const cloudinaryData = await cloudinaryResponse.json();

        if (!cloudinaryResponse.ok || !cloudinaryData.secure_url) {
            throw new Error("Image upload failed.");
        }

        uploadedCollectionImage = {
            url: cloudinaryData.secure_url,
            publicId: cloudinaryData.public_id || null
        };

        const preview = document.getElementById("collectionImagePreview");
        const previewImage = document.getElementById("collectionPreviewImg");

        if (preview && previewImage) {
            previewImage.src = uploadedCollectionImage.url;
            previewImage.alt = "Collection image preview";
            preview.style.display = "block";
        }

        alert("Collection image uploaded successfully.");
    } catch (error) {
        console.error("Collection image upload error:", error);
        alert(error.message || "Unable to upload collection image.");
        event.target.value = "";
    } finally {
        collectionImageUploading = false;
    }
}

async function saveCollection(event) {
    event.preventDefault();

    if (collectionImageUploading) {
        alert("Please wait for the image upload to finish.");
        return;
    }

    const name = document.getElementById("collectionName").value.trim();
    const slug = document.getElementById("collectionSlug").value.trim();
    const description =
        document.getElementById("collectionDescription").value.trim();

    const sortOrder =
        Number(document.getElementById("collectionSortOrder").value) || 0;

    const isActive =
        document.getElementById("collectionIsActive").checked;

    if (!name) {
        alert("Please enter a collection name.");
        return;
    }

    if (!slug) {
        alert("Please enter a collection slug.");
        return;
    }

    if (!uploadedCollectionImage || !uploadedCollectionImage.url) {
        alert("Please upload a collection image.");
        return;
    }


    const payload = {
        name,
        slug,
        description,
        image: uploadedCollectionImage,
        isActive,
        sortOrder
    };

    const url = editingCollectionId
        ? `${COLLECTIONS_API_URL}/${editingCollectionId}`
        : COLLECTIONS_API_URL;

    try {
        const response = await fetch(url, {
            method: editingCollectionId ? "PUT" : "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to save collection.");
        }

        alert(
            editingCollectionId
                ? "Collection updated successfully."
                : "Collection created successfully."
        );

        closeCollectionModal();
        await loadAdminCollections();
    } catch (error) {
        console.error("Save collection error:", error);
        alert(error.message || "Unable to save collection.");
    }
}

async function deleteCurrentCollection() {
    if (editingCollectionId) {
        await deleteCollection(editingCollectionId);
    }
}

async function deleteCollection(collectionId) {
    const collection = adminCollections.find(
        item => item._id === collectionId
    );

    if (!collection) return;

    if (!confirm(`Delete the "${collection.name}" collection?`)) {
        return;
    }


    try {
        const response = await fetch(
            `${COLLECTIONS_API_URL}/${collectionId}`,
            {
                method: "DELETE",
                credentials: "include",
                headers: {
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to delete collection.");
        }

        alert("Collection deleted successfully.");

        closeCollectionModal();
        await loadAdminCollections();
    } catch (error) {
        console.error("Delete collection error:", error);
        alert(error.message || "Unable to delete collection.");
    }
}

function escapeCollectionHtml(value) {
    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function escapeJsString(value) {
    return String(value == null ? "" : value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}

window.loadAdminCollections = loadAdminCollections;
window.openCollectionModal = openCollectionModal;
window.closeCollectionModal = closeCollectionModal;
window.deleteCollection = deleteCollection;
