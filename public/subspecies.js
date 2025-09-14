// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js';

const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_KEY = 'your-public-anon-key';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// التحقق من تسجيل الدخول
export async function loginUser(role, username, password) {
    if(role==='manager'){
        if(username==='7123456789' && password==='123456'){
            return { role:'manager', phone:username, name:'المدير الافتراضي / Manager' };
        } else return null;
    }
    const { data, error } = await supabase.from('users')
        .select('*')
        .eq('role', role)
        .eq('phone', username)
        .eq('password', password)
        .limit(1).single();
    if(error || !data) return null;
    return data;
}

// المستخدمين
export async function fetchUsers() {
    const { data } = await supabase.from('users').select('*');
    return data || [];
}

export async function upsertUser(user) {
    const { data, error } = await supabase.from('users')
        .upsert([user], { onConflict: ['phone'] });
    return { data, error };
}

export async function deleteUser(phone){
    const { data, error } = await supabase.from('users')
        .delete().eq('phone', phone);
    return { data, error };
}

// المهام
export async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*');
    return data || [];
}

// المهام الخاصة بمندوب محدد
export async function fetchTasksByEmployee(phone){
    const { data } = await supabase.from('tasks').select('*').eq('employee', phone);
    return data || [];
}

// تحديث حالة مهمة
export async function updateTaskStatus(taskId, status){
    const { data, error } = await supabase.from('tasks').update({status}).eq('id', taskId);
    return { data, error };
}

// إضافة أو تعديل مهمة
export async function upsertTask(task){
    const { data, error } = await supabase.from('tasks')
        .upsert([task], { onConflict:['id'] });
    return { data, error };
}

// الحضور
export async function fetchAttendance() {
    const { data } = await supabase.from('attendance').select('*');
    return data || [];
}

// رفع تقرير المندوب
export async function submitReport(report){
    const { data, error } = await supabase.from('reports').insert([report]);
    return { data, error };
}

// جلب جميع التقارير (للمشرف)
export async function fetchReports(){
    const { data } = await supabase.from('reports').select('*');
    return data || [];
}

// إضافة ملاحظة على تقرير
export async function addReportNote(reportId, note){
    const { data, error } = await supabase.from('reports')
        .update({ supervisor_note: note })
        .eq('id', reportId);
    return { data, error };
}

// جلب بيانات المندوبين للحالة والمهام (للمشرف)
export async function fetchEmployees(){
    const { data } = await supabase.from('users')
        .select('*')
        .eq('role', 'employee');
    return data || [];
}

// الإشعارات
export async function sendNotification(message, role = null){
    const { data, error } = await supabase.from('notifications').insert([{ message, role }]);
    return { data, error };
}

// جلب إشعارات المستخدم
export async function fetchNotifications(roleOrPhone){
    const { data } = await supabase.from('notifications')
        .select('*')
        .or(`role.eq.${roleOrPhone},employee.eq.${roleOrPhone}`);
    return data || [];
}
