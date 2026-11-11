// ===================== CHECKS ENGINE =====================

function runAllChecks(model) {
  const { elements, relationships, views } = model;

  // Build lookup: nodeId -> element
  const nodeElementMap = {};
  views.forEach(v => {
    v.nodes.forEach(n => {
      if (n.elemRef) nodeElementMap[n.nodeId] = elements[n.elemRef];
    });
  });

  const allIssues = []; // {ruleId, category, severity, viewId, viewName, description, detail}

  // ===================== SEBTREB CHECKS =====================

  views.forEach(view => {
    const vId = view.id;
    const vName = view.name;

    // --- vws-001: View naming ---
    const nameLower = vName.toLowerCase();
    const hasContextual = nameLower.includes('contextual');
    const hasConceptual = nameLower.includes('conceptual');
    const hasLogical = nameLower.includes('logical');
    const hasPhysical = nameLower.includes('physical');
    const hasMotivation = nameLower.includes('motivation') || nameLower.includes('driver') || nameLower.includes('goal');
    const hasComponent = nameLower.includes('component');
    const hasCrossLayer = nameLower.includes('cross') || nameLower.includes('layer');
    const hasTechnology = nameLower.includes('technology') || nameLower.includes('tech') || nameLower.includes('deployment') || nameLower.includes('infrastructure');
    if (!hasContextual && !hasConceptual && !hasLogical && !hasPhysical && !hasMotivation && !hasComponent && !hasCrossLayer && !hasTechnology) {
      allIssues.push({
        ruleId: 'vws-001', category: 'SebTreb', severity: 'MUST',
        viewId: vId, viewName: vName,
        description: 'View name must indicate type (contextual/conceptual/logical/physical/technology/etc)',
        detail: `View "${vName}" does not indicate diagram type.`
      });
    }

    // --- elm-001: Rectangle notation ---
    // Check via xsiType - non-rectangle indicator types
    view.nodes.forEach(node => {
      const el = elements[node.elemRef];
      if (!el) return;
      // Check if it's using a note type (these are allowed non-rectangles but we can flag)
      // In XML, if xsiType is 'Label' or 'Container' it's a note-like element
      if (node.xsiType === 'Label') {
        allIssues.push({
          ruleId: 'elm-001', category: 'SebTreb', severity: 'MUST',
          viewId: vId, viewName: vName,
          description: 'Elements MUST use rectangle notation',
          detail: `Element "${el.name}" (${el.type}) uses non-rectangle notation.`
        });
      }
    });

    // --- elm-002 & elm-003: Element sizing and alignment ---
    const plainNodes = view.nodes.filter(n => !n.parentNode && n.w > 0 && n.h > 0 && elements[n.elemRef]);
    if (plainNodes.length >= 3) {
      const sizes = plainNodes.map(n => ({ w: n.w, h: n.h }));
      const widths = sizes.map(s => s.w);
      const heights = sizes.map(s => s.h);
      const avgW = widths.reduce((a,b) => a+b, 0) / widths.length;
      const avgH = heights.reduce((a,b) => a+b, 0) / heights.length;
      const distinctW = new Set(widths.map(w => Math.round(w/10)*10)).size;
      const distinctH = new Set(heights.map(h => Math.round(h/10)*10)).size;
      const sizeVariance = distinctW + distinctH;
      if (sizeVariance > 6) {
        allIssues.push({
          ruleId: 'elm-002', category: 'SebTreb', severity: 'SHOULD',
          viewId: vId, viewName: vName,
          description: 'Elements SHOULD be the same size',
          detail: `${distinctW} distinct widths and ${distinctH} distinct heights found — high size variance.`
        });
      }

      // elm-003: horizontal/vertical alignment
      const xPositions = plainNodes.map(n => n.x);
      const yPositions = plainNodes.map(n => n.y);
      const uniqueX = new Set(xPositions.map(x => Math.round(x/20)*20)).size;
      const uniqueY = new Set(yPositions.map(y => Math.round(y/20)*20)).size;
      const totalNodes = plainNodes.length;
      if (uniqueX > totalNodes * 0.85 && uniqueY > totalNodes * 0.85) {
        allIssues.push({
          ruleId: 'elm-003', category: 'SebTreb', severity: 'SHOULD',
          viewId: vId, viewName: vName,
          description: 'Elements SHOULD align horizontally & vertically',
          detail: `Poor grid alignment detected: ${uniqueX} unique X positions, ${uniqueY} unique Y positions for ${totalNodes} elements.`
        });
      }
    }

    // --- elm-005: Consistent spacing ---
    if (plainNodes.length >= 2) {
      const sortedByX = [...plainNodes].sort((a,b) => a.x - b.x);
      const xGaps = [];
      for (let i=1; i<sortedByX.length; i++) {
        const gap = sortedByX[i].x - (sortedByX[i-1].x + sortedByX[i-1].w);
        if (gap > 0) xGaps.push(gap);
      }
      if (xGaps.length >= 2) {
        const minGap = Math.min(...xGaps);
        const maxGap = Math.max(...xGaps);
        if (maxGap > minGap * 3 && maxGap > 40) {
          allIssues.push({
            ruleId: 'elm-005', category: 'SebTreb', severity: 'SHOULD',
            viewId: vId, viewName: vName,
            description: 'Spacing between elements SHOULD be consistent',
            detail: `Inconsistent horizontal spacing — min gap: ${Math.round(minGap)}px, max gap: ${Math.round(maxGap)}px.`
          });
        }
      }
    }

    // --- elm-007: Data entities named in singular ---
    view.nodes.forEach(node => {
      const el = elements[node.elemRef];
      if (!el) return;
      if (DATA_TYPES.includes(el.type)) {
        const nameLower = el.name.toLowerCase();
        // Check for common plural patterns
        const pluralPatterns = [/s$/, /ies$/, /data$/i, /objects$/i];
        const isLikelyPlural = el.name.endsWith('s') && !el.name.endsWith('ss') &&
          !el.name.endsWith('Status') && !el.name.endsWith('Process') &&
          !el.name.endsWith('Access') && !el.name.endsWith('Class') &&
          el.name.length > 4;
        if (isLikelyPlural) {
          allIssues.push({
            ruleId: 'elm-007', category: 'SebTreb', severity: 'MUST',
            viewId: vId, viewName: vName,
            description: 'Data entity elements MUST be named in the singular',
            detail: `"${el.name}" (${el.type}) may be plural — data entities must use singular form.`
          });
        }
      }
    });

    // --- cnn-001: No diagonal connectors ---
    view.connections.forEach(conn => {
      conn.bends.forEach((bend, i) => {
        if (i === 0) return;
        const prev = conn.bends[i-1];
        const dx = Math.abs(bend.x - prev.x);
        const dy = Math.abs(bend.y - prev.y);
        if (dx > 5 && dy > 5) {
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          if (angle > 10 && angle < 80) {
            const srcEl = elements[nodeElementMap[conn.sourceRef]?.id || ''];
            allIssues.push({
              ruleId: 'cnn-001', category: 'SebTreb', severity: 'MUST',
              viewId: vId, viewName: vName,
              description: 'Connectors MUST NOT run diagonally',
              detail: `Diagonal connector detected (${Math.round(angle)}° angle) near bendpoint (${Math.round(bend.x)},${Math.round(bend.y)}).`
            });
          }
        }
      });
    });

    // --- cnn-003: Minimum bends ---
    view.connections.forEach(conn => {
      if (conn.bends.length > 4) {
        allIssues.push({
          ruleId: 'cnn-003', category: 'SebTreb', severity: 'MUST',
          viewId: vId, viewName: vName,
          description: 'Connectors MUST have minimum number of bends',
          detail: `Connector has ${conn.bends.length} bends — this is likely more than necessary.`
        });
      }
    });

    // --- msc-003: Explicit aggregation from grouped concepts MUST NOT be used ---
    const groupingIds = view.nodes
      .filter(n => elements[n.elemRef]?.type === 'Grouping')
      .map(n => n.nodeId);
    view.connections.forEach(conn => {
      const rel = relationships[conn.relRef];
      if (!rel) return;
      if (rel.type === 'Aggregation') {
        const targetNodeElem = elements[nodeElementMap[conn.targetRef]?.id || ''];
        if (targetNodeElem?.type === 'Grouping') {
          allIssues.push({
            ruleId: 'msc-003', category: 'SebTreb', severity: 'MUST',
            viewId: vId, viewName: vName,
            description: 'Explicit aggregation to Grouping elements MUST NOT be used — nest instead',
            detail: `Aggregation relationship found pointing to Grouping element "${targetNodeElem.name}".`
          });
        }
      }
    });

    // --- cnn-005/006: Connector label positioning (check if labels exist) ---
    view.connections.forEach(conn => {
      if (conn.label && conn.bends.length === 0) {
        // Single straight connector with label — acceptable
      } else if (conn.label && conn.bends.length > 0) {
        // Label on bent connector — check if it might be on corner
        // We flag this as advisory
      }
    });

    // --- cnn-008/009: Data association multiplicity ---
    const dataViewKeywords = ['data', 'information', 'model'];
    const isDataView = dataViewKeywords.some(k => vName.toLowerCase().includes(k));
    if (isDataView) {
      view.connections.forEach(conn => {
        const rel = relationships[conn.relRef];
        if (!rel) return;
        if (rel.type === 'Association') {
          if (!rel.name || rel.name.trim() === '') {
            allIssues.push({
              ruleId: 'cnn-009', category: 'SebTreb', severity: 'MUST',
              viewId: vId, viewName: vName,
              description: 'Association connectors in data views MUST have meaningful labels',
              detail: `Unlabelled Association connector between elements in data view "${vName}".`
            });
          }
        }
      });
    }
  });

  // ===================== ARCHIMATE 3.2 STRUCTURAL CHECKS =====================

  views.forEach(view => {
    const vId = view.id;
    const vName = view.name;

    view.connections.forEach(conn => {
      const rel = relationships[conn.relRef];
      if (!rel) return;

      const srcNodeEl = getNodeElement(conn.sourceRef, view, elements);
      const tgtNodeEl = getNodeElement(conn.targetRef, view, elements);
      if (!srcNodeEl || !tgtNodeEl) return;

      const srcLayer = srcNodeEl.layer;
      const tgtLayer = tgtNodeEl.layer;

      // --- Cross-layer relationship validity ---
      if (srcLayer !== tgtLayer && srcLayer !== 'Unknown' && tgtLayer !== 'Unknown' &&
          srcLayer !== 'Motivation' && tgtLayer !== 'Motivation') {
        const crossKey = `${srcLayer}->${tgtLayer}`;
        const validRels = VALID_CROSS_LAYER_RELS[crossKey];
        if (validRels && !validRels.includes(rel.type)) {
          allIssues.push({
            ruleId: 'ARC-CL-001', category: 'CrossLayer', severity: 'MUST',
            viewId: vId, viewName: vName,
            description: `Invalid cross-layer relationship (${srcLayer}→${tgtLayer})`,
            detail: `"${srcNodeEl.name}" → "${tgtNodeEl.name}" uses ${rel.type} which is not valid for ${srcLayer}→${tgtLayer} cross-layer. Valid: ${validRels.join(', ')}.`
          });
        }
      }

      // --- Layer-skipping check ---
      // Business should not directly realize Technology (must go via Application)
      if (srcLayer === 'Business' && tgtLayer === 'Technology' && rel.type === 'Realization') {
        allIssues.push({
          ruleId: 'ARC-CL-002', category: 'CrossLayer', severity: 'SHOULD',
          viewId: vId, viewName: vName,
          description: 'Business→Technology Realization skips Application layer',
          detail: `"${srcNodeEl.name}" (Business) directly realizes "${tgtNodeEl.name}" (Technology). Consider mediating via an Application element.`
        });
      }

      // --- Upward serving check ---
      // Technology serving Business is unusual — should be Application serving Business
      if (srcLayer === 'Technology' && tgtLayer === 'Business' && rel.type === 'Serving') {
        allIssues.push({
          ruleId: 'ARC-CL-003', category: 'CrossLayer', severity: 'SHOULD',
          viewId: vId, viewName: vName,
          description: 'Technology layer directly serving Business layer',
          detail: `"${srcNodeEl.name}" (Technology) serves "${tgtNodeEl.name}" (Business). Typically Technology serves Application which serves Business.`
        });
      }

      // --- ArchiMate Composition/Aggregation rules ---
      // Composition: parent MUST be same type (structural)
      if (rel.type === 'Composition') {
        if (srcLayer !== tgtLayer) {
          allIssues.push({
            ruleId: 'ARC-STR-001', category: 'ArchiMate', severity: 'MUST',
            viewId: vId, viewName: vName,
            description: 'Composition relationship must be within same layer',
            detail: `Composition from "${srcNodeEl.name}" (${srcLayer}) to "${tgtNodeEl.name}" (${tgtLayer}) crosses layers — invalid.`
          });
        }
      }

      // --- Assignment rules ---
      // Assignment: typically from active to behavioral structure
      if (rel.type === 'Assignment') {
        const activeTypes = ['BusinessActor','BusinessRole','ApplicationComponent','Node','Device','SystemSoftware'];
        const behavioralTypes = ['BusinessProcess','BusinessFunction','BusinessInteraction',
          'ApplicationProcess','ApplicationFunction','TechnologyProcess','TechnologyFunction',
          'BusinessService','ApplicationService','TechnologyService'];
        if (!activeTypes.includes(srcNodeEl.type) && !activeTypes.includes(tgtNodeEl.type)) {
          // Both are non-active — this might be ok but check
        }
      }

      // --- Serving direction (tech serves app serves business — upward) ---
      if (rel.type === 'Serving') {
        // Serving should go from lower to higher, or same layer
        const layerOrder = { Technology: 1, Application: 2, Business: 3 };
        const srcOrder = layerOrder[srcLayer];
        const tgtOrder = layerOrder[tgtLayer];
        // It's okay for Application to serve Business or Technology to serve Application
        // Flag Technology serving Technology as fine
      }
    });
  });

  // ===================== ARCHIMATE ELEMENT USAGE CHECKS =====================

  views.forEach(view => {
    const vId = view.id;
    const vName = view.name;

    const vNameLower = view.name.toLowerCase();
    const elementTypes = view.nodes.map(n => elements[n.elemRef]?.type).filter(Boolean);
    const elementLayers = new Set(elementTypes.map(t => ELEMENT_LAYER[t]).filter(Boolean));

    // --- Motivation view should contain motivation elements ---
    if (vNameLower.includes('motivation') || vNameLower.includes('goal') || vNameLower.includes('driver')) {
      const motivationTypes = ['Driver','Assessment','Goal','Outcome','Principle','Requirement','Constraint','Stakeholder'];
      const hasMotivation = elementTypes.some(t => motivationTypes.includes(t));
      if (!hasMotivation) {
        allIssues.push({
          ruleId: 'ARC-USE-001', category: 'ArchiMate', severity: 'SHOULD',
          viewId: vId, viewName: vName,
          description: 'Motivation view should contain motivation-layer elements',
          detail: `View "${vName}" appears to be a motivation view but contains no Driver, Goal, Outcome, or Requirement elements.`
        });
      }
    }

    // --- Technology view should contain technology elements ---
    if (vNameLower.includes('technology') || vNameLower.includes('infrastructure') || vNameLower.includes('deployment')) {
      const hasTechElements = elementTypes.some(t => ARCHIMATE_LAYERS.Technology.includes(t));
      if (!hasTechElements) {
        allIssues.push({
          ruleId: 'ARC-USE-002', category: 'ArchiMate', severity: 'MUST',
          viewId: vId, viewName: vName,
          description: 'Technology view must contain technology-layer elements',
          detail: `View "${vName}" appears to be a technology view but contains no Node, Device, SystemSoftware, or TechnologyService elements.`
        });
      }
    }

    // --- Cross-layer view should have elements from 2+ layers ---
    if (vNameLower.includes('cross') || vNameLower.includes('cross-layer')) {
      const mainLayers = ['Business','Application','Technology'];
      const presentMainLayers = mainLayers.filter(l => elementLayers.has(l));
      if (presentMainLayers.length < 2) {
        allIssues.push({
          ruleId: 'ARC-USE-003', category: 'ArchiMate', severity: 'MUST',
          viewId: vId, viewName: vName,
          description: 'Cross-layer view must contain elements from at least 2 layers',
          detail: `View "${vName}" only has elements from: ${[...elementLayers].join(', ') || 'none'}. Expected 2+ of Business/Application/Technology.`
        });
      }
    }

    // --- Check for Grouping element misuse ---
    const groupingNodes = view.nodes.filter(n => elements[n.elemRef]?.type === 'Grouping');
    groupingNodes.forEach(gNode => {
      // Check if any of the same-level elements should be contained (msc-004)
      // Could use a proper container element instead
    });

    // --- ApplicationService realized by ApplicationComponent check ---
    // Services should be realized by components
    view.connections.forEach(conn => {
      const rel = relationships[conn.relRef];
      if (!rel || rel.type !== 'Realization') return;
      const srcEl = getNodeElement(conn.sourceRef, view, elements);
      const tgtEl = getNodeElement(conn.targetRef, view, elements);
      if (!srcEl || !tgtEl) return;
      // Component realizes Service (correct direction)
      if (srcEl.type.includes('Service') && tgtEl.type.includes('Component')) {
        // Reversed: service should NOT realize component
        allIssues.push({
          ruleId: 'ARC-REL-001', category: 'ArchiMate', severity: 'MUST',
          viewId: vId, viewName: vName,
          description: 'Service realizing Component is incorrect — Component should realize Service',
          detail: `"${srcEl.name}" (Service) → Realization → "${tgtEl.name}" (Component) — direction is reversed.`
        });
      }
    });

    // --- BusinessService to ApplicationService: Realization link ---
    view.connections.forEach(conn => {
      const rel = relationships[conn.relRef];
      if (!rel) return;
      const srcEl = getNodeElement(conn.sourceRef, view, elements);
      const tgtEl = getNodeElement(conn.targetRef, view, elements);
      if (!srcEl || !tgtEl) return;
      if (srcEl.type === 'BusinessService' && tgtEl.type === 'ApplicationService') {
        if (rel.type !== 'Realization' && rel.type !== 'Serving' && rel.type !== 'Association') {
          allIssues.push({
            ruleId: 'ARC-CL-004', category: 'CrossLayer', severity: 'SHOULD',
            viewId: vId, viewName: vName,
            description: 'BusinessService to ApplicationService should use Realization or Serving',
            detail: `"${srcEl.name}" → "${tgtEl.name}" uses ${rel.type}. Expected Realization or Serving for this cross-layer pair.`
          });
        }
      }
    });
  });

  // ===================== COMPLETENESS CHECKS (Assessment Criteria) =====================

  const allViewNames = views.map(v => v.name.toLowerCase());
  const allElementTypes = new Set(Object.values(elements).map(e => e.type));

  // Check for minimum 6 views
  if (views.length < 6) {
    allIssues.push({
      ruleId: 'COMP-001', category: 'Completeness', severity: 'MUST',
      viewId: 'model', viewName: 'Model Level',
      description: 'Assessment requires minimum 6 views',
      detail: `Only ${views.length} views found. Required: at least 6 (contextual, conceptual + 4 others).`
    });
  }

  // Check for contextual view
  const hasContextual = allViewNames.some(n => n.includes('contextual'));
  if (!hasContextual) {
    allIssues.push({
      ruleId: 'COMP-002', category: 'Completeness', severity: 'MUST',
      viewId: 'model', viewName: 'Model Level',
      description: 'Contextual view is required',
      detail: 'No view with "Contextual" in its name found. This is a mandatory view type.'
    });
  }

  // Check for conceptual view
  const hasConceptual = allViewNames.some(n => n.includes('conceptual'));
  if (!hasConceptual) {
    allIssues.push({
      ruleId: 'COMP-003', category: 'Completeness', severity: 'MUST',
      viewId: 'model', viewName: 'Model Level',
      description: 'Conceptual view is required',
      detail: 'No view with "Conceptual" in its name found. This is a mandatory view type.'
    });
  }

  // Check for technology view
  const hasTechView = allViewNames.some(n => n.includes('technology') || n.includes('tech') || n.includes('infrastructure') || n.includes('deployment'));
  if (!hasTechView) {
    allIssues.push({
      ruleId: 'COMP-004', category: 'Completeness', severity: 'MUST',
      viewId: 'model', viewName: 'Model Level',
      description: 'Technology view is required',
      detail: 'No technology/infrastructure view found. Assessment requires at least one Technology view.'
    });
  }

  // Check for cross-layer view
  const hasCrossLayer = allViewNames.some(n => n.includes('cross') || n.includes('cross-layer'));
  if (!hasCrossLayer) {
    allIssues.push({
      ruleId: 'COMP-005', category: 'Completeness', severity: 'MUST',
      viewId: 'model', viewName: 'Model Level',
      description: 'Cross-layer view is required',
      detail: 'No cross-layer view found. Required: at least one cross-layer view (e.g., Business→Application→Technology).'
    });
  }

  // Check for motivation/goal elements
  const motivationTypes = ['Driver','Assessment','Goal','Outcome','Principle','Requirement','Constraint'];
  const hasMotivation = motivationTypes.some(t => allElementTypes.has(t));
  if (!hasMotivation) {
    allIssues.push({
      ruleId: 'COMP-006', category: 'Completeness', severity: 'SHOULD',
      viewId: 'model', viewName: 'Model Level',
      description: 'Model should include motivation elements (Goals, Drivers, Requirements)',
      detail: 'No Driver, Goal, Outcome, or Requirement elements found in the model.'
    });
  }

  // Check for technology layer elements
  const techTypes = ['Node','Device','SystemSoftware','TechnologyService'];
  const hasTechElements = techTypes.some(t => allElementTypes.has(t));
  if (!hasTechElements) {
    allIssues.push({
      ruleId: 'COMP-007', category: 'Completeness', severity: 'MUST',
      viewId: 'model', viewName: 'Model Level',
      description: 'Model must include technology layer elements',
      detail: 'No Node, Device, SystemSoftware, or TechnologyService elements found.'
    });
  }

  // Check for business actors/roles
  const hasBusinessActors = allElementTypes.has('BusinessActor') || allElementTypes.has('BusinessRole');
  if (!hasBusinessActors) {
    allIssues.push({
      ruleId: 'COMP-008', category: 'Completeness', severity: 'SHOULD',
      viewId: 'model', viewName: 'Model Level',
      description: 'Model should include business actors or roles',
      detail: 'No BusinessActor or BusinessRole elements found. Stakeholders should be modelled.'
    });
  }

  // --- Assessment criteria: 2 cross-role/cross-layer views ---
  const crossLayerViews = views.filter(v =>
    v.name.toLowerCase().includes('cross') ||
    (v.nodes.some(n => ELEMENT_LAYER[elements[n.elemRef]?.type] === 'Business') &&
     v.nodes.some(n => ELEMENT_LAYER[elements[n.elemRef]?.type] === 'Technology'))
  );
  if (crossLayerViews.length < 1) {
    allIssues.push({
      ruleId: 'COMP-009', category: 'Assessment', severity: 'MUST',
      viewId: 'model', viewName: 'Model Level',
      description: 'Assessment requires cross-layer views demonstrating layer connectivity',
      detail: 'No views found that span multiple layers (Business→Application→Technology).'
    });
  }

  // --- Stale/orphaned elements (not in any view) ---
  const allNodeRefs = new Set();
  views.forEach(v => v.nodes.forEach(n => { if (n.elemRef) allNodeRefs.add(n.elemRef); }));
  const orphanedCount = Object.keys(elements).filter(id => !allNodeRefs.has(id)).length;
  if (orphanedCount > 5) {
    allIssues.push({
      ruleId: 'COMP-010', category: 'Completeness', severity: 'INFO',
      viewId: 'model', viewName: 'Model Level',
      description: 'Model contains elements not used in any view',
      detail: `${orphanedCount} elements defined but not appearing in any view — consider removing or including them.`
    });
  }

  return allIssues;
}

function getNodeElement(nodeId, view, elements) {
  const node = view.nodes.find(n => n.nodeId === nodeId);
  if (!node || !node.elemRef) return null;
  return elements[node.elemRef] || null;
}

