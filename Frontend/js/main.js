
/* =========================================
   KOKOBEADS — MAIN JAVASCRIPT
   Homepage + Mobile Navigation
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    initializeMain
);


/* =========================================
   MAIN INITIALIZATION
========================================= */

function initializeMain() {

    initializeMobileMenu();
    initializeSearchButton();

    initializeHomepageProducts();

}


/* =========================================
   MOBILE MENU
========================================= */

function initializeMobileMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const navigation =
        document.getElementById("mobileNavigation");


    if (!menuButton || !navigation) {
        return;
    }


    menuButton.addEventListener(
        "click",
        function () {

            const isOpen =
                menuButton.getAttribute(
                    "aria-expanded"
                ) === "true";


            const newState =
                !isOpen;


            menuButton.setAttribute(
                "aria-expanded",
                String(newState)
            );


            menuButton.setAttribute(
                "aria-label",
                newState
                    ? "Close menu"
                    : "Open menu"
            );


            navigation.classList.toggle(
                "open",
                newState
            );


            menuButton.classList.toggle(
                "active",
                newState
            );

        }
    );


    /* Close menu when a navigation link is clicked */

    const navigationLinks =
        navigation.querySelectorAll("a");


    navigationLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    navigation.classList.remove(
                        "open"
                    );


                    menuButton.classList.remove(
                        "active"
                    );


                    menuButton.setAttribute(
                        "aria-expanded",
                        "false"
                    );


                    menuButton.setAttribute(
                        "aria-label",
                        "Open menu"
                    );

                }
            );

        }
    );

}


/* =========================================
   HOMEPAGE PRODUCTS
========================================= */

async function initializeHomepageProducts() {

    const productsGrid =
        document.getElementById(
            "bestsellersGrid"
        );


    if (!productsGrid) {
        return;
    }


    try {

        const response =
            await apiRequest(
                "/products"
            );


        const products =
            Array.isArray(response)
                ? response
                : response.products ||
                  response.data ||
                  [];


        if (!products.length) {

            renderHomepageEmptyState(
                productsGrid
            );

            return;

        }


        renderHomepageProducts(
            products,
            productsGrid
        );
        initializeHomepageWishlistButtons();


    } catch (error) {

        console.error(
            "Failed to load homepage products:",
            error
        );


        renderHomepageError(
            productsGrid
        );

    }

}


/* =========================================
   RENDER HOMEPAGE PRODUCTS
========================================= */

function renderHomepageProducts(
    products,
    productsGrid
) {

    productsGrid.innerHTML = "";


    /*
       Show a maximum of 4 products
       on the homepage.
    */

    const homepageProducts =
        products.slice(0, 4);


    const fragment =
        document.createDocumentFragment();


    homepageProducts.forEach(
        function (product) {

            const card =
                createHomepageProductCard(
                    product
                );


            if (card) {

                fragment.appendChild(
                    card
                );

            }

        }
    );


    productsGrid.appendChild(
        fragment
    );


    initializeHomepageCartButtons();

}


/* =========================================
   CREATE HOMEPAGE PRODUCT CARD
========================================= */

function createHomepageProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    /*
       IMPORTANT:
       Store the real MongoDB _id.
    */

    card.dataset.productId =
        product._id || "";


    const image =
        (typeof product.images?.[0] === "object"
            ? product.images[0]?.url
            : product.images?.[0]) ||
        product.image ||
        "./assets/images/product-placeholder.jpg";


    const name =
        product.name ||
        "Product";


    const category =
        product.category ||
        "Beaded Product";


    const price =
        formatHomepageCurrency(
            product.price
        );


    const rating =
        Math.max(
            0,
            Math.min(
                5,
                Math.round(
                    Number(
                        product.rating || 0
                    )
                )
            )
        );


    const reviewCount =
        Number(
            product.reviewCount || 0
        );


    const badge =
        product.badge ||
        "";


    card.innerHTML = `

        <div class="product-image-wrapper">

            <a
                href="./pages/product.html?id=${encodeURIComponent(
                    product._id
                )}"
                class="product-image-link"
            >

                <img
                    src="${escapeHomepageHtml(image)}"
                    alt="${escapeHomepageHtml(name)}"
                    class="product-image"
                    loading="lazy"
                >

            </a>


            <button
                type="button"
                class="wishlist-button"
                aria-label="Add product to wishlist"
            >

                <span aria-hidden="true">
                    ♡
                </span>

            </button>


            ${
                badge
                    ? `
                        <span class="product-badge">
                            ${escapeHomepageHtml(
                                badge
                            )}
                        </span>
                    `
                    : ""
            }

        </div>


        <div class="product-content">

            <div class="product-category">

                <span>
                    ${escapeHomepageHtml(
                        category
                    )}
                </span>

            </div>


            <h3 class="product-name">

                <a
                    href="./pages/product.html?id=${encodeURIComponent(
                        product._id
                    )}"
                >
                    ${escapeHomepageHtml(
                        name
                    )}
                </a>

            </h3>


            <div class="product-rating">

                <span
                    class="stars"
                    aria-label="${rating} out of 5 stars"
                >
                    ${"★".repeat(rating)}${"☆".repeat(
                        5 - rating
                    )}
                </span>

                <span class="review-count">
                    (${reviewCount})
                </span>

            </div>


            <div class="product-bottom">

                <p class="product-price">
                    ${price}
                </p>


                <button
                    type="button"
                    class="add-to-cart-button"
                    data-product-id="${escapeHomepageHtml(
                        product._id || ""
                    )}"
                >
                    Add to Cart
                </button>

            </div>

        </div>

    `;


    return card;

}


/* =========================================
   HOMEPAGE ADD TO CART
========================================= */

function initializeHomepageCartButtons() {

    const cartButtons =
        document.querySelectorAll(
            "#bestsellersGrid .add-to-cart-button"
        );


    cartButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                handleHomepageAddToCart
            );

        }
    );

}


/* =========================================
   HANDLE HOMEPAGE ADD TO CART
========================================= */

function handleHomepageAddToCart(
    event
) {

    const button =
        event.currentTarget;


    const productId =
        button.dataset.productId;


    if (!productId) {

        console.error(
            "Homepage product ID is missing."
        );

        return;

    }


    const cart =
        getHomepageCart();


    const existingItem =
        cart.find(
            function (item) {

                return String(
                    item.productId
                ) ===
                String(
                    productId
                );

            }
        );


    if (existingItem) {

        existingItem.quantity += 1;

    } else {

        cart.push({

            productId:
                productId,

            quantity:
                1

        });

    }


    saveHomepageCart(
        cart
    );


    updateHomepageCartCount(
        cart
    );


    showHomepageCartFeedback(
        button
    );

}


/* =========================================
   CART STORAGE
========================================= */

const HOMEPAGE_CART_STORAGE_KEY =
    "kokobeeds_cart";


function getHomepageCart() {

    try {

        const storedCart =
            localStorage.getItem(
                HOMEPAGE_CART_STORAGE_KEY
            );


        if (!storedCart) {
            return [];
        }


        const cart =
            JSON.parse(
                storedCart
            );


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


function saveHomepageCart(
    cart
) {

    try {

        localStorage.setItem(
            HOMEPAGE_CART_STORAGE_KEY,
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
   UPDATE CART COUNT
========================================= */

function updateHomepageCartCount(
    cart
) {

    const count =
        cart.reduce(
            function (total, item) {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    document
        .querySelectorAll(
            "[data-cart-count]"
        )
        .forEach(
            function (counter) {

                counter.textContent =
                    String(count);

                counter.hidden =
                    count === 0;

            }
        );

}


/* =========================================
   CART FEEDBACK
========================================= */

function showHomepageCartFeedback(
    button
) {

    const originalText =
        button.textContent;


    button.textContent =
        "Added ✓";


    button.disabled =
        true;


    window.setTimeout(
        function () {

            button.textContent =
                originalText;

            button.disabled =
                false;

        },
        1000
    );

}


/* =========================================
   CURRENCY
========================================= */

function formatHomepageCurrency(
    amount
) {

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
   ESCAPE HTML
========================================= */

function escapeHomepageHtml(
    value
) {

    return String(
        value ?? ""
    )
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
   EMPTY STATE
========================================= */

function renderHomepageEmptyState(
    productsGrid
) {

    productsGrid.innerHTML = `

        <div class="products-empty-state">

            <h2>
                No products available
            </h2>

            <p>
                Check back soon for new products.
            </p>

        </div>

    `;

}


/* =========================================
   ERROR STATE
========================================= */

function renderHomepageError(
    productsGrid
) {

    productsGrid.innerHTML = `

        <div class="products-empty-state">

            <h2>
                Unable to load products
            </h2>

            <p>
                Please refresh the page and try again.
            </p>

        </div>

    `;

}
/* =========================================
   HEADER SEARCH
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
                        <span class="search-panel-title">Search Kokobeads</span>

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
                            <span class="search-input-icon" aria-hidden="true">🔍</span>

                            <input
                                type="search"
                                id="siteSearchInput"
                                class="search-input"
                                placeholder="Search for beads..."
                                autocomplete="off"
                            >
                        </div>

                        <button type="submit" class="search-submit">
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

                const query = input.value.trim();

                if (!query) {
                    input.focus();
                    return;
                }

                window.location.href =
                    "./pages/shop.html?search=" +
                    encodeURIComponent(query);
            });

            overlay.querySelectorAll("[data-search-close]").forEach(
                function (element) {
                    element.addEventListener("click", function () {
                        overlay.classList.remove("open");
                        document.body.classList.remove("search-open");
                    });
                }
            );

            document.addEventListener("keydown", function (event) {
                if (event.key === "Escape") {
                    overlay.classList.remove("open");
                    document.body.classList.remove("search-open");
                }
            });
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
   WISHLIST BADGE
========================================================= */

function updateHomepageWishlistBadge() {

    let wishlist = [];

    try {

        const stored =
            localStorage.getItem(
                "kokobeeds_wishlist"
            );

        if (stored) {

            const parsed =
                JSON.parse(stored);

            if (Array.isArray(parsed)) {
                wishlist = parsed;
            }

        }

    } catch (error) {

        console.error(
            "Unable to read wishlist:",
            error
        );

    }

    const count =
        wishlist.length;


    const desktopBadge =
        document.querySelector(
            ".wishlist-count"
        );

    if (desktopBadge) {
        desktopBadge.textContent =
            String(count);
    }


    const mobileBadge =
        document.getElementById(
            "mobileWishlistCount"
        );

    if (mobileBadge) {
        mobileBadge.textContent =
            String(count);
    }
}


/* Initialize homepage wishlist badge */

document.addEventListener(
    "DOMContentLoaded",
    function () {
        updateHomepageWishlistBadge();
    }
);


/* =========================================================
   HOMEPAGE WISHLIST
========================================================= */

function getHomepageWishlist() {

    try {

        const stored =
            localStorage.getItem("kokobeeds_wishlist");

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


function saveHomepageWishlist(wishlist) {

    try {

        localStorage.setItem(
            "kokobeeds_wishlist",
            JSON.stringify(wishlist)
        );

    } catch (error) {

        console.error(
            "Unable to save wishlist:",
            error
        );

    }

}


function initializeHomepageWishlistButtons() {

    const buttons =
        document.querySelectorAll(
            "#bestsellersGrid .wishlist-button"
        );

    buttons.forEach(function (button) {

        if (button.dataset.wishlistInitialized === "true") {
            return;
        }

        button.dataset.wishlistInitialized = "true";

        const card =
            button.closest(".product-card");

        if (!card) {
            return;
        }

        const productLink =
            card.querySelector(
                ".product-image-link"
            );

        if (!productLink) {
            return;
        }

        const url =
            new URL(
                productLink.href,
                window.location.origin
            );

        const productId =
            url.searchParams.get("id");

        if (!productId) {
            return;
        }

        function updateButton() {

            const wishlist =
                getHomepageWishlist();

            const active =
                wishlist.includes(productId);

            button.classList.toggle(
                "active",
                active
            );

            button.setAttribute(
                "aria-label",
                active
                    ? "Remove product from wishlist"
                    : "Add product to wishlist"
            );

            const icon =
                button.querySelector("span");

            if (icon) {
                icon.textContent =
                    active ? "♥" : "♡";
            }

        }

        updateButton();

        button.addEventListener(
            "click",
            function () {

                let wishlist =
                    getHomepageWishlist();

                const index =
                    wishlist.indexOf(productId);

                if (index !== -1) {

                    wishlist.splice(
                        index,
                        1
                    );

                } else {

                    wishlist.push(
                        productId
                    );

                }

                saveHomepageWishlist(
                    wishlist
                );

                updateHomepageWishlistBadge();

                updateButton();

            }
        );

    });

}
