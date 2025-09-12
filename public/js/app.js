
// ==== app.js Production ===
function goPage(page){ window.location.href=page; }

async function login(){
  const user=document.getElementById("login-user").value;
  const pass=document.getElementById("login-pass").value;
  const role=document.getElementById("role").value;
  const res=await fetch('/api/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user,password:pass,role})});
  const data=await res.json();
  if(data.success){ localStorage.setItem('app_user',JSON.stringify({user,role})); 
    if(role==='delegate') goPage('delegate.html'); 
    else if(role==='supervisor') goPage('supervisor.html'); 
    else goPage('manager.html'); 
  } else alert(data.message);
}

// ===== مهام المندوب =====
async function getTasks(){ return await fetch('/api/tasks').then(r=>r.json()); }
async function updateTask(task){ await fetch('/api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(task)}); }

async function sendReport(notes,images,signature){
  const delegate=JSON.parse(localStorage.getItem('app_user')).user;
  const formData=new FormData();
  formData.append('notes',notes);
  formData.append('delegate',delegate);
  images.forEach(img=>formData.append('images',img));
  if(signature) formData.append('signature',signature);
  await fetch('/api/reports',{method:'POST',body:formData});
  alert("تم إرسال التقرير");
}

// ===== إشعارات ذكية =====
async function notifyDelays(){
  const tasks = await getTasks();
  const now = new Date();
  tasks.forEach(t=>{
    const taskTime = new Date(t.time);
    if(t.status==="قيد التنفيذ" && now > taskTime){
      alert("تنبيه: مهمة "+t.client+" متأخرة!");
    }
  });
}
setInterval(notifyDelays,5*60*1000); // كل 5 دقائق

// ===== إحصائيات للمدير =====
async function getStats(){
  const reports = await fetch('/api/reports').then(r=>r.json());
  const tasks = await getTasks();
  return {totalTasks:tasks.length,totalReports:reports.length};
}

// تغيير اللغة
function toggleLanguage(){ const current=localStorage.getItem("lang")||"ar"; setLanguage(current==="ar"?"en":"ar"); }
