<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<title>نظام إدارة المندوبين</title>
<style>
  body { font-family: Tahoma, Arial, sans-serif; margin:0; padding:0; background:#f9f9f9; color:#333; }
  h1,h2 { text-align:center; margin:10px 0; }
  .screen { display:none; padding:10px; min-height:calc(100vh - 60px); overflow-y:auto; }
  .screen.active { display:block; }
  .card { background:white; margin:8px; padding:10px; border-radius:8px; box-shadow:0 2px 4px rgba(0,0,0,0.1); }
  .bottom-nav { position:fixed; bottom:0; width:100%; background:#007bff; display:flex; }
  .bottom-nav button { flex:1; padding:12px; border:none; background:#007bff; color:white; font-size:14px; cursor:pointer; }
  .bottom-nav button.active { background:#0056b3; }
  .lang-btn { position:fixed; top:10px; left:10px; padding:6px 10px; cursor:pointer; }
  textarea,input { width:100%; margin:6px 0; padding:6px; border-radius:6px; border:1px solid #ccc; }
  table { width:100%; border-collapse:collapse; margin:10px 0; }
  table, th, td { border:1px solid #ccc; }
  th, td { padding:6px; text-align:center; }
</style>
</head>
<body onload="initApp();">

<!-- زر تغيير اللغة -->
<button class="lang-btn" onclick="toggleLanguage()">عربي/English</button>

<!-- ================== شاشات المندوب ================== -->
<section id="delegate" class="screen">
  <h1 data-translate="tasks_title">المهام اليومية</h1>
  <div id="tasks-list"></div>

  <h2 data-translate="report_title">رفع التقرير</h2>
  <textarea id="report-notes" placeholder="" data-translate-placeholder="report_notes"></textarea>
  <input type="file" id="report-images" multiple>
  <input type="file" id="report-signature">
  <button onclick="submitDelegateReport()" data-translate="send_report">إرسال التقرير</button>

  <h2 data-translate="map_title">الخريطة</h2>
  <div id="delegate-map" style="width:100%;height:300px;margin-top:10px;"></div>

  <h2 data-translate="notifications_title">الإشعارات</h2>
  <div id="delegate-notifications" class="card"></div>
</section>

<!-- ================== شاشات المشرف ================== -->
<section id="supervisor" class="screen">
  <h1 data-translate="supervisor_title">متابعة المندوبين</h1>
  <div id="supervisor-delegates"></div>

  <h2 data-translate="supervisor_map_title">الخريطة</h2>
  <div id="supervisor-map" style="width:100%;height:300px;margin-top:10px;"></div>

  <h2 data-translate="supervisor_reports_title">مراجعة التقارير</h2>
  <div id="supervisor-reports"></div>

  <h2 data-translate="supervisor_notifications_title">الإشعارات</h2>
  <div id="supervisor-notifications" class="card"></div>
</section>

<!-- ================== شاشات المدير ================== -->
<section id="manager" class="screen">
  <h1 data-translate="reports_title">التقارير والتحليلات</h1>
  <table>
    <thead>
      <tr><th data-translate="delegate_name">المندوب</th><th data-translate="complete_tasks">المهام المكتملة</th><th data-translate="pending_tasks">المهام المؤجلة</th><th data-translate="completion_rate">نسبة الإنجاز</th></tr>
    </thead>
    <tbody id="reports-table"></tbody>
  </table>

  <h2 data-translate="attendance_title">الحضور والانصراف</h2>
  <div id="attendance-list"></div>

  <h2 data-translate="admin_title">لوحة التحكم</h2>
  <input type="text" id="task-client" placeholder="" data-translate-placeholder="task_client">
  <input type="text" id="task-address" placeholder="" data-translate-placeholder="task_address">
  <input type="time" id="task-time" data-translate-placeholder="task_time">
  <button onclick="addTask()" data-translate="add_task">إضافة مهمة</button>

  <input type="text" id="delegate-name" placeholder="" data-translate-placeholder="delegate_name_input">
  <input type="text" id="delegate-phone" placeholder="" data-translate-placeholder="delegate_phone_input">
  <input type="email" id="delegate-email" placeholder="" data-translate-placeholder="delegate_email_input">
  <button onclick="updateDelegate()" data-translate="update_delegate">تحديث بيانات المندوب</button>

  <textarea id="broadcast-message" placeholder="" data-translate-placeholder="broadcast_message"></textarea>
  <button onclick="sendBroadcast()" data-translate="send_broadcast">إرسال الإشعار</button>
</section>

<!-- ================== شريط التنقل ================== -->
<nav class="bottom-nav">
  <button id="btn-delegate" onclick="showSection('delegate')">مندوب</button>
  <button id="btn-supervisor" onclick="showSection('supervisor')">مشرف</button>
  <button id="btn-manager" onclick="showSection('manager')">مدير</button>
</nav>

<script>
const translations = {
  en:{
    tasks_title:"Daily Tasks",
    report_title:"Submit Report",
    report_notes:"Write your notes",
    send_report:"Send Report",
    map_title:"Map",
    notifications_title:"Notifications",
    supervisor_title:"Supervisors Panel",
    supervisor_map_title:"Map",
    supervisor_reports_title:"Review Reports",
    supervisor_notifications_title:"Notifications",
    reports_title:"Reports & Analytics",
    delegate_name:"Delegate",
    complete_tasks:"Completed Tasks",
    pending_tasks:"Pending Tasks",
    completion_rate:"Completion Rate",
    attendance_title:"Attendance",
    admin_title:"Admin Panel",
    task_client:"Client Name",
    task_address:"Address",
    task_time:"Time",
    add_task:"Add Task",
    delegate_name_input:"Delegate Name",
    delegate_phone_input:"Phone",
    delegate_email_input:"Email",
    update_delegate:"Update Delegate",
    broadcast_message:"Type your message",
    send_broadcast:"Send Broadcast"
  },
  ar:{
    tasks_title:"المهام اليومية",
    report_title:"رفع التقرير",
    report_notes:"اكتب ملاحظات",
    send_report:"إرسال التقرير",
    map_title:"الخريطة",
    notifications_title:"الإشعارات",
    supervisor_title:"متابعة المندوبين",
    supervisor_map_title:"الخريطة",
    supervisor_reports_title:"مراجعة التقارير",
    supervisor_notifications_title:"الإشعارات",
    reports_title:"التقارير والتحليلات",
    delegate_name:"المندوب",
    complete_tasks:"المهام المكتملة",
    pending_tasks:"المهام المؤجلة",
    completion_rate:"نسبة الإنجاز",
    attendance_title:"الحضور والانصراف",
    admin_title:"لوحة التحكم",
    task_client:"اسم العميل",
    task_address:"العنوان",
    task_time:"الوقت",
    add_task:"إضافة مهمة",
    delegate_name_input:"اسم المندوب",
    delegate_phone_input:"رقم الهاتف",
    delegate_email_input:"البريد الإلكتروني",
    update_delegate:"تحديث بيانات المندوب",
    broadcast_message:"اكتب الرسالة هنا",
    send_broadcast:"إرسال الإشعار"
  }
};

function setLanguage(lang){ localStorage.setItem('lang',lang); applyTranslations(); }
function toggleLanguage(){ const current=localStorage.getItem('lang')||'ar'; setLanguage(current==='ar'?'en':'ar'); }

function applyTranslations(){
  const lang=localStorage.getItem('lang')||'ar';
  document.querySelectorAll('[data-translate]').forEach(el=>{
    const key=el.getAttribute('data-translate');
    if(translations[lang][key]) el.innerText=translations[lang][key];
  });
  document.querySelectorAll('[data-translate-placeholder]').forEach(el=>{
    const key=el.getAttribute('data-translate-placeholder');
    if(translations[lang][key]) el.placeholder=translations[lang][key];
  });
}

function showSection(id){
  document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"));
  document.querySelectorAll(".bottom-nav button").forEach(b=>b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  document.getElementById("btn-"+id).classList.add("active");
}

// وظائف وهمية للمندوب
function submitDelegateReport(){ alert("تم إرسال التقرير"); }
// وظائف وهمية للمدير
function addTask(){ alert("تم إضافة المهمة"); }
function updateDelegate(){ alert("تم تحديث بيانات المندوب"); }
function sendBroadcast(){ alert("تم إرسال الإشعار"); }

function initApp(){
  applyTranslations();
  showSection('delegate');
}
</script>
</body>
</html>
