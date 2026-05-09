/* ── CONSULTA DE REQUISIÇÕES ────────────────────────────── */
window.Pages = window.Pages || {};

window.Pages.consulta = {
  title: 'Consulta de Requisições',
  icon: 'fa-magnifying-glass-arrow-right',

  _page: 1,
  _perPage: 20,
  _total: 0,
  _pages: 0,
  _filters: { busca: '', statuses: [], unidades: [], compradores: [] },
  _unidades: [],
  _compradores: [],
  _state: 'list',   // 'list' | 'detail'
  _reqAtual: null,

  /* ════════════════════════════════════════════════════════
     RENDER — shell estático, estilos embutidos
  ════════════════════════════════════════════════════════ */
  render() {
    return `
    <style>
      /* ── Status chips ─────────────────────────────────── */
      .cq-chip {
        display:inline-flex;align-items:center;gap:4px;
        font-size:11px;font-weight:700;padding:2px 9px;
        border-radius:20px;border:1.5px solid;white-space:nowrap;
      }
      .cq-chip i { font-size:6px; }
      .cq-verde  { background:#dcfce7;color:#059669;border-color:#bbf7d0; }
      .cq-azul   { background:#dbeafe;color:#1d4ed8;border-color:#bfdbfe; }
      .cq-amber  { background:#fef3c7;color:#d97706;border-color:#fde68a; }
      .cq-roxo   { background:#ede9fe;color:#6d28d9;border-color:#ddd6fe; }
      .cq-cinza  { background:#f3f4f6;color:#6b7280;border-color:#e5e7eb; }
      .cq-red    { background:#fee2e2;color:#dc2626;border-color:#fecaca; }

      /* ── Toolbar ──────────────────────────────────────── */
      .cq-toolbar {
        display:flex;gap:10px;flex-wrap:wrap;align-items:center;
        padding:16px 20px;background:var(--surface-card);
        border-bottom:1px solid var(--border-subtle);
      }
      .cq-toolbar-search {
        position:relative;flex:1;min-width:220px;
      }
      .cq-toolbar-search i {
        position:absolute;left:11px;top:50%;transform:translateY(-50%);
        color:var(--text-muted);font-size:13px;pointer-events:none;
      }
      .cq-toolbar-search input {
        width:100%;padding:8px 12px 8px 34px;
        background:var(--bg);border:1.5px solid var(--border);
        border-radius:var(--r-md);font-size:13px;font-family:var(--font);
        color:var(--text);outline:none;
      }
      .cq-toolbar-search input:focus { border-color:var(--brand); }
      .cq-toolbar select {
        padding:8px 12px;background:var(--bg);border:1.5px solid var(--border);
        border-radius:var(--r-md);font-size:13px;font-family:var(--font);
        color:var(--text);outline:none;cursor:pointer;
      }
      .cq-toolbar select:focus { border-color:var(--brand); }

      /* ── Tabela lista ─────────────────────────────────── */
      .cq-table { width:100%;border-collapse:collapse; }
      .cq-table thead th {
        padding:10px 14px;font-size:10.5px;font-weight:700;
        text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);
        background:var(--bg);border-bottom:1px solid var(--border);
        white-space:nowrap;cursor:pointer;user-select:none;
      }
      .cq-table thead th:hover { color:var(--brand); }
      .cq-table tbody tr {
        border-bottom:1px solid var(--border-subtle);
        transition:background .12s;cursor:pointer;
      }
      .cq-table tbody tr:hover { background:var(--brand-surface,rgba(66,44,118,.04)); }
      .cq-table tbody tr:last-child { border-bottom:none; }
      .cq-table td { padding:12px 14px;vertical-align:middle; }

      /* ── Pagination ──────────────────────────────────── */
      .cq-pagination {
        display:flex;align-items:center;justify-content:space-between;
        padding:12px 20px;border-top:1px solid var(--border-subtle);
        flex-wrap:wrap;gap:8px;
      }
      .cq-pagination-info { font-size:12.5px;color:var(--text-muted); }
      .cq-pager { display:flex;gap:4px;align-items:center; }
      .cq-pager button {
        min-width:32px;height:32px;padding:0 8px;
        background:var(--bg);border:1.5px solid var(--border);
        border-radius:8px;font-size:12.5px;font-family:var(--font);
        color:var(--text);cursor:pointer;font-weight:600;
        transition:all .15s;
      }
      .cq-pager button:hover:not(:disabled) { border-color:var(--brand);color:var(--brand); }
      .cq-pager button.active { background:var(--brand);color:#fff;border-color:var(--brand); }
      .cq-pager button:disabled { opacity:.35;cursor:default; }

      /* ── Section headers ─────────────────────────────── */
      .cq-sec {
        font-size:10px;font-weight:800;text-transform:uppercase;
        letter-spacing:.09em;color:#999;margin:22px 0 10px;
        display:flex;align-items:center;gap:8px;
      }
      .cq-sec::after { content:'';flex:1;height:1px;background:#f0f0f0; }
      .cq-sec i { color:var(--brand); }
      .cq-sec:first-child { margin-top:0; }

      /* ── Detail layout ───────────────────────────────── */
      .cq-detail-header {
        padding:20px 24px 18px;border-bottom:1px solid var(--border-subtle);
        display:flex;align-items:flex-start;justify-content:space-between;
        flex-wrap:wrap;gap:12px;
      }
      .cq-kpi-row {
        display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:4px;
      }
      @media(max-width:900px){ .cq-kpi-row { grid-template-columns:1fr 1fr; } }
      .cq-kpi-box {
        background:var(--bg);border:1px solid var(--border-subtle);
        border-radius:10px;padding:12px 14px;
        display:flex;align-items:center;gap:10px;
      }
      .cq-kpi-ico {
        width:36px;height:36px;border-radius:9px;
        display:flex;align-items:center;justify-content:center;flex-shrink:0;
      }
      .cq-info-lbl { font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-subtle);margin-bottom:3px; }
      .cq-info-val { font-size:13.5px;font-weight:800;color:var(--text); }

      /* ── Cotação cards ───────────────────────────────── */
      .cq-cot-card {
        border:1.5px solid var(--border-subtle);border-radius:12px;
        padding:14px 16px;margin-bottom:8px;transition:border-color .15s;
        position:relative;
      }
      .cq-cot-card:hover { border-color:var(--brand); }
      .cq-cot-card.winner {
        border-color:#059669;background:rgba(5,150,105,.04);
      }
      .cq-cot-card.winner::before {
        content:'✓ Selecionado';position:absolute;top:12px;right:12px;
        background:#059669;color:#fff;font-size:10px;font-weight:800;
        padding:2px 8px;border-radius:10px;letter-spacing:.04em;
      }

      /* ── File chips ──────────────────────────────────── */
      .cq-file-chip {
        display:inline-flex;align-items:center;gap:7px;
        background:var(--surface-card);border:1px solid var(--border);
        border-radius:10px;padding:8px 12px;margin:3px;
        font-size:12.5px;color:var(--text);transition:all .15s;
        text-decoration:none;
      }
      .cq-file-chip:hover { border-color:var(--brand);background:var(--brand-surface);color:var(--brand); }
      .cq-file-chip-name { font-weight:600;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
      .cq-file-chip-meta { font-size:11px;color:var(--text-muted); }

      /* ── Upload zone ─────────────────────────────────── */
      .cq-upload-zone {
        border:2px dashed var(--border);border-radius:10px;
        padding:14px 16px;text-align:center;cursor:pointer;
        transition:all .15s;background:var(--bg);
        font-size:13px;color:var(--text-muted);
      }
      .cq-upload-zone:hover { border-color:var(--brand);background:var(--brand-surface);color:var(--brand); }

      /* ── Back breadcrumb ─────────────────────────────── */
      .cq-back-bar {
        display:flex;align-items:center;gap:10px;
        padding:10px 20px;border-bottom:1px solid var(--border-subtle);
        background:var(--bg);font-size:13px;
      }
      .cq-back-btn {
        display:flex;align-items:center;gap:7px;
        background:none;border:none;cursor:pointer;
        font-size:13px;font-weight:700;color:var(--brand);
        font-family:var(--font);padding:4px 8px;border-radius:6px;
      }
      .cq-back-btn:hover { background:var(--brand-surface); }

      /* ── Skeleton ───────────────────────────────────── */
      .cq-skel { background:linear-gradient(90deg,var(--border) 25%,var(--border-subtle) 50%,var(--border) 75%);
        background-size:200% 100%;animation:cqSkel 1.4s infinite;border-radius:6px; }
      @keyframes cqSkel { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

      /* ── Empty ──────────────────────────────────────── */
      .cq-empty {
        text-align:center;padding:60px 20px;color:var(--text-muted);font-size:13.5px;
      }
      .cq-empty i { display:block;font-size:40px;margin-bottom:14px;opacity:.3; }
    </style>

    <div class="page-fade-in" id="cq-root">

      <!-- Header do módulo -->
      <div class="page-header" style="margin-bottom:0;padding-bottom:0;">
        <div class="page-header-left">
          <h1 class="page-title">Consulta de Requisições</h1>
          <p class="page-subtitle">Acompanhe o andamento completo de cada compra, cotações e arquivos</p>
        </div>
        <div class="page-header-actions" id="cq-header-actions">
          <div id="cq-total-badge" style="font-size:13px;color:var(--text-muted);"></div>
        </div>
      </div>

      <!-- Conteúdo dinâmico -->
      <div id="cq-main" style="margin-top:20px;">
        <div class="card" style="padding:60px;text-align:center;">
          <div class="spinner" style="margin:auto;"></div>
          <p style="color:var(--text-muted);margin-top:12px;font-size:14px;">Carregando requisições...</p>
        </div>
      </div>

    </div>`;
  },

  /* ════════════════════════════════════════════════════════
     INIT
  ════════════════════════════════════════════════════════ */
  _targetId: null,  // preenchido externamente para auto-abrir um detalhe

  async init() {
    this._page    = 1;
    this._state   = 'list';
    this._filters = { busca: '', statuses: [], unidades: [], compradores: [] };
    this._reqAtual = null;

    // Carrega unidades e compradores para os filtros
    try {
      const f = await Api.get('/api/requisicoes/filtros');
      this._unidades    = f.unidades    || [];
      this._compradores = f.compradores || [];
    } catch { this._unidades = []; this._compradores = []; }

    await this._carregarLista();

    // Se outra tela pediu para abrir um req diretamente
    if (this._targetId) {
      const tid = this._targetId;
      this._targetId = null;
      this._abrirDetalhe(tid);
    }
  },

  /* ════════════════════════════════════════════════════════
     LISTA
  ════════════════════════════════════════════════════════ */
  async _carregarLista(resetPage = false) {
    if (resetPage) this._page = 1;
    this._state = 'list';

    const main = document.getElementById('cq-main');
    if (!main) return;

    // Esqueleto
    main.innerHTML = this._renderListaShell(true);

    const { busca, statuses, unidades, compradores } = this._filters;
    const params = new URLSearchParams({
      page: this._page, per_page: this._perPage,
      sort_by: 'id', sort_order: 'desc',
    });
    if (busca)              params.set('busca', busca);
    if (statuses.length)    params.set('status', statuses.join(','));
    if (unidades.length)    params.set('unidade', unidades.join(','));
    if (compradores.length) params.set('comprador', compradores.join(','));

    try {
      const data = await Api.get(`/api/requisicoes?${params}`);
      this._total = data.total || 0;
      this._pages = data.pages || 1;

      const badge = document.getElementById('cq-total-badge');
      if (badge) badge.innerHTML = `<span class="badge badge-gray"><i class="fa-solid fa-layer-group"></i> ${this._total.toLocaleString('pt-BR')} requisições</span>`;

      main.innerHTML = this._renderListaShell(false, data.items || []);
      this._bindListaEvents();
    } catch (e) {
      main.innerHTML = `
        <div class="card cq-empty">
          <i class="fa-solid fa-triangle-exclamation"></i>
          <div style="font-weight:700;color:var(--text);margin-bottom:4px;">Erro ao carregar</div>
          <div>Verifique a conexão com a API e tente novamente.</div>
          <button class="btn btn-outline btn-sm" style="margin-top:16px;" onclick="Pages.consulta._carregarLista()">
            <i class="fa-solid fa-rotate-right"></i> Tentar novamente
          </button>
        </div>`;
    }
  },

  _renderListaShell(loading = false, items = []) {
    const { busca, statuses, unidades, compradores } = this._filters;
    const hasFilter = busca || statuses.length || unidades.length || compradores.length;
    const STATUS_OPTS = ['Aguardando Aprovação do Gestor','Em Cotação','Aguardando Conciliação','Concluído','Reprovado','Cancelado'];

    return `
    <div class="card" style="padding:0;overflow:hidden;">

      <!-- Toolbar -->
      <div class="cq-toolbar">
        <div class="cq-toolbar-search">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input type="text" id="cq-busca" placeholder="Buscar por ID, solicitante ou fornecedor..."
                 value="${busca}"
                 oninput="Pages.consulta._onBuscaInput(this.value)"
                 onkeydown="if(event.key==='Enter') Pages.consulta._carregarLista(true)">
        </div>
        ${msHtml('cq-ms-unid', this._unidades, unidades, 'Todas as unidades', "Pages.consulta._toggleFilter('unidades',")}
        ${msHtml('cq-ms-comp', this._compradores, compradores, 'Todos os compradores', "Pages.consulta._toggleFilter('compradores',")}
        ${msHtml('cq-ms-stat', STATUS_OPTS, statuses, 'Todos os status', "Pages.consulta._toggleFilter('statuses',")}
        <button class="btn btn-primary btn-sm" onclick="Pages.consulta._carregarLista(true)">
          <i class="fa-solid fa-magnifying-glass"></i> Buscar
        </button>
        ${hasFilter ? `
          <button class="btn btn-ghost btn-sm" style="color:var(--accent);" onclick="Pages.consulta._limparFiltros()">
            <i class="fa-solid fa-xmark"></i> Limpar
          </button>` : ''}
      </div>

      <!-- Corpo -->
      ${loading ? this._renderSkeleton() : this._renderTabela(items)}

      <!-- Paginação -->
      ${!loading && this._total > 0 ? this._renderPaginacao() : ''}

    </div>`;
  },

  _renderTabela(items) {
    if (items.length === 0) return `
      <div class="cq-empty">
        <i class="fa-solid fa-inbox"></i>
        <div style="font-weight:700;color:var(--text);margin-bottom:6px;">Nenhuma requisição encontrada</div>
        <div>Tente ajustar os filtros ou fazer uma nova busca.</div>
      </div>`;

    const rows = items.map(r => {
      const sc   = this._statusClass(r.status);
      const val  = r.valor != null ? `<span style="font-size:12.5px;font-weight:700;color:#059669;">${Fmt.currency(r.valor)}</span>` : '<span style="color:var(--text-muted);font-size:12px;">—</span>';
      const prev = r.itens_preview
        ? `<div style="font-size:11.5px;color:var(--text-muted);margin-top:3px;max-width:280px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${r.itens_preview}">${r.itens_preview}</div>`
        : '';
      const solicitante = r.solicitante || r.comprador || '—';
      const comprador   = r.comprador_responsavel;
      return `
        <tr onclick="Pages.consulta._abrirDetalhe(${r.id})">
          <td style="width:60px;">
            <div style="font-size:14px;font-weight:800;color:var(--brand);">#${r.id}</div>
          </td>
          <td>
            <div style="font-size:12.5px;font-weight:700;color:var(--text);">
              <i class="fa-solid fa-user" style="color:var(--brand);font-size:10px;margin-right:4px;"></i>${solicitante}
            </div>
            ${comprador ? `<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">
              <i class="fa-solid fa-user-tie" style="font-size:9px;margin-right:3px;"></i>Comprador: ${comprador}
            </div>` : ''}
            <div style="font-size:11px;color:var(--text-subtle);margin-top:2px;">
              <i class="fa-solid fa-building" style="font-size:9px;margin-right:3px;"></i>${r.unidade || '—'}${r.setor ? ` · ${r.setor}` : ''}
            </div>
          </td>
          <td>
            <div style="font-size:12.5px;color:var(--text);">${r.data || '—'}</div>
          </td>
          <td>
            <span class="cq-chip cq-${sc}">
              <i class="fa-solid fa-circle"></i> ${r.status || 'Sem status'}
            </span>
          </td>
          <td style="text-align:center;">
            <span style="font-size:12.5px;font-weight:700;color:var(--text);">${r.itens_count || 0}</span>
            <div style="font-size:10.5px;color:var(--text-muted);">itens</div>
          </td>
          <td>
            ${r.fornecedor ? `<div style="font-size:12.5px;font-weight:600;color:var(--text);">${r.fornecedor}</div>` : '<span style="font-size:12px;color:var(--text-muted);">—</span>'}
            ${prev}
          </td>
          <td style="text-align:right;">${val}</td>
          <td style="width:36px;">
            <i class="fa-solid fa-chevron-right" style="color:var(--text-muted);font-size:11px;"></i>
          </td>
        </tr>`;
    }).join('');

    return `
      <div style="overflow-x:auto;">
        <table class="cq-table">
          <thead>
            <tr>
              <th>Nº</th>
              <th>Solicitante · Comprador · Unidade</th>
              <th>Data</th>
              <th>Status</th>
              <th style="text-align:center;">Itens</th>
              <th>Fornecedor / Itens</th>
              <th style="text-align:right;">Valor</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _renderPaginacao() {
    const start = (this._page - 1) * this._perPage + 1;
    const end   = Math.min(this._page * this._perPage, this._total);

    // Gera botões de página (max 7 visíveis)
    let pageBtns = '';
    const maxVisible = 7;
    let startPage = Math.max(1, this._page - 3);
    let endPage   = Math.min(this._pages, startPage + maxVisible - 1);
    if (endPage - startPage < maxVisible - 1) startPage = Math.max(1, endPage - maxVisible + 1);

    if (startPage > 1) pageBtns += `<button onclick="Pages.consulta._goPage(1)">1</button>`;
    if (startPage > 2) pageBtns += `<button disabled style="border:none;background:none;padding:0 4px;">…</button>`;

    for (let p = startPage; p <= endPage; p++) {
      pageBtns += `<button class="${p === this._page ? 'active' : ''}" onclick="Pages.consulta._goPage(${p})">${p}</button>`;
    }

    if (endPage < this._pages - 1) pageBtns += `<button disabled style="border:none;background:none;padding:0 4px;">…</button>`;
    if (endPage < this._pages) pageBtns += `<button onclick="Pages.consulta._goPage(${this._pages})">${this._pages}</button>`;

    return `
      <div class="cq-pagination">
        <div class="cq-pagination-info">
          Mostrando <strong>${start}</strong>–<strong>${end}</strong> de <strong>${this._total.toLocaleString('pt-BR')}</strong> requisições
        </div>
        <div class="cq-pager">
          <button onclick="Pages.consulta._goPage(${this._page - 1})" ${this._page <= 1 ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-left"></i>
          </button>
          ${pageBtns}
          <button onclick="Pages.consulta._goPage(${this._page + 1})" ${this._page >= this._pages ? 'disabled' : ''}>
            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </div>`;
  },

  _renderSkeleton() {
    const rows = Array(8).fill(0).map(() => `
      <tr>
        <td><div class="cq-skel" style="width:36px;height:18px;"></div></td>
        <td><div class="cq-skel" style="width:120px;height:14px;margin-bottom:5px;"></div><div class="cq-skel" style="width:80px;height:11px;"></div></td>
        <td><div class="cq-skel" style="width:80px;height:13px;"></div></td>
        <td><div class="cq-skel" style="width:110px;height:22px;border-radius:20px;"></div></td>
        <td><div class="cq-skel" style="width:28px;height:16px;margin:auto;"></div></td>
        <td><div class="cq-skel" style="width:160px;height:13px;"></div></td>
        <td><div class="cq-skel" style="width:70px;height:14px;margin-left:auto;"></div></td>
        <td></td>
      </tr>`).join('');
    return `
      <table class="cq-table">
        <thead><tr>
          <th>Nº</th><th>Solicitante / Unidade</th><th>Data</th>
          <th>Status</th><th style="text-align:center;">Itens</th>
          <th>Fornecedor / Itens</th><th style="text-align:right;">Valor</th><th></th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  _bindListaEvents() {
    const busca = document.getElementById('cq-busca');
    if (busca) busca.focus();
  },

  _onBuscaInput(val) {
    this._filters.busca = val;
    // Debounce: só busca automático se for número (ID)
    if (/^\d+$/.test(val.trim())) {
      clearTimeout(this._debounce);
      this._debounce = setTimeout(() => this._carregarLista(true), 400);
    }
  },

  _toggleFilter(key, val, checked) {
    const arr = this._filters[key] || [];
    this._filters[key] = checked ? [...arr, val] : arr.filter(v => v !== val);
    this._carregarLista(true);
  },

  _limparFiltros() {
    this._filters = { busca: '', statuses: [], unidades: [], compradores: [] };
    this._carregarLista(true);
  },

  _goPage(p) {
    if (p < 1 || p > this._pages) return;
    this._page = p;
    this._carregarLista(false);
    document.getElementById('cq-root')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  /* ════════════════════════════════════════════════════════
     DETALHE
  ════════════════════════════════════════════════════════ */
  async _abrirDetalhe(id) {
    this._state = 'detail';
    const main = document.getElementById('cq-main');
    if (!main) return;

    // Loading state
    main.innerHTML = `
      <div class="cq-back-bar">
        <button class="cq-back-btn" onclick="Pages.consulta._voltarLista()">
          <i class="fa-solid fa-arrow-left"></i> Voltar para a lista
        </button>
        <i class="fa-solid fa-chevron-right" style="color:var(--text-muted);font-size:10px;"></i>
        <span style="color:var(--text-muted);">Requisição #${id}</span>
      </div>
      <div class="card" style="padding:60px;text-align:center;margin-top:0;border-top-left-radius:0;border-top-right-radius:0;">
        <div class="spinner" style="margin:auto;"></div>
        <p style="color:var(--text-muted);margin-top:12px;font-size:14px;">Carregando detalhes da requisição #${id}...</p>
      </div>`;

    try {
      const data = await Api.get(`/api/requisicoes/${id}/detalhes-completos`);
      this._reqAtual = data;
      this._renderDetalhe(data);
    } catch {
      main.innerHTML = `
        <div class="cq-back-bar">
          <button class="cq-back-btn" onclick="Pages.consulta._voltarLista()">
            <i class="fa-solid fa-arrow-left"></i> Voltar para a lista
          </button>
        </div>
        <div class="card cq-empty" style="border-top-left-radius:0;border-top-right-radius:0;">
          <i class="fa-solid fa-circle-xmark" style="color:var(--accent);"></i>
          <div style="font-weight:700;color:var(--text);margin-bottom:6px;">Requisição não encontrada</div>
          <div>O ID <strong>#${id}</strong> não existe ou foi removido.</div>
        </div>`;
    }
  },

  _voltarLista() {
    this._state = 'list';
    this._carregarLista(false);
  },

  _renderDetalhe(d) {
    const main = document.getElementById('cq-main');
    if (!main) return;

    const sc = this._statusClass(d.status);
    const solicitante = d.solicitante || d.comprador || '—';
    const compradorResp = d.comprador_responsavel;
    const todosArqs = d.arquivos || [];
    const arqReq  = todosArqs.filter(a => a.origem === 'requisitante');
    const arqComp = todosArqs.filter(a => a.origem === 'comprador');
    const arqForn = todosArqs.filter(a => a.origem === 'fornecedor');
    const arqOutros = todosArqs.filter(a => !['requisitante','comprador','fornecedor'].includes(a.origem));
    const totalArq = todosArqs.length;

    main.innerHTML = `
    <!-- Breadcrumb + voltar -->
    <div class="cq-back-bar">
      <button class="cq-back-btn" onclick="Pages.consulta._voltarLista()">
        <i class="fa-solid fa-arrow-left"></i> Voltar para a lista
      </button>
      <i class="fa-solid fa-chevron-right" style="color:var(--text-muted);font-size:10px;"></i>
      <span style="color:var(--text-muted);">Requisição #${d.id}</span>
    </div>

    <div class="card" style="padding:0;overflow:hidden;margin-top:0;border-top-left-radius:0;border-top-right-radius:0;">

      <!-- Cabeçalho da requisição -->
      <div class="cq-detail-header">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:52px;height:52px;border-radius:13px;background:var(--brand-surface);
                      display:flex;align-items:center;justify-content:center;font-size:24px;
                      color:var(--brand);flex-shrink:0;">
            <i class="fa-solid fa-file-invoice"></i>
          </div>
          <div>
            <div style="font-size:21px;font-weight:800;color:var(--text);letter-spacing:-.3px;">
              Requisição #${d.id}
            </div>
            <div style="font-size:13px;color:var(--text-muted);margin-top:4px;display:flex;flex-wrap:wrap;gap:6px 16px;">
              <span><i class="fa-regular fa-calendar" style="margin-right:4px;"></i>${d.data || '—'}</span>
              <span><i class="fa-solid fa-building" style="margin-right:4px;"></i>${d.unidade || '—'}${d.setor ? ` · ${d.setor}` : ''}</span>
            </div>
            <div style="font-size:12.5px;margin-top:6px;display:flex;flex-wrap:wrap;gap:6px 16px;">
              <span style="display:inline-flex;align-items:center;gap:5px;background:#f5f3ff;border:1px solid #e0d9f9;border-radius:8px;padding:3px 10px;">
                <i class="fa-solid fa-user" style="color:#6633ee;font-size:10px;"></i>
                <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#6633ee;">Solicitante</span>
                <span style="font-weight:700;color:var(--text);">${solicitante}</span>
              </span>
              ${compradorResp ? `
              <span style="display:inline-flex;align-items:center;gap:5px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:3px 10px;">
                <i class="fa-solid fa-user-tie" style="color:#1d4ed8;font-size:10px;"></i>
                <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#1d4ed8;">Comprador</span>
                <span style="font-weight:700;color:var(--text);">${compradorResp}</span>
              </span>` : ''}
            </div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="cq-chip cq-${sc}">
            <i class="fa-solid fa-circle"></i> ${d.status || 'Sem Status'}
          </span>
          ${(d.cotacoes?.length||0) > 0 ? `<span class="cq-chip cq-roxo"><i class="fa-solid fa-tag" style="font-size:9px;"></i> ${d.cotacoes.length} cotação(ões)</span>` : ''}
          ${totalArq > 0 ? `<span class="cq-chip cq-azul"><i class="fa-solid fa-paperclip" style="font-size:9px;"></i> ${totalArq} arquivo(s)</span>` : ''}
          ${(d.cotacoes || []).filter(c => c.preco_unitario > 0).length > 0 ? `
          <button class="btn btn-sm" style="background:#fee2e2;color:#dc2626;border:1.5px solid #fecaca;font-weight:700;gap:6px;"
                  onclick="MapaCotacao.gerar(${d.id})">
            <i class="fa-solid fa-file-pdf"></i> Mapa de Cotação
          </button>` : ''}
          ${(d.cotacoes || []).some(c => c.selecionado) ? `
          <button class="btn btn-sm" style="background:#f0fdf4;color:#166534;border:1.5px solid #bbf7d0;font-weight:700;gap:6px;"
                  onclick="POCompra.gerar(${d.id})">
            <i class="fa-solid fa-file-invoice"></i> Reemitir PO
          </button>` : ''}
        </div>
      </div>

      <!-- Corpo -->
      <div style="padding:24px;">

        <!-- KPIs -->
        <div class="cq-kpi-row">
          ${[
            { l:'Total de Itens',      v: d.total_itens ?? d.itens?.length ?? 0,  icon:'fa-boxes-stacked', c:'var(--brand)' },
            { l:'Cotações Recebidas',  v: d.total_cotacoes ?? d.cotacoes?.length ?? 0, icon:'fa-tag',  c:'#8b5cf6' },
            { l:'Melhor Preço Unit.',  v: d.melhor_preco != null ? Fmt.currency(d.melhor_preco) : '—', icon:'fa-sack-dollar', c:'#059669' },
            { l:'Valor Fechado',       v: d.valor_fechado != null ? Fmt.currency(d.valor_fechado) : '—', icon:'fa-handshake',  c:'#1d4ed8' },
          ].map(k => `
            <div class="cq-kpi-box">
              <div class="cq-kpi-ico" style="background:var(--brand-surface);">
                <i class="fa-solid ${k.icon}" style="color:${k.c};font-size:15px;"></i>
              </div>
              <div>
                <div class="cq-info-lbl">${k.l}</div>
                <div class="cq-info-val">${k.v}</div>
              </div>
            </div>`).join('')}
        </div>

        <!-- Justificativa -->
        ${d.justificativa ? `
        <div class="cq-sec" style="margin-top:22px;"><i class="fa-solid fa-circle-info"></i> Justificativa da Compra</div>
        <div style="background:#f8f6ff;border:1px solid #e0d9f9;border-radius:12px;padding:16px 18px;
                    font-size:13.5px;color:var(--text);line-height:1.7;">${d.justificativa}</div>
        ` : ''}

        <!-- ── ITENS ── -->
        <div class="cq-sec"><i class="fa-solid fa-list-check"></i> Itens Solicitados</div>
        ${this._renderItens(d.itens)}

        <!-- ── COTAÇÕES ── -->
        ${(d.cotacoes?.length||0) > 0 ? `
          <div class="cq-sec"><i class="fa-solid fa-tag"></i> Cotações Recebidas</div>
          ${d.cotacoes.map(c => this._renderCotacaoCard(c)).join('')}
        ` : ''}

        <!-- ── ARQUIVOS ── -->
        <div class="cq-sec"><i class="fa-solid fa-paperclip"></i> Arquivos do Processo
          ${totalArq > 0 ? `<span style="margin-left:6px;background:var(--brand);color:#fff;font-size:9px;padding:1px 7px;border-radius:10px;font-weight:700;">${totalArq}</span>` : ''}
        </div>

        ${arqReq.length  > 0 ? this._renderArquivosBloco(arqReq,   'Requisitante', 'fa-user',      '#6633ee', d.id) : ''}
        ${arqComp.length > 0 ? this._renderArquivosBloco(arqComp,  'Comprador',    'fa-user-tie',  '#1d4ed8', d.id) : ''}
        ${arqForn.length > 0 ? this._renderArquivosBloco(arqForn,  'Fornecedores', 'fa-building',  '#059669', d.id) : ''}
        ${arqOutros.length > 0 ? this._renderArquivosBloco(arqOutros,'Outros',      'fa-paperclip', '#64748b', d.id) : ''}
        ${totalArq === 0 ? `
        <div style="text-align:center;padding:24px 16px;color:var(--text-muted);font-size:13px;
                    background:var(--bg);border-radius:10px;border:1px dashed var(--border);">
          <i class="fa-solid fa-folder-open" style="font-size:24px;opacity:.3;display:block;margin-bottom:8px;"></i>
          Nenhum arquivo anexado ainda. Use o campo abaixo para adicionar.
        </div>` : ''}

        <!-- Upload novo arquivo -->
        <div style="margin-top:16px;border-top:1px solid var(--border-subtle);padding-top:16px;">
          <div style="font-size:11.5px;font-weight:700;color:var(--text-muted);
                      text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">
            <i class="fa-solid fa-plus-circle" style="color:var(--brand);margin-right:5px;"></i>
            Adicionar Arquivo a esta Requisição
          </div>
          <div class="cq-upload-zone" id="cq-uz-${d.id}"
               onclick="document.getElementById('cq-fi-${d.id}').click()">
            <input type="file" id="cq-fi-${d.id}" style="display:none;"
                   accept=".pdf,.xlsx,.xls,.csv,.txt,.pptx,.ppt,.docx,.doc,.png,.jpg,.jpeg,.xml"
                   onchange="Pages.consulta._uploadArquivo(${d.id}, this)">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size:22px;margin-bottom:6px;display:block;"></i>
            Clique para anexar (PDF, Excel, Word, imagens...)
          </div>
        </div>

      </div>
    </div>`;
  },

  _renderItens(itens) {
    if (!itens?.length) return `<p style="color:var(--text-muted);font-size:13px;">Sem itens registrados.</p>`;
    const rows = itens.map((it, i) => `
      <tr style="border-bottom:1px solid var(--border-subtle);">
        <td style="padding:10px 14px;font-size:12px;color:var(--text-muted);width:36px;">${i + 1}</td>
        <td style="padding:10px 14px;font-size:13px;font-weight:600;color:var(--text);">${it.descricao}</td>
        <td style="padding:10px 14px;font-size:12px;">
          ${it.segmento ? `<span class="badge badge-gray">${it.segmento}</span>` : '—'}
        </td>
        <td style="padding:10px 14px;font-size:13px;font-weight:700;color:var(--brand);text-align:right;">
          ${it.quantidade} ${it.unidade || ''}
        </td>
      </tr>`).join('');
    return `
      <div style="border:1px solid var(--border-subtle);border-radius:12px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--bg);">
              <th style="padding:9px 14px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);border-bottom:1px solid var(--border);text-align:left;">#</th>
              <th style="padding:9px 14px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);border-bottom:1px solid var(--border);text-align:left;">Descrição</th>
              <th style="padding:9px 14px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);border-bottom:1px solid var(--border);text-align:left;">Categoria</th>
              <th style="padding:9px 14px;font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);border-bottom:1px solid var(--border);text-align:right;">Qtd.</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _renderCotacaoCard(c) {
    return `
    <div class="cq-cot-card ${c.selecionado ? 'winner' : ''}">
      <div style="font-size:13.5px;font-weight:800;color:var(--text);margin-bottom:10px;">
        <i class="fa-solid fa-building" style="color:var(--brand);margin-right:6px;"></i>${c.nome}
        ${c.cnpj ? `<span style="font-weight:400;font-size:12px;color:var(--text-muted);margin-left:8px;">${c.cnpj}</span>` : ''}
      </div>
      <div style="display:flex;gap:24px;flex-wrap:wrap;align-items:flex-end;margin-bottom:10px;">
        <div>
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-bottom:2px;">Preço Unitário</div>
          <div style="font-size:22px;font-weight:800;color:var(--brand);">${Fmt.currency(c.preco_unitario)}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-bottom:2px;">Prazo</div>
          <div style="font-size:13px;font-weight:700;color:var(--text);">${c.prazo ?? '—'} dias úteis</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-bottom:2px;">Pagamento</div>
          <div style="font-size:13px;font-weight:700;color:var(--text);">${c.pagamento || '—'}</div>
        </div>
        <div>
          <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;margin-bottom:2px;">Validade</div>
          <div style="font-size:13px;font-weight:700;color:var(--text);">${c.validade_dias ?? 15} dias</div>
        </div>
      </div>
      <div style="font-size:12px;color:var(--text-muted);display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
        ${c.frete_incluso   ? '<span style="color:#059669;"><i class="fa-solid fa-truck-fast" style="margin-right:3px;"></i>Frete incluso</span>'      : '<span style="color:#d97706;"><i class="fa-solid fa-truck" style="margin-right:3px;"></i>Frete a negociar</span>'}
        ${c.imposto_incluso ? '<span style="color:#059669;"><i class="fa-solid fa-receipt" style="margin-right:3px;"></i>Impostos inclusos</span>'      : '<span style="color:#d97706;"><i class="fa-solid fa-receipt" style="margin-right:3px;"></i>Impostos a negociar</span>'}
        ${c.observacoes ? `<span><i class="fa-solid fa-note-sticky" style="color:var(--brand);margin-right:3px;"></i>${c.observacoes.substring(0, 100)}${c.observacoes.length > 100 ? '...' : ''}</span>` : ''}
      </div>
      ${c.arquivo_nome ? `
        <div style="margin-top:10px;">
          <a href="${c.arquivo_path}" target="_blank" download="${c.arquivo_nome}" class="cq-file-chip" style="display:inline-flex;">
            <i class="fa-solid ${this._fileIcon(c.arquivo_nome)}" style="color:${this._fileColor(c.arquivo_nome)};font-size:15px;"></i>
            <span class="cq-file-chip-name">${c.arquivo_nome}</span>
            <i class="fa-solid fa-download" style="font-size:11px;opacity:.5;"></i>
          </a>
        </div>` : ''}
    </div>`;
  },

  _renderArquivosBloco(arquivos, label, icon, color, reqId) {
    const bgMap  = { 'Requisitante':'#f5f3ff','Comprador':'#eff6ff','Fornecedores':'#f0fdf4','Outros':'#f8fafc' };
    const bdMap  = { 'Requisitante':'#e0d9f9','Comprador':'#bfdbfe','Fornecedores':'#bbf7d0','Outros':'#e2e8f0' };
    const clrMap = { 'Requisitante':'#6d28d9','Comprador':'#1d4ed8','Fornecedores':'#059669','Outros':'#64748b' };

    const bg  = bgMap[label]  || 'var(--bg)';
    const bd  = bdMap[label]  || 'var(--border)';
    const clr = clrMap[label] || color;

    return `
      <div style="margin-bottom:10px;padding:12px 14px;background:${bg};
                  border:1px solid ${bd};border-radius:10px;">
        <div style="font-size:11px;font-weight:800;text-transform:uppercase;letter-spacing:.07em;
                    color:${clr};margin-bottom:8px;display:flex;align-items:center;gap:6px;">
          <i class="fa-solid ${icon}"></i> ${label}
          <span style="background:${clr};color:#fff;font-size:9px;padding:1px 6px;border-radius:10px;font-weight:700;margin-left:2px;">${arquivos.length}</span>
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${arquivos.map(a => {
            const meta = [
              a.tamanho_kb ? a.tamanho_kb.toFixed(0) + ' KB' : null,
              a.enviado_por ? a.enviado_por : null,
              a.enviado_em ? a.enviado_em.split(' ')[0] : null
            ].filter(Boolean).join(' · ');
            return `
            <a href="${a.caminho}" target="_blank" download="${a.nome_arquivo}" class="cq-file-chip"
               title="${a.nome_arquivo}${a.enviado_por ? ' — ' + a.enviado_por : ''}">
              <i class="fa-solid ${this._fileIcon(a.nome_arquivo)}" style="color:${this._fileColor(a.nome_arquivo)};font-size:16px;flex-shrink:0;"></i>
              <div style="min-width:0;">
                <div class="cq-file-chip-name">${a.nome_arquivo}</div>
                ${meta ? `<div class="cq-file-chip-meta">${meta}</div>` : ''}
              </div>
              <i class="fa-solid fa-download" style="font-size:11px;opacity:.35;margin-left:4px;flex-shrink:0;"></i>
            </a>`;
          }).join('')}
        </div>
      </div>`;
  },

  async _uploadArquivo(reqId, input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) { Toast.warning('Arquivo muito grande', 'Máximo de 15 MB.'); input.value = ''; return; }
    const zone = document.getElementById(`cq-uz-${reqId}`);
    if (zone) { zone.style.opacity = '.5'; zone.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="font-size:20px;margin-bottom:6px;display:block;"></i> Enviando...`; }
    try {
      const user = localStorage.getItem('shp_user_email') || 'comprador';
      await SbUploadArquivo(reqId, file, 'comprador', user);
      Toast.success('Arquivo enviado', file.name);
      const data = await Api.get(`/api/requisicoes/${reqId}/detalhes-completos`);
      this._reqAtual = data;
      this._renderDetalhe(data);
    } catch (err) {
      Toast.error('Erro ao enviar arquivo', err.message || '');
      if (zone) {
        zone.style.opacity = '1';
        zone.innerHTML = `<input type="file" id="cq-fi-${reqId}" style="display:none;" accept=".pdf,.xlsx,.xls,.csv,.txt,.pptx,.ppt,.docx,.doc,.png,.jpg,.jpeg,.xml" onchange="Pages.consulta._uploadArquivo(${reqId},this)"><i class="fa-solid fa-cloud-arrow-up" style="font-size:22px;margin-bottom:6px;display:block;"></i> Clique para anexar`;
      }
    }
  },

  /* ════════════════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════════════════ */
  _statusClass(s) {
    const m = {
      'Concluído': 'verde', 'Finalizado': 'verde',
      'Aguardando Conciliação': 'azul',
      'Em Cotação': 'roxo',
      'Aguardando Aprovação': 'amber',
      'Aguardando Aprovação do Gestor': 'amber',
      'Reprovado': 'red', 'Cancelado': 'red',
    };
    return m[s] || 'cinza';
  },

  _fileIcon(nome) {
    if (!nome) return 'fa-file';
    const ext = nome.split('.').pop()?.toLowerCase();
    const map = {
      pdf: 'fa-file-pdf', xlsx: 'fa-file-excel', xls: 'fa-file-excel',
      csv: 'fa-file-csv', doc: 'fa-file-word', docx: 'fa-file-word',
      ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint',
      png: 'fa-file-image', jpg: 'fa-file-image', jpeg: 'fa-file-image',
      txt: 'fa-file-lines', xml: 'fa-file-code',
    };
    return map[ext] || 'fa-file';
  },

  _fileColor(nome) {
    const ext = (nome || '').split('.').pop()?.toLowerCase();
    const c = {
      pdf: '#dc2626', xlsx: '#059669', xls: '#059669', csv: '#059669',
      doc: '#1d4ed8', docx: '#1d4ed8', ppt: '#ea580c', pptx: '#ea580c',
      png: '#7c3aed', jpg: '#7c3aed', jpeg: '#7c3aed',
    };
    return c[ext] || '#6b7280';
  },
};
