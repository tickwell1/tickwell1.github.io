/* =========================
   Tickwell Stats
   تخزين إحصائيات المذاكرة على الجهاز (localStorage)
   والمزامنة مع الحساب بتتم من sync.js
========================= */

(function () {

    const KEY = "tickwellStats";

    const MIN_SESSION_SECONDS = 10;          // أقل مدة تتسجل كجلسة
    const MERGE_GAP_MS = 5 * 60 * 1000;      // توقف أقل من 5 دقائق = نفس الجلسة
    const DEFAULT_GOAL_MINUTES = 120;


    function empty() {
        return {
            v: 1,
            days: {},        // { "2026-10-12": ثواني المذاكرة }
            pomos: {},       // { "2026-10-12": عدد جلسات البومودورو المكتملة }
            subjectDays: {}, // { "2026-10-12": { "رياضيات": ثواني } } (الجلسات اللي ليها مادة)
            count: 0,        // عدد الجلسات
            longest: 0,      // أطول جلسة بالثواني
            last: null,      // آخر جلسة { end, seconds, mode } للدمج
            goal: DEFAULT_GOAL_MINUTES,
            goalAt: 0,       // وقت آخر تغيير للهدف (للمزامنة)
            goalDone: "",    // آخر يوم تم فيه تنبيه تحقيق الهدف
            epoch: 0         // بيزيد مع كل "مسح للإحصائيات" (للمزامنة)
        };
    }


    function normalize(data) {
        return Object.assign(empty(), data && typeof data === "object" ? data : {});
    }


    function load() {
        try {
            const raw = JSON.parse(localStorage.getItem(KEY));

            if (raw && typeof raw === "object") {
                return normalize(raw);
            }
        } catch (e) {}

        return empty();
    }


    function save(data) {
        try {
            localStorage.setItem(KEY, JSON.stringify(data));
        } catch (e) {}

        window.dispatchEvent(new CustomEvent("tickwell:stats"));
    }


    function pad(n) {
        return String(n).padStart(2, "0");
    }


    function dayKey(ms) {
        const d = new Date(ms);

        return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }


    function addDays(key, n) {
        const [y, m, d] = key.split("-").map(Number);
        const date = new Date(y, m - 1, d + n);

        return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
    }


    /* توزيع الوقت على الأيام (لو الجلسة عدّت منتصف الليل) */
    function addToDays(days, startMs, endMs, subjectDays, subject) {
        let cur = startMs;

        while (cur < endMs) {
            const d = new Date(cur);

            const nextMidnight = new Date(
                d.getFullYear(),
                d.getMonth(),
                d.getDate() + 1
            ).getTime();

            const chunkEnd = Math.min(endMs, nextMidnight);
            const key = dayKey(cur);

            const chunk = Math.round((chunkEnd - cur) / 1000);

            days[key] = (days[key] || 0) + chunk;

            if (subject && subjectDays) {
                const day = subjectDays[key] || (subjectDays[key] = {});

                day[subject] = (day[subject] || 0) + chunk;
            }

            cur = chunkEnd;
        }
    }


    function logSession(startMs, endMs, mode, subject) {
        subject = subject ? String(subject).slice(0, 30) : "";

        const seconds = Math.round((endMs - startMs) / 1000);

        if (!(seconds >= MIN_SESSION_SECONDS)) {
            return { goalReached: false };
        }

        const data = load();

        addToDays(data.days, startMs, endMs, data.subjectDays, subject);

        const last = data.last;

        if (
            last &&
            last.mode === mode &&
            (last.subject || "") === subject &&
            startMs >= last.end &&
            startMs - last.end < MERGE_GAP_MS
        ) {
            last.end = endMs;
            last.seconds += seconds;
            data.longest = Math.max(data.longest, last.seconds);
        } else {
            data.last = { end: endMs, seconds, mode, subject };
            data.count += 1;
            data.longest = Math.max(data.longest, seconds);
        }

        /* هل وصلنا لهدف اليوم؟ */
        const today = dayKey(endMs);
        let goalReached = false;

        if (
            data.goal > 0 &&
            (data.days[today] || 0) >= data.goal * 60 &&
            data.goalDone !== today
        ) {
            data.goalDone = today;
            goalReached = true;
        }

        save(data);

        return { goalReached };
    }


    function addPomodoro(ms) {
        const data = load();
        const key = dayKey(ms || Date.now());

        data.pomos[key] = (data.pomos[key] || 0) + 1;

        save(data);
    }


    function setGoal(minutes) {
        const value = Math.round(Number(minutes));

        if (!isFinite(value)) return;

        const data = load();

        data.goal = Math.min(1440, Math.max(5, value));
        data.goalAt = Date.now();

        save(data);
    }


    /* مسح الإحصائيات (الهدف اليومي بيفضل زي ما هو) */
    function clear() {
        const old = load();
        const fresh = empty();

        fresh.epoch = (old.epoch || 0) + 1;
        fresh.goal = old.goal;
        fresh.goalAt = old.goalAt;

        save(fresh);
    }


    /* ========================= */
    /* أدوات المزامنة */
    /* ========================= */

    function maxMap(a, b) {
        const out = Object.assign({}, a);

        Object.keys(b || {}).forEach((k) => {
            out[k] = Math.max(out[k] || 0, b[k] || 0);
        });

        return out;
    }


    function mergeSubjectDays(a, b) {
        const out = {};

        [a || {}, b || {}].forEach((source) => {
            Object.keys(source).forEach((day) => {
                const target = out[day] || (out[day] = {});

                Object.keys(source[day] || {}).forEach((name) => {
                    target[name] = Math.max(target[name] || 0, source[day][name] || 0);
                });
            });
        });

        return out;
    }


    /* دمج نسختين من الإحصائيات (محلية وسحابية) */
    function merge(localData, cloudData, ignoreEpoch) {
        const a = normalize(localData);
        const b = normalize(cloudData);

        let out;

        if (!ignoreEpoch && a.epoch !== b.epoch) {
            /* حصل مسح في أحد الطرفين: النسخة الأحدث (epoch الأكبر) هي الصحيحة */
            out = JSON.parse(JSON.stringify(a.epoch > b.epoch ? a : b));
        } else {
            out = empty();

            out.days = maxMap(a.days, b.days);
            out.pomos = maxMap(a.pomos, b.pomos);
            out.subjectDays = mergeSubjectDays(a.subjectDays, b.subjectDays);
            out.count = Math.max(a.count, b.count);
            out.longest = Math.max(a.longest, b.longest);

            out.last =
                a.last && b.last
                    ? (a.last.end >= b.last.end ? a.last : b.last)
                    : (a.last || b.last || null);

            out.goalDone = a.goalDone > b.goalDone ? a.goalDone : b.goalDone;
            out.epoch = Math.max(a.epoch, b.epoch);
        }

        /* الهدف: النسخة الأحدث تغييرًا */
        const g = (b.goalAt || 0) > (a.goalAt || 0) ? b : a;

        out.goal = g.goal;
        out.goalAt = g.goalAt || 0;

        return out;
    }


    /* كتابة بيانات جاية من السحابة (من غير ما نعتبرها تغيير محلي) */
    function applyRemote(data) {
        try {
            localStorage.setItem(KEY, JSON.stringify(normalize(data)));
        } catch (e) {}

        window.dispatchEvent(new CustomEvent("tickwell:stats-remote"));
    }


    function wipeLocal() {
        try {
            localStorage.removeItem(KEY);
        } catch (e) {}

        window.dispatchEvent(new CustomEvent("tickwell:stats-remote"));
    }


    window.TickwellStats = {
        load,
        normalize,
        logSession,
        addPomodoro,
        setGoal,
        clear,
        merge,
        applyRemote,
        wipeLocal,
        dayKey,
        addDays
    };

})();
