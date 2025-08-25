const cards = document.getElementById('cards');
const filterSubject = document.getElementById('filterSubject');
const filterYear = document.getElementById('filterYear');
const filterBtn = document.getElementById('filterBtn');
const qInput = document.getElementById('q');
const searchBtn = document.getElementById('searchBtn');

async function fetchFiles(params = {}) {
  const url = new URL('/api/files', window.location.origin);
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v);
  });
  const res = await fetch(url);
  return res.json();
}

function fileSize(bytes) {
  const sizes = ['B','KB','MB','GB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

function render(files) {
  cards.innerHTML = '';
  if (!files.length) {
    cards.innerHTML = '<p>No files found. Try uploading or changing filters.</p>';
    return;
  }
  files.forEach(f => {
    const el = document.createElement('div');
    el.className = 'card';
    el.innerHTML = `
      <span class="tag">${f.subject} • ${f.year}</span>
      <h3 title="${f.originalName}">${f.originalName}</h3>
      <div class="meta">Type: ${f.fileType} • Size: ${fileSize(f.sizeBytes)}</div>
      <div class="meta">Uploaded by ${f.uploaderName || 'Anonymous'} on ${new Date(f.uploadDate).toLocaleDateString()}</div>
      <div class="actions">
        <a class="btn" href="/api/files/${f._id}/download"><button>Download</button></a>
        <a class="btn" href="/uploads/${encodeURIComponent(f.storedName)}" target="_blank"><button>View</button></a>
      </div>
    `;
    cards.appendChild(el);
  });
}

async function refresh() {
  const subject = filterSubject.value;
  const year = filterYear.value;
  const q = qInput.value.trim();
  const files = await fetchFiles({ subject, year, q });
  render(files);
}

// Upload
const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(uploadForm);
  const res = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    alert('Upload failed: ' + (err.error || res.statusText));
  } else {
    uploadForm.reset();
    refresh();
  }
});

filterBtn.addEventListener('click', refresh);
searchBtn.addEventListener('click', refresh);
window.addEventListener('DOMContentLoaded', refresh);
