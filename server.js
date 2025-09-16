// =========================
// server.js كامل
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

// ===== إنشاء مجلدات ثابتة =====
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ===== Middleware =====
app.use(cors({ origin: "*" })); // يمكن تغييره إلى موقعك
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ملفات ثابتة
app.use("/uploads", express.static(uploadsDir));
app.use(express.static(path.join(__dirname, "public")));

// ===== Supabase Client =====
const SUPABASE_URL = "https://ncjxqfqwswwikedaffif.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janhxZnF3c3d3aWtlZGFmZmlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg0MTA3NCwiZXhwIjoyMDczNDE3MDc0fQ.ZX7giBBgWRScW6usplziAWjNYn9yCVeLVAQz7YUBjvA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== Multer للرفع =====
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
    console.error(err);
    res.status(500).json({ error: "حدث خطأ في تسجيل الدخول" });
  }
});

app.get("/users", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select("*").order("id", { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند جلب المستخدمين" });
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
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند إضافة المستخدم" });
  }
});

app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("users").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "تم حذف المستخدم" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند حذف المستخدم" });
  }
});

// =========================
// APIs المهام
// =========================
app.post("/tasks", async (req, res) => {
  try {
    const { employee_id, ...rest } = req.body;
    if (!employee_id) throw new Error("employee_id is required");
    const { data, error } = await supabase.from("tasks").insert([{ employee_id, ...rest }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند إضافة المهمة" });
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
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند جلب المهام" });
  }
});

app.post("/tasks/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) throw new Error("status is required");
    const { data, error } = await supabase.from("tasks").update({ status }).eq("id", id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند تحديث حالة المهمة" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) throw error;
    res.json({ message: "تم حذف المهمة" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند حذف المهمة" });
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
    const reportData = { task_id, user_id, notes, images, signature };
    const { data: report, error } = await supabase.from("reports").insert([reportData]).select().single();
    if (error) throw error;

    const { data: managers } = await supabase.from("users").select("id").in("role", ["manager", "supervisor"]);
    if (managers?.length) {
      const notifications = managers.map(m => ({
        user_id: m.id,
        title_ar: "📑 تقرير جديد",
        title_en: "New Report",
        message_ar: `تم رفع تقرير للمهمة #${task_id}`,
        message_en: `A report was submitted for task #${task_id}`,
        type: "report"
      }));
      await supabase.from("notifications").insert(notifications);
    }

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند رفع التقرير" });
  }
});

app.get("/reports", async (req, res) => {
  try {
    const { data, error } = await supabase.from("reports").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند جلب التقارير" });
  }
});

// =========================
// APIs الإشعارات
// =========================
app.get("/notifications/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase.from("notifications").select("*").eq("user_id", user_id).order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند جلب الإشعارات" });
  }
});

// =========================
// APIs الحضور
// =========================
app.post("/attendance", async (req, res) => {
  try {
    const { user_id, check_in, check_out } = req.body;
    const { data, error } = await supabase.from("attendance").insert([{ user_id, check_in, check_out }]).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند تسجيل الحضور" });
  }
});

app.get("/attendance", async (req, res) => {
  try {
    const { data, error } = await supabase.from("attendance").select("*, users(id, name_ar, role)").order("id", { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data.map(a => ({
      id: a.id,
      user_id: a.user_id,
      user_name: a.users ? a.users.name_ar : null,
      role: a.users ? a.users.role : null,
      check_in: a.check_in,
      check_out: a.check_out
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند جلب الحضور" });
  }
});

// =========================
// APIs المواقع
// =========================
app.post("/locations", async (req, res) => {
  try {
    const { employee_id, latitude, longitude } = req.body;
    const { data, error } = await supabase.from("employee_locations").insert([{ employee_id, latitude, longitude }]).select().single();
    if (error) throw error;
    await supabase.from("users").update({ latitude, longitude }).eq("id", employee_id);
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند تحديث الموقع" });
  }
});

app.get("/locations", async (req, res) => {
  try {
    const { data, error } = await supabase.from("employee_locations").select("*, users(id, name_ar)").order("recorded_at", { ascending: false }).limit(100);
    if (error) throw error;
    res.json(data.map(r => ({
      id: r.id,
      employee_id: r.employee_id,
      latitude: r.latitude,
      longitude: r.longitude,
      recorded_at: r.recorded_at,
      name_ar: r.users ? r.users.name_ar : null
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند جلب المواقع" });
  }
});

// =========================
// تشغيل السيرفر
