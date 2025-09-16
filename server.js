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
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janhxZnF3c3d3aWtlZGFmZmlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg0MTA3NCwiZXhwIjoyMDczNDE3MDc0fQ.ZX7giBBgWRScW6usplziAWjNYnYcVeLVAQz7YUBjvA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== Multer =====
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage });

// ===== APIs =====

// تسجيل دخول
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

    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ في تسجيل الدخول" });
  }
});

// رفع تقرير
app.post("/reports", upload.fields([{ name: "images", maxCount: 5 }, { name: "signature", maxCount: 1 }]), async (req, res) => {
  try {
    const { task_id, user_id, notes } = req.body;

    const images = req.files && req.files["images"]
      ? req.files["images"].map(f => `/uploads/${f.filename}`).join(",")
      : "";

    const signature = req.files && req.files["signature"]
      ? `/uploads/${req.files["signature"][0].filename}`
      : null;

    const { data: report, error: reportErr } = await supabase
      .from("reports")
      .insert([{ task_id: task_id || null, user_id: user_id || null, notes: notes || "", images, signature }])
      .select()
      .single();

    if (reportErr) throw reportErr;

    // إشعارات للمدير/المشرف
    const { data: managers, error: mgrErr } = await supabase
      .from("users")
      .select("id, role")
      .in("role", ["manager", "supervisor"]);

    if (mgrErr) console.warn("خطأ عند جلب المشرفين/المدراء:", mgrErr);

    if (managers && managers.length) {
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
    res.status(500).json({ error: "حدث خطأ عند رفع التقرير" });
  }
});

// جلب المهام
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

// جلب الإشعارات
app.get("/notifications/:user_id", async (req, res) => {
  try {
    const { user_id } = req.params;
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ عند جلب الإشعارات" });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
