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

// ملفات ثابتة من مجلد public + uploads
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

app.use(cors({
    origin: "http://localhost:3000" // غيّر إلى نطاق الصفحة الفعلي عند الاستضافة
}));
app.use(bodyParser.json());

// ===== Supabase Client =====
const SUPABASE_URL = "https://ncjxqfqwswwikedaffif.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5janhxZnF3c3d3aWtlZGFmZmlmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg0MTA3NCwiZXhwIjoyMDczNDE3MDc0fQ.ZX7giBBgWRScW6usplziAWjNYn9yCVeLVAQz7YUBjvA";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ===== إعداد Multer للرفع =====
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
        const { employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time } = req.body;
        const { data, error } = await supabase
            .from("tasks")
            .insert([{ employee_id, client_name_ar, client_name_en, address_ar, address_en, visit_time }])
            .select()
            .single();
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

        // إنشاء إشعارات للمشرفين والمديرين
        const { data: managers, error: mgrErr } = await supabase
            .from("users")
            .select("id, role")
            .in("role", ["manager", "supervisor"]);

        if (mgrErr) console.warn("خطأ عند جلب المشرفين/المدراء:", mgrErr);

        if (managers && managers.length > 0) {
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

app.get("/reports", async (req, res) => {
    try {
        const { data, error } = await supabase.from("reports").select("*, users(*), tasks(*)").order("created_at", { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ عند جلب التقارير" });
    }
});

app.post("/reports/:id/note", async (req, res) => {
    try {
        const { id } = req.params;
        const { note, author_id } = req.body;

        const tryComment = await supabase.from("report_comments").insert([{ report_id: id, author_id: author_id || null, note }]).select().maybeSingle();
        if (!tryComment.error) {
            return res.json({ message: "تم إضافة ملاحظة (comment table)" });
        }

        const { data, error } = await supabase
            .from("reports")
            .update({ supervisor_notes: note })
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: "تم إضافة الملاحظة (updated reports.supervisor_notes)", data });
    } catch (err) {
        console.error("POST /reports/:id/note error:", err);
        res.status(500).json({ error: "حدث خطأ عند إضافة ملاحظة للتقرير" });
    }
});

// =========================
// APIs الإشعارات
// =========================
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
        console.error(err);
        res.status(500).json({ error: "حدث خطأ عند إرسال الإشعار" });
    }
});

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

app.get("/notifications", async (req, res) => {
    try {
        const { data, error } = await supabase.from("notifications").select("*, users(*)").order("created_at", { ascending: false });
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
        const { data, error } = await supabase
            .from("attendance")
            .insert([{ user_id, check_in, check_out }])
            .select()
            .single();
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error("POST /attendance error:", err);
        res.status(500).json({ error: "حدث خطأ عند تسجيل الحضور" });
    }
});

app.get("/attendance", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("attendance")
            .select("*, users(id, name_ar, role)")
            .order("id", { ascending: false })
            .limit(100);
        if (error) throw error;
        const out = data.map(a => ({
            id: a.id,
            user_id: a.user_id,
            user_name: a.users ? a.users.name_ar : null,
            role: a.users ? a.users.role : null,
            check_in: a.check_in,
            check_out: a.check_out
        }));
        res.json(out);
    } catch (err) {
        console.error("GET /attendance error:", err);
        res.status(500).json({ error: "حدث خطأ عند جلب الحضور" });
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
        console.error(err);
        res.status(500).json({ error: "حدث خطأ عند تحديث الموقع" });
    }
});

app.get("/locations", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("employee_locations")
            .select("*, users(id, name_ar)")
            .order("recorded_at", { ascending: false })
            .limit(100);
        if (error) throw error;
        const out = data.map(r => ({
            id: r.id,
            employee_id: r.employee_id,
            latitude: r.latitude,
            longitude: r.longitude,
            recorded_at: r.recorded_at,
            name_ar: r.users ? r.users.name_ar : null
        }));
        res.json(out);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ عند جلب المواقع" });
    }
});

// =========================
// تشغيل السيرفر
// =========================
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
