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
            mobileNavigation.classList.contains("open");

        mobileNavigation.classList.toggle(
            "open",
            !isOpen
        );

        menuButton.classList.toggle(
            "active",
            !isOpen
        );

        menuButton.setAttribute(
            "aria-expanded",
            String(!isOpen)
        );

        menuButton.setAttribute(
            "aria-label",
            !isOpen
                ? "Close menu"
                : "Open menu"
        );
    });

    mobileNavigation
        .querySelectorAll("a")
        .forEach(function (link) {

            link.addEventListener("click", function () {

                mobileNavigation.classList.remove("open");
                menuButton.classList.remove("active");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuButton.setAttribute(
                    "aria-label",
                    "Open menu"
                );
            });

        });

});
