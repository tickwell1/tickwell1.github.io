/* =========================
   Tickwell Auth (Firebase)
   حط بيانات مشروعك في firebaseConfig تحت
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification,
    signOut as firebaseSignOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    deleteUser
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDRHZsA4qicsNoQIhc1o-ii8KbIwKsuFMo",
    authDomain: "tickwell-8c44b.firebaseapp.com",
    projectId: "tickwell-8c44b",
    storageBucket: "tickwell-8c44b.firebasestorage.app",
    messagingSenderId: "1095001732842",
    appId: "1:1095001732842:web:96fc04c4fa0883326a8993"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    sendEmailVerification
};

/* حذف الحساب نهائيًا: تأكيد كلمة السر ثم مسح بيانات السحابة ثم الحساب */
async function deleteAccount(password) {
    const user = auth.currentUser;

    if (!user) throw new Error("not-signed-in");

    await reauthenticateWithCredential(
        user,
        EmailAuthProvider.credential(user.email, password)
    );

    if (window.TickwellSync && window.TickwellSync.deleteCloudData) {
        await window.TickwellSync.deleteCloudData();
    }

    await deleteUser(user);

    try {
        localStorage.removeItem("tickwellSyncUid");
    } catch (e) {}

    if (window.TickwellStats) window.TickwellStats.wipeLocal();
}

window.TickwellAuth = { deleteAccount };


/* تسجيل الخروج: الأول نرفع آخر تغييرات المزامنة ونمسح بيانات الجهاز */
export async function signOut(authInstance) {
    try {
        if (window.TickwellSync && window.TickwellSync.beforeLogout) {
            await window.TickwellSync.beforeLogout();
        }
    } catch (e) {}

    return firebaseSignOut(authInstance);
}

/* إضافة رابط Login / Logout تلقائياً في القائمة */
function updateMenu(user) {
    /* زر Login اللي فوق: يختفي لو مسجّل دخول (والتلميح بيتحفظ عشان الصفحة الجاية) */
    try {
        localStorage.setItem("tickwellAuthHint", user ? "in" : "out");
    } catch (e) {}

    const loginButton = document.getElementById("loginButton");
    if (loginButton) loginButton.hidden = !!user;

    const menu = document.getElementById("dropdownMenu");
    if (!menu) return;

    let link = document.getElementById("authLink");
    if (!link) {
        link = document.createElement("a");
        link.id = "authLink";
        menu.appendChild(link);
    }

    const T = (key, fallback) =>
        window.TickwellSettings ? window.TickwellSettings.t(key) : fallback;

    if (user) {
        link.textContent = T("menu.logout", "Logout");
        link.title = user.email;
        link.href = "#";
        link.onclick = async (e) => {
            e.preventDefault();
            await signOut(auth);
        };
    } else {
        link.textContent = T("menu.login", "Login");
        link.title = "";
        link.href = "login.html";
        link.onclick = null;
    }
}

onAuthStateChanged(auth, updateMenu);

/* لو اللغة اتغيرت نحدّث نص الرابط */
window.addEventListener("tickwell:settings", () => updateMenu(auth.currentUser));

/* المزامنة مع الحساب */
import("./sync.js").catch((error) => console.warn("Tickwell sync unavailable:", error));
