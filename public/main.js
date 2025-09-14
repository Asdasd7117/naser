// ✅ ربط Supabase
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

// بيانات مشروعك (من Dashboard Supabase)
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_KEY = "YOUR_ANON_PUBLIC_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ دالة تسجيل الدخول
async function login(emailOrPhone, password, role) {
  // البحث عن المستخدم حسب البريد أو الهاتف
  let { data: users, error } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${emailOrPhone},phone.eq.${emailOrPhone}`)
    .eq("role", role)
    .single();

  if (error || !users) {
    alert("❌ المستخدم غير موجود أو الدور غير صحيح");
    return;
  }

  // التحقق من كلمة المرور (هنا عادي، ممكن تضيف تشفير لاحقاً)
  if (users.password === password) {
    localStorage.setItem("user", JSON.stringify(users));

    // إعادة التوجيه حسب الدور
    if (users.role === "manager") {
      window.location.href = "manager.html";
    } else if (users.role === "supervisor") {
      window.location.href = "supervisor.html";
    } else if (users.role === "delegate") {
      window.location.href = "delegate.html";
    }
  } else {
    alert("❌ كلمة المرور غير صحيحة");
  }
}

// ✅ دالة إضافة مستخدم جديد (للمدير فقط)
async function addUser(fullName, email, phone, password, role) {
  let { data, error } = await supabase
    .from("users")
    .insert([{ full_name: fullName, email, phone, password, role }]);

  if (error) {
    console.error("خطأ في إضافة المستخدم:", error);
    alert("❌ لم يتم إضافة المستخدم");
  } else {
    alert("✅ تم إضافة المستخدم بنجاح");
  }
}

// ✅ دالة تحميل المهام (للمندوب)
async function loadTasks(delegateId) {
  let { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("delegate_id", delegateId);

  if (error) {
    console.error(error);
    return [];
  }
  return data;
}

// ✅ دالة تحديث حالة المهمة
async function updateTaskStatus(taskId, newStatus) {
  let { data, error } = await supabase
    .from("tasks")
    .update({ status: newStatus })
    .eq("id", taskId);

  if (error) {
    console.error("❌ خطأ في تحديث المهمة", error);
  } else {
    alert("✅ تم تحديث حالة المهمة");
  }
}

// ✅ دالة رفع تقرير (مندوب)
async function submitReport(taskId, notes, imageUrl, signature) {
  let { data, error } = await supabase
    .from("reports")
    .insert([{ task_id: taskId, notes, image_url: imageUrl, signature }]);

  if (error) {
    console.error("❌ خطأ في رفع التقرير:", error);
  } else {
    alert("✅ تم إرسال التقرير");
  }
}

// ✅ عند تحميل الصفحة
document.addEventListener("DOMContentLoaded", () => {
  const currentPage = window.location.pathname.split("/").pop();

  // شاشة تسجيل الدخول
  if (currentPage === "index.html") {
    const form = document.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const emailOrPhone = form.querySelector("input[type=text]").value;
      const password = form.querySelector("input[type=password]").value;
      const role = form.querySelector("select").value;
      await login(emailOrPhone, password, role);
    });
  }

  // شاشة المدير (إضافة مستخدم)
  if (currentPage === "manager.html") {
    const form = document.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fullName = form.querySelector("input[type=text]").value;
      const emailOrPhone = form.querySelectorAll("input[type=text]")[1].value;
      const password = form.querySelector("input[type=password]").value;
      const role = form.querySelector("select").value;

      let email = emailOrPhone.includes("@") ? emailOrPhone : null;
      let phone = email ? null : emailOrPhone;

      await addUser(fullName, email, phone, password, role);
    });
  }

  // شاشة المندوب (عرض المهام)
  if (currentPage === "delegate.html") {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user && user.role === "delegate") {
      loadTasks(user.id).then(tasks => {
        const ul = document.querySelector("ul");
        ul.innerHTML = "";
        tasks.forEach(task => {
          const li = document.createElement("li");
          li.innerHTML = `
            <b>${task.client_name}</b> - ${task.address} - ${task.visit_time} - ${task.status}
            <button onclick="updateTaskStatus(${task.id}, 'completed')">✅</button>
            <button onclick="updateTaskStatus(${task.id}, 'delayed')">⏳</button>
          `;
          ul.appendChild(li);
        });
      });
    }
  }
});
