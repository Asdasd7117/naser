import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// ضع بيانات مشروعك من Dashboard Supabase
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_PUBLIC_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =====================
// دوال Supabase
// =====================

// تسجيل الدخول
export async function login(emailOrPhone, password, role) {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${emailOrPhone},phone.eq.${emailOrPhone}`)
    .eq("role", role)
    .single();

  if (error || !user) {
    alert("❌ User not found or wrong role");
    return;
  }
  if (user.password !== password) {
    alert("❌ Incorrect password");
    return;
  }
  localStorage.setItem("user", JSON.stringify(user));
  if (user.role === "manager") window.location.href = "manager.html";
  if (user.role === "supervisor") window.location.href = "supervisor.html";
  if (user.role === "delegate") window.location.href = "delegate.html";
}

// إضافة مستخدم جديد (المدير)
export async function addUser(fullName, email, phone, password, role) {
  const { data, error } = await supabase
    .from("users")
    .insert([{ full_name: fullName, email, phone, password, role }]);
  if (error) {
    console.error(error);
    alert("❌ Failed to add user");
  } else {
    alert("✅ User added successfully");
  }
}

// جلب المهام للمندوب
export async function loadTasks(delegateId) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("delegate_id", delegateId);
  if (error) { console.error(error); return []; }
  return data;
}

// تحديث حالة المهمة
export async function updateTaskStatus(taskId, newStatus) {
  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);
  if (error) console.error(error);
}

// رفع تقرير
export async function submitReport(taskId, delegateId, notes, images, signature) {
  const { data, error } = await supabase
    .from("reports")
    .insert([{ task_id: taskId, delegate_id: delegateId, notes, image_urls: images, client_signature: signature }]);
  if (error) console.error(error);
}

// =====================
// DOM Loaded – جميع الصفحات
// =====================
document.addEventListener("DOMContentLoaded", async () => {
  const currentPage = window.location.pathname.split("/").pop();
  const user = JSON.parse(localStorage.getItem("user"));

  // صفحة تسجيل الدخول
  if(currentPage === "index.html"){
    const form = document.getElementById("loginForm");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailOrPhone = document.getElementById("emailOrPhone").value;
      const password = document.getElementById("password").value;
      const role = document.getElementById("role").value;
      await login(emailOrPhone, password, role);
    });
  }

  // زر تسجيل الخروج لجميع الصفحات
  const logoutBtn = document.getElementById("logoutBtn");
  if(logoutBtn){
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      window.location.href = "index.html";
    });
  }

  // صفحة المندوب
  if(currentPage === "delegate.html" && user && user.role === "delegate"){
    const ul = document.getElementById("tasksList");
    const tasks = await loadTasks(user.id);
    tasks.forEach(task => {
      const li = document.createElement("li");
      li.innerHTML = `${task.client_name} - ${task.address} - ${task.visit_time} - ${task.status}
        <button onclick="updateTaskStatus(${task.id}, 'completed')">✅</button>
        <button onclick="updateTaskStatus(${task.id}, 'delayed')">⏳</button>`;
      ul.appendChild(li);
    });
  }

  // صفحة المدير – إضافة مستخدم
  if(currentPage === "manager.html" && user && user.role === "manager"){
    const form = document.getElementById("addUserForm");
    if(form){
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const fullName = document.getElementById("newFullName").value;
        const emailOrPhone = document.getElementById("newEmailOrPhone").value;
        const password = document.getElementById("newPassword").value;
        const role = document.getElementById("newRole").value;

        let email = emailOrPhone.includes("@") ? emailOrPhone : null;
        let phone = email ? null : emailOrPhone;

        await addUser(fullName, email, phone, password, role);
        form.reset();
      });
    }
  }
});
