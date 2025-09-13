// إعداد Supabase
const supabase = Supabase.createClient(
  'https://olwguiyogqwzraikquni.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sd2d1aXlvZ3F3enJhaWtxdW5pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjY2MTAsImV4cCI6MjA3MzM0MjYxMH0.m_nFTy7JLgoKfgjzf9X7c9xyfv_YbBZ9vaEwJcUTwD4'
);
console.log('Supabase initialized:', 'https://olwguiyogqwzraikquni.supabase.co');

// التحقق من تحميل i18next
if (typeof i18next === 'undefined') {
  console.error('Error: i18next is not loaded');
} else {
  // إعداد i18next للترجمة
  i18next.init({
    lng: 'ar',
    fallbackLng: 'ar',
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
    if (err) {
      console.error('i18next initialization error:', err);
    } else {
      console.log('i18next initialized successfully');
      updateContent();
    }
  });
}

// تحديث المحتوى عند تغيير اللغة
function updateContent() {
  console.log('Updating content for language:', i18next.language);
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    try {
      if (key.startsWith('[placeholder]')) {
        const placeholderKey = key.replace('[placeholder]', '');
        element.placeholder = i18next.t(placeholderKey) || element.placeholder;
      } else {
        element.textContent = i18next.t(key) || element.textContent;
      }
    } catch (err) {
      console.error('Error updating element:', key, err);
    }
  });
}

// تغيير اللغة
function changeLanguage(lng) {
  console.log('Changing language to:', lng);
  i18next.changeLanguage(lng, function(err) {
    if (err) {
      console.error('Error changing language:', err);
    } else {
      updateContent();
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
      console.log('Language changed to:', lng);
    }
  });
}

// تسجيل الدخول
document.getElementById('login-form') && document.getElementById('login-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  const emailOrPhone = document.getElementById('email-or-phone').value;
  const password = document.getElementById('password').value;
  const errorEl = document.getElementById('error');

  console.log('Attempting login with:', emailOrPhone);

  try {
    // محاولة تسجيل الدخول باستخدام البريد أو الهاتف
    const { data, error } = await supabase.auth.signInWithPassword({
      email: emailOrPhone.includes('@') ? emailOrPhone : undefined,
      phone: emailOrPhone.includes('@') ? undefined : emailOrPhone,
      password
    });
    if (error) {
      console.error('Supabase auth error:', error.message);
      throw new Error(error.message);
    }

    console.log('User authenticated:', data.user.id);

    // جلب بيانات المستخدم لتحديد الدور
    const { data: userData, error: userError } = await supabase.from('users').select('role').eq('id', data.user.id).single();
    if (userError) {
      console.error('Error fetching user role:', userError.message);
      throw new Error(userError.message);
    }

    console.log('User role:', userData.role);

    // التوجيه بناءً على الدور
    if (userData.role === 'delegate') {
      window.location.href = 'delegate.html';
    } else if (userData.role === 'supervisor') {
      window.location.href = 'supervisor.html';
    } else if (userData.role === 'manager') {
      window.location.href = 'manager.html';
    } else {
      throw new Error('Invalid user role');
    }
  } catch (err) {
    console.error('Login error:', err.message);
    errorEl.textContent = i18next.t('invalid_credentials') || 'بيانات تسجيل الدخول غير صحيحة';
  }
});

// نسيت كلمة المرور
async function forgotPassword() {
  const emailOrPhone = document.getElementById('email-or-phone').value;
  const errorEl = document.getElementById('error');
  if (!emailOrPhone) {
    errorEl.textContent = i18next.t('enter_email_or_phone') || 'أدخل البريد الإلكتروني أو الهاتف';
    return;
  }
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(emailOrPhone);
    if (error) throw new Error(error.message);
    alert(i18next.t('password_reset_email_sent') || 'تم إرسال بريد إعادة تعيين كلمة المرور');
  } catch (err) {
    console.error('Password reset error:', err.message);
    errorEl.textContent = i18next.t('error_resetting_password') || 'خطأ في إعادة تعيين كلمة المرور';
  }
}

// تسجيل الخروج
async function logout() {
  try {
    await supabase.auth.signOut();
    console.log('User logged out');
    window.location.href = 'index.html';
  } catch (err) {
    console.error('Logout error:', err.message);
  }
}
