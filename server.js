// =========================
// server.js
// =========================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// ===== إعداد Express =====
const app = express();
const PORT = process.env.PORT || 3000;

// ملفات ثابتة من مجلد public
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(cors());
app.use(bodyParser.json());

// ===== Supabase Client =====
const SUPABASE_URL = "https://ncjxqfqwswwikedaffif.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janhxZnF3c3d3aWtlZGFmZmlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg0MTA3NCwiZXhwIjoyMDczNDE3MDc0fQ.ZX7giBBgWRScW6usplziAWjNYn9yCVeLVAQz7YUBjvA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== إعداد Multer للرفع =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// =========================
// APIs المستخدمين
// =========================

// تسجيل الدخول
app.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    let { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", emailOrPhone)
      .eq("password", password)
      .maybeSingle();

    if (!user) {
      ({ data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", emailOrPhone)
        .eq("password", password)
        .maybeSingle());
    }

    if (error) throw error;
    if (!user) return res.status(401).json({ error: "بيانات غير صحيحة" });

    res.json(user); // ترجع مباشرة بيانات المستخدم بدون تغليف
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ في تسجيل الدخول" });
  }
});

// إضافة مستخدم جديد
app.post("/add-user", async (req, res) => {
  try {
    const { name_ar, name_en, email, phone, password, role } = req.body;
    const { data, error } = await supabase
      .from("users")
      .insert([{ name_ar, name_en, email, phone, password, role }])
      .select()
      .single(); // ترجع مباشرة المستخدم الجديد

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند إضافة المستخدم" });
  }
});

// جلب كل المستخدمين
app.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند جلب المستخدمين" });
  }
});

// حذف مستخدم
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "تم حذف المستخدم" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند حذف المستخدم" });
  }
});

// =========================
// APIs المهام
// =========================

// إضافة مهمة
app.post("/tasks", async (req, res) => {
  try {
    const { employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time } = req.body;
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time }])
      .select()
      .single(); // ترجع المهمة الجديدة مباشرة

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند إضافة المهمة" });
  }
});

// جلب كل المهام
app.get("/tasks", async (req, res) => {
  try {
    const { data, error } = await supabase.from("tasks").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند جلب المهام" });
  }
});

// تحديث حالة المهمة
app.post("/tasks/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from("tasks")
      .update({ status })
      .eq("id", id)
      .select()
      .single(); // ترجع المهمة مباشرة بعد التحديث

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند تحديث حالة المهمة" });
  }
});

// حذف مهمة
app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "تم حذف المهمة" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند حذف المهمة" });
  }
});

// =========================
// APIs التقارير
// =========================

// رفع تقرير
app.post("/reports", upload.array("images", 5), async (req, res) => {
  try {
    const { task_id, user_id, notes } = req.body;
    const images = req.files.map(f => `/uploads/${f.filename}`);
    const { data, error } = await supabase
      .from("reports")
      .insert([{ task_id, user_id, notes, images }])
      .select()
      .single(); // ترجع التقرير مباشرة

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند رفع التقرير" });
  }
});

// جلب كل التقارير
app.get("/reports", async (req, res) => {
  try {
    const { data, error } = await supabase.from("reports").select("*, users(*), tasks(*)");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند جلب التقارير" });
  }
});

// =========================
// APIs الإشعارات
// =========================

// إرسال إشعار
app.post("/notifications", async (req, res) => {
  try {
    const { user_id, title_ar, title_en, message_ar, message_en, type } = req.body;
    const { data, error } = await supabase
      .from("notifications")
      .insert([{ user_id, title_ar, title_en, message_ar, message_en, type }])
      .select()
      .single(); // ترجع الإشعار مباشرة

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند إرسال الإشعار" });
  }
});

// جلب إشعارات مستخدم معين
app.get("/notifications/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user_id);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند جلب الإشعارات" });
  }
});

// =========================
// APIs المواقع
// =========================

// تحديث موقع المندوب
app.post("/locations", async (req, res) => {
  try {
    const { employee_id, latitude, longitude } = req.body;
    const { data, error } = await supabase
      .from("employee_locations")
      .insert([{ employee_id, latitude, longitude }])
      .select()
      .single();

    if (error) throw error;
    await supabase.from("users").update({ latitude, longitude }).eq("id", employee_id);
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند تحديث الموقع" });
  }
});

// جلب آخر موقع لكل مندوب
app.get("/locations", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("employee_locations")
      .select("*")
      .order("recorded_at", { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "حدث خطأ عند جلب المواقع" });
  }
});

// =========================
// تشغيل السيرفر
// =========================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
