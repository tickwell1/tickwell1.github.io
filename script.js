const timer = document.querySelector(".timer");

const buttons = document.querySelector(".buttons");

const startButton =
    document.querySelector(".start");

const resetButton =
    document.querySelector(".reset");

const themeButton =
    document.querySelector(".thems");

const fullscreenButton =
    document.querySelector(".fall");


let seconds = 0;
let interval = null;

/* الحالة المحفوظة */
let elapsed = 0;      // الوقت المتراكم (بالميلي ثانية) قبل آخر تشغيل
let startTime = 0;    // لحظة آخر تشغيل
let running = false;


function saveState() {
    try {
        localStorage.setItem("timerState", JSON.stringify({
            elapsed,
            startTime,
            running
        }));
    } catch (e) {}
}


/* ========================= */
/* منع قفل الشاشة أثناء العد */
/* ========================= */

let wakeLock = null;

async function requestWakeLock() {
    try {
        if ("wakeLock" in navigator && !wakeLock) {
            wakeLock = await navigator.wakeLock.request("screen");

            wakeLock.addEventListener("release", () => {
                wakeLock = null;
            });
        }
    } catch (e) {
        console.log("Wake Lock error:", e);
    }
}

async function releaseWakeLock() {
    try {
        if (wakeLock) {
            await wakeLock.release();
            wakeLock = null;
        }
    } catch (e) {}
}

/* لو المتصفح فك القفل (مثلاً لما تخرج من التاب)، نرجّعه تاني عند الرجوع */
document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && running) {
        requestWakeLock();
    }
});


function updateTimer() {

    const hours = String(
        Math.floor(seconds / 3600)
    ).padStart(2, "0");

    const minutes = String(
        Math.floor((seconds % 3600) / 60)
    ).padStart(2, "0");

    const secs = String(
        seconds % 60
    ).padStart(2, "0");

    timer.textContent =
        `${hours}:${minutes}:${secs}`;
}


function tick() {
    seconds = Math.floor((elapsed + Date.now() - startTime) / 1000);
    updateTimer();
}


function startTimer() {
    running = true;
    startTime = Date.now();
    interval = setInterval(tick, 250);
    startButton.textContent = "إيقاف";
    buttons.classList.add("running");
    requestWakeLock();
    saveState();
}


function stopTimer() {
    clearInterval(interval);
    interval = null;
    elapsed += Date.now() - startTime;
    running = false;
    startButton.textContent = "ابدأ";
    buttons.classList.remove("running");
    releaseWakeLock();
    saveState();
}


startButton.addEventListener("click", () => {
    if (running) {
        stopTimer();
    } else {
        startTimer();
    }
});


resetButton.addEventListener("click", () => {
    clearInterval(interval);
    interval = null;
    running = false;
    elapsed = 0;
    startTime = 0;
    seconds = 0;
    updateTimer();
    startButton.textContent = "ابدأ";
    buttons.classList.remove("running");
    releaseWakeLock();
    saveState();
});


/* استرجاع الحالة عند فتح الصفحة */
try {
    const saved = JSON.parse(localStorage.getItem("timerState"));

    if (saved) {
        elapsed = saved.elapsed || 0;
        startTime = saved.startTime || 0;

        if (saved.running) {
            running = true;
            tick();
            interval = setInterval(tick, 250);
            startButton.textContent = "إيقاف";
            buttons.classList.add("running");
            requestWakeLock();
        } else {
            seconds = Math.floor(elapsed / 1000);
            updateTimer();
        }
    }
} catch (e) {}


/* ========================= */
/* تغيير الوضع */
/* ========================= */

function setTheme(theme) {

    if (theme === "light") {

        document.body.classList.add(
            "light-mode"
        );

        themeButton.textContent =
            "🌙";

    } else {

        document.body.classList.remove(
            "light-mode"
        );

        themeButton.textContent =
            "☀️";

    }

}


/* قراءة الوضع المحفوظ */

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "light") {

    setTheme("light");

} else {

    setTheme("dark");

}


/* زر تغيير الوضع */

themeButton.addEventListener("click", () => {

    const isLight =
        document.body.classList.contains(
            "light-mode"
        );


    if (isLight) {

        setTheme("dark");

        localStorage.setItem(
            "theme",
            "dark"
        );

    } else {

        setTheme("light");

        localStorage.setItem(
            "theme",
            "light"
        );

    }

});


/* ========================= */
/* Fullscreen */
/* ========================= */

fullscreenButton.addEventListener(
    "click",
    async () => {

        try {

            if (!document.fullscreenElement) {

                await document.documentElement.requestFullscreen();

                document.body.classList.add(
                    "fullscreen-mode"
                );

            } else {

                await document.exitFullscreen();

            }

        } catch (error) {

            console.log(
                "Fullscreen error:",
                error
            );

        }

    }
);


/* ========================= */
/* مراقبة الدخول والخروج من Fullscreen */
/* ========================= */

document.addEventListener(
    "fullscreenchange",
    () => {

        if (document.fullscreenElement) {

            document.body.classList.add(
                "fullscreen-mode"
            );

        } else {

            document.body.classList.remove(
                "fullscreen-mode"
            );

        }

    }
);


/* ========================= */
/* Tickwell Navigation Menu */
/* ========================= */

const menuContainer =
    document.querySelector(
        ".menu-container"
    );

const menuButton =
    document.getElementById(
        "menuButton"
    );

const dropdownMenu =
    document.getElementById(
        "dropdownMenu"
    );


menuButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        const isOpen =
            menuContainer.classList.toggle(
                "open"
            );

        menuButton.setAttribute(
            "aria-expanded",
            isOpen
        );

    }
);


document.addEventListener(
    "click",
    (event) => {

        if (
            !menuContainer.contains(
                event.target
            )
        ) {

            menuContainer.classList.remove(
                "open"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);


document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            menuContainer.classList.remove(
                "open"
            );

            menuButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    }
);