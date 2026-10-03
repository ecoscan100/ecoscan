/* ==========================================
   ECOSCAN - SHARED JAVASCRIPT
========================================== */


/* ==========================================
   WAIT FOR PAGE
========================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {


        /* ======================================
           CURRENT YEAR
        ======================================= */

        const currentYear =
            document.getElementById("currentYear");


        if (currentYear) {

            currentYear.textContent =
                new Date().getFullYear();

        }



        /* ======================================
           MOBILE NAVIGATION
        ======================================= */

        const menuToggle =
            document.getElementById("menuToggle");

        const navLinks =
            document.getElementById("navLinks");


        if (menuToggle && navLinks) {


            menuToggle.addEventListener(
                "click",
                function () {

                    navLinks.classList.toggle(
                        "open"
                    );


                    document.body.classList.toggle(
                        "no-scroll",
                        navLinks.classList.contains(
                            "open"
                        )
                    );

                }
            );



            navLinks
                .querySelectorAll("a")
                .forEach(
                    function (link) {

                        link.addEventListener(
                            "click",
                            function () {

                                navLinks.classList.remove(
                                    "open"
                                );


                                document.body.classList.remove(
                                    "no-scroll"
                                );

                            }
                        );

                    }
                );

        }



        /* ======================================
           SCROLL REVEAL
        ======================================= */

        const revealElements =
            document.querySelectorAll(
                ".reveal"
            );


        if (
            revealElements.length > 0 &&
            "IntersectionObserver" in window
        ) {


            const revealObserver =
                new IntersectionObserver(
                    function (
                        entries,
                        observer
                    ) {


                        entries.forEach(
                            function (entry) {


                                if (
                                    entry.isIntersecting
                                ) {

                                    entry.target.classList.add(
                                        "animate-reveal"
                                    );


                                    observer.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );


                    },
                    {
                        threshold: 0.12,

                        rootMargin:
                            "0px 0px -40px 0px"
                    }
                );



            revealElements.forEach(
                function (element) {


                    /*
                       Jangan animasikan hero.
                       Hero langsung stabil saat
                       halaman pertama dibuka.
                    */

                    if (
                        element.closest(
                            ".about-hero"
                        )
                    ) {

                        return;

                    }


                    revealObserver.observe(
                        element
                    );

                }
            );

        }
        else {


            /*
               Fallback untuk browser
               yang tidak mendukung
               IntersectionObserver.
            */

            revealElements.forEach(
                function (element) {

                    if (
                        !element.closest(
                            ".about-hero"
                        )
                    ) {

                        element.classList.add(
                            "animate-reveal"
                        );

                    }

                }
            );

        }



        /* ======================================
           BACK TO TOP
        ======================================= */

        const backToTop =
            document.getElementById(
                "backToTop"
            );


        if (backToTop) {


            window.addEventListener(
                "scroll",
                function () {


                    if (
                        window.scrollY > 500
                    ) {

                        backToTop.classList.add(
                            "show"
                        );

                    }
                    else {

                        backToTop.classList.remove(
                            "show"
                        );

                    }

                }
            );



            backToTop.addEventListener(
                "click",
                function () {

                    window.scrollTo({

                        top: 0,

                        behavior: "smooth"

                    });

                }
            );

        }



        /* ======================================
           SMOOTH INTERNAL LINKS
        ======================================= */

        document
            .querySelectorAll(
                'a[href^="#"]'
            )
            .forEach(
                function (link) {


                    link.addEventListener(
                        "click",
                        function (event) {


                            const targetId =
                                this.getAttribute(
                                    "href"
                                );


                            if (
                                targetId &&
                                targetId !== "#"
                            ) {


                                const target =
                                    document.querySelector(
                                        targetId
                                    );


                                if (target) {

                                    event.preventDefault();


                                    target.scrollIntoView({

                                        behavior:
                                            "smooth",

                                        block:
                                            "start"

                                    });

                                }

                            }

                        }
                    );

                }
            );



    }
);