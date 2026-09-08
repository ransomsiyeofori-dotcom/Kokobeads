/* =========================================
   KOKOBEADS — CHECKOUT
========================================= */

const CHECKOUT_CART_KEY = "kokobeads_cart";


/* =========================================
   ELEMENTS
========================================= */

const checkoutForm =
    document.getElementById("checkoutForm");

const checkoutItems =
    document.getElementById("checkoutItems");

const checkoutItemCount =
    document.getElementById("checkoutItemCount");

const checkoutSubtotal =
    document.getElementById("checkoutSubtotal");

const checkoutTotal =
    document.getElementById("checkoutTotal");

const placeOrderButton =
    document.getElementById("placeOrderButton");

const checkoutAuthMessage =
    document.getElementById("checkoutAuthMessage");

const cartCount =
    document.getElementById("cartCount");

const mobileCartCount =
    document.getElementById("mobileCartCount");


/* =========================================
   CURRENCY
========================================= */

function formatCheckoutCurrency(amount) {

    const value = Number(amount);

    if (!Number.isFinite(value)) {
        return "₦0";
    }

    return new Intl.NumberFormat(
        "en-NG",
        {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0
        }
    ).format(value);
}


/* =========================================
   GET CART
========================================= */

function getCheckoutCart() {

    try {

        const storedCart =
            localStorage.getItem(
                CHECKOUT_CART_KEY
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
            "Unable to read checkout cart:",
            error
        );

        return [];
    }
}


/* =========================================
   UPDATE CART BADGES
========================================= */

function updateCheckoutCartCount(cart) {

    const count =
        cart.reduce(
            function(total, item) {

                return total +
                    Number(
                        item.quantity || 0
                    );

            },
            0
        );


    if (cartCount) {
        cartCount.textContent =
            String(count);
    }


    if (mobileCartCount) {
        mobileCartCount.textContent =
            String(count);
    }


    const drawerCount =
        document.querySelector(
            ".drawer-cart-count"
        );


    if (drawerCount) {
        drawerCount.textContent =
            String(count);
    }

}


/* =========================================
   LOAD CHECKOUT
========================================= */

async function loadCheckout() {

    const cart =
        getCheckoutCart();


    updateCheckoutCartCount(
        cart
    );


    if (!cart.length) {

        showEmptyCheckout();

        return;
    }


    try {
      const response =
    await apiRequest(
        "/products"
    );


const responseData =
    response.data;


const products =
    Array.isArray(response)
        ? response
        : response?.products ||
          response?.data ||
          [];


        renderCheckout(
            cart,
            products
        );


    } catch (error) {

        console.error(
            "Unable to load checkout:",
            error
        );


        showCheckoutError(
            error.message
        );
    }

}


/* =========================================
   RENDER CHECKOUT
========================================= */

function renderCheckout(
    cart,
    products
) {

    if (!checkoutItems) {
        return;
    }


    checkoutItems.innerHTML = "";


    let totalItems = 0;
    let subtotal = 0;


    cart.forEach(
        function(cartItem) {

            const product =
                products.find(
                    function(item) {

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
                !Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                return;
            }


            const itemSubtotal =
                Number(product.price) *
                quantity;


            totalItems +=
                quantity;


            subtotal +=
                itemSubtotal;


            checkoutItems.appendChild(
                createCheckoutItem(
                    product,
                    quantity
                )
            );

        }
    );


    if (!checkoutItems.children.length) {

        showEmptyCheckout();

        return;
    }


    if (checkoutItemCount) {

        checkoutItemCount.textContent =
            String(totalItems);

    }


    if (checkoutSubtotal) {

        checkoutSubtotal.textContent =
            formatCheckoutCurrency(
                subtotal
            );

    }


    if (checkoutTotal) {

        checkoutTotal.textContent =
            formatCheckoutCurrency(
                subtotal
            );

    }

}


/* =========================================
   CREATE CHECKOUT ITEM
========================================= */

function createCheckoutItem(
    product,
    quantity
) {

    const item =
        document.createElement(
            "article"
        );


    item.className =
        "checkout-item";


    const image =
        (typeof product.images?.[0] === "object"
            ? product.images[0]?.url
            : product.images?.[0]) ||
        product.image ||
        "";


    const itemTotal =
        Number(product.price) *
        quantity;


    item.innerHTML = `

        <div class="checkout-item-image">

            <img
                src="${escapeCheckoutHtml(image)}"
                alt="${escapeCheckoutHtml(
                    product.name ||
                    "Kokobeads product"
                )}"
                loading="lazy"
            >

        </div>


        <div class="checkout-item-details">

            <h3 class="checkout-item-name">

                ${escapeCheckoutHtml(
                    product.name ||
                    "Product"
                )}

            </h3>


            <p class="checkout-item-meta">

                ${quantity} ×
                ${formatCheckoutCurrency(
                    product.price
                )}

            </p>

        </div>


        <strong class="checkout-item-total">

            ${formatCheckoutCurrency(
                itemTotal
            )}

        </strong>

    `;


    return item;
}


/* =========================================
   CHECK AUTHENTICATION
========================================= */

async function checkCheckoutAuthentication() {

    const user =
        await getCurrentUser();


    if (!user) {

        if (checkoutAuthMessage) {
            checkoutAuthMessage.hidden =
                false;
        }

        if (placeOrderButton) {
            placeOrderButton.disabled =
                true;
        }

        return null;
    }


    if (checkoutAuthMessage) {
        checkoutAuthMessage.hidden =
            true;
    }


    if (placeOrderButton) {
        placeOrderButton.disabled =
            false;
    }


    return user;
}


/* =========================================
   VALIDATION
========================================= */

function validateField(
    fieldId,
    errorId,
    message
) {

    const field =
        document.getElementById(
            fieldId
        );

    const error =
        document.getElementById(
            errorId
        );


    if (!field) {
        return false;
    }


    const value =
        field.value.trim();


    if (!value) {

        if (error) {
            error.textContent =
                message;
        }

        field.classList.add(
            "input-error"
        );

        return false;
    }


    if (error) {
        error.textContent = "";
    }


    field.classList.remove(
        "input-error"
    );


    return true;
}


/* =========================================
   VALIDATE FORM
========================================= */

function validateCheckoutForm() {

    let valid = true;


    if (
        !validateField(
            "fullName",
            "fullNameError",
            "Please enter your full name."
        )
    ) {
        valid = false;
    }


    if (
        !validateField(
            "phone",
            "phoneError",
            "Please enter your phone number."
        )
    ) {
        valid = false;
    }


    if (
        !validateField(
            "addressLine",
            "addressError",
            "Please enter your delivery address."
        )
    ) {
        valid = false;
    }


    if (
        !validateField(
            "city",
            "cityError",
            "Please enter your city."
        )
    ) {
        valid = false;
    }


    if (
        !validateField(
            "state",
            "stateError",
            "Please enter your state."
        )
    ) {
        valid = false;
    }


    if (
        !validateField(
            "country",
            "countryError",
            "Please enter your country."
        )
    ) {
        valid = false;
    }


    const phone =
        document.getElementById(
            "phone"
        );


    if (
        phone &&
        phone.value.trim() &&
        phone.value.trim().length < 7
    ) {

        const error =
            document.getElementById(
                "phoneError"
            );


        if (error) {
            error.textContent =
                "Please enter a valid phone number.";
        }


        phone.classList.add(
            "input-error"
        );


        valid = false;
    }


    return valid;
}


/* =========================================
   GET SHIPPING ADDRESS
========================================= */

function getShippingAddress() {

    return {

        fullName:
            document
                .getElementById("fullName")
                .value
                .trim(),

        phone:
            document
                .getElementById("phone")
                .value
                .trim(),

        addressLine:
            document
                .getElementById("addressLine")
                .value
                .trim(),

        city:
            document
                .getElementById("city")
                .value
                .trim(),

        state:
            document
                .getElementById("state")
                .value
                .trim(),

        country:
            document
                .getElementById("country")
                .value
                .trim()

    };
}


/* =========================================
   PLACE ORDER
========================================= */

async function handleCheckoutSubmit(
    event
) {

    event.preventDefault();


    const user =
        await checkCheckoutAuthentication();


    if (!user) {
        return;
    }


    if (!validateCheckoutForm()) {
        return;
    }


    const cart =
        getCheckoutCart();


    if (!cart.length) {

        showEmptyCheckout();

        return;
    }


    setPlaceOrderLoading(
        true
    );


    try {

        const shippingAddress =
            getShippingAddress();


        const items =
            cart.map(
                function(item) {

                    return {

                        productId:
                            item.productId,

                        quantity:
                            Number(
                                item.quantity
                            )

                    };

                }
            );


        const response =
            await apiRequest(
                "/orders",
                {
                    method: "POST",

                    body: JSON.stringify({

                        items,

                        shippingAddress

                    })
                }
            );


        if (
            !response ||
            !response.success
        ) {

            throw new Error(
                response?.message ||
                "Unable to place order."
            );
        }


        /* ==============================
           ORDER SUCCESS
        =============================== */

        localStorage.removeItem(
            CHECKOUT_CART_KEY
        );


        updateCheckoutCartCount(
            []
        );


        showOrderSuccess(
            response.order
        );


    } catch (error) {

        console.error(
            "Checkout error:",
            error
        );


        showCheckoutError(
            error.message
        );


        setPlaceOrderLoading(
            false
        );

    }

}


/* =========================================
   LOADING BUTTON
========================================= */

function setPlaceOrderLoading(
    loading
) {

    if (!placeOrderButton) {
        return;
    }


    placeOrderButton.disabled =
        loading;


    if (loading) {

        placeOrderButton.innerHTML = `

            <span>
                Processing Order...
            </span>

            <i
                class="fa-solid fa-spinner fa-spin"
                aria-hidden="true"
            ></i>

        `;

    } else {

        placeOrderButton.innerHTML = `

            <span>
                Place Order
            </span>

            <i
                class="fa-solid fa-arrow-right"
                aria-hidden="true"
            ></i>

        `;

    }

}


/* =========================================
   SUCCESS
========================================= */

function showOrderSuccess(
    order
) {

    const orderId =
        order?._id || "";


    const total =
        order?.totalAmount || 0;


    const checkoutPage =
        document.querySelector(
            ".checkout-page"
        );


    if (!checkoutPage) {
        return;
    }


    checkoutPage.innerHTML = `

        <section class="checkout-success">

            <div class="checkout-success-card">

                <div class="checkout-success-icon">

                    <i
                        class="fa-solid fa-check"
                        aria-hidden="true"
                    ></i>

                </div>


                <p class="checkout-eyebrow">
                    ORDER CONFIRMED
                </p>


                <h1>
                    Thank You For Your Order
                </h1>


                <p>
                    Your Kokobeads order has been
                    received successfully.
                </p>


                ${
                    orderId
                    ? `
                        <p class="order-reference">
                            Order #${escapeCheckoutHtml(
                                orderId
                            )}
                        </p>
                    `
                    : ""
                }


                <div class="success-total">

                    <span>
                        Order Total
                    </span>

                    <strong>
                        ${formatCheckoutCurrency(
                            total
                        )}
                    </strong>

                </div>


                <div class="success-actions">

                    <a
                        href="./profile.html"
                        class="primary-button"
                    >
                        View My Orders
                    </a>


                    <a
                        href="./shop.html"
                        class="secondary-button"
                    >
                        Continue Shopping
                    </a>

                </div>

            </div>

        </section>

    `;

}


/* =========================================
   EMPTY CHECKOUT
========================================= */

function showEmptyCheckout() {

    const checkoutPage =
        document.querySelector(
            ".checkout-page"
        );


    if (!checkoutPage) {
        return;
    }


    checkoutPage.innerHTML = `

        <section class="checkout-empty">

            <div class="checkout-empty-card">

                <div class="checkout-empty-icon">

                    <i
                        class="fa-solid fa-bag-shopping"
                        aria-hidden="true"
                    ></i>

                </div>


                <p class="checkout-eyebrow">
                    KOKOBEADS
                </p>


                <h1>
                    Your Cart Is Empty
                </h1>


                <p>
                    Add some beautiful pieces
                    before proceeding to checkout.
                </p>


                <a
                    href="./shop.html"
                    class="primary-button"
                >
                    Continue Shopping
                </a>

            </div>

        </section>

    `;

}


/* =========================================
   ERROR
========================================= */

function showCheckoutError(
    message
) {

    let errorBox =
        document.getElementById(
            "checkoutError"
        );


    if (!errorBox) {

        errorBox =
            document.createElement(
                "div"
            );


        errorBox.id =
            "checkoutError";

        errorBox.className =
            "checkout-error";


        const layout =
            document.querySelector(
                ".checkout-layout"
            );


        if (layout) {
            layout.parentNode.insertBefore(
                errorBox,
                layout
            );
        }

    }


    errorBox.innerHTML = `

        <i
            class="fa-solid fa-circle-exclamation"
            aria-hidden="true"
        ></i>

        <span>
            ${escapeCheckoutHtml(
                message ||
                "Something went wrong. Please try again."
            )}
        </span>

    `;


    errorBox.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


/* =========================================
   ESCAPE HTML
========================================= */

function escapeCheckoutHtml(
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
    async function() {

        loadCheckout();

        await checkCheckoutAuthentication();


        if (checkoutForm) {

            checkoutForm.addEventListener(
                "submit",
                handleCheckoutSubmit
            );

        }

    }
);