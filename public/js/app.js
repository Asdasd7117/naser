// js/app.js

// ====== تسجيل الدخول ======
async function login() {
  const user = document.getElementById('login-user')?.value;
  const password = document.getElementById('login-pass')?.value;
  const role = document.getElementById('role')?.value;

  if (!user || !password || !role) return; // التحقق من وجود العناصر

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user, password, role })
    });
    const data = await res.json();

    if (data.success) {
      alert(data.message || translations[document.documentElement.lang || 'ar'].login_success || 'تم تسجيل الدخول بنجاح!');
      if (role === 'delegate') window.location = 'delegate.html';
      else if (role === 'supervisor') window.location = 'supervisor.html';
      else window.location = 'manager.html';
    } else {
      alert(data.message || translations[document.documentElement.lang || 'ar'].login_failed || 'فشل تسجيل الدخول');
    }
  } catch (err) {
    console.error(err);
    alert(translations[document.documentElement.lang || 'ar'].login_error || 'حدث خطأ أثناء تسجيل الدخول');
  }
}

// ====== المندوب – تحميل المهام ======
async function loadTasks() {
  try {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    const container = document.getElementById('tasks-list');
    if (!container) return;
    container.innerHTML = '';
    tasks.forEach((t, idx) => {
      const div = document.createElement('div');
      div.className = 'task-card';
      div.innerHTML = `
        <b data-translate="client_label">العميل:</b> ${t.client}<br>
        <b data-translate="address_label">العنوان:</b> ${t.address}<br>
        <b data-translate="time_label">وقت الزيارة:</b> ${t.time}<br>
        <b data-translate="status_label">الحالة:</b>
        <select onchange="updateTaskStatus('${t.id}', this.value)">
          <option value="قيد التنفيذ" ${t.status === 'قيد التنفيذ' ? 'selected' : ''} data-translate="status_in_progress">قيد التنفيذ</option>
          <option value="مكتملة" ${t.status === 'مكتملة' ? 'selected' : ''} data-translate="status_completed">مكتملة</option>
          <option value="مؤجلة" ${t.status === 'مؤجلة' ? 'selected' : ''} data-translate="status_pending">مؤجلة</option>
        </select>
      `;
      container.appendChild(div);
    });
    applyTranslations(); // تطبيق الترجمات على العناصر الديناميكية
  } catch (err) {
    console.error(err);
  }
}

// ====== المندوب – تحديث حالة المهمة ======
async function updateTaskStatus(id, newStatus) {
  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      loadTasks(); // تحديث قائمة المهام
      // إرسال إشعار إلى المشرف والمدير
      await notifySupervisorAndManager({
        taskId: id,
        status: newStatus,
        message: `تم تحديث المهمة ${id} إلى ${newStatus} بواسطة المندوب`
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== المندوب – رفع التقرير ======
async function submitDelegateReport() {
  try {
    const notes = document.getElementById('report-notes')?.value;
    const images = document.getElementById('report-images')?.files || [];
    const signature = document.getElementById('report-signature')?.files[0];
    const formData = new FormData();
    formData.append('notes', notes);
    formData.append('delegate', 'delegate1'); // استبدل باسم المستخدم الفعلي

    for (let i = 0; i < images.length; i++) formData.append('images', images[i]);
    if (signature) formData.append('signature', signature);

    const res = await fetch('/api/reports', { method: 'POST', body: formData });
    const data = await res.json();
    if (data.success) {
      alert(translations[document.documentElement.lang || 'ar'].report_success || 'تم إرسال التقرير ✅');
      if (document.getElementById('report-notes')) document.getElementById('report-notes').value = '';
      // إرسال إشعار إلى المشرف والمدير
      await notifySupervisorAndManager({
        reportId: data.reportId,
        delegate: 'delegate1',
        notes: notes,
        message: `تم رفع تقرير جديد بواسطة delegate1`
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== المشرف – قائمة المندوبين ======
async function loadSupervisorList() {
  try {
    const res = await fetch('/api/users');
    const users = await res.json();
    const container = document.getElementById('supervisor-list');
    if (!container) return;
    container.innerHTML = '';
    users.filter(u => u.role === 'delegate').forEach(u => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <b data-translate="delegate_name">${u.user}</b> | <b data-translate="phone_label">الهاتف:</b> ${u.phone} 
        <button onclick="viewDelegateLocation('${u.user}')" data-translate="view_map_btn">عرض على الخريطة</button>
      `;
      container.appendChild(div);
    });
    applyTranslations(); // تطبيق الترجمات
  } catch (err) {
    console.error(err);
  }
}

// ====== المشرف – تحميل تقارير المندوبين ======
async function loadSupervisorReports() {
  try {
    const res = await fetch('/api/reports');
    const reports = await res.json();
    const container = document.getElementById('supervisor-reports-list');
    if (!container) return;
    container.innerHTML = '';
    reports.forEach(r => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <b data-translate="delegate_name">مندوب:</b> ${r.delegate} | 
        <b data-translate="notes_label">ملاحظات:</b> ${r.notes} | 
        <b data-translate="date_label">تاريخ:</b> ${new Date(r.createdAt).toLocaleString()}<br>
        <button onclick="sendInstructionsToDelegate('${r.delegate}', '${r.reportId}')" data-translate="send_instructions_btn">إضافة تعليمات</button>
      `;
      container.appendChild(div);
    });
    applyTranslations(); // تطبيق الترجمات
  } catch (err) {
    console.error(err);
  }
}

// ====== المشرف – إرسال تعليمات إلى المندوب ======
async function sendInstructionsToDelegate(delegate, reportId) {
  const instructions = prompt(translations[document.documentElement.lang || 'ar'].enter_instructions || 'أدخل التعليمات للمندوب:');
  if (instructions) {
    try {
      const res = await fetch('/api/instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delegate, reportId, instructions })
      });
      const data = await res.json();
      if (data.success) {
        alert(translations[document.documentElement.lang || 'ar'].instructions_sent || 'تم إرسال التعليمات ✅');
        // إرسال إشعار إلى المندوب
        await notifyDelegate({
          delegate,
          message: `تعليمات جديدة من المشرف: ${instructions}`
        });
      }
    } catch (err) {
      console.error(err);
    }
  }
}

// ====== المشرف – عرض موقع المندوب ======
async function viewDelegateLocation(delegate) {
  alert(translations[document.documentElement.lang || 'ar'].view_location || `عرض موقع ${delegate} على الخريطة`);
  // يمكن إضافة تكامل مع Google Maps API هنا
}

// ====== المدير – تحميل التقارير ======
async function loadReports() {
  try {
    const res = await fetch('/api/reports');
    const reports = await res.json();
    const container = document.getElementById('reports-table');
    if (!container) return;
    container.innerHTML = '';
    reports.forEach(r => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td data-translate="delegate_name">${r.delegate}</td>
        <td>${r.complete || 0}</td>
        <td>${r.pending || 0}</td>
        <td>${r.percent || 0}%</td>
        <td><button onclick="sendInstructionsToDelegate('${r.delegate}', '${r.reportId}')" data-translate="send_instructions_btn">إضافة تعليمات</button></td>
      `;
      container.appendChild(tr);
    });
    applyTranslations(); // تطبيق الترجمات
  } catch (err) {
    console.error(err);
  }
}

// ====== المدير – إضافة مهمة جديدة ======
async function addTask() {
  const client = document.getElementById('task-client')?.value;
  const address = document.getElementById('task-address')?.value;
  const time = document.getElementById('task-time')?.value;

  if (!client || !address || !time) {
    alert(translations[document.documentElement.lang || 'ar'].task_missing || 'يرجى إدخال جميع بيانات المهمة');
    return;
  }

  try {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client, address, time, status: 'قيد التنفيذ' })
    });
    const data = await res.json();
    if (data.success) {
      alert(translations[document.documentElement.lang || 'ar'].task_added || 'تم إضافة المهمة ✅');
      // إرسال إشعار إلى المندوب والمشرف
      await notifyDelegateAndSupervisor({
        taskId: data.taskId,
        client,
        address,
        time,
        message: `مهمة جديدة: ${client} في ${address}`
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== المدير – تحديث بيانات المندوب ======
async function updateDelegate() {
  const name = document.getElementById('delegate-name')?.value;
  const phone = document.getElementById('delegate-phone')?.value;
  const email = document.getElementById('delegate-email')?.value;

  if (!name || !phone || !email) {
    alert(translations[document.documentElement.lang || 'ar'].delegate_missing || 'يرجى إدخال جميع بيانات المندوب');
    return;
  }

  try {
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, email, role: 'delegate' })
    });
    const data = await res.json();
    if (data.success) {
      alert(translations[document.documentElement.lang || 'ar'].delegate_updated || 'تم تحديث بيانات المندوب ✅');
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== المدير – إرسال إشعار جماعي ======
async function sendBroadcast() {
  const msg = document.getElementById('broadcast-message')?.value;
  if (!msg) {
    alert(translations[document.documentElement.lang || 'ar'].message_missing || 'أدخل رسالة قبل الإرسال!');
    return;
  }

  try {
    const res = await fetch('/api/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg })
    });
    const data = await res.json();
    if (data.success) {
      alert(translations[document.documentElement.lang || 'ar'].broadcast_sent || 'تم إرسال الإشعار: ' + msg);
      // إرسال إشعار إلى جميع المندوبين والمشرفين
      await notifyDelegateAndSupervisor({
        message: `إشعار من المدير: ${msg}`
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== تحميل الحضور والانصراف (المدير) ======
async function loadAttendance() {
  try {
    const res = await fetch('/api/attendance');
    const attendance = await res.json();
    const container = document.getElementById('attendance-list');
    if (!container) return;
    container.innerHTML = '';
    attendance.forEach(a => {
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <b data-translate="delegate_name">${a.delegate}</b><br>
        <b data-translate="login_label">دخول:</b> ${a.login} - 
        <b data-translate="logout_label">خروج:</b> ${a.logout}<br>
        <b data-translate="deviation_label">حالة:</b> ${a.deviation}
      `;
      container.appendChild(div);
    });
    applyTranslations(); // تطبيق الترجمات
  } catch (err) {
    console.error(err);
  }
}

// ====== إرسال إشعارات إلى المشرف والمدير ======
async function notifySupervisorAndManager(data) {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: ['supervisor', 'manager'],
        message: data.message,
        data
      })
    });
  } catch (err) {
    console.error(err);
  }
}

// ====== إرسال إشعارات إلى المندوب والمشرف ======
async function notifyDelegateAndSupervisor(data) {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: ['delegate', 'supervisor'],
        message: data.message,
        data
      })
    });
  } catch (err) {
    console.error(err);
  }
}

// ====== إرسال إشعار إلى المندوب ======
async function notifyDelegate(data) {
  try {
    await fetch('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipients: [data.delegate],
        message: data.message
      })
    });
  } catch (err) {
    console.error(err);
  }
}

// ====== تحميل الإشعارات (المندوب والمشرف) ======
async function loadNotifications() {
  try {
    const res = await fetch('/api/notifications');
    const notifs = await res.json();
    const container = document.getElementById('notifications-list');
    if (!container) return;
    container.innerHTML = '';
    notifs.forEach(n => {
      const li = document.createElement('li');
      li.textContent = n.message;
      container.appendChild(li);
    });
  } catch (err) {
    console.error(err);
  }
}

// ====== تهيئة الخريطة (المندوب) ======
function initMap() {
  const container = document.getElementById('map-container');
  if (container) {
    container.innerHTML = translations[document.documentElement.lang || 'ar'].map_placeholder || 'خريطة افتراضية (يمكن ربط Google Maps API)';
  }
}

// ====== تحديث الموقع (المندوب) ======
async function updateLocation() {
  try {
    // محاكاة تحديث الموقع
    const location = { lat: 0, lng: 0 }; // استبدل ببيانات الموقع الفعلية
    const res = await fetch('/api/location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delegate: 'delegate1', location })
    });
    const data = await res.json();
    if (data.success) {
      alert(translations[document.documentElement.lang || 'ar'].location_updated || 'تم تحديث الموقع ✅');
      // إرسال إشعار إلى المشرف والمدير
      await notifySupervisorAndManager({
        delegate: 'delegate1',
        location,
        message: `تم تحديث الموقع بواسطة delegate1`
      });
    }
  } catch (err) {
    console.error(err);
  }
}

// ====== إظهار الأقسام ======
function showSection(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
  const section = document.getElementById(id);
  const button = document.getElementById('btn-' + id);
  if (section) section.classList.add('active');
  if (button) button.classList.add('active');
}

// ====== تحديث الوقت (المدير) ======
function updateTime() {
  const managerInfo = document.getElementById('manager-info');
  if (managerInfo) {
    const now = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Cairo' });
    managerInfo.innerText = `${translations[document.documentElement.lang || 'ar'].manager_label || '👤 المدير: محمد علي'} | 🕒 ${now}`;
  }
}

// ====== تهيئة الصفحة بناءً على الدور ======
function initDelegate() {
  const tasksSection = document.getElementById('tasks');
  if (tasksSection) {
    showSection('tasks');
    loadTasks();
    loadNotifications();
    initMap();
    applyTranslations();
  }
}

function initSupervisor() {
  const supervisorList = document.getElementById('supervisor-list');
  if (supervisorList) {
    showSection('supervisor-list');
    loadSupervisorList();
    loadSupervisorReports();
    loadNotifications();
    applyTranslations();
  }
}

function initManager() {
  const reportsSection = document.getElementById('reports');
  if (reportsSection) {
    showSection('reports');
    loadReports();
    loadAttendance();
    updateTime();
    setInterval(updateTime, 60000);
    applyTranslations();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  applyTranslations();
  if (document.getElementById('login-user')) login();
  else if (document.getElementById('tasks')) initDelegate();
  else if (document.getElementById('supervisor-list')) initSupervisor();
  else if (document.getElementById('reports')) initManager();
});
