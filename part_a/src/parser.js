// ===================== PARSING =====================

function parseXML(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('Invalid XML: ' + parseError.textContent);

  // Elements
  const elements = {};
  doc.querySelectorAll('elements > element').forEach(el => {
    const id = el.getAttribute('identifier');
    const type = el.getAttribute('xsi:type') || el.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','type');
    const nameEl = el.querySelector('name');
    const name = nameEl ? nameEl.textContent.trim() : '';
    elements[id] = { id, type, name, layer: ELEMENT_LAYER[type] || 'Unknown' };
  });

  // Relationships
  const relationships = {};
  doc.querySelectorAll('relationships > relationship').forEach(rel => {
    const id = rel.getAttribute('identifier');
    const type = rel.getAttribute('xsi:type') || rel.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','type');
    const source = rel.getAttribute('source');
    const target = rel.getAttribute('target');
    const nameEl = rel.querySelector('name');
    const name = nameEl ? nameEl.textContent.trim() : '';
    relationships[id] = { id, type, source, target, name };
  });

  // Views
  const views = [];
  doc.querySelectorAll('diagrams > view, views > view').forEach(view => {
    const id = view.getAttribute('identifier');
    const nameEl = view.querySelector(':scope > name');
    const viewName = nameEl ? nameEl.textContent.trim() : 'Unnamed View';

    // Collect all nodes in this view
    const nodes = [];
    view.querySelectorAll('node').forEach(node => {
      const nodeId = node.getAttribute('identifier');
      const elemRef = node.getAttribute('elementRef');
      const xsiType = node.getAttribute('xsi:type') || node.getAttributeNS('http://www.w3.org/2001/XMLSchema-instance','type');
      const x = parseFloat(node.getAttribute('x')) || 0;
      const y = parseFloat(node.getAttribute('y')) || 0;
      const w = parseFloat(node.getAttribute('w')) || 0;
      const h = parseFloat(node.getAttribute('h')) || 0;
      const parentNode = node.parentElement.tagName === 'node' ? node.parentElement.getAttribute('identifier') : null;
      nodes.push({ nodeId, elemRef, xsiType, x, y, w, h, parentNode });
    });

    // Collect connections in this view
    const connections = [];
    view.querySelectorAll('connection').forEach(conn => {
      const connId = conn.getAttribute('identifier');
      const relRef = conn.getAttribute('relationshipRef');
      const sourceRef = conn.getAttribute('source');
      const targetRef = conn.getAttribute('target');
      // Bendpoints
      const bends = [];
      conn.querySelectorAll('bendpoint').forEach(bp => {
        bends.push({ x: parseFloat(bp.getAttribute('x'))||0, y: parseFloat(bp.getAttribute('y'))||0 });
      });
      // Label
      const labelEl = conn.querySelector('label');
      const label = labelEl ? labelEl.textContent.trim() : '';
      connections.push({ connId, relRef, sourceRef, targetRef, bends, label });
    });

    views.push({ id, name: viewName, nodes, connections });
  });

  // Model name
  const modelNameEl = doc.querySelector('model > name, model > n');
  const modelName = modelNameEl ? modelNameEl.textContent.trim() : 'Unknown Model';

  return { modelName, elements, relationships, views };
}

