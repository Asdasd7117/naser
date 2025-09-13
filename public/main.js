// ====== إعداد Supabase ======
const SUPABASE_URL = "https://olwguiyogqwzraikq.supabase.co";
const SUPABASE_KEY = "PUBLIC_ANON_KEY_HERE"; // ضع مفتاح Supabase العام هنا
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ====== تبديل اللغة ======
let currentLang = "ar";
const translations = {
  ar: {
    delegate: "المندوب",
    supervisor_title: "شاشة المشرف / مدير المبيعات",
    manager_title: "شاشة المدير / الموارد البشرية",
    dailyTasks: "المهام اليومية",
    report: "رفع التقرير",
    map: "الخريطة",
    notifications: "الإشعارات",
    switchArabic: "العربية",
    switchEnglish: "English",
    updateStatus: "تحديث الحالة",
    notes: "الملاحظات",
    uploadImage: "رفع صورة/صور",
    clientSignature: "توقيع العميل",
    sendReport: "إرسال التقرير",
    monitor: "متابعة",
    reports: "تقارير",
    attendance: "الحضور",
    control_panel: "لوحة التحكم",
    create_user: "إنشاء مستخدم جديد",
    role: "الدور",
    supervisor: "مشرف",
    delegate_role: "مندوب",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    password: "كلمة المرور",
    create: "إنشاء",
    manage_tasks: "إضافة / تعديل مهام",
    client: "العميل",
    address: "العنوان",
    time: "الوقت",
    save_task: "حفظ المهمة",
    send_notifications: "إرسال إشعارات جماعية",
    send: "إرسال",
    filter: "الفترة",
    daily: "يومي",
    weekly: "أسبوعي",
    monthly: "شهري",
    analytics: "تحليلات"
  },
  en: {
    delegate: "Delegate",
    supervisor_title: "Supervisor Screen",
    manager_title: "Manager / HR Screen",
    dailyTasks: "Daily Tasks",
    report: "Submit Report",
    map: "Map",
    notifications: "Notifications",
    switchArabic: "Arabic",
    switchEnglish: "English",
    updateStatus: "Update Status",
    notes: "Notes",
    uploadImage: "Upload Image(s)",
    clientSignature: "Client Signature",
    sendReport: "Send Report",
    monitor: "Monitor",
    reports: "Reports",
    attendance: "Attendance",
    control_panel: "Control Panel",
    create_user: "Create New User",
    role: "Role",
    supervisor: "Supervisor",
    delegate_role: "Delegate",
    name: "Name",
    email: "Email",
    phone: "Phone",
    password: "Password",
    create: "Create",
    manage_tasks: "Add / Edit Tasks",
    client: "Client",
    address: "Address",
    time: "Time",
    save_task: "Save Task",
    send_notifications: "Send Notifications",
    send: "Send",
    filter: "Period",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    analytics: "Analytics"
  }
};

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if(translations[lang][key]) el.innerText = translations[lang][key];
  });
}
document.getElementById("languageSwitcher")?.addEventListener("change", e => {
  setLanguage(e.target.value);
});
setLanguage(currentLang);

// ====== التنقل بين الأقسام ======
function showSection(sectionId) {
  document.querySelectorAll("main > section").forEach(sec => {
    sec.style.display = sec.id === sectionId ? "block" : "none";
  });
}

// ====== إنشاء مستخدم جديد ======
const createUserForm = document.getElementById("createUserForm");
if (createUserForm) {
  createUserForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(createUserForm);
    const role = formData.get("role");
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");

    // إنشاء مستخدم جديد عبر Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    });
    if(error) return alert("Error: " + error.message);

    // إضافة بيانات إضافية للجدول users
    await supabase.from("users").insert([{
      id: data.user.id,
      name: name,
      email: email,
      phone: phone,
      role: role
    }]);
    alert("تم إنشاء المستخدم بنجاح!");
    createUserForm.reset();
  });
}

// ====== حفظ المهام الجديدة ======
const taskForm = document.getElementById("taskForm");
if(taskForm) {
  taskForm.addEventListener("submit", async e => {
    e.preventDefault();
    const formData = new FormData(taskForm);
    const client = formData.get("client");
    const address = formData.get("address");
    const time = formData.get("time");

    await supabase.from("tasks").insert([{
      client, address, time
    }]);
    alert("تم حفظ المهمة بنجاح!");
    taskForm.reset();
  });
}

// ====== إرسال إشعارات جماعية ======
document.querySelectorAll("section#control-panel button[data-i18n='send']").forEach(btn => {
  btn.addEventListener("click", async () => {
    const message = btn.previousElementSibling.value;
    if(!message) return alert("أدخل نص الإشعار");
    await supabase.from("notifications").insert([{ message }]);
    alert("تم إرسال الإشعار للجميع!");
  });
});

// ====== إعداد Chart.js للرسوم البيانية ======
if(document.getElementById("tasksChart")) {
  const ctx = document.getElementById("tasksChart").getContext("2d");
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['أحمد', 'سارة', 'محمد'],
      datasets: [{
        label: 'المهام المكتملة',
        data: [20, 15, 18],
        backgroundColor: 'rgba(42,124,199,0.7)'
      },{
        label: 'المهام المؤجلة',
        data: [3, 5, 2],
        backgroundColor: 'rgba(255,99,132,0.7)'
      }]
    },
    options: { responsive: true, plugins: { legend: { position: 'top' } } }
  });
}
