const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://vkativialsvvbifhjrey.supabase.co';
const SUPABASE_SERVICE_KEY = 'YOUR_SERVICE_ROLE_KEY';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
  const id = event.path.split('/').pop();
  try{
    if(event.httpMethod === 'GET'){
      const { data } = await supabase.from('users').select('*');
      return { statusCode:200, body:JSON.stringify(data) };
    }
    if(event.httpMethod === 'DELETE'){
      await supabase.from('users').delete().eq('id',id);
      return { statusCode:200, body:JSON.stringify({ success:true }) };
    }
  }catch(err){
    return { statusCode:500, body:JSON.stringify({ success:false, message: err.message }) };
  }
};
