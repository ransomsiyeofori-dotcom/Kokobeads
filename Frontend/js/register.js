// =========================================
// KOKOBEEDS REGISTRATION
// =========================================

const API_BASE_URL =
    window.KOKOBEEDS_API_URL ||
    "http://localhost:5000/api";


// =========================================
// DOM ELEMENTS
// =========================================

const registerForm =
    document.getElementById("registerForm");

const registerName =
    document.getElementById("registerName");

const registerEmail =
    document.getElementById("registerEmail");

const registerPassword =
    document.getElementById("registerPassword");

const confirmPassword =
    document.getElementById("confirmPassword");

const termsAgreement =
    document.getElementById("termsAgreement");

const registerMessage =
    document.getElementById("registerMessage");

const registerButton =
    document.getElementById("registerButton");


// =========================================
// MESSAGE HANDLER
// =========================================

function showMessage(message, type = "error") {

    if (!registerMessage) return;

    registerMessage.textContent = message;

    registerMessage.className =
        `auth-message ${type}`;

}


// =========================================
// LOADING STATE
// =========================================

function setLoading(isLoading) {

    if (!registerButton) return;

    registerButton.disabled = isLoading;

    const buttonText =
        registerButton.querySelector("span");

    if (!buttonText) return;

    if (isLoading) {

        registerButton.dataset.originalText =
            buttonText.textContent;

        buttonText.textContent =
            "Creating Account...";

    } else {

        buttonText.textContent =
            registerButton.dataset.originalText ||
            "Create Account";

    }

}


// =========================================
// PASSWORD TOGGLE
// =========================================

function initializePasswordToggles() {

    const toggleButtons =
        document.querySelectorAll(
            ".password-toggle"
        );


    toggleButtons.forEach(button => {

        button.addEventListener(
            "click",
            function () {

                const targetId =
                    button.dataset.target;

                const input =
                    document.getElementById(targetId);

                if (!input) return;


                if (input.type === "password") {

                    input.type = "text";

                    button.setAttribute(
                        "aria-label",
                        "Hide password"
                    );

                    button.textContent = "◉";

                } else {

                    input.type = "password";

                    button.setAttribute(
                        "aria-label",
                        "Show password"
                    );

                    button.textContent = "◉";

                }

            }
        );

    });

}


// =========================================
// EMAIL VALIDATION
// =========================================

function isValidEmail(email) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}


// =========================================
// FORM SUBMISSION
// =========================================

async function handleRegistration(event) {

    event.preventDefault();

    showMessage("");


    // =========================================
    // GET VALUES
    // =========================================

    const name =
        registerName.value.trim();

    const email =
        registerEmail.value.trim();

    const password =
        registerPassword.value;

    const confirmPasswordValue =
        confirmPassword.value;


    // =========================================
    // VALIDATION
    // =========================================

    if (!name) {

        showMessage(
            "Please enter your full name."
        );

        registerName.focus();

        return;
    }


    if (!email) {

        showMessage(
            "Please enter your email address."
        );

        registerEmail.focus();

        return;
    }


    if (!isValidEmail(email)) {

        showMessage(
            "Please enter a valid email address."
        );

        registerEmail.focus();

        return;
    }


    if (password.length < 8) {

        showMessage(
            "Password must be at least 8 characters."
        );

        registerPassword.focus();

        return;
    }


    if (password !== confirmPasswordValue) {

        showMessage(
            "Passwords do not match."
        );

        confirmPassword.focus();

        return;
    }


    if (!termsAgreement.checked) {

        showMessage(
            "Please agree to the Terms & Conditions and Privacy Policy."
        );

        return;
    }


    // =========================================
    // START REQUEST
    // =========================================

    setLoading(true);


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/register`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );


        // =====================================
        // READ RESPONSE
        // =====================================

        let data;

        try {

            data =
                await response.json();

        } catch (error) {

            data = {
                success: false,
                message:
                    "The server returned an invalid response."
            };

        }


        // =====================================
        // HANDLE SERVER ERROR
        // =====================================

        if (!response.ok || !data.success) {

            showMessage(
                data.message ||
                "Unable to create your account."
            );

            return;
        }


        // =====================================
        // SUCCESS
        // =====================================

        showMessage(
            data.message ||
            "Account created successfully.",
            "success"
        );


        // Disable form after successful registration

        registerName.disabled = true;
        registerEmail.disabled = true;
        registerPassword.disabled = true;
        confirmPassword.disabled = true;
        termsAgreement.disabled = true;


        // =====================================
        // REDIRECT TO LOGIN
        // =====================================

        setTimeout(() => {

            window.location.href =
                "./login.html";

        }, 1500);


    } catch (error) {

        console.error(
            "Kokobeeds registration error:",
            error
        );


        showMessage(
            "Unable to connect to Kokobeeds. Please check that the server is running and try again."
        );


    } finally {

        setLoading(false);

    }

}


// =========================================
// INITIALIZE
// =========================================

if (registerForm) {

    registerForm.addEventListener(
        "submit",
        handleRegistration
    );

    initializePasswordToggles();

} else {

    console.error(
        "Kokobeeds: #registerForm was not found."
    );

}
