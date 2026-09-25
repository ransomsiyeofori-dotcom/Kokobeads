const API_BASE_URL =
    window.KOKOBEADS_API_URL ||
    "https://kokobeads-api.onrender.com/api";

const forgotPasswordForm =
    document.getElementById("forgotPasswordForm");

const forgotPasswordEmail =
    document.getElementById("forgotPasswordEmail");

const forgotPasswordMessage =
    document.getElementById("forgotPasswordMessage");

const forgotPasswordButton =
    document.getElementById("forgotPasswordButton");

function showForgotPasswordMessage(message, type = "error") {
    if (!forgotPasswordMessage) return;

    forgotPasswordMessage.textContent = message;
    forgotPasswordMessage.className =
        `forgot-password-message ${type}`;
}

function clearForgotPasswordMessage() {
    if (!forgotPasswordMessage) return;

    forgotPasswordMessage.textContent = "";
    forgotPasswordMessage.className =
        "forgot-password-message";
}

function setForgotPasswordLoading(isLoading) {
    if (!forgotPasswordButton) return;

    const buttonText =
        forgotPasswordButton.querySelector(
            ".forgot-password-button-text"
        );

    const spinner =
        forgotPasswordButton.querySelector(
            ".forgot-password-spinner"
        );

    if (isLoading) {
        forgotPasswordButton.disabled = true;
        forgotPasswordButton.classList.add("is-loading");
        forgotPasswordButton.setAttribute(
            "aria-busy",
            "true"
        );

        if (buttonText) {
            buttonText.textContent = "Sending...";
        }

        if (spinner) {
            spinner.hidden = false;
        }
    } else {
        forgotPasswordButton.disabled = false;
        forgotPasswordButton.classList.remove("is-loading");
        forgotPasswordButton.setAttribute(
            "aria-busy",
            "false"
        );

        if (buttonText) {
            buttonText.textContent = "Send Reset Link";
        }

        if (spinner) {
            spinner.hidden = true;
        }
    }
}

function validateForgotPasswordForm() {
    const email = forgotPasswordEmail
        ? forgotPasswordEmail.value.trim()
        : "";

    if (!email) {
        showForgotPasswordMessage(
            "Please enter your email address."
        );

        if (forgotPasswordEmail) {
            forgotPasswordEmail.focus();
        }

        return false;
    }

    if (!email.includes("@")) {
        showForgotPasswordMessage(
            "Please enter a valid email address."
        );

        if (forgotPasswordEmail) {
            forgotPasswordEmail.focus();
        }

        return false;
    }

    return true;
}

async function requestPasswordReset(event) {
    event.preventDefault();

    clearForgotPasswordMessage();

    if (!validateForgotPasswordForm()) {
        return;
    }

    const email =
        forgotPasswordEmail.value.trim();

    setForgotPasswordLoading(true);

    try {
        const response = await fetch(
            `${API_BASE_URL}/auth/forgot-password`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ email })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            showForgotPasswordMessage(
                data.message ||
                "Unable to send the reset link. Please try again."
            );

            setForgotPasswordLoading(false);
            return;
        }

        showForgotPasswordMessage(
            data.message ||
            "If an account exists with that email, a password reset link has been sent.",
            "success"
        );

        if (forgotPasswordEmail) {
            forgotPasswordEmail.value = "";
        }

        setForgotPasswordLoading(false);
    } catch (error) {
        console.error(
            "Forgot password error:",
            error
        );

        showForgotPasswordMessage(
            "Unable to connect to the server. Please try again."
        );

        setForgotPasswordLoading(false);
    }
}

if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener(
        "submit",
        requestPasswordReset
    );
}
