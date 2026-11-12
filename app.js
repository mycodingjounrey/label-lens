const STORAGE_KEY = 'labellens.examples.v1';
const LABELS = ['Positive', 'Negative', 'Neutral'];
const LABEL_CLASS = { Positive: 'dot-positive', Negative: 'dot-negative', Neutral: 'dot-neutral' };
const SAMPLE_EXAMPLES = [
  { id: 'ex-001', text: 'I love how simple the new dashboard is. Finding my weekly reports takes seconds now.', label: 'Positive', confidence: 0.96, status: 'reviewed', note: 'Clear praise for ease of use.' },
  { id: 'ex-002', text: 'The latest update broke notifications again. I missed two important messages this morning.', label: 'Negative', confidence: 0.92, status: 'unreviewed', note: '' },
  { id: 'ex-003', text: 'Does the basic plan include access to the export feature?', label: 'Neutral', confidence: 0.86, status: 'unreviewed', note: '' },
  { id: 'ex-004', text: 'It works, I guess. Not as fast as I expected, but at least it gets the job done.', label: 'Neutral', confidence: 0.48, status: 'needs-review', note: 'Mixed sentiment: mild approval and disappointment. Dominant intent is unclear.' },
  { id: 'ex-005', text: 'Your support team was incredibly kind and had everything sorted in under five minutes!', label: 'Positive', confidence: 0.98, status: 'reviewed', note: 'Positive sentiment about support experience.' },
  { id: 'ex-006', text: 'We switched over from the old version last Thursday.', label: 'Neutral', confidence: 0.89, status: 'unreviewed', note: '' },
  { id: 'ex-007', text: 'The price is a little steep, but the time saved makes it totally worth it.', label: 'Positive', confidence: 0.56, status: 'needs-review', note: 'Mixed sentiment. Positive overall, with a concern about price.' }
];
let examples = loadExamples();
const $ = (selector) => document.querySelector(selector);
const list = $('#example-list');

function loadExamples() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(stored) ? stored : structuredClone(SAMPLE_EXAMPLES);
  } catch {
    return structuredClone(SAMPLE_EXAMPLES);
  }
}
function saveExamples() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(examples));
  $('.saved-indicator').innerHTML = '<i></i> Saved locally';
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
}
function statusText(status) {
  return status === 'needs-review' ? 'Needs review' : status === 'reviewed' ? 'Reviewed' : 'Unreviewed';
}
function renderTaxonomy() {
  $('#taxonomy').innerHTML = LABELS.map((label) => `<div class="taxonomy-item"><span class="label-dot ${LABEL_CLASS[label]}"></span>${label}</div>`).join('');
}
function render() {
  const query = $('#search-input').value.trim().toLowerCase();
  const filter = $('#filter-select').value;
  const visible = examples.filter((item) => {
    const matchesText = `${item.text} ${item.note || ''} ${item.label}`.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || (filter === 'unreviewed' && item.status === 'unreviewed') || (filter === 'needs-review' && item.status === 'needs-review') || (filter === 'reviewed' && item.status === 'reviewed');
    return matchesText && matchesFilter;
  });
  list.innerHTML = visible.map((item, index) => {
    const confidence = Math.round(Number(item.confidence) * 100);
    const confidenceClass = confidence < 60 ? 'low' : confidence < 80 ? 'medium' : '';
    return `<article class="example-card" data-id="${escapeHTML(item.id)}">
      <div class="example-main"><div class="example-id"><span class="item-number">#${String(index + 1).padStart(3, '0')}</span><span class="status-badge status-${escapeHTML(item.status)}">${statusText(item.status)}</span></div><p class="example-text">${escapeHTML(item.text)}</p>${item.note ? `<div class="example-note"><strong>Note:</strong> ${escapeHTML(item.note)}</div>` : ''}</div>
      <div class="example-meta"><label><span class="meta-label">Assigned label</span><select class="label-select" data-action="label" aria-label="Label for example">${LABELS.map((label) => `<option ${item.label === label ? 'selected' : ''}>${label}</option>`).join('')}</select></label><div><span class="meta-label">Confidence</span><div class="confidence-line"><span>${confidenceClass === 'low' ? 'Low' : confidenceClass === 'medium' ? 'Medium' : 'High'}</span><span>${confidence}%</span></div><div class="confidence-track"><div class="confidence-fill ${confidenceClass}" style="width:${confidence}%"></div></div></div></div>
      <div class="example-actions"><button class="action-button ${item.status === 'reviewed' ? 'approve' : ''}" data-action="approve">${item.status === 'reviewed' ? '✓ Approved' : '✓ Approve label'}</button><button class="action-button flag" data-action="flag">${item.status === 'needs-review' ? '⚑ Flagged' : '⚑ Needs review'}</button></div>
    </article>`;
  }).join('');
  $('#empty-state').hidden = visible.length > 0;
  $('#examples-count').textContent = examples.length;
  $('#nav-count').textContent = examples.filter((item) => item.status !== 'reviewed').length;
  $('#showing-count').textContent = visible.length;
  $('#total-count').textContent = examples.length;
  updateMetrics();
}
function updateMetrics() {
  const total = examples.length;
  const reviewed = examples.filter((item) => item.status === 'reviewed').length;
  const attention = examples.filter((item) => item.status === 'needs-review' || Number(item.confidence) < 0.6).length;
  const estimate = total ? Math.round(examples.reduce((sum, item) => sum + Number(item.confidence) * (item.status === 'reviewed' ? 1 : 0.85), 0) / total * 100) : 0;
  $('#metric-total').textContent = total;
  $('#metric-reviewed').textContent = reviewed;
  $('#reviewed-percent').textContent = `${total ? Math.round(reviewed / total * 100) : 0}% complete`;
  $('#review-progress').style.width = `${total ? reviewed / total * 100 : 0}%`;
  $('#metric-attention').textContent = attention;
  $('#metric-consistency').textContent = total ? `${estimate}%` : '—';
}
function notify(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(notify.timeout);
  notify.timeout = setTimeout(() => toast.classList.remove('show'), 2300);
}
function exportJSON() {
  const report = { project: 'Product feedback', exportedAt: new Date().toISOString(), qualityNote: 'Consistency is a heuristic based on annotator confidence and review status, not inter-annotator agreement.', summary: { total: examples.length, reviewed: examples.filter((item) => item.status === 'reviewed').length, needsAttention: examples.filter((item) => item.status === 'needs-review' || Number(item.confidence) < 0.6).length }, examples };
  downloadFile('labellens-review-report.json', JSON.stringify(report, null, 2), 'application/json');
}
function exportCSV() {
  const rows = [['id', 'text', 'label', 'confidence', 'status', 'note'], ...examples.map((item) => [item.id, item.text, item.label, item.confidence, item.status, item.note || ''])];
  const csv = rows.map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(',')).join('\n');
  downloadFile('labellens-examples.csv', csv, 'text/csv;charset=utf-8');
}
function downloadFile(filename, content, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
  notify(`Exported ${filename}`);
}
function parseCSV(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { field += '"'; i++; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i++;
      row.push(field); if (row.some(Boolean)) rows.push(row); row = []; field = '';
    } else field += char;
  }
  row.push(field); if (row.some(Boolean)) rows.push(row);
  if (!rows.length) return [];
  const headers = rows.shift().map((header) => header.trim().toLowerCase());
  return rows.map((values, index) => Object.fromEntries(headers.map((header, col) => [header, values[col] || '']))).map((row, index) => ({ id: row.id || `import-${Date.now()}-${index}`, text: row.text || row.example || row.content || '', label: LABELS.includes(row.label) ? row.label : 'Neutral', confidence: Math.max(0, Math.min(1, Number(row.confidence) || 0.75)), status: ['reviewed', 'needs-review', 'unreviewed'].includes(row.status) ? row.status : 'unreviewed', note: row.note || '' })).filter((item) => item.text);
}
$('#example-list').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const card = button.closest('[data-id]');
  const item = examples.find((example) => example.id === card.dataset.id);
  if (button.dataset.action === 'approve') { item.status = 'reviewed'; notify('Example marked as reviewed'); }
  if (button.dataset.action === 'flag') { item.status = item.status === 'needs-review' ? 'unreviewed' : 'needs-review'; notify(item.status === 'needs-review' ? 'Flagged for a second opinion' : 'Review flag removed'); }
  saveExamples(); render();
});
$('#example-list').addEventListener('change', (event) => {
  if (event.target.dataset.action !== 'label') return;
  const item = examples.find((example) => example.id === event.target.closest('[data-id]').dataset.id);
  item.label = event.target.value;
  if (item.status === 'reviewed') item.status = 'unreviewed';
  saveExamples(); render(); notify('Label updated');
});
$('#search-input').addEventListener('input', render);
$('#filter-select').addEventListener('change', render);
$('#add-example').addEventListener('click', () => $('#example-dialog').showModal());
$('#new-label').innerHTML = LABELS.map((label) => `<option>${label}</option>`).join('');
$('#example-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = $('#new-text').value.trim();
  if (!text) return;
  examples.unshift({ id: `ex-${Date.now()}`, text, label: $('#new-label').value, confidence: Number($('#new-confidence').value), status: 'unreviewed', note: $('#new-note').value.trim() });
  saveExamples(); render(); $('#example-dialog').close(); event.target.reset(); notify('Example added to your queue');
});
$('#export-button').addEventListener('click', exportJSON);
$('#import-button').addEventListener('click', () => $('#file-input').click());
$('#file-input').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const text = await file.text();
    const imported = file.name.toLowerCase().endsWith('.csv') ? parseCSV(text) : JSON.parse(text);
    const items = Array.isArray(imported) ? imported : imported.examples;
    if (!Array.isArray(items)) throw new Error('Expected an array of examples or a LabelLens report.');
    const cleaned = items.filter((item) => item && typeof item.text === 'string' && item.text.trim()).map((item, index) => ({ id: String(item.id || `import-${Date.now()}-${index}`), text: item.text.trim(), label: LABELS.includes(item.label) ? item.label : 'Neutral', confidence: Math.max(0, Math.min(1, Number(item.confidence) || 0.75)), status: ['reviewed', 'needs-review', 'unreviewed'].includes(item.status) ? item.status : 'unreviewed', note: String(item.note || '') }));
    if (!cleaned.length) throw new Error('No valid examples found. Include a text column or property.');
    examples = [...cleaned, ...examples]; saveExamples(); render(); notify(`Imported ${cleaned.length} example${cleaned.length === 1 ? '' : 's'}`);
  } catch (error) { notify(`Import failed: ${error.message}`); }
  event.target.value = '';
});
$('#export-button').addEventListener('contextmenu', (event) => { event.preventDefault(); exportCSV(); });
renderTaxonomy(); render();
