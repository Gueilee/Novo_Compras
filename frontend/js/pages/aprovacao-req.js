/* ============================================================
   SHP — APROVAÇÃO DO REQUISITANTE
   Requisições com fornecedor selecionado aguardando
   confirmação do solicitante antes de ir para Entrega.
   ============================================================ */
(() => {
'use strict';

/* ── Formatters ──────────────────────────────────────────── */
const _R$ = v => (+(v ?? 0)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const _pct = v => `${(+(v ?? 0)).toFixed(1)}%`;
const _dt  = s => {
  if (!s) return '—';
  try { return new Date(s).toLocaleDateString('pt-BR'); } catch { return s; }
};
const _esc = s => String(s ?? '—')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ── State ───────────────────────────────────────────────── */
let _lista   = [];
let _usuEmail = '';
let _busca   = '';

/* ══════════════════════════════════════════════════════════
   RENDER (síncrono — skeleton)
══════════════════════════════════════════════════════════ */
function render() {
  return `
<style>
/* ── root ────────────────────────────────────────────── */
#ar-root { max-width: 1080px; }

/* ── Header hero ─────────────────────────────────────── */
.ar-hero {
  background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4c1d95 100%);
  border-radius: 18px; padding: 28px 36px;
  display: flex; align-items: center; justify-content: space-between;
  gap: 24px; color: #fff; margin-bottom: 20px;
  position: relative; overflow: hidden;
}
.ar-hero::before {
  content: ''; position: absolute; top: -60px; right: -60px;
  width: 220px; height: 220px; border-radius: 50%;
  background: radial-gradient(circle, rgba(167,139,250,.18) 0%, transparent 70%);
}
.ar-hero-left { position: relative; z-index: 1; }
.ar-hero-eyebrow {
  font-size: 11px; text-transform: uppercase; letter-spacing: .12em;
  opacity: .65; margin-bottom: 8px; font-weight: 700;
}
.ar-hero-title { font-size: 26px; font-weight: 800; letter-spacing: -.02em; }
.ar-hero-sub { font-size: 13px; opacity: .65; margin-top: 8px; max-width: 460px; }
.ar-hero-right { position: relative; z-index: 1; flex-shrink: 0; }
.ar-hero-count {
  background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
  border-radius: 14px; padding: 18px 28px; text-align: center;
  backdrop-filter: blur(6px);
}
.ar-hero-n { font-size: 40px; font-weight: 900; letter-spacing: -.04em; }
.ar-hero-nlbl { font-size: 11px; opacity: .6; margin-top: 4px; text-transform: uppercase; letter-spacing: .08em; }

/* ── Flow banner ──────────────────────────────────────── */
.ar-flow {
  display: flex; align-items: center; gap: 0;
  margin-bottom: 20px; background: #f8fafc;
  border: 1px solid #e2e8f0; border-radius: 14px;
  padding: 14px 20px; overflow-x: auto;
}
.ar-flow-step {
  display: flex; align-items: center; gap: 8px;
  white-space: nowrap; font-size: 12px; color: #64748b;
}
.ar-flow-step.ar-flow-done { color: #059669; }
.ar-flow-step.ar-flow-active {
  color: #7c3aed; font-weight: 700;
  background: #ede9fe; padding: 4px 12px;
  border-radius: 20px; border: 1.5px solid #c4b5fd;
}
.ar-flow-arrow { color: #cbd5e1; font-size: 12px; padding: 0 10px; flex-shrink: 0; }

/* ── Toolbar ──────────────────────────────────────────── */
.ar-toolbar {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 16px; flex-wrap: wrap;
}
.ar-search {
  flex: 1; min-width: 220px; height: 38px;
  border: 1px solid #e2e8f0; border-radius: 10px;
  padding: 0 14px 0 36px; font-size: 13px; color: #1e293b;
  background: #fff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398l3.85 3.85a1 1 0 0 0 1.415-1.415l-3.868-3.833zm-5.242 1.156a5 5 0 1 1 0-10 5 5 0 0 1 0 10z'/%3E%3C/svg%3E") no-repeat 12px center;
  outline: none; transition: border-color .15s;
}
.ar-search:focus { border-color: #7c3aed; }
.ar-count-lbl {
  font-size: 12px; color: #64748b;
  background: #f1f5f9; padding: 4px 12px; border-radius: 20px;
}

/* ── Empty state ──────────────────────────────────────── */
.ar-empty {
  text-align: center; padding: 72px 32px; color: #94a3b8;
}
.ar-empty-icon {
  font-size: 56px; margin-bottom: 20px;
  background: linear-gradient(135deg, #a5b4fc, #c4b5fd);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ar-empty h3 { font-size: 18px; font-weight: 700; color: #1e293b; margin-bottom: 8px; }
.ar-empty p  { font-size: 13px; line-height: 1.6; max-width: 380px; margin: 0 auto; }

/* ── Cards ────────────────────────────────────────────── */
.ar-cards { display: flex; flex-direction: column; gap: 14px; }

.ar-card {
  background: #fff; border: 1.5px solid #e2e8f0;
  border-radius: 16px; overflow: hidden;
  transition: box-shadow .2s, border-color .2s;
}
.ar-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,.07); border-color: #c4b5fd; }
.ar-card-top {
  padding: 20px 24px 0;
  display: flex; align-items: flex-start; gap: 16px;
}
.ar-card-badge-num {
  flex-shrink: 0; width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg, #7c3aed, #a78bfa);
  color: #fff; font-size: 13px; font-weight: 800;
  display: flex; align-items: center; justify-content: center;
}
.ar-card-main { flex: 1; min-width: 0; }
.ar-card-title {
  font-size: 14px; font-weight: 700; color: #1e293b;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.ar-card-meta {
  font-size: 12px; color: #64748b; margin-top: 4px;
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
}
.ar-card-meta i { color: #94a3b8; }

/* ── Divider line ─────────────────────────────────────── */
.ar-card-divider { height: 1px; background: #f1f5f9; margin: 16px 24px 0; }

/* ── Details grid ─────────────────────────────────────── */
.ar-card-details {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 0; padding: 16px 24px;
}
.ar-detail-block { padding: 0 12px; }
.ar-detail-block:first-child { padding-left: 0; }
.ar-detail-block:last-child  { padding-right: 0; }
.ar-detail-block + .ar-detail-block { border-left: 1px solid #f1f5f9; }
.ar-detail-lbl {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .07em; color: #94a3b8; margin-bottom: 4px;
}
.ar-detail-val {
  font-size: 14px; font-weight: 700; color: #1e293b;
}
.ar-detail-sub { font-size: 11px; color: #64748b; margin-top: 2px; }
.ar-saving-val { color: #059669; }
.ar-price-val  { color: #1e293b; }

/* ── Itens preview ────────────────────────────────────── */
.ar-card-itens {
  padding: 0 24px 14px; font-size: 12px; color: #64748b;
  display: flex; align-items: center; gap: 6px;
}
.ar-itens-chip {
  background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px;
  padding: 3px 10px; font-size: 11px; color: #475569;
  display: inline-flex; align-items: center; gap: 4px;
}

/* ── Discount tag ─────────────────────────────────────── */
.ar-discount-tag {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 2px 8px; border-radius: 20px; font-size: 10px; font-weight: 700;
  background: #dbeafe; color: #1e40af; margin-top: 4px;
}

/* ── Actions ──────────────────────────────────────────── */
.ar-card-actions {
  padding: 14px 24px;
  background: #fafbfc; border-top: 1px solid #f1f5f9;
  display: flex; align-items: center; gap: 10px;
  flex-wrap: wrap;
}
.ar-btn-aprovar {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 10px;
  background: linear-gradient(135deg, #059669, #34d399);
  color: #fff; border: none; font-size: 13px; font-weight: 700;
  cursor: pointer; box-shadow: 0 2px 8px rgba(5,150,105,.25);
  transition: opacity .15s, transform .1s;
}
.ar-btn-aprovar:hover { opacity: .9; transform: translateY(-1px); }
.ar-btn-aprovar:active { transform: translateY(0); }
.ar-btn-devolver {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 22px; border-radius: 10px;
  background: #fff; color: #dc2626; border: 1.5px solid #fca5a5;
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background .15s, border-color .15s;
}
.ar-btn-devolver:hover { background: #fef2f2; border-color: #ef4444; }
.ar-btn-mapa {
  display: flex; align-items: center; gap: 7px;
  padding: 10px 18px; border-radius: 10px;
  background: #fff; color: #7c3aed; border: 1.5px solid #c4b5fd;
  font-size: 13px; font-weight: 600; cursor: pointer;
  transition: background .15s;
}
.ar-btn-mapa:hover { background: #faf5ff; }
.ar-card-approved-stamp {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: #64748b; margin-left: auto;
}

/* ── Reject modal ─────────────────────────────────────── */
.ar-modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45);
  z-index: 9999; display: flex; align-items: center; justify-content: center;
}
.ar-modal {
  background: #fff; border-radius: 20px;
  padding: 32px 36px; max-width: 480px; width: 90%;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  animation: arModalIn .2s ease;
}
@keyframes arModalIn { from { opacity:0; transform:scale(.95) translateY(12px); } to { opacity:1; transform:none; } }
.ar-modal-title { font-size: 18px; font-weight: 800; color: #1e293b; margin-bottom: 6px; }
.ar-modal-sub   { font-size: 13px; color: #64748b; margin-bottom: 20px; }
.ar-modal-label { font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; display: block; }
.ar-modal-textarea {
  width: 100%; min-height: 96px; border: 1.5px solid #e2e8f0;
  border-radius: 10px; padding: 12px 14px; font-size: 13px;
  font-family: inherit; color: #1e293b; resize: vertical;
  outline: none; transition: border-color .15s; box-sizing: border-box;
}
.ar-modal-textarea:focus { border-color: #dc2626; }
.ar-modal-actions { display: flex; gap: 10px; margin-top: 20px; }
.ar-modal-btn-cancel {
  flex: 1; padding: 11px; border-radius: 10px;
  border: 1.5px solid #e2e8f0; background: #fff;
  font-size: 13px; font-weight: 600; color: #64748b; cursor: pointer;
}
.ar-modal-btn-devolver {
  flex: 2; padding: 11px; border-radius: 10px;
  border: none; background: linear-gradient(135deg, #dc2626, #f87171);
  font-size: 13px; font-weight: 700; color: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
}

/* ── Responsive ──────────────────────────────────────── */
@media (max-width: 768px) {
  .ar-card-details { grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .ar-card-details .ar-detail-block { border: none !important; padding: 0; }
  .ar-card-top { flex-direction: column; gap: 10px; }
  .ar-hero { flex-direction: column; }
}
</style>

<div id="ar-root">
  <div class="ar-empty">
    <div class="ar-empty-icon"><i class="fa-solid fa-hourglass-half"></i></div>
    <h3>Carregando...</h3>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════ */
async function init() {
  _usuEmail = localStorage.getItem('shp_user_email') || 'usuário';
  _busca = '';
  await _carregar();
}

/* ══════════════════════════════════════════════════════════
   DATA
══════════════════════════════════════════════════════════ */
async function _carregar() {
  try {
    _lista = await Api.get('/api/aprovacao-req/pendentes');
    _renderPagina();
  } catch(e) {
    const root = document.getElementById('ar-root');
    if (root) root.innerHTML = `
      <div class="ar-empty">
        <div class="ar-empty-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
        <h3>Erro ao carregar</h3>
        <p>${_esc(e.message || 'Tente novamente.')}</p>
      </div>`;
  }
}

/* ══════════════════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════════════════ */
function _renderPagina() {
  const root = document.getElementById('ar-root');
  if (!root) return;
  root.innerHTML = _buildHero() + _buildFlow() + _buildToolbar() + _buildCards();
  _bindEvents();
}

function _buildHero() {
  const n = _lista.length;
  return `
<div class="ar-hero">
  <div class="ar-hero-left">
    <div class="ar-hero-eyebrow"><i class="fa-solid fa-user-check"></i> &nbsp;APROVAÇÃO DO REQUISITANTE</div>
    <div class="ar-hero-title">Requisições Aguardando Confirmação</div>
    <div class="ar-hero-sub">
      O comprador selecionou o fornecedor e definiu o preço. Revise o mapa de cotação
      e confirme o pedido — ou devolva ao comprador para renegociação.
    </div>
  </div>
  <div class="ar-hero-right">
    <div class="ar-hero-count">
      <div class="ar-hero-n">${n}</div>
      <div class="ar-hero-nlbl">Aguardando${n === 1 ? '' : 's'}</div>
    </div>
  </div>
</div>`;
}

function _buildFlow() {
  const steps = [
    { label: 'Nova Requisição',        done: true  },
    { label: 'Aprovação do Gestor',    done: true  },
    { label: 'Cotação & Fornecedor',   done: true  },
    { label: 'Aprovação do Requisitante', active: true },
    { label: 'Aguardando Entrega',     done: false },
    { label: 'Concluído',              done: false },
  ];
  const html = steps.map((s, i) => {
    const cls = s.active ? 'ar-flow-active' : s.done ? 'ar-flow-done' : '';
    const icon = s.done ? '<i class="fa-solid fa-check" style="font-size:10px;"></i>' : '';
    const arrow = i < steps.length - 1 ? '<span class="ar-flow-arrow"><i class="fa-solid fa-chevron-right"></i></span>' : '';
    return `<div class="ar-flow-step ${cls}">${icon}${_esc(s.label)}</div>${arrow}`;
  }).join('');
  return `<div class="ar-flow">${html}</div>`;
}

function _buildToolbar() {
  const visiveis = _filtered().length;
  return `
<div class="ar-toolbar">
  <input type="text" class="ar-search" id="ar-busca" placeholder="Buscar por ID, fornecedor, comprador ou unidade..." value="${_esc(_busca)}">
  <span class="ar-count-lbl">${visiveis} de ${_lista.length} requisição${_lista.length !== 1 ? 'ões' : ''}</span>
</div>`;
}

function _filtered() {
  if (!_busca) return _lista;
  const q = _busca.toLowerCase();
  return _lista.filter(p =>
    String(p.id).includes(q) ||
    (p.fornecedor   || '').toLowerCase().includes(q) ||
    (p.comprador    || '').toLowerCase().includes(q) ||
    (p.unidade      || '').toLowerCase().includes(q) ||
    (p.itens_preview|| '').toLowerCase().includes(q)
  );
}

function _buildCards() {
  const lista = _filtered();
  if (!lista.length && _busca) {
    return `<div class="ar-empty">
      <div class="ar-empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
      <h3>Nenhum resultado</h3>
      <p>Nenhuma requisição corresponde a "<strong>${_esc(_busca)}</strong>". Limpe a busca para ver todas.</p>
    </div>`;
  }
  if (!lista.length) {
    return `<div class="ar-empty">
      <div class="ar-empty-icon"><i class="fa-solid fa-circle-check"></i></div>
      <h3>Nenhuma requisição pendente</h3>
      <p>
        Tudo certo por aqui. Quando o comprador selecionar um fornecedor no Mapa de Cotação,
        as requisições aparecerão aqui para sua aprovação.
      </p>
    </div>`;
  }
  return `<div class="ar-cards">${lista.map(_buildCard).join('')}</div>`;
}

function _buildCard(p) {
  const temDescComp = p.desconto_comprador_valor > 0;
  const dcLabel = temDescComp
    ? (p.desconto_comprador_tipo === '%'
        ? `Desc. comprador: ${p.desconto_comprador_valor}%`
        : `Desc. comprador: ${_R$(p.desconto_comprador_valor)}`)
    : '';

  const savingBadge = p.saving_abs > 0
    ? `<span style="font-size:11px;color:#059669;font-weight:700;background:#d1fae5;padding:2px 8px;border-radius:12px;">
        <i class="fa-solid fa-arrow-trend-down"></i> ${_R$(p.saving_abs)} (${_pct(p.saving_pct)})
       </span>`
    : '';

  return `
<div class="ar-card" id="ar-card-${p.id}">
  <div class="ar-card-top">
    <div class="ar-card-badge-num">#${p.id}</div>
    <div class="ar-card-main">
      <div class="ar-card-title">${_esc(p.itens_preview || 'Requisição #' + p.id)}</div>
      <div class="ar-card-meta">
        <span><i class="fa-solid fa-building"></i> ${_esc(p.unidade)}</span>
        ${p.setor ? `<span><i class="fa-solid fa-layer-group"></i> ${_esc(p.setor)}</span>` : ''}
        <span><i class="fa-solid fa-user"></i> Comprador: ${_esc(p.comprador)}</span>
        <span><i class="fa-regular fa-calendar"></i> ${_dt(p.data)}</span>
        ${savingBadge}
      </div>
    </div>
  </div>

  <div class="ar-card-divider"></div>

  <div class="ar-card-details">
    <div class="ar-detail-block">
      <div class="ar-detail-lbl"><i class="fa-solid fa-truck"></i> Fornecedor Selecionado</div>
      <div class="ar-detail-val">${_esc(p.fornecedor)}</div>
      <div class="ar-detail-sub">${p.n_cotacoes} proposta${p.n_cotacoes !== 1 ? 's' : ''} recebida${p.n_cotacoes !== 1 ? 's' : ''}</div>
    </div>
    <div class="ar-detail-block">
      <div class="ar-detail-lbl"><i class="fa-solid fa-tag"></i> Preço Cotado</div>
      <div class="ar-detail-val ar-price-val">${_R$(p.preco_forn)}</div>
      ${temDescComp ? `<div class="ar-discount-tag"><i class="fa-solid fa-handshake"></i> ${_esc(dcLabel)}</div>` : '<div class="ar-detail-sub">Sem desconto adicional</div>'}
    </div>
    <div class="ar-detail-block">
      <div class="ar-detail-lbl"><i class="fa-solid fa-circle-check"></i> Preço Final</div>
      <div class="ar-detail-val" style="color:${p.preco_negociado_final ? '#059669' : '#1e293b'};">${_R$(p.valor_fechado)}</div>
      <div class="ar-detail-sub">${p.preco_negociado_final ? 'Após desconto negociado' : 'Preço do fornecedor'}</div>
    </div>
    <div class="ar-detail-block">
      <div class="ar-detail-lbl"><i class="fa-solid fa-piggy-bank"></i> Saving Gerado</div>
      ${p.saving_abs > 0
        ? `<div class="ar-detail-val ar-saving-val">${_R$(p.saving_abs)}</div>
           <div class="ar-detail-sub">${_pct(p.saving_pct)} abaixo do maior cotado</div>`
        : `<div class="ar-detail-val" style="color:#94a3b8;">—</div>
           <div class="ar-detail-sub">Única proposta</div>`}
    </div>
  </div>

  ${p.itens_count > 0 ? `
  <div class="ar-card-itens">
    <i class="fa-solid fa-boxes-stacked" style="color:#94a3b8;"></i>
    <span class="ar-itens-chip">
      <i class="fa-solid fa-cubes" style="font-size:10px;"></i>
      ${p.itens_count} ${p.itens_count === 1 ? 'item' : 'itens'}
    </span>
    <span style="color:#94a3b8;">${_esc(p.itens_preview)}</span>
  </div>` : ''}

  <div class="ar-card-actions">
    <button class="ar-btn-aprovar" onclick="Pages['aprovacao-req'].aprovar(${p.id})">
      <i class="fa-solid fa-circle-check"></i> Confirmar Pedido
    </button>
    <button class="ar-btn-devolver" onclick="Pages['aprovacao-req'].abrirModalDevolver(${p.id})">
      <i class="fa-solid fa-rotate-left"></i> Devolver ao Comprador
    </button>
    <button class="ar-btn-mapa" onclick="Pages['aprovacao-req'].verMapa(${p.id})">
      <i class="fa-solid fa-chart-bar"></i> Ver Mapa de Cotação
    </button>
    <div class="ar-card-approved-stamp">
      <i class="fa-solid fa-clock" style="color:#f59e0b;font-size:13px;"></i>
      <span style="color:#f59e0b;font-weight:600;font-size:12px;">Aguardando confirmação</span>
    </div>
  </div>
</div>`;
}

/* ══════════════════════════════════════════════════════════
   ACTIONS
══════════════════════════════════════════════════════════ */
async function aprovar(id) {
  const card = document.getElementById(`ar-card-${id}`);
  if (card) { card.style.opacity = '.5'; card.style.pointerEvents = 'none'; }

  try {
    await Api.post(`/api/aprovacao-req/${id}`, {
      acao:        'aprovar',
      aprovado_por: _usuEmail
    });
    Toast.success('Pedido confirmado!', `Requisição #${id} aprovada. Comprador será notificado para acompanhar a entrega.`);
    // Animação de saída
    if (card) {
      card.style.transition = 'all .4s ease';
      card.style.transform  = 'scale(.97)';
      card.style.opacity    = '0';
      setTimeout(async () => {
        _lista = _lista.filter(p => p.id !== id);
        _renderPagina();
        refreshNotifBadge();
      }, 400);
    }
  } catch(e) {
    Toast.error('Erro ao confirmar', e.message || 'Tente novamente.');
    if (card) { card.style.opacity = '1'; card.style.pointerEvents = ''; }
  }
}

function abrirModalDevolver(id) {
  const item = _lista.find(p => p.id === id);
  if (!item) return;

  const overlay = document.createElement('div');
  overlay.className = 'ar-modal-overlay';
  overlay.id = 'ar-modal-devolver';
  overlay.innerHTML = `
<div class="ar-modal" onclick="event.stopPropagation()">
  <div class="ar-modal-title"><i class="fa-solid fa-rotate-left" style="color:#dc2626;"></i> &nbsp;Devolver ao Comprador</div>
  <div class="ar-modal-sub">
    Req. #${id} — <strong>${_esc(item.fornecedor)}</strong><br>
    Informe o motivo para que o comprador possa renegociar ou buscar outro fornecedor.
  </div>
  <label class="ar-modal-label" for="ar-motivo-txt">Motivo da devolução</label>
  <textarea id="ar-motivo-txt" class="ar-modal-textarea" placeholder="Ex: Preço acima do esperado para esta categoria. Solicitar nova rodada de cotações com fornecedores alternativos..."></textarea>
  <div class="ar-modal-actions">
    <button class="ar-modal-btn-cancel" onclick="document.getElementById('ar-modal-devolver').remove()">
      Cancelar
    </button>
    <button class="ar-modal-btn-devolver" onclick="Pages['aprovacao-req'].confirmarDevolver(${id})">
      <i class="fa-solid fa-rotate-left"></i> Confirmar Devolução
    </button>
  </div>
</div>`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
  setTimeout(() => document.getElementById('ar-motivo-txt')?.focus(), 100);
}

async function confirmarDevolver(id) {
  const motivo = document.getElementById('ar-motivo-txt')?.value?.trim();
  if (!motivo) {
    document.getElementById('ar-motivo-txt')?.classList.add('ar-shake');
    Toast.warning('Motivo obrigatório', 'Descreva o motivo para o comprador.');
    return;
  }

  document.getElementById('ar-modal-devolver')?.remove();
  const card = document.getElementById(`ar-card-${id}`);
  if (card) { card.style.opacity = '.5'; card.style.pointerEvents = 'none'; }

  try {
    await Api.post(`/api/aprovacao-req/${id}`, {
      acao:   'devolver',
      motivo: motivo
    });
    Toast.warning('Devolvido ao comprador.', `Req. #${id} retornou para "Em Cotação". O comprador poderá renegociar.`);
    if (card) {
      card.style.transition = 'all .4s ease';
      card.style.opacity    = '0';
      setTimeout(() => {
        _lista = _lista.filter(p => p.id !== id);
        _renderPagina();
        refreshNotifBadge();
      }, 400);
    }
  } catch(e) {
    Toast.error('Erro ao devolver', e.message || 'Tente novamente.');
    if (card) { card.style.opacity = '1'; card.style.pointerEvents = ''; }
  }
}

function verMapa(id) {
  App.navigate('sourcing');
  // Aguarda a página renderizar, depois abre a requisição
  const tentativas = 8;
  let i = 0;
  const poll = setInterval(() => {
    i++;
    if (window.Pages?.sourcing?.selecionarPedido) {
      clearInterval(poll);
      window.Pages.sourcing.selecionarPedido(id);
    } else if (i >= tentativas) {
      clearInterval(poll);
      Toast.info('Mapa de Cotação', `Abra a requisição #${id} na tela de Fornecedores & Cotação para ver o mapa completo.`);
    }
  }, 300);
}

/* ══════════════════════════════════════════════════════════
   EVENTS
══════════════════════════════════════════════════════════ */
function _bindEvents() {
  const busca = document.getElementById('ar-busca');
  if (busca) {
    busca.addEventListener('input', e => {
      _busca = e.target.value;
      const cards = document.querySelector('.ar-cards');
      const toolbar = document.getElementById('ar-busca')?.closest('.ar-toolbar')?.nextElementSibling;
      // Só re-renderiza os cards, não o hero/flow
      const cardsWrap = document.querySelector('#ar-root .ar-cards')?.parentNode;
      if (cardsWrap) {
        const newCards = document.createElement('div');
        newCards.innerHTML = _buildCards();
        const old = document.querySelector('#ar-root .ar-cards') || document.querySelector('#ar-root .ar-empty:last-of-type');
        if (old) old.replaceWith(newCards.firstElementChild || newCards);
      }
      // Atualiza contador
      const countEl = document.querySelector('.ar-count-lbl');
      if (countEl) countEl.textContent = `${_filtered().length} de ${_lista.length} requisição${_lista.length !== 1 ? 'ões' : ''}`;
    });
  }
}

/* ══════════════════════════════════════════════════════════
   REGISTER
══════════════════════════════════════════════════════════ */
window.Pages = window.Pages || {};
window.Pages['aprovacao-req'] = { render, init, aprovar, abrirModalDevolver, confirmarDevolver, verMapa };
})();
