<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title data-i18n="manager_title">لوحة تحكم المدير</title>
  <link rel="stylesheet" href="style.css">
  <!-- Supabase CDN -->
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>
  <script defer src="manager.js"></script>
</head>
<body>
  <header>
    <h1 data-i18n="manager_title">لوحة تحكم المدير</h1>
    <select id="languageSwitcher">
      <option value="ar" selected>العربية</option>
      <option value="en">English</option>
    </select>
    <button id="logout" data-i18n="logout">تسجيل الخروج</button>
  </header>

  <main>
    <form id="createUserForm">
      <h2 data-i18n="create_user">إنشاء مستخدم جديد</h2>
      <label data-i18n="role">الدور:</label>
      <select name="role" required>
        <option value="supervisor" data-i18n="supervisor">مشرف</option>
        <option value="delegate" data-i18n="delegate">مندوب</option>
      </select><br>

      <label data-i18n="name">الاسم:</label>
      <input type="text" name="name" required><br>

      <label data-i18n="email">البريد الإلكتروني:</label>
      <input type="email" name="email" required><br>

      <label data-i18n="phone">رقم الهاتف:</label>
      <input type="text" name="phone" required><br>

      <label data-i18n="password">كلمة المرور:</label>
      <input type="password" name="password" required><br>

      <button type="submit" data-i18n="create">إنشاء</button>
    </form>
  </main>
</body>
</html>
