/* =========================================================
   KOKOBEEDS — WISHLIST PAGE
========================================================= */

const API_BASE_URL =
    window.KOKOBEEDS_API_URL ||
    "https://kokobeads-api.onrender.com/api";

const WISHLIST_STORAGE_KEY =
    "kokobeeds_wishlist";


document.addEventListener("DOMContentLoaded", function () {
    initializeWishlistHeader();
    initializeWishlistSearch();
    loadWishlist();
});


/* =========================================================
   WISHLIST STORAGE
========================================================= */

function getWishlistIds() {

    try {

        const stored =
            localStorage.getItem(
                WISHLIST_STORAGE_KEY
            );

        if (!stored) {
            return [];
        }

        const wishlist =
            JSON.parse(stored);

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


/* =========================================================
   LOAD WISHLIST
========================================================= */

async function loadWishlist() {

    const content =
        document.getElementById(
            "wishlistContent"
        );

    if (!content) {
        return;
    }

    const wishlistIds =
        getWishlistIds();

    if (!wishlistIds.length) {

        renderEmptyWishlist(content);

        return;
    }

    content.innerHTML = `
        <div class="wishlist-loading">
            Loading your wishlist...
        </div>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/products`
            );

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}`
            );
        }

        const data =
            await response.json();

        const products =
            Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : Array.isArray(data.data)
                        ? data.data
                        : [];

        const wishlistProducts =
            products.filter(function (product) {

                const productId =
                    String(
                        product._id ||
                        product.id ||
                        ""
                    );

                return wishlistIds.includes(
                    productId
                );
            });

        if (!wishlistProducts.length) {

            renderEmptyWishlist(content);

            return;
        }

        renderWishlist(
            content,
            wishlistProducts
        );

    } catch (error) {

        console.error(
            "Unable to load wishlist:",
            error
        );

        content.innerHTML = `
            <div class="wishlist-empty">

                <div class="wishlist-empty-icon">
                    ♡
                </div>

                <h2>
                    Unable to load your wishlist
                </h2>

                <p>
                    We couldn't connect to the store right now.
                    Please check that the Kokobeeds server is running
                    and try again.
                </p>

                <button
                    type="button"
                    class="wishlist-shop-link"
                    onclick="loadWishlist()"
                >
                    Try Again
                </button>

            </div>
        `;
    }
}


/* =========================================================
   RENDER WISHLIST
========================================================= */

function renderWishlist(
    container,
    products
) {

    container.innerHTML = `

        <div class="wishlist-grid">

            ${products.map(function (product) {

                const productId =
                    String(
                        product._id ||
                        product.id ||
                        ""
                    );

                const image =
                    getProductImage(product);

                const name =
                    escapeHtml(
                        product.name ||
                        "Product"
                    );

                const price =
                    formatPrice(
                        product.price
                    );

                return `

                    <article
                        class="wishlist-card"
                        data-product-id="${productId}"
                    >

                        <div class="wishlist-image-wrap">

                            <img
                                src="${image}"
                                alt="${name}"
                                class="wishlist-image"
                                loading="lazy"
                            >

                            <button
                                type="button"
                                class="wishlist-remove"
                                data-remove-wishlist="${productId}"
                                aria-label="Remove ${name} from wishlist"
                            >
                                ♥
                            </button>

                        </div>

                        <div class="wishlist-info">

                            <h2 class="wishlist-name">
                                ${name}
                            </h2>

                            <div class="wishlist-price">
                                ${price}
                            </div>

                            <button
                                type="button"
                                class="wishlist-cart"
                                data-add-cart="${productId}"
                            >
                                Add to Cart
                            </button>

                        </div>

                    </article>

                `;

            }).join("")}

        </div>
    `;

    initializeWishlistActions(
        products
    );
}


/* =========================================================
   WISHLIST ACTIONS
========================================================= */

function initializeWishlistActions(
    products
) {

    document
        .querySelectorAll(
            "[data-remove-wishlist]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        button.dataset.removeWishlist;

                    removeFromWishlist(
                        productId
                    );

                }
            );

        });


    document
        .querySelectorAll(
            "[data-add-cart]"
        )
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const productId =
                        button.dataset.addCart;

                    const product =
                        products.find(
                            function (item) {

                                return String(
                                    item._id ||
                                    item.id ||
                                    ""
                                ) === productId;

                            }
                        );

                    if (product) {

                        addProductToCart(
                            product
                        );

                    }

                }
            );

        });
}


/* =========================================================
   REMOVE FROM WISHLIST
========================================================= */

function removeFromWishlist(
    productId
) {

    const wishlist =
        getWishlistIds();

    const updated =
        wishlist.filter(function (id) {

            return String(id) !==
                String(productId);

        });

    localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(updated)
    );

    loadWishlist();
}


/* =========================================================
   ADD TO CART
========================================================= */

function addProductToCart(
    product
) {

    let cart = [];

    try {

        const stored =
            localStorage.getItem(
                "kokobeeds_cart"
            );

        if (stored) {

            const parsed =
                JSON.parse(stored);

            if (Array.isArray(parsed)) {
                cart = parsed;
            }

        }

    } catch (error) {

        cart = [];

    }


    const productId =
        String(
            product._id ||
            product.id ||
            ""
        );


    const existing =
        cart.find(function (item) {

            return String(
                item.productId ||
                item._id ||
                item.id ||
                ""
            ) === productId;

        });


    if (existing) {

        existing.quantity =
            Number(
                existing.quantity || 1
            ) + 1;

    } else {

        cart.push({

            productId: productId,

            name: product.name,

            price: product.price,

            image: getProductImage(
                product
            ),

            quantity: 1

        });

    }


    localStorage.setItem(
        "kokobeeds_cart",
        JSON.stringify(cart)
    );

    if (typeof updateGlobalCartCount === "function") {
        updateGlobalCartCount();
    }
    const button =
        document.querySelector(
            `[data-add-cart="${CSS.escape(productId)}"]`
        );

    if (button) {

        const originalText =
            button.textContent;

        button.textContent =
            "Added to Cart";

        button.disabled = true;

        setTimeout(function () {

            button.textContent =
                originalText;

            button.disabled = false;

        }, 1200);

    }
}


/* =========================================================
   PRODUCT IMAGE
========================================================= */

function getProductImage(
    product
) {

    if (
        product.image &&
        typeof product.image === "string"
    ) {
        return product.image;
    }

    if (
        product.imageUrl &&
        typeof product.imageUrl === "string"
    ) {
        return product.imageUrl;
    }

    if (
        Array.isArray(product.images) &&
        product.images.length
    ) {

        const firstImage =
            product.images[0];

        if (
            typeof firstImage === "string"
        ) {
            return firstImage;
        }

        if (
            firstImage &&
            firstImage.url
        ) {
            return firstImage.url;
        }

    }

    return "../assets/images/placeholder.jpg";
}


/* =========================================================
   EMPTY STATE
========================================================= */

function renderEmptyWishlist(
    container
) {

    container.innerHTML = `

        <div class="wishlist-empty">

            <div class="wishlist-empty-icon">
                ♡
            </div>

            <h2>
                Your wishlist is empty
            </h2>

            <p>
                Save the pieces you love and
                come back to them whenever you're ready.
            </p>

            <a
                href="./shop.html"
                class="wishlist-shop-link"
            >
                Explore the Shop
            </a>

        </div>

    `;
}


/* =========================================================
   FORMAT PRICE
========================================================= */

function formatPrice(
    price
) {

    const amount =
        Number(price);

    if (!Number.isFinite(amount)) {
        return "Price unavailable";
    }

    return "₦" +
        amount.toLocaleString(
            "en-NG"
        );
}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHtml(
    value
) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/* =========================================================
   WISHLIST BADGE
========================================================= */

function updateWishlistBadge() {

    const wishlist =
        getWishlistIds();

    const count =
        wishlist.length;

    document
        .querySelectorAll(
            ".wishlist-count, .mobile-wishlist-count"
        )
        .forEach(function (badge) {

            badge.textContent =
                String(count);

            badge.style.display =
                count > 0 ? "" : "none";

        });
}


/* Update badge when wishlist page loads */
document.addEventListener(
    "DOMContentLoaded",
    function () {
        updateWishlistBadge();
    }
);


/* =========================================================
   WISHLIST PAGE HEADER
========================================================= */

function initializeWishlistHeader() {

    const menuButton =
        document.getElementById("menuButton");

    const mobileNavigation =
        document.getElementById("mobileNavigation");

    if (!menuButton || !mobileNavigation) {
        return;
    }

    menuButton.addEventListener("click", function () {

        const isOpen =
            mobileNavigation.classList.toggle("open");

        menuButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });

}

/* =========================================================
   WISHLIST PAGE SEARCH
========================================================= */

function initializeWishlistSearch() {

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

                <div
                    class="search-panel"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Search products"
                >

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

                    <form
                        class="search-form"
                        id="siteSearchForm"
                    >

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
                            document.body.classList.remove("search-open");

                        }
                    );

                });

            document.addEventListener(
                "keydown",
                function (event) {

                    if (event.key === "Escape") {

                        overlay.classList.remove("open");
                        document.body.classList.remove("search-open");

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
