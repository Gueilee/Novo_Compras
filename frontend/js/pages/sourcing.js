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
        <div id="sourcing-pedidos" class="grid-auto">
          ${Skeleton.list(3)}
        </div>
      </div>

      <!-- Step 2+3: Workspace (visível após selecionar pedido) -->
      <div id="sourcing-workspace" style="display:none;">

        <!-- Detalhe do pedido selecionado -->
        <div id="sourcing-req-detail" class="card mb-4" style="background:var(--brand-surface);border:1.5px solid var(--brand-light);"></div>

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
              <label class="form-label">Buscar por Segmento</label>
              <div style="display:flex;gap:8px;">
                <select class="form-control form-control-sm" id="sourcing-seg-input">
                  <option value="">Selecione um segmento...</option>
                </select>
                <button class="btn btn-primary btn-sm" onclick="Pages.sourcing.buscarFornecedores()">
                  <i class="fa-solid fa-magnifying-glass"></i>
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
    </div>`;
  },

  async init() {
    this._pedidoSelecionado = null;
    this._pedidoInfo = null;
    // Carrega segmentos em background
    Api.get('/api/sourcing/segmentos').then(data => {
      this._segmentos = data || [];
      const sel = document.getElementById('sourcing-seg-input');
      if (sel && this._segmentos.length) {
        sel.innerHTML = '<option value="">Selecione um segmento...</option>' +
          this._segmentos.map(s => `<option value="${s}">${s}</option>`).join('');
      }
    }).catch(() => {});
    try {
      const pedidos = await Api.get('/api/sourcing/pedidos-aprovados');
      const container = document.getElementById('sourcing-pedidos');

      if (!pedidos || pedidos.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="grid-column:1/-1;padding:30px 0;">
            <div class="empty-icon" style="background:var(--success-surface);color:var(--success-dark);">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <p class="empty-title">Nenhum pedido para cotar</p>
            <p class="empty-desc">Todos os pedidos aprovados já foram processados.</p>
          </div>`;
        return;
      }

      container.innerHTML = pedidos.map(p => {
        const emCotacao = p.status === 'Em Cotação';
        const statusBadge = emCotacao
          ? `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;background:#ede9fe;color:#6d28d9;border-radius:8px;padding:2px 7px;margin-top:4px;">
               <i class="fa-solid fa-tag" style="font-size:8px;"></i> Em Cotação
             </span>`
          : `<span style="display:inline-flex;align-items:center;gap:4px;font-size:10px;font-weight:700;background:#fef3c7;color:#d97706;border-radius:8px;padding:2px 7px;margin-top:4px;">
               <i class="fa-solid fa-clock" style="font-size:8px;"></i> Aguardando Cotação
             </span>`;
        return `
        <div class="order-mini-card" id="pedido-card-${p.id}" onclick="Pages.sourcing.selecionarPedido(${p.id}, this)">
          <div class="order-mini-card-id">Pedido #${p.id}</div>
          <div class="order-mini-card-meta">
            <div><i class="fa-solid fa-user" style="color:var(--brand);width:14px;"></i> ${p.solicitante}</div>
            <div><i class="fa-solid fa-building" style="color:var(--brand);width:14px;"></i> ${p.unidade}</div>
            <div><i class="fa-solid fa-calendar" style="color:var(--brand);width:14px;"></i> ${Fmt.date(p.data)}</div>
          </div>
          ${statusBadge}
        </div>`;
      }).join('');
    } catch {
      Toast.error('Erro ao carregar pedidos', 'Verifique a API.');
    }
  },

  async selecionarPedido(id, el) {
    this._pedidoSelecionado = id;
    document.querySelectorAll('.order-mini-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');

    const ws = document.getElementById('sourcing-workspace');
    ws.style.display = 'grid';
    ws.style.gap = '20px';

    document.getElementById('step-1').classList.add('done');
    document.getElementById('step-2').classList.add('active');

    // Popula segmentos no select
    const segSel = document.getElementById('sourcing-seg-input');
    if (segSel && this._segmentos.length) {
      segSel.innerHTML = '<option value="">Selecione um segmento...</option>' +
        this._segmentos.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    // Carrega detalhes da requisição
    try {
      const req = await Api.get(`/api/sourcing/requisicao/${id}`);
      this._pedidoInfo = req;
      this._renderReqDetail(req);
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

  async buscarFornecedores() {
    const seg = document.getElementById('sourcing-seg-input')?.value;
    if (!seg) { Toast.warning('Selecione um segmento', 'Escolha um segmento para buscar fornecedores.'); return; }

    this._segmentoAtual = seg;
    const container = document.getElementById('sourcing-fornecedores');
    container.innerHTML = `<div class="loading-center"><div class="spinner"></div><span>Buscando...</span></div>`;

    try {
      const d = await Api.get(`/fornecedores/${encodeURIComponent(seg)}`);

      const totalEl = document.getElementById('sourcing-total-forn');
      if (totalEl) {
        totalEl.textContent = `${d.total_fornecedores} fornecedor${d.total_fornecedores !== 1 ? 'es' : ''}`;
        totalEl.style.display = '';
      }

      if (!d.fornecedores || d.fornecedores.length === 0) {
        container.innerHTML = `
          <div class="empty-state" style="padding:20px 0;">
            <div class="empty-icon"><i class="fa-solid fa-truck-ramp-box"></i></div>
            <p class="empty-title">Nenhum fornecedor encontrado</p>
            <p class="empty-desc">Não há fornecedores homologados para o segmento "${seg}".</p>
          </div>`;
        return;
      }

      container.innerHTML = d.fornecedores.map(f => {
        const cnpjClean = f.cnpj.replace(/\W/g, '');
        return `
        <div class="supplier-card mb-2">
          <div class="supplier-card-header">
            <div>
              <div class="supplier-name">${f.razao_social}</div>
              <div class="supplier-cnpj">${f.cnpj}</div>
            </div>
            <div id="btn-invite-${cnpjClean}">
              <button class="btn btn-primary btn-sm"
                      onclick="Pages.sourcing.enviarConvite('${f.cnpj}', '${f.razao_social.replace(/'/g,"\\'")}')"
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

      // Histórico de preços
      if (d.historico_precos?.length > 0) {
        const histEl = document.getElementById('sourcing-historico');
        const listEl = document.getElementById('sourcing-hist-lista');
        if (histEl && listEl) {
          histEl.style.display = '';
          listEl.innerHTML = d.historico_precos.map(h => `
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

    // Registra convite no backend
    try {
      await Api.post('/api/cotacao/disparar-email', {
        id_requisicao: this._pedidoSelecionado, cnpj_fornecedor: cnpj,
        preco_unitario: 0, prazo_entrega: 0
      });
    } catch { /* não bloqueia */ }

    // Monta a URL do portal
    const portalUrl = `http://localhost:8000/frontend/fornecedor.html?id=${this._pedidoSelecionado}&cnpj=${encodeURIComponent(cnpj)}`;

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

      el.innerHTML = `
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
                return `
                <tr class="${isSel ? 'row-winner' : isMelhor ? '' : ''}">
                  <td>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      ${isSel ? '<i class="fa-solid fa-circle-check" style="color:var(--success-dark);font-size:16px;"></i>' : isMelhor ? '🏆' : ''}
                      <div>
                        <span class="td-bold">${l.fornecedor}</span>
                        ${isSel ? '<span class="badge badge-success" style="margin-left:6px;font-size:10px;">Selecionado</span>' : ''}
                        ${isMelhor && !isSel ? '<span class="badge badge-brand" style="margin-left:6px;font-size:10px;">Melhor Preço</span>' : ''}
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
                  <td>
                    ${isSel
                      ? `<span style="font-size:12px;color:var(--success-dark);font-weight:700;"><i class="fa-solid fa-check"></i> PO Gerada</span>`
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

      // 1. Remove o card da lista de pedidos imediatamente
      const card = document.getElementById(`pedido-card-${idReq}`);
      if (card) {
        card.style.transition = 'opacity .3s, transform .3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(.95)';
        setTimeout(() => card.remove(), 300);
      }

      // 2. Verifica se ainda há pedidos na lista; se não, mostra empty state
      setTimeout(() => {
        const container = document.getElementById('sourcing-pedidos');
        if (container && container.querySelectorAll('.order-mini-card').length === 0) {
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

  emitirPO(id, cnpj) {
    window.open(`/frontend/fornecedor.html?id=${id}&cnpj=${cnpj}`, '_blank');
  }
};
