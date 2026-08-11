/* ================= PAGE ROUTER ================= */

async function loadPage(url) {

    try {

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Page could not be loaded");
        }

        const html = await response.text();

        const parser = new DOMParser();

        const newDocument =
            parser.parseFromString(html, "text/html");

        /*
         * Keep the persistent music player.
         */
        const musicPlayer =
            document.getElementById("musicPlayer");

        const persistentAudio =
        document.getElementById("persistentAudio");

        /*
         * Get the new page's body content.
         */
        const newContent =
            Array.from(newDocument.body.children)
                .filter(element => element.id !== "musicPlayer");

        /*
         * Remove the current page content,
         * but keep the music player.
         */
        Array.from(document.body.children).forEach(element => {

            if (element.id !== "musicPlayer") {
                element.remove();
            }

        });

        /*
         * Add the new page content.
         */
        newContent.forEach(element => {
            document.body.appendChild(element);
        });

        /*
         * Update browser URL.
         */
        history.pushState({}, "", url);

        /*
         * Go to top.
         */
        window.scrollTo(0, 0);

        /*
         * Refresh AOS animations.
         */
        if (typeof AOS !== "undefined") {
            AOS.refreshHard();
        }

        /*
         * Reconnect page buttons.
         */
        setupNavigation();

    } catch (error) {

        console.error("Page loading error:", error);

        /*
         * If something fails, use normal navigation.
         */
        window.location.href = url;
    }
}


/* ================= NAVIGATION ================= */

function setupNavigation() {

    const links =
        document.querySelectorAll("a[href$='.html']");

    links.forEach(link => {

        /*
         * Prevent adding the same event repeatedly.
         */
        if (link.dataset.routerReady === "true") {
            return;
        }

        link.dataset.routerReady = "true";

        link.addEventListener("click", function (event) {

            const url =
                this.getAttribute("href");

            if (!url || url.startsWith("#")) {
                return;
            }

            event.preventDefault();

            loadPage(url);

        });

    });


    /*
     * Handle buttons such as:
     *
     * onclick="location.href='gallery.html'"
     *
     */

    const buttons =
        document.querySelectorAll("button[onclick]");

    buttons.forEach(button => {

        if (button.dataset.routerReady === "true") {
            return;
        }

        const code =
            button.getAttribute("onclick");

        const match =
            code.match(/location\.href\s*=\s*['"]([^'"]+\.html)['"]/);

        if (!match) {
            return;
        }

        button.dataset.routerReady = "true";

        const url = match[1];

        button.removeAttribute("onclick");

        button.addEventListener("click", function () {

            loadPage(url);

        });

    });

}


/* ================= BACK / FORWARD ================= */

window.addEventListener("popstate", function () {

    loadPage(
        window.location.pathname.split("/").pop()
    );

});


/* ================= START ROUTER ================= */

document.addEventListener("DOMContentLoaded", function () {

    setupNavigation();

});

/* ================= PERSISTENT MUSIC ================= */

function playPersistentMusic(file) {

    const audio =
        document.getElementById("persistentAudio");

    if (!audio) return;

    if (audio.src !== new URL(file, window.location.href).href) {

        audio.src = file;

    }

    audio.play().catch(() => {});

}