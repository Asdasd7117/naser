// ====== تسجيل الدخول ======
async function login() {
  const user = document.getElementById('login-user').value;
  const password = document.getElementById('login-pass').value;
  const role = document.getElementById('role').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({user, password, role})
    });
    const data = await res.json();

    if(data.success){
      alert(data.message || 'تم تسجيل الدخول بنجاح!');
      if(role==='delegate') window.location='delegate.html';
      else if(role==='supervisor') window.location='supervisor.html';
      else window.location='manager.html';
    } else {
      alert(data.message || 'فشل تسجيل الدخول');
    }
  } catch(err) {
    console.error(err);
    alert('حدث خطأ أثناء تسجيل الدخول');
  }
}

// ====== المندوب – تحميل المهام ======
async function loadTasks(){
  try {
    const res = await fetch('/api/tasks');
    const tasks = await res.json();
    const container = document.getElementById('tasks-list');
    if(!container) return;
    container.innerHTML = '';
    tasks.forEach((t, idx)=>{
      const div = document.createElement('div');
      div.className = 'task-card';
      div.innerHTML = `
        <b>العميل:</b> ${t.client}<br>
        <b>العنوان:</b> ${t.address}<br>
        <b>وقت الزيارة:</b> ${t.time}<br>
        <b>الحالة:</b>
        <select onchange="updateTaskStatus('${t.id}', this.value)">
          <option ${t.status==='قيد التنفيذ'?'selected':''}>قيد التنفيذ</option>
          <option ${t.status==='مكتملة'?'selected':''}>مكتملة</option>
          <option ${t.status==='مؤجلة'?'selected':''}>مؤجلة</option>
        </select>
      `;
      container.appendChild(div);
    });
  } catch(err){
    console.error(err);
  }
}

// ====== المندوب – تحديث حالة المهمة ======
async function updateTaskStatus(id, newStatus){
  try {
    const res = await fetch('/api/tasks', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id, status:newStatus})
    });
    const data = await res.json();
    if(data.success) loadTasks();
  } catch(err){
    console.error(err);
  }
}

// ====== المندوب – رفع التقرير ======
async function submitDelegateReport(){
  try {
    const notes = document.getElementById('report-notes').value;
    const images = document.getElementById('report-images')?.files || [];
    const signature = document.getElementById('report-signature')?.files[0];
    const formData = new FormData();
    formData.append('notes', notes);
    formData.append('delegate','delegate1'); // يمكن تعديل لاسم المستخدم فعلي

    for(let i=0;i<images.length;i++) formData.append('images', images[i]);
    if(signature) formData.append('signature', signature);

    const res = await fetch('/api/reports', {method:'POST', body: formData});
    const data = await res.json();
    if(data.success){
      alert('تم إرسال التقرير ✅');
      if(document.getElementById('report-notes')) document.getElementById('report-notes').value='';
    }
  } catch(err){
    console.error(err);
  }
}

// ====== المشرف – قائمة المندوبين ======
async function loadSupervisorList(){
  try {
    const res = await fetch('/api/users');
    const users = await res.json();
    const container = document.getElementById('supervisor-list');
    if(!container) return;
    container.innerHTML = '';
    users.filter(u => u.role==='delegate').forEach(u=>{
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <b>${u.user}</b> | <b>الهاتف:</b> ${u.phone} 
        <button onclick="alert('عرض موقع ${u.user}')">عرض على الخريطة</button>
      `;
      container.appendChild(div);
    });
  } catch(err){
    console.error(err);
  }
}

// ====== المدير – تحميل التقارير ======
async function loadReports(){
  try {
    const res = await fetch('/api/reports');
    const reports = await res.json();
    const container = document.getElementById('reports-list');
    if(!container) return;
    container.innerHTML = '';
    reports.forEach(r=>{
      const div = document.createElement('div');
      div.className = 'card';
      div.innerHTML = `
        <b>مندوب:</b> ${r.delegate} | 
        <b>ملاحظات:</b> ${r.notes} | 
        <b>تاريخ:</b> ${new Date(r.createdAt).toLocaleString()}<br>
        <button onclick="alert('إضافة تعليمات للمندوب ${r.delegate}')">إضافة تعليمات</button>
      `;
      container.appendChild(div);
    });
  } catch(err){
    console.error(err);
  }
}
