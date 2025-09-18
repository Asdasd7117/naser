const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vkativialsvvbifhjrey.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXRpdmlhbHN2dmJpZmhqcmV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEwMzEwNSwiZXhwIjoyMDczNjc5MTA1fQ.xUR96RId88zr0VhJNuxEy55FSKUFTRVqxJQMMHNkoMY';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

exports.handler = async function(event, context){
  try{
    const { email, password, role } = JSON.parse(event.body);

    // إنشاء مستخدم جديد
    const { data, error } = await supabase.auth.admin.createUser({
      email, password, email_confirm: true
    });
    if(error) throw error;

    // إضافة الدور في جدول users
    await supabase.from('users').insert([{ id: data.user.id, email, role }]);

    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  }catch(err){
    return { statusCode: 500, body: JSON.stringify({ success: false, message: err.message }) };
  }
};
