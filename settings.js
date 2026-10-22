/* =========================
   Tickwell Settings
   الإعدادات واللغات والوضع - يتحمل في <head> لكل الصفحات
========================= */

(function () {

    const KEY = "tickwellSettings";

    const DEFAULTS = {
        lang: null,              // "ar" | "en" (لو فاضي نحدده من لغة المتصفح)
        theme: "dark",           // "dark" | "light" | "auto"
        pomo: {
            focus: 45,           // دقائق
            short: 15,
            long: 15,
            sessions: 4,         // جلسات التركيز قبل الراحة الطويلة
            auto: true,          // بدء المرحلة التالية تلقائياً
            alarm: true          // منبه نهاية الراحة (يرن لحد ما تضغط "أنا هنا")
        },
        sound: true,
        volume: 0.6,             // 0 - 1
        notifications: true,
        wakeLock: true,
        shortcuts: true,
        subjects: [],            // قايمة المواد (بتتزامن)
        subjectColors: {},       // لون كل مادة (بيتزامن)
        subject: "",             // المادة المختارة على هذا الجهاز
        updatedAt: 0             // وقت آخر تغيير في الإعدادات المتزامنة
    };

    /* الإعدادات اللي بتتزامن مع الحساب (الباقي خاص بكل جهاز) */
    const SYNCED = ["lang", "theme", "pomo", "sound", "volume", "subjects", "subjectColors"];

    /* ألوان المواد */
    const SUBJECT_PALETTE = [
        "#4ade80", "#60a5fa", "#f59e0b", "#f472b6",
        "#a78bfa", "#2dd4bf", "#fb7185", "#facc15"
    ];


    /* ========================= */
    /* الترجمة */
    /* ========================= */

    const DICT = {

        ar: {
            "menu.open": "فتح القائمة",
            "menu.home": "الرئيسية",
            "menu.dashboard": "لوحة التحكم",
            "menu.settings": "الإعدادات",
            "menu.about": "عن Tickwell",
            "menu.howto": "طريقة الاستخدام",
            "menu.privacy": "سياسة الخصوصية",
            "menu.contact": "تواصل معنا",
            "menu.login": "تسجيل الدخول",
            "menu.logout": "تسجيل الخروج",

            "start": "ابدأ",
            "stop": "إيقاف",
            "reset": "إعادة الضبط",
            "theme.title": "تغيير الوضع",
            "fullscreen.title": "ملء الشاشة",
            "mode.group": "وضع المؤقت",
            "mode.stopwatch": "ساعة إيقاف",
            "mode.pomodoro": "بومودورو",
            "phase.focus": "تركيز",
            "phase.short": "راحة قصيرة",
            "phase.long": "راحة طويلة",
            "note.focusDone": "انتهت جلسة التركيز، خد راحة",
            "note.breakDone": "انتهت الراحة، يلا نكمل التركيز",
            "goal.reached": "🎉 وصلت هدفك اليومي!",

            "sc.title": "اختصارات لوحة المفاتيح",
            "sc.start": "ابدأ / إيقاف",
            "sc.reset": "إعادة الضبط",
            "sc.fullscreen": "ملء الشاشة",
            "sc.theme": "تغيير الوضع (فاتح / داكن)",
            "sc.mode": "ساعة إيقاف / بومودورو",
            "sc.help": "عرض هذه القائمة",
            "sc.close": "إغلاق",

            "unit.h": "س",
            "unit.m": "د",
            "lessThanMin": "أقل من دقيقة",

            "dash.title": "لوحة التحكم",
            "dash.sub": "إحصائيات مذاكرتك وهدفك اليومي",
            "dash.goal": "🎯 الهدف اليومي",
            "dash.ofGoal": "من الهدف",
            "dash.orCustom": "أو حدد بالدقائق:",
            "dash.stats": "📊 إحصائيات المذاكرة",
            "dash.empty": "لسه مفيش جلسات مسجلة. ابدأ المؤقت وذاكر، وإحصائياتك هتظهر هنا تلقائيًا.",
            "dash.chart": "📈 وقت المذاكرة",
            "dash.range7": "7 أيام",
            "dash.range30": "30 يوم",
            "dash.chartNote": "الخط المتقطع هو هدفك اليومي، والأعمدة الخضراء هي الأيام اللي حققت فيها الهدف.",
            "dash.local": "الإحصائيات محفوظة على هذا الجهاز وهذا المتصفح فقط.",
            "dash.clear": "مسح كل الإحصائيات",
            "dash.clearConfirm": "متأكد إنك عايز تمسح كل الإحصائيات؟ مش هتقدر ترجعها تاني.",
            "goalOf": "{a} من {b}",
            "goal.done": "🎉 حققت هدف اليوم، كمل بنفس الحماس!",
            "goal.left": "باقي {n} على هدفك.",
            "st.today": "اليوم",
            "st.week": "آخر 7 أيام",
            "st.month": "هذا الشهر",
            "st.total": "الإجمالي",
            "st.streak": "السلسلة الحالية",
            "st.best": "أطول سلسلة",
            "st.longest": "أطول جلسة",
            "st.avgSession": "متوسط الجلسة",
            "st.avgDay": "متوسط اليوم",
            "st.pomos": "جلسات بومودورو مكتملة",
            "st.days": "{n} يوم",

            "set.title": "الإعدادات",
            "set.sub": "خصّص Tickwell على كيفك. التغييرات بتتحفظ تلقائيًا.",
            "sec.appearance": "المظهر",
            "set.language": "اللغة",
            "set.languageHint": "تنطبق على المؤقت ولوحة التحكم وتسجيل الدخول والإعدادات.",
            "set.theme": "الوضع",
            "theme.dark": "داكن",
            "theme.light": "ساطع",
            "theme.auto": "تلقائي",
            "sec.pomodoro": "بومودورو",
            "set.focus": "مدة التركيز (دقيقة)",
            "set.short": "الراحة القصيرة (دقيقة)",
            "set.long": "الراحة الطويلة (دقيقة)",
            "set.sessions": "جلسات التركيز قبل الراحة الطويلة",
            "set.auto": "بدء المرحلة التالية تلقائيًا",
            "set.autoHint": "لو اتقفلت، المؤقت بيقف بعد كل مرحلة لحد ما تضغط ابدأ.",
            "sec.sound": "الصوت والإشعارات",
            "set.sound": "صوت التنبيه",
            "set.volume": "مستوى الصوت",
            "set.test": "تجربة الصوت",
            "set.notif": "إشعارات المتصفح",
            "set.notifHint": "تنبيه عند انتهاء كل مرحلة ولما توصل لهدفك اليومي.",
            "set.notifBlocked": "الإشعارات محظورة من إعدادات المتصفح، فعّلها من هناك.",
            "sec.study": "المذاكرة",
            "set.goal": "الهدف اليومي (بالدقائق)",
            "set.wake": "إبقاء الشاشة مضيئة أثناء العد",
            "set.wakeHint": "يمنع الجهاز من قفل الشاشة والمؤقت شغال.",
            "set.shortcuts": "اختصارات لوحة المفاتيح",
            "set.shortcutsHint": "Space للبدء والإيقاف، وغيرها. اضغط ؟ في الصفحة الرئيسية لعرضها.",
            "sec.data": "البيانات",
            "set.export": "تصدير بياناتي",
            "set.exportHint": "ينزّل ملف JSON فيه إعداداتك وإحصائياتك.",
            "set.resetSettings": "إعادة الإعدادات للافتراضي",
            "set.resetConfirm": "هترجع كل الإعدادات للوضع الافتراضي. إحصائياتك مش هتتأثر. متأكد؟",
            "set.clearStats": "مسح الإحصائيات",
            "set.saved": "تم الحفظ ✓",

            "login.welcome": "أهلاً بعودتك",
            "login.sub": "سجّل دخولك إلى حساب Tickwell.",
            "login.tabLogin": "تسجيل الدخول",
            "login.tabSignup": "إنشاء حساب",
            "login.email": "البريد الإلكتروني",
            "login.password": "كلمة السر",
            "login.passPh": "6 أحرف على الأقل",
            "login.forgot": "نسيت كلمة السر؟",
            "login.submitLogin": "تسجيل الدخول",
            "login.submitSignup": "إنشاء حساب",
            "login.createTitle": "أنشئ حسابك",
            "login.createSub": "سجّل ببريدك الإلكتروني للبدء.",
            "login.loggingIn": "جارٍ الدخول...",
            "login.creating": "جارٍ الإنشاء...",
            "login.signedTitle": "أنت مسجّل دخول",
            "login.signedAs": "مسجّل باسم",
            "login.back": "العودة للمؤقت",
            "login.logout": "تسجيل الخروج",
            "err.invalidEmail": "البريد الإلكتروني غير صالح.",
            "err.missingPassword": "اكتب كلمة السر.",
            "err.weak": "كلمة السر لازم تكون 6 أحرف على الأقل.",
            "err.inUse": "في حساب بنفس البريد ده بالفعل. جرّب تسجيل الدخول.",
            "err.badCreds": "البريد أو كلمة السر غير صحيحة.",
            "err.tooMany": "محاولات كتير. استنى شوية وجرّب تاني.",
            "err.network": "مشكلة في الاتصال. اتأكد من الإنترنت وجرّب تاني.",
            "err.generic": "حصلت مشكلة. جرّب تاني.",
            "err.fields": "اكتب البريد وكلمة السر.",
            "err.needEmail": "اكتب بريدك في الخانة فوق، وبعدين اضغط \"نسيت كلمة السر؟\" تاني.",
            "ok.reset": "لو في حساب بالبريد ده، هيوصلك رابط إعادة التعيين."
        },

        en: {
            "menu.open": "Open menu",
            "menu.home": "Home",
            "menu.dashboard": "Dashboard",
            "menu.settings": "Settings",
            "menu.about": "About Tickwell",
            "menu.howto": "How to Use",
            "menu.privacy": "Privacy Policy",
            "menu.contact": "Contact",
            "menu.login": "Login",
            "menu.logout": "Logout",

            "start": "Start",
            "stop": "Stop",
            "reset": "Reset",
            "theme.title": "Toggle theme",
            "fullscreen.title": "Fullscreen",
            "mode.group": "Timer mode",
            "mode.stopwatch": "Stopwatch",
            "mode.pomodoro": "Pomodoro",
            "phase.focus": "Focus",
            "phase.short": "Short break",
            "phase.long": "Long break",
            "note.focusDone": "Focus session finished. Time for a break.",
            "note.breakDone": "Break is over. Back to focus.",
            "goal.reached": "🎉 You reached your daily goal!",

            "sc.title": "Keyboard shortcuts",
            "sc.start": "Start / Stop",
            "sc.reset": "Reset",
            "sc.fullscreen": "Fullscreen",
            "sc.theme": "Switch theme (light / dark)",
            "sc.mode": "Stopwatch / Pomodoro",
            "sc.help": "Show this list",
            "sc.close": "Close",

            "unit.h": "h",
            "unit.m": "m",
            "lessThanMin": "< 1m",

            "dash.title": "Dashboard",
            "dash.sub": "Your study statistics and daily goal",
            "dash.goal": "🎯 Daily goal",
            "dash.ofGoal": "of goal",
            "dash.orCustom": "Or set it in minutes:",
            "dash.stats": "📊 Study statistics",
            "dash.empty": "No sessions yet. Start the timer and study, and your statistics will show up here automatically.",
            "dash.chart": "📈 Study time",
            "dash.range7": "7 days",
            "dash.range30": "30 days",
            "dash.chartNote": "The dashed line is your daily goal, and green bars are days you reached it.",
            "dash.local": "Your statistics are stored on this device and browser only.",
            "dash.clear": "Clear all statistics",
            "dash.clearConfirm": "Clear all statistics? This can't be undone.",
            "goalOf": "{a} of {b}",
            "goal.done": "🎉 You reached today's goal. Keep it up!",
            "goal.left": "{n} left to reach your goal.",
            "st.today": "Today",
            "st.week": "Last 7 days",
            "st.month": "This month",
            "st.total": "Total",
            "st.streak": "Current streak",
            "st.best": "Best streak",
            "st.longest": "Longest session",
            "st.avgSession": "Average session",
            "st.avgDay": "Average per day",
            "st.pomos": "Completed Pomodoros",
            "st.days": "{n} days",

            "set.title": "Settings",
            "set.sub": "Customize Tickwell your way. Changes are saved automatically.",
            "sec.appearance": "Appearance",
            "set.language": "Language",
            "set.languageHint": "Applies to the timer, dashboard, login and settings.",
            "set.theme": "Theme",
            "theme.dark": "Dark",
            "theme.light": "Light",
            "theme.auto": "Auto",
            "sec.pomodoro": "Pomodoro",
            "set.focus": "Focus length (minutes)",
            "set.short": "Short break (minutes)",
            "set.long": "Long break (minutes)",
            "set.sessions": "Focus sessions before a long break",
            "set.auto": "Start the next phase automatically",
            "set.autoHint": "When off, the timer stops after each phase until you press Start.",
            "sec.sound": "Sound & notifications",
            "set.sound": "Alert sound",
            "set.volume": "Volume",
            "set.test": "Test sound",
            "set.notif": "Browser notifications",
            "set.notifHint": "Get notified when a phase ends and when you reach your daily goal.",
            "set.notifBlocked": "Notifications are blocked in your browser settings. Enable them there.",
            "sec.study": "Study",
            "set.goal": "Daily goal (minutes)",
            "set.wake": "Keep the screen on while timing",
            "set.wakeHint": "Stops your device from locking the screen while the timer runs.",
            "set.shortcuts": "Keyboard shortcuts",
            "set.shortcutsHint": "Space to start and stop, and more. Press ? on the home page to see them.",
            "sec.data": "Data",
            "set.export": "Export my data",
            "set.exportHint": "Downloads a JSON file with your settings and statistics.",
            "set.resetSettings": "Reset settings to default",
            "set.resetConfirm": "This restores all settings to their defaults. Your statistics won't be affected. Continue?",
            "set.clearStats": "Clear statistics",
            "set.saved": "Saved ✓",

            "login.welcome": "Welcome back",
            "login.sub": "Log in to your Tickwell account.",
            "login.tabLogin": "Log in",
            "login.tabSignup": "Create account",
            "login.email": "Email",
            "login.password": "Password",
            "login.passPh": "At least 6 characters",
            "login.forgot": "Forgot your password?",
            "login.submitLogin": "Log in",
            "login.submitSignup": "Create account",
            "login.createTitle": "Create your account",
            "login.createSub": "Sign up with your email to get started.",
            "login.loggingIn": "Logging in...",
            "login.creating": "Creating...",
            "login.signedTitle": "You're logged in",
            "login.signedAs": "Signed in as",
            "login.back": "Back to timer",
            "login.logout": "Log out",
            "err.invalidEmail": "That email address isn't valid.",
            "err.missingPassword": "Enter your password.",
            "err.weak": "Password must be at least 6 characters.",
            "err.inUse": "An account with this email already exists. Try logging in.",
            "err.badCreds": "Incorrect email or password.",
            "err.tooMany": "Too many attempts. Wait a few minutes and try again.",
            "err.network": "Network error. Check your connection and try again.",
            "err.generic": "Something went wrong. Please try again.",
            "err.fields": "Enter your email and password.",
            "err.needEmail": "Enter your email above, then select \"Forgot your password?\" again.",
            "ok.reset": "If an account exists for this email, a reset link is on its way."
        }

    };


    /* نصوص الصفحات الثابتة (من نحن / طريقة الاستخدام / الخصوصية / التواصل) */
    Object.assign(DICT.ar, {
        "about.0": "عن Tickwell",
        "about.1": "Tickwell مؤقت مذاكرة بسيط ومجاني، صُمّم ليساعدك على التركيز في مهامك وتنظيم وقت دراستك.",
        "about.2": "بواجهة نظيفة وسهلة الاستخدام، يتيح لك Tickwell بدء جلسة مذاكرة وتتبّع وقتك والبقاء مركّزًا دون مشتتات غير ضرورية.",
        "about.3": "لماذا Tickwell؟",
        "about.4": "أُنشئ Tickwell ليجعل المذاكرة أسهل وأكثر تنظيمًا. سواء كنت تذاكر للمدرسة أو الجامعة أو تعمل على مشاريعك الشخصية، يمكنك استخدام Tickwell لإدارة وقتك والحفاظ على تركيزك.",
        "about.5": "بسيط. مركّز. مجاني.",
        "about.6": "يركّز Tickwell على توفير الأدوات الأساسية التي تحتاجها لجلسة مذاكرة مثمرة، مع إبقاء التجربة بسيطة وخالية من المشتتات.",
        "howto.0": "طريقة استخدام Tickwell",
        "howto.1": "صُمّم Tickwell ليجعل المذاكرة بسيطة ومركّزة. اتبع هذه الخطوات لتبدأ باستخدام المؤقت.",
        "howto.2": "1. ابدأ المؤقت",
        "howto.3": "افتح Tickwell واضغط زر <strong>ابدأ</strong> لتبدأ جلسة المذاكرة.",
        "howto.4": "2. ركّز في عملك",
        "howto.5": "بمجرد أن يبدأ المؤقت، ركّز في مذاكرتك أو قراءتك أو واجباتك أو أي مهمة تريد إنجازها.",
        "howto.6": "3. أوقف المؤقت مؤقتًا",
        "howto.7": "اضغط زر <strong>إيقاف</strong> في أي وقت تريد فيه إيقاف جلسة المذاكرة مؤقتًا.",
        "howto.8": "4. أعد ضبط المؤقت",
        "howto.9": "اضغط زر <strong>إعادة الضبط</strong> لإعادة المؤقت إلى 00:00:00 وبدء جلسة جديدة.",
        "howto.10": "5. غيّر الوضع",
        "howto.11": "استخدم زر الوضع للتبديل بين الوضع الداكن والوضع الساطع حسب تفضيلك.",
        "howto.12": "6. استخدم وضع ملء الشاشة",
        "howto.13": "اضغط زر ملء الشاشة ليملأ المؤقت الشاشة وتقلّ المشتتات أثناء المذاكرة.",
        "howto.14": "7. اختصارات لوحة المفاتيح",
        "howto.15": "على الحاسوب، يمكنك التحكم في Tickwell من لوحة المفاتيح: <strong>Space</strong> للبدء أو الإيقاف المؤقت، و<strong>Shift + R</strong> لإعادة الضبط، و<strong>F</strong> لملء الشاشة، و<strong>T</strong> لتغيير الوضع، و<strong>M</strong> للتبديل بين ساعة الإيقاف وبومودورو، و<strong>?</strong> لعرض قائمة الاختصارات.",
        "howto.16": "نصائح للمذاكرة",
        "howto.17": "اختر مهمة محددة قبل تشغيل المؤقت، وحاول البقاء مركّزًا حتى تنتهي جلسة المذاكرة.",
        "howto.18": "يمكنك استخدام Tickwell لجلسات مذاكرة قصيرة أو لفترات أطول حسب جدولك.",
        "privacy.0": "سياسة الخصوصية",
        "privacy.1": "خصوصيتك تهمّنا. توضّح سياسة الخصوصية هذه كيف يتعامل Tickwell مع المعلومات عند استخدامك لموقعنا.",
        "privacy.2": "المعلومات التي نجمعها",
        "privacy.3": "يمكنك استخدام المؤقت الرئيسي دون إنشاء حساب. إذا اخترت إنشاء حساب، فنحن نجمع عنوان البريد الإلكتروني الذي تسجّل به، وتتم معالجة كلمة السر عبر خدمة Firebase Authentication (وهي خدمة من Google). وإذا أرسلت رسالة عبر صفحة التواصل، فإن اسمك وبريدك الإلكتروني ورسالتك تصلنا عبر خدمة Formspree.",
        "privacy.4": "التخزين المحلي",
        "privacy.5": "يستخدم Tickwell التخزين المحلي في متصفحك لتذكّر تفضيلاتك (مثل الوضع)، وحالة المؤقت، وإحصائيات مذاكرتك (مدد الجلسات والهدف اليومي وعدد جلسات بومودورو). تُخزَّن هذه المعلومات حاليًا على جهازك فقط ولا تُرسَل إلينا. ومسح بيانات المتصفح سيؤدي إلى حذفها.",
        "privacy.6": "ملفات تعريف الارتباط (الكوكيز)",
        "privacy.7": "لا يتطلب Tickwell ملفات تعريف ارتباط للتشغيل الأساسي لمؤقت المذاكرة. أما Google Analytics، الذي نستخدمه لفهم كيفية استخدام الموقع، فقد يضع ملفات تعريف ارتباط في متصفحك.",
        "privacy.8": "خدمات الأطراف الثالثة",
        "privacy.9": "يستخدم Tickwell خدمة Google Analytics لقياس استخدام الموقع، وخدمة Firebase Authentication لتوفير تسجيل الدخول الاختياري بالبريد الإلكتروني، وخدمة Formspree لتوصيل الرسائل المرسلة عبر نموذج التواصل. لهذه الخدمات سياسات خصوصية خاصة بها. وإذا أضفنا خدمات أخرى مستقبلًا فسيتم تحديث سياسة الخصوصية هذه.",
        "privacy.10": "خصوصية الأطفال",
        "privacy.11": "Tickwell مؤقت مذاكرة عام الاستخدام، ولا يطلب من الأطفال عن علم تقديم معلومات شخصية لاستخدام الميزات الأساسية للموقع.",
        "privacy.12": "أمان البيانات",
        "privacy.13": "نسعى إلى إبقاء Tickwell بسيطًا وتقليل المعلومات المطلوبة لاستخدام الموقع. وبما أنه لا يوجد موقع أو خدمة إلكترونية تضمن الأمان الكامل، ننصح المستخدمين بتجنّب إرسال معلومات شخصية غير ضرورية.",
        "privacy.14": "التغييرات على سياسة الخصوصية",
        "privacy.15": "قد يتم تحديث سياسة الخصوصية هذه من وقت لآخر إذا تغيّرت ميزات Tickwell أو خدماته. وسيتم نشر أي تغييرات على هذه الصفحة.",
        "privacy.16": "تواصل معنا",
        "privacy.17": "إذا كانت لديك أسئلة حول سياسة الخصوصية هذه أو حول Tickwell، يمكنك التواصل معنا عبر صفحة التواصل.",
        "privacy.18": "<strong>آخر تحديث: أكتوبر 2026</strong>",
        "contact.h1": "تواصل مع Tickwell",
        "contact.intro": "هل لديك سؤال أو اقتراح، أو واجهتك مشكلة؟ أرسل لنا رسالة وستصلنا عبر نظام التواصل لدينا.",
        "contact.name": "الاسم",
        "contact.email": "البريد الإلكتروني",
        "contact.message": "الرسالة",
        "contact.namePh": "اكتب اسمك",
        "contact.emailPh": "اكتب بريدك الإلكتروني",
        "contact.messagePh": "اكتب رسالتك...",
        "contact.send": "إرسال الرسالة",
        "contact.sending": "جارٍ الإرسال...",
        "contact.success": "تم إرسال رسالتك بنجاح. شكرًا لتواصلك مع Tickwell!",
        "contact.error": "حدث خطأ ما. حاول مرة أخرى.",
        "title.about": "عن Tickwell",
        "title.howto": "طريقة استخدام Tickwell",
        "title.privacy": "سياسة الخصوصية - Tickwell",
        "title.contact": "تواصل مع Tickwell",
        "title.dashboard": "لوحة التحكم - Tickwell",
        "title.settings": "الإعدادات - Tickwell",
        "title.login": "تسجيل الدخول - Tickwell"
});

    Object.assign(DICT.en, {
        "about.0": "About Tickwell",
        "about.1": "Tickwell is a simple and free study timer designed to help you focus on your tasks and organize your study time.",
        "about.2": "With a clean and easy-to-use interface, Tickwell lets you start a study session, track your time, and stay focused without unnecessary distractions.",
        "about.3": "Why Tickwell?",
        "about.4": "Tickwell was created to make studying easier and more organized. Whether you are studying for school, university, or working on personal projects, you can use Tickwell to manage your time and maintain your focus.",
        "about.5": "Simple. Focused. Free.",
        "about.6": "Tickwell focuses on providing the essential tools you need for a productive study session while keeping the experience simple and distraction-free.",
        "howto.0": "How to Use Tickwell",
        "howto.1": "Tickwell is designed to make studying simple and focused. Follow these steps to start using the timer.",
        "howto.2": "1. Start the Timer",
        "howto.3": "Open Tickwell and press the <strong>Start</strong> button to begin your study session.",
        "howto.4": "2. Focus on Your Work",
        "howto.5": "Once the timer starts, focus on your study, reading, homework, or any task you want to complete.",
        "howto.6": "3. Pause the Timer",
        "howto.7": "Press the <strong>Stop</strong> button whenever you want to pause your study session.",
        "howto.8": "4. Reset the Timer",
        "howto.9": "Press the <strong>Reset</strong> button to return the timer to 00:00:00 and start a new session.",
        "howto.10": "5. Change the Theme",
        "howto.11": "Use the theme button to switch between Dark Mode and Bright Mode according to your preference.",
        "howto.12": "6. Use Fullscreen Mode",
        "howto.13": "Press the fullscreen button to make the timer fill the screen and reduce distractions while studying.",
        "howto.14": "7. Keyboard Shortcuts",
        "howto.15": "On a computer, you can control Tickwell from the keyboard: <strong>Space</strong> to start or pause, <strong>Shift + R</strong> to reset, <strong>F</strong> for fullscreen, <strong>T</strong> to change the theme, <strong>M</strong> to switch between Stopwatch and Pomodoro, and <strong>?</strong> to show the list of shortcuts.",
        "howto.16": "Study Tips",
        "howto.17": "Choose a specific task before starting the timer and try to stay focused until your study session is finished.",
        "howto.18": "You can use Tickwell for short study sessions or longer periods depending on your schedule.",
        "privacy.0": "Privacy Policy",
        "privacy.1": "Your privacy is important to us. This Privacy Policy explains how Tickwell handles information when you use our website.",
        "privacy.2": "Information We Collect",
        "privacy.3": "You can use the main timer without creating an account. If you choose to create an account, we collect the email address you register with, and your password is handled by Firebase Authentication (a Google service). If you send a message through the Contact page, your name, email address, and message are sent to us through Formspree.",
        "privacy.4": "Local Storage",
        "privacy.5": "Tickwell uses your browser's local storage to remember your preferences (such as your theme), your timer state, and your study statistics (session durations, daily goal, and Pomodoro counts). This information is currently stored only on your device and is not sent to us. Clearing your browser data will remove it.",
        "privacy.6": "Cookies",
        "privacy.7": "Tickwell does not require cookies for the basic operation of the study timer. Google Analytics, which we use to understand how the website is used, may set cookies in your browser.",
        "privacy.8": "Third-Party Services",
        "privacy.9": "Tickwell uses Google Analytics to measure website usage, Firebase Authentication to provide optional email sign-in, and Formspree to deliver messages sent through the Contact form. These services have their own privacy policies. If we add other services in the future, this Privacy Policy will be updated.",
        "privacy.10": "Children's Privacy",
        "privacy.11": "Tickwell is a general-purpose study timer and does not knowingly require children to provide personal information to use the basic features of the website.",
        "privacy.12": "Data Security",
        "privacy.13": "We aim to keep Tickwell simple and minimize the amount of information required to use the website. Since no website or online service can guarantee complete security, users should avoid submitting unnecessary personal information.",
        "privacy.14": "Changes to This Privacy Policy",
        "privacy.15": "This Privacy Policy may be updated from time to time if Tickwell's features or services change. Any changes will be published on this page.",
        "privacy.16": "Contact",
        "privacy.17": "If you have questions about this Privacy Policy or Tickwell, you can contact us through the Contact page.",
        "privacy.18": "<strong>Last updated: October 2026</strong>",
        "contact.h1": "Contact Tickwell",
        "contact.intro": "Have a question, suggestion, or found a problem? Send us a message and we will receive it through our contact system.",
        "contact.name": "Name",
        "contact.email": "Email",
        "contact.message": "Message",
        "contact.namePh": "Enter your name",
        "contact.emailPh": "Enter your email",
        "contact.messagePh": "Write your message...",
        "contact.send": "Send Message",
        "contact.sending": "Sending...",
        "contact.success": "Your message has been sent successfully. Thank you for contacting Tickwell!",
        "contact.error": "Something went wrong. Please try again.",
        "title.about": "About Tickwell",
        "title.howto": "How to Use Tickwell",
        "title.privacy": "Privacy Policy - Tickwell",
        "title.contact": "Contact Tickwell",
        "title.dashboard": "Dashboard - Tickwell",
        "title.settings": "Settings - Tickwell",
        "title.login": "Login - Tickwell"
});


    /* المزامنة والتطبيق */
    Object.assign(DICT.ar, {
        "sec.account": "الحساب والمزامنة",
        "sync.signedOut": "غير مسجّل دخول",
        "sync.signedOutHint": "سجّل دخولك لمزامنة إحصائياتك وإعداداتك على كل أجهزتك.",
        "sync.syncing": "جارٍ المزامنة...",
        "sync.synced": "متزامن ✓",
        "sync.error": "تعذّرت المزامنة",
        "sync.errorHint": "تأكد من اتصالك بالإنترنت ومن تفعيل قاعدة بيانات Firestore وقواعدها، ثم اضغط زامن الآن.",
        "sync.account": "الحساب: {email}",
        "sync.last": "آخر مزامنة: {time}",
        "sync.now": "زامن الآن",
        "dash.synced": "الإحصائيات متزامنة مع حسابك وتظهر على كل أجهزتك.",
        "sec.app": "التطبيق",
        "pwa.install": "ثبّت Tickwell كتطبيق",
        "pwa.installHint": "يفتح من شاشتك الرئيسية كأي تطبيق، ويشتغل المؤقت حتى بدون إنترنت.",
        "pwa.installBtn": "تثبيت",
        "pwa.installed": "التطبيق مثبّت على هذا الجهاز ✓",
        "pwa.ios": "على iPhone أو iPad: اضغط زر المشاركة في Safari ثم \"إضافة إلى الشاشة الرئيسية\".",
        "pwa.manual": "لو زر التثبيت مش ظاهر، افتح قائمة المتصفح (⋮) واختار \"تثبيت التطبيق\" أو \"إضافة إلى الشاشة الرئيسية\".",
        "privacy.3": "يمكنك استخدام المؤقت الرئيسي دون إنشاء حساب. إذا اخترت إنشاء حساب، فنحن نجمع عنوان البريد الإلكتروني الذي تسجّل به، وتتم معالجة كلمة السر عبر خدمة Firebase Authentication (وهي خدمة من Google). وعند تسجيل الدخول، تُحفظ إحصائيات مذاكرتك وبعض تفضيلاتك (اللغة والوضع ومدد بومودورو وإعدادات الصوت) في حسابك باستخدام Google Cloud Firestore لتتم مزامنتها بين أجهزتك. وإذا أرسلت رسالة عبر صفحة التواصل، فإن اسمك وبريدك الإلكتروني ورسالتك تصلنا عبر خدمة Formspree.",
        "privacy.5": "يستخدم Tickwell التخزين المحلي في متصفحك لتذكّر تفضيلاتك (مثل الوضع)، وحالة المؤقت، وإحصائيات مذاكرتك (مدد الجلسات والهدف اليومي وعدد جلسات بومودورو). إذا لم تكن مسجّلًا للدخول فتبقى هذه المعلومات على جهازك فقط ولا تُرسَل إلينا، وإذا سجّلت الدخول فتتم مزامنتها أيضًا مع حسابك كما هو موضّح أعلاه. ومسح بيانات المتصفح يحذف النسخة المحلية، وتسجيل الخروج يزيل إحصائياتك من الجهاز (وتبقى محفوظة في حسابك). كما يحفظ Tickwell نسخًا من ملفاته في متصفحك ليعمل دون إنترنت.",
        "privacy.9": "يستخدم Tickwell خدمة Google Analytics لقياس استخدام الموقع، وخدمة Firebase Authentication لتوفير تسجيل الدخول الاختياري بالبريد الإلكتروني، وخدمة Google Cloud Firestore لحفظ البيانات المتزامنة للمستخدمين المسجّلين، وخدمة Formspree لتوصيل الرسائل المرسلة عبر نموذج التواصل. لهذه الخدمات سياسات خصوصية خاصة بها. وإذا أضفنا خدمات أخرى مستقبلًا فسيتم تحديث سياسة الخصوصية هذه."
});

    Object.assign(DICT.en, {
        "sec.account": "Account & sync",
        "sync.signedOut": "Not signed in",
        "sync.signedOutHint": "Log in to sync your statistics and settings across all your devices.",
        "sync.syncing": "Syncing...",
        "sync.synced": "Synced ✓",
        "sync.error": "Sync failed",
        "sync.errorHint": "Check your internet connection and that the Firestore database and its rules are set up, then press Sync now.",
        "sync.account": "Account: {email}",
        "sync.last": "Last synced: {time}",
        "sync.now": "Sync now",
        "dash.synced": "Your statistics are synced with your account and available on all your devices.",
        "sec.app": "App",
        "pwa.install": "Install Tickwell as an app",
        "pwa.installHint": "Opens from your home screen like any app, and the timer works even without internet.",
        "pwa.installBtn": "Install",
        "pwa.installed": "The app is installed on this device ✓",
        "pwa.ios": "On iPhone or iPad: tap the Share button in Safari, then \"Add to Home Screen\".",
        "pwa.manual": "If the install button isn't showing, open your browser menu (⋮) and choose \"Install app\" or \"Add to Home screen\".",
        "privacy.3": "You can use the main timer without creating an account. If you choose to create an account, we collect the email address you register with, and your password is handled by Firebase Authentication (a Google service). If you sign in, your study statistics and some preferences (language, theme, Pomodoro durations, and sound settings) are stored in your account using Google Cloud Firestore so they can sync across your devices. If you send a message through the Contact page, your name, email address, and message are sent to us through Formspree.",
        "privacy.5": "Tickwell uses your browser's local storage to remember your preferences (such as your theme), your timer state, and your study statistics (session durations, daily goal, and Pomodoro counts). If you are not signed in, this information stays only on your device and is not sent to us. If you sign in, it is also synced to your account as described above. Clearing your browser data removes the local copy, and signing out removes your statistics from the device (they remain in your account). Tickwell also stores copies of its own files in your browser so it can work offline.",
        "privacy.9": "Tickwell uses Google Analytics to measure website usage, Firebase Authentication to provide optional email sign-in, Google Cloud Firestore to store synced data for signed-in users, and Formspree to deliver messages sent through the Contact form. These services have their own privacy policies. If we add other services in the future, this Privacy Policy will be updated."
});


    /* المنبه */
    Object.assign(DICT.ar, {
        "set.test": "تجربة صوت التركيز",
        "set.testAlarm": "تجربة المنبه",
        "set.alarm": "منبه نهاية الراحة",
        "set.alarmHint": "يرنّ باستمرار لحد ما تضغط \"أنا هنا\"، وبعدها تبدأ جلسة التركيز.",
        "alarm.title": "انتهت الراحة!",
        "alarm.text": "جاهز ترجع للتركيز؟",
        "alarm.here": "أنا هنا"
});

    Object.assign(DICT.en, {
        "set.test": "Test focus sound",
        "set.testAlarm": "Test alarm",
        "set.alarm": "Break-end alarm",
        "set.alarmHint": "Rings until you press \"I'm here\", then the focus session starts.",
        "alarm.title": "Break's over!",
        "alarm.text": "Ready to get back to focus?",
        "alarm.here": "I'm here"
});


    /* الخصوصية وحذف الحساب */
    Object.assign(DICT.ar, {
        "consent.text": "نستخدم Google Analytics لفهم كيفية استخدام الموقع وتحسينه. هل توافق على ملفات تعريف الارتباط (الكوكيز) الخاصة به؟",
        "consent.accept": "موافق",
        "consent.decline": "رفض",
        "consent.more": "سياسة الخصوصية",
        "set.analytics": "التحليلات (Google Analytics)",
        "set.analyticsHint": "تساعدنا في معرفة كيف يُستخدم الموقع. تقدر تغيّر اختيارك في أي وقت.",
        "sec.privacy": "الخصوصية",
        "acct.delete": "حذف حسابي",
        "acct.deleteHint": "يحذف حسابك وكل بياناتك المتزامنة نهائيًا ولا يمكن التراجع.",
        "acct.confirmTitle": "حذف الحساب نهائيًا؟",
        "acct.confirmText": "اكتب كلمة السر لتأكيد حذف حسابك وكل بياناتك المحفوظة في السحابة. ستُمسح الإحصائيات من هذا الجهاز أيضًا، فصدّر بياناتك أولًا لو عايز نسخة.",
        "acct.password": "كلمة السر",
        "acct.confirmBtn": "احذف حسابي نهائيًا",
        "acct.cancel": "إلغاء",
        "acct.wrong": "كلمة السر غير صحيحة.",
        "acct.error": "تعذّر حذف الحساب. حاول مرة أخرى.",
        "acct.deleted": "تم حذف حسابك.",
        "privacy.3": "يمكنك استخدام المؤقت الرئيسي دون إنشاء حساب. إذا اخترت إنشاء حساب، فنحن نجمع عنوان البريد الإلكتروني الذي تسجّل به، وتتم معالجة كلمة السر عبر خدمة Firebase Authentication (وهي خدمة من Google). وعند تسجيل الدخول، تُحفظ إحصائيات مذاكرتك وبعض تفضيلاتك (اللغة والوضع ومدد بومودورو وإعدادات الصوت) في حسابك باستخدام Google Cloud Firestore لتتم مزامنتها بين أجهزتك، ويمكنك حذف حسابك وكل بياناتك المتزامنة في أي وقت من صفحة الإعدادات. وإذا أرسلت رسالة عبر صفحة التواصل، فإن اسمك وبريدك الإلكتروني ورسالتك تصلنا عبر خدمة Formspree.",
        "privacy.7": "لا يتطلب Tickwell ملفات تعريف ارتباط للتشغيل الأساسي لمؤقت المذاكرة. أما Google Analytics، الذي نستخدمه لفهم كيفية استخدام الموقع، فلا يتم تحميله إلا إذا وافقت عليه في إشعار الكوكيز، وقد يضع ملفات تعريف ارتباط في متصفحك. ويمكنك تغيير اختيارك في أي وقت من صفحة الإعدادات."
});

    Object.assign(DICT.en, {
        "consent.text": "We use Google Analytics to understand how the site is used and to improve it. Do you accept its cookies?",
        "consent.accept": "Accept",
        "consent.decline": "Decline",
        "consent.more": "Privacy Policy",
        "set.analytics": "Analytics (Google Analytics)",
        "set.analyticsHint": "Helps us understand how the site is used. You can change your choice at any time.",
        "sec.privacy": "Privacy",
        "acct.delete": "Delete my account",
        "acct.deleteHint": "Permanently deletes your account and all synced data. This can't be undone.",
        "acct.confirmTitle": "Delete your account permanently?",
        "acct.confirmText": "Enter your password to confirm deleting your account and all data saved in the cloud. Your statistics will also be removed from this device, so export your data first if you want a copy.",
        "acct.password": "Password",
        "acct.confirmBtn": "Delete my account permanently",
        "acct.cancel": "Cancel",
        "acct.wrong": "Incorrect password.",
        "acct.error": "Couldn't delete the account. Please try again.",
        "acct.deleted": "Your account was deleted.",
        "privacy.3": "You can use the main timer without creating an account. If you choose to create an account, we collect the email address you register with, and your password is handled by Firebase Authentication (a Google service). If you sign in, your study statistics and some preferences (language, theme, Pomodoro durations, and sound settings) are stored in your account using Google Cloud Firestore so they can sync across your devices, and you can delete your account and all synced data at any time from the Settings page. If you send a message through the Contact page, your name, email address, and message are sent to us through Formspree.",
        "privacy.7": "Tickwell does not require cookies for the basic operation of the study timer. Google Analytics, which we use to understand how the website is used, is loaded only if you accept it in the cookie notice, and it may set cookies in your browser. You can change your choice at any time on the Settings page."
});


    /* الصفحة الرئيسية و404 وأقسام طريقة الاستخدام الجديدة */
    Object.assign(DICT.ar, {
        "home.h2": "عن مؤقت المذاكرة Tickwell",
        "home.p1": "Tickwell مؤقت مذاكرة مجاني وبسيط يساعدك على التركيز وتنظيم وقتك. استخدمه كساعة إيقاف لتتبّع وقت مذاكرتك، أو بنظام بومودورو (فترة تركيز ثم راحة) للحفاظ على نشاطك، من غير إعلانات مزعجة ولا تسجيل إجباري.",
        "home.q1": "ما هي طريقة بومودورو؟",
        "home.a1": "طريقة لتنظيم الوقت تقوم على فترات تركيز قصيرة تتبعها راحة قصيرة، وبعد عدة جلسات تأتي راحة أطول. في Tickwell الافتراضي هو 45 دقيقة تركيز و15 دقيقة راحة، ويمكنك تغيير المدد من الإعدادات.",
        "home.q2": "هل Tickwell مجاني؟",
        "home.a2": "نعم، مجاني بالكامل ويعمل من المتصفح مباشرة. إنشاء حساب اختياري، وفائدته الوحيدة مزامنة إحصائياتك وإعداداتك بين أجهزتك.",
        "home.q3": "هل يعمل بدون إنترنت؟",
        "home.a3": "نعم. يمكنك تثبيت Tickwell كتطبيق من صفحة الإعدادات، فيعمل المؤقت حتى بدون اتصال بالإنترنت.",
        "home.q4": "كيف أتابع تقدّمي في المذاكرة؟",
        "home.a4": "من لوحة التحكم تشاهد وقت مذاكرتك اليوم وهذا الأسبوع وهذا الشهر، وعدد الأيام المتتالية التي ذاكرت فيها، وتقدّمك نحو هدفك اليومي.",
        "e404.title": "الصفحة غير موجودة",
        "e404.text": "الرابط الذي فتحته غير موجود أو تم نقله.",
        "e404.home": "العودة للرئيسية",
        "title.404": "الصفحة غير موجودة - Tickwell",
        "howto.n1": "8. وضع بومودورو",
        "howto.n2": "بدّل إلى وضع بومودورو من المفتاح الموجود فوق المؤقت. يعدّ Tickwell وقت التركيز تنازليًا (45 دقيقة افتراضيًا) ثم وقت الراحة. عند انتهاء التركيز يصدر صوت جرس، وعند انتهاء الراحة يرنّ منبه حتى تضغط زر <strong>أنا هنا</strong>. ويمكنك تغيير المدد من الإعدادات.",
        "howto.n3": "9. لوحة التحكم والهدف اليومي",
        "howto.n4": "افتح لوحة التحكم من القائمة لتشاهد وقت مذاكرتك اليوم وهذا الأسبوع وهذا الشهر، وعدد الأيام المتتالية، وتقدّمك نحو هدفك اليومي الذي تحدده بنفسك.",
        "howto.n5": "10. الإعدادات والمزامنة",
        "howto.n6": "من الإعدادات يمكنك التبديل بين العربية والإنجليزية، واختيار الوضع الداكن أو الساطع أو التلقائي، وضبط الصوت والإشعارات، وتثبيت Tickwell كتطبيق. وسجّل الدخول ببريدك الإلكتروني لمزامنة إحصائياتك بين كل أجهزتك."
});

    Object.assign(DICT.en, {
        "home.h2": "About the Tickwell study timer",
        "home.p1": "Tickwell is a free, simple study timer that helps you focus and organize your time. Use it as a stopwatch to track your study time, or with the Pomodoro method (a focus period followed by a break) to stay fresh, with no annoying ads and no required sign-up.",
        "home.q1": "What is the Pomodoro method?",
        "home.a1": "A time-management method built on short focus periods followed by short breaks, with a longer break after a few sessions. In Tickwell the default is 45 minutes of focus and 15 minutes of break, and you can change the durations in Settings.",
        "home.q2": "Is Tickwell free?",
        "home.a2": "Yes, it is completely free and runs directly in your browser. Creating an account is optional and only lets you sync your statistics and settings across your devices.",
        "home.q3": "Does it work offline?",
        "home.a3": "Yes. You can install Tickwell as an app from the Settings page, and the timer keeps working even without an internet connection.",
        "home.q4": "How do I track my progress?",
        "home.a4": "The Dashboard shows your study time for today, this week and this month, your streak of consecutive study days, and your progress toward your daily goal.",
        "e404.title": "Page not found",
        "e404.text": "The page you opened doesn't exist or has moved.",
        "e404.home": "Back to home",
        "title.404": "Page not found - Tickwell",
        "howto.n1": "8. Pomodoro Mode",
        "howto.n2": "Switch to Pomodoro mode with the toggle above the timer. Tickwell counts down your focus time (45 minutes by default) and then your break. A chime plays when focus ends, and an alarm rings at the end of the break until you press <strong>I'm here</strong>. You can change the durations in Settings.",
        "howto.n3": "9. Dashboard & Daily Goal",
        "howto.n4": "Open the Dashboard from the menu to see your study time for today, this week and this month, your streak of consecutive days, and your progress toward the daily goal you set.",
        "howto.n5": "10. Settings & Sync",
        "howto.n6": "In Settings you can switch between Arabic and English, choose a dark, light or automatic theme, adjust sounds and notifications, and install Tickwell as an app. Log in with your email to sync your statistics across all your devices."
});


    /* المواد وملء الشاشة */
    Object.assign(DICT.ar, {
        "subject.label": "المادة",
        "subject.none": "بدون مادة",
        "subject.add": "＋ مادة جديدة",
        "subject.placeholder": "اسم المادة ثم Enter",
        "subject.locked": "أوقف المؤقت لتغيير المادة",
        "fullscreen.exit": "خروج من ملء الشاشة",
        "dash.subjects": "📚 الوقت حسب المادة",
        "dash.subjectsEmpty": "لسه مفيش مواد مسجلة. اختار مادة من الصفحة الرئيسية قبل ما تبدأ المؤقت، وهتظهر هنا.",
        "dash.untagged": "بدون مادة",
        "sec.subjects": "المواد",
        "set.subjectsHint": "أضف موادك واختار منها قبل تشغيل المؤقت، وهتشوف وقت كل مادة في لوحة التحكم. حذف مادة لا يمسح وقتها القديم.",
        "set.subjectName": "اسم المادة",
        "set.addSubject": "إضافة",
        "set.removeSubject": "حذف المادة",
        "set.subjectsEmpty": "لسه مفيش مواد.",
        "privacy.3": "يمكنك استخدام المؤقت الرئيسي دون إنشاء حساب. إذا اخترت إنشاء حساب، فنحن نجمع عنوان البريد الإلكتروني الذي تسجّل به، وتتم معالجة كلمة السر عبر خدمة Firebase Authentication (وهي خدمة من Google). وعند تسجيل الدخول، تُحفظ إحصائيات مذاكرتك وبعض تفضيلاتك (اللغة والوضع ومدد بومودورو وإعدادات الصوت وأسماء المواد التي تنشئها) في حسابك باستخدام Google Cloud Firestore لتتم مزامنتها بين أجهزتك، ويمكنك حذف حسابك وكل بياناتك المتزامنة في أي وقت من صفحة الإعدادات. وإذا أرسلت رسالة عبر صفحة التواصل، فإن اسمك وبريدك الإلكتروني ورسالتك تصلنا عبر خدمة Formspree."
});

    Object.assign(DICT.en, {
        "subject.label": "Subject",
        "subject.none": "No subject",
        "subject.add": "+ New subject",
        "subject.placeholder": "Subject name, then Enter",
        "subject.locked": "Stop the timer to change the subject",
        "fullscreen.exit": "Exit fullscreen",
        "dash.subjects": "📚 Time by subject",
        "dash.subjectsEmpty": "No subjects recorded yet. Pick a subject on the home page before starting the timer and it will show up here.",
        "dash.untagged": "No subject",
        "sec.subjects": "Subjects",
        "set.subjectsHint": "Add your subjects and pick one before starting the timer, then see the time for each subject on the Dashboard. Deleting a subject doesn't erase its past time.",
        "set.subjectName": "Subject name",
        "set.addSubject": "Add",
        "set.removeSubject": "Delete subject",
        "set.subjectsEmpty": "No subjects yet.",
        "privacy.3": "You can use the main timer without creating an account. If you choose to create an account, we collect the email address you register with, and your password is handled by Firebase Authentication (a Google service). If you sign in, your study statistics and some preferences (language, theme, Pomodoro durations, sound settings, and the subject names you create) are stored in your account using Google Cloud Firestore so they can sync across your devices, and you can delete your account and all synced data at any time from the Settings page. If you send a message through the Contact page, your name, email address, and message are sent to us through Formspree."
});


    /* ألوان المواد */
    Object.assign(DICT.ar, {
        "set.changeColor": "تغيير اللون"
});

    Object.assign(DICT.en, {
        "set.changeColor": "Change color"
});


    /* الإنجازات وخريطة السنة */
    Object.assign(DICT.ar, {
        "dash.heatmap": "📅 خريطة السنة",
        "dash.heatSummary": "ذاكرت في {n} يوم خلال آخر 12 شهر.",
        "dash.heatLess": "أقل",
        "dash.heatMore": "أكثر",
        "dash.ach": "🏆 الإنجازات",
        "dash.achCount": "فتحت {a} من {b} إنجاز",
        "ach.new": "🏆 إنجاز جديد: {title}",
        "ach.newMore": "🏆 إنجاز جديد: {title} (و{n} أخرى)",
        "ach.first.t": "البداية",
        "ach.first.d": "سجّلت أول جلسة مذاكرة.",
        "ach.streak.t": "{n} أيام متتالية",
        "ach.streak.d": "ذاكرت {n} أيام متتالية.",
        "ach.streakLong.t": "{n} يومًا متتاليًا",
        "ach.streakLong.d": "ذاكرت {n} يومًا متتاليًا.",
        "ach.hours.t": "{n} ساعة مذاكرة",
        "ach.hours.d": "وصل مجموع وقت مذاكرتك إلى {n} ساعة.",
        "ach.pomo.t": "{n} بومودورو",
        "ach.pomo.d": "أكملت {n} جلسة بومودورو.",
        "ach.marathon.t": "الماراثون",
        "ach.marathon.d": "جلسة واحدة لمدة ساعتين أو أكثر.",
        "ach.goal1.t": "هدف اليوم",
        "ach.goal1.d": "حققت هدفك اليومي مرة واحدة.",
        "ach.goal7.t": "المنتظم",
        "ach.goal7.d": "حققت هدفك اليومي {n} مرات."
});

    Object.assign(DICT.en, {
        "dash.heatmap": "📅 Year heatmap",
        "dash.heatSummary": "You studied on {n} days in the last 12 months.",
        "dash.heatLess": "Less",
        "dash.heatMore": "More",
        "dash.ach": "🏆 Achievements",
        "dash.achCount": "{a} of {b} unlocked",
        "ach.new": "🏆 New achievement: {title}",
        "ach.newMore": "🏆 New achievement: {title} (+{n} more)",
        "ach.first.t": "First step",
        "ach.first.d": "You logged your first study session.",
        "ach.streak.t": "{n}-day streak",
        "ach.streak.d": "You studied {n} days in a row.",
        "ach.streakLong.t": "{n}-day streak",
        "ach.streakLong.d": "You studied {n} days in a row.",
        "ach.hours.t": "{n} study hours",
        "ach.hours.d": "Your total study time reached {n} hours.",
        "ach.pomo.t": "{n} Pomodoros",
        "ach.pomo.d": "You completed {n} Pomodoro sessions.",
        "ach.marathon.t": "Marathon",
        "ach.marathon.d": "A single session of 2 hours or more.",
        "ach.goal1.t": "Daily goal",
        "ach.goal1.d": "You reached your daily goal once.",
        "ach.goal7.t": "Consistent",
        "ach.goal7.d": "You reached your daily goal {n} times."
});


    /* جملة وصف الموقع أسفل الصفحة الرئيسية */
    Object.assign(DICT.ar, {
        "home.foot": "مؤقت مذاكرة مجاني بنظام بومودورو وساعة إيقاف، مع إحصائيات وهدف يومي.",
        "home.footLink": "تعرّف على Tickwell"
});

    Object.assign(DICT.en, {
        "home.foot": "is a free study timer with Pomodoro, stopwatch, statistics and daily goals.",
        "home.footLink": "Learn more about Tickwell"
});


    /* ========================= */
    /* التحميل والحفظ */
    /* ========================= */

    function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }


    function detectLang() {
        try {
            return String(navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
        } catch (e) {
            return "en";
        }
    }


    function clamp(value, min, max, fallback) {
        const n = Math.round(Number(value));

        if (!isFinite(n)) return fallback;

        return Math.min(max, Math.max(min, n));
    }


    function sanitize(s) {
        const d = DEFAULTS;

        if (s.lang !== "ar" && s.lang !== "en") s.lang = detectLang();
        if (!["dark", "light", "auto"].includes(s.theme)) s.theme = "dark";

        s.pomo.focus = clamp(s.pomo.focus, 1, 180, d.pomo.focus);
        s.pomo.short = clamp(s.pomo.short, 1, 60, d.pomo.short);
        s.pomo.long = clamp(s.pomo.long, 1, 120, d.pomo.long);
        s.pomo.sessions = clamp(s.pomo.sessions, 1, 10, d.pomo.sessions);
        s.pomo.auto = !!s.pomo.auto;
        s.pomo.alarm = !!s.pomo.alarm;

        s.sound = !!s.sound;
        s.notifications = !!s.notifications;
        s.wakeLock = !!s.wakeLock;
        s.shortcuts = !!s.shortcuts;

        const v = Number(s.volume);

        s.volume = isFinite(v) ? Math.min(1, Math.max(0, v)) : d.volume;

        s.updatedAt = Number(s.updatedAt) || 0;

        s.subjects = Array.isArray(s.subjects)
            ? Array.from(new Set(
                s.subjects.map((x) => String(x).trim().slice(0, 30)).filter(Boolean)
            )).slice(0, 20)
            : [];

        s.subject = s.subjects.includes(s.subject) ? s.subject : "";

        /* ألوان المواد: لون من القايمة، وأي مادة من غير لون ياخد أقل لون مستخدم */
        const rawColors =
            s.subjectColors && typeof s.subjectColors === "object" && !Array.isArray(s.subjectColors)
                ? s.subjectColors
                : {};

        const colors = {};

        Object.keys(rawColors).slice(0, 60).forEach((name) => {
            if (SUBJECT_PALETTE.includes(rawColors[name])) colors[name] = rawColors[name];
        });

        s.subjects.forEach((name) => {
            if (colors[name]) return;

            const used = {};

            s.subjects.forEach((other) => {
                if (colors[other]) used[colors[other]] = (used[colors[other]] || 0) + 1;
            });

            colors[name] = SUBJECT_PALETTE.slice()
                .sort((a, b) => (used[a] || 0) - (used[b] || 0))[0];
        });

        s.subjectColors = colors;

        return s;
    }


    function load() {
        const s = clone(DEFAULTS);
        let saved = null;

        try {
            saved = JSON.parse(localStorage.getItem(KEY));
        } catch (e) {}

        if (saved && typeof saved === "object") {
            Object.keys(s).forEach((k) => {
                if (k === "pomo") {
                    Object.assign(s.pomo, saved.pomo || {});
                } else if (saved[k] !== undefined) {
                    s[k] = saved[k];
                }
            });
        } else {
            /* أول مرة: نحافظ على الوضع القديم المحفوظ */
            try {
                s.theme = localStorage.getItem("theme") === "light" ? "light" : "dark";
            } catch (e) {}
        }

        return sanitize(s);
    }


    let settings = load();


    function save() {
        try {
            localStorage.setItem(KEY, JSON.stringify(settings));
        } catch (e) {}
    }


    /* ========================= */
    /* الوضع (داكن / ساطع / تلقائي) */
    /* ========================= */

    function resolvedTheme() {
        if (settings.theme === "auto") {
            try {
                return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
            } catch (e) {
                return "dark";
            }
        }

        return settings.theme;
    }


    /* الصفحات القديمة بتقرأ مفتاح "theme" فنخليه متزامن */
    function syncLegacyTheme() {
        try {
            localStorage.setItem("theme", resolvedTheme());
        } catch (e) {}
    }


    /* ========================= */
    /* الترجمة والتطبيق على الصفحة */
    /* ========================= */

    function t(key, vars) {
        const table = DICT[settings.lang] || DICT.en;
        let text = table[key];

        if (text === undefined) text = DICT.en[key];
        if (text === undefined) return key;

        if (vars) {
            Object.keys(vars).forEach((name) => {
                text = text.split("{" + name + "}").join(vars[name]);
            });
        }

        return text;
    }


    function locale() {
        return settings.lang === "ar" ? "ar-EG-u-nu-latn" : "en-US";
    }


    function applyI18n(root) {
        root = root || document;

        root.querySelectorAll("[data-i18n]").forEach((el) => {
            el.textContent = t(el.getAttribute("data-i18n"));
        });

        /* نصوص فيها تنسيق (مثل <strong>) من قاموسنا نحن فقط */
        root.querySelectorAll("[data-i18n-html]").forEach((el) => {
            el.innerHTML = t(el.getAttribute("data-i18n-html"));
        });

        [
            ["data-i18n-placeholder", "placeholder"],
            ["data-i18n-title", "title"],
            ["data-i18n-aria", "aria-label"]
        ].forEach(([source, target]) => {
            root.querySelectorAll("[" + source + "]").forEach((el) => {
                el.setAttribute(target, t(el.getAttribute(source)));
            });
        });
    }


    function applyHtmlAttrs() {
        const html = document.documentElement;

        if (html.hasAttribute("data-i18n-page")) html.lang = settings.lang;
        if (html.hasAttribute("data-rtl")) html.dir = settings.lang === "ar" ? "rtl" : "ltr";
    }


    /* زر تسجيل الدخول (فوق جنب القايمة): بيظهر لو المستخدم مش مسجّل دخول */
    function ensureLoginButton() {
        if (document.documentElement.hasAttribute("data-no-login-btn")) return;
        if (!document.querySelector(".menu-container")) return;

        let button = document.getElementById("loginButton");

        if (!button) {
            button = document.createElement("a");

            button.id = "loginButton";
            button.className = "login-button";
            button.href = "login.html";
            button.setAttribute("data-i18n", "menu.login");

            document.body.appendChild(button);
        }

        let hint = null;

        try {
            hint = localStorage.getItem("tickwellAuthHint");
        } catch (e) {}

        button.hidden = hint === "in";
    }


    function applyPage() {
        applyHtmlAttrs();

        if (!document.body) return;

        ensureLoginButton();

        document.body.classList.toggle("light-mode", resolvedTheme() === "light");

        const themeMeta = document.querySelector('meta[name="theme-color"]');

        if (themeMeta) {
            themeMeta.setAttribute("content", resolvedTheme() === "light" ? "#ffffff" : "#000000");
        }

        const titleKey = document.documentElement.getAttribute("data-title-key");

        if (titleKey) document.title = t(titleKey);

        document.querySelectorAll(".menu-container").forEach((el) => {
            el.dir = settings.lang === "ar" ? "rtl" : "ltr";
        });

        /* عناصر اتجاهها بيتبع اللغة (مثلاً نص في صفحة اتجاهها ثابت) */
        document.querySelectorAll("[data-lang-dir]").forEach((el) => {
            el.dir = settings.lang === "ar" ? "rtl" : "ltr";
        });

        applyI18n(document);
    }


    function notifyChange() {
        window.dispatchEvent(new CustomEvent("tickwell:settings"));
    }


    /* ========================= */
    /* التحديث من الخارج */
    /* ========================= */

    function update(patch) {
        patch = patch || {};

        Object.keys(patch).forEach((k) => {
            if (k === "pomo") {
                Object.assign(settings.pomo, patch.pomo);
            } else {
                settings[k] = patch[k];
            }
        });

        /* نحدّث وقت التغيير فقط لو اتغيرت إعدادات متزامنة */
        if (Object.keys(patch).some((k) => SYNCED.includes(k))) {
            settings.updatedAt = Date.now();
        }

        settings = sanitize(settings);

        save();
        syncLegacyTheme();
        applyPage();
        notifyChange();
    }


    /* الإعدادات اللي بتتبعت للسحابة */
    function getSyncable() {
        const out = { updatedAt: settings.updatedAt };

        SYNCED.forEach((k) => {
            out[k] = clone(settings[k]);
        });

        return out;
    }


    /* إعدادات جاية من السحابة */
    function applyRemote(remote) {
        if (!remote || typeof remote !== "object") return;

        ["lang", "theme", "sound", "volume", "subjects", "subjectColors"].forEach((k) => {
            if (remote[k] !== undefined) settings[k] = remote[k];
        });

        if (remote.pomo && typeof remote.pomo === "object") {
            Object.assign(settings.pomo, remote.pomo);
        }

        settings.updatedAt = Number(remote.updatedAt) || 0;
        settings = sanitize(settings);

        save();
        syncLegacyTheme();
        applyPage();
        notifyChange();
    }


    function reset() {
        settings = sanitize(clone(DEFAULTS));
        settings.updatedAt = Date.now();

        save();
        syncLegacyTheme();
        applyPage();
        notifyChange();
    }


    /* ========================= */
    /* الصوت */
    /* ========================= */

    let audioCtx = null;

    function initAudio() {
        try {
            if (!audioCtx) {
                audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            }

            if (audioCtx.state === "suspended") {
                audioCtx.resume();
            }
        } catch (e) {}
    }


    function beep(force) {
        if (!settings.sound && !force) return;

        try {
            initAudio();

            if (!audioCtx) return;

            const peak = Math.max(0.0002, settings.volume * 0.6);
            const t0 = audioCtx.currentTime;

            [0, 0.25, 0.5].forEach((delay) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = "sine";
                osc.frequency.value = 880;

                gain.gain.setValueAtTime(0.0001, t0 + delay);
                gain.gain.exponentialRampToValueAtTime(peak, t0 + delay + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + delay + 0.2);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(t0 + delay);
                osc.stop(t0 + delay + 0.22);
            });
        } catch (e) {}
    }


    /* صوت "تنج" لنهاية جلسة التركيز */
    function chime(force) {
        if (!settings.sound && !force) return;

        try {
            initAudio();

            if (!audioCtx) return;

            const peak = Math.max(0.0002, settings.volume * 0.5);
            const t0 = audioCtx.currentTime;
            const base = 1318.5;

            /* جرس: نغمات غير متناسقة بتخفت بسرعات مختلفة */
            [
                [1.0, 1.0, 2.4],
                [2.76, 0.45, 1.5],
                [5.4, 0.22, 0.9],
                [8.93, 0.1, 0.5]
            ].forEach(([ratio, amp, decay]) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = "sine";
                osc.frequency.value = base * ratio;

                gain.gain.setValueAtTime(0.0001, t0);
                gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak * amp), t0 + 0.006);
                gain.gain.exponentialRampToValueAtTime(0.0001, t0 + decay);

                osc.connect(gain);
                gain.connect(audioCtx.destination);

                osc.start(t0);
                osc.stop(t0 + decay + 0.05);
            });
        } catch (e) {}
    }


    /* منبه نهاية الراحة: يتكرر لحد ما نوقفه */
    let alarmSource = null;
    let alarmGain = null;

    function buildAlarmBuffer() {
        const rate = audioCtx.sampleRate;
        const length = Math.floor(rate * 1.6);
        const buffer = audioCtx.createBuffer(1, length, rate);
        const data = buffer.getChannelData(0);

        const beepLength = Math.floor(rate * 0.12);

        [0, 0.2, 0.4, 0.6].forEach((start) => {
            const offset = Math.floor(start * rate);

            for (let i = 0; i < beepLength && offset + i < length; i++) {
                const t = i / rate;
                const w = 2 * Math.PI * 1040 * t;

                const env =
                    Math.min(1, i / (0.008 * rate)) *
                    Math.min(1, (beepLength - i) / (0.02 * rate));

                data[offset + i] =
                    (Math.sin(w) + Math.sin(3 * w) / 3 + Math.sin(5 * w) / 5) * 0.6 * env;
            }
        });

        return buffer;
    }

    function startAlarm(force) {
        if (!settings.sound && !force) return false;

        initAudio();

        if (!audioCtx) return false;
        if (alarmSource) return true;

        try {
            alarmGain = audioCtx.createGain();
            alarmGain.gain.value = Math.max(0.0002, settings.volume * 0.6);

            alarmSource = audioCtx.createBufferSource();
            alarmSource.buffer = buildAlarmBuffer();
            alarmSource.loop = true;

            alarmSource.connect(alarmGain);
            alarmGain.connect(audioCtx.destination);

            alarmSource.start();

            return true;
        } catch (e) {
            alarmSource = null;

            return false;
        }
    }

    function stopAlarm() {
        try {
            if (alarmSource) {
                alarmSource.stop();
                alarmSource.disconnect();
            }

            if (alarmGain) alarmGain.disconnect();
        } catch (e) {}

        alarmSource = null;
        alarmGain = null;
    }

    /* المتصفحات بتوقف الصوت لحد أول لمسة، فنشغّله أول ما المستخدم يتفاعل */
    ["pointerdown", "keydown", "touchstart"].forEach((name) => {
        window.addEventListener(name, () => {
            if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
        }, { passive: true });
    });


    /* ========================= */
    /* التشغيل */
    /* ========================= */

    window.TickwellSettings = {
        get: () => settings,
        update,
        reset,
        getSyncable,
        applyRemote,
        t,
        locale,
        applyI18n,
        resolvedTheme,
        initAudio,
        beep,
        chime,
        subjectColor: (name) => (settings.subjectColors && settings.subjectColors[name]) || "#8a8a8a",
        palette: () => SUBJECT_PALETTE.slice(),
        startAlarm,
        stopAlarm,
        isAlarming: () => !!alarmSource,
        defaults: () => clone(DEFAULTS)
    };

    syncLegacyTheme();
    applyHtmlAttrs();

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyPage);
    } else {
        applyPage();
    }

    /* لو الوضع تلقائي وجهاز المستخدم غيّر وضعه */
    try {
        window.matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => {
            if (settings.theme === "auto") {
                syncLegacyTheme();
                applyPage();
                notifyChange();
            }
        });
    } catch (e) {}

    /* ========================= */
    /* التطبيق (PWA) */
    /* ========================= */

    let installPrompt = null;

    function pwaChanged() {
        window.dispatchEvent(new CustomEvent("tickwell:pwa"));
    }

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        installPrompt = event;
        pwaChanged();
    });

    window.addEventListener("appinstalled", () => {
        installPrompt = null;
        pwaChanged();
    });

    window.TickwellPWA = {
        canInstall: () => !!installPrompt,

        install: async () => {
            if (!installPrompt) return false;

            installPrompt.prompt();

            let outcome = "dismissed";

            try {
                outcome = (await installPrompt.userChoice).outcome;
            } catch (e) {}

            installPrompt = null;
            pwaChanged();

            return outcome === "accepted";
        },

        isStandalone: () => {
            try {
                return window.matchMedia("(display-mode: standalone)").matches ||
                    window.navigator.standalone === true;
            } catch (e) {
                return false;
            }
        },

        isIOS: () => /iphone|ipad|ipod/i.test(navigator.userAgent) ||
            (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
    };

    if ("serviceWorker" in navigator) {
        window.addEventListener("load", () => {
            navigator.serviceWorker.register("./sw.js").catch(() => {});
        });
    }


    /* لو الإعدادات اتغيرت من تاب تاني */
    window.addEventListener("storage", (event) => {
        if (event.key === KEY) {
            settings = load();
            syncLegacyTheme();
            applyPage();
            notifyChange();
        }
    });

})();
