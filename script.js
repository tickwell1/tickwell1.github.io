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

const modeSwitch =
    document.getElementById("modeSwitch");

const modeButtons =
    document.querySelectorAll(".mode-btn");

const pomoInfo =
    document.getElementById("pomoInfo");

const pomoLabel =
    document.getElementById("pomoLabel");

const pomoDotsBox =
    document.getElementById("pomoDots");

const baseTitle = document.title;


/* ========================= */
/* إعدادات بومودورو (بالدقائق) */
/* ========================= */

const SETTINGS = window.TickwellSettings;

const T = (key, vars) => SETTINGS.t(key, vars);

const cfg = () => SETTINGS.get();

const POMODORO = {};

const PHASES = {
    focus: { ms: 0 },
    short: { ms: 0 },
    long:  { ms: 0 }
};


/* قراءة مدد بومودورو من الإعدادات */
function loadPomodoroConfig() {
    const p = cfg().pomo;

    POMODORO.focus = p.focus;
    POMODORO.short = p.short;
    POMODORO.long = p.long;
    POMODORO.sessionsBeforeLong = p.sessions;
    POMODORO.autoStartNext = p.auto;

    PHASES.focus.ms = p.focus * 60 * 1000;
    PHASES.short.ms = p.short * 60 * 1000;
    PHASES.long.ms  = p.long  * 60 * 1000;
}

loadPomodoroConfig();


let mode = "stopwatch";   // "stopwatch" | "pomodoro"
let interval = null;


/* ========================= */
/* حالة ساعة الإيقاف */
/* ========================= */

let seconds = 0;
let elapsed = 0;      // الوقت المتراكم (بالميلي ثانية) قبل آخر تشغيل
let startTime = 0;    // لحظة آخر تشغيل
let running = false;


/* ========================= */
/* حالة بومودورو */
/* ========================= */

function freshPomo() {
    return {
        phase: "focus",
        remaining: PHASES.focus.ms,   // المتبقي وقت الإيقاف
        endTime: 0,                   // لحظة انتهاء المرحلة وقت التشغيل
        running: false,
        cycle: 0,                     // جلسات التركيز المكتملة في الدورة الحالية
        segStart: 0,                  // بداية فترة التركيز الحالية (للإحصائيات)
        fullMs: PHASES.focus.ms       // المدة الكاملة للمرحلة (لمعرفة لو لسه ماتحركتش)
    };
}

let pomo = freshPomo();


/* نقاط الجلسات */
let pomoDots = [];

function buildDots() {
    pomoDotsBox.innerHTML = "";

    for (let i = 0; i < POMODORO.sessionsBeforeLong; i++) {
        const dot = document.createElement("span");
        dot.className = "pomo-dot";
        pomoDotsBox.appendChild(dot);
    }

    pomoDots = pomoDotsBox.querySelectorAll(".pomo-dot");
}

buildDots();


function saveState() {
    try {
        localStorage.setItem("timerState", JSON.stringify({
            elapsed,
            startTime,
            running
        }));
    } catch (e) {}
}


function savePomo() {
    try {
        localStorage.setItem("pomoState", JSON.stringify(pomo));
    } catch (e) {}
}


function isRunning() {
    return mode === "pomodoro" ? pomo.running : running;
}


/* ========================= */
/* منع قفل الشاشة أثناء العد */
/* ========================= */

let wakeLock = null;

async function requestWakeLock() {
    try {
        if (cfg().wakeLock && "wakeLock" in navigator && !wakeLock) {
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
    if (document.visibilityState === "visible" && isRunning()) {
        requestWakeLock();
    }
});


function setRunningUI(on) {
    startButton.textContent = on ? T("stop") : T("start");
    buttons.classList.toggle("running", on);

    if (on) {
        requestWakeLock();
    } else {
        releaseWakeLock();
    }
}


/* ========================= */
/* الصوت والإشعارات */
/* ========================= */

function initAudio() {
    SETTINGS.initAudio();
}

function playBeep() {
    SETTINGS.beep();
}

function askNotificationPermission() {
    try {
        if (cfg().notifications && "Notification" in window && Notification.permission === "default") {
            Notification.requestPermission();
        }
    } catch (e) {}
}

function notify(text) {
    try {
        if (cfg().notifications && "Notification" in window && Notification.permission === "granted") {
            new Notification("Tickwell", { body: text, icon: "./brain.png" });
        }
    } catch (e) {}
}


/* ========================= */
/* الإحصائيات والتنبيهات */
/* ========================= */

function showToast(text) {
    const el = document.getElementById("toast");

    if (!el) return;

    el.textContent = text;
    el.classList.add("show");

    clearTimeout(showToast.timer);

    showToast.timer = setTimeout(() => {
        el.classList.remove("show");
    }, 6000);
}


function logSegment(startMs, endMs, kind) {
    try {
        if (!window.TickwellStats || !startMs) return;

        const result = TickwellStats.logSession(startMs, endMs, kind);

        if (result && result.goalReached) {
            showToast(T("goal.reached"));
            notify(T("goal.reached"));
        }
    } catch (e) {}
}


/* إنهاء فترة التركيز وتسجيلها (تتسجل فقط مراحل التركيز) */
function endFocusSegment(until) {
    if (pomo.phase === "focus" && pomo.segStart) {
        logSegment(pomo.segStart, until, "pomodoro");
    }

    pomo.segStart = 0;
}


function countPomodoro(ms) {
    try {
        if (window.TickwellStats) TickwellStats.addPomodoro(ms);
    } catch (e) {}
}


/* ========================= */
/* ساعة الإيقاف */
/* ========================= */

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
    setRunningUI(true);
    saveState();
}


function stopTimer() {
    clearInterval(interval);
    interval = null;
    const now = Date.now();
    logSegment(startTime, now, "stopwatch");
    elapsed += now - startTime;
    running = false;
    setRunningUI(false);
    saveState();
}


function resetStopwatch() {
    if (running) {
        logSegment(startTime, Date.now(), "stopwatch");
    }

    clearInterval(interval);
    interval = null;
    running = false;
    elapsed = 0;
    startTime = 0;
    seconds = 0;
    updateTimer();
    setRunningUI(false);
    saveState();
}


/* ========================= */
/* بومودورو */
/* ========================= */

function formatMS(ms) {
    const total = Math.ceil(ms / 1000);

    const m = String(Math.floor(total / 60)).padStart(2, "0");
    const s = String(total % 60).padStart(2, "0");

    return `${m}:${s}`;
}


function renderPomo() {
    const ms = pomo.running
        ? Math.max(0, pomo.endTime - Date.now())
        : pomo.remaining;

    const text = formatMS(ms);
    const label = T("phase." + pomo.phase);

    timer.textContent = text;
    pomoLabel.textContent = label;
    pomoInfo.dataset.phase = pomo.phase;

    pomoDots.forEach((dot, i) => {
        dot.classList.toggle("done", i < pomo.cycle);
    });

    document.title = pomo.running
        ? `${text} - ${label} - Tickwell`
        : baseTitle;
}


function advancePhase() {
    if (pomo.phase === "focus") {
        pomo.cycle++;

        pomo.phase = pomo.cycle >= POMODORO.sessionsBeforeLong
            ? "long"
            : "short";
    } else {
        if (pomo.phase === "long") {
            pomo.cycle = 0;
        }

        pomo.phase = "focus";
    }

    pomo.remaining = pomo.fullMs = PHASES[pomo.phase].ms;
}


function completePhase() {
    const finished = pomo.phase;

    if (finished === "focus") {
        endFocusSegment(pomo.endTime);
        countPomodoro(pomo.endTime);
    }

    advancePhase();
    playBeep();

    notify(
        finished === "focus"
            ? T("note.focusDone")
            : T("note.breakDone")
    );

    if (POMODORO.autoStartNext) {
        pomo.segStart = Date.now();
        pomo.endTime = pomo.segStart + pomo.remaining;
    } else {
        clearInterval(interval);
        interval = null;
        pomo.running = false;
        setRunningUI(false);
    }

    savePomo();
    renderPomo();
}


function pomoTick() {
    if (pomo.endTime - Date.now() <= 0) {
        completePhase();
    } else {
        renderPomo();
    }
}


function startPomo() {
    initAudio();
    askNotificationPermission();

    pomo.running = true;
    pomo.segStart = Date.now();
    pomo.endTime = pomo.segStart + pomo.remaining;

    interval = setInterval(pomoTick, 250);

    setRunningUI(true);
    savePomo();
    renderPomo();
}


function stopPomo() {
    endFocusSegment(Date.now());

    clearInterval(interval);
    interval = null;

    pomo.remaining = Math.max(0, pomo.endTime - Date.now());
    pomo.running = false;

    setRunningUI(false);
    savePomo();
    renderPomo();
}


function resetPomo() {
    if (pomo.running) {
        endFocusSegment(Date.now());
    }

    clearInterval(interval);
    interval = null;

    pomo = freshPomo();

    setRunningUI(false);
    savePomo();
    renderPomo();
}


/* ========================= */
/* الأزرار الرئيسية */
/* ========================= */

startButton.addEventListener("click", () => {
    if (mode === "pomodoro") {
        pomo.running ? stopPomo() : startPomo();
    } else {
        running ? stopTimer() : startTimer();
    }
});


resetButton.addEventListener("click", () => {
    if (mode === "pomodoro") {
        resetPomo();
    } else {
        resetStopwatch();
    }
});


/* ========================= */
/* تبديل الوضع */
/* ========================= */

function render() {
    if (mode === "pomodoro") {
        renderPomo();
    } else {
        document.title = baseTitle;
        updateTimer();
    }
}


function applyMode(next) {
    mode = next;

    const isPomodoro = mode === "pomodoro";

    modeSwitch.classList.toggle("pomodoro", isPomodoro);
    pomoInfo.classList.toggle("visible", isPomodoro);

    modeButtons.forEach((btn) => {
        const active = btn.dataset.mode === mode;

        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
    });

    render();
}


function setMode(next) {
    if (next === mode) return;

    /* نوقف المؤقت الحالي قبل التبديل */
    if (isRunning()) {
        mode === "pomodoro" ? stopPomo() : stopTimer();
    }

    applyMode(next);

    try {
        localStorage.setItem("timerMode", next);
    } catch (e) {}
}


modeButtons.forEach((btn) => {
    btn.addEventListener("click", () => setMode(btn.dataset.mode));
});


/* ========================= */
/* استرجاع الحالة عند فتح الصفحة */
/* ========================= */

try {
    if (localStorage.getItem("timerMode") === "pomodoro") {
        mode = "pomodoro";
    }
} catch (e) {}


try {
    const saved = JSON.parse(localStorage.getItem("timerState"));

    if (saved) {
        elapsed = saved.elapsed || 0;
        startTime = saved.startTime || 0;
        running = !!saved.running;
    }
} catch (e) {}


try {
    const savedPomo = JSON.parse(localStorage.getItem("pomoState"));

    if (savedPomo && PHASES[savedPomo.phase]) {
        pomo = Object.assign(freshPomo(), savedPomo);
    }
} catch (e) {}


/* لو المدد اتغيرت في الإعدادات والمرحلة لسه ماتحركتش، نحدّث الوقت */
syncPomoDurations();


/* لو المؤقت غير النشط كان محفوظ كأنه شغال، نوقفه */
if (mode === "pomodoro" && running) {
    logSegment(startTime, Date.now(), "stopwatch");
    elapsed += Date.now() - startTime;
    running = false;
    saveState();
}

if (mode === "stopwatch" && pomo.running) {
    endFocusSegment(Math.min(Date.now(), pomo.endTime));
    pomo.remaining = Math.max(0, pomo.endTime - Date.now());
    pomo.running = false;
    savePomo();
}


seconds = Math.floor(elapsed / 1000);

applyMode(mode);


if (mode === "stopwatch" && running) {

    tick();
    interval = setInterval(tick, 250);
    setRunningUI(true);

} else if (mode === "pomodoro" && pomo.running) {

    if (pomo.endTime <= Date.now()) {
        /* المرحلة خلصت أثناء غياب الصفحة: ننتقل للمرحلة التالية ونقف */
        if (pomo.phase === "focus") {
            endFocusSegment(pomo.endTime);
            countPomodoro(pomo.endTime);
        }

        advancePhase();
        pomo.running = false;
        savePomo();
        renderPomo();
    } else {
        interval = setInterval(pomoTick, 250);
        setRunningUI(true);
    }

}


/* ========================= */
/* تغيير الوضع (فاتح / داكن) */
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


/* قراءة الوضع من الإعدادات (داكن / ساطع / تلقائي) */

setTheme(SETTINGS.resolvedTheme());


/* زر تغيير الوضع */

themeButton.addEventListener("click", () => {

    const isLight =
        document.body.classList.contains(
            "light-mode"
        );

    SETTINGS.update({
        theme: isLight ? "dark" : "light"
    });

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


/* ========================= */
/* اختصارات لوحة المفاتيح */
/* ========================= */

const shortcutsHelp =
    document.getElementById("shortcutsHelp");

const shortcutsClose =
    document.getElementById("shortcutsClose");

const helpButton =
    document.getElementById("helpButton");


function toggleHelp(force) {
    const open = typeof force === "boolean"
        ? force
        : !shortcutsHelp.classList.contains("open");

    shortcutsHelp.classList.toggle("open", open);

    if (open) {
        shortcutsClose.focus();
    } else {
        shortcutsClose.blur();
    }
}


helpButton.addEventListener("click", () => toggleHelp(true));

shortcutsClose.addEventListener("click", () => toggleHelp(false));

shortcutsHelp.addEventListener("click", (event) => {
    if (event.target === shortcutsHelp) {
        toggleHelp(false);
    }
});


/* بعد الضغط بالماوس نشيل التركيز من الزر عشان مسطرة المسافة تشتغل كاختصار */
document.addEventListener("click", (event) => {
    if (event.detail > 0) {
        const btn = event.target.closest(".buttons button, .mode-btn, .help-button");

        if (btn) btn.blur();
    }
});


/* نستخدم event.code عشان الاختصارات تشتغل حتى مع الكيبورد العربي */
document.addEventListener("keydown", (event) => {

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (!cfg().shortcuts) return;

    const target = event.target;

    /* لا نتدخل أثناء الكتابة */
    if (
        target &&
        (
            target.isContentEditable ||
            /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)
        )
    ) return;

    const helpOpen = shortcutsHelp.classList.contains("open");

    if (event.code === "Escape") {
        if (helpOpen) toggleHelp(false);
        return;
    }

    if (
        event.code === "KeyH" ||
        (event.code === "Slash" && event.shiftKey)
    ) {
        event.preventDefault();
        toggleHelp();
        return;
    }

    if (helpOpen || event.repeat) return;

    /* لو المستخدم واقف على زر أو رابط بالتاب، نسيب السلوك الطبيعي */
    const onControl =
        target && target.closest && target.closest("button, a");

    switch (event.code) {

        case "Space":
            if (onControl) return;
            event.preventDefault();
            startButton.click();
            break;

        case "KeyR":
            if (event.shiftKey) {
                event.preventDefault();
                resetButton.click();
            }
            break;

        case "KeyF":
            fullscreenButton.click();
            break;

        case "KeyT":
            themeButton.click();
            break;

        case "KeyM":
            setMode(mode === "pomodoro" ? "stopwatch" : "pomodoro");
            break;

    }

});


/* منع تمرير الصفحة بالمسافة */
document.addEventListener("keyup", (event) => {
    if (
        event.code === "Space" &&
        !event.target.closest("button, a, input, textarea, select")
    ) {
        event.preventDefault();
    }
});


/* ========================= */
/* تطبيق الإعدادات (لغة / وضع / مدد) */
/* ========================= */

function syncPomoDurations() {
    if (!pomo.running && pomo.remaining === pomo.fullMs) {
        pomo.remaining = pomo.fullMs = PHASES[pomo.phase].ms;
        savePomo();
    }
}


function refreshTexts() {
    startButton.textContent = isRunning() ? T("stop") : T("start");
}


function applySettings() {
    loadPomodoroConfig();
    buildDots();
    syncPomoDurations();

    setTheme(SETTINGS.resolvedTheme());

    helpButton.style.display = cfg().shortcuts ? "" : "none";

    refreshTexts();
    render();
}


window.addEventListener("tickwell:settings", applySettings);

applySettings();