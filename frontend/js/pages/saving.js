/* ============================================================
   SHP — PAINEL DE SAVING v2
   Visão unificada: Compras + Contas Fixas
   ============================================================ */
(() => {
'use strict';

/* ── Formatters ─────────────────────────────────────────── */
const _R$  = v => (+(v ?? 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const _Rk  = v => {
  const n = +(v ?? 0);
  if (n >= 1000000) return 'R$ ' + (n/1000000).toFixed(1) + 'M';
  if (n >= 10000)   return 'R$ ' + (n/1000).toFixed(0) + 'k';
  return _R$(n);
};
const _pct = v => `${(+(v ?? 0)).toFixed(1)}%`;
const _dt  = s => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('pt-BR'); } catch { return s; }
};
const MESES_BR = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const ANO_REF  = new Date().getFullYear();
const MES_ATUAL = new Date().getMonth(); // 0-indexed

/* ── State ──────────────────────────────────────────────── */
let _dados    = null;
let _tabAtiva = 'compras';
let _sortCol  = 'saving_abs';
let _sortAsc  = false;
let _sortColF = 'saving_abs';
let _sortAscF = false;
let _fComp    = '';
let _fUnit    = '';

/* ══════════════════════════════════════════════════════════
   RENDER — skeleton (síncrono)
══════════════════════════════════════════════════════════ */
function render() {
  return `
<style>
/* ── Root ───────────────────────────────────────────── */
#sav-root { max-width: 1100px; }

/* ── Loading / empty ────────────────────────────────── */
.sav-loading {
  text-align: center; padding: 72px 32px;
  color: #94a3b8; font-size: 14px;
}
.sav-loading i { margin-right: 8px; font-size: 18px; }
.sav-empty-state {
  text-align: center; padding: 56px 32px; color: #94a3b8;
}
.sav-empty-state i { font-size: 40px; margin-bottom: 14px; display: block; }

/* ── Hero ───────────────────────────────────────────── */
.sav-hero {
  background: linear-gradient(135deg, #0a0f1e 0%, #064e3b 45%, #0a2744 100%);
  border-radius: 20px;
  padding: 36px 40px;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
}
.sav-hero::before {
  content: '';
  position: absolute; top: -80px; right: -80px;
  width: 300px; height: 300px; border-radius: 50%;
  background: radial-gradient(circle, rgba(52,211,153,.12) 0%, transparent 70%);
}
.sav-hero::after {
  content: '';
  position: absolute; bottom: -60px; left: 30%;
  width: 200px; height: 200px; border-radius: 50%;
  background: radial-gradient(circle, rgba(124,58,237,.1) 0%, transparent 70%);
}
.sav-hero-left { position: relative; z-index: 1; flex: 1; }
.sav-hero-eyebrow {
  font-size: 11px; text-transform: uppercase; letter-spacing: .12em;
  opacity: .65; margin-bottom: 10px; font-weight: 700;
}
.sav-hero-total {
  font-size: 48px; font-weight: 800;
  letter-spacing: -.03em; line-height: 1;
  background: linear-gradient(90deg, #fff 0%, #a7f3d0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.sav-hero-sub { font-size: 13px; opacity: .6; margin-top: 12px; max-width: 340px; }
.sav-hero-right {
  display: flex; flex-direction: column; gap: 10px;
  position: relative; z-index: 1; flex-shrink: 0;
}
.sav-hero-pill {
  display: flex; align-items: center; gap: 12px;
  padding: 14px 18px; border-radius: 14px;
  border: 1px solid rgba(255,255,255,.15);
  min-width: 220px;
  backdrop-filter: blur(6px);
}
.sav-pill-compras { background: rgba(5,150,105,.25); border-color: rgba(52,211,153,.3); }
.sav-pill-fixas   { background: rgba(124,58,237,.25); border-color: rgba(167,139,250,.3); }
.sav-pill-icon { font-size: 22px; }
.sav-pill-val { font-size: 18px; font-weight: 800; }
.sav-pill-lbl { font-size: 10px; opacity: .7; text-transform: uppercase; letter-spacing: .06em; margin-top: 2px; }

/* ── Metric cards grid ──────────────────────────────── */
.sav-cards-grid {
  display: grid; grid-template-columns: repeat(3, 1fr);
  gap: 16px; margin-bottom: 20px;
}
.sav-metric-card {
  border-radius: 16px; padding: 22px 24px;
  border: 1.5px solid transparent; position: relative; overflow: hidden;
}
.sav-card-compras {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-color: #a7f3d0;
}
.sav-card-fixas {
  background: linear-gradient(135deg, #faf5ff, #ede9fe);
  border-color: #c4b5fd;
}
.sav-card-total {
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-color: #e2e8f0;
}
.sav-metric-icon { font-size: 26px; margin-bottom: 10px; }
.sav-metric-label {
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .06em; color: #64748b; margin-bottom: 6px;
}
.sav-metric-value {
  font-size: 26px; font-weight: 800; color: #1e293b;
  letter-spacing: -.02em;
}
.sav-card-compras .sav-metric-value { color: #065f46; }
.sav-card-fixas   .sav-metric-value { color: #5b21b6; }
.sav-metric-sub { font-size: 12px; color: #64748b; margin-top: 6px; }
.sav-metric-tag {
  font-size: 11px; color: #94a3b8; margin-top: 8px;
  padding-top: 8px; border-top: 1px solid rgba(0,0,0,.06);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}

/* ── Composição ─────────────────────────────────────── */
.sav-comp-bar-track {
  height: 10px; background: #f1f5f9; border-radius: 5px;
  overflow: hidden; display: flex; margin: 12px 0;
}
.sav-comp-bar-compras { background: linear-gradient(90deg, #059669, #34d399); height: 100%; transition: width .6s ease; }
.sav-comp-bar-fixas   { background: linear-gradient(90deg, #7c3aed, #a78bfa); height: 100%; transition: width .6s ease; }
.sav-comp-labels { display: flex; gap: 24px; flex-wrap: wrap; }
.sav-comp-item { display: flex; align-items: center; gap: 8px; font-size: 13px; }
.sav-comp-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
.sav-comp-item strong { color: #1e293b; }
.sav-comp-pct { color: #94a3b8; font-size: 11px; }

/* ── Monthly chart ──────────────────────────────────── */
.sav-chart {
  display: flex; align-items: flex-end; gap: 4px;
  height: 120px; padding-bottom: 0;
  border-bottom: 2px solid #f1f5f9;
  margin-bottom: 10px;
}
.sav-chart-col {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; justify-content: flex-end;
  height: 100%; gap: 0;
}
.sav-chart-col.sav-chart-future { opacity: .25; }
.sav-chart-val { font-size: 8px; color: #94a3b8; margin-bottom: 3px; text-align: center; min-height: 12px; }
.sav-chart-bars {
  display: flex; flex-direction: column;
  align-items: center; width: 100%; justify-content: flex-end;
  flex: 1; gap: 0;
}
.bar-compras { width: 100%; background: linear-gradient(180deg, #34d399, #059669); border-radius: 2px 2px 0 0; }
.bar-fixas   { width: 100%; background: linear-gradient(180deg, #a78bfa, #7c3aed); border-radius: 0; }
.bar-fixas:last-child { border-radius: 2px 2px 0 0; }
.bar-fixas + .bar-compras { border-radius: 0; }
.bar-empty { width: 100%; height: 3px; background: #f1f5f9; border-radius: 2px; }
.bar-future { width: 100%; height: 3px; background: #e2e8f0; border-radius: 2px 2px 0 0; }
.sav-chart-lbl { font-size: 9px; color: #94a3b8; margin-top: 5px; }
.sav-chart-legend {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #64748b;
}
.sav-leg-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }

/* ── Filters ─────────────────────────────────────────── */
.sav-filters {
  display: flex; gap: 10px; align-items: flex-end;
  flex-wrap: wrap; margin-bottom: 20px;
  background: #f8fafc; border-radius: 12px;
  padding: 14px 18px; border: 1px solid #e2e8f0;
}
.sav-filters label {
  display: block; font-size: 10px; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: .07em; margin-bottom: 4px;
}
.sav-filters select {
  height: 36px; border: 1px solid #e2e8f0; border-radius: 8px;
  padding: 0 10px; font-size: 13px; color: #1e293b;
  background: #fff; cursor: pointer; min-width: 170px; outline: none;
}
.sav-filters select:focus { border-color: #059669; }
.sav-btn-filter {
  height: 36px; padding: 0 18px; border-radius: 8px;
  background: #059669; color: #fff; border: none;
  font-size: 13px; font-weight: 600; cursor: pointer;
  display: flex; align-items: center; gap: 7px;
}
.sav-btn-filter:hover { background: #047857; }
.sav-btn-limpar {
  height: 36px; padding: 0 14px; border-radius: 8px;
  background: transparent; color: #94a3b8; border: 1px solid #e2e8f0;
  font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 6px;
}
.sav-btn-limpar:hover { color: #dc2626; border-color: #dc2626; }

/* ── Tabs ────────────────────────────────────────────── */
.sav-tabs {
  display: flex; gap: 0; margin-bottom: 16px;
  border-bottom: 2px solid #e2e8f0;
}
.sav-tab {
  padding: 10px 22px; font-size: 13px; font-weight: 600;
  color: #64748b; background: none; border: none;
  cursor: pointer; position: relative; display: flex;
  align-items: center; gap: 7px; transition: color .15s;
}
.sav-tab:hover { color: #1e293b; }
.sav-tab.sav-tab-active {
  color: #059669;
}
.sav-tab.sav-tab-active::after {
  content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
  height: 2px; background: #059669; border-radius: 1px;
}
.sav-tab:nth-child(2).sav-tab-active { color: #7c3aed; }
.sav-tab:nth-child(2).sav-tab-active::after { background: #7c3aed; }

/* ── Section title ───────────────────────────────────── */
.sav-section-title {
  font-size: 14px; font-weight: 700; color: #1e293b;
  margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;
}
.sav-section-title::before {
  content: ''; display: block; width: 3px; height: 16px;
  background: #059669; border-radius: 2px; flex-shrink: 0;
}

/* ── Ranking ─────────────────────────────────────────── */
.sav-ranking { display: flex; flex-direction: column; gap: 8px; margin-bottom: 24px; }
.sav-rank-card {
  background: #fff; border: 1.5px solid #e2e8f0;
  border-radius: 12px; padding: 14px 18px;
  display: flex; align-items: center; gap: 14px;
  transition: box-shadow .15s, border-color .15s;
}
.sav-rank-card:first-child {
  border-color: #a7f3d0;
  background: linear-gradient(90deg, #f0fdf4 0%, #fff 70%);
}
.sav-rank-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.06); }
.sav-rank-medal { font-size: 20px; width: 30px; text-align: center; flex-shrink: 0; }
.sav-rank-avatar {
  width: 40px; height: 40px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #059669, #34d399);
  color: #fff; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.sav-rank-card:nth-child(2) .sav-rank-avatar { background: linear-gradient(135deg, #6366f1, #818cf8); }
.sav-rank-card:nth-child(3) .sav-rank-avatar { background: linear-gradient(135deg, #0ea5e9, #38bdf8); }
.sav-rank-card:nth-child(4) .sav-rank-avatar { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
.sav-rank-card:nth-child(5) .sav-rank-avatar { background: linear-gradient(135deg, #ec4899, #f472b6); }
.sav-rank-info { flex: 1; min-width: 0; }
.sav-rank-name { font-size: 13px; font-weight: 700; color: #1e293b; }
.sav-rank-meta { font-size: 11px; color: #64748b; margin-top: 2px; }
.sav-rank-bar-wrap { flex: 2; min-width: 80px; }
.sav-rank-bar-track { height: 5px; background: #e2e8f0; border-radius: 3px; overflow: hidden; }
.sav-rank-bar-fill { height: 100%; background: linear-gradient(90deg,#059669,#34d399); border-radius: 3px; }
.sav-rank-nums { text-align: right; flex-shrink: 0; min-width: 110px; }
.sav-rank-val { font-size: 14px; font-weight: 800; color: #059669; }
.sav-rank-pct { font-size: 10px; color: #94a3b8; }

/* ── Tables ──────────────────────────────────────────── */
.sav-table-wrap {
  background: #fff; border: 1px solid #e2e8f0;
  border-radius: 14px; overflow: hidden; margin-bottom: 24px;
}
.sav-table-head {
  display: flex; align-items: center; padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0; gap: 10px;
}
.sav-table-head-title {
  font-size: 14px; font-weight: 700; color: #1e293b; flex: 1;
  display: flex; align-items: center; gap: 8px;
}
.sav-table-count {
  font-size: 11px; color: #64748b; background: #f1f5f9;
  padding: 3px 10px; border-radius: 20px;
}
.sav-tbl { width: 100%; border-collapse: collapse; }
.sav-tbl th {
  font-size: 10px; font-weight: 700; color: #94a3b8;
  text-transform: uppercase; letter-spacing: .07em;
  padding: 10px 14px; border-bottom: 1px solid #f1f5f9;
  background: #fafbfc; text-align: left; white-space: nowrap;
}
.sav-tbl th.sortable { cursor: pointer; user-select: none; }
.sav-tbl th.sortable:hover { color: #059669; }
.sav-tbl th.sort-active { color: #059669; }
.sav-tbl td {
  padding: 12px 14px; border-bottom: 1px solid #f8fafc;
  font-size: 13px; color: #1e293b; vertical-align: middle;
}
.sav-tbl tr:last-child td { border-bottom: none; }
.sav-tbl tr:hover td { background: #fafffe; }
.sav-td-bold { font-weight: 700; }
.sav-td-muted { font-size: 11px; color: #94a3b8; margin-top: 2px; }

/* ── Saving badge ────────────────────────────────────── */
.sav-badge {
  display: inline-flex; align-items: center; gap: 3px;
  padding: 2px 8px; border-radius: 20px;
  font-size: 10px; font-weight: 700; white-space: nowrap;
}
.sav-badge-pct-top  { background: #059669; color: #fff; }
.sav-badge-pct-mid  { background: #d1fae5; color: #065f46; }
.sav-badge-pct-low  { background: #fef3c7; color: #92400e; }
.sav-badge-pct-xs   { background: #f1f5f9; color: #64748b; }
.sav-badge-forn     { background: #dcfce7; color: #166534; }
.sav-badge-comp     { background: #dbeafe; color: #1e40af; }
.sav-badge-mercado  { background: #fef9c3; color: #78350f; }
.sav-badge-ok       { background: #d1fae5; color: #065f46; }
.sav-badge-over     { background: #fee2e2; color: #991b1b; }

/* ── Price trajectory ────────────────────────────────── */
.sav-preco-traj {
  display: flex; align-items: center; gap: 5px; flex-wrap: wrap;
  font-size: 12px;
}
.sav-preco-base  { color: #94a3b8; text-decoration: line-through; }
.sav-preco-arrow { color: #34d399; font-size: 10px; }
.sav-preco-final { color: #059669; font-weight: 700; }

/* ── Fixas table ─────────────────────────────────────── */
.sav-mini-bar { height: 4px; background: #e2e8f0; border-radius: 2px; overflow: hidden; margin-top: 4px; }
.sav-mini-bar-fill { height: 100%; border-radius: 2px; }
.sav-mini-bar-ok   .sav-mini-bar-fill { background: linear-gradient(90deg,#059669,#34d399); }
.sav-mini-bar-over .sav-mini-bar-fill { background: linear-gradient(90deg,#dc2626,#f87171); }

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 768px) {
  .sav-hero { flex-direction: column; }
  .sav-hero-right { flex-direction: row; flex-wrap: wrap; }
  .sav-hero-pill { min-width: unset; flex: 1; }
  .sav-hero-total { font-size: 32px; }
  .sav-cards-grid { grid-template-columns: 1fr; }
  .sav-comp-labels { flex-direction: column; gap: 8px; }
}
</style>

<div id="sav-root">
  <div class="sav-loading">
    <i class="fa-solid fa-circle-notch fa-spin"></i> Carregando dados de saving...
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
async function init() { await _carregar(); }

/* ══════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════ */
async function _carregar() {
  try {
    const qs = new URLSearchParams();
    if (_fComp) qs.set('comprador', _fComp);
    if (_fUnit)  qs.set('unidade',   _fUnit);
    const url = '/api/saving/consolidado' + (qs.toString() ? '?' + qs : '');
    _dados = await Api.get(url);
    _renderTudo();
  } catch(e) {
    document.getElementById('sav-root').innerHTML = `
      <div class="sav-empty-state">
        <i class="fa-solid fa-triangle-exclamation" style="color:#fbbf24;"></i>
        <p style="font-size:14px;font-weight:600;color:#1e293b;">Erro ao carregar dados de saving</p>
        <p style="font-size:12px;margin-top:4px;">${e.message || 'Tente novamente.'}</p>
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
    _buildMetricCards(d) +
    _buildComposicao(d) +
    _buildGraficoMensal(d) +
    _buildFilters(d.compras) +
    _buildTabs() +
    `<div id="sav-tab-content">${_buildConteudoTab(d)}</div>`;
  _bindEvents();
}

/* ══════════════════════════════════════════════════════════
   HERO
══════════════════════════════════════════════════════════ */
function _buildHero(d) {
  const comp  = d.compras.kpis;
  const fixas = d.fixas;
  const total = +(comp.total_saving + fixas.saving_abs).toFixed(2);
  return `
<div class="sav-hero">
  <div class="sav-hero-left">
    <div class="sav-hero-eyebrow">💰 PAINEL DE SAVING ${ANO_REF}</div>
    <div class="sav-hero-total">${_R$(total)}</div>
    <div class="sav-hero-sub">
      Total economizado combinando negociações de compras e eficiência em contratos fixos.
    </div>
  </div>
  <div class="sav-hero-right">
    <div class="sav-hero-pill sav-pill-compras" onclick="Pages.saving.switchTab('compras')" style="cursor:pointer;">
      <div class="sav-pill-icon">🛒</div>
      <div>
        <div class="sav-pill-val">${_R$(comp.total_saving)}</div>
        <div class="sav-pill-lbl">Saving Compras · ${comp.count} negoc.</div>
      </div>
    </div>
    <div class="sav-hero-pill sav-pill-fixas" onclick="Pages.saving.switchTab('fixas')" style="cursor:pointer;">
      <div class="sav-pill-icon">📋</div>
      <div>
        <div class="sav-pill-val">${_R$(fixas.saving_abs)}</div>
        <div class="sav-pill-lbl">Saving Contratos · ${fixas.n_contratos} contratos</div>
      </div>
    </div>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   METRIC CARDS
══════════════════════════════════════════════════════════ */
function _buildMetricCards(d) {
  const comp  = d.compras.kpis;
  const fixas = d.fixas;
  const total = +(comp.total_saving + fixas.saving_abs).toFixed(2);
  const topComp = d.compras.compradores?.[0];

  return `
<div class="sav-cards-grid">
  <div class="sav-metric-card sav-card-compras">
    <div class="sav-metric-icon">🛒</div>
    <div class="sav-metric-label">Saving de Compras</div>
    <div class="sav-metric-value">${_R$(comp.total_saving)}</div>
    <div class="sav-metric-sub">
      ${comp.count} negociação${comp.count !== 1 ? 'ões' : ''} · ${_pct(comp.pct_saving)} saving médio
    </div>
    <div class="sav-metric-tag">
      ${topComp ? `🏆 Melhor: ${_esc(topComp.nome)} (${_R$(topComp.saving)})` : 'Nenhuma negociação registrada'}
    </div>
  </div>
  <div class="sav-metric-card sav-card-fixas">
    <div class="sav-metric-icon">📋</div>
    <div class="sav-metric-label">Saving de Contratos Fixos</div>
    <div class="sav-metric-value">${_R$(fixas.saving_abs)}</div>
    <div class="sav-metric-sub">
      ${fixas.n_contratos} contratos · ${_pct(fixas.saving_pct)} abaixo do orçado
    </div>
    <div class="sav-metric-tag">
      Orçado: ${_R$(fixas.total_orcado)} · Pago: ${_R$(fixas.total_pago)}
    </div>
  </div>
  <div class="sav-metric-card sav-card-total">
    <div class="sav-metric-icon">📈</div>
    <div class="sav-metric-label">Total Consolidado</div>
    <div class="sav-metric-value">${_R$(total)}</div>
    <div class="sav-metric-sub">
      ${comp.count + fixas.n_contratos} registros monitorados
    </div>
    <div class="sav-metric-tag">
      Ano fiscal ${ANO_REF} · Atualizado em tempo real
    </div>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   COMPOSIÇÃO DO SAVING
══════════════════════════════════════════════════════════ */
function _buildComposicao(d) {
  const compVal  = d.compras.kpis.total_saving;
  const fixasVal = d.fixas.saving_abs;
  const total    = compVal + fixasVal;
  if (total <= 0) return '';

  const pctC = (compVal  / total * 100);
  const pctF = (fixasVal / total * 100);

  return `
<div class="card" style="padding:20px 24px;margin-bottom:20px;">
  <div class="sav-section-title">Composição do Saving</div>
  <div class="sav-comp-bar-track">
    <div class="sav-comp-bar-compras" style="width:${pctC.toFixed(2)}%;" title="Compras: ${_R$(compVal)}"></div>
    <div class="sav-comp-bar-fixas"   style="width:${pctF.toFixed(2)}%;" title="Fixas: ${_R$(fixasVal)}"></div>
  </div>
  <div class="sav-comp-labels">
    <div class="sav-comp-item">
      <span class="sav-comp-dot" style="background:linear-gradient(90deg,#059669,#34d399);"></span>
      <span>Compras</span>
      <strong>${_R$(compVal)}</strong>
      <span class="sav-comp-pct">${pctC.toFixed(1)}%</span>
    </div>
    <div class="sav-comp-item">
      <span class="sav-comp-dot" style="background:linear-gradient(90deg,#7c3aed,#a78bfa);"></span>
      <span>Contas Fixas</span>
      <strong>${_R$(fixasVal)}</strong>
      <span class="sav-comp-pct">${pctF.toFixed(1)}%</span>
    </div>
    <div class="sav-comp-item" style="margin-left:auto;">
      <span style="font-size:12px;color:#94a3b8;">Total</span>
      <strong style="font-size:14px;">${_R$(total)}</strong>
    </div>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   GRÁFICO MENSAL
══════════════════════════════════════════════════════════ */
function _buildGraficoMensal(d) {
  const comprMes = d.compras.por_mes;  // 12 items
  const fixasMes = d.fixas.por_mes;    // 12 items
  const maxH = 90;

  const totais = comprMes.map((cm, i) => (cm.saving || 0) + ((fixasMes[i]||{}).saving || 0));
  const maxTotal = Math.max(...totais, 1);

  const hasAnyData = totais.some(t => t > 0);

  const cols = comprMes.map((cm, i) => {
    const isFuture = i > MES_ATUAL;
    const fm    = fixasMes[i] || {saving: 0};
    const total = (cm.saving || 0) + (fm.saving || 0);
    const hComp  = total > 0 ? Math.max(3, Math.round((cm.saving  || 0) / maxTotal * maxH)) : 0;
    const hFixas = total > 0 ? Math.max(3, Math.round((fm.saving  || 0) / maxTotal * maxH)) : 0;
    const isCurrent = i === MES_ATUAL;

    return `
<div class="sav-chart-col${isFuture ? ' sav-chart-future' : ''}">
  <div class="sav-chart-val">${!isFuture && total > 0 ? _Rk(total) : ''}</div>
  <div class="sav-chart-bars">
    ${!isFuture && hFixas > 0 ? `<div class="bar-fixas" style="height:${hFixas}px;" title="${MESES_BR[i]} — Fixas: ${_R$(fm.saving)}"></div>` : ''}
    ${!isFuture && hComp  > 0 ? `<div class="bar-compras" style="height:${hComp}px;" title="${MESES_BR[i]} — Compras: ${_R$(cm.saving)}"></div>` : ''}
    ${!isFuture && total <= 0 ? `<div class="bar-empty"></div>` : ''}
    ${isFuture ? `<div class="bar-future"></div>` : ''}
  </div>
  <div class="sav-chart-lbl" style="${isCurrent ? 'color:#059669;font-weight:700;' : ''}">${MESES_BR[i]}</div>
</div>`;
  }).join('');

  return `
<div class="card" style="padding:20px 24px;margin-bottom:20px;">
  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:10px;">
    <div class="sav-section-title" style="margin:0;">Evolução Mensal — ${ANO_REF}</div>
    <div class="sav-chart-legend" style="gap:8px;">
      <span class="sav-leg-dot" style="background:linear-gradient(135deg,#059669,#34d399);"></span>
      <span style="font-size:11px;">Compras</span>
      <span class="sav-leg-dot" style="background:linear-gradient(135deg,#7c3aed,#a78bfa);margin-left:10px;"></span>
      <span style="font-size:11px;">Contas Fixas</span>
      <span style="font-size:10px;color:#cbd5e1;margin-left:10px;">Meses futuros em cinza</span>
    </div>
  </div>
  ${hasAnyData
    ? `<div class="sav-chart">${cols}</div>`
    : `<div style="text-align:center;padding:32px;color:#94a3b8;font-size:13px;">
        <i class="fa-solid fa-chart-bar" style="font-size:24px;margin-bottom:8px;display:block;opacity:.3;"></i>
        Nenhum dado de saving mensal disponível ainda.
       </div>`}
</div>`;
}

/* ══════════════════════════════════════════════════════════
   FILTROS
══════════════════════════════════════════════════════════ */
function _buildFilters(d) {
  const opts     = d.opts || {};
  const compOpts = (opts.compradores||[]).map(c =>
    `<option value="${_esc(c)}" ${c===_fComp?'selected':''}>${_esc(c)}</option>`).join('');
  const unitOpts = (opts.unidades||[]).map(u =>
    `<option value="${_esc(u)}" ${u===_fUnit?'selected':''}>${_esc(u)}</option>`).join('');
  const hasFilter = _fComp || _fUnit;
  return `
<div class="sav-filters">
  <div>
    <label>Comprador</label>
    <select id="sav-f-comp">
      <option value="">Todos os compradores</option>${compOpts}
    </select>
  </div>
  <div>
    <label>Unidade</label>
    <select id="sav-f-unit">
      <option value="">Todas as unidades</option>${unitOpts}
    </select>
  </div>
  <button class="sav-btn-filter" id="sav-btn-aplicar">
    <i class="fa-solid fa-filter"></i> Filtrar Compras
  </button>
  ${hasFilter ? `<button class="sav-btn-limpar" id="sav-btn-limpar">
    <i class="fa-solid fa-xmark"></i> Limpar filtros
  </button>` : ''}
  ${hasFilter ? `<span style="font-size:11px;color:#7c3aed;font-weight:600;align-self:center;">
    <i class="fa-solid fa-filter"></i> Filtro ativo — Contas Fixas não são filtradas
  </span>` : ''}
</div>`;
}

/* ══════════════════════════════════════════════════════════
   TABS
══════════════════════════════════════════════════════════ */
function _buildTabs() {
  return `
<div class="sav-tabs">
  <button id="sav-tab-compras" class="sav-tab${_tabAtiva === 'compras' ? ' sav-tab-active' : ''}"
          onclick="Pages.saving.switchTab('compras')">
    <i class="fa-solid fa-cart-shopping"></i> Compras
  </button>
  <button id="sav-tab-fixas" class="sav-tab${_tabAtiva === 'fixas' ? ' sav-tab-active' : ''}"
          onclick="Pages.saving.switchTab('fixas')">
    <i class="fa-solid fa-file-contract"></i> Contas Fixas
  </button>
</div>`;
}

/* ── Tab content dispatcher ─────────────────────────────── */
function _buildConteudoTab(d) {
  if (_tabAtiva === 'compras') return _buildTabCompras(d.compras);
  return _buildTabFixas(d.fixas);
}

/* ══════════════════════════════════════════════════════════
   TAB: COMPRAS
══════════════════════════════════════════════════════════ */
function _buildTabCompras(d) {
  return _buildRankingCompradores(d) + _buildTabelaCompras(d);
}

function _buildRankingCompradores(d) {
  if (!d.compradores || !d.compradores.length) return '';
  const max = d.compradores[0].saving || 1;
  const cards = d.compradores.slice(0, 5).map((c, i) => {
    const barW   = (c.saving / max * 100).toFixed(1);
    const medals = ['🥇', '🥈', '🥉', '4º', '5º'];
    return `
<div class="sav-rank-card">
  <div class="sav-rank-medal">${medals[i] ?? (i+1)+'º'}</div>
  <div class="sav-rank-avatar">${_initials(c.nome)}</div>
  <div class="sav-rank-info">
    <div class="sav-rank-name">${_esc(c.nome)}</div>
    <div class="sav-rank-meta">
      ${c.count} negociação${c.count !== 1 ? 'ões' : ''} &middot; saving médio ${_pct(c.pct)}
    </div>
  </div>
  <div class="sav-rank-bar-wrap">
    <div class="sav-rank-bar-track">
      <div class="sav-rank-bar-fill" style="width:${barW}%"></div>
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

function _buildTabelaCompras(d) {
  const sorted = [...(d.pedidos||[])].sort((a, b) =>
    _sortAsc ? a[_sortCol] - b[_sortCol] : b[_sortCol] - a[_sortCol]
  );

  const _th = (col, label) => {
    const active = col === _sortCol;
    const arrow  = active ? (_sortAsc ? ' ↑' : ' ↓') : '';
    return `<th class="sortable${active ? ' sort-active' : ''}" data-col="${col}">${label}${arrow}</th>`;
  };

  const _origemBadges = (p) => {
    const b = [];
    if (p.saving_forn     > 0) b.push(`<span class="sav-badge sav-badge-forn"    title="Desconto concedido pelo próprio fornecedor">🎁 Desc. Fornecedor</span>`);
    if (p.saving_comp     > 0) b.push(`<span class="sav-badge sav-badge-comp"    title="Desconto negociado pelo comprador antes do mapa">🤝 Neg. Comprador</span>`);
    if (p.saving_mercado  > 0) b.push(`<span class="sav-badge sav-badge-mercado" title="Economia por selecionar o menor preço entre cotações">🏆 Concorrência</span>`);
    return b.join(' ') || '<span class="sav-badge sav-badge-pct-xs">—</span>';
  };

  const rows = sorted.length === 0
    ? `<tr><td colspan="8">
        <div class="sav-empty-state">
          <i class="fa-solid fa-scale-balanced"></i>
          <p>Nenhuma negociação com saving encontrada.</p>
          <p style="font-size:12px;margin-top:4px;">Requisições concluídas com redução de preço aparecerão aqui.</p>
        </div>
       </td></tr>`
    : sorted.map(p => {
        const badgeCls = p.saving_pct >= 20 ? 'sav-badge-pct-top'
          : p.saving_pct >= 10 ? 'sav-badge-pct-mid'
          : p.saving_pct >= 5  ? 'sav-badge-pct-low'
          : 'sav-badge-pct-xs';
        const star = p.saving_pct >= 20 ? ' ★' : '';
        return `<tr>
  <td><span class="sav-td-bold" style="color:#059669;">#${p.id}</span></td>
  <td>
    <div class="sav-td-bold">${_esc(p.fornecedor)}</div>
    <div class="sav-td-muted"><i class="fa-solid fa-user fa-xs"></i> ${_esc(p.comprador)}</div>
  </td>
  <td>
    <div class="sav-preco-traj">
      <span class="sav-preco-base">${_R$(p.preco_base)}</span>
      <span class="sav-preco-arrow"><i class="fa-solid fa-arrow-right"></i></span>
      <span class="sav-preco-final">${_R$(p.preco_final)}</span>
    </div>
  </td>
  <td class="sav-td-bold" style="color:#059669;white-space:nowrap;">
    ${_R$(p.saving_abs)}
    ${p.saving_forn > 0 || p.saving_comp > 0 ? `
    <div style="font-size:10px;color:#94a3b8;margin-top:2px;font-weight:400;"
         title="Forn: ${_R$(p.saving_forn)} · Comp: ${_R$(p.saving_comp)} · Mercado: ${_R$(p.saving_mercado)}">
      ${p.saving_forn > 0 ? `Forn: ${_R$(p.saving_forn)}` : ''}
      ${p.saving_comp > 0 ? ` + Comp: ${_R$(p.saving_comp)}` : ''}
    </div>` : ''}
  </td>
  <td><span class="sav-badge ${badgeCls}">${_pct(p.saving_pct)}${star}</span></td>
  <td>${_origemBadges(p)}</td>
  <td style="color:#64748b;font-size:12px;">${_esc(p.unidade)}</td>
  <td style="color:#94a3b8;font-size:11px;">${_dt(p.data)}</td>
</tr>`;
      }).join('');

  return `
<div class="sav-table-wrap">
  <div class="sav-table-head">
    <div class="sav-table-head-title">
      <i class="fa-solid fa-list-check" style="color:#059669;"></i>
      Detalhamento por Requisição
    </div>
    <span class="sav-table-count">${sorted.length} registro${sorted.length !== 1 ? 's' : ''}</span>
  </div>
  <div style="overflow-x:auto;">
    <table class="sav-tbl sav-tbl-compras">
      <thead>
        <tr>
          <th>Req.</th>
          <th>Fornecedor / Comprador</th>
          <th>Trajetória de Preço</th>
          ${_th('saving_abs', 'Saving R$')}
          ${_th('saving_pct', 'Saving %')}
          <th>Origem do Saving</th>
          <th>Unidade</th>
          <th>Data</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   TAB: CONTAS FIXAS
══════════════════════════════════════════════════════════ */
function _buildTabFixas(d) {
  const sorted = [...(d.por_contrato||[])].sort((a, b) =>
    _sortAscF ? a[_sortColF] - b[_sortColF] : b[_sortColF] - a[_sortColF]
  );

  const _thF = (col, label) => {
    const active = col === _sortColF;
    const arrow  = active ? (_sortAscF ? ' ↑' : ' ↓') : '';
    return `<th class="sortable${active ? ' sort-active' : ''}" data-col="${col}">${label}${arrow}</th>`;
  };

  // Resumo top mensal
  const mesesComDados = d.por_mes.filter(m => m.saving > 0);
  const topMes = mesesComDados.reduce((best, m) => m.saving > (best?.saving||0) ? m : best, null);
  const resumoFixas = `
<div style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
  <div style="flex:1;min-width:140px;background:linear-gradient(135deg,#faf5ff,#ede9fe);border:1.5px solid #c4b5fd;border-radius:12px;padding:16px 18px;">
    <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Orçado YTD</div>
    <div style="font-size:20px;font-weight:800;color:#5b21b6;">${_R$(d.total_orcado)}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Soma dos orçamentos até ${MESES_BR[MES_ATUAL]}</div>
  </div>
  <div style="flex:1;min-width:140px;background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1.5px solid #fde68a;border-radius:12px;padding:16px 18px;">
    <div style="font-size:10px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Pago YTD</div>
    <div style="font-size:20px;font-weight:800;color:#78350f;">${_R$(d.total_pago)}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Soma dos lançamentos registrados</div>
  </div>
  <div style="flex:1;min-width:140px;background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:1.5px solid #a7f3d0;border-radius:12px;padding:16px 18px;">
    <div style="font-size:10px;font-weight:700;color:#059669;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Saving Contratos</div>
    <div style="font-size:20px;font-weight:800;color:#065f46;">${_R$(d.saving_abs)}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:4px;">${_pct(d.saving_pct)} abaixo do orçado</div>
  </div>
  ${topMes ? `<div style="flex:1;min-width:140px;background:var(--surface);border:1.5px solid var(--border);border-radius:12px;padding:16px 18px;">
    <div style="font-size:10px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;">Melhor Mês</div>
    <div style="font-size:20px;font-weight:800;color:#1e293b;">${MESES_BR[topMes.mes-1]}</div>
    <div style="font-size:11px;color:#94a3b8;margin-top:4px;">Saving de ${_R$(topMes.saving)}</div>
  </div>` : ''}
</div>`;

  const rows = sorted.length === 0
    ? `<tr><td colspan="7">
        <div class="sav-empty-state">
          <i class="fa-solid fa-file-contract"></i>
          <p>Nenhum contrato com saving registrado.</p>
          <p style="font-size:12px;margin-top:4px;">Registre lançamentos em Contas Fixas para acompanhar o saving.</p>
        </div>
       </td></tr>`
    : sorted.map(c => {
        const pctPago = c.orcado > 0 ? Math.min(100, (c.pago / c.orcado * 100)) : 0;
        const isOver  = c.pago > c.orcado;
        const badgeCls = c.saving_abs > 0 ? 'sav-badge-ok' : 'sav-badge-over';
        const badgeTxt = c.saving_abs > 0 ? '✓ Economia' : '⚠ Excedido';
        return `<tr>
  <td>
    <div class="sav-td-bold">${_esc(c.nome)}</div>
    <div class="sav-td-muted">${_esc(c.fornecedor)}</div>
  </td>
  <td style="font-size:12px;color:#64748b;">${_esc(c.categoria)}</td>
  <td style="font-size:12px;color:#64748b;">${_esc(c.unidade)}</td>
  <td style="font-size:13px;color:#1e293b;">${_R$(c.orcado)}</td>
  <td>
    <div style="font-size:13px;color:${isOver ? '#dc2626' : '#1e293b'};">${_R$(c.pago)}</div>
    <div class="sav-mini-bar ${isOver ? 'sav-mini-bar-over' : 'sav-mini-bar-ok'}">
      <div class="sav-mini-bar-fill" style="width:${pctPago.toFixed(1)}%;"></div>
    </div>
  </td>
  <td class="sav-td-bold" style="color:${c.saving_abs > 0 ? '#059669' : '#dc2626'};">
    ${c.saving_abs > 0 ? _R$(c.saving_abs) : '—'}
  </td>
  <td><span class="sav-badge ${badgeCls}">${badgeTxt} ${c.saving_pct > 0 ? _pct(c.saving_pct) : ''}</span></td>
</tr>`;
      }).join('');

  return `
${resumoFixas}
<div class="sav-table-wrap">
  <div class="sav-table-head">
    <div class="sav-table-head-title">
      <i class="fa-solid fa-file-contract" style="color:#7c3aed;"></i>
      Saving por Contrato
    </div>
    <span class="sav-table-count">${sorted.length} contrato${sorted.length !== 1 ? 's' : ''}</span>
  </div>
  <div style="overflow-x:auto;">
    <table class="sav-tbl sav-tbl-fixas">
      <thead>
        <tr>
          <th>Contrato / Fornecedor</th>
          <th>Categoria</th>
          <th>Unidade</th>
          <th>Orçado YTD</th>
          <th>Pago YTD</th>
          ${_thF('saving_abs', 'Saving R$')}
          <th>Status</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   SWITCH TAB (exposto no window.Pages)
══════════════════════════════════════════════════════════ */
function switchTab(tab) {
  _tabAtiva = tab;
  const content = document.getElementById('sav-tab-content');
  if (content && _dados) content.innerHTML = _buildConteudoTab(_dados);
  ['compras','fixas'].forEach(t => {
    const btn = document.getElementById(`sav-tab-${t}`);
    if (btn) btn.classList.toggle('sav-tab-active', t === tab);
  });
  _bindTabEvents();
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
  document.getElementById('sav-btn-limpar')?.addEventListener('click', () => {
    _fComp = '';
    _fUnit = '';
    document.getElementById('sav-root').innerHTML =
      '<div class="sav-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Atualizando...</div>';
    _carregar();
  });
  _bindTabEvents();
}

function _bindTabEvents() {
  document.querySelectorAll('.sav-tbl-compras th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (_sortCol === col) _sortAsc = !_sortAsc; else { _sortCol = col; _sortAsc = false; }
      const c = document.getElementById('sav-tab-content');
      if (c && _dados) c.innerHTML = _buildConteudoTab(_dados);
      _bindTabEvents();
    });
  });
  document.querySelectorAll('.sav-tbl-fixas th.sortable').forEach(th => {
    th.addEventListener('click', () => {
      const col = th.dataset.col;
      if (_sortColF === col) _sortAscF = !_sortAscF; else { _sortColF = col; _sortAscF = false; }
      const c = document.getElementById('sav-tab-content');
      if (c && _dados) c.innerHTML = _buildConteudoTab(_dados);
      _bindTabEvents();
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
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ══════════════════════════════════════════════════════════
   REGISTER
══════════════════════════════════════════════════════════ */
window.Pages = window.Pages || {};
window.Pages.saving = { render, init, switchTab };
})();
