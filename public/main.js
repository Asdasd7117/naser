// ====== إعداد Supabase ======
const SUPABASE_URL = "https://olwguiyogqwzraikq.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5c3dxZGRjd3Frd2RsZXB2ZGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDA2MjIsImV4cCI6MjA3MzM3NjYyMn0.WbBlOesDGGhFLNp_WI0JFpdvuDgD-A8U4CDIlt8Wvhs";

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    forgot_password: "نسيت كلمة المرور؟",
    create_user: "إنشاء مستخدم جديد",
    name: "الاسم",
    email: "البريد الإلكتروني",
    phone: "رقم الهاتف",
    create: "إنشاء",
    client: "العميل",
    address: "العنوان",
    time: "الوقت",
    save_task: "حفظ المهمة",
    send_notifications: "إرسال إشعارات جماعية",
    send: "إرسال",
    notes: "الملاحظات",
    uploadImage: "رفع صورة/صور",
    clientSignature: "توقيع العميل",
    sendReport: "إرسال التقرير"
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
    forgot_password: "Forgot Password?",
    create_user: "Create New User",
    name: "Name",
    email: "Email",
    phone: "Phone",
    create: "Create",
    client: "Client",
    address: "Address",
    time: "Time",
    save_task: "Save Task",
    send_notifications: "Send Notifications",
    send: "Send",
    notes: "Notes",
    uploadImage: "Upload Image(s)",
    clientSignature: "Client Signature",
    sendReport: "Send Report"
  }
};

function setLanguage(lang){
  currentLang = lang;
  document.documentElement.dir = (lang==="ar")?"rtl":"ltr";
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(translations[lang][key]) el.innerText = translations[lang][key];
  });
}
document.getElementById("languageSwitcher")?.addEventListener("change", e=>{
  setLanguage(e.target.value);
});
setLanguage(currentLang);

// ====== تسجيل الدخول ======
const loginForm = document.getElementById("loginForm");
loginForm?.addEventListener("submit", async e=>{
  e.preventDefault();
  const role = loginForm.role.value;
  const identifier = loginForm.email_or_phone.value;
  const password = loginForm.password.value;

  const { data: users, error } = await supabase
    .from('users')
    .select('*')
    .or(`phone.eq.${identifier},email.eq.${identifier}`)
    .limit(1);

  if(error || !users || users.length===0){
    return alert("المستخدم غير موجود");
  }

  const user = users[0];
  if(user.password !== password) return alert("كلمة المرور غير صحيحة");
  if(user.role !== role) return alert("الدور غير صحيح");

  alert("تم تسجيل الدخول بنجاح!");

  if(role === "manager") window.location.href = "manager.html";
  if(role === "supervisor") window.location.href = "supervisor.html";
  if(role === "delegate") window.location.href = "delegate.html";
});

// ====== إنشاء مستخدم جديد (للمدير) ======
const createUserForm = document.getElementById("createUserForm");
createUserForm?.addEventListener("submit", async e=>{
  e.preventDefault();
  const formData = new FormData(createUserForm);
  const role = formData.get("role");
  const name = formData.get("name");
  const email = formData.get("email");
  const phone = formData.get("phone");
  const password = formData.get("password");

  const { data, error } = await supabase.auth.signUp({ email, password });
  if(error) return alert("Error: "+error.message);

  await supabase.from("users").insert([{ id: data.user.id, name, email, phone, role, password }]);
  alert("تم إنشاء المستخدم بنجاح!");
  createUserForm.reset();
});

// ====== إضافة مهمة جديدة ======
const taskForm = document.getElementById("taskForm");
taskForm?.addEventListener("submit", async e=>{
  e.preventDefault();
  const formData = new FormData(taskForm);
  const client = formData.get("client");
  const address = formData.get("address");
  const time = formData.get("time");

  await supabase.from("tasks").insert([{ client, address, time }]);
  alert("تم حفظ المهمة بنجاح!");
  taskForm.reset();
});

// ====== رفع تقرير ======
const reportForm = document.getElementById("reportForm");
reportForm?.addEventListener("submit", async e=>{
  e.preventDefault();
  const formData = new FormData(reportForm);
  const clientNotes = formData.get("notes");
  const files = formData.getAll("images"); // صور متعددة
  const signature = formData.get("signature");

  await supabase.from("reports").insert([{ notes: clientNotes, images: files.join(","), signature }]);
  alert("تم إرسال التقرير بنجاح!");
  reportForm.reset();
});

// ====== إرسال إشعارات جماعية ======
document.querySelectorAll("button[data-i18n='send']").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    const message = btn.previousElementSibling.value;
    if(!message) return alert("أدخل نص الإشعار");
    await supabase.from("notifications").insert([{ message }]);
    alert("تم إرسال الإشعار للجميع!");
  });
});
