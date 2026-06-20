/* ── SOURCING PAGE ────────────────────────────────────────── */
window.Pages = window.Pages || {};

window.Pages.sourcing = {
  title: 'Fornecedores & Cotação',
  subtitle: 'Gerenciamento de fornecedores, cotações e emissão de PO',
  icon: 'fa-magnifying-glass-chart',
  _pedidoSelecionado: null,
  _pedidoInfo: null,
  _segmentoAtual: null,
  _segmentos: [],
  _todosPedidos: [],
  _filtroSourcing: { busca: '', statuses: [], compradores: [] },
  _ultimaVerificacaoEstoque: null,

  render() {
    return `
    <div class="page-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Fornecedores & Cotação</h1>
          <p class="page-subtitle">Gerencie fornecedores, compare cotações e emita ordens de compra</p>
        </div>
      </div>

      <!-- Step indicator -->
      <div class="step-bar mb-4" id="sourcing-steps">
        <div class="step-item active" id="step-1">
          <div class="step-circle"><i class="fa-solid fa-list-check"></i></div>
          <div class="step-label">Selecionar Pedido</div>
        </div>
        <div class="step-item" id="step-2">
          <div class="step-circle"><i class="fa-solid fa-truck"></i></div>
          <div class="step-label">Fornecedores</div>
        </div>
        <div class="step-item" id="step-3">
          <div class="step-circle"><i class="fa-solid fa-trophy"></i></div>
          <div class="step-label">Comparativo & PO</div>
        </div>
      </div>

      <!-- Step 1: Pedidos aprovados -->
      <div class="card mb-4">
        <div class="section-header">
          <span class="section-title">
            <i class="fa-solid fa-list-check"></i>
            Pedidos Aprovados para Cotação
          </span>
          <button class="btn btn-ghost btn-sm" onclick="Pages.sourcing.init()">
            <i class="fa-solid fa-rotate-right"></i>
          </button>
        </div>
        <div id="sourcing-pedidos">
          ${Skeleton.list(3)}
        </div>
      </div>

      <!-- Step 2+3: Workspace (visível após selecionar pedido) -->
      <div id="sourcing-workspace" style="display:none;">

        <!-- Detalhe do pedido selecionado -->
        <div id="sourcing-req-detail" class="card mb-4" style="background:var(--brand-surface);border:1.5px solid var(--brand-light);"></div>

        <!-- Verificação de estoque (preenchido via JS após selecionar pedido) -->
        <div id="sourcing-estoque-check"></div>

        <div class="grid-2">
          <!-- Fornecedores -->
          <div class="card">
            <div class="section-header" style="margin-bottom:16px;">
              <span class="section-title">
                <i class="fa-solid fa-truck"></i>
                Fornecedores Homologados
              </span>
              <span id="sourcing-total-forn" class="badge badge-brand" style="display:none;"></span>
            </div>
            <div class="form-group mb-3">
              <label class="form-label">Buscar Fornecedores</label>
              <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
                <div style="position:relative;flex:1;min-width:150px;">
                  <i class="fa-solid fa-building" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-subtle);font-size:11px;pointer-events:none;"></i>
                  <input type="text" class="form-control form-control-sm" id="sourcing-text-input"
                         style="padding-left:28px;" placeholder="Razão social ou CNPJ..."
                         onkeydown="if(event.key==='Enter')Pages.sourcing.buscarFornecedores()">
                </div>
                <select class="form-control form-control-sm" id="sourcing-seg-input" style="flex:1;min-width:140px;">
                  <option value="">Todos os segmentos</option>
                </select>
                <button class="btn btn-primary btn-sm" onclick="Pages.sourcing.buscarFornecedores()"
                        style="white-space:nowrap;">
                  <i class="fa-solid fa-magnifying-glass"></i> Buscar
                </button>
              </div>
            </div>
            <div id="sourcing-fornecedores">
              <div class="empty-state" style="padding:30px 0;">
                <div class="empty-icon"><i class="fa-solid fa-search"></i></div>
                <p class="empty-title">Pesquise fornecedores</p>
                <p class="empty-desc">Selecione um segmento para ver os fornecedores homologados.</p>
              </div>
            </div>
          </div>

          <!-- Mapa Comparativo -->
          <div class="card">
            <div class="section-header" style="margin-bottom:16px;">
              <span class="section-title">
                <i class="fa-solid fa-ranking-star"></i>
                Mapa Comparativo de Cotações
              </span>
              <div style="display:none;" id="mapa-actions">
                <button class="btn btn-ghost btn-sm" id="btn-refresh-mapa"
                        onclick="Pages.sourcing.carregarMapa(Pages.sourcing._pedidoSelecionado)">
                  <i class="fa-solid fa-rotate-right"></i> Atualizar
                </button>
                <button class="btn btn-outline btn-sm" id="btn-mapa-pdf" style="color:#dc2626;border-color:#dc2626;"
                        onclick="MapaCotacao.gerar(Pages.sourcing._pedidoSelecionado)">
                  <i class="fa-solid fa-file-pdf"></i> Mapa de Cotação
                </button>
              </div>
            </div>
            <div id="sourcing-mapa">
              <div class="empty-state" style="padding:30px 0;">
                <div class="empty-icon"><i class="fa-solid fa-chart-bar"></i></div>
                <p class="empty-title">Aguardando propostas</p>
                <p class="empty-desc">Convide fornecedores e aguarde as propostas para comparar.</p>
              </div>
            </div>
            <div id="sourcing-historico" style="margin-top:20px;display:none;">
              <div class="divider"></div>
              <div class="text-xs text-muted font-bold mb-2" style="text-transform:uppercase;letter-spacing:0.5px;">
                <i class="fa-solid fa-clock-rotate-left"></i> Histórico de Preços
              </div>
              <div id="sourcing-hist-lista"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <style>
    .sou-filter-bar { display:flex; align-items:center; gap:10px; margin-bottom:14px; flex-wrap:wrap; }
    .sou-filter-wrap { position:relative; flex:1; min-width:200px; }
    .sou-filter-wrap i { position:absolute; left:11px; top:50%; transform:translateY(-50%); color:var(--text-subtle); font-size:12px; pointer-events:none; }
    .sou-filter-input { width:100%; height:36px; padding:0 12px 0 34px; background:var(--bg); border:1px solid var(--border); border-radius:var(--r-md); font-size:13px; font-family:var(--font); color:var(--text); outline:none; box-sizing:border-box; }
    .sou-filter-input:focus { border-color:var(--brand); }
    .sou-filter-sel { height:36px; padding:0 10px; min-width:160px; background:var(--bg); border:1px solid var(--border); border-radius:var(--r-md); font-size:13px; font-family:var(--font); color:var(--text); outline:none; }
    .sou-filter-count { font-size:12px; font-weight:700; color:var(--text-muted); white-space:nowrap; }
    .sou-pedidos-table { width:100%; border-collapse:collapse; }
    .sou-pedidos-table thead th { padding:9px 12px; font-size:10.5px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-muted); background:var(--bg); border-bottom:1px solid var(--border); text-align:left; white-space:nowrap; }
    .sou-pedidos-table tbody tr { border-bottom:1px solid var(--border-subtle); transition:background .12s; }
    .sou-pedidos-table tbody tr:last-child { border-bottom:none; }
    .sou-pedido-row { cursor:pointer; }
    .sou-pedido-row:hover { background:var(--brand-surface); }
    .sou-pedido-row.selected { background:var(--brand-surface); box-shadow:inset 3px 0 0 var(--brand); }
    .sou-pedidos-table td { padding:11px 12px; font-size:13px; color:var(--text); vertical-align:middle; }
    .sou-row-id { font-weight:700; font-size:12.5px; color:var(--brand); }
    .sou-badge { display:inline-flex; align-items:center; gap:4px; border-radius:8px; padding:2px 8px; font-size:11px; font-weight:700; white-space:nowrap; }
    .sou-badge-aguardando { background:#fef3c7; color:#b45309; }
    .sou-badge-retorno    { background:#fee2e2; color:#dc2626; }
    .sou-badge-cotacao    { background:#ede9fe; color:#6d28d9; }
    .sou-badge-proposta   { background:#d1fae5; color:#065f46; margin-left:5px; animation: sou-pulse 2s ease-in-out infinite; }
    .sou-badge-gestor     { background:#d1fae5; color:#065f46; }
    .row-gestor-aprov     { background:#f0fdf4 !important; box-shadow:inset 3px 0 0 #059669; }
    @keyframes sou-pulse   { 0%,100%{opacity:1} 50%{opacity:.65} }
    </style>`;
  },

  async init() {
    this._pedidoSelecionado = null;
    this._pedidoInfo = null;
    this._todosPedidos = [];
    this._filtroSourcing = { busca: '', statuses: [], compradores: [] };
    // Carrega segmentos em background
    Api.get('/api/sourcing/segmentos').then(data => {
      this._segmentos = data || [];
      const sel = document.getElementById('sourcing-seg-input');
      if (sel && this._segmentos.length) {
        sel.innerHTML = '<option value="">Todos os segmentos</option>' +
          this._segmentos.map(s => `<option value="${s}">${s}</option>`).join('');
      }
    }).catch(() => {});
    try {
      const pedidos = await Api.get('/api/sourcing/pedidos-aprovados');
      const container = document.getElementById('sourcing-pedidos');

      if (!pedidos || pedidos.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding:30px 0;">
            <div class="empty-icon" style="background:var(--success-surface);color:var(--success-dark);">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <p class="empty-title">Nenhum pedido para cotar</p>
            <p class="empty-desc">Todos os pedidos aprovados já foram processados.</p>
          </div>`;
        return;
      }

      this._todosPedidos = pedidos;
      this._renderPedidosList();
    } catch {
      Toast.error('Erro ao carregar pedidos', 'Verifique a API.');
    }
  },

  _renderPedidosList() {
    const container = document.getElementById('sourcing-pedidos');
    if (!container) return;
    const { busca, statuses, compradores } = this._filtroSourcing;
    const b = busca.toLowerCase();
    const filtered = this._todosPedidos.filter(p => {
      if (statuses.length) {
        const displayStatus = p.status === 'Aprovado Gestor' ? 'Aprovado Gestor'
          : (p.propostas_recebidas || 0) > 0 ? 'Proposta Recebida'
          : (p.convites_enviados || 0) > 0 ? 'Aguardando Retorno'
          : 'Aguardando Cotação';
        if (!statuses.includes(displayStatus)) return false;
      }
      if (compradores.length && !compradores.includes(p.comprador)) return false;
      if (b && !`#${p.id} ${p.solicitante || ''} ${p.unidade || ''} ${p.comprador || ''}`.toLowerCase().includes(b)) return false;
      return true;
    });

    const compradoresOpts = [...new Set(this._todosPedidos.map(p => p.comprador).filter(Boolean))].sort();

    const filterBar = `
      <div class="sou-filter-bar">
        <div class="sou-filter-wrap">
          <i class="fa-solid fa-magnifying-glass"></i>
          <input class="sou-filter-input" type="text"
                 placeholder="Buscar por ID, solicitante, unidade…"
                 value="${busca.replace(/"/g, '&quot;')}" id="sou-busca"
                 oninput="Pages.sourcing._onSouBusca(this.value)">
        </div>
        ${msHtml('sou-ms-stat', ['Aguardando Cotação','Aguardando Retorno','Proposta Recebida','Aprovado Gestor'], statuses, 'Status', "Pages.sourcing._toggleSouStatus(")}
        ${compradoresOpts.length ? msHtml('sou-ms-comp', compradoresOpts, compradores, 'Responsável', "Pages.sourcing._toggleSouComprador(") : ''}
        <span class="sou-filter-count">${filtered.length} pedido${filtered.length !== 1 ? 's' : ''}</span>
      </div>`;

    if (filtered.length === 0) {
      container.innerHTML = filterBar + `
        <div class="empty-state" style="padding:24px 0;">
          <div class="empty-icon"><i class="fa-solid fa-magnifying-glass"></i></div>
          <p class="empty-title">Nenhum pedido encontrado</p>
          <p class="empty-desc">Ajuste os filtros para encontrar pedidos.</p>
        </div>`;
      return;
    }

    container.innerHTML = filterBar + `
      <div style="overflow-x:auto;">
        <table class="sou-pedidos-table">
          <thead>
            <tr>
              <th>ID</th><th>Solicitante</th><th>Unidade</th><th>Data</th><th>Status</th><th></th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(p => {
              const badge = (() => {
                if (p.status === 'Aprovado Gestor')
                  return `<span class="sou-badge sou-badge-gestor"><i class="fa-solid fa-thumbs-up"></i> Aprovado Gestor</span>`;
                if ((p.propostas_recebidas || 0) > 0) {
                  const n = p.propostas_recebidas;
                  return `<span class="sou-badge sou-badge-cotacao"><i class="fa-solid fa-check-circle"></i> Em Cotação</span>` +
                         `<span class="sou-badge sou-badge-proposta"><i class="fa-solid fa-bell"></i> ${n} proposta${n > 1 ? 's' : ''}</span>`;
                }
                if ((p.convites_enviados || 0) > 0) {
                  return `<span class="sou-badge sou-badge-retorno"><i class="fa-solid fa-clock"></i> Aguardando Retorno</span>`;
                }
                return `<span class="sou-badge sou-badge-aguardando"><i class="fa-solid fa-hourglass-half"></i> Aguardando Cotação</span>`;
              })();
              const isSel = this._pedidoSelecionado === p.id;
              return `
                <tr class="sou-pedido-row${isSel ? ' selected' : ''}" id="pedido-row-${p.id}"
                    onclick="Pages.sourcing.selecionarPedido(${p.id})">
                  <td><span class="sou-row-id">#${p.id}</span></td>
                  <td style="font-size:13px;">${p.solicitante || '—'}</td>
                  <td><span class="badge badge-gray">${p.unidade || '—'}</span></td>
                  <td style="color:var(--text-muted);font-size:12.5px;white-space:nowrap;">${Fmt.date(p.data)}</td>
                  <td>${badge}</td>
                  <td style="text-align:right;">
                    <button class="btn btn-primary btn-sm" onclick="event.stopPropagation();Pages.sourcing.selecionarPedido(${p.id})">
                      <i class="fa-solid fa-arrow-right"></i> Selecionar
                    </button>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  },

  _onSouBusca(val) {
    this._filtroSourcing.busca = val;
    this._renderPedidosList();
  },

  _toggleSouStatus(val, checked) {
    const arr = this._filtroSourcing.statuses;
    this._filtroSourcing.statuses = checked ? [...arr, val] : arr.filter(v => v !== val);
    this._renderPedidosList();
  },

  _toggleSouComprador(val, checked) {
    const arr = this._filtroSourcing.compradores;
    this._filtroSourcing.compradores = checked ? [...arr, val] : arr.filter(v => v !== val);
    this._renderPedidosList();
  },

  async selecionarPedido(id) {
    this._pedidoSelecionado = id;
    document.querySelectorAll('.sou-pedido-row').forEach(c => c.classList.remove('selected'));
    document.getElementById(`pedido-row-${id}`)?.classList.add('selected');

    const ws = document.getElementById('sourcing-workspace');
    ws.style.display = 'grid';
    ws.style.gap = '20px';

    document.getElementById('step-1').classList.add('done');
    document.getElementById('step-2').classList.add('active');

    // Popula segmentos no select
    const segSel = document.getElementById('sourcing-seg-input');
    if (segSel && this._segmentos.length) {
      segSel.innerHTML = '<option value="">Todos os segmentos</option>' +
        this._segmentos.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    // Carrega detalhes da requisição
    try {
      const req = await Api.get(`/api/sourcing/requisicao/${id}`);
      this._pedidoInfo = req;
      this._renderReqDetail(req);
      this._verificarEstoqueAsync(id);
    } catch {
      document.getElementById('sourcing-req-detail').innerHTML = `
        <div style="padding:16px;">
          <span class="badge badge-brand" style="margin-bottom:8px;">Pedido #${id}</span>
          <p style="font-size:13px;color:var(--text-muted);">Detalhes não disponíveis.</p>
        </div>`;
    }

    this.carregarMapa(id);

    // Scroll até o workspace
    ws.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  _renderReqDetail(req) {
    const el = document.getElementById('sourcing-req-detail');
    if (!el) return;
    el.innerHTML = `
      <div style="padding:16px 20px;">
        <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:200px;">
            <div style="width:40px;height:40px;background:var(--brand);border-radius:10px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fa-solid fa-file-invoice" style="color:#fff;font-size:16px;"></i>
            </div>
            <div>
              <div style="font-size:15px;font-weight:800;color:var(--brand);">Pedido #${req.id}</div>
              <div style="font-size:12px;color:var(--text-muted);">${req.unidade} · ${req.comprador} · ${Fmt.date(req.data)}</div>
            </div>
          </div>
          ${req.justificativa ? `
          <div style="flex:2;min-width:200px;background:rgba(255,255,255,.6);border-radius:8px;padding:10px 14px;border-left:3px solid var(--brand);">
            <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--brand);margin-bottom:3px;">Justificativa</div>
            <div style="font-size:13px;color:var(--text);">${req.justificativa}</div>
          </div>` : ''}
        </div>
        ${req.itens?.length ? `
        <div style="margin-top:12px;border-top:1px solid var(--brand-light);padding-top:12px;">
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--brand);margin-bottom:8px;">
            <i class="fa-solid fa-boxes-stacked"></i> Itens solicitados (${req.itens.length})
          </div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;">
            ${req.itens.map(i => `
              <span style="background:rgba(255,255,255,.7);border:1px solid var(--brand-light);border-radius:6px;padding:4px 10px;font-size:12px;font-weight:600;color:var(--text);">
                <span style="color:var(--brand);font-weight:800;">${i.quantidade}×</span> ${i.descricao}
                ${i.segmento ? `<span style="color:var(--text-muted);font-weight:400;"> · ${i.segmento}</span>` : ''}
              </span>`).join('')}
          </div>
        </div>` : ''}
      </div>`;
  },

  /* ── Verificação de Estoque ──────────────────────────────── */

  async _verificarEstoqueAsync(id) {
    const el = document.getElementById('sourcing-estoque-check');
    if (el) {
      el.innerHTML = `
        <div style="padding:10px 16px;background:#f8fafc;border:1px solid #e2e8f0;
                    border-radius:10px;display:flex;align-items:center;gap:8px;margin-bottom:4px;">
          <i class="fa-solid fa-circle-notch fa-spin" style="color:#94a3b8;font-size:12px;"></i>
          <span style="font-size:12px;color:#94a3b8;">Verificando disponibilidade em estoque...</span>
        </div>`;
    }
    try {
      const v = await Api.get(`/api/sourcing/verificar-estoque/${id}`);
      this._renderBlocoEstoque(id, v);
    } catch {
      if (el) el.innerHTML = '';
    }
  },

  _renderBlocoEstoque(idReq, v) {
    const el = document.getElementById('sourcing-estoque-check');
    if (!el) return;
    this._ultimaVerificacaoEstoque = v;

    // Nenhum item em estoque — mensagem compacta
    if (!v.temEstoque) {
      el.innerHTML = `
        <div style="padding:10px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;
                    display:flex;align-items:center;gap:10px;margin-bottom:4px;">
          <i class="fa-solid fa-warehouse" style="color:#94a3b8;font-size:14px;"></i>
          <span style="font-size:13px;color:#64748b;">
            Nenhum item encontrado em estoque — prossiga com a cotação.
          </span>
        </div>`;
      return;
    }

    // Todos os itens suficientes — banner verde com ação
    if (v.todosSuficientes) {
      el.innerHTML = `
        <div style="background:#f0fdf4;border:1.5px solid #6ee7b7;border-radius:14px;
                    padding:20px 24px;margin-bottom:4px;">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px;">
            <div style="width:42px;height:42px;background:#059669;border-radius:10px;
                        display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fa-solid fa-boxes-stacked" style="color:#fff;font-size:18px;"></i>
            </div>
            <div style="flex:1;">
              <div style="font-size:15px;font-weight:800;color:#065f46;">
                Estoque Disponível — Compra Desnecessária
              </div>
              <div style="font-size:12.5px;color:#047857;margin-top:3px;">
                Todos os itens desta requisição estão disponíveis em estoque
              </div>
            </div>
            <button onclick="Pages.sourcing._ignorarEstoque()"
                    style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;padding:4px;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:18px;">
            ${v.itens.map(i => `
              <div style="display:flex;align-items:center;gap:10px;background:#fff;
                          border:1px solid #a7f3d0;border-radius:9px;padding:10px 14px;flex-wrap:wrap;">
                <i class="fa-solid fa-circle-check" style="color:#059669;font-size:14px;flex-shrink:0;"></i>
                <span style="font-size:13px;font-weight:600;color:#1e293b;flex:1;min-width:120px;">${i.descricao}</span>
                <span style="font-size:12px;color:#64748b;">
                  Pedido: <strong>${i.quantidade_pedida} ${i.unidade}</strong>
                </span>
                <span style="color:#cbd5e1;font-size:11px;">·</span>
                <span style="font-size:12px;font-weight:700;color:#059669;">
                  Em estoque: ${i.saldo} ${i.unidade}
                </span>
              </div>`).join('')}
          </div>

          <div style="display:flex;gap:12px;flex-wrap:wrap;">
            <button onclick="Pages.sourcing.usarEstoque(${idReq})"
                    style="height:42px;padding:0 22px;border-radius:9px;background:#059669;color:#fff;
                           border:none;font-size:14px;font-weight:700;cursor:pointer;
                           display:flex;align-items:center;gap:8px;transition:background .15s;"
                    onmouseover="this.style.background='#047857'" onmouseout="this.style.background='#059669'">
              <i class="fa-solid fa-boxes-stacked"></i> Usar Estoque e Concluir Requisição
            </button>
            <button onclick="Pages.sourcing._ignorarEstoque()"
                    style="height:42px;padding:0 18px;border-radius:9px;background:#fff;
                           color:#64748b;border:1px solid #e2e8f0;font-size:14px;cursor:pointer;">
              Prosseguir com Cotação
            </button>
          </div>
        </div>`;
      return;
    }

    // Estoque parcial — aviso amarelo
    el.innerHTML = `
      <div style="background:#fffbeb;border:1.5px solid #fcd34d;border-radius:14px;
                  padding:18px 22px;margin-bottom:4px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
          <div style="width:38px;height:38px;background:#f59e0b;border-radius:9px;
                      display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid fa-triangle-exclamation" style="color:#fff;font-size:15px;"></i>
          </div>
          <div style="flex:1;">
            <div style="font-size:14px;font-weight:800;color:#92400e;">Estoque Parcialmente Disponível</div>
            <div style="font-size:12px;color:#b45309;margin-top:2px;">
              Alguns itens disponíveis, mas insuficientes para atender toda a requisição
            </div>
          </div>
          <button onclick="Pages.sourcing._ignorarEstoque()"
                  style="background:none;border:none;color:#94a3b8;cursor:pointer;font-size:18px;padding:4px;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:14px;">
          ${v.itens.map(i => {
            const ok = i.status === 'OK';
            const ins = i.status === 'INSUFICIENTE';
            const icon  = ok ? 'fa-circle-check'       : ins ? 'fa-exclamation-triangle'  : 'fa-times-circle';
            const cor   = ok ? '#059669'               : ins ? '#d97706'                  : '#dc2626';
            const label = ok ? `Em estoque: ${i.saldo} ${i.unidade}`
                        : ins ? `Estoque: ${i.saldo} ${i.unidade} — faltam ${i.quantidade_pedida - i.saldo}`
                        : 'Sem estoque cadastrado';
            return `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;
                          background:#fff;border-radius:8px;flex-wrap:wrap;">
                <i class="fa-solid ${icon}" style="color:${cor};font-size:13px;flex-shrink:0;"></i>
                <span style="font-size:12.5px;font-weight:600;color:#1e293b;flex:1;min-width:100px;">${i.descricao}</span>
                <span style="font-size:12px;color:#64748b;">Pedido: ${i.quantidade_pedida} ${i.unidade}</span>
                <span style="font-size:12px;font-weight:600;color:${cor};">${label}</span>
              </div>`;
          }).join('')}
        </div>

        <div style="font-size:12px;color:#92400e;padding:10px 14px;
                    background:rgba(245,158,11,.12);border-radius:8px;">
          <i class="fa-solid fa-circle-info" style="margin-right:5px;"></i>
          Estoque insuficiente para atender todos os itens. Prossiga com a cotação para adquirir os itens em falta.
        </div>
      </div>`;
  },

  _ignorarEstoque() {
    const el = document.getElementById('sourcing-estoque-check');
    if (el) el.innerHTML = '';
  },

  async usarEstoque(idReq) {
    const v = this._ultimaVerificacaoEstoque;
    if (!v || !v.todosSuficientes) return;
    const itens = v.itens.filter(i => i.status === 'OK');
    if (!itens.length) return;

    const lista = itens.map(i => `• ${i.quantidade_pedida} ${i.unidade} — ${i.descricao}`).join('\n');
    if (!confirm(`Confirmar uso do estoque para a Requisição #${idReq}?\n\n${lista}\n\nOs itens serão descontados do estoque e a requisição será concluída sem passar pelo processo de compra.`)) return;

    try {
      await Api.post(`/api/sourcing/usar-estoque/${idReq}`, {
        itens: itens.map(i => ({ id_item: i.id_item, quantidade: i.quantidade_pedida, descricao: i.descricao })),
        registrado_por: localStorage.getItem('shp_user_email') || null
      });

      Toast.success('Requisição atendida por estoque!', 'Os itens foram descontados e a requisição foi concluída.');

      // Fecha workspace e atualiza lista
      const ws = document.getElementById('sourcing-workspace');
      if (ws) ws.style.display = 'none';
      this._pedidoSelecionado = null;
      this._ultimaVerificacaoEstoque = null;

      const pos = await Api.get('/api/sourcing/pedidos-aprovados');
      this._todosPedidos = pos;
      this._renderPedidosList();
    } catch (e) {
      Toast.error('Erro ao usar estoque', e.message || 'Verifique a API.');
    }
  },

  async buscarFornecedores() {
    const seg  = document.getElementById('sourcing-seg-input')?.value || '';
    const text = (document.getElementById('sourcing-text-input')?.value || '').trim();

    if (!seg && !text) {
      Toast.warning('Preencha ao menos um campo', 'Informe o segmento ou o nome/CNPJ do fornecedor.');
      return;
    }

    this._segmentoAtual = seg;
    const container = document.getElementById('sourcing-fornecedores');
    container.innerHTML = `<div class="loading-center"><div class="spinner"></div><span>Buscando...</span></div>`;

    try {
      let fornecedores = [];
      let historicoPrecos = [];

      if (seg) {
        // Busca por segmento (retorna histórico de preços também)
        const d = await Api.get(`/fornecedores/${encodeURIComponent(seg)}`);
        fornecedores   = d.fornecedores || [];
        historicoPrecos = d.historico_precos || [];

        // Filtra por texto se também preenchido
        if (text) {
          const tLow     = text.toLowerCase();
          const cnpjOnly = text.replace(/\D/g, '');
          fornecedores = fornecedores.filter(f => {
            const razaoLow  = (f.razao_social || '').toLowerCase();
            const cnpjClean = (f.cnpj || '').replace(/\D/g, '');
            return razaoLow.includes(tLow) || (cnpjOnly.length >= 4 && cnpjClean.includes(cnpjOnly));
          });
        }
      } else {
        // Busca livre por razão social / CNPJ
        const d = await Api.get(`/api/catalogo/fornecedores?q=${encodeURIComponent(text)}`);
        fornecedores = d.fornecedores || (Array.isArray(d) ? d : []);
      }

      const total = fornecedores.length;
      const totalEl = document.getElementById('sourcing-total-forn');
      if (totalEl) {
        totalEl.textContent = `${total} fornecedor${total !== 1 ? 'es' : ''}`;
        totalEl.style.display = '';
      }

      if (!total) {
        const descText = seg && text ? `segmento "${seg}" com o termo "${text}"`
          : seg ? `segmento "${seg}"`
          : `"${text}"`;
        container.innerHTML = `
          <div class="empty-state" style="padding:20px 0;">
            <div class="empty-icon"><i class="fa-solid fa-truck-ramp-box"></i></div>
            <p class="empty-title">Nenhum fornecedor encontrado</p>
            <p class="empty-desc">Não há fornecedores homologados para ${descText}.</p>
          </div>`;
        return;
      }

      container.innerHTML = fornecedores.map(f => {
        const cnpjClean = (f.cnpj || '').replace(/\W/g, '');
        const esc = s => (s || '').replace(/'/g, "\\'");
        return `
        <div class="supplier-card mb-2">
          <div class="supplier-card-header">
            <div>
              <div class="supplier-name">${f.razao_social || '—'}</div>
              <div class="supplier-cnpj">${f.cnpj || '—'}</div>
            </div>
            <div id="btn-invite-${cnpjClean}">
              <button class="btn btn-primary btn-sm"
                      onclick="Pages.sourcing.enviarConvite('${f.cnpj}', '${esc(f.razao_social)}')"
                      title="Convidar para cotação">
                <i class="fa-solid fa-paper-plane"></i> Convidar
              </button>
            </div>
          </div>
          <div class="supplier-meta">
            ${f.telefone ? `<span><i class="fa-solid fa-phone"></i> ${f.telefone}</span>` : ''}
            ${f.email    ? `<span><i class="fa-solid fa-envelope"></i> ${f.email}</span>` : ''}
            ${f.vendedor ? `<span><i class="fa-solid fa-user-tie"></i> ${f.vendedor}</span>` : ''}
          </div>
        </div>`;
      }).join('');

      // Histórico de preços (disponível apenas na busca por segmento)
      if (historicoPrecos.length > 0) {
        const histEl = document.getElementById('sourcing-historico');
        const listEl = document.getElementById('sourcing-hist-lista');
        if (histEl && listEl) {
          histEl.style.display = '';
          listEl.innerHTML = historicoPrecos.map(h => `
            <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-subtle);font-size:12px;">
              <div>
                <div style="font-weight:600;">${h.item || '—'}</div>
                <div style="color:var(--text-muted);">${h.fornecedor || '—'} · ${Fmt.date(h.data)}</div>
              </div>
              <div style="font-weight:700;color:var(--brand);">${Fmt.currency(h.valor)}</div>
            </div>
          `).join('');
        }
      }

    } catch {
      Toast.error('Erro ao buscar fornecedores');
    }
  },

  async enviarConvite(cnpj, nome) {
    if (!this._pedidoSelecionado) {
      Toast.warning('Selecione um pedido primeiro');
      return;
    }

    // Registra convite no backend (cria lance placeholder + avança status)
    try {
      await Api.post('/api/cotacao/disparar-email', {
        id_requisicao: this._pedidoSelecionado, cnpj_fornecedor: cnpj,
        preco_unitario: 0, prazo_entrega: 0
      });
    } catch { /* não bloqueia */ }

    // Atualiza localmente o contador de convites na lista de pedidos
    const pidx = this._todosPedidos.findIndex(p => p.id === this._pedidoSelecionado);
    if (pidx >= 0) {
      const p = this._todosPedidos[pidx];
      this._todosPedidos[pidx] = {
        ...p, status: 'Em Cotação',
        convites_enviados: (p.convites_enviados || 0) + 1
      };
      this._renderPedidosList();
    }

    // Monta a URL do portal
    const base = window.location.href.replace(/\/[^/]*(\?.*)?$/, '/');
    const portalUrl = `${base}fornecedor.html?id=${this._pedidoSelecionado}&cnpj=${encodeURIComponent(cnpj)}`;

    // Atualiza botão
    const cnpjClean = cnpj.replace(/\W/g, '');
    const btnEl = document.getElementById(`btn-invite-${cnpjClean}`);
    if (btnEl) btnEl.innerHTML = `<span class="badge badge-success"><i class="fa-solid fa-check"></i> Convidado</span>`;

    // Modal com link do portal
    this._mostrarModalConvite(nome, portalUrl, cnpj);
  },

  _mostrarModalConvite(nome, url, cnpj) {
    document.getElementById('modal-overlay').innerHTML = `
      <div class="modal" style="max-width:540px;">
        <div class="modal-header">
          <div class="modal-icon modal-icon-success">
            <i class="fa-solid fa-paper-plane"></i>
          </div>
          <div>
            <div class="modal-title">Convite Gerado!</div>
            <div class="modal-subtitle">${nome}</div>
          </div>
        </div>
        <div class="modal-body">
          <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">
            Compartilhe o link abaixo com o fornecedor. Ele abrirá o portal e poderá preencher a proposta com todos os detalhes da requisição.
          </p>

          <!-- Link do portal -->
          <div style="background:var(--surface);border:1.5px solid var(--brand);border-radius:10px;padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <i class="fa-solid fa-link" style="color:var(--brand);flex-shrink:0;"></i>
            <div style="flex:1;font-size:12px;color:var(--text);word-break:break-all;font-family:monospace;">${url}</div>
            <button class="btn btn-primary btn-sm" style="flex-shrink:0;"
                    onclick="navigator.clipboard.writeText('${url.replace(/'/g,"\\'")}');this.innerHTML='<i class=\\'fa-solid fa-check\\'></i> Copiado!';setTimeout(()=>this.innerHTML='<i class=\\'fa-solid fa-copy\\'></i> Copiar',2000);">
              <i class="fa-solid fa-copy"></i> Copiar
            </button>
          </div>

          <!-- Botão de teste -->
          <div style="background:var(--warning-surface);border:1px solid var(--warning);border-radius:8px;padding:12px 14px;">
            <div style="font-size:11px;font-weight:700;color:var(--warning-dark);margin-bottom:6px;">
              <i class="fa-solid fa-flask"></i> MODO DE TESTE
            </div>
            <p style="font-size:12px;color:var(--text-muted);margin-bottom:10px;">
              Para simular o fornecedor preenchendo a proposta, abra o portal agora e preencha os campos. Após enviar, a proposta aparecerá no Mapa Comparativo.
            </p>
            <a href="${url}" target="_blank" class="btn btn-warning btn-sm btn-block">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> Abrir Portal do Fornecedor (Simulação)
            </a>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="Modal.close()">Fechar</button>
          <button class="btn btn-primary" onclick="Modal.close();setTimeout(()=>Pages.sourcing.carregarMapa(Pages.sourcing._pedidoSelecionado),500);">
            <i class="fa-solid fa-rotate-right"></i> Ver Mapa Comparativo
          </button>
        </div>
      </div>`;
    document.getElementById('modal-overlay').classList.add('open');
  },

  async carregarMapa(id) {
    const el = document.getElementById('sourcing-mapa');
    el.innerHTML = `<div class="loading-center"><div class="spinner"></div><span>Carregando cotações...</span></div>`;

    try {
      const lances = await Api.get(`/api/cotacao/comparativo/${id}`);
      // Filtra lances com preço real (> 0)
      const comPreco = lances.filter(l => l.preco > 0);

      if (!comPreco || comPreco.length === 0) {
        // Mostra os convidados sem proposta ainda
        const semPreco = lances.filter(l => l.preco === 0 || !l.preco);
        el.innerHTML = `
          <div class="empty-state" style="padding:20px 0;">
            <div class="empty-icon"><i class="fa-solid fa-inbox"></i></div>
            <p class="empty-title">Aguardando propostas</p>
            <p class="empty-desc">
              ${semPreco.length > 0
                ? `${semPreco.length} fornecedor(es) convidado(s). Aguardando retorno das cotações.`
                : 'Convide fornecedores para receber propostas.'}
            </p>
          </div>
          ${semPreco.length > 0 ? `
          <div style="margin-top:12px;">
            ${semPreco.map(l => `
              <div style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--surface);border-radius:8px;margin-bottom:6px;">
                <i class="fa-solid fa-clock" style="color:var(--warning-dark);"></i>
                <span style="font-size:13px;font-weight:600;">${l.fornecedor || l.cnpj}</span>
                <span class="badge badge-warning" style="margin-left:auto;">Aguardando</span>
              </div>`).join('')}
          </div>` : ''}`;
        return;
      }

      document.getElementById('step-3').classList.add('active');
      const actionsEl = document.getElementById('mapa-actions');
      if (actionsEl) actionsEl.style.display = 'flex';
      const menorPreco = comPreco[0].preco;
      const jaTemSelecionado = comPreco.some(l => l.selecionado);
      const gestorAprov = comPreco.find(l => l.aprovado_gestor) || null;
      const gaEscCnpj = (gestorAprov?.cnpj || '').replace(/'/g, "\\'");
      const gaEscNome = (gestorAprov?.fornecedor || '').replace(/'/g, "\\'");

      el.innerHTML = `
        ${gestorAprov && !jaTemSelecionado ? `
        <div style="margin-bottom:12px;background:#f0fdf4;border:1.5px solid #059669;border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
          <i class="fa-solid fa-thumbs-up" style="color:#059669;font-size:18px;flex-shrink:0;"></i>
          <div style="flex:1;min-width:0;">
            <div style="font-size:13px;font-weight:700;color:#065f46;">Aprovado pelo Gestor: ${gestorAprov.fornecedor}</div>
            ${gestorAprov.aprovado_gestor_obs ? `<div style="font-size:12px;color:#555;margin-top:2px;">Obs: ${gestorAprov.aprovado_gestor_obs}</div>` : ''}
          </div>
          <button class="btn btn-success btn-sm" style="white-space:nowrap;flex-shrink:0;"
                  onclick="Pages.sourcing.selecionarFornecedor(${id},'${gaEscCnpj}','${gaEscNome}')">
            <i class="fa-solid fa-file-invoice"></i> Gerar Pedido de Compras
          </button>
        </div>` : ''}
        <div class="table-wrapper" style="overflow-x:auto;">
          <table class="table" style="min-width:580px;">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th class="td-num">Preço Unit.</th>
                <th>Prazo</th>
                <th>Pgto</th>
                <th>Variação</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              ${comPreco.map((l, i) => {
                const variacao = i === 0 ? 0 : ((l.preco - menorPreco) / menorPreco * 100).toFixed(1);
                const isMelhor = i === 0;
                const isSel    = l.selecionado;
                const isGA     = !!l.aprovado_gestor;
                return `
                <tr class="${isSel ? 'row-winner' : isGA && !isSel ? 'row-gestor-aprov' : ''}">
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      ${isSel ? '<i class="fa-solid fa-circle-check" style="color:var(--success-dark);font-size:16px;"></i>' : isGA ? '<i class="fa-solid fa-thumbs-up" style="color:#059669;font-size:16px;"></i>' : isMelhor ? '🏆' : ''}
                      <div>
                        <span class="td-bold">${l.fornecedor}</span>
                        ${isSel ? '<span class="badge badge-success" style="margin-left:6px;font-size:10px;">Selecionado</span>' : ''}
                        ${isGA && !isSel ? '<span class="sou-badge sou-badge-gestor" style="margin-left:6px;padding:2px 6px;font-size:10px;"><i class="fa-solid fa-thumbs-up"></i> Aprovado Gestor</span>' : ''}
                        ${isMelhor && !isSel && !isGA ? '<span class="badge badge-brand" style="margin-left:6px;font-size:10px;">Melhor Preço</span>' : ''}
                      </div>
                    </div>
                    ${l.observacoes ? `<div style="font-size:11px;color:var(--text-muted);margin-top:4px;padding-left:24px;"><i class="fa-solid fa-comment-dots"></i> ${l.observacoes}</div>` : ''}
                  </td>
                  <td class="td-num" style="color:${isMelhor?'var(--success-dark)':'var(--text)'};font-weight:${isMelhor?'700':'400'};">
                    ${Fmt.currency(l.preco)}
                  </td>
                  <td style="font-size:13px;">${l.prazo} dias</td>
                  <td style="font-size:12px;color:var(--text-muted);">${l.pagamento || '—'}</td>
                  <td>
                    ${i === 0
                      ? '<span class="badge badge-success">Base</span>'
                      : `<span class="badge badge-accent">+${variacao}%</span>`}
                  </td>
                  <td style="white-space:nowrap;text-align:right;">
                    <button class="btn btn-ghost btn-sm" style="color:var(--text-muted);margin-right:4px;"
                            title="Editar lance"
                            onclick="Pages.sourcing._editarLance(${l.id},${l.preco},${l.prazo || 0},'${(l.pagamento||'').replace(/'/g,"\\'")}','${(l.fornecedor||'').replace(/'/g,"\\'")}')">
                      <i class="fa-solid fa-pen"></i>
                    </button>
                    ${isSel
                      ? `<span style="font-size:12px;color:var(--success-dark);font-weight:700;"><i class="fa-solid fa-check"></i> PO Gerada</span>`
                      : isGA && !jaTemSelecionado
                        ? `<button class="btn btn-success btn-sm" onclick="Pages.sourcing.selecionarFornecedor(${id},'${l.cnpj}','${(l.fornecedor||'').replace(/'/g,"\\'")}')">
                             <i class="fa-solid fa-file-invoice"></i> Gerar Pedido de Compras
                           </button>`
                        : !jaTemSelecionado
                          ? `<button class="btn btn-success btn-sm" onclick="Pages.sourcing.selecionarFornecedor(${id},'${l.cnpj}','${(l.fornecedor||'').replace(/'/g,"\\'")}')">
                               <i class="fa-solid fa-check-double"></i> Selecionar
                             </button>`
                          : ''}
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${jaTemSelecionado ? `
        <div style="margin-top:12px;background:var(--success-surface);border:1px solid var(--success);border-radius:10px;padding:14px 16px;display:flex;align-items:center;gap:12px;">
          <i class="fa-solid fa-circle-check" style="color:var(--success-dark);font-size:20px;"></i>
          <div>
            <div style="font-size:13px;font-weight:700;color:var(--success-deeper);">Fornecedor selecionado — PO gerada</div>
            <div style="font-size:12px;color:var(--text-muted);">A requisição foi atualizada para "Aguardando Conciliação".</div>
          </div>
          <button class="btn btn-outline btn-sm" style="margin-left:auto;" onclick="App.navigate('recebimento')">
            <i class="fa-solid fa-arrow-right"></i> Ir para Conciliação
          </button>
        </div>` : gestorAprov ? `
        <div style="margin-top:12px;background:#f0fdf4;border:1px solid #059669;border-radius:8px;padding:12px 14px;">
          <div style="font-size:12px;color:var(--text-muted);">
            <i class="fa-solid fa-thumbs-up" style="color:#059669;"></i>
            Gestor aprovou <strong>${gestorAprov.fornecedor}</strong>. Clique em <strong>Gerar Pedido de Compras</strong> para emitir a PO.
          </div>
        </div>` : `
        <div style="margin-top:12px;background:var(--brand-surface);border:1px solid var(--brand-light);border-radius:8px;padding:12px 14px;">
          <div style="font-size:12px;color:var(--text-muted);">
            <i class="fa-solid fa-circle-info" style="color:var(--brand);"></i>
            Clique em <strong>Selecionar</strong> no melhor fornecedor para gerar a PO e avançar para a conciliação.
          </div>
        </div>`}`;

    } catch {
      el.innerHTML = `<div class="empty-state"><p class="empty-title text-accent">Erro ao carregar cotações</p></div>`;
    }
  },

  async selecionarFornecedor(idReq, cnpj, nome) {
    if (!cnpj || cnpj === 'null' || cnpj === 'undefined') {
      Toast.error('CNPJ do fornecedor inválido. Recarregue o mapa comparativo.');
      return;
    }
    const ok = await Modal.confirm({
      icon: 'success',
      title: 'Selecionar Fornecedor',
      subtitle: nome,
      body: `Confirma a seleção de <strong>${nome}</strong> para a Requisição #${idReq}?<br>A requisição será movida para <strong>Aguardando Conciliação</strong> e sairá desta fila.`,
      confirmText: 'Confirmar Seleção',
      confirmClass: 'btn-success'
    });
    if (!ok) return;

    try {
      await Api.post(`/api/sourcing/selecionar/${idReq}`, { cnpj_fornecedor: cnpj });

      // 1. Remove a linha da lista de pedidos imediatamente
      const row = document.getElementById(`pedido-row-${idReq}`);
      if (row) {
        row.style.transition = 'opacity .3s';
        row.style.opacity = '0';
        setTimeout(() => row.remove(), 300);
      }

      // 2. Verifica se ainda há pedidos na lista; se não, mostra empty state
      setTimeout(() => {
        const container = document.getElementById('sourcing-pedidos');
        if (container && container.querySelectorAll('.sou-pedido-row').length === 0) {
          container.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;padding:30px 0;">
              <div class="empty-icon" style="background:var(--success-surface);color:var(--success-dark);">
                <i class="fa-solid fa-circle-check"></i>
              </div>
              <p class="empty-title">Nenhum pedido pendente</p>
              <p class="empty-desc">Todos os pedidos foram processados.</p>
            </div>`;
        }
      }, 350);

      // 3. Fecha o workspace e reseta o estado
      const workspace = document.getElementById('sourcing-workspace');
      if (workspace) workspace.style.display = 'none';
      this._pedidoSelecionado = null;

      // 4. Toast de sucesso
      Toast.success(
        'Fornecedor selecionado!',
        `${nome} definido para a Req. #${idReq}. Gerando Pedido de Compras...`
      );

      // 5. Gera PO automaticamente para envio ao fornecedor
      setTimeout(() => POCompra.gerar(idReq), 600);

    } catch {
      Toast.error('Erro ao selecionar fornecedor');
    }
  },

  _editarLance(lanceId, preco, prazo, pagamento, fornecedor) {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    overlay.innerHTML = `
      <div class="modal" style="max-width:440px;">
        <div class="modal-header">
          <div class="modal-icon" style="background:var(--brand-surface);color:var(--brand);">
            <i class="fa-solid fa-pen-to-square"></i>
          </div>
          <div>
            <div class="modal-title">Editar Lance</div>
            <div class="modal-subtitle">${fornecedor}</div>
          </div>
        </div>
        <div class="modal-body" style="display:flex;flex-direction:column;gap:14px;">
          <div class="form-group">
            <label class="form-label">Preço Unitário (R$)</label>
            <input id="el-preco" class="form-control" type="number" step="0.01" min="0" value="${preco}">
          </div>
          <div class="form-group">
            <label class="form-label">Prazo de Entrega (dias)</label>
            <input id="el-prazo" class="form-control" type="number" min="0" value="${prazo || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Condição de Pagamento</label>
            <input id="el-pgto" class="form-control" type="text" placeholder="Ex: 30 DDL" value="${pagamento || ''}">
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" onclick="Modal.close()">Cancelar</button>
          <button class="btn btn-primary" id="el-save-btn">
            <i class="fa-solid fa-floppy-disk"></i> Salvar
          </button>
        </div>
      </div>`;
    overlay.classList.add('open');

    document.getElementById('el-save-btn')?.addEventListener('click', async () => {
      const novoPreco = parseFloat(document.getElementById('el-preco')?.value || '0');
      const novoPrazo = parseInt(document.getElementById('el-prazo')?.value || '0', 10);
      const novoPgto  = document.getElementById('el-pgto')?.value.trim() || '';
      const btn = document.getElementById('el-save-btn');
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }
      try {
        await Api.patch(`/api/cotacao/lance/${lanceId}`, {
          preco_unitario: novoPreco, prazo_entrega_dias: novoPrazo, pagamento: novoPgto
        });
        Modal.close();
        Toast.success('Lance atualizado!', 'Os dados do lance foram salvos.');
        this.carregarMapa(this._pedidoSelecionado);
      } catch {
        Toast.error('Erro ao salvar lance');
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar'; }
      }
    });
  },

  emitirPO(id, cnpj) {
    window.open(`/frontend/fornecedor.html?id=${id}&cnpj=${cnpj}`, '_blank');
  }
};
