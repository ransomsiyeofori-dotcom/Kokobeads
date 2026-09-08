// =========================================
// KOKOBEADS LOGIN
// =========================================

const API_BASE_URL =
    window.KOKOBEADS_API_URL ||
    "https://kokobeads-api.onrender.com/api";


// =========================================
// ELEMENTS
// =========================================

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");


// =========================================
// SHOW MESSAGE
// =========================================

function showLoginMessage(message, type = "error") {

    if (!loginMessage) return;

    loginMessage.textContent = message;

    loginMessage.className =
        `auth-message ${type}`;

}


// =========================================
// CLEAR MESSAGE
// =========================================

function clearLoginMessage() {

    if (!loginMessage) return;

    loginMessage.textContent = "";

    loginMessage.className =
        "auth-message";

}


// =========================================
// SET LOADING STATE
// =========================================

function setLoginLoading(isLoading) {

    if (!loginButton) return;


    if (isLoading) {

        loginButton.disabled = true;

        loginButton.classList.add(
            "is-loading"
        );

        loginButton.setAttribute(
            "aria-busy",
            "true"
        );


        /*
         * Keep the original button text
         * but display the spinner.
         */

        const buttonText =
            loginButton.querySelector(
                ".login-button-text"
            );

        const spinner =
            loginButton.querySelector(
                ".login-spinner"
            );


        if (buttonText) {
            buttonText.textContent =
                "Signing in...";
        }


        if (spinner) {
            spinner.hidden = false;
        }


    } else {

        loginButton.disabled = false;

        loginButton.classList.remove(
            "is-loading"
        );

        loginButton.setAttribute(
            "aria-busy",
            "false"
        );


        const buttonText =
            loginButton.querySelector(
                ".login-button-text"
            );

        const spinner =
            loginButton.querySelector(
                ".login-spinner"
            );


        if (buttonText) {
            buttonText.textContent =
                "Log In";
        }


        if (spinner) {
            spinner.hidden = true;
        }

    }

}


// =========================================
// VALIDATE FORM
// =========================================

function validateLoginForm() {

    const email =
        loginEmail
            ? loginEmail.value.trim()
            : "";

    const password =
        loginPassword
            ? loginPassword.value
            : "";


    if (!email) {

        showLoginMessage(
            "Please enter your email address."
        );

        loginEmail?.focus();

        return false;
    }


    if (!email.includes("@")) {

        showLoginMessage(
            "Please enter a valid email address."
        );

        loginEmail?.focus();

        return false;
    }


    if (!password) {

        showLoginMessage(
            "Please enter your password."
        );

        loginPassword?.focus();

        return false;
    }


    return true;

}


// =========================================
// LOGIN
// =========================================

async function loginUser(event) {

    event.preventDefault();

    clearLoginMessage();


    if (!validateLoginForm()) {
        return;
    }


    const email =
        loginEmail.value.trim();

    const password =
        loginPassword.value;


    setLoginLoading(true);


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );


        const data =
            await response.json();


        // =====================================
        // LOGIN FAILED
        // =====================================

        if (!response.ok || !data.success) {

            showLoginMessage(
                data.message ||
                "Unable to log in. Please check your details."
            );

            setLoginLoading(false);

            return;
        }


        // =====================================
        // LOGIN SUCCESSFUL
        // =====================================

        showLoginMessage(
            "Login successful. Welcome back!",
            "success"
        );


        /*
         * The backend has already set the
         * authentication cookie.
         *
         * We intentionally do NOT store
         * the JWT in localStorage.
         */


        // Give the success message a moment
        // before redirecting.

        setTimeout(
            function () {

                if (data.user && data.user.role === "admin") {
                    window.location.href = "./admin.html";
                } else {
                    window.location.href = "./profile.html";
                }

            },
            700
        );


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        showLoginMessage(
            "Unable to connect to the server. Please try again."
        );


        setLoginLoading(false);

    }

}


// =========================================
// FORM EVENT
// =========================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        loginUser
    );

}


// =========================================
// PASSWORD TOGGLE
// =========================================

document
    .querySelectorAll(".password-toggle")
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const targetId =
                        button.dataset.target;

                    const passwordInput =
                        document.getElementById(
                            targetId
                        );


                    if (!passwordInput) {
                        return;
                    }


                    const isPassword =
                        passwordInput.type ===
                        "password";


                    passwordInput.type =
                        isPassword
                            ? "text"
                            : "password";


                    button.setAttribute(
                        "aria-label",
                        isPassword
                            ? "Hide password"
                            : "Show password"
                    );


                    button.classList.toggle(
                        "is-visible",
                        isPassword
                    );

                }
            );

        }
    );


