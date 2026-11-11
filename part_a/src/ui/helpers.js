// ===================== HELPERS =====================

function toggleDrBlock(hdr) {
  const body = hdr.nextElementSibling;
  const chevron = hdr.querySelector('.chevron');
  if (!body) return;
  const isHidden = body.style.display === 'none';
  body.style.display = isHidden ? '' : 'none';
  if (chevron) chevron.classList.toggle('open', isHidden);
}

// Keep old renderRulesTab wiring — it writes to 'auto-rules' now

