// ===================== FILE HANDLING =====================

let currentModel = null;
let currentIssues = null;
let pendingFile = null;

function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  pendingFile = file;
  showFileReady(file);
}

function showFileReady(file) {
  document.getElementById('fileNameReady').textContent = file.name;
  document.getElementById('fileSizeReady').textContent = `${(file.size/1024).toFixed(1)} KB · XML`;
  document.getElementById('file-ready').style.display = '';
}

function clearFile() {
  pendingFile = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('file-ready').style.display = 'none';
}

function runAnalysis() {
  if (!pendingFile) return;
  processFile(pendingFile);
}

function processFile(file) {
  document.getElementById('upload-section').style.display = 'none';
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('loading-section').style.display = '';

  document.getElementById('fileName').textContent = file.name;
  document.getElementById('fileSize').textContent = `(${(file.size/1024).toFixed(1)} KB)`;

  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      updateLoading('Parsing XML structure…', 15);
      await sleep(200);
      const model = parseXML(e.target.result);
      updateLoading(`Found ${model.views.length} views, ${Object.keys(model.elements).length} elements…`, 35);
      await sleep(200);
      updateLoading('Running SebTreb style checks…', 55);
      await sleep(250);
      updateLoading('Checking ArchiMate 3.2 cross-layer rules…', 70);
      const issues = runAllChecks(model);
      await sleep(200);
      updateLoading('Calculating scores and RAG status…', 85);
      const score = calculateScore(issues, model.views);
      await sleep(200);
      updateLoading('Building dashboards…', 95);
      await sleep(100);

      currentModel = model;
      currentIssues = issues;

      // Render all tabs
      renderSummary(model, issues, score);          // KPI strip (Tab 1 header)
      renderOverviewSubTab(model, issues, score);   // Tab 1 > Overview
      renderByViewSubTab(model, issues);            // Tab 1 > By View Type
      renderByIssueSubTab(model, issues);           // Tab 1 > By Issue Type
      renderRulesTab(model, issues);                // Tab 1 > Rule Checklist
      renderManualTab(model, issues, score);        // Tab 2
      renderDetailedReport(model, issues, score);   // Tab 3
      renderViewAnalysis(model, issues);            // Tab 4

      document.getElementById('loading-section').style.display = 'none';
      document.getElementById('results-section').style.display = '';
    } catch(err) {
      document.getElementById('loading-section').style.display = 'none';
      document.getElementById('upload-section').style.display = '';
      alert('Error processing file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function updateLoading(msg, pct) {
  document.getElementById('loading-msg').textContent = msg;
  document.getElementById('progress-bar').style.width = pct + '%';
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function resetTool() {
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('upload-section').style.display = '';
  document.getElementById('file-ready').style.display = 'none';
  document.getElementById('fileInput').value = '';
  document.getElementById('summary-section').innerHTML = '';
  pendingFile = null;
  currentModel = null; currentIssues = null;
}

// Drag & drop
const dropzone = document.getElementById('dropzone');
dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('dragover'); });
dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragover'));
dropzone.addEventListener('drop', e => {
  e.preventDefault();
  dropzone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith('.xml')) { pendingFile = file; showFileReady(file); }
  else alert('Please drop an XML file.');
});

// ===================== TAB NAVIGATION =====================

function showMainTab(tabId, btn) {
  ['tab-automated','tab-manual','tab-detailed','tab-views'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? '' : 'none';
  });
  document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  // Update tab top border to match active
  document.querySelectorAll('.main-tab-content').forEach(c => {
    c.style.borderTopColor = 'var(--navy)';
  });
}

function showSubTab(tabId, btn, groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  // Find all sub-tab-content siblings
  const parent = group.closest('.main-tab-content') || group.parentElement;
  parent.querySelectorAll('.sub-tab-content').forEach(el => {
    el.style.display = el.id === tabId ? '' : 'none';
  });
  group.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

// Legacy aliases (used by renderRulesTab which writes to 'rules-tab' id)
function showTab(tabId, btn) { /* kept for PDF report compat */ }

