const CART_STORAGE_KEY = "kokobeeds_cart";

function updateGlobalCartCount() {
    let cart = [];

    try {
        const storedCart =
            localStorage.getItem(CART_STORAGE_KEY);

        if (storedCart) {
            const parsedCart =
                JSON.parse(storedCart);

            if (Array.isArray(parsedCart)) {
                cart = parsedCart;
            }
        }
    } catch (error) {
        console.error("Unable to read cart:", error);
    }

    const count = cart.reduce(
        function (total, item) {
            return total + Number(item.quantity || 0);
        },
        0
    );

    document
        .querySelectorAll("[data-cart-count]")
        .forEach(function (counter) {
            counter.textContent = String(count);
            counter.hidden = count === 0;
        });
}

document.addEventListener(
    "DOMContentLoaded",
    updateGlobalCartCount
);

window.addEventListener(
    "storage",
    updateGlobalCartCount
);

window.updateGlobalCartCount =
    updateGlobalCartCount;
