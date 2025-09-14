// ================= إعداد Supabase =================
const SUPABASE_URL = "https://olwguiyogqwzraikq.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5c3dxZGRjd3Frd2RsZXB2ZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDA2MjIsImV4cCI6MjA3MzM3NjYyMn0.WbBlOesDGGhFLNp_WI0JFpdvuDgD-A8U4CDIlt8Wvhs";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ================= الترجمة =================
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
    forgot_password: "نسيت كلمة المرور؟",
    arabic: "العربية",
    english: "الإنجليزية",
    user_not_found: "المستخدم غير موجود",
    wrong_password: "كلمة المرور غير صحيحة",
    wrong_role: "الدور غير صحيح",
    login_success: "تم تسجيل الدخول بنجاح!",
    user_created: "تم إنشاء المستخدم بنجاح!",
    error: "حدث خطأ:"
  },
  en: {
    login_title: "Login",
    role: "Role:",
    manager: "Manager",
    supervisor: "Supervisor",
    delegate: "Delegate",
    email_or_phone: "Email / Phone:",
    password: "Password:",
    login: "Login",
    forgot_password: "Forgot Password?",
    arabic: "Arabic",
    english: "English",
    user_not_found: "User not found",
    wrong_password: "Incorrect password",
    wrong_role: "Incorrect role",
    login_success: "Login successful!",
    user_created: "User created successfully!",
    error: "Error:"
  }
};

// تغيير اللغة
function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (translations[lang][key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = translations[lang][key];
      } else if (el.tagName === "OPTION") {
        el.textContent = translations[lang][key];
      } else {
        el.innerText = translations[lang][key];
      }
    }
  });
}

// تبديل اللغة من الـ select
document.getElementById("languageSwitcher")?.addEventListener("change", e => {
  setLanguage(e.target.value);
});

// افتراضي عربي
setLanguage(currentLang);

// ================= تسجيل الدخول =================
const loginForm = document.getElementById("loginForm");

loginForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const role = loginForm.role.value;
  const identifier = loginForm.email_or_phone.value;
  const password = loginForm.password.value;

  // البحث عن المستخدم بالبريد أو الهاتف
  const { data: users, error } = await supabase
    .from("users")
    .select("*")
    .or(`phone.eq.${identifier},email.eq.${identifier}`)
    .limit(1);

  if (error || !users || users.length === 0) {
    return alert(translations[currentLang].user_not_found);
  }

  const user = users[0];

  if (user.password !== password) {
    return alert(translations[currentLang].wrong_password);
  }

  if (user.role !== role) {
    return alert(translations[currentLang].wrong_role);
  }

  alert(translations[currentLang].login_success);

  // التوجيه حسب الدور
  if (role === "manager") window.location.href = "manager.html";
  if (role === "supervisor") window.location.href = "supervisor.html";
  if (role === "delegate") window.location.href = "delegate.html";
});

// ================= إنشاء مستخدم جديد (للمدير فقط) =================
const createUserForm = document.getElementById("createUserForm");

createUserForm?.addEventListener("submit", async e => {
  e.preventDefault();

  const formData = new FormData(createUserForm);
  const role = formData.get("role");
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");

  // إنشاء مستخدم جديد في Supabase Auth
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) return alert(`${translations[currentLang].error} ${error.message}`);

  // إضافة بيانات المستخدم لجدول users
  await supabase.from("users").insert([
    {
      id: data.user.id,
      name,
      email,
      phone,
      role,
      password
    }
  ]);

  alert(translations[currentLang].user_created);
  createUserForm.reset();
});
