const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Supabase
const SUPABASE_URL = 'https://ncjxqfqwswwikedaffif.supabase.co';
const SUPABASE_KEY = 'ZX7giBBgWRScW6usplziAWjNYn9yCVeLVAQz7YUBjvA';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== API =====

// المستخدمين
app.get('/api/users', async (req,res)=>{
    const { data, error } = await supabase.from('users').select('*');
    if(error) return res.status(400).json({error});
    res.json(data);
});

app.post('/api/users/add', async (req,res)=>{
    const { email, password, role } = req.body;
    const { data, error } = await supabase.from('users').insert([{email,password,role}]);
    if(error) return res.status(400).json({error});
    res.json({success:true});
});

app.post('/api/users/delete', async (req,res)=>{
    const { email } = req.body;
    const { data, error } = await supabase.from('users').delete().eq('email',email);
    if(error) return res.status(400).json({error});
    res.json({success:true});
});

// المهام
app.get('/api/tasks', async (req,res)=>{
    const { data, error } = await supabase.from('tasks').select('*');
    if(error) return res.status(400).json({error});
    res.json(data);
});

app.post('/api/tasks/add', async (req,res)=>{
    const { agent_id, client_name, address, visit_time, status } = req.body;
    const { data, error } = await supabase.from('tasks').insert([{agent_id,client_name,address,visit_time,status}]);
    if(error) return res.status(400).json({error});
    res.json({success:true});
});

app.post('/api/tasks/update', async (req,res)=>{
    const { id, status } = req.body;
    const { data, error } = await supabase.from('tasks').update({status}).eq('id',id);
    if(error) return res.status(400).json({error});
    res.json({success:true});
});

// التقارير
app.get('/api/reports', async (req,res)=>{
    const { data, error } = await supabase.from('reports').select('*');
    if(error) return res.status(400).json({error});
    res.json(data);
});

app.post('/api/reports/add', async (req,res)=>{
    const { agent_id, notes, images, signature } = req.body;
    const { data, error } = await supabase.from('reports').insert([{agent_id, notes, images, signature}]);
    if(error) return res.status(400).json({error});
    res.json({success:true});
});

// ===== تشغيل السيرفر =====
const PORT = 3000;
app.listen(PORT, ()=>console.log(`Server running on http://localhost:${PORT}`));
