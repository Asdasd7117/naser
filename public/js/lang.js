// js/lang.js – إدارة اللغة والتبديل بين العربية والإنجليزية

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
    delegate_name: "اسم المندوب",
    tasks_title: "المهام اليومية",
    tasks_tab: "المهام", // زر شريط التنقل
    report_title: "رفع التقرير",
    report_tab: "التقرير", // زر شريط التنقل
    report_notes: "أدخل الملاحظات",
    send_report: "إرسال التقرير",
    map_title: "الخريطة",
    map_tab: "الخريطة", // زر شريط التنقل
    update_location: "تحديث الموقع", // زر تحديث الموقع
    notifications_title: "الإشعارات",
    notifications_tab: "الإشعارات", // زر شريط التنقل
    toggle_lang: "عربي / English",

    // المشرف
    delegates_title: "متابعة المندوبين",
    supervisor_map_title: "الخريطة",
    supervisor_reports_title: "التقارير",
    supervisor_notifications_title: "الإشعارات",

    // المدير
    manager_reports_title: "التقارير والتحليلات",
    reports_tab: "التقارير", // زر شريط التنقل
    manager_attendance_title: "الحضور والانصراف",
    attendance_tab: "الحضور", // زر شريط التنقل
    manager_admin_title: "لوحة التحكم",
    admin_tab: "لوحة التحكم", // زر شريط التنقل
    add_task: "إضافة / تعديل المهام",
    add_task_btn: "إضافة مهمة",
    edit_delegate: "تعديل بيانات المندوبين",
    update_delegate_btn: "تحديث بيانات المندوب",
    broadcast: "إرسال إشعارات جماعية",
    send_broadcast_btn: "إرسال الإشعار"
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
    delegate_name: "Delegate Name",
    tasks_title: "Daily Tasks",
    tasks_tab: "Tasks", // زر شريط التنقل
    report_title: "Submit Report",
    report_tab: "Report", // زر شريط التنقل
    report_notes: "Write your notes",
    send_report: "Send Report",
    map_title: "Map",
    map_tab: "Map", // زر شريط التنقل
    update_location: "Update Location", // زر تحديث الموقع
    notifications_title: "Notifications",
    notifications_tab: "Notifications", // زر شريط التنقل
    toggle_lang: "Arabic / English",

    // Supervisor
    delegates_title: "Delegates",
    supervisor_map_title: "Map",
    supervisor_reports_title: "Reports",
    supervisor_notifications_title: "Notifications",

    // Manager
    manager_reports_title: "Reports & Analytics",
    reports_tab: "Reports", // زر شريط التنقل
    manager_attendance_title: "Attendance",
    attendance_tab: "Attendance", // زر شريط التنقل
    manager_admin_title: "Admin Panel",
    admin_tab: "Admin Panel", // زر شريط التنقل
    add_task: "Add / Edit Tasks",
    add_task_btn: "Add Task",
    edit_delegate: "Edit Delegate Info",
    update_delegate_btn: "Update Delegate",
    broadcast: "Send Broadcast",
    send_broadcast_btn: "Send Broadcast"
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
    if (translations[lang][key]) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.placeholder = translations[lang][key]; // لو كان input أو textarea نحط placeholder
      } else {
        el.innerText = translations[lang][key];
      }
    }
  });
}

// تطبيق الترجمات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', applyTranslations);
