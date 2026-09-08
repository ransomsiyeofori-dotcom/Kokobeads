const API_BASE_URL =
    window.KOKOBEADS_API_URL ||
    "https://kokobeads-api.onrender.com/api";


let adminProducts = [];
let filteredAdminProducts = [];
let productImageUploading = false;
let uploadedProductImage = null;



// =========================================
// PRODUCT ACTIONS
// =========================================

function initializeProductActions() {

    const container = document.getElementById("adminProductsList");

    if (!container) return;

    container.addEventListener("click", async function(event) {

        const editButton = event.target.closest(".admin-edit-product-button");
        const deleteButton = event.target.closest(".admin-delete-product-button");

        if (editButton) {

            const productId = editButton.dataset.productId;

            const product = adminProducts.find(function(item) {
                return String(item._id) === String(productId);
            });

            if (product) {
                openEditProductModal(product);
            }

            return;
        }

        if (deleteButton) {

            const productId = deleteButton.dataset.productId;

            await deleteProduct(productId, deleteButton);

        }

    });

}


// =========================================
// DOM READY

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

document.addEventListener(
    "DOMContentLoaded",
    initializeAdmin
);



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// INITIALIZE ADMIN

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

async function initializeAdmin() {

    try {

        const user =
            await getCurrentUser();

        if (!user) {

            redirectToLogin();

            return;
        }


        // Only administrators may enter

        if (user.role !== "admin") {

            window.location.href =
                "./profile.html";

            return;
        }


        initializeAdminUI();

        await loadProducts();


        renderProducts();

    } catch (error) {

        console.error(
            "Admin initialization error:",
            error
        );

        showAdminMessage(
            "Unable to load the admin dashboard.",
            "error"
        );

    }

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// GET CURRENT USER

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

async function getCurrentUser() {

    const response =
        await fetch(
            `${API_BASE_URL}/auth/me`,
            {
                method: "GET",

                credentials: "include",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );


    if (!response.ok) {

        return null;

    }


    const data =
        await response.json();


    if (!data.success) {

        return null;

    }


    return data.user;

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// INITIALIZE UI

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function initializeAdminUI() {

    initializeProductModal();

    initializeProductForm();
    initializeProductActions();


    initializeLogout();

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// LOAD PRODUCTS

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

async function loadProducts() {

    const productsList =
        document.getElementById(
            "adminProductsList"
        );


    if (productsList) {

        productsList.innerHTML = `
            <div class="admin-loading">
                Loading products...
            </div>
        `;

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/products`,
                {
                    method: "GET",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load products."
            );

        }

        adminProducts =
            Array.isArray(data.products)
                ? data.products
                : [];


        filteredAdminProducts =
            [...adminProducts];




        renderStatistics();



        renderProducts();

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );


        if (productsList) {

            productsList.innerHTML = `
                <div class="admin-loading">
                    Unable to load products.
                </div>
            `;

        }


        showAdminMessage(
            error.message ||
            "Unable to load products.",
            "error"
        );

    }

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// STATISTICS

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function renderStatistics() {

    const total =
        adminProducts.length;


    const active =
        adminProducts.filter(
            product =>
                product.isActive !== false
        ).length;


    const featured =
        adminProducts.filter(
            product =>
                product.isFeatured === true
        ).length;


    const lowStock =
        adminProducts.filter(
            product =>
                Number(product.stock) <= 5
        ).length;


    updateText(
        "totalProducts",
        total
    );


    updateText(
        "activeProducts",
        active
    );


    updateText(
        "featuredProducts",
        featured
    );


    updateText(
        "lowStockProducts",
        lowStock
    );

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// RENDER PRODUCTS

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================


// =========================================
// PRODUCT FILTERS
// =========================================

let productFiltersInitialized = false;


function initializeProductFilters() {

    const searchInput =
        document.getElementById("adminProductSearch");

    const categoryFilter =
        document.getElementById("adminCategoryFilter");

    const stockFilter =
        document.getElementById("adminStockFilter");

    const featuredFilter =
        document.getElementById("adminFeaturedFilter");

    const clearButton =
        document.getElementById("clearProductFilters");


    if (!searchInput || !categoryFilter ||
        !stockFilter || !featuredFilter ||
        !clearButton) {
        return;
    }


    populateCategoryFilter(categoryFilter);


    if (productFiltersInitialized) {
        return;
    }


    productFiltersInitialized = true;


    searchInput.addEventListener(
        "input",
        applyProductFilters
    );


    categoryFilter.addEventListener(
        "change",
        applyProductFilters
    );


    stockFilter.addEventListener(
        "change",
        applyProductFilters
    );


    featuredFilter.addEventListener(
        "change",
        applyProductFilters
    );


    clearButton.addEventListener(
        "click",
        clearProductFilters
    );



}


function populateCategoryFilter(categoryFilter) {

    const currentCategory =
        categoryFilter.value;


    const categories =
        [...new Set(
            adminProducts
                .map(product => product.category)
                .filter(Boolean)
        )].sort();


    categoryFilter.innerHTML =
        `<option value="all">All Categories</option>`;


    categories.forEach(category => {

        const option =
            document.createElement("option");

        option.value = category;

        option.textContent =
            category.charAt(0).toUpperCase() +
            category.slice(1);

        categoryFilter.appendChild(option);

    });


    if (categories.includes(currentCategory)) {
        categoryFilter.value = currentCategory;
    }

}


function applyProductFilters() {

    const search =
        (document.getElementById("adminProductSearch")?.value || "")
        .trim()
        .toLowerCase();


    const category =
        document.getElementById("adminCategoryFilter")?.value || "all";


    const stock =
        document.getElementById("adminStockFilter")?.value || "all";


    const featured =
        document.getElementById("adminFeaturedFilter")?.value || "all";


    filteredAdminProducts =
        adminProducts.filter(product => {

        const name =
            String(product.name || "").toLowerCase();

        const productCategory =
            String(product.category || "").toLowerCase();


        if (
            search &&
            !name.includes(search) &&
            !productCategory.includes(search)
        ) {
            return false;
        }


        if (
            category !== "all" &&
            productCategory !== category.toLowerCase()
        ) {
            return false;
        }


        const stockValue =
            Number(product.stock || 0);


        if (stock === "in-stock" && stockValue <= 5) {
            return false;
        }


        if (stock === "low-stock" && (stockValue <= 0 || stockValue > 5)) {
            return false;
        }


        if (stock === "out-of-stock" && stockValue !== 0) {
            return false;
        }


        if (featured === "featured" && product.isFeatured !== true) {
            return false;
        }


        if (featured === "regular" && product.isFeatured === true) {
            return false;
        }


        return true;

    });


    renderProducts();

}


function clearProductFilters() {

    const searchInput =
        document.getElementById("adminProductSearch");

    const categoryFilter =
        document.getElementById("adminCategoryFilter");

    const stockFilter =
        document.getElementById("adminStockFilter");

    const featuredFilter =
        document.getElementById("adminFeaturedFilter");


    if (searchInput) searchInput.value = "";
    if (categoryFilter) categoryFilter.value = "all";
    if (stockFilter) stockFilter.value = "all";
    if (featuredFilter) featuredFilter.value = "all";


    filteredAdminProducts = [...adminProducts];


    renderProducts();

}

function renderProducts() {

    const container =
        document.getElementById(
            "adminProductsList"
        );

    if (!container) {
        return;
    }

    if (!filteredAdminProducts.length) {

        container.innerHTML = `
            <div class="admin-loading">
                No products match your filters.
            </div>
        `;

        return;
    }

    container.innerHTML =
        filteredAdminProducts
            .map(
                product =>
                    createProductHTML(product)
            )
            .join("");

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// PRODUCT HTML

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function createProductHTML(product) {

    const firstImage =
        Array.isArray(product.images) &&
        product.images.length
            ? product.images[0]
            : null;

    const image =
        firstImage &&
        typeof firstImage === "object"
            ? firstImage.url
            : firstImage ||
                "../assets/images/product-placeholder.jpg";


    const price =
        formatPrice(product.price);


    const stock =
        Number(product.stock);


    const stockClass =
        stock <= 5
            ? "admin-stock-low"
            : "admin-stock-badge";


    const stockText =
        stock <= 5
            ? `Low stock: ${stock}`
            : `Stock: ${stock}`;


    const badge =
        product.badge
            ? `
                <span class="admin-product-badge">
                    ${escapeHTML(product.badge)}
                </span>
              `
            : "";


    return `
        <article
            class="admin-product-card"
            data-product-id="${escapeHTML(String(product._id || ""))}"
        >

            <img
                src="${escapeHTML(image)}"
                alt="${escapeHTML(product.name || "Product")}"
                class="admin-product-image"
                loading="lazy"
                onerror="this.src='../assets/images/product-placeholder.jpg'"
            >


            <div class="admin-product-info">

                <h3>
                    ${escapeHTML(
                        product.name || "Unnamed Product"
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        product.category || "Uncategorized"
                    )}
                </p>

                <p class="admin-product-price">
                    ${price}
                </p>

                <div class="admin-product-meta">

                    ${badge}

                    <span class="${stockClass}">
                        ${stockText}
                    </span>

                </div>

                <div class="admin-product-actions">

                    <button
                        type="button"
                        class="admin-edit-product-button"
                        data-product-id="${escapeHTML(String(product._id || ""))}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="admin-delete-product-button"
                        data-product-id="${escapeHTML(String(product._id || ""))}"
                    >
                        Delete
                    </button>

                </div>

            </div>

        </article>
    `;

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// PRODUCT MODAL

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function initializeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    const openButton =
        document.getElementById(
            "addProductButton"
        );


    const closeButton =
        document.getElementById(
            "closeProductModal"
        );


    const overlay =
        document.getElementById(
            "productModalOverlay"
        );


    const cancelButton =
        document.getElementById(
            "cancelProductButton"
        );


    if (openButton) {

        openButton.addEventListener(
            "click",
            openProductModal
        );

    }


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (overlay) {

        overlay.addEventListener(
            "click",
            closeProductModal
        );

    }


    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            closeProductModal
        );

    }


    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                modal &&
                !modal.hidden
            ) {

                closeProductModal();

            }

        }
    );

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// OPEN MODAL

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function openProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) {

        return;

    }


    modal.hidden = false;

    document.body.style.overflow =
        "hidden";


    const nameInput =
        document.getElementById(
            "productName"
        );


    if (nameInput) {

        setTimeout(
            () => nameInput.focus(),
            50
        );

    }

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// CLOSE MODAL

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function closeProductModal() {

    const modal =
        document.getElementById(
            "productModal"
        );


    if (!modal) {

        return;

    }


    modal.hidden = true;

    document.body.style.overflow =
        "";


    clearProductFormMessage();

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// PRODUCT FORM

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function initializeProductForm() {

    const form =
        document.getElementById(
            "productForm"
        );

    if (!form) {
        return;
    }

    form.addEventListener(
        "submit",
        handleProductSubmit
    );

    const imageInput =
        document.getElementById(
            "productImageFile"
        );

    if (imageInput) {

        imageInput.addEventListener(
            "change",
            handleProductImageSelection
        );

    }

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// SUBMIT PRODUCT

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

async function uploadProductImage(file) {

    if (!file) {
        return null;
    }

    const maxSize = 5 * 1024 * 1024;

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.type)) {
        throw new Error(
            "Only JPG, PNG and WebP images are allowed."
        );
    }

    if (file.size > maxSize) {
        throw new Error(
            "Image must be 5MB or smaller."
        );
    }

    const signatureResponse =
        await fetch(
            `${API_BASE_URL}/uploads/signature`,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );

    const signatureData =
        await signatureResponse.json();

    if (
        !signatureResponse.ok ||
        !signatureData.success
    ) {
        throw new Error(
            signatureData.message ||
            "Unable to prepare image upload."
        );
    }

    const formData =
        new FormData();

    formData.append(
        "file",
        file
    );

    formData.append(
        "api_key",
        signatureData.apiKey
    );

    formData.append(
        "timestamp",
        signatureData.timestamp
    );

    formData.append(
        "folder",
        signatureData.folder
    );

    formData.append(
        "signature",
        signatureData.signature
    );

    const uploadResponse =
        await fetch(
            `https://api.cloudinary.com/v1_1/${signatureData.cloudName}/image/upload`,
            {
                method: "POST",
                body: formData
            }
        );

    const uploadData =
        await uploadResponse.json();

    if (!uploadResponse.ok) {
        throw new Error(
            uploadData.error?.message ||
            "Cloudinary image upload failed."
        );
    }

    if (!uploadData.secure_url) {
        throw new Error(
            "Cloudinary did not return an image URL."
        );
    }

    if (!uploadData.public_id) {
        throw new Error(
            "Cloudinary did not return an image public ID."
        );
    }

    return {
        url: uploadData.secure_url,
        publicId: uploadData.public_id
    };
}


async function handleProductImageSelection(event) {

    const file =
        event.target.files?.[0];

    const preview =
        document.getElementById(
            "productImagePreview"
        );

    const previewImg =
        document.getElementById(
            "productImagePreviewImg"
        );

    const imageInput =
        document.getElementById(
            "productImage"
        );

    if (!file) {
        return;
    }

    productImageUploading = true;

    if (preview && previewImg) {

        previewImg.src =
            URL.createObjectURL(file);

        preview.style.display =
            "block";
    }

    if (imageInput) {
        imageInput.value = "";
    }

    try {

        showProductFormMessage(
            "Uploading image...",
            "success"
        );

        uploadedProductImage =
            await uploadProductImage(file);

        if (imageInput) {
            imageInput.value =
                uploadedProductImage.url;
        }

        if (previewImg) {
            previewImg.src =
                uploadedProductImage.url;
        }

        showProductFormMessage(
            "Image uploaded successfully.",
            "success"
        );

    } catch (error) {

        console.error(
            "Product image upload error:",
            error
        );

        if (imageInput) {
            imageInput.value = "";
        }

        if (preview) {
            preview.style.display =
                "none";
        }

        if (previewImg) {
            previewImg.removeAttribute("src");
        }

        event.target.value = "";

        showProductFormMessage(
            error.message ||
            "Unable to upload image.",
            "error"
        );

    } finally {

        productImageUploading = false;

    }
}


async function handleProductSubmit(event) {

    event.preventDefault();

    if (productImageUploading) {

        showProductFormMessage(
            "Please wait for the image upload to finish.",
            "error"
        );

        return;
    }


    const form =
        event.currentTarget;


    const saveButton =
        document.getElementById(
            "saveProductButton"
        );


    const formMessage =
        document.getElementById(
            "productFormMessage"
        );


    const name =
        document.getElementById(
            "productName"
        )?.value.trim();


    const description =
        document.getElementById(
            "productDescription"
        )?.value.trim();


    const price =
        document.getElementById(
            "productPrice"
        )?.value;


    const originalPrice =
        document.getElementById(
            "productOriginalPrice"
        )?.value;


    const category =
        document.getElementById(
            "productCategory"
        )?.value.trim();


    const stock =
        document.getElementById(
            "productStock"
        )?.value;


    const badge =
        document.getElementById(
            "productBadge"
        )?.value.trim();


    const image =
        document.getElementById(
            "productImage"
        )?.value.trim();


    const isFeatured =
        document.getElementById(
            "productFeatured"
        )?.checked || false;


    if (
        !name ||
        !description ||
        price === "" ||
        !category ||
        stock === ""
    ) {

        showProductFormMessage(
            "Please complete all required fields.",
            "error"
        );

        return;

    }


    const payload = {

        name,

        description,

        price: Number(price),

        originalPrice:
            originalPrice === ""
                ? null
                : Number(originalPrice),

        images:
            uploadedProductImage
                ? [uploadedProductImage]
                : image
                    ? [{
                        url: image,
                        publicId: null
                    }]
                    : [],

        category,

        stock: Number(stock),

        badge:
            badge || null,

        isFeatured

    };


    if (saveButton) {

        saveButton.disabled = true;

        saveButton.textContent =
            "Saving...";

    }


    try {

        const modal =
            document.getElementById("productModal");

        const editingProductId =
            modal?.dataset.editingProductId || "";

        const isEditing =
            Boolean(editingProductId);

        const requestUrl =
            isEditing
                ? `${API_BASE_URL}/products/${editingProductId}`
                : `${API_BASE_URL}/products`;

        const requestMethod =
            isEditing
                ? "PUT"
                : "POST";

        const response =
            await fetch(
                requestUrl,
                {
                    method: requestMethod,

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json",

                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            payload
                        )
                }
            );


        const data =
            await response.json();


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            throw new Error(
                data.message ||
                "Administrator authentication required."
            );

        }


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to create product."
            );

        }


        showProductFormMessage(
            "Product created successfully.",
            "success"
        );


        form.reset();


        await loadProducts();


        setTimeout(
            closeProductModal,
            600
        );


        renderProducts();

    } catch (error) {

        console.error(
            "Create product error:",
            error
        );


        showProductFormMessage(
            error.message ||
            "Unable to create product.",
            "error"
        );

    } finally {

        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Product";

        }

    }

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// FORM MESSAGE

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function showProductFormMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "productFormMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        `admin-form-message ${type}`;

}


function clearProductFormMessage() {

    const element =
        document.getElementById(
            "productFormMessage"
        );


    if (!element) {

        return;

    }


    element.textContent = "";

    element.className =
        "admin-form-message";

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// LOGOUT

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function initializeLogout() {

    const button =
        document.getElementById(
            "adminLogoutButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(
        "click",
        handleAdminLogout
    );

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// HANDLE LOGOUT

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

async function handleAdminLogout() {

    const button =
        document.getElementById(
            "adminLogoutButton"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Logging out...";

    }


    try {

        await fetch(
            `${API_BASE_URL}/auth/logout`,
            {
                method: "POST",

                credentials: "include",

                headers: {
                    "Accept":
                        "application/json"
                }
            }
        );

        renderProducts();

    } catch (error) {

        console.error(
            "Admin logout error:",
            error
        );

    }


    redirectToLogin();

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// REDIRECT LOGIN

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function redirectToLogin() {

    window.location.href =
        "./login.html";

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// ADMIN MESSAGE

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function showAdminMessage(
    message,
    type = "info"
) {

    const element =
        document.getElementById(
            "adminMessage"
        );


    if (!element) {

        return;

    }


    element.textContent =
        message;


    element.className =
        `admin-message ${type}`;

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// UPDATE TEXT

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function updateText(
    id,
    value
) {

    const element =
        document.getElementById(id);


    if (element) {

        element.textContent =
            value;

    }

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// FORMAT PRICE

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function formatPrice(value) {

    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return "₦0.00";

    }


    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            minimumFractionDigits: 2
        }
    ).format(number);

}



// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================
// ESCAPE HTML

// =========================================
// PRODUCT ACTIONS
// =========================================




// =========================================

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

/* =========================================
   KOKOBEADS PRODUCT ACTIONS
========================================= */




/* =========================================
   OPEN EDIT PRODUCT MODAL
========================================= */

function openEditProductModal(product) {

    const modal =
        document.getElementById("productModal");

    if (!modal) {
        return;
    }


    document.getElementById("productName").value =
        product.name || "";

    document.getElementById("productDescription").value =
        product.description || "";

    document.getElementById("productPrice").value =
        product.price ?? "";

    document.getElementById("productOriginalPrice").value =
        product.originalPrice ?? "";

    document.getElementById("productCategory").value =
        product.category || "";

    document.getElementById("productStock").value =
        product.stock ?? "";

    document.getElementById("productBadge").value =
        product.badge || "";

    const existingImage =
        Array.isArray(product.images) &&
        product.images.length > 0
            ? product.images[0]
            : null;

    uploadedProductImage =
        existingImage &&
        typeof existingImage === "object"
            ? {
                url: existingImage.url || "",
                publicId:
                    existingImage.publicId || null
            }
            : existingImage
                ? {
                    url: existingImage,
                    publicId: null
                }
                : null;

    document.getElementById("productImage").value =
        uploadedProductImage?.url || "";

    document.getElementById("productFeatured").checked =
        Boolean(product.isFeatured);

    const preview =
        document.getElementById(
            "productImagePreview"
        );

    const previewImg =
        document.getElementById(
            "productImagePreviewImg"
        );

    if (preview && previewImg) {

        if (existingImage) {

            previewImg.src =
                existingImage;

            previewImg.alt =
                product.name || "Product image";

            preview.style.display =
                "block";

        } else {

            previewImg.src = "";

            preview.style.display =
                "none";
        }
    }


    modal.dataset.editingProductId =
        String(product._id);


    const title =
        document.getElementById(
            "productModalTitle"
        );

    if (title) {

        title.textContent =
            "Edit Product";

    }


    const saveButton =
        document.getElementById(
            "saveProductButton"
        );

    if (saveButton) {

        saveButton.textContent =
            "Save Changes";

    }


    clearProductFormMessage();


    modal.hidden = false;

    document.body.style.overflow =
        "hidden";

}


/* =========================================
   DELETE PRODUCT
========================================= */

async function deleteProduct(
    productId,
    button
) {

    const product =
        adminProducts.find(function(item) {

            return String(item._id) ===
                String(productId);

        });


    if (!product) {
        return;
    }


    const confirmed =
        window.confirm(
            'Delete "' +
            product.name +
            '"?\n\nThis action cannot be undone.'
        );


    if (!confirmed) {
        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "Deleting...";

    }


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/products/${encodeURIComponent(productId)}`,
                {
                    method: "DELETE",

                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to delete product."
            );

        }


        showAdminMessage(
            "Product deleted successfully.",
            "success"
        );


        await loadProducts();


        renderProducts();

    } catch (error) {

        console.error(
            "Delete product error:",
            error
        );


        showAdminMessage(
            error.message ||
            "Unable to delete product.",
            "error"
        );


        if (button) {

            button.disabled = false;

            button.textContent =
                "Delete";

        }

    }

}

