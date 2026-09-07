// =========================================
// KOKOBEEDS AUTHENTICATION
// =========================================

const API_BASE_URL =
    window.KOKOBEEDS_API_URL ||
    "https://kokobeads-api.onrender.com/api";


// =========================================
// GET CURRENT USER
// =========================================

async function getCurrentUser() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/me`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {
            return null;
        }

        return data.user;

    } catch (error) {

        console.error(
            "Unable to get current user:",
            error
        );

        return null;
    }
}


// =========================================
// LOGOUT
// =========================================

async function logoutUser() {

    try {

        const response =
            await fetch(
                `${API_BASE_URL}/auth/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );

        const data =
            await response.json();

        return data;

    } catch (error) {

        console.error(
            "Logout error:",
            error
        );

        return {
            success: false,
            message: "Unable to logout."
        };
    }
}

// =========================================
// TEMPORARY AUTH TEST
// =========================================

async function testAuthentication() {

    const user = await getCurrentUser();

    console.log(
        "Current Kokobeeds user:",
        user
    );

}