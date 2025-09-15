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

// ملفات ثابتة
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static("uploads"));
app.use(cors());
app.use(bodyParser.json());

// ===== Supabase Client =====
const SUPABASE_URL = "https://ncjxqfqwswwikedaffif.supabase.co";
const SUPABASE_KEY = "YOUR_SUPABASE_KEY";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== Multer =====
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
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${emailOrPhone},phone.eq.${emailOrPhone}`)
      .eq("password", password)
      .single();
    if (error || !data) return res.status(401).json({ error: "بيانات غير صحيحة" });
    res.json({ user: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// إضافة مستخدم جديد
app.post("/add-user", async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const name_ar = name || "";
    const name_en = name || "";
    const { data, error } = await supabase
      .from("users")
      .insert([{ name_ar, name_en, email, phone, password, role }])
      .select()
      .single();
    if (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// =========================
// APIs المهام
// =========================

// إضافة مهمة
app.post("/tasks", async (req, res) => {
  try {
    const { employee_id, client_name, address, visit_time } = req.body;
    const client_name_ar = client_name || "";
    const client_name_en = client_name || "";
    const address_ar = address || "";
    const address_en = address || "";
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// تحديث حالة المهمة
app.post("/tasks/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase.from("tasks").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// =========================
// APIs التقارير
// =========================

// رفع تقرير
app.post("/reports", upload.array("images", 5), async (req, res) => {
  try {
    const { task_id, user_id, notes } = req.body;
    const images = req.files.map(f => `/uploads/${f.filename}`).join(",");
    const { data, error } = await supabase
      .from("reports")
      .insert([{ task_id, user_id, notes, images }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
});

// =========================
// تشغيل السيرفر
// =========================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
