// تسجيل الدخول
async function login(){
  const user=document.getElementById("login-user").value;
  const pass=document.getElementById("login-pass").value;
  const role=document.getElementById("role").value;
  const res = await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user,password:pass,role})});
  const data = await res.json();
  if(data.success){
    alert("تم تسجيل الدخول بنجاح");
    if(role==='delegate') window.location.href='delegate.html';
    if(role==='supervisor') window.location.href='supervisor.html';
    if(role==='manager') window.location.href='manager.html';
  } else alert(data.message);
}

// المندوب: تحميل المهام
async function loadTasks(){
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  const container = document.getElementById('tasks-list');
  container.innerHTML='';
  tasks.forEach(task=>{
    const div = document.createElement('div');
    div.innerHTML=`<b>${task.client}</b> | ${task.address} | ${task.time} | ${task.status} 
    <button onclick="updateTaskStatus('${task.id}')">تحديث الحالة</button>`;
    container.appendChild(div);
  });
}

// تحديث حالة مهمة
async function updateTaskStatus(id){
  const res = await fetch('/api/tasks');
  const tasks = await res.json();
  const task = tasks.find(t=>t.id===id);
  if(!task) return;
  task.status = task.status==='قيد التنفيذ'?'مكتملة':'قيد التنفيذ';
  await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(task)});
  loadTasks();
}

// رفع تقرير المندوب
async function submitDelegateReport(){
  const notes=document.getElementById('report-notes').value;
  const images=document.getElementById('report-images').files;
  const signature=document.getElementById('report-signature').files[0];
  const form = new FormData();
  form.append('notes',notes);
  form.append('delegate','delegate1');
  for(let i=0;i<images.length;i++) form.append('images',images[i]);
  if(signature) form.append('signature',signature);
  const res = await fetch('/api/reports',{method:'POST',body:form});
  const data = await res.json();
  if(data.success) alert('تم إرسال التقرير بنجاح');
}
