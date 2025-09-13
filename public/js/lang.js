// js/lang.js

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
    login_success: "تم تسجيل الدخول بنجاح!",
    login_failed: "فشل تسجيل الدخول",
    login_error: "حدث خطأ أثناء تسجيل الدخول",

    // المندوب
    delegate_name: "اسم المندوب",
    tasks_title: "المهام اليومية",
    tasks_tab: "المهام",
    report_title: "رفع التقرير",
    report_tab: "التقرير",
    report_notes: "أدخل الملاحظات",
    send_report: "إرسال التقرير",
    report_success: "تم إرسال التقرير ✅",
    map_title: "الخريطة",
    map_tab: "الخريطة",
    update_location: "تحديث الموقع",
    location_updated: "تم تحديث الموقع ✅",
    map_placeholder: "خريطة افتراضية (يمكن ربط Google Maps API)",
    notifications_title: "الإشعارات",
    notifications_tab: "الإشعارات",
    client_label: "العميل",
    address_label: "العنوان",
    time_label: "وقت الزيارة",
    status_label: "الحالة",
    status_in_progress: "قيد التنفيذ",
    status_completed: "مكتملة",
    status_pending: "مؤجلة",
    toggle_lang: "عربي / English",

    // المشرف
    delegates_title: "متابعة المندوبين",
    supervisor_map_title: "الخريطة",
    supervisor_reports_title: "التقارير",
    supervisor_notifications_title: "الإشعارات",
    supervisor_list_tab: "المندوبين",
    supervisor_reports_tab: "التقارير",
    view_map_btn: "عرض على الخريطة",
    send_instructions_btn: "إضافة تعليمات",
    enter_instructions: "أدخل التعليمات للمندوب:",
    instructions_sent: "تم إرسال التعليمات ✅",
    view_location: "عرض الموقع على الخريطة",
    phone_label: "الهاتف",
    notes_label: "ملاحظات",
    date_label: "تاريخ",

    // المدير
    manager_reports_title: "التقارير والتحليلات",
    reports_tab: "التقارير",
    manager_attendance_title: "الحضور والانصراف",
    attendance_tab: "الحضور",
    manager_admin_title: "لوحة التحكم",
    admin_tab: "لوحة التحكم",
    add_task: "إضافة / تعديل المهام",
    add_task_btn: "إضافة مهمة",
    task_added: "تم إضافة المهمة ✅",
    task_missing: "يرجى إدخال جميع بيانات المهمة",
    edit_delegate: "تعديل بيانات المندوبين",
    update_delegate_btn: "تحديث بيانات المندوب",
    delegate_updated: "تم تحديث بيانات المندوب ✅",
    delegate_missing: "يرجى إدخال جميع بيانات المندوب",
    broadcast: "إرسال إشعارات جماعية",
    send_broadcast_btn: "إرسال الإشعار",
    broadcast_sent: "تم إرسال الإشعار",
    message_missing: "أدخل رسالة قبل الإرسال!",
    manager_label: "👤 المدير: محمد علي",
    login_label: "دخول",
    logout_label: "خروج",
    deviation_label: "حالة",
    tasks_complete: "المهام المكتملة",
    tasks_pending: "المهام المؤجلة",
    completion_rate: "نسبة الإنجاز"
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
    login_success: "Login successful!",
    login_failed: "Login failed",
    login_error: "An error occurred during login",

    // Delegate
    delegate_name: "Delegate Name",
    tasks_title: "Daily Tasks",
    tasks_tab: "Tasks",
    report_title: "Submit Report",
    report_tab: "Report",
    report_notes: "Write your notes",
    send_report: "Send Report",
    report_success: "Report submitted successfully ✅",
    map_title: "Map",
    map_tab: "Map",
    update_location: "Update Location",
    location_updated: "Location updated successfully ✅",
    map_placeholder: "Virtual map (can integrate Google Maps API)",
    notifications_title: "Notifications",
    notifications_tab: "Notifications",
    client_label: "Client",
    address_label: "Address",
    time_label: "Visit Time",
    status_label: "Status",
    status_in_progress: "In Progress",
    status_completed: "Completed",
    status_pending: "Pending",
    toggle_lang: "Arabic / English",

    // Supervisor
    delegates_title: "Delegates",
    supervisor_map_title: "Map",
    supervisor_reports_title: "Reports",
    supervisor_notifications_title: "Notifications",
    supervisor_list_tab: "Delegates",
    supervisor_reports_tab: "Reports",
    view_map_btn: "View on Map",
    send_instructions_btn: "Add Instructions",
    enter_instructions: "Enter instructions for the delegate:",
    instructions_sent: "Instructions sent successfully ✅",
    view_location: "View location on map",
    phone_label: "Phone",
    notes_label: "Notes",
    date_label: "Date",

    // Manager
    manager_reports_title: "Reports & Analytics",
    reports_tab: "Reports",
    manager_attendance_title: "Attendance",
    attendance_tab: "Attendance",
    manager_admin_title: "Admin Panel",
    admin_tab: "Admin Panel",
    add_task: "Add / Edit Tasks",
    add_task_btn: "Add Task",
    task_added: "Task added successfully ✅",
    task_missing: "Please enter all task details",
    edit_delegate: "Edit Delegate Info",
    update_delegate_btn: "Update Delegate",
    delegate_updated: "Delegate updated successfully ✅",
    delegate_missing: "Please enter all delegate details",
    broadcast: "Send Broadcast",
    send_broadcast_btn: "Send Broadcast",
    broadcast_sent: "Broadcast sent successfully",
    message_missing: "Please enter a message before sending!",
    manager_label: "👤 Manager: Mohammed Ali",
    login_label: "Login",
    logout_label: "Logout",
    deviation_label: "Status",
    tasks_complete: "Tasks Completed",
    tasks_pending: "Tasks Pending",
    completion_rate: "Completion Rate"
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
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.innerText = translations[lang][key];
      }
    }
  });
}

// تطبيق الترجمات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', applyTranslations);
