// ===================== MANUAL SCORESHEET =====================

// Scoresheet schema: sections with criteria rows
const MS_SECTIONS = [
  {
    id: 'metamodel', label: '1. Meta-model & Relationships', pct: 30,
    rows: [
      { id:'1a', label:'Valid ArchiMate element types used correctly', weight:10, sebtreb: null },
      { id:'1b', label:'Appropriate layer assignment (Business / Application / Technology)', weight:8, sebtreb: null },
      { id:'1c', label:'Valid relationship types and semantics', weight:7, sebtreb: null },
      { id:'1d', label:'Cross-layer connections present and valid', weight:5, sebtreb: null },
    ]
  },
  {
    id: 'completeness', label: '2. Scenario Interpretation & Completeness', pct: 20,
    rows: [
      { id:'2a', label:'Weather domain concepts covered (APIs, sensors, analytics, alerts)', weight:8, sebtreb: null },
      { id:'2b', label:'Key stakeholders represented (CTO, Developers, Data Scientists, Enterprise Clients)', weight:5, sebtreb: null },
      { id:'2c', label:'Business requirements captured (scalability, real-time, compliance)', weight:4, sebtreb: null },
      { id:'2d', label:'Technology components aligned with modernisation goals', weight:3, sebtreb: null },
    ]
  },
  {
    id: 'viewpoints', label: '3. Viewpoints & Stakeholder Relevance', pct: 25,
    rows: [
      { id:'3a', label:'Minimum 6 views created (incl. contextual, conceptual, technology)', weight:8, sebtreb: 'COMP-001 / COMP-002 / COMP-003 / COMP-004' },
      { id:'3b', label:'Views address specific stakeholder concerns', weight:6, sebtreb: null },
      { id:'3c', label:'Cross-layer views present (e.g. Capability to Application)', weight:5, sebtreb: 'COMP-005 / ARC-USE-003' },
      { id:'3d', label:'Appropriate viewpoint selection for architecture role (EA / SA)', weight:3, sebtreb: null },
      { id:'3e', label:'View names clearly indicate purpose and scope', weight:3, sebtreb: 'vws-001' },
    ]
  },
  {
    id: 'crosslayer', label: '4. Cross-layer Alignment', pct: 25,
    rows: [
      { id:'4a', label:'Business goals traced to application services', weight:8, sebtreb: 'ARC-CL-001 / ARC-CL-004' },
      { id:'4b', label:'Application services realized by technology components', weight:7, sebtreb: 'ARC-CL-002 / ARC-CL-003' },
      { id:'4c', label:'Motivation elements connected to strategy and business layers', weight:5, sebtreb: null },
      { id:'4d', label:'Coherent architecture narrative from drivers to implementation', weight:5, sebtreb: null },
    ]
  },
  {
    id: 'clarity', label: '5. Visual Clarity & SebTreb Compliance', pct: 10,
    rows: [
      { id:'5a', label:'SebTreb rules compliance — element notation, sizing, alignment', weight:4, sebtreb: 'elm-001 / elm-002 / elm-003 / elm-005 / elm-007' },
      { id:'5b', label:'Connector routing — no diagonals, minimum bends, centred attachment', weight:2, sebtreb: 'cnn-001 / cnn-003 / cnn-010 / cnn-011' },
      { id:'5c', label:'Labels positioned correctly (elements & connectors)', weight:2, sebtreb: 'elm-008 / elm-009 / cnn-005 / cnn-006' },
      { id:'5d', label:'Grouping used appropriately; no explicit aggregation to Grouping', weight:1, sebtreb: 'msc-002 / msc-003 / msc-004' },
      { id:'5e', label:'Overall visual clarity and readability', weight:1, sebtreb: null },
    ]
  },
];

const MS_RATINGS = [
  { value: '',    label: '— Select —' },
  { value: '0',   label: 'Missing (0%)' },
  { value: '25',  label: 'Poor (25%)' },
  { value: '50',  label: 'Adequate (50%)' },
  { value: '75',  label: 'Good (75%)' },
  { value: '100', label: 'Outstanding (100%)' },
];

const MS_RATED_CLASSES = { '': '', '0':'rated-missing', '25':'rated-poor', '50':'rated-adequate', '75':'rated-good', '100':'rated-outstanding' };

function renderManualTab(model, issues, autoScore) {
  // Build auto-insights for the scoresheet
  const sebTrebIssues = issues.filter(i => i.category === 'SebTreb');
  const crossLayerIssues = issues.filter(i => i.category === 'CrossLayer');
  const completenessIssues = issues.filter(i => i.category === 'Completeness');
  const mustCount = issues.filter(i => i.severity === 'MUST').length;

  // Build insights text
  const insights = [];
  if (model.views.length < 6) insights.push(`Only <b>${model.views.length}</b> views found — minimum 6 required. Consider rating 3a as "Poor".`);
  if (!model.views.some(v => v.name.toLowerCase().includes('contextual'))) insights.push('<b>Contextual</b> view missing — impacts criteria 3a.');
  if (!model.views.some(v => v.name.toLowerCase().includes('conceptual'))) insights.push('<b>Conceptual</b> view missing — impacts criteria 3a.');
  if (sebTrebIssues.length > 0) {
    const ruleIds = [...new Set(sebTrebIssues.map(i => i.ruleId))].slice(0,6).join(', ');
    insights.push(`<b>${sebTrebIssues.length}</b> SebTreb violations: ${ruleIds}. Review Section 5 carefully.`);
  }
  if (crossLayerIssues.filter(i=>i.severity==='MUST').length > 0) insights.push(`<b>${crossLayerIssues.filter(i=>i.severity==='MUST').length}</b> critical cross-layer issues found. Check Sections 1d & 4.`);
  if (completenessIssues.length > 0) insights.push(`<b>${completenessIssues.length}</b> completeness issues detected — see Rule Checklist for detail.`);
  if (mustCount === 0) insights.push('✓ No MUST violations found — automated checks passed.');

  const insightHtml = insights.length
    ? `<ul>${insights.map(i=>`<li>${i}</li>`).join('')}</ul>`
    : '<p style="color:var(--green)">✓ Automated checks found no critical issues.</p>';

  let html = `<div class="ms-wrap">
    <div class="ms-insight-box">
      <strong>📊 Automated Analysis Insights</strong>
      <div style="margin-top:4px;font-size:12px;color:var(--text-dim)">
        Automated Score: <b style="color:var(--accent)">${autoScore.total}%</b>
        &nbsp;&nbsp;·&nbsp;&nbsp;
        ${Object.entries(autoScore.byCategory).map(([k,v])=>`<span class="rag ${getRagClass(v)}" style="font-size:10px;padding:1px 7px">${k}: ${v}%</span>`).join(' ')}
      </div>
      ${insightHtml}
    </div>

    <div class="ms-meta-grid">
      <div>
        <div class="ms-field"><label>Candidate Name / ID</label><input type="text" id="ms-candidate" placeholder="Enter candidate name"></div>
        <div class="ms-field"><label>Architecture Role</label>
          <select id="ms-role">
            <option value="">Select role…</option>
            <option value="EA">Enterprise Architect</option>
            <option value="SA">Solutions Architect</option>
          </select>
        </div>
        <div class="ms-field"><label>Assessment Date</label><input type="date" id="ms-date" value="${new Date().toISOString().split('T')[0]}"></div>
      </div>
      <div>
        <div class="ms-field"><label>Assessor Name</label><input type="text" id="ms-assessor" placeholder="Enter assessor name"></div>
        <div class="ms-field"><label>Model</label><input type="text" id="ms-model" value="${escHtml(model.modelName)}" readonly></div>
        <div class="ms-field"><label>Automated Score</label><input type="text" id="ms-autoscore" value="${autoScore.total}% (${getRagLabel(autoScore.total)})" readonly></div>
      </div>
    </div>`;

  // Generate scoring sections
  MS_SECTIONS.forEach(section => {
    html += `<div class="ms-section">
      <div class="ms-section-header">
        <span>${section.label}</span>
        <span class="ms-section-pct" id="ms-total-${section.id}">0.0 / ${section.pct}%</span>
      </div>
      <table class="ms-table">
        <thead>
          <tr>
            <th style="width:44%">Criteria</th>
            <th style="width:18%">Rating</th>
            <th style="width:10%;text-align:center">Weighted</th>
            <th style="width:28%">Evidence / Comments</th>
          </tr>
        </thead>
        <tbody>`;

    section.rows.forEach(row => {
      const sebtrebHint = row.sebtreb
        ? `<span class="ms-sebtreb-hint">📏 SebTreb: ${row.sebtreb}</span>`
        : '';
      html += `<tr>
        <td>${row.label}${sebtrebHint}</td>
        <td>
          <select class="ms-select" id="ms-sel-${row.id}"
            onchange="msOnChange('${row.id}','${section.id}',${row.weight},this)">
            ${MS_RATINGS.map(r=>`<option value="${r.value}">${r.label}</option>`).join('')}
          </select>
        </td>
        <td style="text-align:center"><span class="ms-wt" id="ms-wt-${row.id}">0.0%</span></td>
        <td><textarea class="ms-comment" id="ms-cmt-${row.id}" rows="1" placeholder="Evidence / notes…"></textarea></td>
      </tr>`;
    });

    html += `<tr class="ms-subtotal-row">
      <td colspan="2" style="text-align:right">Section Total</td>
      <td style="text-align:center"><span class="ms-pts" id="ms-subtotal-${section.id}">0.0%</span></td>
      <td></td>
    </tr>
        </tbody>
      </table>
    </div>`;
  });

  // Overall summary box
  html += `<div class="ms-overall">
    <h3>Overall Assessment Summary</h3>
    <div class="ms-score-row">
      <div class="ms-score-box">
        <div class="ms-score-label">Automated Score</div>
        <div class="ms-score-val" style="color:#93c5fd">${autoScore.total}%</div>
        <div class="ms-grade">${gradeFromScore(autoScore.total)} &nbsp;<span class="rag ${getRagClass(autoScore.total)}" style="font-size:10px">${getRagLabel(autoScore.total)}</span></div>
      </div>
      <div class="ms-score-box">
        <div class="ms-score-label">Manual Score</div>
        <div class="ms-score-val" id="ms-manual-total" style="color:#a5f3fc">0.0%</div>
        <div class="ms-grade" id="ms-manual-grade">—</div>
      </div>
      <div class="ms-score-box combined">
        <div class="ms-score-label">Combined Score</div>
        <div class="ms-score-val" id="ms-combined-total">${autoScore.total}%</div>
        <div class="ms-grade" id="ms-combined-grade">${gradeFromScore(autoScore.total)}</div>
      </div>
    </div>

    <div class="ms-textarea-section">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px">
        <div>
          <label>Key Strengths</label>
          <textarea id="ms-strengths" placeholder="Highlight the candidate's strongest areas…"></textarea>
        </div>
        <div>
          <label>Areas for Improvement</label>
          <textarea id="ms-improvement" placeholder="Specific areas to develop further…"></textarea>
        </div>
        <div>
          <label>Recommendations</label>
          <textarea id="ms-recommendations" placeholder="Actionable next steps…"></textarea>
        </div>
      </div>
    </div>
  </div>

  <div class="ms-sig-grid">
    <div class="ms-sig-box">
      <div class="ms-sig-role">Primary Assessor</div>
      <div class="ms-sig-line">Signature &amp; Date: ___________________</div>
    </div>
    <div class="ms-sig-box">
      <div class="ms-sig-role">Secondary Assessor</div>
      <div class="ms-sig-line">Signature &amp; Date: ___________________</div>
    </div>
    <div class="ms-sig-box">
      <div class="ms-sig-role">Quality Assurance Review</div>
      <div class="ms-sig-line">Signature &amp; Date: ___________________</div>
    </div>
  </div>

  <div class="ms-export-bar">
    <button class="btn btn-ghost" onclick="printManualSheet()">🖨️ Print Scoresheet</button>
    <button class="btn btn-primary" onclick="exportManualScore()">⬇️ Export Assessment JSON</button>
  </div>
</div>`;

  document.getElementById('manual-tab').innerHTML = html;
}

function msOnChange(rowId, sectionId, weight, sel) {
  const val = parseFloat(sel.value) || 0;
  const weighted = (val / 100) * weight;
  document.getElementById(`ms-wt-${rowId}`).textContent = weighted.toFixed(1) + '%';
  // Update select colour class
  sel.className = 'ms-select ' + (MS_RATED_CLASSES[sel.value] || '');
  msUpdateSection(sectionId);
  msUpdateOverall();
}

function msUpdateSection(sectionId) {
  const section = MS_SECTIONS.find(s => s.id === sectionId);
  if (!section) return;
  let total = 0;
  section.rows.forEach(row => {
    const sel = document.getElementById(`ms-sel-${row.id}`);
    if (!sel) return;
    const val = parseFloat(sel.value) || 0;
    total += (val / 100) * row.weight;
  });
  const el = document.getElementById(`ms-subtotal-${sectionId}`);
  const hdr = document.getElementById(`ms-total-${sectionId}`);
  if (el) el.textContent = total.toFixed(1) + '%';
  if (hdr) hdr.textContent = `${total.toFixed(1)} / ${section.pct}%`;
}

function msUpdateOverall() {
  let total = 0;
  MS_SECTIONS.forEach(section => {
    section.rows.forEach(row => {
      const sel = document.getElementById(`ms-sel-${row.id}`);
      if (!sel) return;
      const val = parseFloat(sel.value) || 0;
      total += (val / 100) * row.weight;
    });
  });
  const manualEl = document.getElementById('ms-manual-total');
  const manualGrade = document.getElementById('ms-manual-grade');
  const combinedEl = document.getElementById('ms-combined-total');
  const combinedGrade = document.getElementById('ms-combined-grade');
  if (manualEl) manualEl.textContent = total.toFixed(1) + '%';
  if (manualGrade) manualGrade.textContent = gradeFromScore(total);

  // Combined: average of auto + manual
  const autoVal = currentIssues ? calculateScore(currentIssues, currentModel.views).total : 0;
  const combined = ((total + autoVal) / 2).toFixed(1);
  if (combinedEl) combinedEl.textContent = combined + '%';
  if (combinedGrade) combinedGrade.textContent = gradeFromScore(parseFloat(combined));
}

function gradeFromScore(s) {
  if (s >= 85) return 'Distinction';
  if (s >= 70) return 'Good';
  if (s >= 55) return 'Average';
  if (s >= 40) return 'Below Average';
  return 'Poor';
}

function exportManualScore() {
  if (!currentModel) return;
  const autoScore = calculateScore(currentIssues, currentModel.views);
  const manualScores = {};
  let manualTotal = 0;
  MS_SECTIONS.forEach(section => {
    manualScores[section.id] = {};
    section.rows.forEach(row => {
      const sel = document.getElementById(`ms-sel-${row.id}`);
      const cmt = document.getElementById(`ms-cmt-${row.id}`);
      const val = parseFloat(sel?.value) || 0;
      const weighted = (val / 100) * row.weight;
      manualTotal += weighted;
      manualScores[section.id][row.id] = {
        criteria: row.label,
        rating: sel?.options[sel.selectedIndex]?.text || '—',
        weightedScore: weighted.toFixed(1) + '%',
        comment: cmt?.value || ''
      };
    });
  });

  const data = {
    candidate: document.getElementById('ms-candidate')?.value || '',
    role: document.getElementById('ms-role')?.value || '',
    assessor: document.getElementById('ms-assessor')?.value || '',
    date: document.getElementById('ms-date')?.value || '',
    modelName: currentModel.modelName,
    automatedScore: autoScore,
    manualScore: {
      total: manualTotal.toFixed(1) + '%',
      grade: gradeFromScore(manualTotal),
      bySection: manualScores
    },
    combinedScore: (((parseFloat(manualTotal) + autoScore.total) / 2)).toFixed(1) + '%',
    narrative: {
      strengths: document.getElementById('ms-strengths')?.value || '',
      improvements: document.getElementById('ms-improvement')?.value || '',
      recommendations: document.getElementById('ms-recommendations')?.value || ''
    },
    issues: currentIssues,
    exportedAt: new Date().toISOString()
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `archimate-assessment-${(data.candidate||'candidate').replace(/\s+/g,'_')}-${data.date||'undated'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function printManualSheet() {
  window.print();
}



