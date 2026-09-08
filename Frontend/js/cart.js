/* =========================================
   KOKOBEADS — CART PAGE
========================================= */

const CART_STORAGE_KEY =
    "kokobeads_cart";


/* =========================================
   ELEMENTS
========================================= */

const cartLoading =
    document.getElementById(
        "cartLoading"
    );

const emptyCart =
    document.getElementById(
        "emptyCart"
    );

const cartContent =
    document.getElementById(
        "cartContent"
    );

const cartItems =
    document.getElementById(
        "cartItems"
    );

const cartCount =
    document.getElementById(
        "cartCount"
    );

const cartItemCount =
    document.getElementById(
        "cartItemCount"
    );

const cartSubtotal =
    document.getElementById(
        "cartSubtotal"
    );

const cartTotal =
    document.getElementById(
        "cartTotal"
    );

const checkoutButton =
    document.getElementById(
        "checkoutButton"
    );


/* =========================================
   CART STORAGE
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
   CURRENCY
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
   UPDATE CART COUNT
========================================= */

function updateCartCount(cart) {

    const count =
        cart.reduce(
            function (total, item) {
                return total +
                    Number(item.quantity || 0);
            },
            0
        );

    document
        .querySelectorAll("[data-cart-count]")
        .forEach(function (counter) {

            counter.textContent =
                String(count);

            counter.hidden =
                count === 0;

        });

}


/* =========================================
   SHOW STATE
========================================= */

function showCartState(
    state
) {

    if (cartLoading) {
        cartLoading.hidden =
            state !== "loading";
    }


    if (emptyCart) {
        emptyCart.hidden =
            state !== "empty";
    }


    if (cartContent) {
        cartContent.hidden =
            state !== "content";
    }

}


/* =========================================
   LOAD PRODUCTS
========================================= */

async function loadCart() {

    const cart =
        getCart();


    updateCartCount(cart);


    if (!cart.length) {

        showCartState(
            "empty"
        );

        return;

    }


    showCartState(
        "loading"
    );


    try {

        const response =
            await apiRequest(
                "/products"
            );


        const products =
            Array.isArray(
                response
            )
                ? response
                : response.products ||
                  response.data ||
                  [];


        renderCart(
            cart,
            products
        );


    } catch (error) {

        console.error(
            "Failed to load cart products:",
            error
        );


        showCartError(
            error.message
        );

    }

}


/* =========================================
   RENDER CART
========================================= */

function renderCart(
    cart,
    products
) {

    if (!cartItems) {
        return;
    }


    cartItems.innerHTML = "";


    let validItems = 0;

    let totalItems = 0;

    let subtotal = 0;


    cart.forEach(
        function (cartItem) {

            const product =
                products.find(
                    function (item) {

                        return String(
                            item._id
                        ) ===
                        String(
                            cartItem.productId
                        );

                    }
                );


            if (!product) {
                return;
            }


            const quantity =
                Number(
                    cartItem.quantity
                );


            if (
                !Number.isInteger(
                    quantity
                ) ||
                quantity <= 0
            ) {

                return;

            }


            const itemSubtotal =
                Number(product.price) *
                quantity;


            validItems += 1;

            totalItems +=
                quantity;

            subtotal +=
                itemSubtotal;


            const itemElement =
                createCartItem(
                    product,
                    quantity
                );


            cartItems.appendChild(
                itemElement
            );

        }
    );


    if (!validItems) {

        showCartState(
            "empty"
        );

        return;

    }


    showCartState(
        "content"
    );


    if (cartItemCount) {

        cartItemCount.textContent =
            String(totalItems);

    }


    if (cartSubtotal) {

        cartSubtotal.textContent =
            formatCurrency(
                subtotal
            );

    }


    if (cartTotal) {

        cartTotal.textContent =
            formatCurrency(
                subtotal
            );

    }


    updateCartCount(
        cart
    );


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            handleCheckoutClick
        );

    }

}


/* =========================================
   CREATE CART ITEM
========================================= */

function createCartItem(
    product,
    quantity
) {

    const article =
        document.createElement(
            "article"
        );


    article.className =
        "cart-item";


    article.dataset.productId =
        product._id;


    const image =
        (typeof product.images?.[0] === "object"
            ? product.images[0]?.url
            : product.images?.[0]) ||
        product.image ||
        "";


    article.innerHTML = `

        <div class="cart-item-image">

            <img
                src="${escapeHtml(image)}"
                alt="${escapeHtml(
                    product.name ||
                    "Kokobeads product"
                )}"
                loading="lazy"
            >

        </div>


        <div class="cart-item-details">

            <p class="product-category">
                ${escapeHtml(
                    product.category || ""
                )}
            </p>

            <h2 class="cart-item-name">

                ${escapeHtml(
                    product.name ||
                    "Product"
                )}

            </h2>


            <p class="cart-item-price">

                ${formatCurrency(
                    product.price
                )}

            </p>


            <div class="cart-item-actions">

                <button
                    type="button"
                    class="quantity-button"
                    data-cart-decrease
                    aria-label="Decrease quantity"
                >
                    −
                </button>


                <span
                    class="cart-item-quantity"
                >
                    ${quantity}
                </span>


                <button
                    type="button"
                    class="quantity-button"
                    data-cart-increase
                    aria-label="Increase quantity"
                >
                    +
                </button>


                <button
                    type="button"
                    class="remove-cart-item"
                    data-cart-remove
                >
                    Remove
                </button>

            </div>

        </div>

    `;


    const decreaseButton =
        article.querySelector(
            "[data-cart-decrease]"
        );


    const increaseButton =
        article.querySelector(
            "[data-cart-increase]"
        );


    const removeButton =
        article.querySelector(
            "[data-cart-remove]"
        );


    if (decreaseButton) {

        decreaseButton.addEventListener(
            "click",
            function () {

                updateCartQuantity(
                    product._id,
                    quantity - 1
                );

            }
        );

    }


    if (increaseButton) {

        increaseButton.addEventListener(
            "click",
            function () {

                updateCartQuantity(
                    product._id,
                    quantity + 1
                );

            }
        );

    }


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            function () {
removeFromCart(
                    product._id
                );

            }
        );

    }


    return article;

}


/* =========================================
   UPDATE QUANTITY
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

                return String(
                    cartItem.productId
                ) ===
                String(
                    productId
                );

            }
        );


    if (!item) {
        return;
    }


    if (
        !Number.isInteger(
            quantity
        ) ||
        quantity <= 0
    ) {

        removeFromCart(
            productId
        );

        return;

    }


    item.quantity =
        quantity;


    saveCart(
        cart
    );


    loadCart();

}


/* =========================================
   REMOVE ITEM
========================================= */
function removeFromCart(
    productId
) {

    const cart =
        getCart();

    const updatedCart =
        cart.filter(
            function (item) {

                return String(
                    item.productId
                ) !==
                String(
                    productId
                );

            }
        );

    saveCart(
        updatedCart
    );

    updateCartCount(
        updatedCart
    );

    if (!updatedCart.length) {

        showCartState("empty");

        if (cartItems) {
            cartItems.innerHTML = "";
        }

        if (cartItemCount) {
            cartItemCount.textContent = "0";
        }

        if (cartSubtotal) {
            cartSubtotal.textContent =
                formatCurrency(0);
        }

        if (cartTotal) {
            cartTotal.textContent =
                formatCurrency(0);
        }

        return;
    }

    loadCart();

}
function handleCheckoutClick(
    event
) {

    const cart =
        getCart();


    if (!cart.length) {

        event.preventDefault();

        return;

    }

}


/* =========================================
   ERROR STATE
========================================= */

function showCartError(
    message
) {

    showCartState(
        "empty"
    );


    if (!emptyCart) {
        return;
    }


    emptyCart.innerHTML = `

        <i class="fa-solid fa-circle-exclamation"></i>

        <h2>
            Unable to load cart
        </h2>

        <p>
            ${escapeHtml(
                message ||
                "Please try again."
            )}
        </p>

        <button
            type="button"
            class="primary-button"
            id="retryCartButton"
        >
            Try Again
        </button>

    `;


    const retryButton =
        document.getElementById(
            "retryCartButton"
        );


    if (retryButton) {

        retryButton.addEventListener(
            "click",
            loadCart
        );

    }

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeHtml(
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
   INITIALIZE
========================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadCart();

    }
);
