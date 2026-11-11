function getRagClass(score) {
  if (score >= 70) return 'rag-green';
  if (score >= 40) return 'rag-amber';
  return 'rag-red';
}

function getRagLabel(score) {
  if (score >= 70) return 'GREEN';
  if (score >= 40) return 'AMBER';
  return 'RED';
}

function getCardClass(score) {
  if (score >= 70) return 'green';
  if (score >= 40) return 'amber';
  return 'red';
}

function getSeverityRag(severity) {
  if (severity === 'MUST') return 'rag-red';
  if (severity === 'SHOULD') return 'rag-amber';
  if (severity === 'MAY') return 'rag-green';
  return 'rag-green';
}

function getCatBadgeClass(cat) {
  const map = {
    SebTreb: 'cat-sebtreb',
    ArchiMate: 'cat-archimate',
    CrossLayer: 'cat-crosslayer',
    Completeness: 'cat-completeness',
    Assessment: 'cat-assessment',
  };
  return map[cat] || 'cat-archimate';
}

function renderSummary(model, issues, score) {
  const mustIssues = issues.filter(i => i.severity === 'MUST').length;
  const shouldIssues = issues.filter(i => i.severity === 'SHOULD').length;
  const infoIssues = issues.filter(i => i.severity === 'INFO').length;
  const totalViews = model.views.length;
  const totalElements = Object.keys(model.elements).length;
  const totalRels = Object.keys(model.relationships).length;

  const cardClass = getCardClass(score.total);
  const ragClass = getRagClass(score.total);

  let html = `
    <div class="overall-score">
      <svg class="score-ring" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="42" fill="none" stroke="#dde3ef" stroke-width="8"/>
        <circle cx="50" cy="50" r="42" fill="none"
          stroke="${score.total >= 70 ? 'var(--green)' : score.total >= 40 ? 'var(--amber)' : 'var(--red)'}"
          stroke-width="8"
          stroke-dasharray="${2 * Math.PI * 42}"
          stroke-dashoffset="${2 * Math.PI * 42 * (1 - score.total/100)}"
          stroke-linecap="round"
          transform="rotate(-90 50 50)"/>
        <text x="50" y="50" text-anchor="middle" dominant-baseline="central"
          fill="${score.total >= 70 ? 'var(--green)' : score.total >= 40 ? 'var(--amber)' : 'var(--red)'}"
          font-size="20" font-family="DM Mono" font-weight="700">${score.total}%</text>
      </svg>
      <div style="flex:1">
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:var(--text-dim);margin-bottom:6px">Overall Assessment Score</div>
        <div style="font-size:28px;font-weight:700;margin-bottom:4px">${model.modelName}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">
          <span class="rag ${ragClass}">${getRagLabel(score.total)}</span>
          <span style="font-size:12px;color:var(--text-dim)">${mustIssues} critical · ${shouldIssues} warnings · ${infoIssues} info</span>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;flex-shrink:0">
        <div style="text-align:center;padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
          <div style="font-size:22px;font-weight:700;font-family:'DM Mono'">${totalViews}</div>
          <div style="font-size:11px;color:var(--text-dim)">Views</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
          <div style="font-size:22px;font-weight:700;font-family:'DM Mono'">${totalElements}</div>
          <div style="font-size:11px;color:var(--text-dim)">Elements</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
          <div style="font-size:22px;font-weight:700;font-family:'DM Mono'">${totalRels}</div>
          <div style="font-size:11px;color:var(--text-dim)">Relationships</div>
        </div>
        <div style="text-align:center;padding:12px;background:var(--surface2);border-radius:8px;border:1px solid var(--border)">
          <div style="font-size:22px;font-weight:700;font-family:'DM Mono'">${issues.length}</div>
          <div style="font-size:11px;color:var(--text-dim)">Issues</div>
        </div>
      </div>
    </div>

    <div class="score-grid">
  `;

  const catLabels = {
    Completeness: '📋 Completeness',
    CrossLayer: '🔗 Cross-Layer',
    ArchiMate: '🏛 ArchiMate',
    SebTreb: '🎨 SebTreb Style',
    Assessment: '📝 Assessment'
  };

  Object.entries(score.byCategory).forEach(([cat, catScore]) => {
    const catClass = getCardClass(catScore);
    html += `
      <div class="score-card ${catClass}">
        <div class="label">${catLabels[cat] || cat}</div>
        <div class="value">${catScore}%</div>
        <div class="sub">
          <span class="rag ${getRagClass(catScore)}">${getRagLabel(catScore)}</span>
        </div>
      </div>
    `;
  });

  html += `</div>`;

  document.getElementById('summary-section').innerHTML = html;
}

function renderViewTab(model, issues) {
  const viewIssueMap = {};
  model.views.forEach(v => { viewIssueMap[v.id] = []; });
  viewIssueMap['model'] = [];
  issues.forEach(issue => {
    if (!viewIssueMap[issue.viewId]) viewIssueMap[issue.viewId] = [];
    viewIssueMap[issue.viewId].push(issue);
  });

  let html = '';

  // Model-level issues first
  const modelIssues = viewIssueMap['model'] || [];
  if (modelIssues.length > 0) {
    html += `<div class="view-card">
      <div class="view-card-header" onclick="togglePanel(this)">
        <span style="font-size:16px">🏗</span>
        <span class="view-name">Model Level</span>
        <div class="view-stats">
          ${getIssueBadges(modelIssues)}
        </div>
        <span class="chevron">▶</span>
      </div>
      <div class="view-card-body">
        ${renderIssueRows(modelIssues)}
      </div>
    </div>`;
  }

  model.views.forEach(view => {
    const viewIssues = viewIssueMap[view.id] || [];
    const mustCount = viewIssues.filter(i => i.severity === 'MUST').length;
    const topRag = mustCount > 0 ? 'red' : viewIssues.length > 0 ? 'amber' : 'green';

    html += `<div class="view-card">
      <div class="view-card-header" onclick="togglePanel(this)">
        <span class="rag ${topRag === 'green' ? 'rag-green' : topRag === 'amber' ? 'rag-amber' : 'rag-red'}" style="min-width:60px"></span>
        <span class="view-name">${escHtml(view.name)}</span>
        <div class="view-stats">
          <span class="count-badge">${view.nodes.length} elements</span>
          ${getIssueBadges(viewIssues)}
        </div>
        <span class="chevron">▶</span>
      </div>
      <div class="view-card-body ${viewIssues.length === 0 ? '' : ''}">
        ${viewIssues.length === 0
          ? `<div style="padding:16px 20px;color:var(--green);font-size:13px">✓ No issues found in this view</div>`
          : renderIssueRows(viewIssues)
        }
      </div>
    </div>`;
  });

  document.getElementById('view-tab').innerHTML = html;
}

function getIssueBadges(issues) {
  const mustCount = issues.filter(i => i.severity === 'MUST').length;
  const shouldCount = issues.filter(i => i.severity === 'SHOULD').length;
  let html = '';
  if (mustCount > 0) html += `<span class="rag rag-red">${mustCount} MUST</span>`;
  if (shouldCount > 0) html += `<span class="rag rag-amber">${shouldCount} SHOULD</span>`;
  if (mustCount === 0 && shouldCount === 0 && issues.length === 0) html += `<span class="rag rag-green">PASS</span>`;
  return html;
}

function renderIssueRows(issues) {
  if (!issues.length) return '';
  return issues.map(issue => `
    <div class="issue-block">
      <span class="cat-badge ${getCatBadgeClass(issue.category)}">${issue.category}</span>
      <span>
        <span class="rule-id">${issue.ruleId}</span>
        <span class="rag ${getSeverityRag(issue.severity)}" style="margin-left:6px">${issue.severity}</span>
      </span>
      <div>
        <div style="font-weight:500;margin-bottom:3px">${escHtml(issue.description)}</div>
        <div style="color:var(--text-dim);font-size:12px">${escHtml(issue.detail)}</div>
      </div>
    </div>
  `).join('');
}

function renderIssueTab(model, issues) {
  // Group by rule/category
  const catGroups = {};
  issues.forEach(issue => {
    const cat = issue.category;
    if (!catGroups[cat]) catGroups[cat] = [];
    catGroups[cat].push(issue);
  });

  const catOrder = ['Completeness', 'CrossLayer', 'ArchiMate', 'SebTreb', 'Assessment'];
  const catLabels = {
    Completeness: '📋 Completeness',
    CrossLayer: '🔗 Cross-Layer Alignment',
    ArchiMate: '🏛 ArchiMate Specification',
    SebTreb: '🎨 SebTreb Style Guidelines',
    Assessment: '📝 Assessment Criteria'
  };

  let html = '';

  catOrder.forEach(cat => {
    const catIssues = catGroups[cat];
    if (!catIssues || catIssues.length === 0) return;

    // Group by rule within category
    const ruleGroups = {};
    catIssues.forEach(issue => {
      if (!ruleGroups[issue.ruleId]) ruleGroups[issue.ruleId] = [];
      ruleGroups[issue.ruleId].push(issue);
    });

    html += `<div class="panel">
      <div class="panel-header" onclick="togglePanel(this)">
        <span class="cat-badge ${getCatBadgeClass(cat)}">${cat}</span>
        <span class="panel-title">${catLabels[cat]}</span>
        ${getIssueBadges(catIssues)}
        <span class="chevron">▶</span>
      </div>
      <div class="panel-body">
        <div class="check-row header">
          <span></span><span>Rule</span><span>Description</span><span>Affected Views</span><span>Severity</span>
        </div>`;

    Object.entries(ruleGroups).forEach(([ruleId, ruleIssues]) => {
      const firstIssue = ruleIssues[0];
      const viewsAffected = [...new Set(ruleIssues.map(i => i.viewName))];
      html += `<div class="check-row">
        <span class="rag ${getSeverityRag(firstIssue.severity)}" style="font-size:8px;padding:2px 6px"></span>
        <span class="rule-id">${ruleId}</span>
        <div class="check-desc">
          <div style="font-weight:500;color:var(--text);margin-bottom:4px">${escHtml(firstIssue.description)}</div>
          ${ruleIssues.map(i => `<div class="issue-item" style="margin:2px 0;font-size:11px;display:flex;gap:6px;align-items:flex-start"><span style="color:var(--text-faint)">↳</span><span style="color:var(--text-dim)">${escHtml(i.detail)}</span></div>`).join('')}
        </div>
        <div>
          ${viewsAffected.map(v => `<span class="view-tag">${escHtml(v)}</span>`).join('')}
        </div>
        <span class="rag ${getSeverityRag(firstIssue.severity)}">${firstIssue.severity}</span>
      </div>`;
    });

    html += `</div></div>`;
  });

  if (!html) html = `<div class="empty"><div class="icon">✅</div><div>No issues found!</div></div>`;

  document.getElementById('issue-tab').innerHTML = html;
}

function renderRulesTab(model, issues) {
  // Complete rule checklist with pass/fail/warn status
  const issuesByRule = {};
  issues.forEach(i => {
    if (!issuesByRule[i.ruleId]) issuesByRule[i.ruleId] = [];
    issuesByRule[i.ruleId].push(i);
  });

  const ALL_RULES = [
    // SebTreb
    { id: 'elm-001', cat: 'SebTreb', sev: 'MUST', desc: 'Elements must use rectangle notation' },
    { id: 'elm-002', cat: 'SebTreb', sev: 'SHOULD', desc: 'Elements should be the same size' },
    { id: 'elm-003', cat: 'SebTreb', sev: 'SHOULD', desc: 'Elements should align horizontally & vertically' },
    { id: 'elm-004', cat: 'SebTreb', sev: 'MUST', desc: 'Elements must be resized to align to grid on all four sides' },
    { id: 'elm-005', cat: 'SebTreb', sev: 'SHOULD', desc: 'Spacing between elements should be consistent' },
    { id: 'elm-006', cat: 'SebTreb', sev: 'MUST', desc: 'Spacing between nested elements must be consistent' },
    { id: 'elm-007', cat: 'SebTreb', sev: 'MUST', desc: 'Data entity elements must be named in the singular' },
    { id: 'elm-008', cat: 'SebTreb', sev: 'MUST', desc: 'Labels on non-parent elements must be centred' },
    { id: 'elm-009', cat: 'SebTreb', sev: 'SHOULD', desc: 'Labels on parent elements should be at top, centred' },
    { id: 'cnn-001', cat: 'SebTreb', sev: 'MUST', desc: 'Connectors must not run diagonally' },
    { id: 'cnn-002', cat: 'SebTreb', sev: 'SHOULD', desc: 'Connectors should not cross over each other' },
    { id: 'cnn-003', cat: 'SebTreb', sev: 'MUST', desc: 'Connectors must have minimum number of bends' },
    { id: 'cnn-004', cat: 'SebTreb', sev: 'MUST', desc: 'Connectors must run parallel to element edges' },
    { id: 'cnn-005', cat: 'SebTreb', sev: 'SHOULD', desc: 'Labels should be on horizontal part of connector' },
    { id: 'cnn-006', cat: 'SebTreb', sev: 'MUST', desc: 'Vertical connector labels must be rotated 90° anti-clockwise' },
    { id: 'cnn-007', cat: 'SebTreb', sev: 'SHOULD', desc: 'Connector labels should not be on the corner' },
    { id: 'cnn-008', cat: 'SebTreb', sev: 'SHOULD', desc: 'Data view association connectors should show multiplicity' },
    { id: 'cnn-009', cat: 'SebTreb', sev: 'MUST', desc: 'Data view association labels must be meaningful' },
    { id: 'cnn-010', cat: 'SebTreb', sev: 'MUST', desc: 'Single connector must attach to centre of source element' },
    { id: 'cnn-011', cat: 'SebTreb', sev: 'MUST', desc: 'Single connector must attach to centre of target element' },
    { id: 'cnn-012', cat: 'SebTreb', sev: 'MUST', desc: 'Multiple connectors from same side must be evenly spaced' },
    { id: 'cnn-013', cat: 'SebTreb', sev: 'MUST', desc: 'Multiple connectors to same side must be evenly spaced' },
    { id: 'vws-001', cat: 'SebTreb', sev: 'MUST', desc: 'Views must be named to indicate contextual/conceptual/logical/physical type' },
    { id: 'msc-001', cat: 'SebTreb', sev: 'SHOULD', desc: 'Note elements should be sized so actions do not wrap' },
    { id: 'msc-002', cat: 'SebTreb', sev: 'SHOULD', desc: 'Grouping element should be used to reduce visual clutter' },
    { id: 'msc-003', cat: 'SebTreb', sev: 'MUST', desc: 'Grouped concepts must be nested — not connected by aggregation' },
    { id: 'msc-004', cat: 'SebTreb', sev: 'MUST', desc: 'Grouping must not be used when a more appropriate element exists' },
    // ArchiMate
    { id: 'ARC-STR-001', cat: 'ArchiMate', sev: 'MUST', desc: 'Composition must be within same layer' },
    { id: 'ARC-REL-001', cat: 'ArchiMate', sev: 'MUST', desc: 'Service must not realize Component (direction reversed)' },
    { id: 'ARC-USE-001', cat: 'ArchiMate', sev: 'SHOULD', desc: 'Motivation view should contain motivation elements' },
    { id: 'ARC-USE-002', cat: 'ArchiMate', sev: 'MUST', desc: 'Technology view must contain technology elements' },
    { id: 'ARC-USE-003', cat: 'ArchiMate', sev: 'MUST', desc: 'Cross-layer view must span at least 2 layers' },
    // Cross-layer
    { id: 'ARC-CL-001', cat: 'CrossLayer', sev: 'MUST', desc: 'Cross-layer relationships must use valid types per ArchiMate 3.2' },
    { id: 'ARC-CL-002', cat: 'CrossLayer', sev: 'SHOULD', desc: 'Business→Technology realization should not skip Application layer' },
    { id: 'ARC-CL-003', cat: 'CrossLayer', sev: 'SHOULD', desc: 'Technology should not directly serve Business (mediate via Application)' },
    { id: 'ARC-CL-004', cat: 'CrossLayer', sev: 'SHOULD', desc: 'BusinessService to ApplicationService should use Realization or Serving' },
    // Completeness
    { id: 'COMP-001', cat: 'Completeness', sev: 'MUST', desc: 'Minimum 6 views required' },
    { id: 'COMP-002', cat: 'Completeness', sev: 'MUST', desc: 'Contextual view required' },
    { id: 'COMP-003', cat: 'Completeness', sev: 'MUST', desc: 'Conceptual view required' },
    { id: 'COMP-004', cat: 'Completeness', sev: 'MUST', desc: 'Technology view required' },
    { id: 'COMP-005', cat: 'Completeness', sev: 'MUST', desc: 'Cross-layer view required' },
    { id: 'COMP-006', cat: 'Completeness', sev: 'SHOULD', desc: 'Motivation elements (Goals, Drivers, Requirements) should be present' },
    { id: 'COMP-007', cat: 'Completeness', sev: 'MUST', desc: 'Technology layer elements must be present' },
    { id: 'COMP-008', cat: 'Completeness', sev: 'SHOULD', desc: 'Business actors or roles should be present' },
    { id: 'COMP-009', cat: 'Assessment', sev: 'MUST', desc: 'Assessment requires cross-layer views (EA/SA criteria)' },
    { id: 'COMP-010', cat: 'Completeness', sev: 'INFO', desc: 'Orphaned elements not used in any view' },
  ];

  let html = `
    <div class="panel">
      <div class="legend">
        <span class="legend-item"><span class="rag rag-green">PASS</span> Rule satisfied</span>
        <span class="legend-item"><span class="rag rag-amber">WARN</span> Issue found (SHOULD)</span>
        <span class="legend-item"><span class="rag rag-red">FAIL</span> Issue found (MUST)</span>
        <span class="legend-item"><span class="rag rag-green">N/A</span> Not applicable</span>
      </div>
      <div class="check-row header">
        <span>Status</span><span>Rule ID</span><span>Description</span><span>Details</span><span>Severity</span>
      </div>
  `;

  const grouped = {};
  ALL_RULES.forEach(r => {
    if (!grouped[r.cat]) grouped[r.cat] = [];
    grouped[r.cat].push(r);
  });

  // Category headers within rules table
  const catOrder = ['Completeness','CrossLayer','ArchiMate','SebTreb','Assessment'];
  const catLabels = { Completeness:'📋 Completeness', CrossLayer:'🔗 Cross-Layer', ArchiMate:'🏛 ArchiMate 3.2', SebTreb:'🎨 SebTreb Style', Assessment:'📝 Assessment' };

  catOrder.forEach(cat => {
    const rules = grouped[cat] || [];
    html += `<div class="check-row" style="background:var(--surface3);padding:8px 20px;">
      <span></span>
      <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--text-dim);grid-column:2/-1">${catLabels[cat]}</span>
    </div>`;

    rules.forEach(rule => {
      const ruleIssues = issuesByRule[rule.id] || [];
      let status, statusClass;

      if (ruleIssues.length === 0) {
        // Check if it's applicable
        status = 'PASS';
        statusClass = 'rag-green';
      } else {
        if (rule.sev === 'MUST') {
          status = 'FAIL';
          statusClass = 'rag-red';
        } else {
          status = 'WARN';
          statusClass = 'rag-amber';
        }
      }

      const affectedViews = ruleIssues.length > 0
        ? [...new Set(ruleIssues.map(i => i.viewName))].map(v => `<span class="view-tag">${escHtml(v)}</span>`).join('')
        : '<span style="color:var(--text-faint);font-size:11px">—</span>';

      html += `<div class="check-row">
        <span class="rag ${statusClass}">${status}</span>
        <span class="rule-id">${rule.id}</span>
        <div class="check-desc">${escHtml(rule.desc)}</div>
        <div>${affectedViews}</div>
        <span class="rag ${getSeverityRag(rule.sev)}">${rule.sev}</span>
      </div>`;
    });
  });

  html += `</div>`;
  document.getElementById('auto-rules').innerHTML = html;
}

