/* ============================================================
   SHP — PEDIDOS.JS
   Listagem completa de requisições com filtros e paginação
   Visão consolidada por unidade operacional
   ============================================================ */

window.Pages = window.Pages || {};

window.Pages.pedidos = {
  title: 'Requisições',

  /* Chamado pelo dashboard antes de App.navigate('pedidos') */
  openWith(opts) {
    this._initialFilter = opts || {};
    App.navigate('pedidos');
  },

  _initialFilter: null,

  _st: {
    mode:    'list',   // 'list' | 'unidades'
    page:    1,
    filters: { busca: '', status: '', unidade: '', comprador: '', id_req: '' },
    sort:    { by: 'id', order: 'desc' },
    total:   0,
    pages:   1,
    opts:    { statuses: [], unidades: [], compradores: [] },
  },

  /* ── render (shell) ──────────────────────────────────────── */
  render() {
    return `
    <div class="page-fade-in" id="ped-root">

      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Requisições</h1>
          <p class="page-subtitle" id="ped-sub">Carregando…</p>
        </div>
        <div class="page-header-actions">
          <div class="ped-mode-toggle" id="ped-mode-toggle">
            <button class="ped-mode-btn active" id="pmb-list"
                    onclick="Pages.pedidos._setMode('list')">
              <i class="fa-solid fa-table-list"></i> Lista
            </button>
            <button class="ped-mode-btn" id="pmb-unit"
                    onclick="Pages.pedidos._setMode('unidades')">
              <i class="fa-solid fa-building"></i> Por Unidade
            </button>
          </div>
          <button class="btn btn-outline btn-sm"
                  onclick="App.navigate('dashboard')">
            <i class="fa-solid fa-arrow-left"></i> Dashboard
          </button>
          <button class="btn btn-primary btn-sm"
                  onclick="App.navigate('intake')">
            <i class="fa-solid fa-plus"></i> Nova Requisição
          </button>
        </div>
      </div>

      <div id="ped-content">
        ${Skeleton.kpiGrid(3)}
        ${Skeleton.list(6)}
      </div>

    </div>

    <style>
    /* ── Mode toggle ─────────────────────────────────────────── */
    .ped-mode-toggle {
      display:flex; border:1px solid var(--border);
      border-radius:var(--r-md); overflow:hidden;
    }
    .ped-mode-btn {
      padding:7px 16px; font-size:12.5px; font-weight:600;
      font-family:var(--font); cursor:pointer;
      background:var(--surface); color:var(--text-muted);
      border:none; display:flex; align-items:center; gap:6px;
      transition:background .15s, color .15s;
    }
    .ped-mode-btn.active {
      background:var(--brand); color:#fff;
    }

    /* ── Filter bar ──────────────────────────────────────────── */
    .ped-filters {
      background:#ffffff;
      border:1px solid var(--border);
      border-radius:var(--r-lg);
      padding:14px 18px;
      display:flex; flex-wrap:nowrap; gap:10px;
      align-items:flex-end;
      margin-bottom:20px;
      box-shadow:0 2px 8px rgba(0,0,0,.05);
    }
    .ped-filter-group { display:flex; flex-direction:column; gap:5px; }
    .ped-filter-label {
      font-size:10.5px; font-weight:700; text-transform:uppercase;
      letter-spacing:.06em; color:var(--text-muted);
    }
    .ped-filter-input, .ped-filter-select {
      height:36px; padding:0 12px;
      background:var(--bg); border:1px solid var(--border);
      border-radius:var(--r-md); font-size:13px;
      font-family:var(--font); color:var(--text); outline:none;
      transition:border-color .15s;
    }
    .ped-filter-input { width:175px; padding-left:34px; }
    .ped-filter-input:focus, .ped-filter-select:focus { border-color:var(--brand); }
    .ped-filter-search-wrap { position:relative; }
    .ped-filter-search-wrap i {
      position:absolute; left:11px; top:50%;
      transform:translateY(-50%); color:var(--text-subtle);
      font-size:12px; pointer-events:none;
    }
    .ped-filter-actions { display:flex; gap:8px; align-items:flex-end; }
    .ped-filter-row { display:flex; flex-wrap:wrap; gap:10px; align-items:flex-end; width:100%; }
    .ped-sort-select { font-weight:600; color:var(--brand); }
    .ped-active-chips {
      display:flex; flex-wrap:wrap; gap:6px; margin-bottom:16px;
    }
    .ped-chip {
      display:inline-flex; align-items:center; gap:5px;
      background:var(--brand-surface); color:var(--brand);
      border:1px solid var(--brand); border-radius:20px;
      padding:3px 10px; font-size:11.5px; font-weight:600;
    }
    .ped-chip button {
      background:none; border:none; cursor:pointer;
      color:var(--brand); padding:0; line-height:1; font-size:11px;
    }

    /* ── Stats row ───────────────────────────────────────────── */
    .ped-stats {
      display:grid; grid-template-columns:repeat(4,1fr);
      gap:14px; margin-bottom:20px;
    }
    .ped-stat-card {
      background:#ffffff; border:1px solid var(--border);
      border-radius:var(--r-lg); padding:16px 18px;
      box-shadow:0 2px 8px rgba(0,0,0,.05);
    }
    .ped-stat-num {
      font-size:24px; font-weight:800;
      color:var(--text); line-height:1; margin-bottom:4px;
    }
    .ped-stat-lbl { font-size:12px; color:var(--text-muted); }

    /* ── Table ───────────────────────────────────────────────── */
    .ped-table-wrap {
      background:var(--surface); border:1px solid var(--border);
      border-radius:var(--r-lg); overflow-x:auto; margin-bottom:20px;
    }
    .ped-table { width:100%; min-width:900px; border-collapse:collapse; }
    .ped-table thead th {
      background:var(--bg); padding:11px 14px;
      font-size:11px; font-weight:700; text-transform:uppercase;
      letter-spacing:.06em; color:var(--text-muted);
      border-bottom:1px solid var(--border); text-align:left;
      white-space:nowrap;
    }
    .ped-table tbody tr {
      border-bottom:1px solid var(--border-subtle);
      transition:background .12s;
    }
    .ped-table tbody tr:last-child { border-bottom:none; }
    .ped-table tbody tr:hover { background:var(--brand-surface); }
    .ped-table td {
      padding:12px 14px; font-size:13px;
      color:var(--text); vertical-align:middle;
    }
    .ped-id {
      font-weight:700; font-size:12.5px;
      color:var(--brand); font-variant-numeric:tabular-nums;
    }
    .ped-items-preview {
      font-size:11.5px; color:var(--text-muted);
      max-width:220px; white-space:nowrap;
      overflow:hidden; text-overflow:ellipsis;
    }
    .ped-empty {
      padding:60px 20px; text-align:center;
    }
    .ped-empty i { font-size:36px; color:var(--text-subtle); margin-bottom:12px; }
    .ped-empty p { color:var(--text-muted); font-size:14px; }

    /* ── Pagination ──────────────────────────────────────────── */
    .ped-pagination {
      display:flex; align-items:center; justify-content:space-between;
      gap:12px; flex-wrap:wrap;
    }
    .ped-pag-info { font-size:12.5px; color:var(--text-muted); }
    .ped-pag-pages { display:flex; gap:4px; }
    .ped-pag-btn {
      min-width:34px; height:34px; padding:0 10px;
      border:1px solid var(--border); border-radius:var(--r-md);
      background:var(--surface); font-size:12.5px;
      font-family:var(--font); font-weight:600; color:var(--text);
      cursor:pointer; transition:background .15s, border-color .15s, color .15s;
      display:inline-flex; align-items:center; justify-content:center;
    }
    .ped-pag-btn:hover:not(:disabled) { border-color:var(--brand); color:var(--brand); }
    .ped-pag-btn.active {
      background:var(--brand); color:#fff; border-color:var(--brand);
    }
    .ped-pag-btn:disabled { opacity:.35; cursor:default; }

    /* ── Unit cards ──────────────────────────────────────────── */
    .ped-unit-grid {
      display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
      gap:20px;
    }
    .ped-unit-card {
      background:var(--surface); border:1px solid var(--border);
      border-radius:var(--r-lg); overflow:hidden;
    }
    .ped-unit-header {
      padding:20px 22px 16px;
      border-bottom:1px solid var(--border-subtle);
      display:flex; align-items:flex-start; justify-content:space-between;
    }
    .ped-unit-name {
      font-size:18px; font-weight:800; color:var(--text);
      margin-bottom:3px;
    }
    .ped-unit-total-val {
      font-size:13px; color:var(--text-muted);
    }
    .ped-unit-num {
      font-size:28px; font-weight:800; color:var(--brand);
      line-height:1;
    }
    .ped-unit-num-lbl { font-size:10.5px; color:var(--text-muted); text-align:right; }
    .ped-unit-bars { padding:16px 22px; display:flex; flex-direction:column; gap:8px; }
    .ped-unit-bar-row { display:flex; align-items:center; gap:10px; font-size:12px; }
    .ped-unit-bar-lbl { width:90px; color:var(--text-muted); font-weight:600; flex-shrink:0; }
    .ped-unit-bar-track {
      flex:1; height:8px; border-radius:4px;
      background:var(--border); overflow:hidden;
    }
    .ped-unit-bar-fill { height:100%; border-radius:4px; transition:width .6s ease; }
    .ped-unit-bar-count { min-width:28px; text-align:right; font-weight:700; color:var(--text); }
    .ped-unit-recentes { padding:0 22px 18px; }
    .ped-unit-rec-title {
      font-size:10.5px; font-weight:700; text-transform:uppercase;
      letter-spacing:.06em; color:var(--text-subtle); margin-bottom:10px;
    }
    .ped-unit-rec-item {
      display:flex; align-items:center; gap:10px;
      padding:7px 0; border-bottom:1px solid var(--border-subtle);
      font-size:12px;
    }
    .ped-unit-rec-item:last-child { border-bottom:none; }
    .ped-unit-rec-id { font-weight:700; color:var(--brand); min-width:36px; }
    .ped-unit-rec-name { flex:1; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
    .ped-unit-rec-val { font-weight:600; color:var(--text); white-space:nowrap; }
    .ped-unit-footer {
      padding:12px 22px;
      background:var(--bg); border-top:1px solid var(--border-subtle);
    }

    /* ── Action buttons ──────────────────────────────────────── */
    .ped-act-btn {
      width:30px; height:30px; border-radius:8px; border:1px solid var(--border);
      background:var(--bg); cursor:pointer; display:inline-flex;
      align-items:center; justify-content:center; font-size:12px;
      transition:background .15s, border-color .15s, color .15s;
    }
    .ped-act-btn-edit  { color:var(--brand); }
    .ped-act-btn-edit:hover  { background:var(--brand-surface); border-color:var(--brand); }
    .ped-act-btn-del   { color:var(--accent); }
    .ped-act-btn-del:hover   { background:var(--accent-surface); border-color:var(--accent); }

    /* ── Update Drawer ───────────────────────────────────────── */
    .req-backdrop {
      position:fixed; inset:0; background:rgba(0,0,0,.35);
      backdrop-filter:blur(2px); z-index:1000;
      display:flex; justify-content:flex-end;
      animation:fadeIn .2s ease;
    }
    .req-drawer {
      width:520px; max-width:95vw; height:100vh;
      background:var(--surface); display:flex; flex-direction:column;
      box-shadow:-8px 0 40px rgba(0,0,0,.15);
      animation:slideIn .22s ease;
      overflow:hidden;
    }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

    .req-drawer-hdr {
      padding:20px 24px 18px; border-bottom:1px solid var(--border);
      display:flex; align-items:center; justify-content:space-between;
      flex-shrink:0;
    }
    .req-drawer-title { font-size:16px; font-weight:800; color:var(--text); }
    .req-drawer-sub   { font-size:12px; color:var(--text-muted); margin-top:2px; }
    .req-drawer-close {
      width:32px; height:32px; border-radius:8px; border:1px solid var(--border);
      background:none; cursor:pointer; display:flex; align-items:center;
      justify-content:center; color:var(--text-muted); font-size:14px;
      transition:background .15s;
    }
    .req-drawer-close:hover { background:var(--bg); color:var(--accent); }

    .req-drawer-body {
      flex:1; overflow-y:auto; padding:20px 24px;
      display:flex; flex-direction:column; gap:20px;
    }
    .req-drawer-footer {
      padding:16px 24px; border-top:1px solid var(--border);
      display:flex; gap:10px; justify-content:flex-end; flex-shrink:0;
    }

    /* Info strip */
    .req-info-strip {
      display:grid; grid-template-columns:repeat(3,1fr);
      gap:1px; background:var(--border); border-radius:var(--r-md);
      overflow:hidden; border:1px solid var(--border);
    }
    .req-info-cell {
      background:var(--bg); padding:10px 14px;
    }
    .req-info-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-subtle); margin-bottom:3px; }
    .req-info-val { font-size:13px; font-weight:600; color:var(--text); }

    /* Items list */
    .req-items-wrap {
      background:var(--bg); border:1px solid var(--border);
      border-radius:var(--r-md); overflow:hidden;
    }
    .req-items-hdr {
      padding:8px 14px; font-size:10.5px; font-weight:700;
      text-transform:uppercase; letter-spacing:.06em;
      color:var(--text-subtle); background:var(--border-subtle);
    }
    .req-item-row {
      display:flex; align-items:center; gap:10px; padding:9px 14px;
      border-bottom:1px solid var(--border-subtle); font-size:12.5px;
    }
    .req-item-row:last-child { border-bottom:none; }
    .req-item-desc { flex:1; color:var(--text); }
    .req-item-qty  { color:var(--text-muted); white-space:nowrap; }
    .req-item-seg  { font-size:11px; color:var(--text-subtle); }

    /* Workflow stepper */
    .req-step-section-lbl {
      font-size:11px; font-weight:700; text-transform:uppercase;
      letter-spacing:.07em; color:var(--text-muted); margin-bottom:10px;
    }
    .req-stepper {
      display:flex; flex-direction:column; gap:0;
      border:1px solid var(--border); border-radius:var(--r-md); overflow:hidden;
    }
    .req-step {
      display:flex; align-items:center; gap:12px;
      padding:12px 16px; cursor:pointer;
      border-bottom:1px solid var(--border-subtle);
      transition:background .12s;
      position:relative;
    }
    .req-step:last-child { border-bottom:none; }
    .req-step:hover { background:var(--brand-surface); }
    .req-step.active { background:var(--brand-surface); }
    .req-step.done   { background:rgba(1,225,142,.05); }
    .req-step-circle {
      width:34px; height:34px; border-radius:50%;
      display:flex; align-items:center; justify-content:center;
      font-size:13px; flex-shrink:0; border:2px solid transparent;
      transition:all .15s;
    }
    .req-step.active .req-step-circle { border-color:var(--brand); }
    .req-step.done   .req-step-circle { border-color:#01E18E; }
    .req-step-info { flex:1; }
    .req-step-name { font-size:13px; font-weight:600; color:var(--text); }
    .req-step.active .req-step-name { color:var(--brand); }
    .req-step.done   .req-step-name { color:#01E18E; }
    .req-step-pct  { font-size:11px; color:var(--text-muted); }
    .req-step-sel  { width:20px; height:20px; font-size:11px; color:var(--brand); opacity:0; transition:opacity .12s; }
    .req-step.active .req-step-sel,
    .req-step:hover  .req-step-sel { opacity:1; }

    /* Terminal buttons */
    .req-terminal-row { display:flex; gap:10px; }
    .req-terminal-btn {
      flex:1; padding:9px; border-radius:var(--r-md);
      font-size:12.5px; font-weight:700; cursor:pointer;
      font-family:var(--font); display:flex; align-items:center;
      justify-content:center; gap:7px; transition:background .15s, border-color .15s;
    }
    .req-terminal-btn-danger {
      background:var(--accent-surface); border:1px solid var(--accent);
      color:var(--accent);
    }
    .req-terminal-btn-danger:hover { background:var(--accent); color:#fff; }
    .req-terminal-btn-outline {
      background:var(--bg); border:1px solid var(--border); color:var(--text-muted);
    }
    .req-terminal-btn-outline:hover { border-color:var(--text-muted); color:var(--text); }
    </style>`;
  },

  /* ── init ────────────────────────────────────────────────── */
  async init() {
    const s = this._st;
    s.page = 1;
    s.mode = 'list';
    s.filters = { busca: '', status: '', unidade: '', comprador: '', id_req: '' };

    s.sort = { by: 'id', order: 'desc' };

    if (this._initialFilter) {
      if (this._initialFilter.mode)    s.mode = this._initialFilter.mode;
      if (this._initialFilter.status)  s.filters.status = this._initialFilter.status;
      if (this._initialFilter.unidade) s.filters.unidade = this._initialFilter.unidade;
      this._initialFilter = null;
    }

    try { s.opts = await Api.get('/api/requisicoes/filtros'); } catch {}

    this._syncModeButtons();
    if (s.mode === 'unidades') await this._loadUnidades();
    else await this._loadList();
  },

  /* ── mode ────────────────────────────────────────────────── */
  _setMode(mode) {
    this._st.mode = mode;
    this._st.page = 1;
    this._syncModeButtons();
    if (mode === 'unidades') this._loadUnidades();
    else this._loadList();
  },

  _syncModeButtons() {
    const m = this._st.mode;
    document.getElementById('pmb-list')?.classList.toggle('active', m === 'list');
    document.getElementById('pmb-unit')?.classList.toggle('active', m === 'unidades');
  },

  /* ── LIST mode ───────────────────────────────────────────── */
  async _loadList() {
    const s = this._st;
    const el = document.getElementById('ped-content');
    if (!el) return;
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;

    try {
      const p = new URLSearchParams({
        page: s.page, per_page: 20,
        status:    s.filters.status,
        unidade:   s.filters.unidade,
        comprador: s.filters.comprador,
        busca:     s.filters.busca,
        id_req:    s.filters.id_req || 0,
        sort_by:    s.sort.by,
        sort_order: s.sort.order,
      });
      const data = await Api.get(`/api/requisicoes?${p}`);
      s.total = data.total; s.pages = data.pages;

      const sub = document.getElementById('ped-sub');
      if (sub) sub.textContent = `${Fmt.number(data.total)} requisição${data.total !== 1 ? 'ões' : ''} encontrada${data.total !== 1 ? 's' : ''}`;

      el.innerHTML = this._htmlList(data);
      this._attachTableListeners();
    } catch {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-circle-xmark"></i></div>
        <p class="empty-title">Erro ao carregar</p>
        <p class="empty-sub">Verifique se a API está online.</p></div>`;
    }
  },

  _htmlList(data) {
    const s = this._st;
    const concluidos  = data.items.filter(i =>  i.status?.includes('Concluí')).length;
    const emAberto    = data.items.filter(i => !i.status?.includes('Concluí') && i.status !== 'Reprovado').length;
    const comValor    = data.items.filter(i => i.valor).length;
    const totalValor  = data.items.reduce((a, i) => a + (i.valor || 0), 0);

    const chips = this._activeChipsHtml();

    return `
      <!-- Stats -->
      <div class="ped-stats">
        <div class="ped-stat-card">
          <div class="ped-stat-num">${Fmt.number(data.total)}</div>
          <div class="ped-stat-lbl">Total encontrado</div>
        </div>
        <div class="ped-stat-card" style="cursor:pointer;"
             onclick="Pages.pedidos._quickStatus('abertos')">
          <div class="ped-stat-num" style="color:var(--accent);">${Fmt.number(emAberto)}</div>
          <div class="ped-stat-lbl">Em aberto (página)</div>
        </div>
        <div class="ped-stat-card">
          <div class="ped-stat-num" style="color:var(--success);">${Fmt.number(concluidos)}</div>
          <div class="ped-stat-lbl">Concluídas (página)</div>
        </div>
        <div class="ped-stat-card">
          <div class="ped-stat-num" style="font-size:17px;">${Fmt.currency(totalValor)}</div>
          <div class="ped-stat-lbl">Valor total (página)</div>
        </div>
      </div>

      <!-- Active chips -->
      ${chips ? `<div class="ped-active-chips">${chips}</div>` : ''}

      <!-- Filters -->
      ${this._htmlFilters()}

      <!-- Table -->
      <div class="ped-table-wrap">
        ${data.items.length === 0 ? `
          <div class="ped-empty">
            <i class="fa-solid fa-magnifying-glass"></i>
            <p>Nenhuma requisição encontrada com os filtros aplicados.</p>
          </div>` : `
          <table class="ped-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Unidade</th>
                <th>Data</th>
                <th>Comprador</th>
                <th>Status</th>
                <th>Itens</th>
                <th>Valor</th>
                <th>Fornecedor</th>
                <th style="width:72px;text-align:center;">Ações</th>
              </tr>
            </thead>
            <tbody>
              ${data.items.map(r => this._htmlRow(r)).join('')}
            </tbody>
          </table>`}
      </div>

      <!-- Pagination -->
      ${this._htmlPagination(data)}
    `;
  },

  _htmlRow(r) {
    const badge = StatusBadge.get(r.status || '—');
    const preview = r.itens_preview
      ? `<div class="ped-items-preview" title="${r.itens_preview}">${r.itens_preview}</div>`
      : '<span style="color:var(--text-subtle);font-size:12px;">—</span>';
    return `
      <tr>
        <td><span class="ped-id">#${r.id}</span></td>
        <td><span class="badge badge-gray">${r.unidade || '—'}</span></td>
        <td style="white-space:nowrap;color:var(--text-muted);">${r.data || '—'}</td>
        <td>${r.comprador || '—'}</td>
        <td>${badge}</td>
        <td>
          <span style="font-weight:600;color:var(--text);">${r.itens_count || 0}</span>
          ${preview}
        </td>
        <td style="font-weight:600;white-space:nowrap;">${r.valor ? Fmt.currency(r.valor) : '<span style="color:var(--text-subtle);">—</span>'}</td>
        <td style="color:var(--text-muted);font-size:12px;">${r.fornecedor || '—'}</td>
        <td style="text-align:center;white-space:nowrap;">
          <button class="ped-act-btn ped-act-btn-edit"
                  data-action="edit" data-id="${r.id}" title="Atualizar requisição">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="ped-act-btn ped-act-btn-del"
                  data-action="delete" data-id="${r.id}"
                  data-label="#${r.id} — ${(r.comprador || '').replace(/'/g, '')}"
                  title="Excluir requisição" style="margin-left:4px;">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;
  },

  /* Sort options: value → { by, order } */
  _SORT_OPTS: [
    { label: 'Mais recentes',            by: 'id',        order: 'desc' },
    { label: 'Mais antigos',             by: 'id',        order: 'asc'  },
    { label: 'Maior valor primeiro',     by: 'valor',     order: 'desc' },
    { label: 'Menor valor primeiro',     by: 'valor',     order: 'asc'  },
    { label: 'Comprador (A → Z)',        by: 'comprador', order: 'asc'  },
    { label: 'Comprador (Z → A)',        by: 'comprador', order: 'desc' },
    { label: 'Unidade (A → Z)',          by: 'unidade',   order: 'asc'  },
    { label: 'Status (A → Z)',           by: 'status',    order: 'asc'  },
  ],

  _htmlFilters() {
    const s = this._st;

    const statusOpts = s.opts.statuses.map(st =>
      `<option value="${st}" ${s.filters.status === st ? 'selected' : ''}>${st}</option>`
    ).join('');
    const unidOpts = s.opts.unidades.map(u =>
      `<option value="${u}" ${s.filters.unidade === u ? 'selected' : ''}>${u}</option>`
    ).join('');
    const comprOpts = s.opts.compradores.map(c =>
      `<option value="${c}" ${s.filters.comprador === c ? 'selected' : ''}>${c}</option>`
    ).join('');

    const sortOpts = this._SORT_OPTS.map((o, i) => {
      const sel = s.sort.by === o.by && s.sort.order === o.order ? 'selected' : '';
      return `<option value="${i}" ${sel}>${o.label}</option>`;
    }).join('');

    return `
      <div class="ped-filters">

        <div class="ped-filter-group">
          <div class="ped-filter-label">Nº Requisição</div>
          <div class="ped-filter-search-wrap">
            <i class="fa-solid fa-hashtag"></i>
            <input class="ped-filter-input" type="number" min="1"
                   id="pf-id-req" placeholder="Ex: 1166"
                   value="${s.filters.id_req}"
                   style="width:120px;"
                   onkeydown="if(event.key==='Enter')Pages.pedidos._applyFilters()">
          </div>
        </div>

        <div class="ped-filter-group">
          <div class="ped-filter-label">Buscar</div>
          <div class="ped-filter-search-wrap">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input class="ped-filter-input" type="text"
                   id="pf-busca" placeholder="Comprador, fornecedor…"
                   value="${s.filters.busca}"
                   onkeydown="if(event.key==='Enter')Pages.pedidos._applyFilters()">
          </div>
        </div>

        <div class="ped-filter-group">
          <div class="ped-filter-label">Status</div>
          <select class="ped-filter-select" id="pf-status" style="width:165px;">
            <option value="">Todos os status</option>
            <option value="abertos" ${s.filters.status === 'abertos' ? 'selected' : ''}>Em aberto</option>
            ${statusOpts}
          </select>
        </div>

        <div class="ped-filter-group">
          <div class="ped-filter-label">Unidade</div>
          <select class="ped-filter-select" id="pf-unidade" style="width:120px;">
            <option value="">Todas</option>
            ${unidOpts}
          </select>
        </div>

        <div class="ped-filter-group">
          <div class="ped-filter-label">Comprador</div>
          <select class="ped-filter-select" id="pf-comprador" style="width:140px;">
            <option value="">Todos</option>
            ${comprOpts}
          </select>
        </div>

        <div class="ped-filter-group">
          <div class="ped-filter-label">
            <i class="fa-solid fa-arrow-up-wide-short" style="color:var(--brand);"></i>
            Ordenar por
          </div>
          <select class="ped-filter-select ped-sort-select" id="pf-sort" style="width:175px;">
            ${sortOpts}
          </select>
        </div>

        <div class="ped-filter-actions" style="margin-left:auto;">
          <button class="btn btn-primary btn-sm" onclick="Pages.pedidos._applyFilters()">
            <i class="fa-solid fa-filter"></i> Aplicar
          </button>
          <button class="btn btn-outline btn-sm" onclick="Pages.pedidos._clearFilters()">
            <i class="fa-solid fa-xmark"></i> Limpar
          </button>
        </div>

      </div>`;
  },

  _htmlPagination(data) {
    const { page, pages, total, per_page } = data;
    const from = (page - 1) * per_page + 1;
    const to   = Math.min(page * per_page, total);

    // Build page numbers: show up to 7 buttons around current page
    let nums = [];
    const range = (a, b) => Array.from({length: b - a + 1}, (_, i) => a + i);
    if (pages <= 7) {
      nums = range(1, pages);
    } else if (page <= 4) {
      nums = [...range(1, 5), '…', pages];
    } else if (page >= pages - 3) {
      nums = [1, '…', ...range(pages - 4, pages)];
    } else {
      nums = [1, '…', ...range(page - 1, page + 1), '…', pages];
    }

    const btnNums = nums.map(n => n === '…'
      ? `<button class="ped-pag-btn" disabled>…</button>`
      : `<button class="ped-pag-btn ${n === page ? 'active' : ''}"
               onclick="Pages.pedidos._goPage(${n})">${n}</button>`
    ).join('');

    return `
      <div class="ped-pagination">
        <div class="ped-pag-info">
          Mostrando <strong>${Fmt.number(from)}–${Fmt.number(to)}</strong>
          de <strong>${Fmt.number(total)}</strong> registros
        </div>
        <div class="ped-pag-pages">
          <button class="ped-pag-btn" onclick="Pages.pedidos._goPage(${page - 1})"
                  ${page <= 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left" style="font-size:10px;"></i>
          </button>
          ${btnNums}
          <button class="ped-pag-btn" onclick="Pages.pedidos._goPage(${page + 1})"
                  ${page >= pages ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right" style="font-size:10px;"></i>
          </button>
        </div>
      </div>`;
  },

  _activeChipsHtml() {
    const s = this._st;
    const f = s.filters;
    const chips = [];
    if (f.id_req)    chips.push(`<span class="ped-chip" style="background:rgba(59,130,246,.1);color:#3B82F6;border-color:#3B82F6;">Req. #${f.id_req}<button onclick="Pages.pedidos._removeFilter('id_req')" style="color:#3B82F6;"><i class="fa-solid fa-xmark"></i></button></span>`);
    if (f.status)    chips.push(`<span class="ped-chip">Status: ${f.status === 'abertos' ? 'Em aberto' : f.status}<button onclick="Pages.pedidos._removeFilter('status')"><i class="fa-solid fa-xmark"></i></button></span>`);
    if (f.unidade)   chips.push(`<span class="ped-chip">Unidade: ${f.unidade}<button onclick="Pages.pedidos._removeFilter('unidade')"><i class="fa-solid fa-xmark"></i></button></span>`);
    if (f.comprador) chips.push(`<span class="ped-chip">Comprador: ${f.comprador}<button onclick="Pages.pedidos._removeFilter('comprador')"><i class="fa-solid fa-xmark"></i></button></span>`);
    if (f.busca)     chips.push(`<span class="ped-chip">Busca: "${f.busca}"<button onclick="Pages.pedidos._removeFilter('busca')"><i class="fa-solid fa-xmark"></i></button></span>`);
    return chips.join('');
  },

  /* ── filter helpers ──────────────────────────────────────── */
  _applyFilters() {
    const s = this._st;
    s.filters.id_req    = document.getElementById('pf-id-req')?.value.trim() || '';
    s.filters.busca     = document.getElementById('pf-busca')?.value.trim() || '';
    s.filters.status    = document.getElementById('pf-status')?.value || '';
    s.filters.unidade   = document.getElementById('pf-unidade')?.value || '';
    s.filters.comprador = document.getElementById('pf-comprador')?.value || '';
    // Read sort selection
    const sortIdx = parseInt(document.getElementById('pf-sort')?.value ?? '0');
    const sortOpt = this._SORT_OPTS[sortIdx] || this._SORT_OPTS[0];
    s.sort = { by: sortOpt.by, order: sortOpt.order };
    s.page = 1;
    this._loadList();
  },

  _clearFilters() {
    this._st.filters = { busca: '', status: '', unidade: '', comprador: '', id_req: '' };
    this._st.sort    = { by: 'id', order: 'desc' };
    this._st.page    = 1;
    this._loadList();
  },

  _removeFilter(key) {
    this._st.filters[key] = '';
    this._st.page = 1;
    this._loadList();
  },

  _quickStatus(val) {
    this._st.filters.status = val;
    this._st.page = 1;
    this._loadList();
  },

  _goPage(p) {
    const s = this._st;
    if (p < 1 || p > s.pages) return;
    s.page = p;
    this._loadList();
    document.getElementById('ped-root')?.scrollIntoView({ behavior: 'smooth' });
  },

  /* ── UNIDADES mode ───────────────────────────────────────── */
  async _loadUnidades() {
    const el = document.getElementById('ped-content');
    if (!el) return;
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;

    try {
      const data = await Api.get('/api/requisicoes/por-unidade');
      const sub = document.getElementById('ped-sub');
      const total = data.reduce((a, u) => a + u.total, 0);
      if (sub) sub.textContent = `${Fmt.number(total)} requisições em ${data.length} unidades`;
      el.innerHTML = this._htmlUnidades(data);
    } catch {
      el.innerHTML = `<div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-circle-xmark"></i></div>
        <p class="empty-title">Erro ao carregar</p></div>`;
    }
  },

  _htmlUnidades(units) {
    const colors = ['#422c76','#ff2f69','#01E18E','#3B82F6','#F59E0B','#8B5CF6'];

    // Global summary cards
    const totalReq = units.reduce((a, u) => a + u.total, 0);
    const totalVal = units.reduce((a, u) => a + u.total_valor, 0);
    const totalConc = units.reduce((a, u) => a + u.concluidos, 0);
    const taxaConc = totalReq > 0 ? ((totalConc / totalReq) * 100).toFixed(1) : 0;

    const summary = `
      <div class="ped-stats" style="margin-bottom:24px;">
        <div class="ped-stat-card">
          <div class="ped-stat-num">${Fmt.number(totalReq)}</div>
          <div class="ped-stat-lbl">Total de Requisições</div>
        </div>
        <div class="ped-stat-card">
          <div class="ped-stat-num" style="font-size:17px;">${Fmt.currency(totalVal)}</div>
          <div class="ped-stat-lbl">Valor Total Fechado</div>
        </div>
        <div class="ped-stat-card">
          <div class="ped-stat-num" style="color:var(--success);">${taxaConc}%</div>
          <div class="ped-stat-lbl">Taxa de Conclusão</div>
        </div>
        <div class="ped-stat-card">
          <div class="ped-stat-num">${units.length}</div>
          <div class="ped-stat-lbl">Unidades Ativas</div>
        </div>
      </div>`;

    const cards = units.map((u, idx) => {
      const color = colors[idx % colors.length];
      const pConc = u.total > 0 ? (u.concluidos / u.total * 100).toFixed(0) : 0;
      const pAnd  = u.total > 0 ? (u.em_andamento / u.total * 100).toFixed(0) : 0;
      const pRep  = u.total > 0 ? (u.reprovados / u.total * 100).toFixed(0) : 0;

      const recentes = (u.recentes || []).map(r => `
        <div class="ped-unit-rec-item">
          <span class="ped-unit-rec-id">#${r.id}</span>
          <span class="ped-unit-rec-name">${r.comprador || '—'}</span>
          <span style="margin-right:8px;">${StatusBadge.get(r.status || '')}</span>
          <span class="ped-unit-rec-val">${r.valor ? Fmt.currency(r.valor) : '—'}</span>
        </div>`).join('');

      return `
        <div class="ped-unit-card">
          <div class="ped-unit-header">
            <div>
              <div class="ped-unit-name">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
                             background:${color};margin-right:8px;"></span>${u.unidade}
              </div>
              <div class="ped-unit-total-val">${Fmt.currency(u.total_valor)} em compras</div>
            </div>
            <div style="text-align:right;">
              <div class="ped-unit-num">${Fmt.number(u.total)}</div>
              <div class="ped-unit-num-lbl">requisições</div>
            </div>
          </div>

          <div class="ped-unit-bars">
            <div class="ped-unit-bar-row">
              <span class="ped-unit-bar-lbl">Concluídas</span>
              <div class="ped-unit-bar-track">
                <div class="ped-unit-bar-fill" style="width:${pConc}%;background:#01E18E;"></div>
              </div>
              <span class="ped-unit-bar-count" style="color:#01E18E;">${u.concluidos}</span>
            </div>
            <div class="ped-unit-bar-row">
              <span class="ped-unit-bar-lbl">Em andamento</span>
              <div class="ped-unit-bar-track">
                <div class="ped-unit-bar-fill" style="width:${pAnd}%;background:${color};"></div>
              </div>
              <span class="ped-unit-bar-count" style="color:${color};">${u.em_andamento}</span>
            </div>
            <div class="ped-unit-bar-row">
              <span class="ped-unit-bar-lbl">Reprovadas</span>
              <div class="ped-unit-bar-track">
                <div class="ped-unit-bar-fill" style="width:${pRep}%;background:#ff2f69;"></div>
              </div>
              <span class="ped-unit-bar-count" style="color:#ff2f69;">${u.reprovados}</span>
            </div>
          </div>

          <div class="ped-unit-recentes">
            <div class="ped-unit-rec-title">Mais recentes</div>
            ${recentes || '<span style="font-size:12px;color:var(--text-subtle);">Nenhuma requisição</span>'}
          </div>

          <div class="ped-unit-footer">
            <button class="btn btn-outline btn-sm" style="width:100%;"
                    onclick="Pages.pedidos._filterByUnit('${u.unidade}')">
              <i class="fa-solid fa-list"></i> Ver todas da ${u.unidade}
            </button>
          </div>
        </div>`;
    }).join('');

    return summary + `<div class="ped-unit-grid">${cards}</div>`;
  },

  _filterByUnit(unidade) {
    this._st.mode = 'list';
    this._st.filters.unidade = unidade;
    this._st.page = 1;
    this._syncModeButtons();
    this._loadList();
  },

  /* ── Table action listeners ──────────────────────────────── */
  _attachTableListeners() {
    const tbody = document.querySelector('.ped-table tbody');
    if (!tbody) return;
    tbody.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;
      const id    = parseInt(btn.dataset.id);
      const label = btn.dataset.label || `#${id}`;
      if (btn.dataset.action === 'edit')   this._openUpdateModal(id);
      if (btn.dataset.action === 'delete') this._deleteReq(id, label);
    });
  },

  /* ── DELETE ──────────────────────────────────────────────── */
  async _deleteReq(id, label) {
    const ok = await Modal.confirm({
      icon: 'danger',
      title: `Excluir requisição ${label}?`,
      body: 'Todos os itens e lances vinculados serão removidos permanentemente. Esta ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/requisicoes/${id}`);
      Toast.success('Requisição excluída', `${label} foi removida do banco.`);
      this._loadList();
    } catch {
      Toast.error('Erro ao excluir', 'Verifique se a API está online.');
    }
  },

  /* ── WORKFLOW STEPS DEFINITION ───────────────────────────── */
  _STEPS: [
    { status: 'Aguardando Aprovação do Gestor', label: 'Aguardando Aprovação', icon: 'fa-clock',                color: '#f59e0b', pct: 5  },
    { status: 'Aguardando Cotação',             label: 'Aguardando Cotação',   icon: 'fa-magnifying-glass-dollar', color: '#3B82F6', pct: 20 },
    { status: '15% - Em Orçamento',             label: 'Em Orçamento',         icon: 'fa-file-invoice-dollar', color: '#8B5CF6', pct: 35 },
    { status: '30% Em Negociação',              label: 'Em Negociação',         icon: 'fa-handshake',           color: '#422c76', pct: 55 },
    { status: '50% - Aguardando Aprovação',     label: 'Aprovação Final',       icon: 'fa-user-shield',         color: '#ff2f69', pct: 70 },
    { status: '75% - PO Emitida',               label: 'PO Emitida',           icon: 'fa-file-contract',       color: '#01E18E', pct: 85 },
    { status: '100% Concluído',                 label: 'Concluído',             icon: 'fa-circle-check',        color: '#01E18E', pct: 100},
  ],

  /* ── OPEN UPDATE DRAWER ──────────────────────────────────── */
  async _openUpdateModal(id) {
    // Show loading drawer immediately
    this._buildDrawer({ id, status: null, loading: true });

    let req;
    try {
      req = await Api.get(`/api/requisicoes/${id}`);
    } catch {
      Toast.error('Erro ao carregar requisição');
      this._closeDrawer();
      return;
    }
    this._buildDrawer(req);
  },

  _buildDrawer(req) {
    // Remove existing drawer
    document.getElementById('req-drawer-root')?.remove();

    const isLoading = req.loading;

    // Find current step index
    const stepIdx = this._STEPS.findIndex(s =>
      s.status.toLowerCase() === (req.status || '').toLowerCase()
    );
    const currentStep = this._STEPS[stepIdx] || null;
    const isTerminal  = ['Reprovado','Cancelado'].includes(req.status);

    // Progress bar width
    const pct = currentStep ? currentStep.pct : (isTerminal ? 0 : 0);

    // Build steps HTML
    const stepsHtml = this._STEPS.map((s, i) => {
      const isDone   = stepIdx >= 0 && i < stepIdx;
      const isActive = i === stepIdx;
      const cls = isActive ? 'active' : isDone ? 'done' : '';
      const circleBg = isActive ? `background:${s.color}22;` : isDone ? 'background:rgba(1,225,142,.1);' : 'background:var(--bg);';
      const iconColor = isActive ? s.color : isDone ? '#01E18E' : 'var(--text-subtle)';
      return `
        <div class="req-step ${cls}" data-step="${i}">
          <div class="req-step-circle" style="${circleBg}">
            <i class="fa-solid ${isDone ? 'fa-check' : s.icon}" style="color:${iconColor};"></i>
          </div>
          <div class="req-step-info">
            <div class="req-step-name">${s.label}</div>
            <div class="req-step-pct">${s.pct}% concluído</div>
          </div>
          <i class="fa-solid fa-circle-dot req-step-sel"></i>
        </div>`;
    }).join('');

    // Items
    const itemsHtml = isLoading ? '<div class="req-items-hdr">Carregando itens…</div>' :
      (req.itens || []).length === 0
        ? '<div style="padding:10px 14px;font-size:12px;color:var(--text-muted);">Sem itens</div>'
        : (req.itens || []).map(it => `
            <div class="req-item-row">
              <span class="req-item-desc">${it.descricao}</span>
              <span class="req-item-qty">Qtd: ${it.quantidade}</span>
              <span class="req-item-seg">${it.segmento || ''}</span>
            </div>`).join('');

    const terminalClass = isTerminal
      ? (req.status === 'Reprovado' ? 'req-terminal-btn-danger' : 'req-terminal-btn-outline')
      : '';

    const root = document.createElement('div');
    root.id = 'req-drawer-root';
    root.innerHTML = `
      <div class="req-backdrop" id="req-backdrop">
        <div class="req-drawer">

          <div class="req-drawer-hdr">
            <div>
              <div class="req-drawer-title">Requisição #${req.id}</div>
              <div class="req-drawer-sub">${req.unidade || ''} &bull; ${req.data || ''} &bull; ${req.comprador || ''}</div>
            </div>
            <button class="req-drawer-close" id="req-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="req-drawer-body">

            ${isLoading ? '<div style="text-align:center;padding:40px;"><div class="spinner"></div></div>' : `

            <!-- Info strip -->
            <div class="req-info-strip">
              <div class="req-info-cell">
                <div class="req-info-lbl">Unidade</div>
                <div class="req-info-val">${req.unidade || '—'}</div>
              </div>
              <div class="req-info-cell">
                <div class="req-info-lbl">Data</div>
                <div class="req-info-val">${req.data || '—'}</div>
              </div>
              <div class="req-info-cell">
                <div class="req-info-lbl">Comprador</div>
                <div class="req-info-val">${req.comprador || '—'}</div>
              </div>
            </div>

            <!-- Items -->
            <div>
              <div class="req-step-section-lbl">Itens da Requisição</div>
              <div class="req-items-wrap">
                <div class="req-items-hdr">${(req.itens||[]).length} item(s)</div>
                ${itemsHtml}
              </div>
            </div>

            <!-- Progress bar -->
            <div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <div class="req-step-section-lbl">Progresso da Requisição</div>
                <div style="font-size:12px;font-weight:700;color:${currentStep?.color || 'var(--text-muted)'};">${pct}%</div>
              </div>
              <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;">
                <div style="height:100%;width:${pct}%;background:${currentStep?.color || 'var(--brand)'};border-radius:4px;transition:width .6s ease;"></div>
              </div>
              ${isTerminal ? `<div style="margin-top:6px;font-size:12px;font-weight:700;color:var(--accent);">Status: ${req.status}</div>` : ''}
            </div>

            <!-- Workflow stepper -->
            <div>
              <div class="req-step-section-lbl">Selecione a Nova Etapa</div>
              <div class="req-stepper" id="req-stepper">
                ${stepsHtml}
              </div>
            </div>

            <!-- Terminal actions -->
            <div>
              <div class="req-step-section-lbl">Encerrar Requisição</div>
              <div class="req-terminal-row">
                <button class="req-terminal-btn req-terminal-btn-danger" data-terminal="Reprovado">
                  <i class="fa-solid fa-ban"></i> Reprovar
                </button>
                <button class="req-terminal-btn req-terminal-btn-outline" data-terminal="Cancelado">
                  <i class="fa-solid fa-xmark"></i> Cancelar
                </button>
              </div>
            </div>

            <!-- Additional fields -->
            <div style="display:flex;flex-direction:column;gap:14px;">
              <div class="req-step-section-lbl" style="margin-bottom:0;">Informações Complementares</div>
              <div class="form-group">
                <label class="form-label">Fornecedor</label>
                <input id="req-forn" class="form-control" type="text"
                       placeholder="Nome ou razão social"
                       value="${req.fornecedor || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Valor Fechado (R$)</label>
                <input id="req-valor" class="form-control" type="number"
                       step="0.01" min="0" placeholder="0,00"
                       value="${req.valor_fechado || ''}">
              </div>
              <div class="form-group">
                <label class="form-label">Observações</label>
                <textarea id="req-obs" class="form-control" rows="3"
                          placeholder="Anotações, justificativas ou histórico…"
                          style="resize:vertical;">${req.observacoes || ''}</textarea>
              </div>
            </div>
            `}

          </div><!-- /body -->

          <div class="req-drawer-footer">
            <button class="btn btn-outline" id="req-cancel-btn">Cancelar</button>
            <button class="btn btn-primary" id="req-save-btn" data-id="${req.id}">
              <i class="fa-solid fa-floppy-disk"></i> Salvar Alterações
            </button>
          </div>

        </div><!-- /drawer -->
      </div><!-- /backdrop -->
    `;

    document.body.appendChild(root);

    // Store selected status
    let selectedStatus = req.status || null;

    // Step click
    root.querySelectorAll('.req-step').forEach((el, i) => {
      el.addEventListener('click', () => {
        root.querySelectorAll('.req-step').forEach(s => s.classList.remove('active'));
        el.classList.add('active');
        selectedStatus = this._STEPS[i].status;
      });
    });

    // Terminal buttons
    root.querySelectorAll('[data-terminal]').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.req-step').forEach(s => s.classList.remove('active'));
        selectedStatus = btn.dataset.terminal;
        // Visual feedback
        root.querySelectorAll('[data-terminal]').forEach(b => b.style.fontWeight = '600');
        btn.style.background = btn.classList.contains('req-terminal-btn-danger')
          ? 'var(--accent)' : 'var(--text-muted)';
        btn.style.color = '#fff';
      });
    });

    // Close
    const close = () => this._closeDrawer();
    root.getElementById?.('req-close')?.addEventListener('click', close);
    document.getElementById('req-close')?.addEventListener('click', close);
    document.getElementById('req-cancel-btn')?.addEventListener('click', close);
    document.getElementById('req-backdrop')?.addEventListener('click', e => {
      if (e.target === document.getElementById('req-backdrop')) close();
    });

    // Save
    document.getElementById('req-save-btn')?.addEventListener('click', () => {
      this._saveRequisicao(req.id, selectedStatus);
    });
  },

  _closeDrawer() {
    document.getElementById('req-drawer-root')?.remove();
  },

  /* ── SAVE ────────────────────────────────────────────────── */
  async _saveRequisicao(id, status) {
    const fornecedor    = document.getElementById('req-forn')?.value.trim()  || null;
    const valor_str     = document.getElementById('req-valor')?.value.trim() || '';
    const valor_fechado = valor_str ? parseFloat(valor_str) : null;
    const observacoes   = document.getElementById('req-obs')?.value.trim()   || null;

    const btn = document.getElementById('req-save-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando…'; }

    try {
      await Api.patch(`/api/requisicoes/${id}`, { status, fornecedor, valor_fechado, observacoes });
      Toast.success('Requisição atualizada', `#${id} foi atualizada com sucesso.`);
      this._closeDrawer();
      this._loadList();
    } catch {
      Toast.error('Erro ao salvar', 'Verifique se a API está online.');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Alterações'; }
    }
  },
};
