const path = require('path');
const fs = require('fs');
const File = require('../models/File');

// List files (with optional filters)
exports.listFiles = async (req, res, next) => {
  try {
    const { subject, year, q } = req.query;
    const filter = {};
    if (subject) filter.subject = subject;
    if (year) filter.year = year;
    if (q) {
      filter.$or = [
        { originalName: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { year: { $regex: q, $options: 'i' } },
      ];
    }
    const files = await File.find(filter).sort({ createdAt: -1 }).lean();
    res.json(files);
  } catch (err) { next(err); }
};

// Download by ID
exports.downloadFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ error: 'File not found' });
    return res.download(path.resolve(file.path), file.originalName);
  } catch (err) { next(err); }
};

// Delete by ID
exports.deleteFile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);
    if (!file) return res.status(404).json({ error: 'File not found' });

    // Remove file from disk
    fs.unlink(file.path, (e) => {
      if (e && e.code !== 'ENOENT') console.warn('Disk unlink warning:', e.message);
    });
    await file.deleteOne();
    res.json({ ok: true });
  } catch (err) { next(err); }
};

// Upload handler (multer already saved file on disk)
exports.createFileDoc = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { subject, year, uploaderName } = req.body;

    if (!subject || !year) {
      return res.status(400).json({ error: 'subject and year are required' });
    }

    const doc = await File.create({
      originalName: req.file.originalname,
      storedName: req.file.filename,
      subject,
      year,
      fileType: path.extname(req.file.originalname).toLowerCase(),
      sizeBytes: req.file.size,
      uploaderName: uploaderName || 'Anonymous',
      path: req.file.path
    });

    res.status(201).json(doc);
  } catch (err) { next(err); }
};
