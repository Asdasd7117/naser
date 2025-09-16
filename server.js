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

const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(uploadsDir));

app.use(cors({
    origin: "https://naser700.onrender.com"
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
// APIs المهام
// =========================
app.post("/tasks", async (req, res) => {
    try {
        const { employee_id, ...rest } = req.body;
        if (!employee_id) throw new Error("employee_id is required");
        const { data, error } = await supabase
            .from("tasks")
            .insert([{ employee_id, ...rest }])
            .select()
            .single();
        if (error) throw error;
        console.log("Task inserted:", data); // تسجيل البيانات المُدرجة
        res.json(data);
    } catch (err) {
        console.error("Error inserting task:", err);
        res.status(500).json({ error: "حدث خطأ عند إضافة المهمة" });
    }
});

app.get("/tasks", async (req, res) => {
    try {
        const { employee_id } = req.query;
        console.log("Fetching tasks for employee_id:", employee_id); // تسجيل الطلب
        let query = supabase.from("tasks").select("*").order("visit_time", { ascending: true });
        if (employee_id) query = query.eq("employee_id", employee_id);
        const { data, error } = await query;
        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        console.log("Tasks fetched:", data); // تسجيل البيانات المستلمة
        res.json(data);
    } catch (err) {
        console.error("Error in /tasks endpoint:", err);
        res.status(500).json({ error: "حدث خطأ عند جلب المهام" });
    }
});

app.post("/tasks/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status, ...rest } = req.body;
        if (!status) throw new Error("status is required");
        const { data, error } = await supabase.from("tasks").update({ status, ...rest }).eq("id", id).select().single();
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
        const { task_id, user_id, ...rest } = req.body;
        const images = req.files && req.files["images"]
            ? req.files["images"].map(f => `/uploads/${f.filename}`).join(",")
            : "";
        const signature = req.files && req.files["signature"]
            ? `/uploads/${req.files["signature"][0].filename}`
            : null;

        const reportData = { task_id: task_id || null, user_id: user_id || null, images, signature, ...rest };
        if (images) reportData.images = images;
        if (signature) reportData.signature = signature;

        const { data: report, error: reportErr } = await supabase
            .from("reports")
            .insert([reportData])
            .select()
            .single();

        if (reportErr) throw reportErr;
        console.log("Report inserted:", report); // تسجيل البيانات المُدرجة

        // إنشاء إشعارات للمشرفين والمديرين
        const { data: managers, error: mgrErr } = await supabase
            .from("users")
            .select("id, role")
            .in("role", ["manager", "supervisor"]);

        if (mgrErr) console.warn("Error fetching managers:", mgrErr);

        if (managers && managers.length > 0) {
            const notifications = managers.map(m => ({
                user_id: m.id,
                ...rest,
                title_ar: "📑 تقرير جديد",
                title_en: "New Report",
                message_ar: `تم رفع تقرير للمهمة #${task_id || "غير محدد"}`,
                message_en: `A report was submitted for task #${task_id || "undefined"}`,
                type: "report"
            }));
            const { error: notifErr } = await supabase.from("notifications").insert(notifications);
            if (notifErr) console.warn("Error inserting notifications:", notifErr);
        }

        res.json(report);
    } catch (err) {
        console.error("POST /reports error:", err);
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

app.post("/reports/:id/note", async (req, res) => {
    try {
        const { id } = req.params;
        const { note, ...rest } = req.body;
        if (!note) throw new Error("note is required");

        const tryComment = await supabase.from("report_comments").insert([{ report_id: id, note, ...rest }]).select().maybeSingle();
        if (!tryComment.error) {
            return res.json({ message: "تم إضافة ملاحظة (comment table)" });
        }

        const { data, error } = await supabase
            .from("reports")
            .update({ supervisor_notes: note, ...rest })
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
        const { user_id, ...rest } = req.body;
        if (!user_id) throw new Error("user_id is required");
        const { data, error } = await supabase
            .from("notifications")
            .insert([{ user_id, ...rest }])
            .select()
            .single();
        if (error) throw error;
        console.log("Notification inserted:", data); // تسجيل البيانات المُدرجة
        res.json(data);
    } catch (err) {
        console.error("Error inserting notification:", err);
        res.status(500).json({ error: "حدث خطأ عند إرسال الإشعار" });
    }
});

app.get("/notifications/:user_id", async (req, res) => {
    try {
        const { user_id } = req.params;
        console.log("Fetching notifications for user_id:", user_id); // تسجيل الطلب
        const { data, error } = await supabase
            .from("notifications")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", { ascending: false });
        if (error) {
            console.error("Supabase error:", error);
            throw error;
        }
        console.log("Notifications fetched:", data); // تسجيل البيانات المستلمة
        res.json(data);
    } catch (err) {
        console.error("Error in /notifications endpoint:", err);
        res.status(500).json({ error: "حدث خطأ عند جلب الإشعارات" });
    }
});

app.get("/notifications", async (req, res) => {
    try {
        const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ عند جلب الإشعارات" });
    }
});

// =========================
// APIs الحضور و المواقع (بقي كما هو)
// =========================
// [اترك الكود كما هو]

// =========================
// تشغيل السيرفر
// =========================
const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

process.on("SIGTERM", () => {
    server.close(() => {
        console.log("Server terminated");
    });
});
