/* =========================================
   KOKOBEEDS MOBILE NAVIGATION
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const menuButton =
        document.getElementById("menuButton");

    const mobileNavigation =
        document.getElementById("mobileNavigation");


    if (!menuButton || !mobileNavigation) {
        return;
    }


    menuButton.addEventListener("click", function () {

        const isOpen =
            mobileNavigation.classList.toggle("open");


        menuButton.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );


        menuButton.setAttribute(
            "aria-label",
            isOpen
                ? "Close navigation menu"
                : "Open navigation menu"
        );


        const icon =
            menuButton.querySelector("i");


        if (icon) {

            icon.classList.toggle(
                "fa-bars",
                !isOpen
            );

            icon.classList.toggle(
                "fa-xmark",
                isOpen
            );

        }

    });


    /* ==============================
       CLOSE AFTER LINK CLICK
    ============================== */

    const navigationLinks =
        mobileNavigation.querySelectorAll("a");


    navigationLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function () {

                mobileNavigation.classList.remove(
                    "open"
                );


                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                menuButton.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );


                const icon =
                    menuButton.querySelector("i");


                if (icon) {

                    icon.classList.remove(
                        "fa-xmark"
                    );

                    icon.classList.add(
                        "fa-bars"
                    );

                }

            }
        );

    });


    /* ==============================
       CLOSE WHEN CLICKING OUTSIDE
    ============================== */

    document.addEventListener(
        "click",
        function (event) {

            if (
                !mobileNavigation.contains(event.target) &&
                !menuButton.contains(event.target)
            ) {

                mobileNavigation.classList.remove(
                    "open"
                );


                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                menuButton.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );


                const icon =
                    menuButton.querySelector("i");


                if (icon) {

                    icon.classList.remove(
                        "fa-xmark"
                    );

                    icon.classList.add(
                        "fa-bars"
                    );

                }

            }

        }
    );

});