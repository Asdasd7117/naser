// server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // إذا Node 18+ يمكنك استخدام fetch الأصلي
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// ==== إعدادات Supabase ====
const SUPABASE_URL = 'https://vkativialsvvbifhjrey.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXRpdmlhbHN2dmJpZmhqcmV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEwMzEwNSwiZXhwIjoyMDczNjc5MTA1fQ.xUR96RId88zr0VhJNuxEy55FSKUFTRVqxJQMMHNkoMY'; // ضع مفتاح service role هنا

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_SERVICE_KEY,
  'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
};

// ==== Middleware ====
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // لو وضعت admin.html داخل مجلد public

// ==== Routes ====

// جلب المستخدمين
app.get('/api/users', async (req, res) => {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,email,role`, { headers });
    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// إنشاء مستخدم جديد (auth + جدول users)
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if(!email || !password || !role) return res.status(400).json({ error:'الحقول ناقصة' });

    // إنشاء مستخدم Authentication
    const authRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
      method:'POST',
      headers,
      body: JSON.stringify({ email, password })
    });
    const authData = await authRes.json();
    if(authData?.statusCode) return res.status(400).json(authData);

    const userId = authData.id;

    // إضافة المستخدم لجدول users
    await fetch(`${SUPABASE_URL}/rest/v1/users`, {
      method:'POST',
      headers,
      body: JSON.stringify([{ id:userId, email, role }])
    });

    res.json({ success:true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف مستخدم
app.delete('/api/users/:id', async (req,res)=>{
  const { id } = req.params;
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${id}`, { method:'DELETE', headers });
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${id}`, { method:'DELETE', headers });
    res.json({ success:true });
  }catch(err){
    res.status(500).json({ error: err.message });
  }
});

// المهام
app.get('/api/tasks', async (req,res)=>{
  try{
    const r = await fetch(`${SUPABASE_URL}/rest/v1/tasks?select=*&order=created_at.desc`, { headers });
    const data = await r.json();
    res.json(data);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

app.post('/api/tasks', async (req,res)=>{
  try{
    const task = req.body;
    await fetch(`${SUPABASE_URL}/rest/v1/tasks`, { method:'POST', headers, body: JSON.stringify([task]) });
    res.json({ success:true });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

app.delete('/api/tasks/:id', async (req,res)=>{
  const { id } = req.params;
  try{
    await fetch(`${SUPABASE_URL}/rest/v1/tasks?id=eq.${id}`, { method:'DELETE', headers });
    res.json({ success:true });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// الإشعارات
app.post('/api/notifications', async (req,res)=>{
  try{
    const { message, target } = req.body;
    if(target==='all'){
      const usersRes = await fetch(`${SUPABASE_URL}/rest/v1/users?select=id,role`, { headers });
      const users = await usersRes.json();
      const agents = users.filter(u=>u.role==='agent');
      const inserts = agents.map(a=>({ user_id:a.id, message }));
      await fetch(`${SUPABASE_URL}/rest/v1/notifications`, { method:'POST', headers, body: JSON.stringify(inserts) });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/notifications`, { method:'POST', headers, body: JSON.stringify([{ user_id:target, message }]) });
    }
    res.json({ success:true });
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// التقارير
app.get('/api/reports', async (req,res)=>{
  try{
    const r = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=*&order=created_at.desc`, { headers });
    const data = await r.json();
    res.json(data);
  }catch(err){ res.status(500).json({ error: err.message }); }
});

// ==== Start Server ====
app.listen(PORT, ()=> console.log(`Server running on http://localhost:${PORT}`));
