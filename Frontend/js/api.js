/* =========================================
   KOKOBEADS — SHARED API CONFIGURATION
========================================= */

const KOKOBEADS_API_BASE_URL =
    window.KOKOBEEDS_API_URL ||
    "https://kokobeads-api.onrender.com/api";


/* =========================================
   API REQUEST
========================================= */

async function apiRequest(
    endpoint,
    options = {},
    config = {}
) {

    const timeout =
        config.timeout ?? 10000;


    const controller =
        new AbortController();


    const timeoutId =
        window.setTimeout(
            function () {
                controller.abort();
            },
            timeout
        );


    try {

        const response =
            await fetch(
                `${KOKOBEADS_API_BASE_URL}${endpoint}`,
                {
                    ...options,

                    credentials: "include",

                    headers: {

                        "Accept":
                            "application/json",

                        ...(options.body
                            ? {
                                "Content-Type":
                                    "application/json"
                            }
                            : {}),

                        ...(options.headers || {})

                    },

                    signal:
                        controller.signal
                }
            );


        window.clearTimeout(
            timeoutId
        );


        let data = null;


        const contentType =
            response.headers.get(
                "content-type"
            );


        if (
            contentType &&
            contentType.includes(
                "application/json"
            )
        ) {

            data =
                await response.json();

        } else {

            data =
                await response.text();

        }


        if (!response.ok) {

            throw new Error(
                data?.message ||
                `Request failed with status ${response.status}`
            );

        }


        return data;


    } catch (error) {

        window.clearTimeout(
            timeoutId
        );


        if (
            error.name ===
            "AbortError"
        ) {

            throw new Error(
                "Request timed out. Please try again."
            );

        }


        throw error;

    }

}

window.apiRequest = apiRequest;
