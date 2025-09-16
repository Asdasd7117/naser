// =========================
// server.js
// =========================
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { createClient } = require("@supabase/supabase-js");

// ===== إعداد Express =====
const app = express();
const PORT = process.env.PORT || 3000;

// تأكد من وجود مجلد uploads
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ملفات ثابتة
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

app.use(cors());
app.use(bodyParser.json());

// ===== Supabase Client =====
const SUPABASE_URL = "https://ncjxqfqwswwikedaffif.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janhxZnF3c3d3aWtlZGFmZmlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg0MTA3NCwiZXhwIjoyMDczNDE3MDc0fQ.ZX7giBBgWRScW6usplziAWjNYn9yCVeLVAQz7YUBjvA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== Multer =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// =========================
// APIs المستخدمين
// =========================
app.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;

    let { data: user, error } = await supabase
      .from("users")
      .select("*")
      .or(`email.eq.${emailOrPhone},phone.eq.${emailOrPhone}`)
      .eq("password", password)
      .maybeSingle();

    if (error) throw error;
    if (!user) return res.status(401).json({ error: "بيانات غير صحيحة" });

    res.json({ user });
  } catch (err) {
    console.error("POST /login error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.post("/add-user", async (req, res) => {
  try {
    const { name_ar, name_en, email, phone, password, role } = req.body;
    const { data, error } = await supabase
      .from("users")
      .insert([{ name_ar, name_en, email, phone, password, role }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("POST /add-user error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("id", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("GET /users error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// =========================
// APIs المهام
// =========================
app.post("/tasks", async (req, res) => {
  try {
    const { employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time } = req.body;
    const { data, error } = await supabase
      .from("tasks")
      .insert([{ employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("POST /tasks error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.get("/tasks", async (req, res) => {
  try {
    const { employee_id } = req.query;
    let query = supabase.from("tasks").select("*").order("visit_time", { ascending: true });
    if (employee_id) query = query.eq("employee_id", employee_id);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("GET /tasks error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.post("/tasks/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase.from("tasks").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error("POST /tasks/:id/status error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// =========================
// APIs التقارير + إشعارات
// =========================
app.post("/reports", upload.fields([{ name: "images", maxCount: 5 }, { name: "signature", maxCount: 1 }]), async (req, res) => {
  try {
    const { task_id, user_id, notes } = req.body;

    const images = req.files?.images ? req.files.images.map(f => `/uploads/${f.filename}`).join(",") : "";
    const signature = req.files?.signature ? `/uploads/${req.files.signature[0].filename}` : null;

    const { data: report, error: reportErr } = await supabase
      .from("reports")
      .insert([{ task_id: task_id || null, user_id: user_id || null, notes: notes || "", images, signature }])
      .select()
      .single();
    if (reportErr) throw reportErr;

    // إشعارات للمدراء والمشرفين
    const { data: managers, error: mgrErr } = await supabase
      .from("users")
      .select("id, role")
      .in("role", ["manager", "supervisor"]);
    if (mgrErr) console.warn("خطأ عند جلب المشرفين/المدراء:", mgrErr);

    if (managers?.length) {
      const notifications = managers.map(m => ({
        user_id: m.id,
        title_ar: "📑 تقرير جديد",
        title_en: "New Report",
        message_ar: `تم رفع تقرير للمهمة #${task_id}`,
        message_en: `A report was submitted for task #${task_id}`,
        type: "report"
      }));
      const { error: notifErr } = await supabase.from("notifications").insert(notifications);
      if (notifErr) console.warn("خطأ عند إدخال الإشعارات:", notifErr);
    }

    res.json(report);
  } catch (err) {
    console.error("POST /reports error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// =========================
// إشعار جماعي من المدير
// =========================
app.post("/notifications/broadcast", async (req, res) => {
  try {
    const { title_ar, title_en, message_ar, message_en, type } = req.body;

    // جلب كل المندوبين
    const { data: employees, error: empErr } = await supabase
      .from("users")
      .select("id")
      .eq("role", "employee");
    if (empErr) throw empErr;

    const notifications = employees.map(e => ({
      user_id: e.id,
      title_ar,
      title_en,
      message_ar,
      message_en,
      type
    }));

    const { data, error } = await supabase.from("notifications").insert(notifications).select();
    if (error) throw error;

    res.json({ message: "تم إرسال الإشعار الجماعي بنجاح", data });
  } catch (err) {
    console.error("POST /notifications/broadcast error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// =========================
// APIs المواقع
// =========================
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
    console.error("POST /locations error:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// =========================
// تشغيل السيرفر
// =========================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
