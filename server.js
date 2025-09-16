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
app.use("/uploads", express.static("uploads"));

app.use(cors());
app.use(bodyParser.json());

// ===== Supabase Client =====
const SUPABASE_URL = "https://ncjxqfqwswwikedaffif.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janhxZnF3c3d3aWtlZGFmZmlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg0MTA3NCwiZXhwIjoyMDczNDE3MDc0fQ.ZX7giBBgWRScW6usplziAWjNYn9yCVeLVAQz7YUBjvA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== إعداد Multer للرفع =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// =========================
// APIs المستخدمين
// =========================

// تسجيل الدخول
app.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .or(`email.eq.${emailOrPhone},phone.eq.${emailOrPhone}`)
    .eq("password", password)
    .single();
  if (error || !data) return res.status(401).json({ error: "بيانات غير صحيحة" });
  res.json({ user: data });
});

// إضافة مستخدم جديد
app.post("/add-user", async (req, res) => {
  const { name_ar, name_en, email, phone, password, role } = req.body;
  const { data, error } = await supabase
    .from("users")
    .insert([{ name_ar, name_en, email, phone, password, role }]);
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

// جلب كل المستخدمين
app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json(error);
  res.json(data);
});

// حذف مستخدم
app.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) return res.status(500).json(error);
  res.json({ message: "تم حذف المستخدم" });
});

// =========================
// APIs المهام
// =========================

// إضافة مهمة
app.post("/tasks", async (req, res) => {
  const { employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time } = req.body;
  const { data, error } = await supabase
    .from("tasks")
    .insert([{ employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time }]);
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

// جلب كل المهام
app.get("/tasks", async (req, res) => {
  const { data, error } = await supabase.from("tasks").select("*");
  if (error) return res.status(500).json(error);
  res.json(data);
});

// تحديث حالة المهمة
app.post("/tasks/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const { data, error } = await supabase.from("tasks").update({ status }).eq("id", id);
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

// حذف مهمة
app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return res.status(500).json(error);
  res.json({ message: "تم حذف المهمة" });
});

// =========================
// APIs التقارير
// =========================

// رفع تقرير
app.post("/reports", upload.array("images", 5), async (req, res) => {
  const { task_id, user_id, notes } = req.body;
  const images = req.files.map(f => `/uploads/${f.filename}`).join(",");
  const { data, error } = await supabase
    .from("reports")
    .insert([{ task_id, user_id, notes, images }]);
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

// جلب كل التقارير
app.get("/reports", async (req, res) => {
  const { data, error } = await supabase.from("reports").select("*, users(*), tasks(*)");
  if (error) return res.status(500).json(error);
  res.json(data);
});

// =========================
// APIs الإشعارات
// =========================

// إرسال إشعار
app.post("/notifications", async (req, res) => {
  const { user_id, title_ar, title_en, message_ar, message_en, type } = req.body;
  const { data, error } = await supabase
    .from("notifications")
    .insert([{ user_id, title_ar, title_en, message_ar, message_en, type }]);
  if (error) return res.status(500).json(error);
  res.json(data[0]);
});

// جلب إشعارات مستخدم معين
app.get("/notifications/:user_id", async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user_id);
  if (error) return res.status(500).json(error);
  res.json(data);
});

// =========================
// APIs المواقع
// =========================

// تحديث موقع المندوب
app.post("/locations", async (req, res) => {
  const { employee_id, latitude, longitude } = req.body;
  const { data, error } = await supabase
    .from("employee_locations")
    .insert([{ employee_id, latitude, longitude }]);
  if (error) return res.status(500).json(error);
  await supabase.from("users").update({ latitude, longitude }).eq("id", employee_id);
  res.json(data[0]);
});

// جلب آخر موقع لكل مندوب
app.get("/locations", async (req, res) => {
  const { data, error } = await supabase
    .from("employee_locations")
    .select("*")
    .order("recorded_at", { ascending: false });
  if (error) return res.status(500).json(error);
  res.json(data);
});

// =========================
// تشغيل السيرفر
// =========================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
