// ===================== UI INTERACTIONS =====================

function togglePanel(header) {
  const body = header.nextElementSibling;
  const chevron = header.querySelector('.chevron');
  if (!body) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';
  if (chevron) chevron.classList.toggle('open', isHidden);
}

function showTab(tabId, btn) {
  ['tab-automated','tab-manual','tab-detailed','tab-views'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = id === tabId ? '' : 'none';
  });
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
}

function escHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

