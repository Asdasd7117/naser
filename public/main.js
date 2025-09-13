// إعداد Supabase (استبدل بـ Anon Key الخاص بك)
const supabase = Supabase.createClient('https://olwguiyogqwzraikq.supabase.co', 'your-anon-key');

// إعداد i18next للترجمة
i18next.init({
  lng: 'ar',
  resources: {
    ar: {
      translation: {
        login: 'تسجيل الدخول',
        email_or_phone: 'البريد الإلكتروني أو الهاتف',
        password: 'كلمة المرور',
        forgot_password: 'نسيت كلمة المرور؟',
        invalid_credentials: 'بيانات تسجيل الدخول غير صحيحة',
        enter_email_or_phone: 'أدخل البريد الإلكتروني أو الهاتف',
        password_reset_email_sent: 'تم إرسال بريد إعادة تعيين كلمة المرور',
        error_resetting_password: 'خطأ في إعادة تعيين كلمة المرور',
        tasks: 'المهام',
        client_name: 'اسم العميل',
        address: 'العنوان',
        visit_time: 'وقت الزيارة',
        status: 'الحالة',
        in_progress: 'قيد التنفيذ',
        completed: 'مكتملة',
        postponed: 'مؤجلة',
        update_status: 'تحديث الحالة',
        report_notes: 'ملاحظات التقرير',
        upload_images: 'رفع الصور',
        client_signature: 'توقيع العميل',
        submit_report: 'إرسال التقرير',
        report_submitted: 'تم إرسال التقرير',
        notifications: 'الإشعارات',
        delegates: 'المندوبون',
        reports: 'التقارير',
        add_comment: 'إضافة تعليق',
        analytics: 'التقارير والتحليلات',
        attendance: 'الحضور والانصراف',
        completed_tasks: 'المهام المكتملة',
        add_task: 'إضافة مهمة',
        task_added: 'تم إضافة المهمة',
        view_on_map: 'عرض على الخريطة',
        logout: 'تسجيل الخروج',
        your_location: 'موقعك الحالي'
      }
    },
    en: {
      translation: {
        login: 'Login',
        email_or_phone: 'Email or Phone',
        password: 'Password',
        forgot_password: 'Forgot Password?',
        invalid_credentials: 'Invalid login credentials',
        enter_email_or_phone: 'Enter email or phone',
        password_reset_email_sent: 'Password reset email sent',
        error_resetting_password: 'Error resetting password',
        tasks: 'Tasks',
        client_name: 'Client Name',
        address: 'Address',
        visit_time: 'Visit Time',
        status: 'Status',
        in_progress: 'In Progress',
        completed: 'Completed',
        postponed: 'Postponed',
        update_status: 'Update Status',
        report_notes: 'Report Notes',
        upload_images: 'Upload Images',
        client_signature: 'Client Signature',
        submit_report: 'Submit Report',
        report_submitted: 'Report submitted',
        notifications: 'Notifications',
        delegates: 'Delegates',
        reports: 'Reports',
        add_comment: 'Add Comment',
        analytics: 'Reports & Analytics',
        attendance: 'Attendance',
        completed_tasks: 'Completed Tasks',
        add_task: 'Add Task',
        task_added: 'Task added',
        view_on_map: 'View on Map',
        logout: 'Logout',
        your_location: 'Your Location'
      }
    }
  }
}, function(err, t) {
  updateContent();
});

// تحديث المحتوى عند تغيير اللغة
function updateContent() {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (key.startsWith('[placeholder]')) {
      element.placeholder = i18next.t(key.replace('[placeholder]', ''));
    } else {
      element.textContent = i18next.t(key);
    }
  });
}

// تغيير اللغة
function changeLanguage(lng) {
  i18next.changeLanguage(lng, function() {
    updateContent();
    document.documentElement.lang = lng;
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  });
}

// تسجيل الدخول
document.getElementById('login-form') && document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const emailOrPhone = document.getElementById('email-or-phone').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
      phone: emailOrPhone.includes('@') ? undefined : emailOrPhone,
      password
    });
    if (error) throw error;

    const { data: userData } = await supabase.from('users').select('role').eq('id', data.user.id).single();
    if (userData.role === 'delegate') window.location.href = 'delegate.html';
    else if (userData.role === 'supervisor') window.location.href = 'supervisor.html';
    else if (userData.role === 'manager') window.location.href = 'manager.html';
  } catch (err) {
    errorEl.textContent = i18next.t('invalid_credentials');
  }
});

// نسيت كلمة المرور
async function forgotPassword() {
  const emailOrPhone = document.getElementById('email-or-phone').value;
  const errorEl = document.getElementById('error');
  if (!emailOrPhone) {
    errorEl.textContent = i18next.t('enter_email_or_phone');
    return;
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(emailOrPhone);
    if (error) throw error;
    alert(i18next.t('password_reset_email_sent'));
  } catch (err) {
    errorEl.textContent = i18next.t('error_resetting_password');
  }
}

// تسجيل الخروج
async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'index.html';
}
