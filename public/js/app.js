// =======================
// إعداد Supabase
// =======================
const SUPABASE_URL = "https://olwguiyogqwzraikquni.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sd2d1aXlvZ3F3enJhaWtxdW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjY2MTAsImV4cCI6MjA3MzM0MjYxMH0.m_nFTy7JLgoKfgjzf9X7c9xyfv_YbBZ9vaEwJcUTwD4"; // ضع هنا مفتاح ANON الخاص بك
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================
// ترجمة واجهة المستخدم
// =======================
const translations = {
  en: {
    login_title:"Login",
    login_user:"Email / Phone",
    login_pass:"Password",
    login_button:"Login",
    forgot_pass:"Forgot Password?",
    tasks_title:"Daily Tasks",
    report_title:"Submit Report",
    report_notes:"Write your notes",
    send_report:"Send Report",
    map_title:"Map",
    update_location:"Update Location",
    notifications_title:"Notifications",
    tasks_tab:"Tasks",
    report_tab:"Report",
    map_tab:"Map",
    notifications_tab:"Notifications",
    toggle_lang:"Arabic / English"
  },
  ar: {
    login_title:"تسجيل الدخول",
    login_user:"البريد الإلكتروني / رقم الهاتف",
    login_pass:"كلمة المرور",
    login_button:"تسجيل الدخول",
    forgot_pass:"نسيت كلمة المرور؟",
    tasks_title:"المهام اليومية",
    report_title:"رفع التقرير",
    report_notes:"اكتب ملاحظاتك",
    send_report:"إرسال التقرير",
    map_title:"الخريطة",
    update_location:"تحديث الموقع",
    notifications_title:"الإشعارات",
    tasks_tab:"المهام",
    report_tab:"التقرير",
    map_tab:"الخريطة",
    notifications_tab:"الإشعارات",
    toggle_lang:"عربي / English"
  }
};

function applyTranslations(){
  const lang = localStorage.getItem('lang') || 'ar';
  document.querySelectorAll('[data-translate]').forEach(el=>{
    const key = el.getAttribute('data-translate');
    if(translations[lang][key]) el.innerText = translations[lang][key];
  });
}

function toggleLanguage(){
  const current = localStorage.getItem('lang') || 'ar';
  localStorage.setItem('lang', current==='ar'?'en':'ar');
  applyTranslations();
  if(document.documentElement) {
    document.documentElement.dir = (current==='ar')?'ltr':'rtl';
    document.documentElement.lang = (current==='ar')?'en':'ar';
  }
}

// =======================
// تسجيل الدخول
// =======================
async function login() {
  const user = document.getElementById('login-user').value;
  const password = document.getElementById('login-pass').value;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .or(`email.eq.${user},phone.eq.${user}`)
    .eq('password', password)
    .single();
  
  if(error || !data) return alert('بيانات غير صحيحة!');
  
  localStorage.setItem('currentUser', JSON.stringify(data));
  
  if(data.role === 'delegate') window.location='delegate.html';
  else if(data.role === 'supervisor') window.location='supervisor.html';
  else window.location='manager.html';
}

// =======================
// المندوب
// =======================
async function loadTasks() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  if(!user) return;
  
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('delegate', user.user);
  
  const container = document.getElementById('tasks-list');
  container.innerHTML = '';
  
  tasks.forEach((t, idx)=>{
    const div = document.createElement('div');
    div.className = 'task-card';
    div.innerHTML = `
      <strong>${t.client}</strong><br>
      ${t.address}<br>
      ${t.time}<br>
      <label>الحالة: 
        <select onchange="updateTaskStatus(${t.id}, this.value)">
          <option ${t.status==="قيد التنفيذ"?"selected":""}>قيد التنفيذ</option>
          <option ${t.status==="مكتملة"?"selected":""}>مكتملة</option>
          <option ${t.status==="مؤجلة"?"selected":""}>مؤجلة</option>
        </select>
      </label>
    `;
    container.appendChild(div);
  });
}

async function updateTaskStatus(taskId, newStatus) {
  await supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId);
  loadTasks();
}

async function submitDelegateReport() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const notes = document.getElementById('report-notes').value;
  const imagesInput = document.getElementById('report-images');
  const signatureInput = document.getElementById('report-signature');
  
  const formData = new FormData();
  formData.append('notes', notes);
  formData.append('delegate', user.user);
  
  for(let i=0;i<imagesInput.files.length;i++) formData.append('images', imagesInput.files[i]);
  if(signatureInput.files[0]) formData.append('signature', signatureInput.files[0]);
  
  // حفظ التقرير في جدول reports في Supabase (يمكن تعديل لرفع الصور في Storage)
  await supabase.from('reports').insert([{ delegate: user.user, notes }]);
  alert('تم إرسال التقرير ✅');
  document.getElementById('report-notes').value = '';
}

// =======================
// إشعارات المندوب
// =======================
async function loadNotifications() {
  const user = JSON.parse(localStorage.getItem('currentUser'));
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('delegate', user.user);
  
  const ul = document.getElementById('notifications-list');
  ul.innerHTML = '';
  
  tasks.forEach(t=>{
    const now = new Date();
    const taskTime = new Date();
    const [hour, minute] = t.time.split(':');
    taskTime.setHours(parseInt(hour), parseInt(minute));
    if(taskTime < now && t.status !== 'مكتملة') {
      const li = document.createElement('li');
      li.textContent = `تنبيه: المهمة مع ${t.client} متأخرة`;
      ul.appendChild(li);
    }
  });
}

// =======================
// المشرف
// =======================
async function loadSupervisorList() {
  const { data: delegates } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'delegate');
  
  const container = document.getElementById('supervisor-list');
  container.innerHTML = '';
  
  delegates.forEach(d=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <strong>${d.user}</strong> | <button onclick="showOnMap('${d.user}')">عرض الموقع</button>
    `;
    container.appendChild(div);
  });
}

// =======================
// المدير
// =======================
async function loadReportsAdmin() {
  const { data: reports } = await supabase.from('reports').select('*');
  const container = document.getElementById('reports-list');
  container.innerHTML = '';
  
  reports.forEach(r=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <b>مندوب:</b> ${r.delegate} | <b>ملاحظات:</b> ${r.notes}
      <button onclick="alert('إضافة تعليمات')">إضافة تعليمات</button>
    `;
    container.appendChild(div);
  });
}

async function loadAttendance() {
  const { data: users } = await supabase.from('users').select('*').eq('role','delegate');
  const container = document.getElementById('attendance-list');
  container.innerHTML = '';
  users.forEach(u=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `<b>${u.user}</b> - تسجيل الدخول: 09:00 - الخروج: 17:00`;
    container.appendChild(div);
  });
}

// =======================
// وظائف مشتركة
// =======================
function showSection(id) {
  document.querySelectorAll(".screen, .page").forEach(s => s.classList.remove("active"));
  document.querySelectorAll(".bottom-nav button").forEach(b => b.classList.remove("active"));
  const el = document.getElementById(id);
  if(el) el.classList.add("active");
  const btn = document.getElementById("btn-" + id);
  if(btn) btn.classList.add("active");
}

// =======================
// المندوب – الخريطة
// =======================
function initMap() {
  const mapContainer = document.getElementById('map-container');
  if(mapContainer) mapContainer.innerText = "خريطة افتراضية (يمكن ربط Google Maps API)";
}
function updateLocation() {
  alert("تم تحديث الموقع ✅");
}

// =======================
// المندوب – التنقل بين الشاشات
// =======================
document.addEventListener('DOMContentLoaded', ()=>{
  applyTranslations();
});
