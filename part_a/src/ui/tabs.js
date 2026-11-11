// ===================== TAB 1 SUB-TAB: OVERVIEW =====================

function renderOverviewSubTab(model, issues, score) {
  const catLabels = {
    Completeness: '📋 Completeness', CrossLayer: '🔗 Cross-Layer Alignment',
    ArchiMate: '🏛 ArchiMate 3.2', SebTreb: '🎨 SebTreb Style', Assessment: '📝 Assessment'
  };

  let html = '';
  Object.entries(score.byCategory).forEach(([cat, catScore]) => {
    const catIssues = issues.filter(i => i.category === cat);
    const mustC = catIssues.filter(i => i.severity === 'MUST').length;
    const shouldC = catIssues.filter(i => i.severity === 'SHOULD').length;
    const fillColor = catScore >= 70 ? 'var(--green)' : catScore >= 40 ? 'var(--amber)' : 'var(--red)';

    html += `<div class="ov-card">
      <div class="ov-card-header">
        <span class="ov-cat-name">${catLabels[cat] || cat}</span>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:20px;font-weight:700;font-family:'DM Mono',monospace;color:${fillColor}">${catScore}%</span>
          <span class="rag ${getRagClass(catScore)}">${getRagLabel(catScore)}</span>
        </div>
      </div>
      <div class="ov-progress-bg">
        <div class="ov-progress-fill" style="width:${catScore}%;background:${fillColor}"></div>
      </div>
      <div style="display:flex;gap:12px;margin-bottom:${catIssues.length?'10px':'0'};font-size:12px;color:var(--text-faint)">
        ${mustC > 0 ? `<span class="rag rag-red" style="font-size:10px">${mustC} MUST</span>` : ''}
        ${shouldC > 0 ? `<span class="rag rag-amber" style="font-size:10px">${shouldC} SHOULD</span>` : ''}
        ${catIssues.length === 0 ? '<span style="color:var(--green);font-size:12px">✓ No issues found</span>' : ''}
      </div>
      ${catIssues.slice(0,3).map(i => `
        <div class="ov-issue-row">
          <span class="rule-id">${i.ruleId}</span>
          <span class="rag ${getSeverityRag(i.severity)}" style="font-size:10px;padding:1px 7px">${i.severity}</span>
          <span>${escHtml(i.description)}</span>
        </div>`).join('')}
      ${catIssues.length > 3 ? `<div style="font-size:11px;color:var(--text-faint);margin-top:4px">…and ${catIssues.length - 3} more issues</div>` : ''}
    </div>`;
  });

  document.getElementById('auto-overview').innerHTML = html;
}

// ===================== TAB 1 SUB-TAB: BY VIEW TYPE =====================

function renderByViewSubTab(model, issues) {
  const viewIssueMap = {};
  model.views.forEach(v => { viewIssueMap[v.id] = { name: v.name, issues: [] }; });
  viewIssueMap['model'] = { name: 'Model Level', issues: [] };
  issues.forEach(i => {
    if (viewIssueMap[i.viewId]) viewIssueMap[i.viewId].issues.push(i);
  });

  let html = `<div style="margin-bottom:16px;font-size:13px;color:var(--text-dim)">
    Issues grouped by ArchiMate view — click any row to expand.</div>`;

  Object.entries(viewIssueMap).forEach(([vid, vdata]) => {
    const vis = vdata.issues;
    const mustC = vis.filter(i => i.severity === 'MUST').length;
    const topRag = mustC > 0 ? 'rag-red' : vis.length > 0 ? 'rag-amber' : 'rag-green';
    const topLabel = mustC > 0 ? 'RED' : vis.length > 0 ? 'AMBER' : 'GREEN';

    html += `<div class="dr-view-block">
      <div class="dr-view-hdr" onclick="toggleDrBlock(this)">
        <span class="dr-view-name">${escHtml(vdata.name)}</span>
        <div style="display:flex;align-items:center;gap:10px">
          <span style="font-size:11.5px;color:rgba(255,255,255,0.6)">${vis.length} issue${vis.length!==1?'s':''}</span>
          <span class="rag ${topRag}" style="font-size:10px">${topLabel}</span>
          <span class="chevron" style="color:rgba(255,255,255,0.5)">▶</span>
        </div>
      </div>
      <div class="dr-block-body" style="display:none">`;

    if (vis.length === 0) {
      html += `<div style="padding:14px 16px;color:var(--green);font-size:13px">✓ No issues found in this view</div>`;
    } else {
      html += `<table class="dr-issue-table">
        <thead><tr><th>Rule ID</th><th>Category</th><th>Severity</th><th>Description</th><th>Detail</th></tr></thead>
        <tbody>`;
      vis.sort((a,b) => a.severity==='MUST'?-1:1).forEach(i => {
        html += `<tr>
          <td><span class="rule-id">${i.ruleId}</span></td>
          <td><span class="cat-badge ${getCatBadgeClass(i.category)}">${i.category}</span></td>
          <td><span class="rag ${getSeverityRag(i.severity)}" style="font-size:10px">${i.severity}</span></td>
          <td>${escHtml(i.description)}</td>
          <td style="color:var(--text-dim);font-size:11.5px">${escHtml(i.detail)}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
    }
    html += `</div></div>`;
  });

  document.getElementById('auto-byview').innerHTML = html;
}

// ===================== TAB 1 SUB-TAB: BY ISSUE TYPE =====================

function renderByIssueSubTab(model, issues) {
  // Group by ruleId
  const byRule = {};
  issues.forEach(i => {
    if (!byRule[i.ruleId]) byRule[i.ruleId] = { ...i, views: new Set(), count: 0 };
    byRule[i.ruleId].views.add(i.viewName);
    byRule[i.ruleId].count++;
  });

  // Group rules by category
  const byCat = {};
  Object.values(byRule).forEach(r => {
    if (!byCat[r.category]) byCat[r.category] = [];
    byCat[r.category].push(r);
  });

  const catLabels = {
    Completeness:'📋 Completeness', CrossLayer:'🔗 Cross-Layer',
    ArchiMate:'🏛 ArchiMate 3.2', SebTreb:'🎨 SebTreb Style', Assessment:'📝 Assessment'
  };

  let html = '';
  if (Object.keys(byCat).length === 0) {
    html = `<div class="empty"><div class="icon">✅</div><div>No issues found!</div></div>`;
  } else {
    ['Completeness','CrossLayer','ArchiMate','SebTreb','Assessment'].forEach(cat => {
      const rules = byCat[cat];
      if (!rules) return;
      html += `<div style="margin-bottom:20px">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;
             color:var(--text-faint);margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid var(--border)">
          ${catLabels[cat]||cat}
        </div>`;
      rules.sort((a,b)=>a.severity==='MUST'?-1:1).forEach(r => {
        const viewList = [...r.views].join(', ') || '—';
        html += `<div class="ov-card" style="margin-bottom:10px">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
            <div style="flex:1">
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px">
                <span class="rule-id">${r.ruleId}</span>
                <span class="rag ${getSeverityRag(r.severity)}" style="font-size:10px">${r.severity}</span>
                <span class="cat-badge ${getCatBadgeClass(r.category)}">${r.category}</span>
                ${r.count > 1 ? `<span style="font-size:11px;color:var(--text-faint)">${r.count} occurrences</span>` : ''}
              </div>
              <div style="font-weight:600;font-size:13px;margin-bottom:4px">${escHtml(r.description)}</div>
              <div style="font-size:12px;color:var(--text-dim)">${escHtml(r.detail)}</div>
            </div>
          </div>
          <div style="margin-top:8px;font-size:11.5px;color:var(--text-faint)">
            <strong>Views affected:</strong>
            ${[...r.views].map(v => `<span class="view-tag">${escHtml(v)}</span>`).join('')}
          </div>
        </div>`;
      });
      html += `</div>`;
    });
  }

  document.getElementById('auto-byissue').innerHTML = html;
}

// ===================== TAB 3: DETAILED REPORT =====================

function renderDetailedReport(model, issues, score) {
  const mustC  = issues.filter(i => i.severity === 'MUST').length;
  const shouldC = issues.filter(i => i.severity === 'SHOULD').length;
  const totalViews = model.views.length;
  const totalEls = Object.keys(model.elements).length;
  const totalRels = Object.keys(model.relationships).length;

  let html = `
    <!-- Model stats strip -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:24px">
      ${[
        ['AI Score', score.total+'%', getRagClass(score.total)],
        ['Views', totalViews, 'blue'],
        ['Elements', totalEls, 'blue'],
        ['Relationships', totalRels, 'blue'],
        ['Critical Issues', mustC, mustC > 0 ? 'red' : 'green'],
        ['Warnings', shouldC, shouldC > 0 ? 'amber' : 'green'],
      ].map(([label, val, cls]) => `
        <div class="score-card ${cls}" style="padding:14px">
          <div class="label">${label}</div>
          <div class="value" style="font-size:24px">${val}</div>
        </div>`).join('')}
    </div>

    <!-- Category summary table -->
    <div class="panel" style="margin-bottom:20px">
      <div class="panel-header" style="cursor:default">
        <span class="panel-title">Category Score Breakdown</span>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:13px">
        <thead>
          <tr style="background:var(--navy)">
            <th style="padding:10px 16px;text-align:left;color:#fff;font-size:12px">Category</th>
            <th style="padding:10px 16px;text-align:center;color:#fff;font-size:12px">Score</th>
            <th style="padding:10px 16px;text-align:center;color:#fff;font-size:12px">RAG</th>
            <th style="padding:10px 16px;text-align:center;color:#fff;font-size:12px">MUST Issues</th>
            <th style="padding:10px 16px;text-align:center;color:#fff;font-size:12px">SHOULD Issues</th>
            <th style="padding:10px 16px;text-align:left;color:#fff;font-size:12px">Weight</th>
          </tr>
        </thead>
        <tbody>`;

  const catWeights = {Completeness:30,CrossLayer:25,ArchiMate:25,SebTreb:15,Assessment:5};
  const catLabels2 = {Completeness:'📋 Completeness',CrossLayer:'🔗 Cross-Layer',ArchiMate:'🏛 ArchiMate 3.2',SebTreb:'🎨 SebTreb Style',Assessment:'📝 Assessment'};
  Object.entries(score.byCategory).forEach(([cat, cs], idx) => {
    const catIssues = issues.filter(i => i.category === cat);
    const mc = catIssues.filter(i => i.severity === 'MUST').length;
    const sc2 = catIssues.filter(i => i.severity === 'SHOULD').length;
    html += `<tr style="background:${idx%2===0?'#fff':'var(--surface2)'}">
      <td style="padding:9px 16px">
        <span class="cat-badge ${getCatBadgeClass(cat)}">${catLabels2[cat]||cat}</span>
      </td>
      <td style="padding:9px 16px;text-align:center;font-family:'DM Mono',monospace;font-weight:700;color:${getRagClass(cs)==='rag-green'?'var(--green)':getRagClass(cs)==='rag-amber'?'var(--amber)':'var(--red)'}">${cs}%</td>
      <td style="padding:9px 16px;text-align:center"><span class="rag ${getRagClass(cs)}" style="font-size:10px">${getRagLabel(cs)}</span></td>
      <td style="padding:9px 16px;text-align:center;font-weight:600;color:${mc>0?'var(--red)':'var(--text-faint)'}">${mc||'—'}</td>
      <td style="padding:9px 16px;text-align:center;font-weight:600;color:${sc2>0?'var(--amber)':'var(--text-faint)'}">${sc2||'—'}</td>
      <td style="padding:9px 16px;color:var(--text-dim)">${catWeights[cat]}%</td>
    </tr>`;
  });
  html += `</tbody></table></div>

  <!-- View-by-view issue breakdown -->
  <div style="font-size:13px;font-weight:600;color:var(--text);margin-bottom:12px">
    View-by-View Issue Breakdown
  </div>`;

  const viewIssueMap = {};
  model.views.forEach(v => { viewIssueMap[v.id] = { name: v.name, nodes: v.nodes.length, connections: v.connections.length, issues: [] }; });
  viewIssueMap['model'] = { name: 'Model Level', nodes: 0, connections: 0, issues: [] };
  issues.forEach(i => { if (viewIssueMap[i.viewId]) viewIssueMap[i.viewId].issues.push(i); });

  Object.entries(viewIssueMap).forEach(([vid, vdata]) => {
    const vis = vdata.issues;
    const mc2 = vis.filter(i => i.severity === 'MUST').length;
    const sc3 = vis.filter(i => i.severity === 'SHOULD').length;
    const accentColor = mc2 > 0 ? 'var(--red)' : vis.length > 0 ? 'var(--amber)' : 'var(--green)';

    html += `<div class="dr-view-block">
      <div class="dr-view-hdr" onclick="toggleDrBlock(this)" style="border-left:4px solid ${accentColor}">
        <div>
          <span class="dr-view-name">${escHtml(vdata.name)}</span>
          ${vid !== 'model' ? `<span style="font-size:11px;color:rgba(255,255,255,0.5);margin-left:10px">${vdata.nodes} elements · ${vdata.connections} connections</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${mc2 > 0 ? `<span class="rag rag-red" style="font-size:10px">${mc2} MUST</span>` : ''}
          ${sc3 > 0 ? `<span class="rag rag-amber" style="font-size:10px">${sc3} SHOULD</span>` : ''}
          ${vis.length === 0 ? `<span class="rag rag-green" style="font-size:10px">PASS</span>` : ''}
          <span class="chevron" style="color:rgba(255,255,255,0.5)">▶</span>
        </div>
      </div>
      <div class="dr-block-body" style="display:none">`;

    if (vis.length === 0) {
      html += `<div style="padding:14px 16px;color:var(--green);font-size:13px">✓ All checks passed for this view</div>`;
    } else {
      // SebTreb violations for this view
      const sebIssues = vis.filter(i => i.category === 'SebTreb');
      const clIssues = vis.filter(i => i.category === 'CrossLayer');
      const amIssues = vis.filter(i => i.category === 'ArchiMate');
      const coIssues = vis.filter(i => i.category === 'Completeness' || i.category === 'Assessment');

      html += `<table class="dr-issue-table"><thead>
        <tr><th>Rule</th><th>Category</th><th>Sev.</th><th>Violation</th><th>Detail</th></tr>
      </thead><tbody>`;
      vis.sort((a,b)=>a.severity==='MUST'?-1:1).forEach(i => {
        html += `<tr>
          <td><span class="rule-id">${i.ruleId}</span></td>
          <td><span class="cat-badge ${getCatBadgeClass(i.category)}">${i.category}</span></td>
          <td><span class="rag ${getSeverityRag(i.severity)}" style="font-size:10px">${i.severity}</span></td>
          <td style="font-size:12.5px">${escHtml(i.description)}</td>
          <td style="font-size:11.5px;color:var(--text-dim)">${escHtml(i.detail)}</td>
        </tr>`;
      });
      html += `</tbody></table>`;
    }
    html += `</div></div>`;
  });

  document.getElementById('detailed-report-content').innerHTML = html;
}

// ===================== TAB 4: VIEW ANALYSIS =====================

function renderViewAnalysis(model, issues) {
  const viewIssueMap = {};
  model.views.forEach(v => { viewIssueMap[v.id] = []; });
  issues.forEach(i => { if (viewIssueMap[i.viewId]) viewIssueMap[i.viewId].push(i); });

  // Layer distribution
  const layerDist = {};
  Object.values(model.elements).forEach(el => {
    const layer = el.layer || 'Unknown';
    layerDist[layer] = (layerDist[layer] || 0) + 1;
  });

  // Layer colours
  const layerColors = {
    Business:'#1e56c8', Application:'#7c3aed', Technology:'#0f9956',
    Motivation:'#d97706', Strategy:'#db2777', Unknown:'#9aa3bc'
  };

  let html = `
    <!-- Model layer distribution -->
    <div style="margin-bottom:24px">
      <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text)">Element Distribution by Layer</div>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        ${Object.entries(layerDist).map(([layer, count]) => {
          const total = Object.keys(model.elements).length;
          const pct = Math.round(count/total*100);
          const col = layerColors[layer] || '#9aa3bc';
          return `<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;
                              padding:14px 18px;min-width:130px;border-top:3px solid ${col}">
            <div style="font-size:11px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.6px;margin-bottom:4px">${layer}</div>
            <div style="font-size:24px;font-weight:700;font-family:'DM Mono',monospace;color:${col}">${count}</div>
            <div style="font-size:11px;color:var(--text-faint)">${pct}% of elements</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Per-view cards -->
    <div style="font-size:13px;font-weight:600;margin-bottom:12px;color:var(--text)">View-by-View Analysis</div>
    <div class="va-grid">`;

  model.views.forEach(view => {
    const vis = viewIssueMap[view.id] || [];
    const mc = vis.filter(i => i.severity === 'MUST').length;
    const sc2 = vis.filter(i => i.severity === 'SHOULD').length;
    const accentColor = mc > 0 ? 'var(--red)' : vis.length > 0 ? 'var(--amber)' : 'var(--green)';

    // Determine view type
    const n = view.name.toLowerCase();
    const viewType = n.includes('contextual') ? 'Contextual'
      : n.includes('conceptual') ? 'Conceptual'
      : n.includes('logical') ? 'Logical'
      : n.includes('physical') ? 'Physical'
      : n.includes('tech') || n.includes('deploy') || n.includes('infra') ? 'Technology'
      : n.includes('motivat') || n.includes('goal') || n.includes('driver') ? 'Motivation'
      : n.includes('cross') ? 'Cross-Layer'
      : n.includes('component') ? 'Component'
      : n.includes('data') || n.includes('model') ? 'Data'
      : 'Other';

    // Layer coverage for this view
    const viewLayers = new Set(
      view.nodes.map(nd => model.elements[nd.elemRef]?.layer).filter(Boolean)
    );

    html += `<div class="va-card">
      <div class="va-card-header" style="border-left:4px solid ${accentColor}">
        <span class="va-card-title">${escHtml(view.name)}</span>
        <span class="rag ${mc>0?'rag-red':vis.length>0?'rag-amber':'rag-green'}" style="font-size:10px">${mc>0?'RED':vis.length>0?'AMBER':'GREEN'}</span>
      </div>
      <div class="va-card-body">
        <div class="va-stat-row"><span class="va-stat-label">View Type</span><span class="va-stat-val">${viewType}</span></div>
        <div class="va-stat-row"><span class="va-stat-label">Elements</span><span class="va-stat-val">${view.nodes.length}</span></div>
        <div class="va-stat-row"><span class="va-stat-label">Connections</span><span class="va-stat-val">${view.connections.length}</span></div>
        <div class="va-stat-row"><span class="va-stat-label">Layers Present</span><span class="va-stat-val" style="font-size:11px">${[...viewLayers].join(', ') || '—'}</span></div>
        <div class="va-stat-row" style="border:none">
          <span class="va-stat-label">Issues</span>
          <span>
            ${mc > 0 ? `<span class="va-issue-pill va-pill-red">${mc} MUST</span>` : ''}
            ${sc2 > 0 ? `<span class="va-issue-pill va-pill-amber">${sc2} SHOULD</span>` : ''}
            ${vis.length === 0 ? `<span style="font-size:11.5px;color:var(--green);font-weight:600">✓ Pass</span>` : ''}
          </span>
        </div>
        ${vis.length > 0 ? `<div class="va-issue-list" style="margin-top:8px;padding-top:8px;border-top:1px solid var(--border)">
          ${vis.slice(0,3).map(i => `<div style="font-size:11.5px;color:var(--text-dim);display:flex;gap:6px;padding:2px 0;align-items:flex-start">
            <span class="rule-id" style="flex-shrink:0">${i.ruleId}</span>
            <span>${escHtml(i.description)}</span>
          </div>`).join('')}
          ${vis.length > 3 ? `<div style="font-size:11px;color:var(--text-faint);margin-top:3px">…+${vis.length-3} more</div>` : ''}
        </div>` : ''}
      </div>
    </div>`;
  });

  html += `</div>`;
  document.getElementById('view-analysis-content').innerHTML = html;
}

