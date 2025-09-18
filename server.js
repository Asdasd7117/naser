import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = 'https://vkativialsvvbifhjrey.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXRpdmlhbHN2dmJpZmhqcmV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEwMzEwNSwiZXhwIjoyMDczNjc5MTA1fQ.xUR96RId88zr0VhJNuxEy55FSKUFTRVqxJQMMHNkoMY'; // Service Role Key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// حذف مستخدم
app.post('/delete-user', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID مفقود' });

  try {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// حذف مهمة
app.post('/delete-task', async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ error: 'ID مفقود' });

  try {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    res.json({ success: true });
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
});

// يمكنك إضافة create-user بنفس الأسلوب لاحقاً

app.listen(3000, () => console.log('Server running on port 3000'));
