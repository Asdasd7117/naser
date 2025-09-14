// supabase.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/supabase.min.js';

// تصحيح رابط Supabase
const SUPABASE_URL = 'https://ncjxqfqwswwikedaffif.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janhxZnF3c3d3aWtlZGFmZmlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4NDEwNzQsImV4cCI6MjA3MzQxNzA3NH0.4G54968qAHyePjq9_ufSCSA1fHzx5XHFzOAqGKmVW18';
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== التحقق من تسجيل الدخول =====
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

// ===== المستخدمين =====
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

// ===== المهام =====
export async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*');
    return data || [];
}

export async function fetchTasksByEmployee(phone){
    const { data } = await supabase.from('tasks').select('*').eq('employee', phone);
    return data || [];
}

export async function updateTaskStatus(taskId, status){
    const { data, error } = await supabase.from('tasks').update({status}).eq('id', taskId);
    return { data, error };
}

export async function upsertTask(task){
    const { data, error } = await supabase.from('tasks')
        .upsert([task], { onConflict:['id'] });
    return { data, error };
}

// ===== الحضور =====
export async function fetchAttendance() {
    const { data } = await supabase.from('attendance').select('*');
    return data || [];
}

// ===== التقارير =====
export async function submitReport(report){
    const { data, error } = await supabase.from('reports').insert([report]);
    return { data, error };
}

export async function fetchReports(){
    const { data } = await supabase.from('reports').select('*');
    return data || [];
}

export async function addReportNote(reportId, note){
    const { data, error } = await supabase.from('reports')
        .update({ supervisor_note: note })
        .eq('id', reportId);
    return { data, error };
}

// ===== المندوبين =====
export async function fetchEmployees(){
    const { data } = await supabase.from('users')
        .select('*')
        .eq('role', 'employee');
    return data || [];
}

// ===== الإشعارات =====
// إرسال إشعار عام أو حسب الدور أو الهاتف
export async function sendNotification(message, role = null, phone = null){
    const { data, error } = await supabase.from('notifications').insert([{ message, role, phone }]);
    return { data, error };
}

// جلب إشعارات المستخدم حسب الدور أو الهاتف
export async function fetchNotifications(roleOrPhone){
    const { data } = await supabase.from('notifications')
        .select('*')
        .or(`role.eq.${roleOrPhone},phone.eq.${roleOrPhone}`);
    return data || [];
}
