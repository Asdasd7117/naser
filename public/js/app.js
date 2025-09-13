// تسجيل الدخول
async function login(){
  const user=document.getElementById('login-user').value;
  const password=document.getElementById('login-pass').value;
  const role=document.getElementById('role').value;
  const res=await fetch('/api/login',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({user,password,role})
  });
  const data=await res.json();
  if(data.success){
    alert('تم تسجيل الدخول بنجاح!');
    if(role==='delegate') window.location='delegate.html';
    else if(role==='supervisor') window.location='supervisor.html';
    else window.location='manager.html';
  }else alert(data.message);
}

// المندوب – تحميل المهام
async function loadTasks(){
  const res=await fetch('/api/tasks');
  const tasks=await res.json();
  const container=document.getElementById('tasks-list');
  container.innerHTML='';
  tasks.forEach(t=>{
    const div=document.createElement('div');
    div.innerHTML=`<b>العميل:</b> ${t.client} | <b>العنوان:</b> ${t.address} | <b>وقت الزيارة:</b> ${t.time} | <b>الحالة:</b> ${t.status} 
    <button onclick="updateTaskStatus('${t.id}')">تحديث الحالة</button>`;
    container.appendChild(div);
  });
}

// تحديث حالة المهمة
async function updateTaskStatus(id){
  const status=prompt("أدخل الحالة الجديدة: قيد التنفيذ / مكتملة / مؤجلة");
  if(!status) return;
  const res=await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,status})});
  const data=await res.json();
  if(data.success) loadTasks();
}

// رفع التقرير
async function submitDelegateReport(){
  const notes=document.getElementById('report-notes').value;
  const images=document.getElementById('report-images').files;
  const signature=document.getElementById('report-signature').files[0];
  const formData=new FormData();
  formData.append('notes',notes);
  formData.append('delegate','delegate1'); // مثال، يمكن تعديل لاسم المستخدم فعلي
  for(let i=0;i<images.length;i++) formData.append('images',images[i]);
  if(signature) formData.append('signature',signature);
  const res=await fetch('/api/reports',{method:'POST',body:formData});
  const data=await res.json();
  if(data.success){ alert('تم إرسال التقرير'); document.getElementById('report-notes').value=''; }
}

// المشرف – قائمة المندوبين
async function loadSupervisorList(){
  const res=await fetch('/api/users');
  const users=await res.json();
  const container=document.getElementById('supervisor-list');
  container.innerHTML='';
  users.filter(u=>u.role==='delegate').forEach(u=>{
    const div=document.createElement('div');
    div.innerHTML=`${u.user} | <button onclick="alert('عرض موقع ${u.user}')">عرض على الخريطة</button>`;
    container.appendChild(div);
  });
}

// المدير – تحميل التقارير
async function loadReports(){
  const res=await fetch('/api/reports');
  const reports=await res.json();
  const container=document.getElementById('reports-list');
  container.innerHTML='';
  reports.forEach(r=>{
    const div=document.createElement('div');
    div.innerHTML=`<b>مندوب:</b> ${r.delegate} | <b>ملاحظات:</b> ${r.notes} | <b>تاريخ:</b> ${new Date(r.createdAt).toLocaleString()}
    <button onclick="alert('إضافة تعليمات')">إضافة تعليمات</button>`;
    container.appendChild(div);
  });
}
