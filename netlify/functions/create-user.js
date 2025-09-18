const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://vkativialsvvbifhjrey.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY';
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
