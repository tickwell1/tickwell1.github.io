/* =========================
   Tickwell Achievements
   الإنجازات: بتتحسب من الإحصائيات الموجودة (مفيش بيانات جديدة بتتخزن)
========================= */

(function () {

    const Stats = window.TickwellStats;

    const SEEN_KEY = "tickwellBadges";   // الإنجازات اللي المستخدم شافها على هذا الجهاز

    /* metric: القياس، target: الرقم المطلوب، unit: وحدة العرض */
    const DEFS = [
        { id: "first",     icon: "🌱", t: "ach.first.t",      d: "ach.first.d",      n: 1,   metric: "sessions",   target: 1,   unit: "" },
        { id: "streak3",   icon: "🔥", t: "ach.streak.t",     d: "ach.streak.d",     n: 3,   metric: "streak",     target: 3,   unit: "" },
        { id: "streak7",   icon: "🔥", t: "ach.streak.t",     d: "ach.streak.d",     n: 7,   metric: "streak",     target: 7,   unit: "" },
        { id: "streak30",  icon: "🔥", t: "ach.streakLong.t", d: "ach.streakLong.d", n: 30,  metric: "streak",     target: 30,  unit: "" },
        { id: "hours10",   icon: "⏱️", t: "ach.hours.t",      d: "ach.hours.d",      n: 10,  metric: "hours",      target: 10,  unit: "h" },
        { id: "hours50",   icon: "⏱️", t: "ach.hours.t",      d: "ach.hours.d",      n: 50,  metric: "hours",      target: 50,  unit: "h" },
        { id: "hours100",  icon: "⏱️", t: "ach.hours.t",      d: "ach.hours.d",      n: 100, metric: "hours",      target: 100, unit: "h" },
        { id: "pomo10",    icon: "🍅", t: "ach.pomo.t",       d: "ach.pomo.d",       n: 10,  metric: "pomos",      target: 10,  unit: "" },
        { id: "pomo50",    icon: "🍅", t: "ach.pomo.t",       d: "ach.pomo.d",       n: 50,  metric: "pomos",      target: 50,  unit: "" },
        { id: "pomo100",   icon: "🍅", t: "ach.pomo.t",       d: "ach.pomo.d",       n: 100, metric: "pomos",      target: 100, unit: "" },
        { id: "marathon",  icon: "🏃", t: "ach.marathon.t",   d: "ach.marathon.d",   n: 2,   metric: "longestMin", target: 120, unit: "m" },
        { id: "goal1",     icon: "🎯", t: "ach.goal1.t",      d: "ach.goal1.d",      n: 1,   metric: "goalDays",   target: 1,   unit: "" },
        { id: "goal7",     icon: "🎯", t: "ach.goal7.t",      d: "ach.goal7.d",      n: 7,   metric: "goalDays",   target: 7,   unit: "" }
    ];


    function metrics(data) {
        const days = data.days || {};
        const keys = Object.keys(days);

        const totalSeconds = keys.reduce((sum, k) => sum + (days[k] || 0), 0);
        const pomos = Object.values(data.pomos || {}).reduce((a, b) => a + b, 0);

        /* أطول سلسلة أيام متتالية (اليوم يتحسب لو فيه دقيقة مذاكرة على الأقل) */
        const studied = keys.filter((k) => days[k] >= 60).sort();
        let best = 0;
        let run = 0;
        let prev = null;

        studied.forEach((k) => {
            run = prev && Stats.addDays(prev, 1) === k ? run + 1 : 1;
            best = Math.max(best, run);
            prev = k;
        });

        const goalSeconds = (data.goal || 0) * 60;
        const goalDays = goalSeconds > 0 ? keys.filter((k) => days[k] >= goalSeconds).length : 0;

        return {
            sessions: data.count || 0,
            streak: best,
            hours: totalSeconds / 3600,
            pomos,
            longestMin: (data.longest || 0) / 60,
            goalDays
        };
    }


    function list(data) {
        const m = metrics(data || Stats.load());

        return DEFS.map((def) => {
            const current = m[def.metric];

            return Object.assign({}, def, {
                current,
                unlocked: current >= def.target
            });
        });
    }


    function readSeen() {
        try {
            const value = JSON.parse(localStorage.getItem(SEEN_KEY));

            if (Array.isArray(value)) return value;
        } catch (e) {}

        return null;
    }


    function writeSeen(ids) {
        try {
            localStorage.setItem(SEEN_KEY, JSON.stringify(ids));
        } catch (e) {}
    }


    function unlockedIds() {
        return list().filter((x) => x.unlocked).map((x) => x.id);
    }


    /* أول مرة على الجهاز: نسجل اللي مفتوح أصلًا من غير ما نطلع إشعارات */
    function baseline() {
        if (readSeen() === null) writeSeen(unlockedIds());
    }


    /* الإنجازات الجديدة من آخر مرة (بيحدّث المسجّل) */
    function checkNew() {
        const seen = readSeen() || [];
        const now = unlockedIds();
        const fresh = now.filter((id) => !seen.includes(id));

        if (fresh.length) {
            writeSeen(Array.from(new Set(seen.concat(now))));
        }

        return list().filter((x) => fresh.includes(x.id));
    }


    window.TickwellAchievements = { list, baseline, checkNew };

})();
