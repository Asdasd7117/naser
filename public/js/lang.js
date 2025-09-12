const translations = {
  en: {
    login_title: "Login",
    login_user: "Email / Phone",
    login_pass: "Password",
    role_select: "Role",
    role_delegate: "Delegate",
    role_supervisor: "Supervisor",
    role_manager: "Manager",
    login_button: "Login",
    forgot_pass: "Forgot Password?",
    tasks_title: "Daily Tasks",
    report_title: "Submit Report",
    report_notes: "Write your notes",
    send_report: "Send Report",
    toggle_lang: "Arabic / English"
  },
  ar: {
    login_title: "تسجيل الدخول",
    login_user: "البريد الإلكتروني / رقم الهاتف",
    login_pass: "كلمة المرور",
    role_select: "الدور",
    role_delegate: "مندوب",
    role_supervisor: "مشرف",
    role_manager: "مدير",
    login_button: "تسجيل الدخول",
    forgot_pass: "نسيت كلمة المرور؟",
    tasks_title: "المهام اليومية",
    report_title: "رفع التقرير",
    report_notes: "اكتب ملاحظات",
    send_report: "إرسال التقرير",
    toggle_lang: "عربي / English"
  }
};

function setLanguage(lang){
  localStorage.setItem('lang', lang);
  applyTranslations();
}

function toggleLanguage(){
  const current = localStorage.getItem('lang') || 'ar';
  const newLang = current === 'ar' ? 'en' : 'ar';
  setLanguage(newLang);
}

function applyTranslations(){
  const lang = localStorage.getItem('lang') || 'ar';
  document.querySelectorAll('[data-translate]').forEach(el=>{
    const key = el.getAttribute('data-translate');
    if(translations[lang][key]) el.innerText = translations[lang][key];
  });
}
document.addEventListener('DOMContentLoaded', applyTranslations);
