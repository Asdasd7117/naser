// serve.js
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// ==== إعداد الجسم JSON + FormData ====
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==== استضافة ملفات المشروع الثابتة ====
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ==== صفحات HTML ====
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/delegate.html', (req, res) => res.sendFile(path.join(__dirname, 'delegate.html')));
app.get('/supervisor.html', (req, res) => res.sendFile(path.join(__dirname, 'supervisor.html')));
app.get('/manager.html', (req, res) => res.sendFile(path.join(__dirname, 'manager.html')));

// ==== API وهمي لتجربة login قبل Supabase ====
const users = [
  { user: "delegate1", password: "12345", role: "delegate", email: "delegate1@example.com", phone: "71234567" },
  { user: "supervisor1", password: "12345", role: "supervisor", email: "supervisor1@example.com", phone: "712345678" },
  { user: "manager1", password: "12345", role: "manager", email: "manager1@example.com", phone: "7123456789" }
];

app.post('/api/login', (req, res) => {
  const { user, password } = req.body;
  const u = users.find(u => (u.email === user || u.phone === user) && u.password === password);
  if(u) res.json({ success: true, role: u.role });
  else res.json({ success: false, message: 'بيانات الدخول غير صحيحة!' });
});

// ==== API وهمي للمهام والتقارير (Delegate / Admin / Supervisor) ====
let tasks = [
  { id:1, delegate:"delegate1", client:"شركة أبجد", address:"القاهرة", time:"10:00", status:"قيد التنفيذ" },
  { id:2, delegate:"delegate1", client:"مؤسسة ألف", address:"الإسكندرية", time:"11:00", status:"مؤجلة" }
];

app.get('/api/tasks', (req, res) => res.json(tasks));
app.post('/api/tasks', (req, res) => {
  const { id, status } = req.body;
  const task = tasks.find(t => t.id === id);
  if(task) task.status = status;
  res.json({ success: true });
});

let reports = [];
app.get('/api/reports', (req, res) => res.json(reports));
app.post('/api/reports', (req, res) => {
  const { delegate, notes } = req.body;
  reports.push({ delegate, notes, createdAt: new Date() });
  res.json({ success: true });
});

// ==== تشغيل السيرفر ====
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
