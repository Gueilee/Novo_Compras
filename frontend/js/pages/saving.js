/* ============================================================
   SHP — PAINEL DE SAVING
   Visão de efetividade das negociações por comprador / requisição
   ============================================================ */
(() => {
'use strict';

/* ── Formatters ─────────────────────────────────────────── */
const _R$ = v => (+(v ?? 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const _pct = v => `${(+(v ?? 0)).toFixed(1)}%`;
const _dt  = s => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('pt-BR'); } catch { return s; }
};

/* ── State ──────────────────────────────────────────────── */
let _dados  = null;
let _sortCol = 'saving_abs';
let _sortAsc = false;
let _fComp   = '';
let _fUnit   = '';

/* ══════════════════════════════════════════════════════════
   RENDER — skeleton (chamado pelo router, síncrono)
══════════════════════════════════════════════════════════ */
function render() {
  document.getElementById('page-content').innerHTML = `
<style>
/* ── Saving — hero ─────────────────────────────────── */
.sav-hero {
  background: linear-gradient(135deg, #064e3b 0%, #065f46 55%, #047857 100%);
  border-radius: 16px;
  padding: 32px 36px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
  position: relative;
  overflow: hidden;
}
.sav-hero::before {
  content: '';
  position: absolute; top: -50px; right: -50px;
  width: 220px; height: 220px;
  border-radius: 50%;
  background: rgba(255,255,255,.06);
}
.sav-hero::after {
  content: '';
  position: absolute; bottom: -70px; left: 80px;
  width: 180px; height: 180px;
  border-radius: 50%;
  background: rgba(255,255,255,.04);
}
.sav-hero-left { position: relative; z-index: 1; }
.sav-hero-label {
  font-size: 12px; text-transform: uppercase;
  letter-spacing: .1em; opacity: .75; margin-bottom: 8px;
}
.sav-hero-value {
  font-size: 42px; font-weight: 800;
  letter-spacing: -.02em; line-height: 1.1;
}
.sav-hero-sub { font-size: 14px; opacity: .68; margin-top: 10px; }
.sav-hero-right {
  display: flex; gap: 16px; position: relative; z-index: 1; flex-wrap: wrap;
}
.sav-hero-stat {
  background: rgba(255,255,255,.13);
  border: 1px solid rgba(255,255,255,.2);
  border-radius: 12px;
  padding: 16px 24px;
  min-width: 120px;
  text-align: center;
  backdrop-filter: blur(4px);
}
.sav-hero-stat-val { font-size: 22px; font-weight: 800; }
.sav-hero-stat-lbl {
  font-size: 10px; opacity: .72; margin-top: 5px;
  text-transform: uppercase; letter-spacing: .07em;
}

/* ── Filters ─────────────────────────────────────────── */
.sav-filters {
  display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap;
  margin-bottom: 24px;
}
.sav-filters label {
  display: block; font-size: 11px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: .06em; margin-bottom: 5px;
}
.sav-filters select {
  height: 38px; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 0 12px; font-size: 13px; color: #1e293b;
  background: #fff; cursor: pointer; min-width: 185px;
}
.sav-filters select:focus { outline: none; border-color: #059669; box-shadow: 0 0 0 3px rgba(5,150,105,.12); }
.sav-btn-filter {
  height: 38px; padding: 0 20px; border-radius: 8px;
  background: #059669; color: #fff; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 8px;
  transition: background .15s;
}
.sav-btn-filter:hover { background: #047857; }

/* ── Section title ───────────────────────────────────── */
.sav-section-title {
  font-size: 15px; font-weight: 700; color: #1e293b;
  margin: 0 0 14px 0; display: flex; align-items: center; gap: 10px;
}
.sav-section-title::before {
  content: ''; display: block; width: 3px; height: 18px;
  background: #059669; border-radius: 2px; flex-shrink: 0;
}

/* ── Ranking ─────────────────────────────────────────── */
.sav-ranking { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
.sav-rank-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex; align-items: center; gap: 16px;
  transition: box-shadow .15s, border-color .15s;
}
.sav-rank-card:first-child {
  border-color: #a7f3d0;
  background: linear-gradient(90deg, #f0fdf4 0%, #fff 60%);
}
.sav-rank-card:hover { box-shadow: 0 4px 18px rgba(0,0,0,.07); }
.sav-rank-pos {
  font-size: 16px; font-weight: 800; color: #94a3b8;
  width: 26px; text-align: center; flex-shrink: 0;
}
.sav-rank-pos.gold   { color: #f59e0b; }
.sav-rank-pos.silver { color: #94a3b8; }
.sav-rank-pos.bronze { color: #b45309; }
.sav-rank-avatar {
  width: 44px; height: 44px; border-radius: 50%;
  background: linear-gradient(135deg, #059669, #34d399);
  color: #fff; font-size: 14px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; letter-spacing: -.02em;
}
.sav-rank-card:nth-child(2) .sav-rank-avatar { background: linear-gradient(135deg, #6366f1, #818cf8); }
.sav-rank-card:nth-child(3) .sav-rank-avatar { background: linear-gradient(135deg, #0ea5e9, #38bdf8); }
.sav-rank-card:nth-child(4) .sav-rank-avatar { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.sav-rank-card:nth-child(5) .sav-rank-avatar { background: linear-gradient(135deg, #ec4899, #f472b6); }
.sav-rank-info { flex: 1; min-width: 0; }
.sav-rank-name  { font-size: 14px; font-weight: 700; color: #1e293b; }
.sav-rank-meta  { font-size: 12px; color: #64748b; margin-top: 3px; }
.sav-rank-bar-wrap { flex: 2.5; min-width: 120px; }
.sav-rank-bar-track {
  height: 6px; background: #e2e8f0; border-radius: 3px; overflow: hidden;
}
.sav-rank-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #059669, #34d399);
  border-radius: 3px;
}
.sav-rank-nums {
  display: flex; flex-direction: column; align-items: flex-end;
  gap: 2px; flex-shrink: 0; min-width: 120px;
}
.sav-rank-val { font-size: 15px; font-weight: 800; color: #059669; }
.sav-rank-pct { font-size: 11px; color: #64748b; }

/* ── Table ───────────────────────────────────────────── */
.sav-table-wrap {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 12px; overflow: hidden;
}
.sav-table-head {
  display: flex; align-items: center; padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0; gap: 12px;
}
.sav-table-head-title {
  font-size: 15px; font-weight: 700; color: #1e293b;
  flex: 1; display: flex; align-items: center; gap: 10px;
}
.sav-table-head-title::before {
  content: ''; display: block; width: 3px; height: 18px;
  background: #059669; border-radius: 2px; flex-shrink: 0;
}
.sav-table-count {
  font-size: 12px; color: #64748b; background: #f1f5f9;
  padding: 3px 10px; border-radius: 20px;
}
.sav-tbl { width: 100%; border-collapse: collapse; }
.sav-tbl th {
  font-size: 11px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: .06em;
  padding: 11px 14px; text-align: left;
  border-bottom: 1px solid #f1f5f9; white-space: nowrap;
  background: #fafafa;
}
.sav-tbl th.sortable { cursor: pointer; user-select: none; }
.sav-tbl th.sortable:hover { color: #059669; }
.sav-tbl th.sort-active { color: #059669; }
.sav-tbl td {
  padding: 12px 14px; border-bottom: 1px solid #f8fafc;
  font-size: 13px; color: #1e293b; vertical-align: middle;
}
.sav-tbl tr:last-child td { border-bottom: none; }
.sav-tbl tr:hover td { background: #f8fffe; }
.sav-preco-base  { color: #94a3b8; text-decoration: line-through; font-size: 12px; }
.sav-preco-arrow { color: #34d399; font-size: 11px; margin: 0 4px; }
.sav-preco-final { color: #059669; font-weight: 700; font-size: 13px; }
.sav-badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: 20px;
  font-size: 11px; font-weight: 700; white-space: nowrap;
}
.sav-badge-xs  { background: #f1f5f9; color: #64748b; }
.sav-badge-low { background: #fef3c7; color: #92400e; }
.sav-badge-mid { background: #d1fae5; color: #065f46; }
.sav-badge-top { background: #059669; color: #fff; }
.sav-cotacoes {
  font-size: 11px; color: #64748b;
  background: #f8fafc; padding: 2px 8px; border-radius: 10px;
  display: inline-flex; align-items: center; gap: 4px;
}
.sav-empty {
  text-align: center; padding: 64px 32px; color: #94a3b8;
}
.sav-empty i { font-size: 44px; margin-bottom: 16px; color: #a7f3d0; display: block; }
.sav-empty p { font-size: 14px; margin: 0; }
.sav-loading {
  text-align: center; padding: 56px 32px;
  color: #94a3b8; font-size: 14px;
}
.sav-loading i { margin-right: 8px; }
</style>

<div id="sav-root">
  <div class="sav-loading">
    <i class="fa-solid fa-circle-notch fa-spin"></i> Carregando dados de saving...
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   INIT — carrega dados (chamado pelo router após render)
══════════════════════════════════════════════════════════ */
async function init() {
  await _carregar();
}

/* ══════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════ */
async function _carregar() {
  try {
    const qs = new URLSearchParams();
    if (_fComp) qs.set('comprador', _fComp);
    if (_fUnit)  qs.set('unidade',   _fUnit);
    const url = '/api/saving/dashboard' + (qs.toString() ? '?' + qs : '');
    _dados = await Api.get(url);
    _renderTudo();
  } catch (e) {
    document.getElementById('sav-root').innerHTML = `
      <div class="sav-empty">
        <i class="fa-solid fa-triangle-exclamation"></i>
        <p>Erro ao carregar dados: ${e.message}</p>
      </div>`;
  }
}

/* ══════════════════════════════════════════════════════════
   RENDER COMPLETO
══════════════════════════════════════════════════════════ */
function _renderTudo() {
  if (!_dados) return;
  const d = _dados;
  document.getElementById('sav-root').innerHTML =
    _buildHero(d) +
    _buildFilters(d) +
    _buildRanking(d) +
    _buildTabela(d);
  _bindEvents();
}

/* ── Hero ─────────────────────────────────────────────── */
function _buildHero(d) {
  const k = d.kpis;
  const top = d.compradores[0];
  return `
<div class="sav-hero">
  <div class="sav-hero-left">
    <div class="sav-hero-label">
      <i class="fa-solid fa-arrow-trend-down"></i>&nbsp; Total Economizado nas Negociações
    </div>
    <div class="sav-hero-value">${_R$(k.total_saving)}</div>
    <div class="sav-hero-sub">
      Em ${k.count} pedido${k.count !== 1 ? 's' : ''} com redução de preço via negociação
    </div>
  </div>
  <div class="sav-hero-right">
    <div class="sav-hero-stat">
      <div class="sav-hero-stat-val">${_pct(k.pct_saving)}</div>
      <div class="sav-hero-stat-lbl">% Saving Médio</div>
    </div>
    <div class="sav-hero-stat">
      <div class="sav-hero-stat-val">${k.count}</div>
      <div class="sav-hero-stat-lbl">Negociações</div>
    </div>
    ${top ? `
    <div class="sav-hero-stat">
      <div class="sav-hero-stat-val" style="font-size:16px;line-height:1.3">${_initials(top.nome)}</div>
      <div class="sav-hero-stat-lbl">Melhor Comprador</div>
    </div>` : ''}
  </div>
</div>`;
}

/* ── Filters ──────────────────────────────────────────── */
function _buildFilters(d) {
  const opts = d.opts || {};
  const compOpts = (opts.compradores || []).map(c =>
    `<option value="${_esc(c)}" ${c === _fComp ? 'selected' : ''}>${_esc(c)}</option>`
  ).join('');
  const unitOpts = (opts.unidades || []).map(u =>
    `<option value="${_esc(u)}" ${u === _fUnit ? 'selected' : ''}>${_esc(u)}</option>`
  ).join('');
  return `
<div class="sav-filters">
  <div>
    <label>Comprador</label>
    <select id="sav-f-comp">
      <option value="">Todos os compradores</option>
      ${compOpts}
    </select>
  </div>
  <div>
    <label>Unidade</label>
    <select id="sav-f-unit">
      <option value="">Todas as unidades</option>
      ${unitOpts}
    </select>
  </div>
  <button class="sav-btn-filter" id="sav-btn-aplicar">
    <i class="fa-solid fa-filter"></i> Aplicar filtro
  </button>
</div>`;
}

/* ── Ranking ──────────────────────────────────────────── */
function _buildRanking(d) {
  if (!d.compradores || !d.compradores.length) return '';
  const maxSav = d.compradores[0].saving || 1;
  const medals = ['gold', 'silver', 'bronze'];
  const posLabel = (i) => i < 3 ? ['1º', '2º', '3º'][i] : `${i + 1}º`;

  const cards = d.compradores.slice(0, 5).map((c, i) => {
    const barW = maxSav > 0 ? (c.saving / maxSav * 100) : 0;
    return `
<div class="sav-rank-card">
  <div class="sav-rank-pos ${medals[i] || ''}">${posLabel(i)}</div>
  <div class="sav-rank-avatar">${_initials(c.nome)}</div>
  <div class="sav-rank-info">
    <div class="sav-rank-name">${_esc(c.nome)}</div>
    <div class="sav-rank-meta">
      ${c.count} negociação${c.count !== 1 ? 'ões' : ''} &middot; saving médio ${_pct(c.pct)}
    </div>
  </div>
  <div class="sav-rank-bar-wrap">
    <div class="sav-rank-bar-track">
      <div class="sav-rank-bar-fill" style="width:${barW.toFixed(1)}%"></div>
    </div>
  </div>
  <div class="sav-rank-nums">
    <div class="sav-rank-val">${_R$(c.saving)}</div>
    <div class="sav-rank-pct">economizados</div>
  </div>
</div>`;
  }).join('');

  return `
<div class="sav-section-title">Ranking de Compradores</div>
<div class="sav-ranking">${cards}</div>`;
}

/* ── Tabela ───────────────────────────────────────────── */
function _buildTabela(d) {
  const sorted = [...(d.pedidos || [])].sort((a, b) =>
    _sortAsc ? a[_sortCol] - b[_sortCol] : b[_sortCol] - a[_sortCol]
  );

  const _th = (col, label) => {
    const isActive = col === _sortCol;
    const arrow    = isActive ? (_sortAsc ? ' ↑' : ' ↓') : '';
    return `<th class="sortable${isActive ? ' sort-active' : ''}" data-col="${col}">${label}${arrow}</th>`;
  };

  const rows = sorted.length === 0
    ? `<tr><td colspan="8">
        <div class="sav-empty">
          <i class="fa-solid fa-scale-balanced"></i>
          <p>Nenhuma negociação com saving encontrada para os filtros selecionados.<br>
          Requisições concluídas com múltiplas cotações aparecerão aqui.</p>
        </div>
       </td></tr>`
    : sorted.map(p => {
        const badgeCls = p.saving_pct >= 20 ? 'sav-badge-top'
          : p.saving_pct >= 10 ? 'sav-badge-mid'
          : p.saving_pct >= 5  ? 'sav-badge-low'
          : 'sav-badge-xs';
        const star = p.saving_pct >= 20
          ? ' <i class="fa-solid fa-star" style="font-size:9px"></i>' : '';
        return `<tr>
  <td><span style="font-weight:800;color:#059669">#${p.id}</span></td>
  <td>
    <div style="font-weight:600;color:#1e293b">${_esc(p.fornecedor)}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:2px">${_dt(p.data)}</div>
  </td>
  <td>
    <span class="sav-cotacoes">
      <i class="fa-solid fa-file-lines"></i>
      ${p.n_cotacoes} cotação${p.n_cotacoes !== 1 ? 'ões' : ''}
    </span>
  </td>
  <td>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap">
      <span class="sav-preco-base">${_R$(p.preco_base)}</span>
      <span class="sav-preco-arrow"><i class="fa-solid fa-arrow-right"></i></span>
      <span class="sav-preco-final">${_R$(p.preco_final)}</span>
    </div>
  </td>
  <td style="font-weight:800;color:#059669;white-space:nowrap">${_R$(p.saving_abs)}</td>
  <td><span class="sav-badge ${badgeCls}">${_pct(p.saving_pct)}${star}</span></td>
  <td style="color:#64748b;font-size:12px">${_esc(p.comprador)}</td>
  <td style="color:#64748b;font-size:12px">${_esc(p.unidade)}</td>
</tr>`;
      }).join('');

  return `
<div class="sav-table-wrap">
  <div class="sav-table-head">
    <div class="sav-table-head-title">Detalhamento por Requisição</div>
    <span class="sav-table-count">${sorted.length} registro${sorted.length !== 1 ? 's' : ''}</span>
  </div>
  <div style="overflow-x:auto">
    <table class="sav-tbl">
      <thead>
        <tr>
          ${_th('id', 'Req.')}
          <th>Fornecedor / Data</th>
          <th>Cotações</th>
          <th>Trajetória de Preço</th>
          ${_th('saving_abs', 'Saving R$')}
          ${_th('saving_pct', 'Saving %')}
          <th>Comprador</th>
          <th>Unidade</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   EVENTS
══════════════════════════════════════════════════════════ */
function _bindEvents() {
  document.getElementById('sav-btn-aplicar')?.addEventListener('click', () => {
    _fComp = document.getElementById('sav-f-comp')?.value || '';
    _fUnit = document.getElementById('sav-f-unit')?.value || '';
    document.getElementById('sav-root').innerHTML =
      '<div class="sav-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Atualizando...</div>';
    _carregar();
  });

  document.querySelectorAll('.sav-tbl th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (_sortCol === col) _sortAsc = !_sortAsc;
      else { _sortCol = col; _sortAsc = false; }
      _renderTudo();
    });
  });
}

/* ══════════════════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════════════════ */
function _initials(nome) {
  if (!nome || nome === '—') return '?';
  const parts = nome.trim().split(' ').filter(Boolean);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : nome.substring(0, 2).toUpperCase();
}

function _esc(s) {
  return String(s ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════════════════════
   REGISTER
══════════════════════════════════════════════════════════ */
window.Pages = window.Pages || {};
window.Pages.saving = { render, init };
})();
