const API_BASE_URL =
    window.KOKOBEADS_API_URL ||
    "https://kokobeads-api.onrender.com/api";

const resetPasswordForm =
    document.getElementById("resetPasswordForm");

const resetPassword =
    document.getElementById("resetPassword");

const resetPasswordConfirm =
    document.getElementById("resetPasswordConfirm");

const resetPasswordMessage =
    document.getElementById("resetPasswordMessage");

const resetPasswordButton =
    document.getElementById("resetPasswordButton");

const resetPasswordToggle =
    document.getElementById("resetPasswordToggle");

const resetPasswordConfirmToggle =
    document.getElementById("resetPasswordConfirmToggle");


function showResetPasswordMessage(
    message,
    type = "error"
) {

    if (!resetPasswordMessage) return;

    resetPasswordMessage.textContent = message;

    resetPasswordMessage.className =
        `forgot-password-message ${type}`;
}


function clearResetPasswordMessage() {

    if (!resetPasswordMessage) return;

    resetPasswordMessage.textContent = "";

    resetPasswordMessage.className =
        "forgot-password-message";
}


function setResetPasswordLoading(isLoading) {

    if (!resetPasswordButton) return;

    const buttonText =
        resetPasswordButton.querySelector(
            ".reset-password-button-text"
        );

    const spinner =
        resetPasswordButton.querySelector(
            ".reset-password-spinner"
        );

    if (isLoading) {

        resetPasswordButton.disabled = true;

        resetPasswordButton.classList.add(
            "is-loading"
        );

        resetPasswordButton.setAttribute(
            "aria-busy",
            "true"
        );

        if (buttonText) {
            buttonText.textContent = "Resetting...";
        }

        if (spinner) {
            spinner.hidden = false;
        }

    } else {

        resetPasswordButton.disabled = false;

        resetPasswordButton.classList.remove(
            "is-loading"
        );

        resetPasswordButton.setAttribute(
            "aria-busy",
            "false"
        );

        if (buttonText) {
            buttonText.textContent = "Reset Password";
        }

        if (spinner) {
            spinner.hidden = true;
        }

    }
}


function getResetToken() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    return params.get("token");
}


function validateResetPasswordForm() {

    const password =
        resetPassword
            ? resetPassword.value
            : "";

    const confirmPassword =
        resetPasswordConfirm
            ? resetPasswordConfirm.value
            : "";

    if (!password) {

        showResetPasswordMessage(
            "Please enter your new password."
        );

        if (resetPassword) {
            resetPassword.focus();
        }

        return false;
    }


    if (password.length < 8) {

        showResetPasswordMessage(
            "Your password must be at least 8 characters long."
        );

        if (resetPassword) {
            resetPassword.focus();
        }

        return false;
    }


    if (!confirmPassword) {

        showResetPasswordMessage(
            "Please confirm your new password."
        );

        if (resetPasswordConfirm) {
            resetPasswordConfirm.focus();
        }

        return false;
    }


    if (password !== confirmPassword) {

        showResetPasswordMessage(
            "Passwords do not match."
        );

        if (resetPasswordConfirm) {
            resetPasswordConfirm.focus();
        }

        return false;
    }


    return true;
}


function togglePasswordVisibility(
    input,
    button
) {

    if (!input || !button) return;

    const isPassword =
        input.type === "password";

    input.type =
        isPassword
            ? "text"
            : "password";

    button.setAttribute(
        "aria-label",
        isPassword
            ? "Hide password"
            : "Show password"
    );

}


async function handleResetPassword(event) {

    event.preventDefault();

    clearResetPasswordMessage();


    const token =
        getResetToken();

    if (!token) {

        showResetPasswordMessage(
            "This password reset link is invalid or incomplete."
        );

        return;
    }


    if (!validateResetPasswordForm()) {
        return;
    }


    setResetPasswordLoading(true);


    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/reset-password`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    credentials: "include",

                    body: JSON.stringify({
                        token,
                        password:
                            resetPassword.value
                    })
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            showResetPasswordMessage(
                data.message ||
                "Unable to reset your password. Please try again."
            );

            setResetPasswordLoading(false);

            return;
        }


        showResetPasswordMessage(
            data.message ||
            "Your password has been reset successfully.",
            "success"
        );


        if (resetPasswordForm) {
            resetPasswordForm.reset();
        }


        setResetPasswordLoading(false);


        setTimeout(
            () => {
                window.location.href =
                    "./login.html";
            },
            1800
        );


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );

        showResetPasswordMessage(
            "Unable to connect to the server. Please try again."
        );

        setResetPasswordLoading(false);

    }

}


if (resetPasswordToggle) {

    resetPasswordToggle.addEventListener(
        "click",
        () => {
            togglePasswordVisibility(
                resetPassword,
                resetPasswordToggle
            );
        }
    );

}


if (resetPasswordConfirmToggle) {

    resetPasswordConfirmToggle.addEventListener(
        "click",
        () => {
            togglePasswordVisibility(
                resetPasswordConfirm,
                resetPasswordConfirmToggle
            );
        }
    );

}


if (resetPasswordForm) {

    resetPasswordForm.addEventListener(
        "submit",
        handleResetPassword
    );

}
