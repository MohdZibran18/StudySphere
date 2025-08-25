const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  originalName: { type: String, required: true },
  storedName:   { type: String, required: true, unique: true },
  subject:      { type: String, required: true, index: true },
  year:         { type: String, required: true, index: true },
  fileType:     { type: String, required: true },
  sizeBytes:    { type: Number, required: true },
  uploaderName: { type: String, default: 'Anonymous' },
  uploadDate:   { type: Date, default: Date.now },
  path:         { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('File', fileSchema);
