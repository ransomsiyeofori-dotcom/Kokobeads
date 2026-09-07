
console.log("Kokobeeds shop.js loaded");
/* =========================================
   KOKOBEEDS — SHOP PAGE
   Part 1: Page Initialization & Basic UI
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeShop
);


/* =========================================
   INITIALIZE SHOP
========================================= */
function initializeShop() {
  

    initializeAnnouncementBar();

    initializeMobileMenu();
    initializeSearchButton();

    initializeViewControls();

    initializeCategoryFilters();

    initializeProductSort();

    const urlSearch = new URLSearchParams(window.location.search).get("search");
    if (urlSearch) {
        shopState.searchQuery = urlSearch.trim();
    }


    initializePagination();

    initializeCurrentYear();
    
    initializeCart();
    
    initializeWishlist();

    loadProducts();

}


/* =========================================
   ANNOUNCEMENT BAR
========================================= */

function initializeAnnouncementBar() {

    const announcementBar =
        document.querySelector(".announcement-bar");

    const closeButton =
        document.querySelector(".announcement-close");


    if (!announcementBar || !closeButton) {
        return;
    }


    closeButton.addEventListener(
        "click",
        function () {

            announcementBar.classList.add(
                "hidden"
            );

        }
    );

}


/* =========================================
   MOBILE MENU
========================================= */

function initializeMobileMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const navigation =
        document.querySelector(".main-navigation");


    if (!menuButton || !navigation) {
        return;
    }


    menuButton.addEventListener(
        "click",
        function () {
          
          console.log("Menu button clicked");

            const isOpen =
                menuButton.getAttribute(
                    "aria-expanded"
                ) === "true";


            menuButton.setAttribute(
                "aria-expanded",
                String(!isOpen)
            );


            navigation.classList.toggle(
                "open"
            );
            
            console.log(
    "Navigation classes:",
    navigation.className
);


            menuButton.classList.toggle(
                "active"
            );

        }
    );

}


/* =========================================
   GRID / LIST VIEW
========================================= */

function initializeViewControls() {

    const gridButton =
        document.getElementById(
            "gridViewButton"
        );

    const listButton =
        document.getElementById(
            "listViewButton"
        );

    const productsGrid =
        document.getElementById(
            "productsGrid"
        );


    if (
        !gridButton ||
        !listButton ||
        !productsGrid
    ) {
        return;
    }


    gridButton.addEventListener(
        "click",
        function () {

            productsGrid.classList.remove(
                "list-view"
            );


            productsGrid.classList.add(
                "grid-view"
            );


            gridButton.classList.add(
                "active"
            );

            listButton.classList.remove(
                "active"
            );


            gridButton.setAttribute(
                "aria-pressed",
                "true"
            );

            listButton.setAttribute(
                "aria-pressed",
                "false"
            );

        }
    );


    listButton.addEventListener(
        "click",
        function () {

            productsGrid.classList.remove(
                "grid-view"
            );


            productsGrid.classList.add(
                "list-view"
            );


            listButton.classList.add(
                "active"
            );

            gridButton.classList.remove(
                "active"
            );


            listButton.setAttribute(
                "aria-pressed",
                "true"
            );

            gridButton.setAttribute(
                "aria-pressed",
                "false"
            );

        }
    );

}


/* =========================================
   CATEGORY FILTERS
========================================= */
function initializeCategoryFilters() {

    const categoryButtons =
        document.querySelectorAll(
            ".category-filter"
        );


    if (!categoryButtons.length) {
        return;
    }


    categoryButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    categoryButtons.forEach(
                        function (item) {

                            item.classList.remove(
                                "active"
                            );

                            item.setAttribute(
                                "aria-pressed",
                                "false"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    button.setAttribute(
                        "aria-pressed",
                        "true"
                    );


                    shopState.currentCategory =
                        button.dataset.category ||
                        "all";


                    applyShopFilters();

                }
            );

        }
    );

}


/* =========================================
   PRODUCT SORT
========================================= */
function initializeProductSort() {

    const sortSelect =
        document.getElementById(
            "sortProducts"
        );


    if (!sortSelect) {
        return;
    }


    sortSelect.addEventListener(
        "change",
        function () {

            shopState.currentSort =
                sortSelect.value;


            applyShopFilters();

        }
    );

}


/* =========================================
   WISHLIST BUTTONS
========================================= */

function initializeWishlistButtons() {

    const wishlistButtons =
        document.querySelectorAll(
            "[data-wishlist-button]"
        );


    wishlistButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    button.classList.toggle(
                        "active"
                    );


                    const icon =
                        button.querySelector(
                            "i"
                        );


                    if (!icon) {
                        return;
                    }


                    const isActive =
                        button.classList.contains(
                            "active"
                        );


                    if (isActive) {

                        icon.classList.remove(
                            "fa-regular"
                        );

                        icon.classList.add(
                            "fa-solid"
                        );

                    } else {

                        icon.classList.remove(
                            "fa-solid"
                        );

                        icon.classList.add(
                            "fa-regular"
                        );

                    }

                }
            );

        }
    );

}


/* =========================================
   CURRENT YEAR
========================================= */

function initializeCurrentYear() {

    const yearElement =
        document.getElementById(
            "currentYear"
        );


    if (!yearElement) {
        return;
    }


    yearElement.textContent =
        new Date().getFullYear();

}

/* =========================================
   SHOP PRODUCTS
   Part 2: Product Rendering
========================================= */


/* =========================================
   PRODUCT STATE
========================================= */

const shopState = {

    products: [],

    filteredProducts: [],

    currentCategory: "all",

    searchQuery: "",

    currentSort: "featured",

    currentPage: 1,

    productsPerPage: 12

};


/* =========================================
   PRODUCT ELEMENTS
========================================= */

const productsGrid =
    document.getElementById("productsGrid");

const productTemplate =
    document.getElementById(
        "productCardTemplate"
    );

const productResultCount =
    document.getElementById(
        "productResultCount"
    );


/* =========================================
   RENDER PRODUCTS
========================================= */

function renderProducts(products) {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = "";


    if (!products.length) {

        renderEmptyProductsState();

        updateProductResultCount(0);

        return;

    }


    const fragment =
        document.createDocumentFragment();


    products.forEach(
        function (product) {

            const productCard =
                createProductCard(product);


            if (productCard) {

                fragment.appendChild(
                    productCard
                );

            }

        }
    );


    productsGrid.appendChild(
        fragment
    );


    updateProductResultCount(
        products.length
    );


    initializeRenderedProductButtons();

}


/* =========================================
   CREATE PRODUCT CARD
========================================= */

function createProductCard(product) {

    if (!productTemplate) {
        return null;
    }


    const templateContent =
        productTemplate.content.cloneNode(
            true
        );


    const card =
        templateContent.querySelector(
            ".product-card"
        );


    if (!card) {
        return null;
    }


    /* ==============================
       PRODUCT IMAGE
    =============================== */

    const image =
        card.querySelector(
            "[data-product-image]"
        );


    if (image) {

        image.src =
            (typeof product.images?.[0] === "object"
            ? product.images[0]?.url
            : product.images?.[0]) ||
            product.image ||
            "";


        image.alt =
            product.name ||
            "Kokobeeds product";

    }


    /* ==============================
       PRODUCT NAME
    =============================== */

    const nameLink =
        card.querySelector(
            "[data-product-name-link]"
        );


    if (nameLink) {

        nameLink.textContent =
            product.name ||
            "Product";


        nameLink.href =
            `./product.html?id=${encodeURIComponent(
                product._id
            )}`;

    }


    /* ==============================
       PRODUCT LINK
    =============================== */

    const productLink =
        card.querySelector(
            "[data-product-link]"
        );


    if (productLink) {

        productLink.href =
            `./product.html?id=${encodeURIComponent(
                product._id
            )}`;

    }


    /* ==============================
       CATEGORY
    =============================== */

    const category =
        card.querySelector(
            "[data-product-category]"
        );


    if (category) {

        category.textContent =
            product.category ||
            "";

    }


    /* ==============================
       PRICE
    =============================== */

    const price =
        card.querySelector(
            "[data-product-price]"
        );


    if (price) {

        price.textContent =
            formatCurrency(
                product.price
            );

    }


    /* ==============================
       ORIGINAL PRICE
    =============================== */

    const originalPrice =
        card.querySelector(
            "[data-product-original-price]"
        );


    if (
        originalPrice &&
        product.originalPrice &&
        product.originalPrice >
            product.price
    ) {

        originalPrice.textContent =
            formatCurrency(
                product.originalPrice
            );

    } else if (originalPrice) {

        originalPrice.textContent =
            "";

    }


    /* ==============================
       RATING
    =============================== */

    const stars =
        card.querySelector(
            "[data-product-stars]"
        );


    const reviewCount =
        card.querySelector(
            "[data-product-review-count]"
        );


    if (stars) {

        stars.textContent =
            createStarRating(
                product.rating || 0
            );

    }


    if (reviewCount) {

        reviewCount.textContent =
            `(${product.reviewCount || 0})`;

    }


    /* ==============================
       BADGE
    =============================== */

    const badge =
        card.querySelector(
            "[data-product-badge]"
        );


    if (badge) {

        if (product.badge) {

            badge.textContent =
                product.badge;

            badge.hidden = false;

        } else {

            badge.hidden = true;

        }

    }


    /* ==============================
       PRODUCT ID
    =============================== */

    card.dataset.productId =
        product._id || "";


    return card;

}


/* =========================================
   FORMAT CURRENCY
========================================= */

function formatCurrency(amount) {

    const numericAmount =
        Number(amount);


    if (
        !Number.isFinite(
            numericAmount
        )
    ) {

        return "₦0";

    }


    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(
        numericAmount
    );

}


/* =========================================
   CREATE STAR RATING
========================================= */

function createStarRating(rating) {

    const numericRating =
        Math.max(
            0,
            Math.min(
                5,
                Number(rating) || 0
            )
        );


    const roundedRating =
        Math.round(
            numericRating
        );


    return "★".repeat(
        roundedRating
    ) +
    "☆".repeat(
        5 - roundedRating
    );

}


/* =========================================
   UPDATE PRODUCT COUNT
========================================= */

function updateProductResultCount(
    count
) {

    if (!productResultCount) {
        return;
    }


    if (count === 0) {

        productResultCount.textContent =
            "No products found";

        return;

    }


    productResultCount.textContent =
        `${count} ${
            count === 1
                ? "product"
                : "products"
        }`;

}


/* =========================================
   EMPTY PRODUCT STATE
========================================= */

function renderEmptyProductsState() {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = `

        <div class="products-empty-state">

            <div class="products-empty-state-icon">

                <i class="fa-solid fa-box-open"></i>

            </div>

            <h2>
                No products found
            </h2>

            <p>
                We couldn't find any products
                matching your selection.
                Please try another category.
            </p>

        </div>

    `;

}


/* =========================================
   RENDERED PRODUCT BUTTONS
========================================= */

function initializeRenderedProductButtons() {

    const wishlistButtons =
        document.querySelectorAll(
            "#productsGrid [data-wishlist-button]"
        );


    wishlistButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                handleWishlistClick
            );


            const card =
                button.closest(
                    ".product-card"
                );


            if (!card) {
                return;
            }


            updateWishlistButton(
                button,
                card.dataset.productId
            );

        }
    );


    const cartButtons =
        document.querySelectorAll(
            "#productsGrid [data-add-to-cart]"
        );


    cartButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                handleAddToCartClick
            );

        }
    );

}


/* =========================================
   WISHLIST CLICK
========================================= */

function handleWishlistClick(event) {

    const button =
        event.currentTarget;


    button.classList.toggle(
        "active"
    );


    const icon =
        button.querySelector("i");


    if (!icon) {
        return;
    }


    const isActive =
        button.classList.contains(
            "active"
        );


    icon.classList.toggle(
        "fa-solid",
        isActive
    );


    icon.classList.toggle(
        "fa-regular",
        !isActive
    );

}






/* =========================================
   KOKOBEEDS — SHOP PAGE
   Part 3: Filtering, Sorting & Pagination
========================================= */


/* =========================================
   APPLY SHOP FILTERS
========================================= */

function applyShopFilters() {

    let products = [
        ...shopState.products
    ];


    /* ==============================
       CATEGORY FILTER
    ============================== */

    if (
        shopState.currentCategory !== "all"
    ) {

        products =
            products.filter(
                function (product) {

                    return String(
                        product.category || ""
                    ).toLowerCase() ===
                    shopState.currentCategory
                        .toLowerCase();

                }
            );

    }
    if (shopState.searchQuery) {
        const query = shopState.searchQuery.toLowerCase();
        products = products.filter(function (product) {
            const name = String(product.name || "").toLowerCase();
            const description = String(product.description || "").toLowerCase();
            const category = String(product.category || "").toLowerCase();
            return name.includes(query) || description.includes(query) || category.includes(query);
        });
    }



    /* ==============================
       SORT PRODUCTS
    ============================== */

    products =
        sortProducts(
            products,
            shopState.currentSort
        );


    shopState.filteredProducts =
        products;


    /* ==============================
       RESET PAGE
    ============================== */

    shopState.currentPage = 1;


    renderCurrentPage();

}


/* =========================================
   SORT PRODUCTS
========================================= */

function sortProducts(
    products,
    sortType
) {

    const sortedProducts =
        [...products];


    switch (sortType) {


        case "newest":

            sortedProducts.sort(
                function (a, b) {

                    return new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    );

                }
            );

            break;


        case "price-low":

            sortedProducts.sort(
                function (a, b) {

                    return Number(
                        a.price || 0
                    ) -
                    Number(
                        b.price || 0
                    );

                }
            );

            break;


        case "price-high":

            sortedProducts.sort(
                function (a, b) {

                    return Number(
                        b.price || 0
                    ) -
                    Number(
                        a.price || 0
                    );

                }
            );

            break;


        case "rating":

            sortedProducts.sort(
                function (a, b) {

                    return Number(
                        b.rating || 0
                    ) -
                    Number(
                        a.rating || 0
                    );

                }
            );

            break;


        case "featured":

        default:

            sortedProducts.sort(
                function (a, b) {

                    return Number(
                        Boolean(b.isFeatured)
                    ) -
                    Number(
                        Boolean(a.isFeatured)
                    );

                }
            );

            break;

    }


    return sortedProducts;

}


/* =========================================
   RENDER CURRENT PAGE
========================================= */

function renderCurrentPage() {

    const products =
        shopState.filteredProducts;


    const totalProducts =
        products.length;


    const totalPages =
        Math.ceil(
            totalProducts /
            shopState.productsPerPage
        );


    /* ==============================
       HANDLE EMPTY RESULT
    ============================== */

    if (totalProducts === 0) {

        renderProducts([]);

        renderPagination(
            0
        );

        return;

    }


    /* ==============================
       KEEP PAGE VALID
    ============================== */

    if (
        shopState.currentPage >
        totalPages
    ) {

        shopState.currentPage =
            totalPages;

    }


    const startIndex =
        (
            shopState.currentPage - 1
        ) *
        shopState.productsPerPage;


    const endIndex =
        startIndex +
        shopState.productsPerPage;


    const currentProducts =
        products.slice(
            startIndex,
            endIndex
        );


    renderProducts(
        currentProducts
    );


    updatePaginationCount(
        startIndex,
        endIndex,
        totalProducts
    );


    renderPagination(
        totalPages
    );

}


/* =========================================
   UPDATE PRODUCT COUNT
========================================= */

function updatePaginationCount(
    startIndex,
    endIndex,
    totalProducts
) {

    if (!productResultCount) {
        return;
    }


    const actualEnd =
        Math.min(
            endIndex,
            totalProducts
        );


    productResultCount.textContent =
        `Showing ${
            startIndex + 1
        }–${
            actualEnd
        } of ${
            totalProducts
        } products`;

}


/* =========================================
   RENDER PAGINATION
========================================= */

function renderPagination(
    totalPages
) {

    const paginationPages =
        document.getElementById(
            "paginationPages"
        );

    const previousButton =
        document.getElementById(
            "previousPageButton"
        );

    const nextButton =
        document.getElementById(
            "nextPageButton"
        );


    if (
        !paginationPages ||
        !previousButton ||
        !nextButton
    ) {
        return;
    }


    paginationPages.innerHTML = "";


    /* ==============================
       NO PAGINATION NEEDED
    ============================== */

    if (totalPages <= 1) {

        previousButton.disabled =
            true;

        nextButton.disabled =
            true;

        return;

    }


    /* ==============================
       PREVIOUS
    ============================== */

    previousButton.disabled =
        shopState.currentPage === 1;


    /* ==============================
       PAGE NUMBERS
    ============================== */

    const pageNumbers =
        createPageNumbers(
            totalPages,
            shopState.currentPage
        );


    pageNumbers.forEach(
        function (page) {

            if (page === "...") {

                const ellipsis =
                    document.createElement(
                        "span"
                    );

                ellipsis.className =
                    "pagination-ellipsis";

                ellipsis.textContent =
                    "…";

                paginationPages.appendChild(
                    ellipsis
                );

                return;

            }


            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "pagination-page";


            button.textContent =
                page;


            button.setAttribute(
                "aria-label",
                `Go to page ${page}`
            );


            if (
                page ===
                shopState.currentPage
            ) {

                button.classList.add(
                    "active"
                );

            }


            button.addEventListener(
                "click",
                function () {

                    goToPage(
                        page
                    );

                }
            );


            paginationPages.appendChild(
                button
            );

        }
    );


    /* ==============================
       NEXT
    ============================== */

    nextButton.disabled =
        shopState.currentPage ===
        totalPages;

}


/* =========================================
   CREATE PAGE NUMBERS
========================================= */

function createPageNumbers(
    totalPages,
    currentPage
) {

    if (totalPages <= 7) {

        return Array.from(
            {
                length: totalPages
            },
            function (_, index) {

                return index + 1;

            }
        );

    }


    const pages = [];


    pages.push(1);


    if (currentPage > 4) {

        pages.push("...");

    }


    const start =
        Math.max(
            2,
            currentPage - 1
        );


    const end =
        Math.min(
            totalPages - 1,
            currentPage + 1
        );


    for (
        let page = start;
        page <= end;
        page++
    ) {

        pages.push(page);

    }


    if (
        currentPage <
        totalPages - 3
    ) {

        pages.push("...");

    }


    pages.push(
        totalPages
    );


    return pages;

}


/* =========================================
   GO TO PAGE
========================================= */

function goToPage(
    page
) {

    const totalPages =
        Math.ceil(
            shopState.filteredProducts.length /
            shopState.productsPerPage
        );


    if (
        page < 1 ||
        page > totalPages
    ) {
        return;
    }


    shopState.currentPage =
        page;


    renderCurrentPage();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   PREVIOUS PAGE
========================================= */

function goToPreviousPage() {

    if (
        shopState.currentPage <= 1
    ) {
        return;
    }


    shopState.currentPage--;


    renderCurrentPage();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   NEXT PAGE
========================================= */

function goToNextPage() {

    const totalPages =
        Math.ceil(
            shopState.filteredProducts.length /
            shopState.productsPerPage
        );


    if (
        shopState.currentPage >=
        totalPages
    ) {
        return;
    }


    shopState.currentPage++;


    renderCurrentPage();


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================================
   PAGINATION BUTTON EVENTS
========================================= */

function initializePagination() {

    const previousButton =
        document.getElementById(
            "previousPageButton"
        );

    const nextButton =
        document.getElementById(
            "nextPageButton"
        );


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            goToPreviousPage
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            goToNextPage
        );

    }

}

/* =========================================
   KOKOBEEDS — SHOP PAGE
   Part 4: API & Product Loading
========================================= */

/* =========================================
   KOKOBEEDS — SHOP PAGE
   Part 7A: Production-Safe API Configuration
========================================= */


/* =========================================
   API CONFIGURATION
========================================= */

const API_BASE_URL =
    window.KOKOBEEDS_API_URL ||
    "https://kokobeads-api.onrender.com/api";


const API_REQUEST_TIMEOUT =
    10000;


const API_MAX_RETRIES =
    2;
    
    /* =========================================
   CENTRAL API REQUEST HANDLER
========================================= */

async function apiRequest(
    endpoint,
    options = {},
    config = {}
) {

    const timeout =
        config.timeout ??
        API_REQUEST_TIMEOUT;


    const retries =
        config.retries ??
        API_MAX_RETRIES;


    const url =
        `${API_BASE_URL}${endpoint}`;


    let lastError;


    for (
        let attempt = 0;
        attempt <= retries;
        attempt++
    ) {

        const controller =
            new AbortController();


        const timeoutId =
            window.setTimeout(
                function () {

                    controller.abort();

                },
                timeout
            );


        try {

            const response =
                await fetch(
                    url,
                    {

                        ...options,

                        headers: {

                            "Accept":
                                "application/json",

                            ...(options.body
                                ? {
                                    "Content-Type":
                                        "application/json"
                                }
                                : {}),

                            ...(options.headers || {})

                        },

                        signal:
                            controller.signal

                    }
                );


            window.clearTimeout(
                timeoutId
            );


            let data = null;


            const contentType =
                response.headers.get(
                    "content-type"
                );


            if (
                contentType &&
                contentType.includes(
                    "application/json"
                )
            ) {

                data =
                    await response.json();

            } else {

                data =
                    await response.text();

            }


            /* ==============================
               HTTP ERROR
            =============================== */

            if (!response.ok) {

                const error =
                    new Error(
                        data?.message ||
                        `Request failed with status ${response.status}`
                    );


                error.status =
                    response.status;


                error.data =
                    data;


                /*
                 * Client errors should not
                 * be retried automatically.
                 */
                if (
                    response.status >= 400 &&
                    response.status < 500
                ) {

                    throw error;

                }


                /*
                 * Server errors may be retried.
                 */
                lastError =
                    error;


                if (
                    attempt < retries
                ) {

                    await wait(
                        getRetryDelay(
                            attempt
                        )
                    );


                    continue;

                }


                throw error;

            }


            /* ==============================
               SUCCESS
            =============================== */

            return {

                success:
                    true,

                status:
                    response.status,

                data:
                    data

            };


        } catch (error) {

            window.clearTimeout(
                timeoutId
            );


            /* ==============================
               REQUEST TIMEOUT
            =============================== */

            if (
                error.name ===
                "AbortError"
            ) {

                const timeoutError =
                    new Error(
                        "The request timed out."
                    );


                timeoutError.code =
                    "TIMEOUT";


                lastError =
                    timeoutError;

            } else {

                lastError =
                    error;

            }


            /*
             * Don't retry normal
             * client errors.
             */
            if (
                lastError.status >= 400 &&
                lastError.status < 500
            ) {

                throw lastError;

            }


            /*
             * Retry network errors,
             * timeouts and server errors.
             */
            if (
                attempt < retries
            ) {

                await wait(
                    getRetryDelay(
                        attempt
                    )
                );


                continue;

            }

        }

    }


    throw lastError;

}

/* =========================================
   API RETRY HELPERS
========================================= */

function wait(milliseconds) {

    return new Promise(
        function (resolve) {

            window.setTimeout(
                resolve,
                milliseconds
            );

        }
    );

}


function getRetryDelay(attempt) {

    return Math.min(
        500 *
        Math.pow(
            2,
            attempt
        ),
        5000
    );

}


/* =========================================
   LOAD PRODUCTS
========================================= */
async function loadProducts() {

    showProductsLoading();


    try {

        const result =
            await apiRequest(
                "/products"
            );


        const responseData =
            result.data;


        const products =
            Array.isArray(
                responseData
            )
                ? responseData
                : responseData.products ||
                  responseData.data ||
                  [];


        shopState.products =
            products;


        applyShopFilters();


    } catch (error) {

        console.error(
            "Failed to load products:",
            error
        );


        renderProductsError();

    }

}


/* =========================================
   PRODUCT LOADING STATE
========================================= */

function showProductsLoading() {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = "";


    const fragment =
        document.createDocumentFragment();


    for (
        let i = 0;
        i < shopState.productsPerPage;
        i++
    ) {

        const loadingCard =
            document.createElement(
                "div"
            );


        loadingCard.className =
            "product-card loading";


        loadingCard.innerHTML = `

            <div class="product-image-wrapper">
            </div>

            <div class="product-content">

                <div class="product-category">
                    &nbsp;
                </div>

                <div class="product-name">
                    &nbsp;
                </div>

                <div class="product-rating">
                    &nbsp;
                </div>

                <div class="product-bottom">
                    &nbsp;
                </div>

            </div>

        `;


        fragment.appendChild(
            loadingCard
        );

    }


    productsGrid.appendChild(
        fragment
    );


    if (productResultCount) {

        productResultCount.textContent =
            "Loading products...";

    }

}


/* =========================================
   PRODUCT ERROR STATE
========================================= */

function renderProductsError() {

    if (!productsGrid) {
        return;
    }


    productsGrid.innerHTML = `

        <div class="products-empty-state">

            <div class="products-empty-state-icon">

                <i class="fa-solid fa-triangle-exclamation"></i>

            </div>

            <h2>
                Unable to load products
            </h2>

            <p>
                We couldn't load our products right now.
                Please check your connection and try again.
            </p>

            <button
                type="button"
                class="add-to-cart-button"
                id="retryProductsButton"
            >
                <i class="fa-solid fa-rotate-right"></i>
                Try Again
            </button>

        </div>

    `;


    if (productResultCount) {

        productResultCount.textContent =
            "Unable to load products";

    }


    const retryButton =
        document.getElementById(
            "retryProductsButton"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadProducts
        );

    }

}

/* =========================================
   KOKOBEEDS — SHOP PAGE
   Part 5: Cart
========================================= */


/* =========================================
   CART STORAGE KEY
========================================= */

const CART_STORAGE_KEY =
    "kokobeeds_cart";


/* =========================================
   GET CART
========================================= */

function getCart() {

    try {

        const storedCart =
            localStorage.getItem(
                CART_STORAGE_KEY
            );


        if (!storedCart) {
            return [];
        }


        const cart =
            JSON.parse(storedCart);


        return Array.isArray(cart)
            ? cart
            : [];


    } catch (error) {

        console.error(
            "Unable to read cart:",
            error
        );


        return [];

    }

}


/* =========================================
   SAVE CART
========================================= */

function saveCart(cart) {

    try {

        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify(cart)
        );


    } catch (error) {

        console.error(
            "Unable to save cart:",
            error
        );

    }

}


/* =========================================
   ADD PRODUCT TO CART
========================================= */

function addToCart(
    productId,
    quantity = 1
) {

    if (!productId) {
        return false;
    }


    const cart =
        getCart();


    const existingItem =
        cart.find(
            function (item) {

                return item.productId ===
                    productId;

            }
        );


    if (existingItem) {

        existingItem.quantity +=
            quantity;

    } else {

        cart.push({

            productId:
                productId,

            quantity:
                quantity

        });

    }


    saveCart(cart);


    updateCartCount();


    return true;

}


/* =========================================
   REMOVE PRODUCT FROM CART
========================================= */

function removeFromCart(
    productId
) {

    const cart =
        getCart();


    const updatedCart =
        cart.filter(
            function (item) {

                return item.productId !==
                    productId;

            }
        );


    saveCart(
        updatedCart
    );


    updateCartCount();

}


/* =========================================
   UPDATE CART QUANTITY
========================================= */

function updateCartQuantity(
    productId,
    quantity
) {

    const cart =
        getCart();


    const item =
        cart.find(
            function (cartItem) {

                return cartItem.productId ===
                    productId;

            }
        );


    if (!item) {
        return;
    }


    const newQuantity =
        Number(quantity);


    if (
        !Number.isInteger(
            newQuantity
        ) ||
        newQuantity <= 0
    ) {

        removeFromCart(
            productId
        );

        return;

    }


    item.quantity =
        newQuantity;


    saveCart(cart);


    updateCartCount();

}


/* =========================================
   GET TOTAL CART ITEMS
========================================= */

function getCartItemCount() {

    const cart =
        getCart();


    return cart.reduce(
        function (total, item) {

            return total +
                Number(
                    item.quantity || 0
                );

        },
        0
    );

}


/* =========================================
   UPDATE CART COUNT
========================================= */

function updateCartCount() {

    const count =
        getCartItemCount();


    const cartCounters =
        document.querySelectorAll(
            "[data-cart-count]"
        );


    cartCounters.forEach(
        function (counter) {

            counter.textContent =
                count;

            counter.hidden =
                count === 0;

        }
    );

}


/* =========================================
   ADD TO CART BUTTON
========================================= */

function handleAddToCartClick(
    event
) {

    const button =
        event.currentTarget;


    const card =
        button.closest(
            ".product-card"
        );


    if (!card) {
        return;
    }


    const productId =
        card.dataset.productId;


    if (!productId) {

        console.error(
            "Product ID is missing."
        );

        return;

    }


    const added =
        addToCart(productId, 1);


    if (!added) {
        return;
    }


    showCartFeedback(
        button
    );

}


/* =========================================
   CART FEEDBACK
========================================= */

function showCartFeedback(
    button
) {

    const originalHTML =
        button.innerHTML;


    button.disabled =
        true;


    button.innerHTML = `
        <i class="fa-solid fa-check"></i>
        Added
    `;


    window.setTimeout(
        function () {

            button.disabled =
                false;

            button.innerHTML =
                originalHTML;

        },
        1200
    );

}


/* =========================================
   INITIALIZE CART
========================================= */

function initializeCart() {

    updateCartCount();

}

/* =========================================
   KOKOBEEDS — SHOP PAGE
   Part 6: Wishlist
========================================= */


/* =========================================
   WISHLIST STORAGE KEY
========================================= */

const WISHLIST_STORAGE_KEY =
    "kokobeeds_wishlist";


/* =========================================
   GET WISHLIST
========================================= */

function getWishlist() {

    try {

        const storedWishlist =
            localStorage.getItem(
                WISHLIST_STORAGE_KEY
            );


        if (!storedWishlist) {
            return [];
        }


        const wishlist =
            JSON.parse(
                storedWishlist
            );


        return Array.isArray(wishlist)
            ? wishlist
            : [];


    } catch (error) {

        console.error(
            "Unable to read wishlist:",
            error
        );


        return [];

    }

}


/* =========================================
   SAVE WISHLIST
========================================= */

function saveWishlist(
    wishlist
) {

    try {

        localStorage.setItem(
            WISHLIST_STORAGE_KEY,
            JSON.stringify(
                wishlist
            )
        );


    } catch (error) {

        console.error(
            "Unable to save wishlist:",
            error
        );

    }

}


/* =========================================
   CHECK WISHLIST
========================================= */

function isProductInWishlist(
    productId
) {

    const wishlist =
        getWishlist();


    return wishlist.includes(
        productId
    );

}


/* =========================================
   ADD TO WISHLIST
========================================= */

function addToWishlist(
    productId
) {

    if (!productId) {
        return false;
    }


    const wishlist =
        getWishlist();


    if (
        wishlist.includes(
            productId
        )
    ) {

        return false;

    }


    wishlist.push(
        productId
    );


    saveWishlist(
        wishlist
    );


    return true;

}


/* =========================================
   REMOVE FROM WISHLIST
========================================= */

function removeFromWishlist(
    productId
) {

    const wishlist =
        getWishlist();


    const updatedWishlist =
        wishlist.filter(
            function (id) {

                return id !==
                    productId;

            }
        );


    saveWishlist(
        updatedWishlist
    );

}


/* =========================================
   TOGGLE WISHLIST
========================================= */

function toggleWishlist(
    productId
) {

    if (
        isProductInWishlist(
            productId
        )
    ) {

        removeFromWishlist(
            productId
        );

        updateWishlistBadge();

        return false;

    }


    addToWishlist(
        productId
    );

    updateWishlistBadge();

    return true;

}


/* =========================================
   UPDATE WISHLIST BUTTON
========================================= */

function updateWishlistButton(
    button,
    productId
) {

    if (
        !button ||
        !productId
    ) {
        return;
    }


    const active =
        isProductInWishlist(
            productId
        );


    button.classList.toggle(
        "active",
        active
    );


    button.setAttribute(
        "aria-pressed",
        String(active)
    );


    const icon =
        button.querySelector(
            "i"
        );


    if (!icon) {
        return;
    }


    icon.classList.toggle(
        "fa-solid",
        active
    );


    icon.classList.toggle(
        "fa-regular",
        !active
    );

}


/* =========================================
   HANDLE WISHLIST CLICK
========================================= */

function handleWishlistClick(
    event
) {

    const button =
        event.currentTarget;


    const card =
        button.closest(
            ".product-card"
        );


    if (!card) {
        return;
    }


    const productId =
        card.dataset.productId;


    if (!productId) {

        console.error(
            "Product ID is missing."
        );

        return;

    }


    const added =
        toggleWishlist(
            productId
        );


    updateWishlistButton(
        button,
        productId
    );


    if (added) {

        showWishlistFeedback(
            button,
            "Added"
        );

    } else {

        showWishlistFeedback(
            button,
            "Removed"
        );

    }

}


/* =========================================
   WISHLIST FEEDBACK
========================================= */

function showWishlistFeedback(
    button,
    message
) {

    const originalTitle =
        button.getAttribute(
            "aria-label"
        );


    button.setAttribute(
        "aria-label",
        `Wishlist ${message.toLowerCase()}`
    );


    window.setTimeout(
        function () {

            if (originalTitle) {

                button.setAttribute(
                    "aria-label",
                    originalTitle
                );

            }

        },
        1000
    );

}


/* =========================================
   INITIALIZE WISHLIST
========================================= */

function initializeWishlist() {

    const wishlistButtons =
        document.querySelectorAll(
            "[data-wishlist-button]"
        );


    wishlistButtons.forEach(
        function (button) {

            const card =
                button.closest(
                    ".product-card"
                );


            if (!card) {
                return;
            }


            const productId =
                card.dataset.productId;


            updateWishlistButton(
                button,
                productId
            );

        }
    );

}
/* =========================================
   SHOP SEARCH OVERLAY
========================================= */

function initializeSearchButton() {

    const searchButton =
        document.getElementById("searchButton");

    if (!searchButton) {
        return;
    }

    searchButton.addEventListener("click", function () {

        let overlay =
            document.getElementById("searchOverlay");

        if (!overlay) {

            overlay = document.createElement("div");
            overlay.id = "searchOverlay";
            overlay.className = "search-overlay";

            overlay.innerHTML = `
                <div class="search-overlay-backdrop" data-search-close></div>

                <div class="search-panel" role="dialog" aria-modal="true" aria-label="Search products">

                    <div class="search-panel-header">

                        <span class="search-panel-title">
                            Search Kokobeeds
                        </span>

                        <button
                            type="button"
                            class="search-close"
                            aria-label="Close search"
                            data-search-close
                        >
                            &times;
                        </button>

                    </div>

                    <form class="search-form" id="siteSearchForm">

                        <div class="search-input-wrapper">

                            <span
                                class="search-input-icon"
                                aria-hidden="true"
                            >
                                🔍
                            </span>

                            <input
                                type="search"
                                id="siteSearchInput"
                                class="search-input"
                                placeholder="Search for beads..."
                                autocomplete="off"
                            >

                        </div>

                        <button
                            type="submit"
                            class="search-submit"
                        >
                            Search
                        </button>

                    </form>

                </div>
            `;

            document.body.appendChild(overlay);

            const form =
                document.getElementById("siteSearchForm");

            const input =
                document.getElementById("siteSearchInput");

            form.addEventListener("submit", function (event) {

                event.preventDefault();

                const query =
                    input.value.trim();

                if (!query) {
                    input.focus();
                    return;
                }

                window.location.href =
                    "./shop.html?search=" +
                    encodeURIComponent(query);

            });

            overlay
                .querySelectorAll("[data-search-close]")
                .forEach(function (element) {

                    element.addEventListener(
                        "click",
                        function () {

                            overlay.classList.remove("open");

                            document.body.classList.remove(
                                "search-open"
                            );

                        }
                    );

                });

            document.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Escape") {

                        overlay.classList.remove("open");

                        document.body.classList.remove(
                            "search-open"
                        );

                    }

                }
            );
        }

        overlay.classList.add("open");

        document.body.classList.add("search-open");

        const input =
            document.getElementById("siteSearchInput");

        if (input) {

            setTimeout(function () {
                input.focus();
            }, 150);

        }

    });
}


/* =========================================================
   UPDATE WISHLIST BADGE
========================================================= */

function updateWishlistBadge() {

    const wishlist =
        getWishlist();

    const count =
        wishlist.length;

    document
        .querySelectorAll(
            ".wishlist-count, .mobile-wishlist-count"
        )
        .forEach(
            function (badge) {

                badge.textContent =
                    String(count);

            }
        );
}
