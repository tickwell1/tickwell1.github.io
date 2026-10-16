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
            auto: true           // بدء المرحلة التالية تلقائياً
        },
        sound: true,
        volume: 0.6,             // 0 - 1
        notifications: true,
        wakeLock: true,
        shortcuts: true,
        updatedAt: 0             // وقت آخر تغيير في الإعدادات المتزامنة
    };

    /* الإعدادات اللي بتتزامن مع الحساب (الباقي خاص بكل جهاز) */
    const SYNCED = ["lang", "theme", "pomo", "sound", "volume"];


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

        s.sound = !!s.sound;
        s.notifications = !!s.notifications;
        s.wakeLock = !!s.wakeLock;
        s.shortcuts = !!s.shortcuts;

        const v = Number(s.volume);

        s.volume = isFinite(v) ? Math.min(1, Math.max(0, v)) : d.volume;

        s.updatedAt = Number(s.updatedAt) || 0;

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


    function applyPage() {
        applyHtmlAttrs();

        if (!document.body) return;

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

        ["lang", "theme", "sound", "volume"].forEach((k) => {
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
