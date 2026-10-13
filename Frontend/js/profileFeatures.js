// =========================================
// KOKOBEADS CUSTOMER DASHBOARD FEATURES
// =========================================

(() => {
    "use strict";

    const API_BASE_URL =
        window.KOKOBEADS_API_URL ||
        "https://kokobeads-api.onrender.com/api";

    const CART_KEY = "kokobeads_cart";
    const WISHLIST_KEY = "kokobeads_wishlist";

    let currentUser = null;
    let profileModal = null;
    let passwordModal = null;
let messageTimer = null;


    // =====================================
    // INITIALIZE
    // =====================================

    document.addEventListener("DOMContentLoaded", () => {
        injectModalStyles();
        createProfileModal();
        createPasswordModal();
        initializeFeatureButtons();
        refreshDashboard();
    });


    // =====================================
    // API REQUEST HELPER
    // =====================================

    async function apiRequest(path, options = {}) {
        const response = await fetch(
            `${API_BASE_URL}${path}`,
            {
                credentials: "include",
                ...options,
                headers: {
                    Accept: "application/json",
                    ...(options.body
                        ? { "Content-Type": "application/json" }
                        : {}),
                    ...(options.headers || {})
                }
            }
        );

        let data = {};

        try {
            data = await response.json();
        } catch {
            throw new Error("The server returned an invalid response.");
        }

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "The request could not be completed."
            );
        }

        return data;
    }


    // =====================================
    // DASHBOARD REFRESH
    // =====================================

    async function refreshDashboard() {
        try {
            const data = await apiRequest("/auth/me");

            currentUser = data.user;

            if (currentUser) {
                renderCustomer(currentUser);
            }
        } catch (error) {
            console.error("Dashboard profile refresh:", error);
        }

        updateLocalStatistics();
        await updateOrderStatistics();
    }


    // =====================================
    // RENDER CUSTOMER
    // =====================================

    function renderCustomer(user) {
        const name = user.name || "Kokobeads Customer";
        const initials = getInitials(name);

        setText("#welcomeUserName", name);
        setText("#profileName", name);
        setText("#profileEmail", user.email || "");
        setText("#headerUserName", name);
        setText("#profileRole", formatRole(user.role || "customer"));
        setText("#profileStatus", "Active");

        renderAvatar(
            "#profileInitials",
            user.profileImage,
            initials
        );

        renderAvatar(
            "#headerUserInitials",
            user.profileImage,
            initials
        );
    }


    function renderAvatar(selector, imageUrl, initials) {
        document.querySelectorAll(selector).forEach(avatar => {
            avatar.replaceChildren();

            if (imageUrl) {
                const image = document.createElement("img");

                image.src = imageUrl;
                image.alt = "Profile photo";
                image.loading = "lazy";

                image.addEventListener("error", () => {
                    avatar.textContent = initials;
                }, { once: true });

                avatar.appendChild(image);
            } else {
                avatar.textContent = initials;
            }
        });
    }


    function setText(selector, value) {
        document.querySelectorAll(selector).forEach(element => {
            element.textContent = value;
        });
    }


    function getInitials(name) {
        const words = String(name)
            .trim()
            .split(/\s+/)
            .filter(Boolean);

        if (!words.length) return "K";

        if (words.length === 1) {
            return words[0].slice(0, 2).toUpperCase();
        }

        return (
            words[0][0] +
            words[words.length - 1][0]
        ).toUpperCase();
    }


    function formatRole(role) {
        return String(role)
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, letter => letter.toUpperCase());
    }


    // =====================================
    // PROFILE EDITING MODAL
    // =====================================

    function createProfileModal() {
        profileModal = createModal(
            "profileEditModal",
            "Edit Your Profile",
            `
                <form id="profileEditForm" class="customer-modal-form">
                    <label for="editCustomerName">Full name</label>

                    <input
                        id="editCustomerName"
                        name="name"
                        type="text"
                        maxlength="100"
                        autocomplete="name"
                        required
                    >

                    <label for="editCustomerPhoto">Profile photo</label>

                    <input
                        id="editCustomerPhoto"
                        name="photo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                    >

                    <small>
                        JPG, PNG, or WebP. Maximum size: 5 MB.
                    </small>

                    <div id="profileUploadStatus" role="status"></div>

                    <div class="profile-modal-actions">
                        <button type="button" data-close-modal>
                            Cancel
                        </button>

                        <button type="submit" id="saveCustomerProfile">
                            Save Changes
                        </button>
                    </div>
                </form>
            `
        );

        document
            .getElementById("profileEditForm")
            .addEventListener("submit", saveCustomerProfile);
    }


    // =====================================
    // PASSWORD MODAL
    // =====================================

    function createPasswordModal() {
        passwordModal = createModal(
            "passwordChangeModal",
            "Change Your Password",
            `
                <form id="passwordChangeForm" class="customer-modal-form">
                    <label for="currentCustomerPassword">
                        Current password
                    </label>

                    <input
                        id="currentCustomerPassword"
                        name="currentPassword"
                        type="password"
                        autocomplete="current-password"
                        required
                    >

                    <label for="newCustomerPassword">
                        New password
                    </label>

                    <input
                        id="newCustomerPassword"
                        name="newPassword"
                        type="password"
                        minlength="8"
                        autocomplete="new-password"
                        required
                    >

                    <label for="confirmCustomerPassword">
                        Confirm new password
                    </label>

                    <input
                        id="confirmCustomerPassword"
                        name="confirmPassword"
                        type="password"
                        minlength="8"
                        autocomplete="new-password"
                        required
                    >

                    <div class="profile-modal-actions">
                        <button type="button" data-close-modal>
                            Cancel
                        </button>

                        <button type="submit" id="saveCustomerPassword">
                            Update Password
                        </button>
                    </div>
                </form>
            `
        );

        document
            .getElementById("passwordChangeForm")
            .addEventListener("submit", changeCustomerPassword);
    }


    // =====================================
    // CREATE MODAL
    // =====================================

    function createModal(id, title, content) {
        const overlay = document.createElement("div");

               overlay.id = id;
        overlay.className = "customer-modal-overlay";
        overlay.hidden = true;

        overlay.innerHTML = `
            <section class="customer-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="${id}Title">

                <button type="button"
                    class="customer-modal-close"
                    aria-label="Close dialog"
                    data-close-modal>×</button>

                <h2 id="${id}Title">${title}</h2>

                <p class="customer-modal-message"
                    role="status"
                    aria-live="polite"></p>

                ${content}
            </section>
        `;

        document.body.appendChild(overlay);

        overlay.querySelectorAll("[data-close-modal]").forEach(button => {
            button.addEventListener("click", () => closeModal(overlay));
        });

        overlay.addEventListener("click", event => {
            if (event.target === overlay) closeModal(overlay);
        });

        return overlay;
    }

    function openModal(modal) {
        if (!modal) return;

        modal.hidden = false;
        document.body.classList.add("customer-modal-open");

        const input = modal.querySelector("input");
        if (input) input.focus();
    }

    function closeModal(modal) {
        if (!modal) return;

        modal.hidden = true;

        if (
            (!profileModal || profileModal.hidden) &&
            (!passwordModal || passwordModal.hidden)
        ) {
            document.body.classList.remove("customer-modal-open");
        }
    }

    function setModalMessage(modal, message, isError = false) {
        const element = modal.querySelector(".customer-modal-message");

        element.textContent = message;
        element.classList.toggle("error", isError);
    }


    // =====================================
    // PROFILE BUTTONS
    // =====================================

    function initializeFeatureButtons() {
        const editButton = document.getElementById("editProfileButton");
        const securityButton = document.getElementById("changePasswordButton");

        if (editButton) {
            editButton.addEventListener("click", function (event) {
                event.stopImmediatePropagation();

                if (!currentUser) {
                    showDashboardMessage("Please log in again.", true);
                    return;
                }

                const nameInput = document.getElementById("editCustomerName");
                const imageInput = document.getElementById("editCustomerPhoto");

                if (nameInput) nameInput.value = currentUser.name || "";
                if (imageInput) imageInput.value = "";

                setModalMessage(profileModal, "");
                openModal(profileModal);
            });
        }

        if (securityButton) {
            securityButton.addEventListener("click", function (event) {
                event.stopImmediatePropagation();

                const form = document.getElementById("passwordChangeForm");
                if (form) form.reset();

                setModalMessage(passwordModal, "");
                openModal(passwordModal);
            });
        }

        const settingsButton = document.getElementById("accountSettingsButton");

        if (settingsButton) {
            settingsButton.addEventListener("click", function () {
                if (profileModal) {
                    const nameInput = document.getElementById("editCustomerName");
                    if (nameInput && currentUser) {
                        nameInput.value = currentUser.name || "";
                    }

                    setModalMessage(profileModal, "");
                    openModal(profileModal);
                }
            });
        }
    }

    // =====================================
    // SAVE PROFILE
    // =====================================

    async function saveCustomerProfile(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const submitButton = form.querySelector("[type='submit']");
        const nameInput = document.getElementById("editCustomerName");
        const imageInput = document.getElementById("editCustomerPhoto");

        const name = nameInput ? nameInput.value.trim() : "";
        const file = imageInput && imageInput.files
            ? imageInput.files[0]
            : null;

        if (!name) {
            setModalMessage(profileModal, "Please enter your name.", true);
            return;
        }

        if (name.length > 100) {
            setModalMessage(profileModal, "Your name must be 100 characters or fewer.", true);
            return;
        }

        if (file) {
            const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

            if (!allowedTypes.includes(file.type)) {
                setModalMessage(profileModal, "Choose a JPG, PNG, or WebP image.", true);
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                setModalMessage(profileModal, "Your profile photo must be 5 MB or smaller.", true);
                return;
            }
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Saving...";
        }

        try {
            let profileImage = currentUser.profileImage || "";

            if (file) {
                profileImage = await uploadProfilePhoto(file);
            }

            const result = await apiRequest("/auth/profile", {
                method: "PUT",
                body: JSON.stringify({
                    name,
                    profileImage
                })
            });

            if (!result.success || !result.user) {
                throw new Error(result.message || "Could not update your profile.");
            }

            currentUser = result.user;
            renderCustomer(currentUser);
            setModalMessage(profileModal, "Profile updated successfully.");

            showDashboardMessage("Your profile has been updated.");

            window.setTimeout(function () {
                closeModal(profileModal);
            }, 900);
        } catch (error) {
            setModalMessage(
                profileModal,
                error.message || "Unable to save your profile. Please try again.",
                true
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Save Changes";
            }
        }
    }


    // =====================================
    // PROFILE PHOTO UPLOAD
    // =====================================

    async function uploadProfilePhoto(file) {
        const signatureResult = await apiRequest("/uploads/profile-signature", {
            method: "POST"
        });

        if (!signatureResult.success) {
            throw new Error(
                signatureResult.message || "Unable to prepare your photo upload."
            );
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("api_key", signatureResult.apiKey);
        formData.append("timestamp", String(signatureResult.timestamp));
        formData.append("folder", signatureResult.folder);
        formData.append("signature", signatureResult.signature);

        const uploadResponse = await fetch(
            "https://api.cloudinary.com/v1_1/" +
                encodeURIComponent(signatureResult.cloudName) +
                "/image/upload",
            {
                method: "POST",
                body: formData
            }
        );

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.secure_url) {
            throw new Error(
                uploadResult.error?.message || "Profile photo upload failed."
            );
        }

        return uploadResult.secure_url;
    }

    // =====================================
    // CHANGE PASSWORD
    // =====================================

    async function changeCustomerPassword(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const currentPassword = document.getElementById("currentCustomerPassword").value;
        const newPassword = document.getElementById("newCustomerPassword").value;
        const confirmPassword = document.getElementById("confirmCustomerPassword").value;
        const submitButton = form.querySelector("[type='submit']");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setModalMessage(passwordModal, "Please complete all password fields.", true);
            return;
        }

        if (newPassword.length < 8) {
            setModalMessage(passwordModal, "Your new password must contain at least 8 characters.", true);
            return;
        }

        if (newPassword !== confirmPassword) {
            setModalMessage(passwordModal, "The new passwords do not match.", true);
            return;
        }

        if (currentPassword === newPassword) {
            setModalMessage(passwordModal, "Choose a password different from your current one.", true);
            return;
        }

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Updating...";
        }

        try {
            const result = await apiRequest("/auth/change-password", {
                method: "PUT",
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            if (!result.success) {
                throw new Error(result.message || "Unable to change your password.");
            }

            form.reset();
            setModalMessage(passwordModal, "Password changed successfully.");
            showDashboardMessage("Your password has been changed.");

            window.setTimeout(function () {
                closeModal(passwordModal);
            }, 1000);
        } catch (error) {
            setModalMessage(
                passwordModal,
                error.message || "Unable to change your password. Please try again.",
                true
            );
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Update Password";
            }
        }
    }


    // =====================================
    // DASHBOARD STATISTICS
    // =====================================

    function updateLocalStatistics() {
        let cart = [];
        let wishlist = [];

        try {
            cart = JSON.parse(localStorage.getItem("kokobeads_cart") || "[]");
            wishlist = JSON.parse(localStorage.getItem("kokobeads_wishlist") || "[]");

            if (!Array.isArray(cart)) cart = [];
            if (!Array.isArray(wishlist)) wishlist = [];
        } catch (error) {
            console.error("Unable to read local shopping statistics:", error);
        }

        const cartCount = cart.reduce(function (total, item) {
            const quantity = Number(item.quantity) || 0;
            return total + Math.max(0, quantity);
        }, 0);

        const wishlistCount = wishlist.length;

        setText(["cartCount", "profileCartCount", "mobileCartCount"], cartCount);
        setText(
            ["wishlistCount", "profileWishlistCount", "mobileWishlistCount"],
            wishlistCount
        );
    }

    function setText(target, value) {
        if (Array.isArray(target)) {
            target.forEach(function (id) {
                const element = document.getElementById(id);
                if (element) element.textContent = String(value);
            });
            return;
        }

        if (typeof target === "string") {
            document.querySelectorAll(target).forEach(function (element) {
                element.textContent = String(value);
            });
        }
    }
    async function updateOrderStatistics() {
        const orderCountElement = document.getElementById("ordersCount");
        if (!orderCountElement) return;

        try {
            const result = await apiRequest("/orders/my-orders", {
                method: "GET"
            });

            if (result.success && Array.isArray(result.orders)) {
                orderCountElement.textContent = String(result.orders.length);
            }
        } catch (error) {
            console.error("Unable to load order statistics:", error);
        }
    }

    function showDashboardMessage(message, isError = false) {
        const element = document.getElementById("profileMessage");

        if (!element) return;

        element.textContent = message;
        element.classList.toggle("error", isError);
        element.hidden = false;

        window.clearTimeout(messageTimer);

        messageTimer = window.setTimeout(function () {
            element.textContent = "";
            element.hidden = true;
            element.classList.remove("error");
        }, 4500);
    }


    // =====================================
    // MODAL STYLES
    // =====================================

    function injectModalStyles() {
        if (document.getElementById("customerModalStyles")) return;

        const style = document.createElement("style");
        style.id = "customerModalStyles";

        style.textContent = `
            .customer-modal-overlay {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 18px;
                background: rgba(0, 0, 0, .68);
                overflow-y: auto;
            }

            .customer-modal-overlay[hidden] {
                display: none !important;
            }

            .customer-modal {
                position: relative;
                width: 100%;
                max-width: 480px;
                max-height: 90vh;
                overflow-y: auto;
                padding: 28px 22px;
                border-radius: 18px;
                background: #fff;
                color: #171717;
                box-shadow: 0 20px 70px rgba(0, 0, 0, .25);
            }

            .customer-modal h2 {
                margin: 0 35px 20px 0;
                font-size: 1.45rem;
            }

            .customer-modal-close {
                position: absolute;
                top: 12px;
                right: 14px;
                width: 36px;
                height: 36px;
                border: 0;
                border-radius: 50%;
                background: #f1f1f1;
                color: #171717;
                font-size: 25px;
                cursor: pointer;
            }

            .customer-modal-form {
                display: grid;
                gap: 15px;
            }

            .customer-modal-form label {
                display: grid;
                gap: 7px;
                font-weight: 600;
                font-size: .92rem;
            }

            .customer-modal-form input {
                width: 100%;
                min-height: 44px;
                padding: 10px 12px;
                border: 1px solid #d4d4d4;
                border-radius: 9px;
                background: #fff;
                color: #171717;
                font: inherit;
            }

            .customer-modal-form input:focus {
                outline: 2px solid #2563eb;
                outline-offset: 1px;
            }

            .customer-modal-form button[type="submit"] {
                min-height: 46px;
                padding: 12px 16px;
                border: 0;
                border-radius: 9px;
                background: #2563eb;
                color: #fff;
                font: inherit;
                font-weight: 700;
                cursor: pointer;
            }

            .customer-modal-form button:disabled {
                opacity: .65;
                cursor: wait;
            }

            .customer-modal-message {
                margin: 0 0 14px;
                color: #15803d;
                font-size: .9rem;
            }

            .customer-modal-message:empty {
                display: none;
            }

            .customer-modal-message.error,
            #profileMessage.error {
                color: #dc2626;
            }

            body.customer-modal-open {
                overflow: hidden;
            }

            .profile-hero-avatar img,
            #headerUserInitials img {
                display: block;
                width: 100%;
                height: 100%;
                border-radius: inherit;
                object-fit: cover;
            }

            @media (max-width: 480px) {
                .customer-modal {
                    padding: 24px 17px;
                }
            }
        `;

        document.head.appendChild(style);
    }


})();
