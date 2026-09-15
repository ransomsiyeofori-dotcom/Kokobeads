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
