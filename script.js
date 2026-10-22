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

const subjectButton =
    document.getElementById("subjectButton");

const subjectMenu =
    document.getElementById("subjectMenu");

const subjectDot =
    document.getElementById("subjectDot");

const subjectName =
    document.getElementById("subjectName");

const fsSubject =
    document.getElementById("fsSubject");

const fsDot =
    document.getElementById("fsDot");

const fsName =
    document.getElementById("fsName");

const exitFullscreenButton =
    document.getElementById("exitFullscreen");

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
        fullMs: PHASES.focus.ms,      // المدة الكاملة للمرحلة (لمعرفة لو لسه ماتحركتش)
        alarming: false               // المنبه شغال وبننتظر "أنا هنا"
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


const buttonsSpacer =
    document.getElementById("buttonsSpacer");


/* وقت التشغيل الأزرار بتتثبت في آخر الشاشة (position: fixed)
   ونسيب مكانها فاضي عشان باقي الصفحة ما يتحركش */
function updateRunShift() {
    if (buttons.offsetHeight === 0) return;

    buttonsSpacer.style.height = buttons.classList.contains("running")
        ? buttons.offsetHeight + 15 + "px"
        : "0px";
}

let shiftFrame = null;

function scheduleRunShift() {
    cancelAnimationFrame(shiftFrame);
    shiftFrame = requestAnimationFrame(updateRunShift);
}

window.addEventListener("resize", scheduleRunShift);
window.addEventListener("orientationchange", scheduleRunShift);


/* حركة ناعمة من مكان الأزرار القديم للجديد */
function animateButtons(first) {
    if (!buttons.animate || document.body.classList.contains("fullscreen-mode")) return;

    try {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    } catch (e) {}

    const last = buttons.getBoundingClientRect();

    if (!first.height || !last.height) return;

    const dx = first.left - last.left;
    const dy = first.top - last.top;

    if (!dx && !dy) return;

    buttons.animate(
        [
            { transform: `translate(${dx}px, ${dy}px)` },
            { transform: "translate(0, 0)" }
        ],
        { duration: 700, easing: "ease-in-out" }
    );
}


function setRunningUI(on) {
    const first = buttons.getBoundingClientRect();
    const changed = buttons.classList.contains("running") !== on;

    startButton.textContent = on ? T("stop") : T("start");
    buttons.classList.toggle("running", on);

    updateRunShift();

    if (changed) animateButtons(first);

    /* المادة بتتقفل أثناء التشغيل عشان الجلسة تتسجل على مادة واحدة */
    subjectButton.disabled = on;
    subjectButton.title = on ? T("subject.locked") : "";

    if (on) closeSubjectMenu();

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

function playChime() {
    SETTINGS.chime();
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


/* إنجاز جديد؟ (بيظهر كإشعار صغير) */
function checkAchievements(delay) {
    try {
        if (!window.TickwellAchievements) return;

        const fresh = TickwellAchievements.checkNew();

        if (!fresh.length) return;

        const first = fresh[0];
        const title = T(first.t, { n: first.n });

        const message = fresh.length > 1
            ? T("ach.newMore", { title, n: fresh.length - 1 })
            : T("ach.new", { title });

        setTimeout(() => showToast(message), delay || 0);
    } catch (e) {}
}


function logSegment(startMs, endMs, kind) {
    try {
        if (!window.TickwellStats || !startMs) return;

        const result = TickwellStats.logSession(startMs, endMs, kind, cfg().subject);

        if (result && result.goalReached) {
            showToast(T("goal.reached"));
            notify(T("goal.reached"));
        }

        checkAchievements(result && result.goalReached ? 3500 : 0);
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

    checkAchievements(0);
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

    notify(
        finished === "focus"
            ? T("note.focusDone")
            : T("note.breakDone")
    );

    /* خلصت الراحة: منبه مستمر لحد ما المستخدم يضغط "أنا هنا" */
    const holdForAlarm =
        finished !== "focus" &&
        cfg().sound &&
        cfg().pomo.alarm;

    if (finished === "focus") {
        playChime();
    } else if (!holdForAlarm) {
        playBeep();
    }

    if (holdForAlarm) {
        clearInterval(interval);
        interval = null;

        pomo.running = false;
        pomo.segStart = 0;

        setRunningUI(false);
        savePomo();
        renderPomo();

        showAlarm();

        return;
    }

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


/* ========================= */
/* منبه نهاية الراحة */
/* ========================= */

const alarmOverlay = document.getElementById("alarmOverlay");
const alarmDismiss = document.getElementById("alarmDismiss");


function isAlarmOpen() {
    return alarmOverlay.classList.contains("open");
}


function showAlarm() {
    pomo.alarming = true;
    savePomo();

    alarmOverlay.classList.add("open");

    SETTINGS.startAlarm();

    /* نخلي الشاشة صاحية عشان المنبه يفضل شغال */
    requestWakeLock();

    alarmDismiss.focus();
}


function dismissAlarm() {
    SETTINGS.stopAlarm();

    alarmOverlay.classList.remove("open");

    pomo.alarming = false;
    savePomo();

    if (POMODORO.autoStartNext && !pomo.running) {
        startPomo();
    } else {
        releaseWakeLock();
    }
}


alarmDismiss.addEventListener("click", dismissAlarm);


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
    document.body.classList.toggle("pomodoro-mode", isPomodoro);

    modeButtons.forEach((btn) => {
        const active = btn.dataset.mode === mode;

        btn.classList.toggle("active", active);
        btn.setAttribute("aria-pressed", String(active));
    });

    render();
    updateRunShift();
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

/* ملء الشاشة البديل: للأجهزة اللي مش بتدعم Fullscreen API (زي iPhone) */
function enterSoftFullscreen() {
    document.body.classList.add("soft-fullscreen", "fullscreen-mode");
}

function exitSoftFullscreen() {
    document.body.classList.remove("soft-fullscreen", "fullscreen-mode");

    scheduleRunShift();
}

exitFullscreenButton.addEventListener("click", exitSoftFullscreen);


fullscreenButton.addEventListener("click", async () => {

    if (document.body.classList.contains("soft-fullscreen")) {
        exitSoftFullscreen();
        return;
    }

    const root = document.documentElement;
    const request = root.requestFullscreen || root.webkitRequestFullscreen;

    if (!request) {
        enterSoftFullscreen();
        return;
    }

    try {

        if (!document.fullscreenElement && !document.webkitFullscreenElement) {

            await request.call(root);

            document.body.classList.add("fullscreen-mode");

        } else {

            await (document.exitFullscreen || document.webkitExitFullscreen).call(document);

        }

    } catch (error) {

        console.log("Fullscreen error:", error);

        if (!document.fullscreenElement) enterSoftFullscreen();

    }

});


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

        /* بعد الخروج من ملء الشاشة نرجّع الأزرار لمكانها الصح */
        scheduleRunShift();

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

    if (
        event.code === "Escape" &&
        document.body.classList.contains("soft-fullscreen")
    ) {
        exitSoftFullscreen();
        return;
    }

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (!cfg().shortcuts) return;

    /* أثناء المنبه الأزرار بس هي اللي تشتغل */
    if (isAlarmOpen() || !subjectMenu.hidden) return;

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


/* ========================= */
/* المواد (زر + قايمة) */
/* ========================= */

function subjectColor(name) {
    return name ? SETTINGS.subjectColor(name) : "#8a8a8a";
}


/* الزر نفسه واسم المادة تحت العداد في ملء الشاشة */
function buildSubjects() {
    const current = cfg().subject;

    subjectDot.style.background = subjectColor(current);
    subjectName.textContent = current || T("subject.none");

    fsDot.style.background = subjectColor(current);
    fsName.textContent = current;
    fsSubject.classList.toggle("has", !!current);

    if (!subjectMenu.hidden) renderSubjectMenu();
}


function renderSubjectMenu() {
    const current = cfg().subject;

    subjectMenu.innerHTML = "";

    const addItem = (value, label, color) => {
        const item = document.createElement("button");
        const dot = document.createElement("span");
        const text = document.createElement("span");

        item.type = "button";
        item.className = "subject-item" + (value === current ? " selected" : "");
        item.setAttribute("role", "option");
        item.setAttribute("aria-selected", String(value === current));

        dot.className = "subject-dot";
        dot.style.background = color;

        text.className = "subject-item-name";
        text.textContent = label;

        item.appendChild(dot);
        item.appendChild(text);

        if (value === current) {
            const check = document.createElement("span");

            check.className = "subject-check";
            check.textContent = "✓";

            item.appendChild(check);
        }

        item.addEventListener("click", () => {
            SETTINGS.update({ subject: value });
            closeSubjectMenu();
        });

        subjectMenu.appendChild(item);
    };

    addItem("", T("subject.none"), "#8a8a8a");

    cfg().subjects.forEach((name) => addItem(name, name, subjectColor(name)));

    const separator = document.createElement("div");

    separator.className = "subject-sep";

    subjectMenu.appendChild(separator);

    const add = document.createElement("button");

    add.type = "button";
    add.className = "subject-item subject-add";
    add.textContent = T("subject.add");

    add.addEventListener("click", () => startNewSubject(add));

    subjectMenu.appendChild(add);
}


/* مادة جديدة: الصف بيتحول لخانة كتابة جوه القايمة */
function startNewSubject(row) {
    const input = document.createElement("input");

    input.type = "text";
    input.className = "subject-input";
    input.maxLength = 30;
    input.autocomplete = "off";
    input.placeholder = T("subject.placeholder");

    row.replaceWith(input);
    input.focus();

    input.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();

            const name = input.value.trim().slice(0, 30);

            if (name) {
                const list = cfg().subjects.slice();

                if (!list.includes(name) && list.length < 20) list.push(name);

                SETTINGS.update({ subjects: list, subject: name });
            }

            closeSubjectMenu();
        } else if (event.key === "Escape") {
            event.stopPropagation();
            renderSubjectMenu();
        }
    });
}


function openSubjectMenu() {
    if (subjectButton.disabled) return;

    renderSubjectMenu();

    subjectMenu.hidden = false;
    subjectButton.setAttribute("aria-expanded", "true");

    const first = subjectMenu.querySelector(".selected") || subjectMenu.querySelector(".subject-item");

    if (first) first.focus();
}


function closeSubjectMenu() {
    subjectMenu.hidden = true;
    subjectButton.setAttribute("aria-expanded", "false");
}


subjectButton.addEventListener("click", (event) => {
    event.stopPropagation();

    subjectMenu.hidden ? openSubjectMenu() : closeSubjectMenu();
});


document.addEventListener("click", (event) => {
    /* composedPath عشان الصف ممكن يتشال من الصفحة وقت الضغطة (مادة جديدة) */
    if (!subjectMenu.hidden && !event.composedPath().includes(subjectMenu)) {
        closeSubjectMenu();
    }
});


subjectMenu.addEventListener("keydown", (event) => {
    const items = Array.from(subjectMenu.querySelectorAll(".subject-item, .subject-input"));
    const index = items.indexOf(document.activeElement);

    if (event.key === "ArrowDown") {
        event.preventDefault();
        items[(index + 1) % items.length].focus();
    } else if (event.key === "ArrowUp") {
        event.preventDefault();
        items[(index - 1 + items.length) % items.length].focus();
    } else if (event.key === "Escape") {
        event.preventDefault();
        closeSubjectMenu();
        subjectButton.focus();
    }
});


function applySettings() {
    loadPomodoroConfig();
    buildSubjects();
    buildDots();
    syncPomoDurations();

    setTheme(SETTINGS.resolvedTheme());

    helpButton.style.display = cfg().shortcuts ? "" : "none";

    refreshTexts();
    render();
}


window.addEventListener("tickwell:settings", applySettings);

applySettings();


/* لو الصفحة اتفتحت والمنبه كان شغال */
if (pomo.alarming) {
    showAlarm();
}


/* أول مرة على الجهاز: نسجل الإنجازات المفتوحة من غير إشعارات */
try {
    if (window.TickwellAchievements) TickwellAchievements.baseline();
} catch (e) {}
