const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// مجلدات البيانات والرفع
const DATA_DIR = path.join(__dirname,'data');
const UPLOADS_DIR = path.join(__dirname,'uploads');
if(!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if(!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

// Multer للملفات
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null, UPLOADS_DIR),
  filename: (req,file,cb)=>cb(null, Date.now()+'-'+file.originalname)
});
const upload = multer({ storage });

// ملفات البيانات
const USERS_FILE = path.join(DATA_DIR,'users.json');
const TASKS_FILE = path.join(DATA_DIR,'tasks.json');
const REPORTS_FILE = path.join(DATA_DIR,'reports.json');

function readJSON(file){ 
  if(!fs.existsSync(file)) fs.writeFileSync(file,JSON.stringify([])); 
  return JSON.parse(fs.readFileSync(file)); 
}
function writeJSON(file,data){ 
  fs.writeFileSync(file,JSON.stringify(data,null,2)); 
}

// تسجيل الدخول المرن (اسم مستخدم أو بريد أو هاتف)
app.post('/api/login',(req,res)=>{
  const { user, password, role } = req.body;
  const users = readJSON(USERS_FILE);

  const found = users.find(u =>
    (u.user === user || u.email === user || u.phone === user) &&
    u.password === password &&
    u.role === role
  );

  if(found) res.json({ success: true, role, user: found.user });
  else res.json({ success: false, message: "بيانات الدخول خاطئة" });
});

// المهام
app.get('/api/tasks',(req,res)=>res.json(readJSON(TASKS_FILE)));
app.post('/api/tasks',(req,res)=>{
  let tasks = readJSON(TASKS_FILE);
  const task = req.body;
  if(!task.id) task.id=uuidv4();
  const idx = tasks.findIndex(t=>t.id===task.id);
  if(idx!==-1) tasks[idx]=task; else tasks.push(task);
  writeJSON(TASKS_FILE,tasks);
  res.json({success:true});
});

// التقارير
app.get('/api/reports',(req,res)=>res.json(readJSON(REPORTS_FILE)));
app.post('/api/reports',upload.fields([{name:'images'},{name:'signature'}]),(req,res)=>{
  const {notes,delegate}=req.body;
  const images=req.files['images']?req.files['images'].map(f=>'/uploads/'+f.filename):[];
  const signature=req.files['signature']?'/uploads/'+req.files['signature'][0].filename:'';
  const reports=readJSON(REPORTS_FILE);
  const report={id:uuidv4(),notes,delegate,images,signature,createdAt:new Date().toISOString()};
  reports.push(report);
  writeJSON(REPORTS_FILE,reports);
  res.json({success:true,report});
});

// المستخدمين
app.get('/api/users',(req,res)=>res.json(readJSON(USERS_FILE)));

// تشغيل السيرفر
app.listen(PORT,()=>console.log(`Server running on port ${PORT}`));
