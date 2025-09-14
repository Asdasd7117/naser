// ====== إعداد Supabase ======
const SUPABASE_URL = "https://olwguiyogqwzraikq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5c3dxZGRjd3Frd2RsZXB2ZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDA2MjIsImV4cCI6MjA3MzM3NjYyMn0.WbBlOesDGGhFLNp_WI0JFpdvuDgD-A8U4CDIlt8Wvhs";
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ====== اللغة ======
let currentLang = "ar";
const translations = {
  ar: {
    login_title: "تسجيل الدخول",
    role: "الدور:",
    manager: "مدير",
    supervisor: "مشرف",
    delegate: "مندوب",
    email_or_phone: "البريد الإلكتروني / رقم الهاتف:",
    password: "كلمة المرور:",
    login: "تسجيل الدخول",
    forgot_password: "نسيت كلمة المرور؟"
  },
  en: {
    login_title: "Login",
    role: "Role:",
    manager: "Manager",
    supervisor: "Supervisor",
    delegate: "Delegate",
    email_or_phone: "Email / Phone:",
    password: "Password",
    login: "Login",
    forgot_password: "Forgot Password?"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  // تغيير اللغة
  function setLanguage(lang) {
    console.log("Changing language to:", lang);
    currentLang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (translations[lang][key]) {
        el.innerText = translations[lang][key];
      } else {
        console.warn(`Translation key ${key} not found for language ${lang}`);
      }
    });
  }

  // ربط مفتاح اللغة
  const languageSwitcher = document.getElementById("languageSwitcher");
  if (languageSwitcher) {
    languageSwitcher.addEventListener("change", e => {
      setLanguage(e.target.value);
    });
  }
  setLanguage(currentLang);

  // ====== تسجيل الدخول ======
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async e => {
      e.preventDefault();
      const role = loginForm.role.value;
      const identifier = loginForm.email_or_phone.value;
      const password = loginForm.password.value;

      // تسجيل الدخول باستخدام Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: identifier.includes("@") ? identifier : undefined,
        phone: !identifier.includes("@") ? identifier : undefined,
        password,
      });

      if (error || !data.user) {
        return alert(currentLang === "ar" ? "خطأ في تسجيل الدخول: " + (error?.message || "المستخدم غير موجود") : 
                     "Login error: " + (error?.message || "User not found"));
      }

      // التحقق من الدور
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role")
        .eq("id", data.user.id)
        .single();

      if (userError || !userData) {
        return alert(currentLang === "ar" ? "خطأ في استرجاع بيانات المستخدم" : 
                     "Error retrieving user data");
      }

      if (userData.role !== role) {
        return alert(currentLang === "ar" ? "الدور غير صحيح" : "Incorrect role");
      }

      alert(currentLang === "ar" ? "تم تسجيل الدخول بنجاح!" : "Logged in successfully!");
      if (role === "manager") window.location.href = "manager.html";
      if (role === "supervisor") window.location.href = "supervisor.html";
      if (role === "delegate") window.location.href = "delegate.html";
    });
  }
});
