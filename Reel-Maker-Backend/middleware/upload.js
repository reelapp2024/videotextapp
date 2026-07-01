const path = require('path');
const fs = require('fs');
const multer = require('multer');

const isVercel = !!process.env.VERCEL;
const uploadDir = isVercel ? '/tmp/uploads' : path.join(__dirname, '../uploads');
try { if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true }); } catch (_) {}

const generalStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`),
});

const generalUpload = multer({
  storage: generalStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /\.(mp4|webm|mp3|wav|ogg|m4a|xlsx|xls)$/i;
    if (allowed.test(file.originalname)) cb(null, true);
    else cb(new Error('Invalid file type'));
  },
});

const excelUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/\.(xlsx|xls|csv)$/i.test(file.originalname)) cb(null, true);
    else cb(new Error('Only xlsx, xls, csv allowed'));
  },
});

const jobsDir = path.join(__dirname, '../uploads/jobs');
fs.mkdirSync(jobsDir, { recursive: true });

function createJobUpload(prefix = 'f') {
  const storage = multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = path.join(jobsDir, req.jobId || 'temp');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const p = req.filePrefix || prefix;
      const name = `${p}_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      cb(null, name);
    },
  });
  return multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });
}

const captionJobsDir = path.join(__dirname, '../uploads/caption-jobs');
fs.mkdirSync(captionJobsDir, { recursive: true });

const captionUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = path.join(captionJobsDir, req.captionJobId || 'temp');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, /\.(mp3|wav|m4a|ogg|mp4|webm|mkv)$/i.test(file.originalname));
  },
});

const imageJobUpload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
      const dir = path.join(jobsDir, req.jobId || 'temp');
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (_req, file, cb) => cb(null, `img_${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`),
  }),
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = {
  generalUpload,
  excelUpload,
  createJobUpload,
  captionUpload,
  imageJobUpload,
  jobsDir,
  captionJobsDir,
  uploadDir,
};
