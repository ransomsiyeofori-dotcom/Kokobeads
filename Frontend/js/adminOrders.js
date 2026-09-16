const ORDERS_API_URL =
    `${window.KOKOBEADS_API_URL || "https://kokobeads-api.onrender.com/api"}/orders`;

let adminOrders = [];

document.addEventListener("DOMContentLoaded", function () {
    initializeOrdersAdmin();
});


async function initializeOrdersAdmin() {

    const ordersList =
        document.getElementById("adminOrdersList");

    if (!ordersList) return;

    await loadAdminOrders();

}


/* =========================================
   LOAD ADMIN ORDERS
========================================= */

async function loadAdminOrders() {

    const list =
        document.getElementById("adminOrdersList");

    if (!list) return;

    list.innerHTML = `
        <div class="admin-loading">
            Loading orders...
        </div>
    `;


    try {

        const response =
            await fetch(
                `${ORDERS_API_URL}/admin`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load orders."
            );

        }


        adminOrders =
            Array.isArray(data.orders)
                ? data.orders
                : [];


        renderAdminOrders();


    } catch (error) {

        console.error(
            "Load admin orders error:",
            error
        );


        list.innerHTML = `
            <div class="admin-empty-state">
                <p>Unable to load orders: ${escapeOrderHTML(error.message)}</p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="loadAdminOrders()"
                >
                    Try Again
                </button>

            </div>
        `;

    }

}


/* =========================================
   RENDER ADMIN ORDERS
========================================= */

function renderAdminOrders() {

    const list =
        document.getElementById("adminOrdersList");

    if (!list) return;


    if (!adminOrders.length) {

        list.innerHTML = `
            <div class="admin-empty-state">

                <p>
                    No customer orders have been placed yet.
                </p>

            </div>
        `;

        return;

    }


    list.innerHTML =
        adminOrders
            .map(createAdminOrderHTML)
            .join("");

}


/* =========================================
   CREATE ORDER CARD
========================================= */

function createAdminOrderHTML(order) {

    const customer =
        order.customer || {};


    const customerName =
        customer.name ||
        "Unknown Customer";


    const customerEmail =
        customer.email ||
        "No email";


    const itemCount =
        Array.isArray(order.items)
            ? order.items.reduce(
                function (total, item) {
                    return total +
                        Number(item.quantity || 0);
                },
                0
            )
            : 0;


    const totalAmount =
        Number(order.totalAmount || 0);


    const orderDate =
        order.createdAt
            ? new Date(order.createdAt)
                .toLocaleString()
            : "Unknown date";


    return `
        <article
            class="admin-order-card"
            data-order-id="${escapeOrderHTML(order._id)}"
        >

            <div class="admin-order-card-header">

                <div>

                    <p class="admin-eyebrow">
                        ORDER
                    </p>

                    <h3>
                        #${escapeOrderHTML(
                            String(order._id || "").slice(-8).toUpperCase()
                        )}
                    </h3>

                </div>


                <div class="admin-order-status-group">

                    <span class="admin-order-status">
                        ${escapeOrderHTML(order.status || "pending")}
                    </span>

                    <span class="admin-payment-status">
                        ${escapeOrderHTML(
                            order.paymentStatus || "pending"
                        )}
                    </span>

                </div>

            </div>


            <div class="admin-order-card-body">

                <div class="admin-order-info">

                    <strong>
                        Customer
                    </strong>

                    <span>
                        ${escapeOrderHTML(customerName)}
                    </span>

                    <small>
                        ${escapeOrderHTML(customerEmail)}
                    </small>

                </div>


                <div class="admin-order-info">

                    <strong>
                        Items
                    </strong>

                    <span>
                        ${itemCount}
                    </span>

                </div>


                <div class="admin-order-info">

                    <strong>
                        Total
                    </strong>

                    <span>
                        ₦${totalAmount.toLocaleString()}
                    </span>

                </div>


                <div class="admin-order-info">

                    <strong>
                        Date
                    </strong>

                    <span>
                        ${escapeOrderHTML(orderDate)}
                    </span>

                </div>

            </div>


            <div class="admin-order-card-actions">

                <button
                    type="button"
                    class="btn btn-secondary admin-view-order-button"
                    data-order-id="${escapeOrderHTML(order._id)}"
                >
                    View Order
                </button>

            </div>

        </article>
    `;
}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeOrderHTML(value) {

    return String(value == null ? "" : value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   GLOBAL FUNCTIONS
========================================= */

window.loadAdminOrders =
    loadAdminOrders;


/* =========================================
   ORDER DETAILS MODAL
========================================= */

let currentAdminOrder = null;


document.addEventListener("click", function (event) {

    const button =
        event.target.closest(".admin-view-order-button");

    if (!button) return;

    const orderId =
        button.getAttribute("data-order-id");

    if (!orderId) return;

    openAdminOrderDetails(orderId);

});


async function openAdminOrderDetails(orderId) {

    const modal =
        document.getElementById("orderDetailsModal");

    const content =
        document.getElementById("orderDetailsContent");

    if (!modal || !content) return;

    modal.hidden = false;

    content.innerHTML = `
        <div class="admin-loading">
            Loading order details...
        </div>
    `;

    try {

        const response =
            await fetch(
                `${ORDERS_API_URL}/admin/${encodeURIComponent(orderId)}`,
                {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Accept": "application/json"
                    }
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load order details."
            );

        }

        currentAdminOrder =
            data.order || null;

        if (!currentAdminOrder) {

            throw new Error(
                "Order details were not returned."
            );

        }

        renderAdminOrderDetails(
            currentAdminOrder
        );

    } catch (error) {

        console.error(
            "Load order details error:",
            error
        );

        content.innerHTML = `
            <div class="admin-empty-state">
                <p>
                    Unable to load order details:
                    ${escapeOrderHTML(error.message)}
                </p>

                <button
                    type="button"
                    class="btn btn-primary"
                    onclick="openAdminOrderDetails('${escapeOrderHTML(orderId)}')"
                >
                    Try Again
                </button>
            </div>
        `;

    }

}


function renderAdminOrderDetails(order) {

    const content =
        document.getElementById("orderDetailsContent");

    if (!content) return;

    const customer =
        order.customer || {};

    const shipping =
        order.shippingAddress || {};

    const items =
        Array.isArray(order.items)
            ? order.items
            : [];

    const totalAmount =
        Number(order.totalAmount || 0);

    const orderDate =
        order.createdAt
            ? new Date(order.createdAt)
                .toLocaleString()
            : "Unknown date";

    content.innerHTML = `

        <div class="admin-order-detail-grid">

            <div class="admin-order-detail-section">

                <p class="admin-eyebrow">
                    CUSTOMER
                </p>

                <h3>
                    ${escapeOrderHTML(
                        customer.name || "Unknown Customer"
                    )}
                </h3>

                <p>
                    ${escapeOrderHTML(
                        customer.email || "No email"
                    )}
                </p>

                <p>
                    ${escapeOrderHTML(
                        customer.phone || "No phone number"
                    )}
                </p>

            </div>


            <div class="admin-order-detail-section">

                <p class="admin-eyebrow">
                    ORDER
                </p>

                <h3>
                    #${escapeOrderHTML(
                        String(order._id || "")
                            .slice(-8)
                            .toUpperCase()
                    )}
                </h3>

                <p>
                    ${escapeOrderHTML(orderDate)}
                </p>

            </div>


            <div class="admin-order-detail-section admin-order-status-editor">

                <p class="admin-eyebrow">
                    ORDER STATUS
                </p>

                <select
                    id="adminOrderDetailStatus"
                    class="admin-filter-select"
                >
                    ${createOrderStatusOptions(
                        order.status || "pending"
                    )}
                </select>

            </div>


            <div class="admin-order-detail-section admin-order-status-editor">

                <p class="admin-eyebrow">
                    PAYMENT STATUS
                </p>

                <select
                    id="adminOrderDetailPaymentStatus"
                    class="admin-filter-select"
                >
                    ${createPaymentStatusOptions(
                        order.paymentStatus || "pending"
                    )}
                </select>

            </div>

        </div>


        <div class="admin-order-detail-section">

            <p class="admin-eyebrow">
                ITEMS
            </p>

            <div class="admin-order-items">

                ${
                    items.length
                        ? items.map(createAdminOrderItemHTML).join("")
                        : `<p>No items found.</p>`
                }

            </div>

        </div>


        <div class="admin-order-detail-section">

            <p class="admin-eyebrow">
                SHIPPING ADDRESS
            </p>

            <div class="admin-order-shipping">

                <strong>
                    ${escapeOrderHTML(
                        shipping.fullName || customer.name || "Unknown"
                    )}
                </strong>

                <span>
                    ${escapeOrderHTML(
                        shipping.phone || "No phone number"
                    )}
                </span>

                <span>
                    ${escapeOrderHTML(
                        shipping.addressLine || "No address"
                    )}
                </span>

                <span>
                    ${escapeOrderHTML(
                        [
                            shipping.city,
                            shipping.state,
                            shipping.country
                        ]
                            .filter(Boolean)
                            .join(", ")
                    )}
                </span>

            </div>

        </div>


        <div class="admin-order-detail-total">

            <span>
                Total
            </span>

            <strong>
                ₦${totalAmount.toLocaleString()}
            </strong>

        </div>


        <div class="admin-order-detail-actions">

            <p
                id="adminOrderUpdateMessage"
                class="admin-form-message"
                aria-live="polite"
            ></p>

            <button
                type="button"
                class="btn btn-primary"
                id="saveAdminOrderChanges"
            >
                Save Changes
            </button>

        </div>
    `;

}


function createOrderStatusOptions(currentStatus) {

    const statuses = [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled"
    ];

    return statuses.map(function (status) {

        return `
            <option
                value="${status}"
                ${status === currentStatus ? "selected" : ""}
            >
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
        `;

    }).join("");

}


function createPaymentStatusOptions(currentStatus) {

    const statuses = [
        "pending",
        "paid",
        "failed",
        "refunded"
    ];

    return statuses.map(function (status) {

        return `
            <option
                value="${status}"
                ${status === currentStatus ? "selected" : ""}
            >
                ${status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
        `;

    }).join("");

}


function createAdminOrderItemHTML(item) {

    const quantity =
        Number(item.quantity || 0);

    const price =
        Number(item.price || 0);

    const subtotal =
        Number(item.subtotal || price * quantity);

    return `
        <div class="admin-order-item">

            <div>

                <strong>
                    ${escapeOrderHTML(
                        item.name || "Product"
                    )}
                </strong>

                <span>
                    ${quantity} ×
                    ₦${price.toLocaleString()}
                </span>

            </div>

            <strong>
                ₦${subtotal.toLocaleString()}
            </strong>

        </div>
    `;

}


/* =========================================
   CLOSE ORDER DETAILS MODAL
========================================= */

function closeAdminOrderDetails() {

    const modal =
        document.getElementById("orderDetailsModal");

    if (!modal) return;

    modal.hidden = true;

    currentAdminOrder = null;

}


document.addEventListener("click", function (event) {

    if (
        event.target.closest(
            "#closeOrderDetailsModal"
        ) ||
        event.target.closest(
            "#orderDetailsModalOverlay"
        )
    ) {

        closeAdminOrderDetails();

    }

});


/* =========================================
   SAVE ORDER CHANGES
========================================= */

document.addEventListener("click", async function (event) {

    const button =
        event.target.closest(
            "#saveAdminOrderChanges"
        );

    if (!button || !currentAdminOrder) return;

    const statusSelect =
        document.getElementById(
            "adminOrderDetailStatus"
        );

    const paymentSelect =
        document.getElementById(
            "adminOrderDetailPaymentStatus"
        );

    const message =
        document.getElementById(
            "adminOrderUpdateMessage"
        );

    if (!statusSelect || !paymentSelect) return;

    button.disabled = true;

    if (message) {

        message.textContent =
            "Saving changes...";

    }

    try {

        const response =
            await fetch(
                `${ORDERS_API_URL}/admin/${encodeURIComponent(currentAdminOrder._id)}`,
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "Accept": "application/json"
                    },
                    body: JSON.stringify({
                        status: statusSelect.value,
                        paymentStatus:
                            paymentSelect.value
                    })
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to update order."
            );

        }

        currentAdminOrder =
            data.order || currentAdminOrder;

        if (message) {

            message.textContent =
                "Order updated successfully.";

        }

        await loadAdminOrders();

    } catch (error) {

        console.error(
            "Update admin order error:",
            error
        );

        if (message) {

            message.textContent =
                error.message ||
                "Unable to update order.";

        }

    } finally {

        button.disabled = false;

    }

});


window.openAdminOrderDetails =
    openAdminOrderDetails;

window.closeAdminOrderDetails =
    closeAdminOrderDetails;
