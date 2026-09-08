// =========================================
// KOKOBEADS PROFILE
// =========================================

const API_BASE_URL =
    window.KOKOBEEDS_API_URL ||
    "https://kokobeads-api.onrender.com/api";


// =========================================
// DOM READY
// =========================================

document.addEventListener("DOMContentLoaded", () => {

    initializeProfile();

});


// =========================================
// INITIALIZE PROFILE
// =========================================

async function initializeProfile() {

    try {

        const user = await getCurrentUser();

        if (!user) {

            redirectToLogin();

            return;
        }

        renderUserProfile(user);

        initializeProfileActions();

    } catch (error) {

        console.error(
            "Profile initialization error:",
            error
        );

        showProfileMessage(
            "Unable to load your profile. Please try again.",
            "error"
        );

    }

}


// =========================================
// GET CURRENT USER
// =========================================

async function getCurrentUser() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/me`,
            {
                method: "GET",
                credentials: "include",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {

            return null;

        }

        return data.user;

    } catch (error) {

        console.error(
            "Unable to retrieve current user:",
            error
        );

        return null;

    }

}


// =========================================
// RENDER USER PROFILE
// =========================================

function renderUserProfile(user) {

    const name =
        user.name ||
        "Kokobeads Customer";

    const email =
        user.email ||
        "No email available";

    const role =
        user.role ||
        "customer";


    // -----------------------------------------
    // Name
    // -----------------------------------------

    updateElements(
        [
            "#welcomeUserName",
            "#profileName",
            "#headerUserName"
        ],
        name
    );


    // -----------------------------------------
    // Email
    // -----------------------------------------

    updateElements(
        [
            "#profileEmail"
        ],
        email
    );


    // -----------------------------------------
    // Role
    // -----------------------------------------

    updateElements(
        [
            "#profileRole"
        ],
        formatRole(role)
    );


    // -----------------------------------------
    // Avatar / Initials
    // -----------------------------------------

    const initials =
        getInitials(name);

    updateElements(
        [
            "#profileInitials",
            "#headerUserInitials"
        ],
        initials
    );


    // -----------------------------------------
    // Account Status
    // -----------------------------------------

    updateElements(
        [
            "#profileStatus"
        ],
        "Active"
    );

}


// =========================================
// UPDATE ELEMENTS
// =========================================

function updateElements(selectors, value) {

    selectors.forEach(selector => {

        const elements =
            document.querySelectorAll(selector);

        elements.forEach(element => {

            element.textContent = value;

        });

    });

}


// =========================================
// GET INITIALS
// =========================================

function getInitials(name) {

    const words =
        name
            .trim()
            .split(/\s+/)
            .filter(Boolean);

    if (!words.length) {

        return "K";

    }

    if (words.length === 1) {

        return words[0]
            .substring(0, 2)
            .toUpperCase();

    }

    return (
        words[0].charAt(0) +
        words[words.length - 1].charAt(0)
    ).toUpperCase();

}


// =========================================
// FORMAT ROLE
// =========================================

function formatRole(role) {

    if (!role) {

        return "Customer";

    }

    return role
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, letter =>
            letter.toUpperCase()
        );

}


// =========================================
// PROFILE ACTIONS
// =========================================

function initializeProfileActions() {

    initializeLogout();

    initializeEditProfile();

    initializeSecurityButton();

}


// =========================================
// LOGOUT
// =========================================

function initializeLogout() {

    const logoutButtons =
        document.querySelectorAll(
            "#logoutButton, [data-action='logout']"
        );

    logoutButtons.forEach(button => {

        button.addEventListener(
            "click",
            handleLogout
        );

    });

}


// =========================================
// HANDLE LOGOUT
// =========================================

async function handleLogout(event) {

    event.preventDefault();

    const button =
        event.currentTarget;

    const originalContent =
        button.innerHTML;


    // Prevent double-click
    button.disabled = true;


    // Show spinner
    button.innerHTML = `
        <span
            class="logout-spinner"
            aria-hidden="true"
        ></span>

        <span>
            Logging out...
        </span>
    `;


    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/logout`,
            {
                method: "POST",
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
                "Logout failed."
            );

        }


        showProfileMessage(
            "Logout successful.",
            "success"
        );


        /*
         * Give the user a short moment
         * to see the success state.
         */

        setTimeout(() => {

            redirectToLogin();

        }, 700);


    } catch (error) {

        console.error(
            "Logout error:",
            error
        );


        showProfileMessage(
            error.message ||
            "Unable to logout. Please try again.",
            "error"
        );


        button.disabled = false;

        button.innerHTML =
            originalContent;

    }

}


// =========================================
// EDIT PROFILE
// =========================================

function initializeEditProfile() {

    const editButtons =
        document.querySelectorAll(
            "#editProfileButton, [data-action='edit-profile']"
        );


    editButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                /*
                 * Profile editing will be connected
                 * to the backend when the update
                 * profile endpoint is implemented.
                 */

                showProfileMessage(
                    "Profile editing will be available soon.",
                    "info"
                );

            }
        );

    });

}


// =========================================
// SECURITY BUTTON
// =========================================

function initializeSecurityButton() {

    const securityButtons =
        document.querySelectorAll(
            "#changePasswordButton, [data-action='security']"
        );


    securityButtons.forEach(button => {

        button.addEventListener(
            "click",
            event => {

                event.preventDefault();

                showProfileMessage(
                    "Your account is protected with secure authentication.",
                    "success"
                );

            }
        );

    });

}


// =========================================
// PROFILE MESSAGE
// =========================================

function showProfileMessage(
    message,
    type = "info"
) {

    const messageElements =
        document.querySelectorAll(
            "#profileMessage, [data-profile-message]"
        );


    messageElements.forEach(element => {

        element.textContent =
            message;

        element.className =
            `profile-message ${type}`;

    });

}


// =========================================
// REDIRECT TO LOGIN
// =========================================

function redirectToLogin() {

    window.location.href =
        "./login.html";

}


// =========================================
// PAGE VISIBILITY CHECK
// =========================================

document.addEventListener(
    "visibilitychange",
    async () => {

        if (
            document.visibilityState !==
            "visible"
        ) {
            return;
        }


        /*
         * Re-check authentication when
         * the user returns to the page.
         */

        const user =
            await getCurrentUser();


        if (!user) {

            redirectToLogin();

        }

    }
);