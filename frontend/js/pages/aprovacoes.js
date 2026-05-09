/* ── APROVAÇÕES PAGE (Painel de Requisições) ───────────────────── */
window.Pages = window.Pages || {};

window.Pages.aprovacoes = {
  title: 'Painel de Requisições',
  _todos: [],
  _filtros: { busca: '', unidades: [] },

  render() {
    return `
    <div class="page-fade-in" id="aprov-root">

      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Painel de Requisições</h1>
          <p class="page-subtitle">Revise e aprove as requisições pendentes da sua equipe</p>
        </div>
        <div class="page-header-actions">
          <span id="aprov-count" class="badge badge-warning" style="display:none;"></span>
          <button class="btn btn-outline btn-sm" onclick="Pages.aprovacoes.init()">
            <i class="fa-solid fa-rotate-right"></i> Atualizar
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;
                  padding:14px 20px;background:#fff;
                  border:1px solid var(--border);border-radius:var(--r-lg);
                  margin-bottom:20px;">
        <div style="position:relative;flex:1;min-width:180px;">
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;
             transform:translateY(-50%);color:var(--text-muted);font-size:12px;pointer-events:none;"></i>
          <input type="text" id="aprov-busca" class="form-control"
                 placeholder="Buscar #ID ou solicitante..."
                 style="padding-left:32px;height:36px;font-size:13px;"
                 oninput="Pages.aprovacoes._onBusca(this.value)">
        </div>
        <div id="aprov-unidade-wrap"></div>
        <button id="aprov-limpar-btn" class="btn btn-ghost btn-sm"
                style="display:none;color:var(--accent);height:36px;"
                onclick="Pages.aprovacoes._limparFiltros()">
          <i class="fa-solid fa-xmark"></i> Limpar
        </button>
      </div>

      <!-- Lista de pendências -->
      <div id="aprov-lista">
        ${Skeleton.list(3)}
      </div>

    </div>

    <style>
    /* ── Approval card ───────────────────────────────────────── */
    .aprov-card {
      background:#fff;
      border:1px solid var(--border);
      border-radius:var(--r-lg);
      margin-bottom:16px;
      overflow:hidden;
      transition:box-shadow .15s;
    }
    .aprov-card:hover { box-shadow:0 4px 20px rgba(0,0,0,.08); }

    .aprov-card-header {
      display:flex; align-items:flex-start; justify-content:space-between;
      padding:18px 22px 14px; gap:12px;
      border-bottom:1px solid var(--border-subtle);
    }
    .aprov-card-id {
      font-size:13px; font-weight:800; color:var(--brand);
      font-variant-numeric:tabular-nums;
      display:flex; align-items:center; gap:8px;
    }
    .aprov-card-title {
      font-size:15px; font-weight:700; color:var(--text);
      margin-bottom:4px;
    }
    .aprov-card-meta {
      display:flex; flex-wrap:wrap; gap:14px;
      font-size:12.5px; color:var(--text-muted);
    }
    .aprov-card-meta span {
      display:flex; align-items:center; gap:5px;
    }
    .aprov-card-meta i { font-size:11px; color:var(--text-subtle); }

    .aprov-card-body {
      padding:16px 22px;
      display:grid; grid-template-columns:1fr 1fr;
      gap:16px;
    }
    @media (max-width:800px) {
      .aprov-card-body { grid-template-columns:1fr; }
    }

    /* Items block */
    .aprov-items-block {
      background:var(--bg); border:1px solid var(--border-subtle);
      border-radius:var(--r-md); overflow:hidden;
    }
    .aprov-items-hdr {
      padding:7px 12px; font-size:10.5px; font-weight:700;
      text-transform:uppercase; letter-spacing:.06em;
      color:var(--text-subtle); background:var(--border-subtle);
      display:flex; align-items:center; justify-content:space-between;
    }
    .aprov-item-row {
      display:flex; align-items:baseline; gap:10px;
      padding:8px 12px; border-bottom:1px solid var(--border-subtle);
      font-size:12.5px;
    }
    .aprov-item-row:last-child { border-bottom:none; }
    .aprov-item-qty {
      min-width:28px; font-weight:800; color:var(--brand);
      text-align:right; flex-shrink:0;
    }
    .aprov-item-desc { flex:1; color:var(--text); }
    .aprov-item-seg {
      font-size:10.5px; color:var(--text-muted);
      background:var(--surface); border:1px solid var(--border);
      border-radius:10px; padding:2px 8px; white-space:nowrap; flex-shrink:0;
    }

    /* Info block */
    .aprov-info-block {
      display:flex; flex-direction:column; gap:10px;
    }
    .aprov-info-row {
      display:flex; flex-direction:column; gap:2px;
    }
    .aprov-info-lbl {
      font-size:10.5px; font-weight:700; text-transform:uppercase;
      letter-spacing:.06em; color:var(--text-subtle);
    }
    .aprov-info-val {
      font-size:13px; color:var(--text); font-weight:500;
    }
    .aprov-justif {
      background:var(--brand-surface); border:1px solid var(--brand);
      border-radius:var(--r-md); padding:10px 13px;
      font-size:12.5px; color:var(--text);
      border-left:3px solid var(--brand);
    }
    .aprov-justif-lbl {
      font-size:10px; font-weight:700; text-transform:uppercase;
      color:var(--brand); margin-bottom:4px; letter-spacing:.06em;
    }

    /* Footer actions */
    .aprov-card-footer {
      padding:14px 22px;
      background:var(--bg);
      border-top:1px solid var(--border-subtle);
      display:flex; align-items:center; justify-content:flex-end; gap:10px;
    }
    .aprov-age {
      font-size:11.5px; color:var(--text-muted);
      margin-right:auto;
      display:flex; align-items:center; gap:5px;
    }
    .aprov-age i { font-size:10px; }

    /* ── Detail drawer ───────────────────────────────────────── */
    .aprov-backdrop {
      position:fixed; inset:0; background:rgba(0,0,0,.35);
      backdrop-filter:blur(2px); z-index:1000;
      display:flex; justify-content:flex-end;
      animation:fadeIn .2s ease;
    }
    .aprov-drawer {
      width:560px; max-width:95vw; height:100vh;
      background:var(--surface); display:flex; flex-direction:column;
      box-shadow:-8px 0 40px rgba(0,0,0,.15);
      animation:slideIn .22s ease; overflow:hidden;
    }
    @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

    .aprov-drw-hdr {
      padding:20px 24px 16px; border-bottom:1px solid var(--border);
      display:flex; align-items:flex-start; justify-content:space-between;
      flex-shrink:0; background:#fff;
    }
    .aprov-drw-title { font-size:17px; font-weight:800; color:var(--text); }
    .aprov-drw-sub   { font-size:12px; color:var(--text-muted); margin-top:3px; }
    .aprov-drw-close {
      width:32px; height:32px; border-radius:8px; border:1px solid var(--border);
      background:none; cursor:pointer; display:flex; align-items:center;
      justify-content:center; color:var(--text-muted); font-size:14px;
      transition:background .15s; flex-shrink:0;
    }
    .aprov-drw-close:hover { background:var(--bg); color:var(--accent); }

    .aprov-drw-body {
      flex:1; overflow-y:auto; padding:20px 24px;
      display:flex; flex-direction:column; gap:20px;
    }
    .aprov-drw-footer {
      padding:16px 24px; border-top:1px solid var(--border);
      display:flex; gap:10px; background:#fff; flex-shrink:0;
    }
    .aprov-drw-section-lbl {
      font-size:11px; font-weight:700; text-transform:uppercase;
      letter-spacing:.07em; color:var(--text-muted); margin-bottom:10px;
    }
    .aprov-drw-info-grid {
      display:grid; grid-template-columns:1fr 1fr 1fr;
      gap:1px; background:var(--border);
      border-radius:var(--r-md); overflow:hidden; border:1px solid var(--border);
    }
    .aprov-drw-info-cell {
      background:var(--bg); padding:10px 14px;
    }
    .aprov-drw-info-lbl { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-subtle); margin-bottom:3px; }
    .aprov-drw-info-val { font-size:13px; font-weight:600; color:var(--text); }

    .aprov-drw-items {
      background:var(--bg); border:1px solid var(--border);
      border-radius:var(--r-md); overflow:hidden;
    }
    .aprov-drw-item {
      display:flex; align-items:center; gap:10px;
      padding:10px 14px; border-bottom:1px solid var(--border-subtle);
      font-size:12.5px;
    }
    .aprov-drw-item:last-child { border-bottom:none; }
    .aprov-drw-item-num {
      width:24px; height:24px; border-radius:50%;
      background:var(--brand-surface); color:var(--brand);
      font-size:11px; font-weight:800;
      display:flex; align-items:center; justify-content:center;
      flex-shrink:0;
    }
    .aprov-drw-item-desc { flex:1; color:var(--text); font-weight:500; }
    .aprov-drw-item-qty  { color:var(--text-muted); white-space:nowrap; font-size:12px; }
    .aprov-drw-item-seg  { font-size:10.5px; color:var(--text-subtle); }
    </style>`;
  },

  /* ── init ──────────────────────────────────────────────────── */
  async init() {
    this._filtros = { busca: '', unidades: [] };
    const bEl = document.getElementById('aprov-busca');
    if (bEl) bEl.value = '';
    await this._loadPendencias();
    refreshNotifBadge();
  },

  /* ── Load pending requisitions ─────────────────────────────── */
  async _loadPendencias() {
    const lista  = document.getElementById('aprov-lista');
    const countEl = document.getElementById('aprov-count');
    if (!lista) return;

    lista.innerHTML = `<div style="padding:40px;text-align:center;"><div class="spinner"></div></div>`;

    try {
      const dados = await Api.get('/api/aprovacoes/pendentes');
      this._todos = dados.pedidos || [];

      if (countEl) {
        countEl.textContent = `${this._todos.length} pendente${this._todos.length !== 1 ? 's' : ''}`;
        countEl.style.display = this._todos.length > 0 ? '' : 'none';
      }

      // Populate unidade multi-select
      const unidades = [...new Set(this._todos.map(p => p.unidade).filter(Boolean))].sort();
      const wrap = document.getElementById('aprov-unidade-wrap');
      if (wrap) {
        wrap.innerHTML = msHtml('aprov-ms-unidade', unidades, this._filtros.unidades, 'Unidade',
          "Pages.aprovacoes._toggleFilter('unidades',");
      }

      this._renderLista();

    } catch {
      lista.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-circle-xmark"></i></div>
          <p class="empty-title">Erro ao carregar</p>
          <p class="empty-desc">Verifique se a API está online.</p>
        </div>`;
    }
  },

  /* ── Render filtered list ──────────────────────────────────── */
  _renderLista() {
    const lista = document.getElementById('aprov-lista');
    if (!lista) return;

    const { busca, unidades } = this._filtros;
    const b = busca.toLowerCase();

    const itens = this._todos.filter(p => {
      if (b && !`#${p.id_pedido} ${p.solicitante || ''} ${p.comprador || ''} ${p.unidade || ''}`.toLowerCase().includes(b)) return false;
      if (unidades.length && !unidades.includes(p.unidade)) return false;
      return true;
    });

    if (this._todos.length === 0) {
      lista.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon" style="background:var(--success-surface);color:var(--success-dark);">
            <i class="fa-solid fa-circle-check"></i>
          </div>
          <p class="empty-title">Tudo em dia!</p>
          <p class="empty-desc">Não há requisições aguardando sua aprovação no momento.</p>
        </div>`;
      return;
    }

    if (itens.length === 0) {
      lista.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon"><i class="fa-solid fa-filter"></i></div>
          <p class="empty-title">Nenhum resultado</p>
          <p class="empty-desc">Nenhuma requisição corresponde aos filtros aplicados.</p>
        </div>`;
      return;
    }

    lista.innerHTML = itens.map(p => this._htmlCard(p)).join('');

    lista.onclick = e => {
      const btn = e.target.closest('[data-aprov-action]');
      if (!btn) return;
      const id     = parseInt(btn.dataset.id);
      const unid   = btn.dataset.unidade || '';
      const action = btn.dataset.aprovAction;
      if (action === 'detalhe')  this._openDetalhe(id);
      if (action === 'aprovar')  this.aprovar(id, unid);
      if (action === 'reprovar') this.reprovar(id);
    };
  },

  /* ── Filter helpers ────────────────────────────────────────── */
  _toggleFilter(key, val, checked) {
    const arr = this._filtros[key];
    if (checked) { if (!arr.includes(val)) arr.push(val); }
    else { const i = arr.indexOf(val); if (i > -1) arr.splice(i, 1); }

    const n = arr.length;
    const ph = key === 'unidades' ? 'Unidade' : key;
    const lbl = n === 0 ? ph : n === 1 ? arr[0] : `${n} selecionados`;
    const msId = key === 'unidades' ? 'aprov-ms-unidade' : `aprov-ms-${key}`;
    const wrap = document.getElementById(msId);
    if (wrap) {
      const lblEl = wrap.querySelector('.ms-lbl');
      if (lblEl) lblEl.textContent = lbl;
      wrap.classList.toggle('ms-has-val', n > 0);
    }

    this._atualizarLimparBtn();
    this._renderLista();
  },

  _onBusca(val) {
    this._filtros.busca = val.trim();
    this._atualizarLimparBtn();
    this._renderLista();
  },

  _limparFiltros() {
    this._filtros = { busca: '', unidades: [] };
    const bEl = document.getElementById('aprov-busca');
    if (bEl) bEl.value = '';
    const unidades = [...new Set(this._todos.map(p => p.unidade).filter(Boolean))].sort();
    const wrap = document.getElementById('aprov-unidade-wrap');
    if (wrap) {
      wrap.innerHTML = msHtml('aprov-ms-unidade', unidades, [], 'Unidade',
        "Pages.aprovacoes._toggleFilter('unidades',");
    }
    this._atualizarLimparBtn();
    this._renderLista();
  },

  _atualizarLimparBtn() {
    const btn = document.getElementById('aprov-limpar-btn');
    if (btn) btn.style.display = (this._filtros.busca || this._filtros.unidades.length) ? '' : 'none';
  },

  /* ── Build card HTML ───────────────────────────────────────── */
  _htmlCard(p) {
    // Age badge
    const ageBadge = p.dias_aberto > 3
      ? `<span style="color:var(--accent);font-weight:700;">
           <i class="fa-solid fa-triangle-exclamation"></i> ${p.dias_aberto} dias aguardando
         </span>`
      : `<span><i class="fa-solid fa-clock"></i> ${p.dias_aberto || 0} dia(s) aguardando</span>`;

    return `
      <div class="aprov-card" id="pedido-row-${p.id_pedido}">
        <div class="aprov-card-header">
          <div>
            <div class="aprov-card-title">
              <span class="aprov-card-id">#${p.id_pedido}</span>
              ${StatusBadge.get('Aguardando Aprovação do Gestor')}
            </div>
            <div class="aprov-card-meta" style="margin-top:8px;">
              <span><i class="fa-solid fa-building"></i> ${p.unidade || '—'}</span>
              <span><i class="fa-solid fa-user"></i> ${p.solicitante || p.comprador || '—'}</span>
              <span><i class="fa-solid fa-calendar-days"></i> ${Fmt.date(p.data)}</span>
              ${p.data_necessidade ? `<span style="color:var(--accent);font-weight:600;"><i class="fa-solid fa-flag"></i> Necessário: ${p.data_necessidade}</span>` : ''}
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            <span class="aprov-age">${ageBadge}</span>
          </div>
        </div>

        <div class="aprov-card-footer">
          <button class="btn btn-outline btn-sm"
                  data-aprov-action="detalhe" data-id="${p.id_pedido}">
            <i class="fa-solid fa-magnifying-glass"></i> Ver Detalhes
          </button>
          <button class="btn btn-danger btn-sm"
                  data-aprov-action="reprovar" data-id="${p.id_pedido}">
            <i class="fa-solid fa-xmark"></i> Reprovar
          </button>
          <button class="btn btn-success btn-sm"
                  data-aprov-action="aprovar" data-id="${p.id_pedido}"
                  data-unidade="${p.unidade || ''}">
            <i class="fa-solid fa-check"></i> Aprovar
          </button>
        </div>
      </div>`;
  },

  /* ── Detail drawer ─────────────────────────────────────────── */
  async _openDetalhe(id) {
    // Show loading drawer
    this._buildDetalheDrawer({ id, _loading: true });

    let req;
    try {
      req = await Api.get(`/api/requisicoes/${id}`);
    } catch {
      Toast.error('Erro ao carregar detalhes');
      this._closeDetalhe();
      return;
    }
    this._buildDetalheDrawer(req);
  },

  _buildDetalheDrawer(req) {
    document.getElementById('aprov-detail-root')?.remove();

    const isLoading = req._loading;

    const itensHtml = isLoading
      ? '<div style="padding:16px;text-align:center;"><div class="spinner"></div></div>'
      : (req.itens || []).map((it, i) => `
          <div class="aprov-drw-item">
            <div class="aprov-drw-item-num">${i + 1}</div>
            <div style="flex:1;">
              <div class="aprov-drw-item-desc">${it.descricao}</div>
              ${it.segmento ? `<div class="aprov-drw-item-seg">${it.segmento}</div>` : ''}
            </div>
            <div class="aprov-drw-item-qty">Qtd: <strong>${it.quantidade}</strong></div>
          </div>`).join('') || '<div style="padding:12px;font-size:12px;color:var(--text-muted);">Sem itens</div>';

    const root = document.createElement('div');
    root.id = 'aprov-detail-root';
    root.innerHTML = `
      <div class="aprov-backdrop" id="aprov-detail-backdrop">
        <div class="aprov-drawer">

          <div class="aprov-drw-hdr">
            <div>
              <div class="aprov-drw-title">Detalhes da Requisição #${req.id}</div>
              <div class="aprov-drw-sub">
                ${isLoading ? 'Carregando...' : `${req.unidade || ''} &bull; ${req.comprador || ''} &bull; ${req.data || ''}`}
              </div>
            </div>
            <button class="aprov-drw-close" id="aprov-drw-close-btn">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div class="aprov-drw-body">
            ${isLoading ? '<div style="text-align:center;padding:60px;"><div class="spinner"></div></div>' : `

            <!-- Info grid -->
            <div>
              <div class="aprov-drw-section-lbl">Dados da Requisição</div>
              <div class="aprov-drw-info-grid">
                <div class="aprov-drw-info-cell">
                  <div class="aprov-drw-info-lbl">Unidade</div>
                  <div class="aprov-drw-info-val">${req.unidade || '—'}</div>
                </div>
                <div class="aprov-drw-info-cell">
                  <div class="aprov-drw-info-lbl">Solicitante</div>
                  <div class="aprov-drw-info-val">${req.comprador || '—'}</div>
                </div>
                <div class="aprov-drw-info-cell">
                  <div class="aprov-drw-info-lbl">Data</div>
                  <div class="aprov-drw-info-val">${req.data || '—'}</div>
                </div>
              </div>
            </div>

            ${req.justificativa ? `
              <div class="aprov-justif">
                <div class="aprov-justif-lbl"><i class="fa-solid fa-comment-dots"></i> Justificativa do Solicitante</div>
                ${req.justificativa}
              </div>` : ''}

            ${req.observacoes ? `
              <div class="aprov-justif" style="border-left-color:var(--text-muted);background:var(--bg);">
                <div class="aprov-justif-lbl" style="color:var(--text-muted);"><i class="fa-solid fa-note-sticky"></i> Observações</div>
                ${req.observacoes}
              </div>` : ''}

            <!-- Items -->
            <div>
              <div class="aprov-drw-section-lbl">
                Itens Solicitados
                <span style="margin-left:6px;font-weight:400;color:var(--text-muted);text-transform:none;letter-spacing:0;">
                  (${(req.itens || []).length} item(s))
                </span>
              </div>
              <div class="aprov-drw-items">
                ${itensHtml}
              </div>
            </div>

            <!-- Status & History -->
            <div>
              <div class="aprov-drw-section-lbl">Status Atual</div>
              <div style="display:flex;align-items:center;gap:10px;">
                ${StatusBadge.get(req.status || 'Aguardando Aprovação do Gestor')}
                ${req.fornecedor ? `<span style="font-size:12.5px;color:var(--text-muted);">Fornecedor: <strong>${req.fornecedor}</strong></span>` : ''}
                ${req.valor_fechado ? `<span style="font-size:12.5px;font-weight:700;color:var(--text);">${Fmt.currency(req.valor_fechado)}</span>` : ''}
              </div>
            </div>
            `}
          </div>

          <div class="aprov-drw-footer">
            <button class="btn btn-outline" style="flex:1;" id="aprov-drw-cancel">Fechar</button>
            <button class="btn btn-danger" style="flex:1;"
                    id="aprov-drw-reprovar" data-id="${req.id}" ${isLoading ? 'disabled' : ''}>
              <i class="fa-solid fa-xmark"></i> Reprovar
            </button>
            <button class="btn btn-success" style="flex:1.5;"
                    id="aprov-drw-aprovar" data-id="${req.id}"
                    data-unidade="${req.unidade || ''}" ${isLoading ? 'disabled' : ''}>
              <i class="fa-solid fa-check"></i> Aprovar
            </button>
          </div>

        </div>
      </div>`;

    document.body.appendChild(root);

    const close = () => this._closeDetalhe();
    document.getElementById('aprov-drw-close-btn')?.addEventListener('click', close);
    document.getElementById('aprov-drw-cancel')?.addEventListener('click', close);
    document.getElementById('aprov-detail-backdrop')?.addEventListener('click', e => {
      if (e.target === document.getElementById('aprov-detail-backdrop')) close();
    });

    document.getElementById('aprov-drw-reprovar')?.addEventListener('click', () => {
      close();
      this.reprovar(req.id);
    });
    document.getElementById('aprov-drw-aprovar')?.addEventListener('click', () => {
      close();
      this.aprovar(req.id, req.unidade);
    });
  },

  _closeDetalhe() {
    document.getElementById('aprov-detail-root')?.remove();
  },

  /* ── Aprovar ───────────────────────────────────────────────── */
  async aprovar(id, unidade) {
    const confirmed = await Modal.confirm({
      icon: 'success',
      title: 'Aprovar Requisição',
      subtitle: `Requisição #${id} — ${unidade || ''}`,
      body: 'A requisição será <strong>aprovada</strong> e encaminhada para o processo de cotação. Confirma?',
      confirmText: 'Aprovar',
      confirmClass: 'btn-success'
    });
    if (!confirmed) return;

    const row = document.getElementById(`pedido-row-${id}`);
    if (row) { row.style.opacity = '.5'; row.style.pointerEvents = 'none'; }

    try {
      await Api.post(`/api/aprovacoes/${id}`, { acao: 'aprovar', justificativa: 'Aprovado via Painel de Requisições' });
      Toast.success('Requisição aprovada!', `Pedido #${id} aprovado. Disponível para cotação.`);
      setTimeout(() => this.init(), 600);
      refreshNotifBadge();
    } catch {
      Toast.error('Erro ao aprovar', 'Tente novamente.');
      if (row) { row.style.opacity = '1'; row.style.pointerEvents = ''; }
    }
  },

  /* ── Reprovar ──────────────────────────────────────────────── */
  async reprovar(id) {
    const motivo = await Modal.prompt({
      icon: 'danger',
      title: 'Reprovar Requisição',
      subtitle: `Requisição #${id}`,
      label: 'Motivo da Reprovação',
      placeholder: 'Descreva o motivo para reprovar esta requisição...',
      required: true
    });
    if (!motivo) return;

    const row = document.getElementById(`pedido-row-${id}`);
    if (row) { row.style.opacity = '.5'; row.style.pointerEvents = 'none'; }

    try {
      await Api.post(`/api/aprovacoes/${id}`, { acao: 'reprovar', justificativa: motivo });
      Toast.warning('Requisição reprovada.', `Pedido #${id} reprovado. Solicitante será notificado.`);
      setTimeout(() => this.init(), 600);
      refreshNotifBadge();
    } catch {
      Toast.error('Erro ao reprovar', 'Tente novamente.');
      if (row) { row.style.opacity = '1'; row.style.pointerEvents = ''; }
    }
  }
};
