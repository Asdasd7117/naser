<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>لوحة المشرف</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/lang.js" defer></script>
  <script src="js/app.js" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body onload="showSection('delegates'); loadDelegates(); loadReports(); loadNotifications();">

  <header>
    <h1 data-translate="supervisor_title">📊 لوحة المشرف / مدير المبيعات</h1>
    <nav class="bottom-nav">
      <button id="btn-delegates" onclick="showSection('delegates')" data-translate="delegates_tab">المندوبين</button>
      <button id="btn-map" onclick="showSection('map')" data-translate="map_tab">الخريطة</button>
      <button id="btn-reports" onclick="showSection('reports')" data-translate="reports_tab">التقارير</button>
      <button id="btn-notifications" onclick="showSection('notifications')" data-translate="notifications_tab">الإشعارات</button>
    </nav>
  </header>

  <!-- قسم المندوبين -->
  <section id="delegates" class="screen">
    <h2 data-translate="delegates_title">متابعة المندوبين</h2>
    <div id="delegateList" class="card-container"></div>
  </section>

  <!-- قسم الخريطة -->
  <section id="map" class="screen">
    <h2 data-translate="map_title">الخريطة</h2>
    <select id="delegateSelect" onchange="filterMap()">
      <option value="all" data-translate="all_delegates">عرض الجميع</option>
    </select>
    <div id="mapView" style="width:100%;height:400px;background:#eee;text-align:center;line-height:400px;">
      🗺️ خريطة المندوبين
    </div>
  </section>

  <!-- قسم التقارير -->
  <section id="reports" class="screen">
    <h2 data-translate="reports_title">التقارير</h2>
    <div id="reportList" class="card-container"></div>
  </section>

  <!-- قسم الإشعارات -->
  <section id="notifications" class="screen">
    <h2 data-translate="notifications_title">الإشعارات</h2>
    <ul id="notificationsList"></ul>
  </section>

  <!-- زر اللغة -->
  <button class="lang-btn" onclick="toggleLanguage()" data-translate="toggle_lang">عربي/English</button>

  <script>
    function showSection(id) {
      document.querySelectorAll('.screen').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      document.getElementById('btn-' + id).classList.add('active');
    }

    async function loadDelegates() {
      try {
        const res = await axios.get('/api/users');
        const delegates = res.data.filter(u => u.role === 'delegate');
        const container = document.getElementById('delegateList');
        const select = document.getElementById('delegateSelect');
        container.innerHTML = '';
        select.innerHTML = '<option value="all" data-translate="all_delegates">عرض الجميع</option>';

        delegates.forEach(d => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <h3>${d.user}</h3>
            <p>📱 ${d.phone}</p>
            <p>الحالة: <span class="status active">نشط</span></p>
            <button onclick="showOnMap('${d.user}')">📍 عرض الموقع</button>
          `;
          container.appendChild(card);

          const opt = document.createElement('option');
          opt.value = d.user;
          opt.textContent = d.user;
          select.appendChild(opt);
        });

        applyTranslations();
      } catch (err) {
        console.error(err);
      }
    }

    async function loadReports() {
      try {
        const res = await axios.get('/api/reports');
        const reports = res.data;
        const container = document.getElementById('reportList');
        container.innerHTML = '';
        reports.forEach(r => {
          const card = document.createElement('div');
          card.className = 'card';
          card.innerHTML = `
            <h3>📝 تقرير ${r.delegate}</h3>
            <p><b>ملاحظات:</b> ${r.notes}</p>
            ${r.images.map(img => `<img src="${img}" style="max-width:100px;">`).join('')}
            ${r.signature ? `<p><b>توقيع:</b><img src="${r.signature}" style="max-width:100px;"></p>` : ''}
            <textarea placeholder="أضف ملاحظات المشرف"></textarea>
            <button>💾 حفظ</button>
          `;
          container.appendChild(card);
        });
      } catch (err) {
        console.error(err);
      }
    }

    function loadNotifications() {
      const notifs = [
        "🚨 المندوب أحمد تأخر عن المهمة 20 دقيقة",
        "✅ المندوب سامي أكمل مهمة العميل X"
      ];
      const list = document.getElementById('notificationsList');
      list.innerHTML = '';
      notifs.forEach(n => {
        const li = document.createElement('li');
        li.textContent = n;
        list.appendChild(li);
      });
    }

    function showOnMap(user) {
      document.getElementById('mapView').innerHTML = `📍 موقع ${user}`;
      showSection('map');
    }

    function filterMap() {
      const sel = document.getElementById('delegateSelect').value;
      document.getElementById('mapView').innerHTML =
        sel === 'all' ? "🗺️ عرض كل المندوبين" : `📍 عرض ${sel}`;
    }
  </script>
</body>
</html>
