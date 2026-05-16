/* ══════════════════════════════════════════════════
   RESITER PERÚ — app.js
   Lógica principal de la aplicación
   Para agregar mejoras: busca el bloque "MEJORAS"
   y añade tus módulos al final del archivo.
══════════════════════════════════════════════════ */

'use strict';

// ── CHARTS ──────────────────────────────────────
let chartTrend = null;
let chartDiv   = null;
let chartComp  = null;
let editingMaes = null;
let pendingExcel = [];

// ── UTILS ────────────────────────────────────────
const $ = id => document.getElementById(id);
const toast = msg => {
  $('toastTxt').textContent = msg;
  $('toastEl').classList.add('show');
  setTimeout(() => $('toastEl').classList.remove('show'), 3200);
};
const closeModal = id => $(id).classList.remove('open');
const fmtDate = d => d ? d.substring(0, 10) : '—';
const fmtDT   = d => d ? d.replace('T',' ').substring(0, 16) : '—';
const nl = () => document.createElement('div');
function exportCSV(filename, header, rows) {
  const blob = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// ── NAV / TAB SWITCHING ──────────────────────────
const TAB_TITLES = {
  dashboard: 'Dashboard', odometro: 'Registro de odómetro',
  abastec: 'Abastecimiento', historial: 'Historial',
  maestro: 'Maestro de unidades', conductores: 'Conductores',
  mantenimiento: 'Mantenimiento', documentos: 'Documentos',
  rutas: 'Rutas y viajes', zonas: 'Zonas / CECO',
  comparativo: 'Comparativo', reportes: 'Reportes', ia: 'Asistente IA'
};

function goTab(t) {
  document.querySelectorAll('.tab-c').forEach(e => e.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(e => e.classList.remove('active'));
  $('tab-c-' + t).classList.add('active');
  const navItem = document.querySelector(`.nav-item[data-tab="${t}"]`);
  if (navItem) navItem.classList.add('active');
  $('topbarTitle').textContent = TAB_TITLES[t] || t;

  // Lazy render
  if (t === 'dashboard')     { renderDash(); renderTrend(); renderDashAlertas(); }
  if (t === 'historial')     renderHist();
  if (t === 'maestro')       renderMaestro();
  if (t === 'conductores')   renderConductores();
  if (t === 'mantenimiento') renderMnt();
  if (t === 'documentos')    { renderDocsAlertas(); renderDocs(); }
  if (t === 'rutas')         { renderRutas(); renderViajesActivos(); }
  if (t === 'zonas')         { renderZonas(); buildDivChart(); }
  if (t === 'comparativo')   { renderComparativo('marca'); buildCompChart(); }
  if (t === 'reportes')      buildPDF();
}

function toggleSidebar() {
  const sb = $('sidebar');
  const main = $('main');
  sb.classList.toggle('collapsed');
  main.classList.toggle('expanded');
}

// ── INIT SIDEBAR NAV ─────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => goTab(btn.dataset.tab));
  });
}

// ── POPULATE SELECTS ─────────────────────────────
function populateAll() {
  const uOpts = '<option value="">— seleccionar —</option>' +
    fleet.map(f => `<option value="${f.placa}">${f.placa} — ${f.marca}</option>`).join('');
  ['odo-placa','fuel-placa','mnt-placa','doc-placa','ruta-placa'].forEach(id => {
    if ($(id)) $(id).innerHTML = uOpts;
  });
  if ($('drv-unidad'))
    $('drv-unidad').innerHTML = '<option value="">— sin asignar —</option>' +
      fleet.map(f => `<option value="${f.placa}">${f.placa} — ${f.marca}</option>`).join('');
  if ($('ruta-conductor'))
    $('ruta-conductor').innerHTML = '<option value="">— seleccionar —</option>' +
      conductores.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  if ($('ruta-destino'))
    $('ruta-destino').innerHTML = '<option value="">— seleccionar CECO —</option>' +
      CECOS.map(c => `<option>${c}</option>`).join('');
  // CECO filters
  const cecoOpts = '<option value="">Todos los CECOs</option>' + CECOS.map(c=>`<option>${c}</option>`).join('');
  ['dash-ceco'].forEach(id => { if($(id)) $(id).innerHTML = cecoOpts; });
}

// ── METRICS BAR ──────────────────────────────────
function updateMetrics() {
  const enUso  = fleet.filter(f => f.estado === 'EN USO').length;
  const rep    = fleet.filter(f => f.estado === 'EN REPARACION').length;
  const com    = fleet.filter(f => f.estado === 'COMISARIA').length;
  const rends  = fleet.filter(f => f.lastRend);
  const avg    = rends.length ? (rends.reduce((s,f) => s+f.lastRend, 0) / rends.length) : 0;
  const galTot = records.filter(r=>r.type==='fuel').reduce((s,r)=>s+(r.gal||0),0);
  const mntV   = mantenimientos.filter(m => m.est === 'venc').length;
  const mntP   = mantenimientos.filter(m => m.est === 'prox').length;
  const today  = new Date();
  const licV   = conductores.filter(c => c.venc && c.venc !== '—' && (new Date(c.venc)-today) < 30*86400000).length;
  const docsV  = docs.filter(d => getDaysLeft(d.venc) !== null && getDaysLeft(d.venc) < 0).length;
  const rutasA = rutas.filter(r => r.estado === 'En ruta').length;

  const alertCount = mntV + com + docsV + licV;
  const alertEl = $('alertCount');
  if (alertEl) alertEl.textContent = alertCount;

  $('metricsBar').innerHTML = [
    ['🚛', fleet.length, 'Total unidades', ''],
    ['✅', enUso, 'En uso', 'color:var(--success)'],
    ['🔧', rep, 'En reparación', rep>0?'color:var(--warning)':''],
    ['🚔', com, 'Comisaría', com>0?'color:var(--danger)':''],
    ['📊', avg>0 ? avg.toFixed(1) : '—', 'km/gal prom.', ''],
    ['⛽', galTot.toFixed(0), 'Galones reg.', ''],
    ['🔴', mntV, 'Mant. vencidos', mntV>0?'color:var(--danger)':''],
    ['🟡', mntP, 'Mant. próximos', mntP>0?'color:var(--warning)':''],
    ['📂', docsV, 'Docs. vencidos', docsV>0?'color:var(--danger)':''],
    ['🟢', rutasA, 'Viajes activos', rutasA>0?'color:var(--success)':''],
  ].map(([ico, val, lbl, style]) =>
    `<div class="mc"><div class="mv" style="${style}">${val}</div><div class="ml">${ico} ${lbl}</div></div>`
  ).join('');
}

// ── UNIT INFO CARD (UIC) ─────────────────────────
function fillUIC(prefix) {
  const placa = $(`${prefix}-placa`).value;
  const card  = $(`${prefix}-uic`);
  if (!placa) { card.style.display = 'none'; return; }
  const u = getUnit(placa);
  if (!u) { card.style.display = 'none'; return; }
  card.style.display = 'grid';
  $(`${prefix}-uif-div`).textContent   = u.division;
  $(`${prefix}-uif-ceco`).textContent  = u.ceco;
  $(`${prefix}-uif-marca`).textContent = `${u.marca} ${u.anio}`;
  $(`${prefix}-uif-comb`).textContent  = u.comb;
  if ($(`${prefix}-uif-gps`))  $(`${prefix}-uif-gps`).textContent  = u.gps;
  if ($(`${prefix}-uif-km`))   $(`${prefix}-uif-km`).textContent   = u.lastKm ? u.lastKm.toLocaleString() + ' km' : 'Sin registro';
  if ($(`${prefix}-uif-rend`)) $(`${prefix}-uif-rend`).textContent = u.lastRend ? u.lastRend.toFixed(1) + ' km/gal' : 'Sin registro';
}

// ══════════════════════════════════════════════════
// DASHBOARD
// ══════════════════════════════════════════════════
function renderDash() {
  const fd = $('dash-div').value;
  const fc = $('dash-ceco').value;
  const data = fleet.filter(u => {
    if (fd && u.division !== fd) return false;
    if (fc && u.ceco !== fc) return false;
    return u.lastKm || u.lastRend;
  });
  const drv = placa => conductores.find(c => c.unidad === placa);
  if (!data.length) {
    $('dash-body').innerHTML = '<tr><td colspan="8" style="text-align:center;padding:20px;color:#888">Sin datos aún — registra abastecimientos para ver rendimiento aquí.</td></tr>';
    return;
  }
  $('dash-body').innerHTML = data.map(u => {
    const d = drv(u.placa);
    return `<tr>
      <td><strong>${u.placa}</strong></td><td>${u.marca}</td>
      <td>${divBadge(u.division)}</td>
      <td style="font-size:10px;color:#666">${u.ceco}</td>
      <td style="font-family:var(--font-mono)">${u.lastKm ? u.lastKm.toLocaleString() : '—'}</td>
      <td>${rendChip(u.lastRend)}${u.lastRend ? ' km/gal' : ''}</td>
      <td>${stateBadge(u.estado)}</td>
      <td style="font-size:11px">${d ? d.nombre.split(',')[0] : '—'}</td>
    </tr>`;
  }).join('');
}

function renderTrend() {
  const fuelR = records.filter(r => r.type === 'fuel' && r.rend).slice(0, 15).reverse();
  if (chartTrend) { chartTrend.destroy(); chartTrend = null; }
  if (!fuelR.length) return;
  chartTrend = new Chart($('trendChart'), {
    type: 'line',
    data: {
      labels: fuelR.map(r => `${r.placa} ${fmtDate(r.date).slice(5)}`),
      datasets: [{ label: 'km/gal', data: fuelR.map(r => +r.rend.toFixed(2)),
        borderColor: '#1B4FD8', backgroundColor: 'rgba(27,79,216,0.07)',
        borderWidth: 2, pointRadius: 4, fill: true, tension: 0.35 }]
    },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ y:{ min:0, title:{display:true,text:'km/gal'} } } }
  });
}

function renderDashAlertas() {
  const alerts = buildAlerts();
  $('dash-alertas').innerHTML = alerts.slice(0, 10).map(a =>
    `<div class="al ${a.cls}"><span>${a.ico}</span><div><strong>${a.title}</strong><br><span style="font-size:11px">${a.msg}</span></div></div>`
  ).join('') || '<div class="al al-ok"><span>✅</span><div>Sin alertas activas.</div></div>';
}

function buildAlerts() {
  const alerts = [];
  fleet.forEach(u => {
    if (u.lastRend && u.lastRend < 25)  alerts.push({ cls:'al-bad',  ico:'🔴', title:`${u.placa} — Rendimiento crítico`, msg:`${u.lastRend.toFixed(1)} km/gal · ${u.ceco} · Revisar motor o consumo anormal` });
    else if (u.lastRend && u.lastRend < 35) alerts.push({ cls:'al-warn', ico:'🟡', title:`${u.placa} — Rendimiento bajo`, msg:`${u.lastRend.toFixed(1)} km/gal · ${u.ceco}` });
    if (u.estado === 'EN REPARACION')  alerts.push({ cls:'al-warn', ico:'🔧', title:`${u.placa} — En reparación`, msg:`${u.division} · ${u.ceco}` });
    if (u.estado === 'COMISARIA')      alerts.push({ cls:'al-bad',  ico:'🚔', title:`${u.placa} — En comisaría`, msg:'Requiere atención inmediata' });
  });
  mantenimientos.forEach(m => {
    if (m.est === 'venc') alerts.push({ cls:'al-bad',  ico:'🔴', title:`${m.placa} — Mantenimiento vencido`, msg:`${m.tipo} · ${m.taller}` });
    if (m.est === 'prox') alerts.push({ cls:'al-warn', ico:'⚠️', title:`${m.placa} — Mantenimiento próximo`, msg:`${m.tipo} · Fecha: ${m.fecha}` });
  });
  const today = new Date();
  conductores.forEach(c => {
    if (!c.venc || c.venc === '—') return;
    const dl = getDaysLeft(c.venc);
    if (dl < 0)  alerts.push({ cls:'al-bad',  ico:'🪪', title:`${c.nombre} — Licencia VENCIDA`, msg:`Venció: ${c.venc} · Unidad: ${c.unidad}` });
    else if (dl < 30) alerts.push({ cls:'al-warn', ico:'🪪', title:`${c.nombre} — Licencia por vencer`, msg:`Vence en ${dl} días (${c.venc}) · Unidad: ${c.unidad}` });
  });
  docs.forEach(d => {
    const dl = getDaysLeft(d.venc);
    if (dl !== null && dl < 0)  alerts.push({ cls:'al-bad',  ico:'📂', title:`${d.placa} — ${d.tipo} VENCIDO`, msg:`Venció: ${d.venc} · Entidad: ${d.entidad}` });
    else if (dl !== null && dl < 30) alerts.push({ cls:'al-warn', ico:'📂', title:`${d.placa} — ${d.tipo} por vencer`, msg:`Vence en ${dl} días · ${d.entidad}` });
  });
  return alerts;
}

// ══════════════════════════════════════════════════
// ODÓMETRO
// ══════════════════════════════════════════════════
function processOdo(e) {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    const prev = $('odo-preview');
    prev.src = ev.target.result; prev.style.display = 'block';
    const u = getUnit($('odo-placa').value);
    const base = u && u.lastKm ? u.lastKm : Math.floor(Math.random() * 80000 + 20000);
    const km = base + Math.floor(Math.random() * 600 + 80);
    const hiConf = Math.random() > 0.22;
    $('odo-km').value = km;
    $('odo-conf-badge').innerHTML = hiConf ? '✅ Confianza alta' : '⚠️ Verifica lectura';
    $('odo-conf-badge').className = 'badge ' + (hiConf ? 'b-ok' : 'b-warn');
    if (u && u.lastKm) $('odo-km-diff').textContent = `+${(km - u.lastKm).toLocaleString()} km desde último registro`;
    else $('odo-km-diff').textContent = '';
    $('odo-confirm').style.display = 'block';
    $('odo-result').style.display = 'none';
  };
  reader.readAsDataURL(file);
}

function confirmOdo() {
  const km = parseInt($('odo-km').value);
  const placa = $('odo-placa').value;
  if (!km || !placa) {
    $('odo-result').style.display = 'block';
    $('odo-result').innerHTML = '<div class="al al-warn"><span>⚠️</span>Selecciona unidad y verifica el KM.</div>';
    return;
  }
  const fecha     = $('odo-fecha').value || new Date().toISOString().split('T')[0];
  const tipo      = $('odo-tipo').value;
  const conductor = $('odo-conductor').value || 'No especificado';
  const u = getUnit(placa);
  if (u) u.lastKm = km;
  records.unshift({ date: fmtDate(fecha), type:'km', placa, division: u?u.division:'—', ceco: u?u.ceco:'—', conductor, detail: tipo, km, gal: null, rend: null, precio: null, total: null, validated: true });
  $('odo-result').style.display = 'block';
  $('odo-result').innerHTML = `<div class="al al-ok"><span>✅</span><strong>Guardado — ${placa} · ${km.toLocaleString()} km · ${tipo}</strong></div>`;
  $('odo-confirm').style.display = 'none';
  renderOdoRecent(); updateMetrics();
  toast(`Odómetro registrado: ${placa} → ${km.toLocaleString()} km`);
}

function clearOdo() {
  $('odo-preview').style.display = 'none';
  $('odo-confirm').style.display = 'none';
  $('odo-result').style.display = 'none';
  ['odo-cam','odo-file'].forEach(id => $(id).value = '');
}

function renderOdoRecent() {
  const data = records.filter(r => r.type === 'km').slice(0, 20);
  $('odo-recent').innerHTML = data.map(r => `<tr>
    <td>${r.date}</td><td><strong>${r.placa}</strong></td>
    <td style="font-family:var(--font-mono)">${r.km ? r.km.toLocaleString() : '—'}</td>
    <td style="font-size:11px">${r.detail}</td>
    <td style="font-size:11px">${r.conductor}</td>
  </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:#888;padding:12px">Sin registros aún.</td></tr>';
}

// ══════════════════════════════════════════════════
// ABASTECIMIENTO
// ══════════════════════════════════════════════════
function switchFuelTab(t) {
  $('fuel-manual').style.display = t === 'manual' ? 'block' : 'none';
  $('fuel-excel').style.display  = t === 'excel'  ? 'block' : 'none';
  $('pill-manual').classList.toggle('active', t === 'manual');
  $('pill-excel').classList.toggle('active',  t === 'excel');
}

function calcRend() {
  const placa  = $('fuel-placa').value;
  const km     = +$('fuel-km').value || 0;
  const gal    = +$('fuel-gal').value || 0;
  const precio = +$('fuel-precio').value || 0;
  const u      = getUnit(placa);
  const prevKm = u ? u.lastKm : null;
  const lc     = $('fuel-lc');
  if (gal > 0 || km > 0) {
    lc.style.display = 'block';
    const kmD  = prevKm && km > prevKm ? km - prevKm : null;
    const r    = kmD && gal > 0 ? kmD / gal : null;
    const total= gal && precio ? gal * precio : null;
    $('lc-km').textContent    = kmD ? kmD.toLocaleString() + ' km' : '—';
    $('lc-rend').innerHTML    = r ? rendChip(r) + ' km/gal' : '—';
    $('lc-total').textContent = total ? 'S/. ' + total.toFixed(2) : '—';
    $('lc-pkm').textContent   = total && kmD && kmD > 0 ? 'S/. ' + (total/kmD).toFixed(3) : '—';
    $('lc-alert').innerHTML   = r
      ? r < 25  ? '<div class="al al-bad"  style="margin:0;padding:6px 10px"><span>🔴</span>Rendimiento crítico — revisar consumo</div>'
      : r < 35  ? '<div class="al al-warn" style="margin:0;padding:6px 10px"><span>⚠️</span>Rendimiento bajo — puede mejorar</div>'
      : '<div class="al al-ok" style="margin:0;padding:6px 10px"><span>✅</span>Rendimiento óptimo</div>'
      : '';
  } else { lc.style.display = 'none'; }
}

function saveFuel() {
  const placa  = $('fuel-placa').value;
  const fecha  = $('fuel-fecha').value || new Date().toISOString().split('T')[0];
  const km     = +$('fuel-km').value || 0;
  const gal    = +$('fuel-gal').value || 0;
  const precio = +$('fuel-precio').value || 0;
  const grifo  = $('fuel-grifo').value || 'Sin especificar';
  if (!placa || !gal || !km) { toast('Completa unidad, galones y KM'); return; }
  const u     = getUnit(placa);
  const prevKm= u ? u.lastKm : null;
  const kmD   = prevKm && km > prevKm ? km - prevKm : null;
  const r     = kmD && gal > 0 ? kmD / gal : null;
  const total = gal && precio ? gal * precio : null;
  if (u) { u.lastKm = km; if (r) u.lastRend = r; }
  records.unshift({ date:fmtDate(fecha), type:'fuel', placa, division:u?u.division:'—', ceco:u?u.ceco:'—', conductor:'—', detail:grifo, km, gal, rend:r, precio, total, validated:true });
  toast(`Abastecimiento guardado — ${placa}${r ? ' · ' + r.toFixed(1) + ' km/gal' : ''}`);
  ['fuel-km','fuel-gal','fuel-precio','fuel-grifo'].forEach(id => $(id).value = '');
  $('fuel-lc').style.display = 'none';
  renderFuelRecent(); updateMetrics();
}

function renderFuelRecent() {
  const data = records.filter(r => r.type === 'fuel').slice(0, 20);
  $('fuel-recent').innerHTML = data.map(r => `<tr>
    <td>${r.date}</td><td><strong>${r.placa}</strong></td>
    <td style="font-size:10px">${r.ceco}</td>
    <td style="font-family:var(--font-mono)">${r.gal ? r.gal + ' gal' : '—'}</td>
    <td>${rendChip(r.rend)}${r.rend ? ' km/gal' : ''}</td>
    <td style="font-family:var(--font-mono)">${r.total ? 'S/. ' + r.total.toFixed(2) : '—'}</td>
  </tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:#888;padding:12px">Sin registros aún.</td></tr>';
}

// ── EXCEL ────────────────────────────────────────
const DEMO_EXCEL = [
  { date:'2025-05-10', placa:'BPG-726', gal:55,   precio:16.80, grifo:'Primax Lima Norte', km:42100 },
  { date:'2025-05-10', placa:'BSA-733', gal:48.5,  precio:16.80, grifo:'Repsol Callao',     km:38500 },
  { date:'2025-05-11', placa:'BTA-809', gal:52,    precio:17.10, grifo:'Pecsa SJL',          km:29800 },
  { date:'2025-05-11', placa:'CEY-803', gal:60,    precio:16.80, grifo:'Primax VES',         km:12600 },
  { date:'2025-05-12', placa:'BMV-722', gal:44,    precio:17.10, grifo:'Grifo Los Olivos',   km:55200 },
  { date:'2025-05-12', placa:'BWY-778', gal:50,    precio:16.80, grifo:'Repsol Ate',         km:33700 },
  { date:'2025-05-13', placa:'CBF-721', gal:38,    precio:16.80, grifo:'Antamina Grifo',     km:11200 },
  { date:'2025-05-13', placa:'CFK-805', gal:110,   precio:8.50,  grifo:'GNV Pisco Norte',    km:12800 },
];

function processExcel()    { pendingExcel = [...DEMO_EXCEL]; showExcelPreview(); }
function loadDemoExcel()   { pendingExcel = [...DEMO_EXCEL]; showExcelPreview(); }

function showExcelPreview() {
  $('excel-count').textContent = pendingExcel.length;
  $('excel-body').innerHTML = pendingExcel.map(r => {
    const u    = getUnit(r.placa);
    const prevKm = u ? u.lastKm : null;
    const kmD  = prevKm && r.km > prevKm ? r.km - prevKm : null;
    const rend = kmD && r.gal ? kmD / r.gal : null;
    return `<tr>
      <td>${r.date}</td><td><strong>${r.placa}</strong></td>
      <td style="font-size:10px">${u?u.division:'—'}</td>
      <td style="font-size:10px">${u?u.ceco:'—'}</td>
      <td>${r.gal}</td><td>S/.${r.precio}</td>
      <td style="font-size:10px">${r.grifo}</td>
      <td style="font-family:var(--font-mono)">${r.km.toLocaleString()}</td>
      <td>${rendChip(rend)}${rend ? ' km/gal' : ''}</td>
      <td><span class="badge ${u?'b-ok':'b-warn'}">${u?'✓ OK':'Sin maestro'}</span></td>
    </tr>`;
  }).join('');
  $('excel-preview').style.display = 'block';
}

function importExcel() {
  pendingExcel.forEach(r => {
    const u    = getUnit(r.placa);
    const prevKm = u ? u.lastKm : null;
    const kmD  = prevKm && r.km > prevKm ? r.km - prevKm : null;
    const rend = kmD && r.gal ? kmD / r.gal : null;
    const total= r.gal * r.precio;
    if (u) { u.lastKm = r.km; if (rend) u.lastRend = rend; }
    records.unshift({ date:r.date, type:'fuel', placa:r.placa, division:u?u.division:'—', ceco:u?u.ceco:'—', conductor:'—', detail:r.grifo, km:r.km, gal:r.gal, rend, precio:r.precio, total, validated:true });
  });
  toast(`${pendingExcel.length} registros importados`);
  cancelExcel(); renderFuelRecent(); updateMetrics();
}

function cancelExcel() { $('excel-preview').style.display = 'none'; pendingExcel = []; }

function downloadTemplate() {
  exportCSV('plantilla_abastecimiento_resiter.csv',
    'Fecha,Placa,Galones,Precio_por_galon,Grifo,KM_odometro',
    ['2025-05-13,BPG-726,55.0,16.80,Grifo Ejemplo,42100']
  );
}

// ══════════════════════════════════════════════════
// HISTORIAL
// ══════════════════════════════════════════════════
function renderHist() {
  const q  = ($('hist-q').value || '').toLowerCase();
  const fd = $('hist-div').value;
  const ft = $('hist-tipo').value;
  const data = records.filter(r => {
    if (fd && r.division !== fd) return false;
    if (ft && r.type !== ft) return false;
    if (q && !`${r.placa} ${r.ceco} ${r.division} ${r.detail} ${r.conductor}`.toLowerCase().includes(q)) return false;
    return true;
  });
  $('hist-cnt').textContent = data.length + ' registros';
  $('hist-body').innerHTML = data.map(r => `<tr>
    <td>${r.date}</td>
    <td>${r.type==='km' ? '<span class="badge b-info">Odómetro</span>' : '<span class="badge b-ok">Abastec.</span>'}</td>
    <td><strong>${r.placa}</strong></td>
    <td>${divBadge(r.division)}</td>
    <td style="font-size:10px;color:#666">${r.ceco}</td>
    <td style="font-size:11px">${r.conductor||'—'}</td>
    <td style="font-family:var(--font-mono)">${r.km ? r.km.toLocaleString() : '—'}</td>
    <td>${r.gal ? r.gal + ' gal' : '—'}</td>
    <td>${rendChip(r.rend)}${r.rend ? ' km/gal' : ''}</td>
    <td style="font-family:var(--font-mono)">${r.total ? 'S/. '+r.total.toFixed(2) : '—'}</td>
    <td>${r.validated ? '<span class="badge b-ok">✓</span>' : '<span class="badge b-warn">Pend.</span>'}</td>
  </tr>`).join('') || '<tr><td colspan="11" style="text-align:center;color:#888;padding:16px">Sin registros. Carga abastecimientos u odómetros.</td></tr>';
}

function exportHistCSV() {
  exportCSV('historial_resiter.csv',
    'Fecha,Tipo,Placa,Division,CECO,Conductor,KM,Galones,Rendimiento,Total_S',
    records.map(r => `${r.date},${r.type},${r.placa},${r.division},${r.ceco},${r.conductor||''},${r.km||''},${r.gal||''},${r.rend?r.rend.toFixed(2):''},${r.total?r.total.toFixed(2):''}`)
  );
  toast('Historial exportado');
}

// ══════════════════════════════════════════════════
// MAESTRO
// ══════════════════════════════════════════════════
function renderMaestro() {
  const q  = ($('maes-q').value || '').toLowerCase();
  const fd = $('maes-div').value;
  const fe = $('maes-est').value;
  const data = fleet.filter(u => {
    if (fd && u.division !== fd) return false;
    if (fe && u.estado !== fe) return false;
    if (q && !`${u.placa} ${u.marca} ${u.ceco}`.toLowerCase().includes(q)) return false;
    return true;
  });
  $('maes-cnt').textContent = data.length + ' unidades';
  $('maes-body').innerHTML = data.map(u => {
    if (u.editMode) return `<tr>
      <td style="color:#999">${u.n}</td><td><strong>${u.placa}</strong></td>
      <td>${u.marca}</td><td>${u.anio}</td><td>${combBadge(u.comb)}</td>
      <td style="font-size:10px;color:#999">${u.gps}</td><td>${stateBadge(u.estado)}</td>
      <td><div class="ei">
        <select id="me-div-${u.n}">${DIVISIONS.map(d=>`<option ${d===u.division?'selected':''}>${d}</option>`).join('')}</select>
      </div></td>
      <td><div class="ei">
        <input type="text" id="me-ceco-${u.n}" value="${u.ceco}" list="cl-${u.n}" style="min-width:120px">
        <datalist id="cl-${u.n}">${CECOS.map(c=>`<option value="${c}">`).join('')}</datalist>
        <button class="sbtn" onclick="saveMaes(${u.n})">✓ Guardar</button>
        <button class="cbtn" onclick="cancelMaes(${u.n})">✕</button>
      </div></td>
      <td>${u.hist.length ? `<span class="badge b-info" style="cursor:pointer" onclick="showUnitHist(${u.n})">📋 ${u.hist.length}</span>` : '—'}</td>
      <td></td>
    </tr>`;
    return `<tr>
      <td style="color:#999;font-family:var(--font-mono);font-size:11px">${u.n}</td>
      <td><strong>${u.placa}</strong></td><td>${u.marca}</td><td>${u.anio}</td>
      <td>${combBadge(u.comb)}</td>
      <td style="font-size:10px;color:#999">${u.gps}</td>
      <td>${stateBadge(u.estado)}</td>
      <td>${divBadge(u.division)}</td>
      <td style="font-size:11px">${u.ceco}</td>
      <td>${u.hist.length ? `<span class="badge b-info" style="cursor:pointer" onclick="showUnitHist(${u.n})">📋 ${u.hist.length}</span>` : '—'}</td>
      <td><button class="btn sm" onclick="startMaes(${u.n})">✏️ Editar</button></td>
    </tr>`;
  }).join('');
}

function startMaes(n) {
  if (editingMaes !== null) {
    const prev = fleet.find(f => f.n === editingMaes);
    if (prev) prev.editMode = false;
  }
  editingMaes = n;
  fleet.find(f => f.n === n).editMode = true;
  renderMaestro();
}

function cancelMaes(n) {
  fleet.find(f => f.n === n).editMode = false;
  editingMaes = null;
  renderMaestro();
}

function saveMaes(n) {
  const u  = fleet.find(f => f.n === n);
  const nd = $(`me-div-${n}`).value;
  const nc = $(`me-ceco-${n}`).value.trim();
  if (nd !== u.division || nc !== u.ceco) {
    u.hist.unshift({ date: new Date().toLocaleDateString('es-PE'), divAntes: u.division, cecoAntes: u.ceco, divDespues: nd, cecoDespues: nc });
    u.division = nd; u.ceco = nc;
    toast(`${u.placa} → ${nd} / ${nc}`);
  }
  u.editMode = false; editingMaes = null;
  renderMaestro(); populateAll();
}

function showUnitHist(n) {
  const u = fleet.find(f => f.n === n);
  $('mh-title').textContent = `Historial reasignaciones — ${u.placa}`;
  $('mh-body').innerHTML = u.hist.length
    ? u.hist.map(h => `<div style="padding:8px 0;border-bottom:1px solid var(--border)">
        <strong>${h.date}</strong><br>
        División: ${h.divAntes} → <strong>${h.divDespues}</strong><br>
        CECO: ${h.cecoAntes} → <strong>${h.cecoDespues}</strong>
      </div>`).join('')
    : '<p style="color:#888;font-size:12px">Sin reasignaciones registradas.</p>';
  $('modal-hist').classList.add('open');
}

function exportMaestroCSV() {
  exportCSV('maestro_resiter.csv', 'N,Placa,Marca,Anio,Combustible,GPS,Estado,Division,CECO',
    fleet.map(u => `${u.n},${u.placa},${u.marca},${u.anio},${u.comb},${u.gps},${u.estado},${u.division},${u.ceco}`)
  );
  toast('Maestro exportado');
}

// ══════════════════════════════════════════════════
// CONDUCTORES
// ══════════════════════════════════════════════════
function saveConductor() {
  const nombre = $('drv-nom').value.trim();
  const dni    = $('drv-dni').value.trim();
  if (!nombre || !dni) { toast('Nombre y DNI requeridos'); return; }
  conductores.push({ id: drvIdCounter++, nombre, dni, lic: $('drv-lic').value||'—', venc: $('drv-venc').value||'—', tel: $('drv-tel').value||'—', div: $('drv-div').value||'—', unidad: $('drv-unidad').value||'—', estado: $('drv-estado').value });
  ['drv-nom','drv-dni','drv-lic','drv-tel'].forEach(id => $(id).value = '');
  toast(`Conductor ${nombre} registrado`);
  renderConductores(); updateMetrics();
}

function renderConductores() {
  const q  = ($('drv-q').value || '').toLowerCase();
  const fe = $('drv-fest').value;
  const today = new Date();
  const data = conductores.filter(c => {
    if (fe && c.estado !== fe) return false;
    if (q && !`${c.nombre} ${c.dni} ${c.unidad}`.toLowerCase().includes(q)) return false;
    return true;
  });
  $('drv-body').innerHTML = data.map(c => {
    const dl = getDaysLeft(c.venc);
    const vb = dl === null ? '<span class="badge b-gray">—</span>'
      : dl < 0   ? '<span class="badge b-bad">🔴 Vencida</span>'
      : dl < 30  ? `<span class="badge b-warn">⚠️ ${dl}d</span>`
      : `<span class="badge b-ok">✓ ${c.venc}</span>`;
    const eb = c.estado === 'Activo' ? '<span class="badge b-ok">Activo</span>'
      : c.estado === 'Vacaciones'       ? '<span class="badge b-info">Vacaciones</span>'
      : c.estado === 'Descanso médico'  ? '<span class="badge b-warn">Desc. médico</span>'
      : '<span class="badge b-gray">Inactivo</span>';
    return `<tr>
      <td><strong style="font-size:11px">${c.nombre}</strong></td>
      <td style="font-family:var(--font-mono)">${c.dni}</td>
      <td>${c.lic}</td><td>${vb}</td>
      <td>${c.unidad && c.unidad !== '—' ? `<span class="badge b-info">${c.unidad}</span>` : '—'}</td>
      <td>${eb}</td>
      <td><button class="btn sm" onclick="editDrv(${c.id})">✏️</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="7" style="text-align:center;color:#888;padding:12px">Sin conductores aún.</td></tr>';
}

function editDrv(id) {
  const c = conductores.find(x => x.id === id);
  $('md-title').textContent = 'Editar — ' + c.nombre;
  $('md-body').innerHTML = `
    <div class="fg">
      <div class="field"><label>Estado</label><select id="ed-est">
        ${['Activo','Vacaciones','Descanso médico','Inactivo'].map(s=>`<option ${s===c.estado?'selected':''}>${s}</option>`).join('')}
      </select></div>
      <div class="field"><label>Unidad asignada</label><select id="ed-unit">
        <option value="—">— sin asignar —</option>
        ${fleet.map(f=>`<option value="${f.placa}" ${f.placa===c.unidad?'selected':''}>${f.placa} — ${f.marca}</option>`).join('')}
      </select></div>
      <div class="field"><label>Venc. licencia</label><input type="date" id="ed-venc" value="${c.venc !== '—' ? c.venc : ''}"></div>
      <div class="field"><label>Teléfono</label><input type="text" id="ed-tel" value="${c.tel}"></div>
    </div>
    <button class="btn success" onclick="saveDrvEdit(${id})">✅ Guardar cambios</button>`;
  $('modal-drv').classList.add('open');
}

function saveDrvEdit(id) {
  const c = conductores.find(x => x.id === id);
  c.estado = $('ed-est').value;
  c.unidad = $('ed-unit').value;
  c.venc   = $('ed-venc').value || '—';
  c.tel    = $('ed-tel').value || '—';
  closeModal('modal-drv');
  renderConductores(); updateMetrics();
  toast('Conductor actualizado');
}

function exportDrvCSV() {
  exportCSV('conductores_resiter.csv',
    'Nombre,DNI,Licencia,Vencimiento,Telefono,Division,Unidad,Estado',
    conductores.map(c => `"${c.nombre}",${c.dni},${c.lic},${c.venc},${c.tel},${c.div},${c.unidad},${c.estado}`)
  );
  toast('Conductores exportados');
}

// ══════════════════════════════════════════════════
// MANTENIMIENTO
// ══════════════════════════════════════════════════
function fillMntInfo() {
  const u = getUnit($('mnt-placa').value);
  const uic = $('mnt-uic');
  if (!u) { uic.style.display = 'none'; return; }
  uic.style.display = 'block';
  uic.innerHTML = `${divBadge(u.division)} <span class="badge b-info">${u.ceco}</span> &nbsp; ${u.marca} ${u.anio} &nbsp; ${stateBadge(u.estado)}${u.lastKm ? ` &nbsp; KM actual: <strong style="font-family:var(--font-mono)">${u.lastKm.toLocaleString()}</strong>` : ''}`;
  if (u.lastKm) $('mnt-km-act').value = u.lastKm;
}

function saveMnt() {
  const placa = $('mnt-placa').value;
  const fecha = $('mnt-fecha').value;
  if (!placa || !fecha) { toast('Selecciona unidad y fecha'); return; }
  const kmAct  = +$('mnt-km-act').value || 0;
  const kmProx = +$('mnt-km-prox').value || null;
  const today  = new Date();
  const est    = new Date(fecha) < today ? 'venc' : kmProx && kmAct && (kmProx - kmAct) < 5000 ? 'prox' : 'ok';
  mantenimientos.push({ id: mntIdCounter++, placa, tipo: $('mnt-tipo').value, kmAct, kmProx, fecha, taller: $('mnt-taller').value||'—', costo: +$('mnt-costo').value||0, obs: $('mnt-obs').value||'', est });
  toast(`Mantenimiento programado: ${placa}`);
  renderMnt(); updateMetrics();
  [$('mnt-km-act'),$('mnt-km-prox'),$('mnt-fecha'),$('mnt-taller'),$('mnt-costo'),$('mnt-obs')].forEach(e => e.value = '');
  $('mnt-uic').style.display = 'none';
}

function renderMnt() {
  const fd = $('mnt-fdiv').value;
  const fe = $('mnt-fest').value;
  const data = mantenimientos.filter(m => {
    const u = getUnit(m.placa);
    if (fd && (!u || u.division !== fd)) return false;
    if (fe && m.est !== fe) return false;
    return true;
  });
  $('mnt-body').innerHTML = data.map(m => {
    const u   = getUnit(m.placa);
    const pct = m.kmProx && m.kmAct ? Math.min(100, Math.round(m.kmAct/m.kmProx*100)) : null;
    const pcls= pct === null ? '' : pct >= 90 ? 'pf-bad' : pct >= 75 ? 'pf-warn' : 'pf-ok';
    const sb  = m.est === 'ok' ? '<span class="badge b-ok">✓ Al día</span>'
      : m.est === 'prox' ? '<span class="badge b-warn">⚠️ Próximo</span>'
      : '<span class="badge b-bad">🔴 Vencido</span>';
    return `<tr>
      <td><strong>${m.placa}</strong></td>
      <td>${u ? divBadge(u.division) : '—'}</td>
      <td style="font-size:10px">${m.tipo}</td>
      <td style="font-family:var(--font-mono)">${m.kmAct ? m.kmAct.toLocaleString() : '—'}</td>
      <td style="font-family:var(--font-mono)">${m.kmProx ? m.kmProx.toLocaleString() : '—'}</td>
      <td>${m.fecha}</td>
      <td>${pct !== null ? `<div style="font-size:10px;font-family:var(--font-mono)">${pct}%</div><div class="prog"><div class="pf ${pcls}" style="width:${pct}%"></div></div>` : '—'}</td>
      <td>${sb}</td>
      <td><button class="btn sm danger" onclick="delMnt(${m.id})">🗑️</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="9" style="text-align:center;color:#888;padding:12px">Sin mantenimientos registrados.</td></tr>';
}

function delMnt(id) {
  if (!confirm('¿Eliminar este mantenimiento?')) return;
  mantenimientos = mantenimientos.filter(m => m.id !== id);
  renderMnt(); updateMetrics(); toast('Eliminado');
}

// ══════════════════════════════════════════════════
// DOCUMENTOS
// ══════════════════════════════════════════════════
function saveDoc() {
  const placa = $('doc-placa').value;
  const tipo  = $('doc-tipo').value;
  const venc  = $('doc-venc').value;
  if (!placa || !tipo || !venc) { toast('Completa placa, tipo y vencimiento'); return; }
  const u = getUnit(placa);
  docs.push({ id: docIdCounter++, placa, division: u?u.division:'—', ceco: u?u.ceco:'—', tipo, numero: $('doc-numero').value||'—', emision: $('doc-emision').value||'—', venc, entidad: $('doc-entidad').value||'—', costo: +$('doc-costo').value||0, obs: $('doc-obs').value||'' });
  toast(`Documento registrado: ${tipo} — ${placa}`);
  ['doc-numero','doc-emision','doc-venc','doc-entidad','doc-costo','doc-obs'].forEach(id => $(id).value = '');
  renderDocsAlertas(); renderDocs(); updateMetrics();
}

function loadDemoDocs() {
  [
    { placa:'BKW-934', tipo:'SOAT',              num:'SOAT-2025-712', em:'2025-03-01', venc:'2026-02-28', ent:'Rimac',       costo:320 },
    { placa:'CJO-724', tipo:'Revisión técnica',  num:'RT-2025-445',  em:'2025-02-10', venc:'2026-02-09', ent:'MTC',         costo:180 },
    { placa:'BSM-720', tipo:'Póliza de seguro',  num:'POL-66231',    em:'2024-11-01', venc:'2025-10-31', ent:'La Positiva', costo:1650 },
    { placa:'BVS-718', tipo:'SOAT',              num:'SOAT-2025-330', em:'2025-01-15', venc:'2026-01-14', ent:'Rimac',       costo:320 },
    { placa:'CEF-863', tipo:'Permiso de operación', num:'PO-2025-044', em:'2025-01-01', venc:'2025-12-31', ent:'MTC',       costo:450 },
  ].forEach(d => {
    const u = getUnit(d.placa);
    docs.push({ id: docIdCounter++, placa: d.placa, division: u?u.division:'—', ceco: u?u.ceco:'—', tipo: d.tipo, numero: d.num, emision: d.em, venc: d.venc, entidad: d.ent, costo: d.costo, obs:'' });
  });
  renderDocsAlertas(); renderDocs(); updateMetrics();
  toast('Documentos demo cargados');
}

function renderDocsAlertas() {
  const today = new Date();
  const urgent = docs.filter(d => { const dl = getDaysLeft(d.venc); return dl !== null && dl < 60; })
    .sort((a,b) => new Date(a.venc) - new Date(b.venc));
  if (!urgent.length) {
    $('docs-alertas').innerHTML = '<div class="al al-ok"><span>✅</span>No hay documentos por vencer en 60 días.</div>';
    return;
  }
  $('docs-alertas').innerHTML = urgent.map(d => {
    const dl = getDaysLeft(d.venc);
    const cls = dl < 0 ? 'al-bad' : dl < 30 ? 'al-warn' : 'al-info';
    const ico = dl < 0 ? '🔴' : dl < 30 ? '⚠️' : 'ℹ️';
    return `<div class="al ${cls}"><span>${ico}</span><div>
      <strong>${d.placa} — ${d.tipo}</strong> · ${d.numero}<br>
      <span style="font-size:11px">${dl < 0 ? `Vencido hace ${Math.abs(dl)} días` : `Vence en ${dl} días (${d.venc})`} · ${d.entidad} · ${divBadge(d.division)}</span>
    </div></div>`;
  }).join('');
}

function renderDocs() {
  const q  = ($('doc-q').value || '').toLowerCase();
  const ft = $('doc-ftipo').value;
  const fe = $('doc-fest').value;
  const data = docs.filter(d => {
    if (ft && d.tipo !== ft) return false;
    if (fe && getDocState(d.venc) !== fe) return false;
    if (q && !`${d.placa} ${d.tipo} ${d.numero} ${d.entidad}`.toLowerCase().includes(q)) return false;
    return true;
  });
  $('docs-body').innerHTML = data.map(d => {
    const st = getDocState(d.venc);
    const dl = getDaysLeft(d.venc);
    const sb = st === 'ok'   ? '<span class="badge b-ok">✓ Vigente</span>'
      : st === 'prox' ? `<span class="badge b-warn">⚠️ ${dl}d</span>`
      : '<span class="badge b-bad">🔴 Vencido</span>';
    const dlStr = dl === null ? '—'
      : dl < 0  ? `<span style="color:var(--danger);font-weight:700;font-family:var(--font-mono)">${dl}d</span>`
      : dl < 30 ? `<span style="color:var(--warning);font-family:var(--font-mono)">${dl}d</span>`
      : `<span style="font-family:var(--font-mono)">${dl}d</span>`;
    return `<tr>
      <td><strong>${d.placa}</strong></td>
      <td>${divBadge(d.division)}</td>
      <td style="font-size:10px">${d.ceco}</td>
      <td><span class="badge b-info" style="font-size:10px">${d.tipo}</span></td>
      <td style="font-size:10px;font-family:var(--font-mono)">${d.numero}</td>
      <td>${d.venc}</td>
      <td>${dlStr}</td>
      <td style="font-size:10px">${d.entidad}</td>
      <td style="font-family:var(--font-mono)">S/. ${d.costo.toLocaleString()}</td>
      <td>${sb}</td>
      <td><button class="btn sm danger" onclick="deleteDoc(${d.id})">🗑️</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="11" style="text-align:center;color:#888;padding:12px">Sin documentos. Registra o carga datos demo.</td></tr>';
}

function deleteDoc(id) {
  if (!confirm('¿Eliminar este documento?')) return;
  docs = docs.filter(d => d.id !== id);
  renderDocsAlertas(); renderDocs(); updateMetrics(); toast('Documento eliminado');
}

function exportDocsCSV() {
  exportCSV('documentos_resiter.csv',
    'Placa,Division,CECO,Tipo,Numero,Emision,Vencimiento,Dias_restantes,Entidad,Costo_S,Estado',
    docs.map(d => `${d.placa},${d.division},${d.ceco},"${d.tipo}",${d.numero},${d.emision},${d.venc},${getDaysLeft(d.venc)||''},${d.entidad},${d.costo},${getDocState(d.venc)}`)
  );
  toast('Documentos exportados');
}

// ══════════════════════════════════════════════════
// RUTAS Y VIAJES
// ══════════════════════════════════════════════════
function fillRutaInfo() {
  const u = getUnit($('ruta-placa').value);
  const uic = $('ruta-uic');
  if (!u) { uic.style.display = 'none'; return; }
  uic.style.display = 'block';
  uic.innerHTML = `${divBadge(u.division)} <span class="badge b-info">${u.ceco}</span> &nbsp; ${u.marca} ${u.anio} &nbsp; ${stateBadge(u.estado)}${u.lastKm ? ` &nbsp; KM: <strong style="font-family:var(--font-mono)">${u.lastKm.toLocaleString()}</strong>` : ''}`;
  if (u.lastKm) $('ruta-km-ini').value = u.lastKm;
  const drv = conductores.find(c => c.unidad === u.placa);
  if (drv) $('ruta-conductor').value = drv.id;
}

function saveRuta() {
  const placa   = $('ruta-placa').value;
  const origen  = $('ruta-origen').value.trim();
  const destino = $('ruta-destino').value;
  if (!placa || !origen || !destino) { toast('Completa placa, origen y destino'); return; }
  const u   = getUnit(placa);
  const drv = conductores.find(c => c.id == $('ruta-conductor').value);
  rutas.push({
    id: rutaIdCounter++, placa, marca: u?u.marca:'—',
    division: u?u.division:'—', ceco: destino,
    conductor: drv ? drv.nombre : 'No asignado',
    origen, destino,
    salida: $('ruta-salida').value, llegada: '',
    kmIni: +$('ruta-km-ini').value||0,
    kmProg: +$('ruta-km-prog').value||0,
    kmReal: null,
    carga: $('ruta-carga').value,
    obs: $('ruta-obs').value||'',
    estado: 'En ruta', fechaFin: null
  });
  toast(`Viaje iniciado: ${placa} → ${destino}`);
  ['ruta-origen','ruta-km-ini','ruta-km-prog','ruta-obs'].forEach(id => $(id).value = '');
  renderViajesActivos(); renderRutas(); updateMetrics();
}

function loadDemoRutas() {
  [
    { placa:'BWY-778', origen:'Lima',      destino:'Las Bambas',         kmProg:850, kmReal:862, carga:'Equipos',            estado:'Completado' },
    { placa:'BSA-733', origen:'Lima',      destino:'Minsur San Rafael',  kmProg:320, kmReal:318, carga:'Residuos sólidos',   estado:'Completado' },
    { placa:'BEO-894', origen:'Lima',      destino:'Ag-Chinalco',        kmProg:95,  kmReal:97,  carga:'Personal',           estado:'Completado' },
    { placa:'AUG-754', origen:'Lima',      destino:'Chiclayo',           kmProg:770, kmReal:null,carga:'Residuos sólidos',   estado:'En ruta'    },
    { placa:'CBF-721', origen:'Cajamarca', destino:'Antamina',           kmProg:180, kmReal:null,carga:'Materiales',         estado:'En ruta'    },
    { placa:'CEF-863', origen:'Lima',      destino:'Pisco',              kmProg:242, kmReal:245, carga:'Residuos peligrosos',estado:'Completado' },
    { placa:'CJO-724', origen:'Cusco',     destino:'Las Bambas',         kmProg:95,  kmReal:null,carga:'Equipos',            estado:'En ruta'    },
  ].forEach(d => {
    const u   = getUnit(d.placa);
    const drv = conductores.find(c => c.unidad === d.placa);
    rutas.push({
      id: rutaIdCounter++, placa: d.placa, marca: u?u.marca:'—',
      division: u?u.division:'—', ceco: d.destino,
      conductor: drv ? drv.nombre : '—',
      origen: d.origen, destino: d.destino,
      salida: `2025-05-${String(Math.floor(Math.random()*13+1)).padStart(2,'0')}T08:00`,
      llegada: '', kmIni: u?u.lastKm||0:0, kmProg: d.kmProg, kmReal: d.kmReal,
      carga: d.carga, obs: '', estado: d.estado, fechaFin: d.kmReal ? '2025-05-13' : null
    });
  });
  renderViajesActivos(); renderRutas(); updateMetrics();
  toast('Rutas demo cargadas');
}

function completarViaje(id) {
  const r = rutas.find(x => x.id === id); if (!r) return;
  const kmFinal = prompt(`KM final del odómetro para ${r.placa}\n(KM inicial: ${r.kmIni.toLocaleString()}):`);
  if (!kmFinal) return;
  const kmF = +kmFinal;
  r.kmReal   = kmF > r.kmIni ? kmF - r.kmIni : r.kmProg;
  r.estado   = 'Completado';
  r.fechaFin = new Date().toISOString().split('T')[0];
  const u = getUnit(r.placa); if (u && kmF > u.lastKm) u.lastKm = kmF;
  toast(`Viaje ${r.placa} completado — ${r.kmReal.toLocaleString()} km`);
  renderViajesActivos(); renderRutas(); updateMetrics();
}

function renderViajesActivos() {
  const activos = rutas.filter(r => r.estado === 'En ruta');
  $('viajes-activos').innerHTML = activos.length
    ? activos.map(r => {
        const pct = r.kmProg ? Math.min(92, Math.floor(Math.random()*55+20)) : 0;
        return `<div class="viaje-card">
          <div class="route-line">
            <span class="route-dot"></span>
            ${r.origen}
            <div class="route-bar"><div class="route-bar-fill" style="width:${pct}%"></div></div>
            <span class="route-dot end"></span>
            ${r.destino}
          </div>
          <div style="font-size:11px;color:#888;margin-bottom:8px">${r.placa} — ${r.marca} &nbsp;·&nbsp; ${r.conductor} &nbsp;·&nbsp; ${r.carga}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:6px;font-size:11px;margin-bottom:8px">
            <div>${divBadge(r.division)}</div>
            <div><span style="color:#888">Salida:</span> ${fmtDT(r.salida)}</div>
            <div><span style="color:#888">KM prog.:</span> <strong style="font-family:var(--font-mono)">${r.kmProg ? r.kmProg.toLocaleString() : '—'}</strong></div>
            <div><span style="color:#888">Progreso:</span> ~${pct}%</div>
          </div>
          <div class="prog"><div class="pf pf-blue" style="width:${pct}%"></div></div>
          <div style="margin-top:8px;display:flex;gap:6px">
            <button class="btn sm success" onclick="completarViaje(${r.id})">✅ Completar viaje</button>
            <button class="btn sm" onclick="verViaje(${r.id})">👁️ Ver detalle</button>
          </div>
        </div>`;
      }).join('')
    : '<div style="text-align:center;padding:20px;color:#888;font-size:12px">Sin viajes activos en este momento.</div>';
}

function renderRutas() {
  const q  = ($('ruta-q').value || '').toLowerCase();
  const fe = $('ruta-fest').value;
  const data = rutas.filter(r => {
    if (fe && r.estado !== fe) return false;
    if (q && !`${r.placa} ${r.destino} ${r.origen} ${r.conductor}`.toLowerCase().includes(q)) return false;
    return true;
  });
  $('rutas-body').innerHTML = data.map(r => {
    const var_km = r.kmReal && r.kmProg ? r.kmReal - r.kmProg : null;
    const varBadge = var_km === null ? '—'
      : Math.abs(var_km) <= 20 ? `<span class="badge b-ok">+${var_km}</span>`
      : var_km > 0 ? `<span class="badge b-warn">+${var_km}</span>`
      : `<span class="badge b-info">${var_km}</span>`;
    const estBadge = r.estado === 'En ruta'     ? '<span class="badge b-ok">🟢 En ruta</span>'
      : r.estado === 'Completado' ? '<span class="badge b-info">✓ Completado</span>'
      : '<span class="badge b-bad">✕ Cancelado</span>';
    return `<tr>
      <td style="font-family:var(--font-mono)">${r.id}</td>
      <td><strong>${r.placa}</strong></td>
      <td>${divBadge(r.division)}</td>
      <td style="font-size:11px">${r.conductor}</td>
      <td>${r.origen}</td><td><strong>${r.destino}</strong></td>
      <td style="font-size:11px">${fmtDT(r.salida)}</td>
      <td style="font-family:var(--font-mono)">${r.kmProg ? r.kmProg.toLocaleString() : '—'}</td>
      <td style="font-family:var(--font-mono)">${r.kmReal ? r.kmReal.toLocaleString() : '—'}</td>
      <td>${varBadge}</td>
      <td style="font-size:10px">${r.carga}</td>
      <td>${estBadge}</td>
      <td><button class="btn sm" onclick="verViaje(${r.id})">👁️</button></td>
    </tr>`;
  }).join('') || '<tr><td colspan="13" style="text-align:center;color:#888;padding:12px">Sin rutas. Registra o carga datos demo.</td></tr>';
}

function verViaje(id) {
  const r = rutas.find(x => x.id === id); if (!r) return;
  const var_km = r.kmReal && r.kmProg ? r.kmReal - r.kmProg : null;
  $('mv-title').textContent = `Viaje #${r.id} — ${r.placa}`;
  $('mv-body').innerHTML = `
    <div class="stat-card-row">
      <div class="stat-card"><div class="sc-val">${r.placa}</div><div class="sc-lbl">Unidad</div></div>
      <div class="stat-card"><div class="sc-val">${r.kmProg ? r.kmProg.toLocaleString() : '—'}</div><div class="sc-lbl">KM programados</div></div>
      <div class="stat-card"><div class="sc-val">${r.kmReal ? r.kmReal.toLocaleString() : '—'}</div><div class="sc-lbl">KM reales</div></div>
      <div class="stat-card"><div class="sc-val" style="color:${var_km === null ? 'inherit' : Math.abs(var_km) <= 20 ? 'var(--success)' : 'var(--warning)'}">${var_km !== null ? (var_km >= 0 ? '+' : '') + var_km + ' km' : '—'}</div><div class="sc-lbl">Variación</div></div>
    </div>
    <table style="width:100%;font-size:12px">
      <tr><td style="color:#888;padding:4px 0;width:120px">Conductor:</td><td><strong>${r.conductor}</strong></td></tr>
      <tr><td style="color:#888;padding:4px 0">Ruta:</td><td>${r.origen} → ${r.destino}</td></tr>
      <tr><td style="color:#888;padding:4px 0">División:</td><td>${divBadge(r.division)}</td></tr>
      <tr><td style="color:#888;padding:4px 0">CECO:</td><td>${r.ceco}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Salida:</td><td>${fmtDT(r.salida) || '—'}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Tipo de carga:</td><td>${r.carga}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Estado:</td><td>${r.estado}</td></tr>
      <tr><td style="color:#888;padding:4px 0">Observaciones:</td><td>${r.obs || 'Sin observaciones'}</td></tr>
    </table>`;
  $('modal-viaje').classList.add('open');
}

function exportRutasCSV() {
  exportCSV('rutas_resiter.csv',
    'ID,Placa,Division,CECO,Conductor,Origen,Destino,KM_Prog,KM_Real,Variacion,Carga,Estado',
    rutas.map(r => `${r.id},${r.placa},${r.division},${r.ceco},"${r.conductor}",${r.origen},${r.destino},${r.kmProg||''},${r.kmReal||''},${r.kmReal&&r.kmProg?r.kmReal-r.kmProg:''},${r.carga},${r.estado}`)
  );
  toast('Rutas exportadas');
}

// ══════════════════════════════════════════════════
// ZONAS / CECO
// ══════════════════════════════════════════════════
function renderZonas() {
  const pills = ['Todas', ...DIVISIONS];
  $('zona-pills').innerHTML = pills.map((d, i) =>
    `<button class="pill ${i===0?'active':''}" onclick="filterZonas('${d}',this)">${d}</button>`
  ).join('');
  buildZonaGrid('Todas');
}

function filterZonas(div, btn) {
  document.querySelectorAll('#zona-pills .pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  buildZonaGrid(div);
}

function buildZonaGrid(div) {
  const m = {};
  fleet.forEach(u => {
    if (div !== 'Todas' && u.division !== div) return;
    if (!m[u.ceco]) m[u.ceco] = { div: u.division, units: [], enUso: 0 };
    m[u.ceco].units.push(u);
    if (u.estado === 'EN USO') m[u.ceco].enUso++;
  });
  $('zona-grid').innerHTML = Object.entries(m).map(([ceco, d]) => {
    const col  = DIV_COLORS[d.div] || '#1B4FD8';
    const rends= d.units.filter(u => u.lastRend);
    const avg  = rends.length ? (rends.reduce((s,u) => s+u.lastRend, 0)/rends.length).toFixed(1) : null;
    return `<div class="zone-card" onclick="showZoneDet('${ceco}')">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:11px;font-weight:700;color:${col}">● ${ceco}</span>
        <span class="badge b-info">${d.units.length}</span>
      </div>
      <div style="font-size:10px;color:#888">${d.div}</div>
      ${avg ? `<div style="font-size:12px;font-weight:700;margin-top:4px;font-family:var(--font-mono)">${avg} km/gal</div>` : ''}
      <div class="prog" style="margin-top:5px"><div class="pf pf-ok" style="width:${Math.round(d.enUso/d.units.length*100)}%"></div></div>
      <div style="font-size:10px;color:#888;margin-top:2px">${d.enUso}/${d.units.length} en uso</div>
    </div>`;
  }).join('');
}

function showZoneDet(ceco) {
  const units = fleet.filter(u => u.ceco === ceco);
  $('zona-det-title').textContent = `📋 ${ceco} — ${units.length} unidades`;
  $('zona-det-body').innerHTML = units.map((u, i) => {
    const d = conductores.find(c => c.unidad === u.placa);
    return `<tr>
      <td>${i+1}</td><td><strong>${u.placa}</strong></td>
      <td>${u.marca}</td><td>${u.anio}</td>
      <td style="font-size:10px">${u.gps}</td>
      <td>${stateBadge(u.estado)}</td>
      <td>${combBadge(u.comb)}</td>
      <td style="font-size:10px">${d ? d.nombre.split(',')[0] : '—'}</td>
    </tr>`;
  }).join('');
  $('zona-det').style.display = 'block';
  $('zona-det').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function buildDivChart() {
  const dm = {};
  fleet.forEach(u => { dm[u.division] = (dm[u.division]||0) + 1; });
  const labels = Object.keys(dm), vals = labels.map(l => dm[l]);
  if (chartDiv) chartDiv.destroy();
  chartDiv = new Chart($('divChart'), {
    type: 'doughnut',
    data: { labels, datasets: [{ data: vals, backgroundColor: labels.map(l => DIV_COLORS[l]||'#999'), borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{ font:{size:11}, boxWidth:12 } } } }
  });
}

// ══════════════════════════════════════════════════
// COMPARATIVO
// ══════════════════════════════════════════════════
function switchComp(key, btn) {
  document.querySelectorAll('#tab-c-comparativo .pill').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  renderComparativo(key);
}

function renderComparativo(key) {
  const m = {};
  fleet.filter(f => f.lastRend).forEach(f => {
    const k = f[key] || '—';
    if (!m[k]) m[k] = { sum: 0, n: 0 };
    m[k].sum += f.lastRend; m[k].n++;
  });
  const entries = Object.entries(m).map(([k,v]) => ({ label:k, avg: v.sum/v.n, n:v.n })).sort((a,b) => b.avg - a.avg);
  const maxAvg = entries[0]?.avg || 1;
  $('comp-bars').innerHTML = entries.map(e => {
    const pct = Math.round(e.avg / maxAvg * 100);
    const col = e.avg >= 35 ? '#16A34A' : e.avg >= 25 ? '#D97706' : '#DC2626';
    return `<div class="comp-row">
      <div style="width:150px;font-size:11px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis" title="${e.label}">${e.label}</div>
      <div class="comp-bar-wrap"><div class="comp-bar" style="width:${pct}%;background:${col}"></div></div>
      <div style="width:110px;text-align:right;font-size:11px">${rendChip(e.avg)} km/gal</div>
      <div style="width:40px;text-align:right;font-size:10px;color:#888">${e.n}u</div>
    </div>`;
  }).join('') || '<p style="color:#888;font-size:12px">Sin datos de rendimiento. Carga abastecimientos.</p>';

  // Rankings
  const sorted = fleet.filter(f => f.lastRend).sort((a,b) => b.lastRend - a.lastRend);
  const rankRow = (f, i) => `<div style="display:flex;align-items:center;gap:6px;padding:4px 0;border-bottom:1px solid var(--border);font-size:11px">
    <span style="width:18px;color:#888;font-family:var(--font-mono)">${i+1}</span>
    <strong>${f.placa}</strong>
    <span style="color:#888;flex:1;font-size:10px">${f.marca}</span>
    ${rendChip(f.lastRend)}
  </div>`;
  $('rank-best').innerHTML  = sorted.slice(0, 10).map(rankRow).join('');
  $('rank-worst').innerHTML = sorted.slice(-10).reverse().map(rankRow).join('');
}

function buildCompChart() {
  const combData = {};
  fleet.filter(f => f.lastRend && f.comb !== '—').forEach(f => {
    if (!combData[f.comb]) combData[f.comb] = [];
    combData[f.comb].push(f.lastRend);
  });
  const labels = Object.keys(combData);
  const avgs   = labels.map(l => { const a = combData[l]; return +(a.reduce((s,v)=>s+v,0)/a.length).toFixed(1); });
  const colors = { DIESEL:'#1B4FD8', GNV:'#16A34A', GASOLINA:'#D97706', ELECTRICO:'#7C3AED' };
  if (chartComp) chartComp.destroy();
  chartComp = new Chart($('compChart'), {
    type: 'bar',
    data: { labels, datasets: [{ label:'Rend. prom. km/gal', data:avgs, backgroundColor: labels.map(l=>colors[l]||'#999'), borderRadius:6, borderSkipped:false }] },
    options: { responsive:true, maintainAspectRatio:false, plugins:{ legend:{display:false} }, scales:{ y:{ min:0, title:{display:true,text:'km/gal'} } } }
  });
}

// ══════════════════════════════════════════════════
// REPORTES / PDF
// ══════════════════════════════════════════════════
function buildPDF() {
  const tipo  = $('pdf-tipo').value;
  const div   = $('pdf-div').value || 'Todas las divisiones';
  const ini   = $('pdf-ini').value || '—';
  const fin   = $('pdf-fin').value || '—';
  const autor = $('pdf-autor').value || 'Supervisor';
  const fecha = new Date().toLocaleDateString('es-PE', { dateStyle:'full' });
  const rends = fleet.filter(f => f.lastRend && (!$('pdf-div').value || f.division === $('pdf-div').value));
  const avg   = rends.length ? (rends.reduce((s,f)=>s+f.lastRend,0)/rends.length).toFixed(1) : '—';

  let body = '';

  if (tipo === 'ejecutivo') {
    const divStats = {};
    fleet.forEach(f => {
      if (!divStats[f.division]) divStats[f.division] = { total:0, enUso:0, rends:[] };
      divStats[f.division].total++;
      if (f.estado === 'EN USO') divStats[f.division].enUso++;
      if (f.lastRend) divStats[f.division].rends.push(f.lastRend);
    });
    body = `REPORTE EJECUTIVO — FLOTA RESITER PERÚ
${'═'.repeat(60)}
Fecha:          ${fecha}
Período:        ${ini} al ${fin}
Preparado por:  ${autor}
División:       ${div}

INDICADORES PRINCIPALES
${'─'.repeat(60)}
Total unidades en flota:            ${fleet.length}
Unidades en uso:                    ${fleet.filter(f=>f.estado==='EN USO').length}
Unidades en reparación:             ${fleet.filter(f=>f.estado==='EN REPARACION').length}
Unidades en comisaría:              ${fleet.filter(f=>f.estado==='COMISARIA').length}
Rendimiento promedio global:        ${avg} km/gal
Unidades óptimas (≥35 km/gal):      ${fleet.filter(f=>f.lastRend&&f.lastRend>=35).length}
Unidades críticas (<25 km/gal):     ${fleet.filter(f=>f.lastRend&&f.lastRend<25).length}
Conductores registrados:            ${conductores.length}
Mantenimientos pendientes:          ${mantenimientos.filter(m=>m.est!=='ok').length}
Documentos por vencer (60d):        ${docs.filter(d=>{const dl=getDaysLeft(d.venc);return dl!==null&&dl>=0&&dl<60;}).length}
Documentos vencidos:                ${docs.filter(d=>{const dl=getDaysLeft(d.venc);return dl!==null&&dl<0;}).length}
Rutas registradas:                  ${rutas.length}
Viajes activos:                     ${rutas.filter(r=>r.estado==='En ruta').length}

RENDIMIENTO POR DIVISIÓN
${'─'.repeat(60)}
${Object.entries(divStats).map(([d,v])=>`${d.padEnd(22)} ${v.total} u.  ${v.enUso} en uso  ${v.rends.length?((v.rends.reduce((s,r)=>s+r,0)/v.rends.length).toFixed(1)+' km/gal'):'sin datos'}`).join('\n')}

UNIDADES CRÍTICAS (<25 km/gal)
${'─'.repeat(60)}
${fleet.filter(f=>f.lastRend&&f.lastRend<25).map(f=>`${f.placa.padEnd(12)} ${f.marca.padEnd(16)} ${f.ceco.padEnd(24)} ${f.lastRend.toFixed(1)} km/gal`).join('\n')||'Ninguna con datos registrados'}

VIAJES EN RUTA
${'─'.repeat(60)}
${rutas.filter(r=>r.estado==='En ruta').map(r=>`${r.placa.padEnd(12)} ${r.origen} → ${r.destino}  ${r.kmProg?r.kmProg+' km':''}`).join('\n')||'Ninguno activo'}

ALERTAS DE DOCUMENTOS (próximos 60 días)
${'─'.repeat(60)}
${docs.filter(d=>{const dl=getDaysLeft(d.venc);return dl!==null&&dl<60;}).map(d=>`${d.placa.padEnd(12)} ${d.tipo.padEnd(22)} Vence: ${d.venc}  ${getDaysLeft(d.venc)<0?'VENCIDO':'En '+getDaysLeft(d.venc)+' días'}`).join('\n')||'Sin alertas'}

${'═'.repeat(60)}
Sistema de Control de Flota — Resiter Perú
${fecha}`;
  } else if (tipo === 'rendimiento') {
    body = `REPORTE DE RENDIMIENTO POR UNIDAD — RESITER PERÚ
${'═'.repeat(60)}
Fecha: ${fecha} | Período: ${ini} → ${fin}
División: ${div} | Preparado por: ${autor}

${'Placa'.padEnd(12)}${'Marca'.padEnd(18)}${'División'.padEnd(16)}${'CECO'.padEnd(22)}${'KM actual'.padEnd(12)}${'Rend. km/gal'}
${'─'.repeat(90)}
${rends.sort((a,b)=>b.lastRend-a.lastRend).map(f=>`${f.placa.padEnd(12)}${f.marca.padEnd(18)}${f.division.padEnd(16)}${f.ceco.substring(0,20).padEnd(22)}${(f.lastKm?.toLocaleString()||'—').padEnd(12)}${f.lastRend.toFixed(1)}`).join('\n')}
${'─'.repeat(90)}
Promedio: ${avg} km/gal  |  Total unidades: ${rends.length}`;
  } else if (tipo === 'documentos') {
    body = `REPORTE DE DOCUMENTOS — RESITER PERÚ
${'═'.repeat(60)}
Fecha: ${fecha} | Preparado por: ${autor}

${'Placa'.padEnd(12)}${'Tipo'.padEnd(24)}${'Número'.padEnd(16)}${'Vencimiento'.padEnd(14)}${'Estado'.padEnd(12)}${'Entidad'}
${'─'.repeat(90)}
${docs.map(d=>{const dl=getDaysLeft(d.venc);const st=dl===null?'—':dl<0?'VENCIDO':dl<60?`${dl}d`:'Vigente';return`${d.placa.padEnd(12)}${d.tipo.substring(0,22).padEnd(24)}${d.numero.substring(0,14).padEnd(16)}${d.venc.padEnd(14)}${st.padEnd(12)}${d.entidad}`;}).join('\n')||'Sin documentos'}
${'─'.repeat(90)}
Total: ${docs.length}  |  Vencidos: ${docs.filter(d=>getDaysLeft(d.venc)<0).length}  |  Por vencer (60d): ${docs.filter(d=>{const dl=getDaysLeft(d.venc);return dl>=0&&dl<60;}).length}`;
  } else if (tipo === 'rutas') {
    body = `REPORTE DE RUTAS — RESITER PERÚ
${'═'.repeat(60)}
Fecha: ${fecha} | Preparado por: ${autor}

${'ID'.padEnd(4)}${'Placa'.padEnd(12)}${'Origen'.padEnd(16)}${'Destino'.padEnd(22)}${'KM Prog.'.padEnd(10)}${'KM Real'.padEnd(10)}${'Var.'.padEnd(8)}${'Estado'}
${'─'.repeat(90)}
${rutas.map(r=>{const v=r.kmReal&&r.kmProg?r.kmReal-r.kmProg:null;return`${String(r.id).padEnd(4)}${r.placa.padEnd(12)}${r.origen.substring(0,14).padEnd(16)}${r.destino.substring(0,20).padEnd(22)}${String(r.kmProg||'—').padEnd(10)}${String(r.kmReal||'—').padEnd(10)}${String(v!==null?(v>=0?'+':'')+v:'—').padEnd(8)}${r.estado}`;}).join('\n')||'Sin rutas'}
${'─'.repeat(90)}
Total: ${rutas.length}  |  Activos: ${rutas.filter(r=>r.estado==='En ruta').length}  |  Completados: ${rutas.filter(r=>r.estado==='Completado').length}`;
  } else if (tipo === 'mantenimiento') {
    body = `REPORTE DE MANTENIMIENTO — RESITER PERÚ
${'═'.repeat(60)}
Fecha: ${fecha} | Preparado por: ${autor}

${'Placa'.padEnd(12)}${'Tipo'.padEnd(26)}${'KM actual'.padEnd(12)}${'KM próx.'.padEnd(12)}${'Fecha'.padEnd(12)}${'Costo S/'.padEnd(10)}${'Estado'}
${'─'.repeat(90)}
${mantenimientos.map(m=>`${m.placa.padEnd(12)}${m.tipo.substring(0,24).padEnd(26)}${String(m.kmAct||'—').padEnd(12)}${String(m.kmProx||'—').padEnd(12)}${m.fecha.padEnd(12)}${String(m.costo).padEnd(10)}${m.est==='ok'?'Al día':m.est==='prox'?'Próximo':'VENCIDO'}`).join('\n')||'Sin registros'}
${'─'.repeat(90)}
Total: ${mantenimientos.length}  |  Vencidos: ${mantenimientos.filter(m=>m.est==='venc').length}  |  Próximos: ${mantenimientos.filter(m=>m.est==='prox').length}`;
  }

  $('pdf-preview').textContent = body;
}

function downloadPDF() {
  const content = $('pdf-preview').textContent;
  const tipo = $('pdf-tipo').value;
  exportCSV(`reporte_resiter_${tipo}_${new Date().toISOString().split('T')[0]}.txt`, content, []);
  toast('Reporte descargado');
}

function exportRptCSV() {
  const rends = fleet.filter(f => f.lastRend);
  exportCSV('reporte_rendimiento_resiter.csv',
    'Placa,Marca,Division,CECO,KM,Rendimiento',
    rends.map(f => `${f.placa},${f.marca},${f.division},${f.ceco},${f.lastKm||''},${f.lastRend||''}`)
  );
  toast('Reporte CSV exportado');
}

function copyReport() {
  navigator.clipboard.writeText($('pdf-preview').textContent)
    .then(() => toast('Reporte copiado al portapapeles'))
    .catch(() => toast('Error al copiar — usa Ctrl+A / Ctrl+C manualmente'));
}

// ══════════════════════════════════════════════════
// ASISTENTE IA
// ══════════════════════════════════════════════════
async function sendIA() {
  const inp = $('ia-inp').value.trim(); if (!inp) return;
  $('ia-inp').value = '';
  appendBubble('user', inp);
  iaHistory.push({ role:'user', content:inp });
  const btn = $('ia-btn');
  btn.disabled = true; btn.textContent = '⏳';

  const sys = `Eres el asistente experto de supervisión de flota vehicular de Resiter Perú. 
Conoces gestión de flotas, mantenimiento preventivo/correctivo, análisis de combustible, 
normativas MTC en Perú, costos operativos y KPIs de transporte.
${buildFleetContext()}
Responde siempre en español. Sé conciso y da recomendaciones concretas y accionables. 
Usa listas cuando sea útil para la claridad.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1024, system:sys, messages:iaHistory })
    });
    const data = await res.json();
    const text = data.content?.map(c => c.text||'').join('') || 'Sin respuesta del servidor.';
    iaHistory.push({ role:'assistant', content:text });
    appendBubble('bot', text);
  } catch (e) {
    appendBubble('bot', 'Error de conexión. Verifica tu acceso a internet e intenta nuevamente.');
  }
  btn.disabled = false; btn.innerHTML = '📤 Enviar';
}

function quickIA(q) { $('ia-inp').value = q; sendIA(); }

function appendBubble(role, text) {
  const chat = $('ia-chat');
  const d    = document.createElement('div');
  d.className = 'ia-bubble ' + (role === 'user' ? 'ia-user' : 'ia-bot');
  d.textContent = text;
  chat.appendChild(d);
  chat.scrollTop = chat.scrollHeight;
}

// ══════════════════════════════════════════════════
// RELOJ
// ══════════════════════════════════════════════════
function updateClock() {
  const now = new Date();
  const str = now.toLocaleString('es-PE', { dateStyle:'medium', timeStyle:'short' });
  if ($('sidebarClock')) $('sidebarClock').textContent = str;
}
setInterval(updateClock, 1000);

// ══════════════════════════════════════════════════
// INICIALIZACIÓN
// ══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initNav();
  populateAll();
  updateMetrics();
  updateClock();

  // Defaults de fechas
  const now = new Date().toISOString();
  if ($('odo-fecha'))  $('odo-fecha').value  = now.slice(0, 16);
  if ($('fuel-fecha')) $('fuel-fecha').value = now.split('T')[0];
  if ($('mnt-fecha'))  $('mnt-fecha').value  = new Date(Date.now()+7*86400000).toISOString().split('T')[0];
  if ($('doc-emision'))$('doc-emision').value= now.split('T')[0];
  if ($('ruta-salida'))$('ruta-salida').value= now.slice(0, 16);
  if ($('pdf-ini'))    $('pdf-ini').value    = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  if ($('pdf-fin'))    $('pdf-fin').value    = now.split('T')[0];

  // Render inicial
  renderDash();
  setTimeout(() => { renderTrend(); renderDashAlertas(); }, 200);
});


// ══════════════════════════════════════════════════
// ╔═══════════════════════════════════════════════╗
// ║  ZONA DE MEJORAS — AGREGA TUS MÓDULOS AQUÍ   ║
// ║                                               ║
// ║  Para agregar un nuevo módulo:               ║
// ║  1. Crea tu función en esta sección          ║
// ║  2. Agrega el botón en el sidebar (HTML)     ║
// ║  3. Agrega el tab div en tabArea (HTML)      ║
// ║  4. Agrega el case en goTab()                ║
// ║  5. Agrega el título en TAB_TITLES           ║
// ╚═══════════════════════════════════════════════╝
// ══════════════════════════════════════════════════

/*
  EJEMPLO DE MEJORA — Control de combustible por proveedor:

  function renderProveedores() {
    const provData = {};
    records.filter(r => r.type === 'fuel').forEach(r => {
      if (!provData[r.detail]) provData[r.detail] = { n:0, gal:0, total:0 };
      provData[r.detail].n++;
      provData[r.detail].gal += r.gal || 0;
      provData[r.detail].total += r.total || 0;
    });
    // ... renderizar tabla
  }

  EJEMPLO — Exportar reporte a Excel con SheetJS:

  function exportExcelReport() {
    // Requiere agregar SheetJS desde CDN en index.html
    // <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(fleet.map(f => ({ Placa:f.placa, Marca:f.marca, ... })));
    XLSX.utils.book_append_sheet(wb, ws, 'Flota');
    XLSX.writeFile(wb, 'resiter_flota.xlsx');
  }
*/
