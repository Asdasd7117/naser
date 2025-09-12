// lang.js – إدارة اللغة والتبديل بين العربية والإنجليزية

const translations = {
  ar: {
    // تسجيل الدخول
    login_title: "تسجيل الدخول",
    login_user: "البريد الإلكتروني / رقم الهاتف",
    login_pass: "كلمة المرور",
    role_select: "الدور",
    role_delegate: "مندوب",
    role_supervisor: "مشرف",
    role_manager: "مدير",
    login_button: "تسجيل الدخول",
    forgot_pass: "نسيت كلمة المرور؟",

    // المندوب
    tasks_title: "المهام اليومية",
    report_title: "رفع التقرير",
    report_notes: "أدخل الملاحظات",
    send_report: "إرسال التقرير",
    map_title: "الخريطة",
    notifications_title: "الإشعارات",
    toggle_lang: "عربي / English",

    // المشرف
    delegates_title: "متابعة المندوبين",
    supervisor_map_title: "الخريطة",
    supervisor_reports_title: "التقارير",
    supervisor_notifications_title: "الإشعارات",

    // المدير
    manager_reports_title: "التقارير والتحليلات",
    manager_attendance_title: "الحضور والانصراف",
    manager_admin_title: "لوحة التحكم",
    add_task: "إضافة مهمة",
    update_delegate: "تحديث بيانات المندوب",
    send_broadcast: "إرسال الإشعار"
  },

  en: {
    // Login
    login_title: "Login",
    login_user: "Email / Phone",
    login_pass: "Password",
    role_select: "Role",
    role_delegate: "Delegate",
    role_supervisor: "Supervisor",
    role_manager: "Manager",
    login_button: "Login",
    forgot_pass: "Forgot Password?",

    // Delegate
    tasks_title: "Daily Tasks",
    report_title: "Submit Report",
    report_notes: "Write your notes",
    send_report: "Send Report",
    map_title: "Map",
    notifications_title: "Notifications",
    toggle_lang: "Arabic / English",

    // Supervisor
    delegates_title: "Delegates",
    supervisor_map_title: "Map",
    supervisor_reports_title: "Reports",
    supervisor_notifications_title: "Notifications",

    // Manager
    manager_reports_title: "Reports & Analytics",
    manager_attendance_title: "Attendance",
    manager_admin_title: "Admin Panel",
    add_task: "Add Task",
    update_delegate: "Update Delegate Info",
    send_broadcast: "Send Broadcast"
  }
};

// تخزين اللغة الحالية في localStorage
function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  applyTranslations();
}

// تبديل اللغة
function toggleLanguage() {
  const current = localStorage.getItem('lang') || 'ar';
  const newLang = current === 'ar' ? 'en' : 'ar';
  localStorage.setItem('lang', newLang);
  document.documentElement.lang = newLang;
  document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  applyTranslations();
}

// تطبيق الترجمات على جميع العناصر التي تحتوي على data-translate
function applyTranslations() {
  const lang = localStorage.getItem('lang') || 'ar';
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if(translations[lang][key]) el.innerText = translations[lang][key];
  });
}

// تطبيق الترجمات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', applyTranslations);
