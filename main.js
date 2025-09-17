// main.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// ==== تهيئة Supabase ====
const SUPABASE_URL = 'https://your-project-id.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrYXRpdmlhbHN2dmJpZmhqcmV5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODEwMzEwNSwiZXhwIjoyMDczNjc5MTA1fQ.xUR96RId88zr0VhJNuxEy55FSKUFTRVqxJQMMHNkoMY'
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ==== المستخدم الحالي ====
export function currentUser() {
    return supabase.auth.user()
}

// ==== تسجيل الدخول ====
export async function signIn(emailOrPhone, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        password
    })
    if(error) throw error
    // استرجاع بيانات المستخدم من جدول users
    const { data: userData } = await supabase.from('users').select('*').eq('id', data.user.id).single()
    if(!userData) throw new Error('المستخدم غير موجود')
    return userData
}

// ==== تسجيل حساب جديد ====
export async function signUp(emailOrPhone, password, role) {
    const { data, error } = await supabase.auth.signUp({
        email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
        password
    })
    if(error) throw error

    // إضافة المستخدم إلى جدول users
    await supabase.from('users').insert([{
        id: data.user.id,
        email_or_phone: emailOrPhone,
        role,
        status:'نشط'
    }])
    return { id: data.user.id, email_or_phone: emailOrPhone, role, status:'نشط' }
}

// ==== الاشتراك في تحديثات الجدول لحظياً ====
export function subscribeTable(table, callback) {
    supabase.channel(`realtime-${table}`)
        .on('postgres_changes', { event:'*', schema:'public', table }, payload => {
            console.log('Realtime update:', payload)
            callback(payload)
        })
        .subscribe()
}

// ==== المهام ====
export async function getTasks(userId=null) {
    let query = supabase.from('tasks').select('*')
    if(userId) query = query.eq('assigned_to', userId)
    const { data, error } = await query
    if(error) throw error
    return data
}

export async function updateTaskStatus(taskId, status) {
    const { data, error } = await supabase.from('tasks').update({ status }).eq('id', taskId)
    if(error) throw error
    return data
}

export async function submitReport(taskId, notes, signature, images=[]) {
    const { data, error } = await supabase.from('tasks').update({
        notes, signature, images, status:'completed'
    }).eq('id', taskId)
    if(error) throw error
    return data
}

// ==== المندوبين ====
export async function getAgents() {
    const { data, error } = await supabase.from('users').select('*').eq('role','agent')
    if(error) throw error
    return data
}

// ==== التقارير للمشرف ====
export async function getReports() {
    const { data, error } = await supabase.from('tasks').select('*').not('notes','is',null)
    if(error) throw error
    return data
}

export async function addReportComment(taskId, comment) {
    const { data, error } = await supabase.from('tasks').update({ supervisor_comments: comment }).eq('id', taskId)
    if(error) throw error
    return data
}

// ==== الإشعارات ====
export async function getNotifications(userId=null) {
    let query = supabase.from('notifications').select('*').order('created_at',{ascending:false})
    if(userId) query = query.eq('user_id', userId)
    const { data, error } = await query
    if(error) throw error
    return data
}

export async function markNotificationRead(notificationId) {
    const { data, error } = await supabase.from('notifications').update({ read:true }).eq('id', notificationId)
    if(error) throw error
    return data
}

// ==== الموقع الجغرافي ====
export async function updateAgentLocation(agentId, lat, lng) {
    const { data, error } = await supabase.from('users').update({ lat, lng }).eq('id', agentId)
    if(error) throw error
    return data
}

// ==== رفع الصور ====
export async function uploadImage(file, folder='reports') {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}.${fileExt}`
    const { data, error } = await supabase.storage.from('images').upload(fileName, file)
    if(error) throw error
    const { data: publicUrl } = supabase.storage.from('images').getPublicUrl(fileName)
    return publicUrl.publicUrl
}

// ==== تحميل التقارير والمندوبين والإشعارات تلقائيًا ====
export async function initRealtime(callbacks={tasks:null, users:null, notifications:null}) {
    if(callbacks.tasks) subscribeTable('tasks', callbacks.tasks)
    if(callbacks.users) subscribeTable('users', callbacks.users)
    if(callbacks.notifications) subscribeTable('notifications', callbacks.notifications)
}
