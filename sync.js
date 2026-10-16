/* =========================
   Tickwell Sync
   مزامنة الإحصائيات والإعدادات مع حساب المستخدم (Firestore)
   بيتحمل تلقائياً من auth.js
========================= */

import { auth } from "./auth.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    getFirestore,
    doc,
    onSnapshot,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";

const Stats = window.TickwellStats;
const Settings = window.TickwellSettings;

if (!Stats || !Settings) {
    throw new Error("Tickwell sync needs stats.js and settings.js");
}

const db = getFirestore(getApp());

const LINK_KEY = "tickwellSyncUid";   // آخر حساب اتزامن مع هذا الجهاز
const PUSH_DELAY = 1500;
const FIRST_SYNC_TIMEOUT = 12000;

let uid = null;
let email = null;
let unsubscribe = null;
let pushTimer = null;
let timeoutTimer = null;
let applying = false;
let initialized = false;

let state = "signedOut";   // signedOut | syncing | synced | error
let lastSynced = 0;
let lastSig = "";          // بصمة آخر نسخة نعرف إنها في السحابة


function setState(next) {
    state = next;
    window.dispatchEvent(new CustomEvent("tickwell:sync"));
}


/* تحويل أي كائن لنص ثابت الترتيب عشان نقارن بيه */
function canon(value) {
    if (Array.isArray(value)) return "[" + value.map(canon).join(",") + "]";

    if (value && typeof value === "object") {
        return "{" + Object.keys(value).sort()
            .map((k) => JSON.stringify(k) + ":" + canon(value[k]))
            .join(",") + "}";
    }

    return JSON.stringify(value === undefined ? null : value);
}


function payload() {
    return JSON.parse(JSON.stringify({
        stats: Stats.load(),
        settings: Settings.getSyncable(),
        updatedAt: Date.now()
    }));
}


function sigOf(data) {
    return canon({
        stats: Stats.normalize(data.stats),
        settings: data.settings || {}
    });
}


async function push() {
    if (!uid) return false;

    clearTimeout(pushTimer);
    pushTimer = null;

    const data = payload();
    const sig = sigOf(data);

    if (sig === lastSig) {
        setState("synced");
        return true;
    }

    setState("syncing");

    try {
        await setDoc(doc(db, "users", uid), data);

        lastSig = sig;
        lastSynced = Date.now();
        setState("synced");

        return true;
    } catch (error) {
        console.warn("Tickwell sync: push failed", error);
        setState("error");

        return false;
    }
}


function schedulePush() {
    if (!uid || !initialized || applying) return;

    clearTimeout(pushTimer);
    pushTimer = setTimeout(push, PUSH_DELAY);
}


/* وصلت نسخة من السحابة: ندمجها مع المحلي */
function handleCloud(cloud) {
    clearTimeout(timeoutTimer);

    applying = true;

    try {
        const local = Stats.load();
        const linkedUid = localStorage.getItem(LINK_KEY);

        let merged;

        if (linkedUid && linkedUid !== uid) {
            /* بيانات الجهاز دي تخص حساب تاني: مانخلطهاش */
            merged = Stats.normalize(cloud && cloud.stats);
        } else if (!cloud) {
            merged = local;
        } else if (!linkedUid) {
            /* أول مرة الجهاز يتربط بالحساب: ندمج بدون ما نخسر أي حاجة */
            merged = Stats.merge(local, cloud.stats, true);
        } else {
            merged = Stats.merge(local, cloud.stats, false);
        }

        if (canon(Stats.normalize(merged)) !== canon(local)) {
            Stats.applyRemote(merged);
        }

        try {
            localStorage.setItem(LINK_KEY, uid);
        } catch (e) {}

        /* الإعدادات: الأحدث تغييرًا هي اللي تكسب */
        if (
            cloud &&
            cloud.settings &&
            Number(cloud.settings.updatedAt || 0) > Number(Settings.get().updatedAt || 0)
        ) {
            Settings.applyRemote(cloud.settings);
        }

        lastSig = cloud ? sigOf(cloud) : "";
        initialized = true;

        if (cloud) lastSynced = Date.now();
    } finally {
        applying = false;
    }

    /* لو النسخة المحلية مختلفة عن السحابة نرفعها */
    push();
}


function listen() {
    unsubscribe = onSnapshot(
        doc(db, "users", uid),
        (snap) => {
            /* تجاهل صدى كتابتنا المحلية */
            if (snap.metadata.hasPendingWrites) return;

            handleCloud(snap.exists() ? snap.data() : null);
        },
        (error) => {
            console.warn("Tickwell sync: listen failed", error);
            setState("error");
        }
    );

    clearTimeout(timeoutTimer);

    timeoutTimer = setTimeout(() => {
        if (uid && !initialized) setState("error");
    }, FIRST_SYNC_TIMEOUT);
}


function teardown() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    clearTimeout(pushTimer);
    clearTimeout(timeoutTimer);

    pushTimer = null;
    timeoutTimer = null;
    lastSig = "";
}


onAuthStateChanged(auth, (user) => {
    teardown();

    if (!user) {
        uid = null;
        email = null;
        initialized = false;
        setState("signedOut");

        return;
    }

    uid = user.uid;
    email = user.email;
    initialized = false;

    setState("syncing");
    listen();
});


/* أي تغيير محلي في الإحصائيات أو الإعدادات يتبعت للسحابة */
window.addEventListener("tickwell:stats", schedulePush);
window.addEventListener("tickwell:settings", schedulePush);


window.TickwellSync = {

    getStatus: () => ({ state, email, lastSynced }),

    syncNow: async () => {
        if (!uid) return false;

        lastSig = "";

        return push();
    },

    /* قبل تسجيل الخروج: نرفع آخر التغييرات ونمسح إحصائيات الجهاز */
    beforeLogout: async () => {
        if (!uid) return;

        const ok = await Promise.race([
            push(),
            new Promise((resolve) => setTimeout(() => resolve(false), 5000))
        ]);

        if (ok) {
            try {
                localStorage.removeItem(LINK_KEY);
            } catch (e) {}

            Stats.wipeLocal();
        }
    }

};
