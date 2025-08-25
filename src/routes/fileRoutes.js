const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { listFiles, downloadFile, deleteFile, createFileDoc } = require('../controllers/fileController');

const router = express.Router();

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_FILE_MB = parseInt(process.env.MAX_FILE_MB || '20', 10);
const ALLOWED_TYPES = (process.env.ALLOWED_TYPES || '.pdf,.doc,.docx,.png,.jpg,.jpeg,.ppt,.pptx')
  .split(',')
  .map(s => s.trim().toLowerCase());

// Storage strategy
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Prevent collisions by prefixing a unique id
    cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

// File filter (security)
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_TYPES.includes(ext)) {
    return cb(new Error('File type not allowed. Allowed: ' + ALLOWED_TYPES.join(', ')));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_MB * 1024 * 1024 }
});

// Routes
router.get('/', listFiles);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);
router.post('/upload', upload.single('file'), createFileDoc);

module.exports = router;
