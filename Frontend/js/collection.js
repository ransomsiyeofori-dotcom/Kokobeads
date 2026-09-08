const API_BASE_URL =
    window.KOKOBEADS_API_URL ||
    "https://kokobeads-api.onrender.com/api";


document.addEventListener(
    "DOMContentLoaded",
    initializeCollectionsPage
);


function initializeCollectionsPage() {

    initializeMobileMenu();

    initializeSearch();

    loadCollections();

}


function initializeMobileMenu() {

    const menuButton =
        document.getElementById("menuButton");

    const mobileNavigation =
        document.getElementById("mobileNavigation");

    if (!menuButton || !mobileNavigation) {
        return;
    }


    menuButton.addEventListener(
        "click",
        function () {

            const isOpen =
                mobileNavigation.classList.toggle("open");

            menuButton.setAttribute(
                "aria-expanded",
                String(isOpen)
            );

        }
    );

}


function initializeSearch() {

    const searchButton =
        document.getElementById("searchButton");

    if (!searchButton) {
        return;
    }


    searchButton.addEventListener(
        "click",
        function () {

            let overlay =
                document.getElementById(
                    "collectionSearchOverlay"
                );


            if (!overlay) {

                overlay =
                    document.createElement("div");

                overlay.id =
                    "collectionSearchOverlay";

                overlay.className =
                    "search-overlay";


                overlay.innerHTML = `
                    <div
                        class="search-overlay-backdrop"
                        data-collection-search-close
                    ></div>

                    <div
                        class="search-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Search products"
                    >

                        <div class="search-panel-header">

                            <span class="search-panel-title">
                                Search Kokobeads
                            </span>

                            <button
                                type="button"
                                class="search-close"
                                aria-label="Close search"
                                data-collection-search-close
                            >
                                &times;
                            </button>

                        </div>


                        <form
                            class="search-form"
                            id="collectionSearchForm"
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
                                    id="collectionSearchInput"
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


                document.body.appendChild(
                    overlay
                );


                const form =
                    document.getElementById(
                        "collectionSearchForm"
                    );

                const input =
                    document.getElementById(
                        "collectionSearchInput"
                    );


                if (form && input) {

                    form.addEventListener(
                        "submit",
                        function (event) {

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

                        }
                    );

                }


                overlay
                    .querySelectorAll(
                        "[data-collection-search-close]"
                    )
                    .forEach(
                        function (element) {

                            element.addEventListener(
                                "click",
                                closeSearch
                            );

                        }
                    );


                document.addEventListener(
                    "keydown",
                    function (event) {

                        if (
                            event.key === "Escape"
                        ) {

                            closeSearch();

                        }

                    }
                );

            }


            overlay.classList.add("open");

            document.body.classList.add(
                "search-open"
            );


            const input =
                document.getElementById(
                    "collectionSearchInput"
                );


            if (input) {

                setTimeout(
                    function () {

                        input.focus();

                    },
                    150
                );

            }

        }
    );

}


function closeSearch() {

    const overlay =
        document.getElementById(
            "collectionSearchOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.remove("open");

    document.body.classList.remove(
        "search-open"
    );

}


async function loadCollections() {

    const collectionsGrid =
        document.getElementById(
            "collectionsGrid"
        );

    const featuredProducts =
        document.getElementById(
            "featuredProducts"
        );


    if (!collectionsGrid) {
        return;
    }


    try {

        const response =
            await fetch(
                API_BASE_URL + "/products"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load products."
            );

        }


        const data =
            await response.json();


        const products =
            Array.isArray(data)
                ? data
                : Array.isArray(data.products)
                    ? data.products
                    : [];


        const activeProducts =
            products.filter(
                function (product) {

                    return product &&
                        product.isActive !== false;

                }
            );


        renderCollections(
            activeProducts,
            collectionsGrid
        );


        if (featuredProducts) {

            renderFeaturedProducts(
                activeProducts,
                featuredProducts
            );

        }

    } catch (error) {

        console.error(
            "Collections loading error:",
            error
        );


        collectionsGrid.innerHTML = `
            <div class="collections-error">

                <h3>
                    Unable to load collections
                </h3>

                <p>
                    Please check your connection
                    and try again.
                </p>

                <button
                    type="button"
                    class="collections-retry"
                    id="collectionsRetry"
                >
                    Try Again
                </button>

            </div>
        `;


        const retryButton =
            document.getElementById(
                "collectionsRetry"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadCollections
            );

        }

    }

}


function renderCollections(
    products,
    container
) {

    const groups = {};


    products.forEach(
        function (product) {

            const rawCategory =
                String(
                    product.category || "other"
                )
                    .trim()
                    .toLowerCase();


            const displayCategory =
                normalizeCategory(
                    rawCategory
                );


            if (!groups[displayCategory]) {

                groups[displayCategory] = {

                    products: [],

                    rawCategory:
                        rawCategory

                };

            }


            groups[displayCategory]
                .products
                .push(product);

        }
    );


    const collections =
        Object.entries(groups)
            .sort(
                function (a, b) {

                    return (
                        b[1].products.length -
                        a[1].products.length
                    );

                }
            );


    if (!collections.length) {

        container.innerHTML = `
            <div class="collections-empty">

                <h3>
                    No collections available
                </h3>

                <p>
                    New collections are coming soon.
                </p>

            </div>
        `;

        return;

    }


    container.innerHTML =
        collections
            .map(
                function (entry) {

                    const category =
                        entry[0];

                    const group =
                        entry[1];


                    const firstProduct =
                        group.products[0];


                    const image =
                        getProductImage(
                            firstProduct
                        );


                    const count =
                        group.products.length;


                    const categoryUrl =
                        encodeURIComponent(
                            group.rawCategory
                        );


                    return `
                        <a
                            href="./shop.html?category=${categoryUrl}"
                            class="collection-card"
                        >

                            <div class="collection-card-image-wrap">

                                ${
                                    image
                                        ? `
                                            <img
                                                src="${escapeHtml(image)}"
                                                alt="${escapeHtml(category)}"
                                                class="collection-card-image"
                                                loading="lazy"
                                            >
                                        `
                                        : `
                                            <div class="collection-card-placeholder">
                                                Kokobeads
                                            </div>
                                        `
                                }

                            </div>


                            <div class="collection-card-content">

                                <div>

                                    <span class="collection-card-count">
                                        ${count}
                                        ${
                                            count === 1
                                                ? "piece"
                                                : "pieces"
                                        }
                                    </span>

                                    <h3 class="collection-card-title">
                                        ${escapeHtml(category)}
                                    </h3>

                                </div>


                                <span class="collection-card-link">
                                    Shop collection
                                    <span aria-hidden="true">
                                        →
                                    </span>
                                </span>

                            </div>

                        </a>
                    `;

                }
            )
            .join("");

}


function renderFeaturedProducts(
    products,
    container
) {

    let featured =
        products.filter(
            function (product) {

                return product.isFeatured === true;

            }
        );


    if (!featured.length) {

        featured =
            products.slice(0, 4);

    } else {

        featured =
            featured.slice(0, 4);

    }


    if (!featured.length) {

        container.innerHTML = `
            <div class="collections-empty">

                <h3>
                    No featured pieces yet
                </h3>

            </div>
        `;

        return;

    }


    container.innerHTML =
        featured
            .map(
                createProductCard
            )
            .join("");

}


function createProductCard(product) {

    const productId =
        product._id ||
        product.id ||
        "";


    const image =
        getProductImage(product);


    const name =
        product.name ||
        "Kokobeads Piece";


    const price =
        formatCurrency(
            product.price
        );


    const originalPrice =
        product.originalPrice != null
            ? formatCurrency(
                product.originalPrice
            )
            : "";


    const badge =
        product.badge
            ? `
                <span class="collection-product-badge">
                    ${escapeHtml(product.badge)}
                </span>
            `
            : "";


    return `
        <article class="collection-product-card">

            <a
                href="./product.html?id=${encodeURIComponent(productId)}"
                class="collection-product-image-wrap"
            >

                ${
                    image
                        ? `
                            <img
                                src="${escapeHtml(image)}"
                                alt="${escapeHtml(name)}"
                                class="collection-product-image"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="collection-product-placeholder">
                                Kokobeads
                            </div>
                        `
                }

                ${badge}

            </a>


            <div class="collection-product-info">

                <a
                    href="./product.html?id=${encodeURIComponent(productId)}"
                    class="collection-product-name"
                >
                    ${escapeHtml(name)}
                </a>


                <div class="collection-product-pricing">

                    <span class="collection-product-price">
                        ${price}
                    </span>

                    ${
                        originalPrice
                            ? `
                                <span class="collection-product-original">
                                    ${originalPrice}
                                </span>
                            `
                            : ""
                    }

                </div>

            </div>

        </article>
    `;

}


function getProductImage(product) {

    if (
        product &&
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


    if (
        product &&
        product.image
    ) {

        return product.image;

    }


    return "";

}


function normalizeCategory(category) {

    const aliases = {

        bracelet: "Bracelets",

        bracelets: "Bracelets",

        necklace: "Necklaces",

        necklaces: "Necklaces",

        earring: "Earrings",

        earrings: "Earrings",

        ring: "Rings",

        rings: "Rings",

        anklet: "Anklets",

        anklets: "Anklets"

    };


    if (aliases[category]) {

        return aliases[category];

    }


    return category
        .replace(
            /[-_]+/g,
            " "
        )
        .replace(
            /\b\w/g,
            function (letter) {

                return letter.toUpperCase();

            }
        );

}


function formatCurrency(value) {

    const amount =
        Number(value || 0);


    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(amount);

}


function escapeHtml(value) {

    return String(value ?? "")
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
