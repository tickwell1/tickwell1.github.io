/* =========================
   Tickwell Consent
   موافقة الكوكيز: Google Analytics مش بيتحمّل غير بعد موافقة المستخدم
========================= */

(function () {

    const GA_ID = "G-5FERLLMF79";
    const KEY = "tickwellConsent";

    window.dataLayer = window.dataLayer || [];

    function gtag() {
        window.dataLayer.push(arguments);
    }

    window.gtag = gtag;

    /* الافتراضي: مفيش تخزين قبل الموافقة */
    gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
    });


    function read() {
        try {
            const value = JSON.parse(localStorage.getItem(KEY));

            if (value && typeof value.analytics === "boolean") return value.analytics;
        } catch (e) {}

        return null;
    }


    let loaded = false;

    function loadAnalytics() {
        window["ga-disable-" + GA_ID] = false;

        gtag("consent", "update", { analytics_storage: "granted" });

        if (loaded) return;

        loaded = true;

        const script = document.createElement("script");

        script.async = true;
        script.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;

        document.head.appendChild(script);

        gtag("js", new Date());
        gtag("config", GA_ID);
    }


    function stopAnalytics() {
        window["ga-disable-" + GA_ID] = true;

        gtag("consent", "update", { analytics_storage: "denied" });

        /* مسح كوكيز التحليلات */
        document.cookie.split(";").forEach((cookie) => {
            const name = cookie.split("=")[0].trim();

            if (name === "_ga" || name.startsWith("_ga_") || name === "_gid" || name.startsWith("_gat")) {
                const expired = "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

                document.cookie = name + expired;
                document.cookie = name + expired + "; domain=" + location.hostname;
            }
        });
    }


    /* ========================= */
    /* البانر */
    /* ========================= */

    const FALLBACK = {
        "consent.text": "We use Google Analytics to understand how the site is used. Do you accept its cookies?",
        "consent.accept": "Accept",
        "consent.decline": "Decline",
        "consent.more": "Privacy Policy"
    };

    function t(key) {
        const s = window.TickwellSettings;

        return s ? s.t(key) : FALLBACK[key];
    }


    let banner = null;

    function injectStyle() {
        if (document.getElementById("twConsentStyle")) return;

        const style = document.createElement("style");

        style.id = "twConsentStyle";

        style.textContent = `
            .tw-consent{position:fixed;left:50%;bottom:16px;transform:translateX(-50%);width:min(94%,560px);z-index:6000;
                box-sizing:border-box;padding:16px;border-radius:16px;background:rgba(28,28,28,.98);color:#fff;
                border:1px solid rgba(255,255,255,.14);box-shadow:0 12px 35px rgba(0,0,0,.45);
                font:14px/1.7 system-ui,-apple-system,"Segoe UI",Tahoma,Arial,sans-serif;text-align:start}
            .tw-consent p{margin:0 0 12px}
            .tw-consent a{color:inherit;text-decoration:underline}
            .tw-actions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end}
            .tw-consent button{padding:10px 18px;border-radius:10px;border:1px solid rgba(255,255,255,.3);
                background:transparent;color:inherit;font:inherit;font-weight:bold;cursor:pointer}
            .tw-consent button.tw-accept{background:#fff;color:#000;border-color:#fff}
            body.light-mode .tw-consent{background:rgba(250,250,250,.99);color:#000;border-color:rgba(0,0,0,.14)}
            body.light-mode .tw-consent button{border-color:rgba(0,0,0,.3)}
            body.light-mode .tw-consent button.tw-accept{background:#000;color:#fff;border-color:#000}
        `;

        document.head.appendChild(style);
    }


    function renderBanner() {
        if (!banner) return;

        const s = window.TickwellSettings;

        banner.dir = s && s.get().lang === "ar" ? "rtl" : "ltr";

        banner.innerHTML =
            '<p>' + t("consent.text") + ' <a href="privacy.html">' + t("consent.more") + '</a></p>' +
            '<div class="tw-actions">' +
            '<button type="button" class="tw-decline">' + t("consent.decline") + '</button>' +
            '<button type="button" class="tw-accept">' + t("consent.accept") + '</button>' +
            '</div>';

        banner.querySelector(".tw-accept").addEventListener("click", () => set(true));
        banner.querySelector(".tw-decline").addEventListener("click", () => set(false));
    }


    function showBanner() {
        if (banner) return;

        injectStyle();

        banner = document.createElement("div");

        banner.className = "tw-consent";
        banner.setAttribute("role", "region");

        document.body.appendChild(banner);

        renderBanner();
    }


    function hideBanner() {
        if (banner) {
            banner.remove();
            banner = null;
        }
    }


    function set(value) {
        try {
            localStorage.setItem(KEY, JSON.stringify({ analytics: !!value, ts: Date.now() }));
        } catch (e) {}

        if (value) {
            loadAnalytics();
        } else {
            stopAnalytics();
        }

        hideBanner();

        window.dispatchEvent(new CustomEvent("tickwell:consent"));
    }


    window.TickwellConsent = {
        get: read,
        set
    };


    /* ========================= */
    /* التشغيل */
    /* ========================= */

    const saved = read();

    if (saved === true) {
        loadAnalytics();
    } else if (saved === false) {
        window["ga-disable-" + GA_ID] = true;
    }

    function init() {
        if (read() === null) showBanner();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    /* لو اللغة اتغيرت والبانر ظاهر */
    window.addEventListener("tickwell:settings", renderBanner);

})();
