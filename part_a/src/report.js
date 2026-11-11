// ===================== REPORT GENERATION =====================

function generateReport() {
  if (!currentModel || !currentIssues) return;
  const score = calculateScore(currentIssues, currentModel.views);

  // Show modal to collect candidate details
  showReportModal(score);
}

function showReportModal(score) {
  // Remove existing modal
  const existing = document.getElementById('report-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'report-modal';
  modal.style.cssText = `
    position:fixed;inset:0;background:rgba(15,36,97,0.45);z-index:1000;
    display:flex;align-items:center;justify-content:center;
    backdrop-filter:blur(4px);
  `;
  modal.innerHTML = `
    <div style="background:#ffffff;border:1px solid #dde3ef;border-radius:16px;
                padding:32px;width:480px;max-width:95vw;max-height:90vh;overflow-y:auto;
                box-shadow:0 20px 60px rgba(15,36,97,0.2)">
      <h2 style="font-size:16px;font-weight:700;margin-bottom:4px;color:#1a2340">Generate Assessment Report</h2>
      <p style="color:#5a6480;font-size:13px;margin-bottom:20px">
        Enter candidate details for the PDF report
      </p>

      <div style="display:grid;gap:12px">
        ${field('candidate', 'Candidate Name', 'e.g. Simon Thorpe')}
        ${field('role', 'Role', 'Enterprise Architect / Solutions Architect')}
        ${field('assessor', 'Assessor Name', 'e.g. Byron Wild')}
        ${field('date', 'Assessment Date', new Date().toISOString().split('T')[0])}
        ${field('organisation', 'Organisation (optional)', 'e.g. ClimateIQ')}
      </div>

      <div style="margin-top:20px;padding:14px;background:#f7f9fc;border:1px solid #dde3ef;
                  border-radius:8px;font-size:12px">
        <div style="margin-bottom:8px;font-weight:600;color:#1a2340">Report Preview</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;color:#5a6480">
          <div>Overall Score: <span style="color:${score.total>=70?'#0f9956':score.total>=40?'#d97706':'#d93025'}">
            <b>${score.total}%</b> — ${score.total>=85?'Distinction':score.total>=70?'Good':score.total>=55?'Average':'Below Average'}</span></div>
          <div>Total Issues: <b style="color:#1a2340">${currentIssues.length}</b></div>
          <div>Views Analysed: <b style="color:#1a2340">${currentModel.views.length}</b></div>
          <div>Elements: <b style="color:#1a2340">${Object.keys(currentModel.elements).length}</b></div>
        </div>
      </div>

      <div id="report-status" style="display:none;margin-top:12px;padding:10px 14px;
           border-radius:8px;font-size:12px">
        Generating report…
      </div>

      <div style="display:flex;gap:10px;margin-top:20px;justify-content:flex-end">
        <button class="btn btn-ghost" onclick="document.getElementById('report-modal').remove()">Cancel</button>
        <button class="btn btn-primary" onclick="doGenerateReport(${score.total})">📄 Generate PDF</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function field(id, label, placeholder) {
  return `<div>
    <label style="font-size:11px;color:#5a6480;text-transform:uppercase;
                  letter-spacing:0.5px;font-weight:500;display:block;margin-bottom:4px">${label}</label>
    <input id="rf-${id}" type="text" placeholder="${placeholder}"
      style="width:100%;background:#ffffff;border:1px solid #c8d0e2;
             border-radius:6px;padding:8px 12px;color:#1a2340;font-family:'Inter',sans-serif;
             font-size:13px;outline:none;transition:border-color 0.15s,box-shadow 0.15s"
      onfocus="this.style.borderColor='#1e56c8';this.style.boxShadow='0 0 0 3px rgba(30,86,200,0.12)'"
      onblur="this.style.borderColor='#c8d0e2';this.style.boxShadow='none'"
    />
  </div>`;
}

function doGenerateReport(totalScore) {
  const get = id => (document.getElementById(`rf-${id}`)?.value || '').trim();
  const candidate  = get('candidate')  || 'Candidate';
  const role       = get('role')       || 'Architect';
  const assessor   = get('assessor')   || 'Assessor';
  const date       = get('date')       || new Date().toISOString().split('T')[0];
  const org        = get('organisation');
  const score      = calculateScore(currentIssues, currentModel.views);

  const status = document.getElementById('report-status');
  status.style.display = 'block';
  status.style.background = '#fff8ed'; status.style.border = '1px solid rgba(217,119,6,0.25)'; status.style.color = '#b45309';
  status.textContent = 'Generating PDF report…';

  setTimeout(() => {
    try {
      buildPDFReport({
        candidate, role, assessor, date, organisation: org,
        model_name: currentModel.modelName,
        view_count: currentModel.views.length,
        element_count: Object.keys(currentModel.elements).length,
        relationship_count: Object.keys(currentModel.relationships).length,
        score,
        issues: currentIssues,
      });
      status.style.background = '#edfbf4'; status.style.border = '1px solid rgba(15,153,86,0.25)'; status.style.color = '#0f9956';
      status.textContent = '✓ Report downloaded successfully!';
      setTimeout(() => document.getElementById('report-modal')?.remove(), 1500);
    } catch(err) {
      status.style.background = '#fff0f3'; status.style.border = '1px solid rgba(217,48,37,0.25)'; status.style.color = '#d93025';
      status.textContent = 'Error: ' + err.message;
    }
  }, 100);
}

// ── PDF builder using jsPDF (loaded dynamically) ──────────────────────────
function buildPDFReport(data) {
  // Dynamically load jsPDF
  if (typeof window.jspdf === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => renderPDF(data);
    script.onerror = () => { throw new Error('Could not load PDF library. Please check your connection.'); };
    document.head.appendChild(script);
  } else {
    renderPDF(data);
  }
}

function renderPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, H = 297;
  const ML = 20, MR = 20, UW = W - ML - MR;

  // ── Colour helpers ──────────────────────────────────────────────────────
  const DARK   = [26,31,46];
  const BLUE   = [79,124,255];
  const LGBG   = [244,246,251];
  const BORDER = [221,225,236];
  const TMID   = [74,80,104];
  const TLIGHT = [136,144,170];

  function ragRGB(s) {
    return s>=70 ? [79,205,139] : s>=40 ? [255,184,79] : [255,79,106];
  }
  function ragLabel(s) { return s>=70?'GREEN':s>=40?'AMBER':'RED'; }
  function gradeLabel(s) {
    if(s>=85)return'Distinction';if(s>=70)return'Good';
    if(s>=55)return'Average';if(s>=40)return'Below Average';return'Poor';
  }
  const CAT_RGB = {
    SebTreb:[168,85,247], ArchiMate:[79,124,255],
    CrossLayer:[245,158,11], Completeness:[16,185,129], Assessment:[236,72,153]
  };
  const CAT_LABELS = {
    Completeness:'Completeness', CrossLayer:'Cross-Layer Alignment',
    ArchiMate:'ArchiMate 3.2', SebTreb:'SebTreb Style', Assessment:'Assessment Criteria'
  };

  let y = 0;

  // ── Page frame ──────────────────────────────────────────────────────────
  function addPageFrame(pageNum, totalPages) {
    // Header
    doc.setFillColor(...DARK);
    doc.rect(0, 0, W, 12, 'F');
    doc.setTextColor(255,255,255);
    doc.setFontSize(8); doc.setFont('helvetica','bold');
    doc.text('ArchiMate Assessment Tool', ML, 8);
    doc.setFont('helvetica','normal'); doc.setFontSize(7);
    doc.text('Confidential – Assessment Report', W-MR, 8, {align:'right'});
    // Footer
    doc.setFillColor(...BORDER);
    doc.rect(0, H-9, W, 9, 'F');
    doc.setTextColor(...TMID); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
    doc.text('ArchiMate Assessment Tool  ·  SebTreb Rules  ·  ArchiMate 3.2 Specification', ML, H-3);
    doc.text(`Page ${pageNum} of ${totalPages}`, W-MR, H-3, {align:'right'});
  }

  function newPage() {
    doc.addPage();
    y = 18;
  }
  function checkY(needed) { if (y + needed > H - 14) { newPage(); } }

  function hRule() {
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.3);
    doc.line(ML, y, W-MR, y);
    y += 3;
  }

  function sectionTitle(text) {
    checkY(12);
    doc.setFontSize(12); doc.setFont('helvetica','bold'); doc.setTextColor(...DARK);
    doc.text(text, ML, y); y += 6;
    hRule();
  }

  function ragPill(text, score, x, py, w=18) {
    const c = ragRGB(score);
    doc.setFillColor(c[0]*.15+240, c[1]*.15+240, c[2]*.15+240);
    doc.setDrawColor(...c);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, py-4, w, 6, 1, 1, 'FD');
    doc.setTextColor(...c);
    doc.setFontSize(6.5); doc.setFont('helvetica','bold');
    doc.text(text, x+w/2, py, {align:'center'});
  }

  function scoreRing(cx, cy, r, score) {
    const steps = 60;
    const c = ragRGB(score);
    // BG ring
    doc.setDrawColor(232,234,240); doc.setLineWidth(3); doc.setFillColor(232,234,240);
    doc.circle(cx, cy, r, 'S');
    // Score arc
    if (score > 0) {
      doc.setDrawColor(...c); doc.setLineWidth(3);
      const ang = score * Math.PI * 2 / 100;
      for (let i = 0; i < steps; i++) {
        const frac1 = i/steps, frac2=(i+1)/steps;
        if (frac2 > score/100) break;
        const a1 = Math.PI/2 - frac1*ang;
        const a2 = Math.PI/2 - frac2*ang;
        doc.line(cx+r*Math.cos(a1), cy-r*Math.sin(a1),
                 cx+r*Math.cos(a2), cy-r*Math.sin(a2));
      }
    }
    // Inner mask
    doc.setFillColor(255,255,255); doc.setDrawColor(255,255,255);
    doc.circle(cx, cy, r*0.65, 'F');
    // Text
    doc.setTextColor(...c); doc.setFontSize(9); doc.setFont('helvetica','bold');
    doc.text(`${score}%`, cx, cy+1.5, {align:'center'});
  }

  // ══ PAGE 1 ══════════════════════════════════════════════════════════════
  y = 18;

  // Header banner
  doc.setFillColor(...DARK);
  doc.rect(ML, y-2, UW, 16, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('ArchiMate Assessment Report', ML+6, y+9);
  y += 20;

  // Meta table
  const metaItems = [
    ['Candidate', data.candidate], ['Role', data.role],
    ['Assessor', data.assessor],   ['Date', data.date],
    ['Model', data.model_name],
  ];
  metaItems.forEach(([k,v], i) => {
    doc.setFillColor(...(i%2===0?[255,255,255]:LGBG));
    doc.rect(ML, y-3, UW, 7, 'F');
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
    doc.rect(ML, y-3, UW, 7, 'D');
    doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.setTextColor(...TLIGHT);
    doc.text(k, ML+3, y+1.5);
    doc.setFont('helvetica','normal'); doc.setTextColor(...DARK);
    doc.text(v||'N/A', ML+33, y+1.5);
    y += 7;
  });
  y += 5;

  // ── Summary ──────────────────────────────────────────────────────────────
  sectionTitle('Assessment Summary');

  const total = data.score.total;
  const catScores = data.score.byCategory;
  const mustC  = data.issues.filter(i=>i.severity==='MUST').length;
  const shouldC= data.issues.filter(i=>i.severity==='SHOULD').length;
  const infoC  = data.issues.filter(i=>i.severity==='INFO').length;

  // Score card
  const cardY = y;
  doc.setFillColor(255,255,255); doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
  doc.rect(ML, cardY, 64, 36, 'FD');
  doc.setFillColor(...ragRGB(total));
  doc.rect(ML, cardY, 64, 1, 'F');  // top accent
  scoreRing(ML+14, cardY+18, 9, total);
  doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.setTextColor(...DARK);
  doc.text('Overall Score', ML+26, cardY+8);
  doc.setFontSize(18); doc.setTextColor(...ragRGB(total));
  doc.text(`${total}%`, ML+26, cardY+19);
  doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(...TMID);
  doc.text(`Grade: ${gradeLabel(total)}`, ML+26, cardY+26);
  ragPill(ragLabel(total), total, ML+26, cardY+33, 22);

  // Issues card
  const ic2 = ML + 68;
  doc.setFillColor(255,255,255); doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
  doc.rect(ic2, cardY, 62, 36, 'FD');
  doc.setFillColor(...(mustC>0 ? [255,79,106] : [255,184,79]));
  doc.rect(ic2, cardY, 62, 1, 'F');
  doc.setFontSize(9.5); doc.setFont('helvetica','bold'); doc.setTextColor(...DARK);
  doc.text('Issue Summary', ic2+5, cardY+8);
  doc.setFontSize(8.5); doc.setFont('helvetica','normal');
  doc.setTextColor(255,79,106);  doc.text(`${mustC}  Critical (MUST)`, ic2+5, cardY+16);
  doc.setTextColor(255,184,79);  doc.text(`${shouldC}  Warnings (SHOULD)`, ic2+5, cardY+23);
  doc.setTextColor(...TLIGHT);   doc.text(`${infoC}  Informational`, ic2+5, cardY+30);
  doc.setTextColor(...TMID);
  doc.setFontSize(7.5); doc.text(`Total: ${data.issues.length} issues`, ic2+5, cardY+35);

  // Model card
  const mc2 = ic2 + 66;
  doc.setFillColor(255,255,255); doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
  doc.rect(mc2, cardY, 36, 36, 'FD');
  doc.setFillColor(...BLUE); doc.rect(mc2, cardY, 36, 1, 'F');
  doc.setFontSize(9.5); doc.setFont('helvetica','bold'); doc.setTextColor(...DARK);
  doc.text('Model', mc2+3, cardY+8);
  doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(...TMID);
  doc.text(`${data.view_count}  Views`, mc2+3, cardY+16);
  doc.text(`${data.element_count}  Elements`, mc2+3, cardY+23);
  doc.text(`${data.relationship_count}  Rels`, mc2+3, cardY+30);

  y = cardY + 42;

  // ── Category Breakdown ───────────────────────────────────────────────────
  sectionTitle('AI Analysis – Category Breakdown');

  // Table header
  doc.setFillColor(...DARK); doc.rect(ML, y-3, UW, 7, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(7.5); doc.setFont('helvetica','bold');
  doc.text('Category', ML+3, y+1);
  doc.text('Score', ML+42, y+1);
  doc.text('RAG', ML+57, y+1);
  doc.text('Issues', ML+72, y+1);
  doc.text('Top Issues Found', ML+86, y+1);
  y += 7;

  const catOrder2 = ['Completeness','CrossLayer','ArchiMate','SebTreb','Assessment'];
  catOrder2.forEach((cat, idx) => {
    const cs = catScores[cat] || 0;
    const cc = CAT_RGB[cat] || BLUE;
    const ic3 = data.issues.filter(i=>i.category===cat).length;
    const topI = data.issues.filter(i=>i.category===cat&&i.severity==='MUST')
                             .map(i=>i.description).filter((v,i,a)=>a.indexOf(v)===i)
                             .slice(0,2).join('; ') || 'No critical issues';
    const rh = 8;
    doc.setFillColor(...(idx%2===0?[255,255,255]:LGBG));
    doc.rect(ML, y-3, UW, rh, 'F');
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.2); doc.rect(ML, y-3, UW, rh, 'D');
    // Cat colour left bar
    doc.setFillColor(...cc); doc.rect(ML, y-3, 1.5, rh, 'F');
    // Category name
    doc.setFontSize(8.5); doc.setFont('helvetica','bold'); doc.setTextColor(...cc);
    doc.text(CAT_LABELS[cat]||cat, ML+5, y+1.5);
    // Score
    doc.setTextColor(...ragRGB(cs));
    doc.text(`${cs}%`, ML+42, y+1.5);
    // RAG
    ragPill(ragLabel(cs), cs, ML+53, y+2, 16);
    // Issues count
    doc.setFontSize(8.5); doc.setFont('helvetica','normal'); doc.setTextColor(...TMID);
    doc.text(String(ic3||'—'), ML+76, y+1.5);
    // Top issues
    const truncated = topI.length > 55 ? topI.slice(0,52)+'…' : topI;
    doc.setFontSize(7.5); doc.text(truncated, ML+86, y+1.5);
    y += rh;
  });
  y += 5;

  // ══ PAGE 2 ══════════════════════════════════════════════════════════════
  newPage();
  sectionTitle('View-by-View Issue Analysis');

  const byView2 = {};
  data.issues.forEach(i => { (byView2[i.viewName] = byView2[i.viewName]||[]).push(i); });

  Object.entries(byView2).forEach(([vname, vis]) => {
    const mc3 = vis.filter(i=>i.severity==='MUST').length;
    const toprc = mc3>0 ? [255,79,106] : vis.length>0 ? [255,184,79] : [79,205,139];
    const blockH = 8 + vis.length * 10;
    checkY(blockH + 5);

    // View header
    doc.setFillColor(...DARK); doc.rect(ML, y-3, UW, 8, 'F');
    doc.setFillColor(...toprc); doc.rect(ML, y-3, 2, 8, 'F');
    doc.setTextColor(255,255,255); doc.setFontSize(8.5); doc.setFont('helvetica','bold');
    doc.text(vname, ML+5, y+1.5);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
    doc.setTextColor(176,184,212);
    doc.text(`${vis.length} issues  ·  ${mc3} MUST  ·  ${vis.length-mc3} SHOULD`, W-MR, y+1.5, {align:'right'});
    y += 8;

    // Issue rows header
    doc.setFillColor(240,242,248); doc.rect(ML, y-3, UW, 7, 'F');
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.2); doc.rect(ML, y-3, UW, 7, 'D');
    doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(...TLIGHT);
    doc.text('Rule', ML+2, y+1); doc.text('Category', ML+22, y+1);
    doc.text('Severity', ML+48, y+1); doc.text('Issue Detail', ML+65, y+1);
    y += 7;

    vis.sort((a,b)=>(a.severity==='MUST'?0:1)-(b.severity==='MUST'?0:1))
       .forEach((issue, idx) => {
      const sc2 = issue.severity==='MUST' ? [255,79,106] : [255,184,79];
      checkY(10);
      doc.setFillColor(...(idx%2===0?[255,255,255]:LGBG));
      doc.rect(ML, y-3, UW, 9, 'F');
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.2); doc.rect(ML, y-3, UW, 9, 'D');
      // Rule ID
      doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...BLUE);
      doc.text(issue.ruleId, ML+2, y+1.5);
      // Category
      doc.setTextColor(...(CAT_RGB[issue.category]||BLUE));
      doc.text(issue.category, ML+22, y+1.5);
      // Severity
      doc.setTextColor(...sc2);
      doc.text(issue.severity, ML+48, y+1.5);
      // Detail
      doc.setFont('helvetica','normal'); doc.setFontSize(7); doc.setTextColor(...DARK);
      const det = issue.detail.length > 75 ? issue.detail.slice(0,72)+'…' : issue.detail;
      doc.text(det, ML+65, y+1.5);
      y += 9;
    });
    y += 5;
  });

  // ══ PAGE 3: Rule Checklist ═══════════════════════════════════════════════
  newPage();
  sectionTitle('Rule Compliance Checklist');

  // Legend
  doc.setFillColor(...LGBG); doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
  doc.rect(ML, y-3, UW, 7, 'FD');
  doc.setFontSize(7.5); doc.setFont('helvetica','bold');
  doc.setTextColor(79,205,139); doc.text('PASS  Rule satisfied', ML+5, y+1);
  doc.setTextColor(255,79,106); doc.text('FAIL  Critical violation (MUST)', ML+60, y+1);
  doc.setTextColor(255,184,79); doc.text('WARN  Advisory issue (SHOULD)', ML+120, y+1);
  y += 10;

  const ALL_RULES2 = [
    ['SebTreb','elm-001','MUST','Elements must use rectangle notation'],
    ['SebTreb','elm-002','SHOULD','Elements should be same size'],
    ['SebTreb','elm-003','SHOULD','Elements should align horizontally & vertically'],
    ['SebTreb','elm-005','SHOULD','Spacing between elements should be consistent'],
    ['SebTreb','elm-007','MUST','Data entities must be named in singular'],
    ['SebTreb','cnn-001','MUST','Connectors must not run diagonally'],
    ['SebTreb','cnn-003','MUST','Connectors must have minimum bends'],
    ['SebTreb','msc-003','MUST','Grouped concepts must be nested, not aggregated'],
    ['SebTreb','vws-001','MUST','Views must indicate diagram type in name'],
    ['ArchiMate','ARC-STR-001','MUST','Composition must be within same layer'],
    ['ArchiMate','ARC-REL-001','MUST','Service must not realize Component'],
    ['ArchiMate','ARC-USE-001','SHOULD','Motivation view should have motivation elements'],
    ['ArchiMate','ARC-USE-002','MUST','Technology view must have technology elements'],
    ['ArchiMate','ARC-USE-003','MUST','Cross-layer view must span 2+ layers'],
    ['CrossLayer','ARC-CL-001','MUST','Cross-layer relationships must use valid types'],
    ['CrossLayer','ARC-CL-002','SHOULD','Business-Technology should not skip Application'],
    ['CrossLayer','ARC-CL-003','SHOULD','Technology should not directly serve Business'],
    ['CrossLayer','ARC-CL-004','SHOULD','BusinessService to AppService: Realization/Serving'],
    ['Completeness','COMP-001','MUST','Minimum 6 views required'],
    ['Completeness','COMP-002','MUST','Contextual view required'],
    ['Completeness','COMP-003','MUST','Conceptual view required'],
    ['Completeness','COMP-004','MUST','Technology view required'],
    ['Completeness','COMP-005','MUST','Cross-layer view required'],
    ['Completeness','COMP-006','SHOULD','Motivation elements should be present'],
    ['Completeness','COMP-007','MUST','Technology layer elements must be present'],
    ['Completeness','COMP-008','SHOULD','Business actors or roles should be present'],
    ['Assessment','COMP-009','MUST','Cross-layer views required (assessment criteria)'],
    ['Assessment','COMP-010','INFO','Orphaned elements not in any view'],
  ];
  const byRuleIssue = {};
  data.issues.forEach(i => { (byRuleIssue[i.ruleId]=byRuleIssue[i.ruleId]||[]).push(i); });

  // Table header
  doc.setFillColor(...DARK); doc.rect(ML, y-3, UW, 7, 'F');
  doc.setTextColor(255,255,255); doc.setFontSize(7); doc.setFont('helvetica','bold');
  doc.text('Status',ML+2,y+1); doc.text('Rule ID',ML+17,y+1);
  doc.text('Sev.',ML+40,y+1); doc.text('Description',ML+54,y+1);
  doc.text('Views Affected',ML+130,y+1);
  y += 7;

  const catOrder3 = ['Completeness','CrossLayer','ArchiMate','SebTreb','Assessment'];
  const rbc2 = {};
  ALL_RULES2.forEach(r => { (rbc2[r[0]]=rbc2[r[0]]||[]).push(r); });

  catOrder3.forEach(cat => {
    checkY(12);
    const cc = CAT_RGB[cat]||BLUE;
    doc.setFillColor(240,242,248); doc.setDrawColor(...BORDER); doc.setLineWidth(0.2);
    doc.rect(ML, y-3, UW, 7, 'FD');
    doc.setFillColor(...cc); doc.rect(ML, y-3, 1.5, 7, 'F');
    doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.setTextColor(...cc);
    doc.text((CAT_LABELS[cat]||cat).toUpperCase(), ML+5, y+1.5);
    y += 7;

    (rbc2[cat]||[]).forEach((r, idx) => {
      const ri = byRuleIssue[r[1]]||[];
      let status, stc;
      if(!ri.length){status='PASS';stc=[79,205,139];}
      else if(r[2]==='MUST'){status='FAIL';stc=[255,79,106];}
      else{status='WARN';stc=[255,184,79];}
      const sevc = r[2]==='MUST'?[255,79,106]:r[2]==='SHOULD'?[255,184,79]:TLIGHT;
      const aff = ri.length ? [...new Set(ri.map(i=>i.viewName))].join(', ') : '—';
      checkY(8);
      doc.setFillColor(...(idx%2===0?[255,255,255]:LGBG));
      doc.rect(ML, y-3, UW, 7, 'F');
      doc.setDrawColor(...BORDER); doc.setLineWidth(0.2); doc.rect(ML, y-3, UW, 7, 'D');
      // Status bg
      doc.setFillColor(stc[0]*.15+218,stc[1]*.15+218,stc[2]*.15+218);
      doc.rect(ML, y-3, 15, 7, 'F');
      doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.setTextColor(...stc);
      doc.text(status, ML+7.5, y+1, {align:'center'});
      doc.setTextColor(...BLUE); doc.text(r[1], ML+17, y+1);
      doc.setTextColor(...sevc); doc.text(r[2], ML+40, y+1);
      doc.setFont('helvetica','normal'); doc.setTextColor(...DARK);
      doc.text(r[3], ML+54, y+1);
      doc.setTextColor(...TMID);
      const affTrunc = aff.length > 30 ? aff.slice(0,27)+'…' : aff;
      doc.text(affTrunc, ML+130, y+1);
      y += 7;
    });
    y += 2;
  });

  // ══ PAGE 4: Signatures ═══════════════════════════════════════════════════
  newPage();
  doc.setTextColor(...DARK); doc.setFontSize(12); doc.setFont('helvetica','bold');
  doc.text('Authorisation & Signatures', ML, y); y += 4;
  hRule(); y += 10;

  ['Assessor','Reviewer','Candidate Acknowledgment'].forEach(label => {
    checkY(18);
    doc.setFontSize(9.5); doc.setFont('helvetica','bold'); doc.setTextColor(...DARK);
    doc.text(label, ML, y);
    doc.setFont('helvetica','normal'); doc.setFontSize(9); doc.setTextColor(...TMID);
    doc.text('Signature: _______________________________________', ML+42, y);
    doc.text('Date: ___________________', ML+142, y);
    doc.setDrawColor(...BORDER); doc.setLineWidth(0.3);
    doc.line(ML, y+2, W-MR, y+2);
    y += 16;
  });

  // ── Add page frames to all pages ─────────────────────────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addPageFrame(i, totalPages);
  }

  // Save
  const fname = `ArchiMate_Report_${(data.candidate||'Candidate').replace(/\s+/g,'_')}_${data.date||''}.pdf`;
  doc.save(fname);
}

