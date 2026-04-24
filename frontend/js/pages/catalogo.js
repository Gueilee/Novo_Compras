/* ── CATÁLOGO PAGE ────────────────────────────────────────── */
window.Pages = window.Pages || {};

window.Pages.catalogo = {
  title: 'Catálogo de Itens',
  subtitle: 'Itens e serviços homologados com preços de referência',
  icon: 'fa-book-open',

  _page: 1,
  _perPage: 20,
  _total: 0,
  _pages: 1,
  _busca: '',
  _segmento: '',
  _segmentos: [],
  _debounceTimer: null,
  _tbodyListenerAdded: false,

  render() {
    return `
    <div class="page-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Catálogo de Itens</h1>
          <p class="page-subtitle">Itens extraídos de todas as requisições com histórico e preços de referência</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary btn-sm" onclick="App.navigate('intake')">
            <i class="fa-solid fa-plus"></i> Nova Requisição
          </button>
        </div>
      </div>

      <!-- KPIs -->
      <div class="grid-4 mb-4">
        <div class="kpi-card" style="cursor:pointer;transition:box-shadow .15s,transform .15s;"
             onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(66,44,118,.12)'"
             onmouseleave="this.style.transform='';this.style.boxShadow=''"
             onclick="Pages.catalogo._limparFiltros();Pages.catalogo._pulseCard(this)">
          <div class="kpi-card-top"><div class="kpi-icon-box kpi-icon-brand"><i class="fa-solid fa-boxes-stacked"></i></div></div>
          <div class="kpi-value" id="kpi-total-itens"><span class="skeleton skeleton-line" style="width:60px;height:28px;display:inline-block;"></span></div>
          <div class="kpi-label">Itens Únicos no Catálogo</div>
          <div style="font-size:11px;color:var(--brand);margin-top:2px;font-weight:600;">▶ Ver todos os itens</div>
        </div>
        <div class="kpi-card" style="cursor:pointer;transition:box-shadow .15s,transform .15s;"
             onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(66,44,118,.12)'"
             onmouseleave="this.style.transform='';this.style.boxShadow=''"
             onclick="Pages.catalogo._focarSegmento();Pages.catalogo._pulseCard(this)">
          <div class="kpi-card-top"><div class="kpi-icon-box kpi-icon-accent"><i class="fa-solid fa-tags"></i></div></div>
          <div class="kpi-value" id="kpi-segmentos"><span class="skeleton skeleton-line" style="width:40px;height:28px;display:inline-block;"></span></div>
          <div class="kpi-label">Segmentos</div>
          <div style="font-size:11px;color:var(--accent);margin-top:2px;font-weight:600;">▶ Filtrar por segmento</div>
        </div>
        <div class="kpi-card" style="cursor:pointer;transition:box-shadow .15s,transform .15s;"
             onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(66,44,118,.12)'"
             onmouseleave="this.style.transform='';this.style.boxShadow=''"
             onclick="Pages.catalogo._buscarComPreco();Pages.catalogo._pulseCard(this)">
          <div class="kpi-card-top"><div class="kpi-icon-box kpi-icon-success"><i class="fa-solid fa-circle-check"></i></div></div>
          <div class="kpi-value" id="kpi-com-preco"><span class="skeleton skeleton-line" style="width:40px;height:28px;display:inline-block;"></span></div>
          <div class="kpi-label">Com Preço de Referência</div>
          <div style="font-size:11px;color:var(--success-dark);margin-top:2px;font-weight:600;">▶ Ver itens com preço</div>
        </div>
        <div class="kpi-card" style="cursor:pointer;transition:box-shadow .15s,transform .15s;"
             onmouseenter="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 24px rgba(66,44,118,.12)'"
             onmouseleave="this.style.transform='';this.style.boxShadow=''"
             onclick="App.navigate('pedidos');Pages.catalogo._pulseCard(this)">
          <div class="kpi-card-top"><div class="kpi-icon-box kpi-icon-warning"><i class="fa-solid fa-file-invoice"></i></div></div>
          <div class="kpi-value" id="kpi-total-req"><span class="skeleton skeleton-line" style="width:60px;height:28px;display:inline-block;"></span></div>
          <div class="kpi-label">Total de Requisições</div>
          <div style="font-size:11px;color:var(--warning-dark);margin-top:2px;font-weight:600;">▶ Ver requisições</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="card mb-3" style="padding:16px 20px;">
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:nowrap;">
          <div style="flex:1;min-width:200px;position:relative;">
            <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:13px;pointer-events:none;"></i>
            <input type="text" id="cat-busca" class="form-control" placeholder="Buscar item por nome..."
                   style="padding-left:36px;height:40px;"
                   oninput="Pages.catalogo._onBusca(this.value)">
          </div>
          <div style="width:220px;flex-shrink:0;">
            <select id="cat-segmento" class="form-control" style="height:40px;"
                    onchange="Pages.catalogo._onSegmento(this.value)">
              <option value="">Todos os Segmentos</option>
            </select>
          </div>
          <button class="btn btn-ghost btn-sm" id="cat-limpar" style="display:none;height:40px;"
                  onclick="Pages.catalogo._limparFiltros()">
            <i class="fa-solid fa-xmark"></i> Limpar
          </button>
          <div id="cat-contador" style="font-size:12px;color:var(--text-muted);white-space:nowrap;"></div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="overflow-x:auto;">
          <table class="table" style="min-width:800px;">
            <thead>
              <tr style="background:var(--surface);">
                <th style="padding:12px 20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Item</th>
                <th style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Segmento</th>
                <th style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);text-align:center;">Requisições</th>
                <th style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);text-align:center;">Concluídas</th>
                <th style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);text-align:center;">Fornecedores</th>
                <th style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Preço Médio</th>
                <th style="padding:12px 16px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);">Última Req.</th>
                <th style="width:32px;"></th>
              </tr>
            </thead>
            <tbody id="cat-tbody">
              <tr><td colspan="8" style="padding:48px;text-align:center;">
                <div class="loading-center"><div class="spinner"></div><span>Carregando catálogo...</span></div>
              </td></tr>
            </tbody>
          </table>
        </div>
        <div id="cat-pagination" style="display:flex;align-items:center;justify-content:space-between;padding:14px 20px;border-top:1px solid var(--border);background:var(--surface);">
          <span id="cat-pag-info" style="font-size:12px;color:var(--text-muted);"></span>
          <div style="display:flex;gap:6px;" id="cat-pag-btns"></div>
        </div>
      </div>
    </div>`;
  },

  async init() {
    this._page     = 1;
    this._busca    = '';
    this._segmento = '';
    this._tbodyListenerAdded = false;
    // Carrega stats e lista em paralelo
    await Promise.all([this._carregarStats(), this._carregar()]);
  },

  async _carregarStats() {
    try {
      const s = await Api.get('/api/catalogo/stats');
      const el = id => document.getElementById(id);
      if (el('kpi-total-itens')) el('kpi-total-itens').textContent = Fmt.number(s.total_itens);
      if (el('kpi-segmentos'))   el('kpi-segmentos').textContent   = Fmt.number(s.total_segmentos);
      if (el('kpi-com-preco'))   el('kpi-com-preco').textContent   = Fmt.number(s.com_preco);
      if (el('kpi-total-req'))   el('kpi-total-req').textContent   = Fmt.number(s.total_requisicoes);
    } catch { /* silently fail — KPIs mostrarão skeleton */ }
  },

  async _carregar() {
    const tbody = document.getElementById('cat-tbody');
    if (tbody) tbody.innerHTML = `
      <tr><td colspan="8" style="padding:48px;text-align:center;">
        <div class="loading-center"><div class="spinner"></div><span>Carregando...</span></div>
      </td></tr>`;

    try {
      const params = new URLSearchParams({
        page:     this._page,
        per_page: this._perPage,
        busca:    this._busca,
        segmento: this._segmento
      });
      const data = await Api.get(`/api/catalogo?${params}`);

      this._total = data.total;
      this._pages = data.pages;

      // Popula segmentos no select apenas uma vez
      if (data.segmentos?.length && !this._segmentos.length) {
        this._segmentos = data.segmentos;
        const sel = document.getElementById('cat-segmento');
        if (sel) {
          data.segmentos.forEach(s => {
            const o = document.createElement('option');
            o.value = s; o.textContent = s;
            if (s === this._segmento) o.selected = true;
            sel.appendChild(o);
          });
        }
      }

      this._renderTabela(data.items);
      this._renderPaginacao();
      this._atualizarContador();
    } catch {
      if (tbody) tbody.innerHTML = `
        <tr><td colspan="8" style="padding:48px;text-align:center;color:var(--accent);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:24px;display:block;margin-bottom:8px;"></i>
          Erro ao carregar o catálogo. Verifique a API.
        </td></tr>`;
    }
  },

  _renderTabela(items) {
    const tbody = document.getElementById('cat-tbody');
    if (!tbody) return;

    if (!items || items.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="8" style="padding:48px;text-align:center;">
          <div class="empty-icon" style="margin:0 auto 12px;"><i class="fa-solid fa-magnifying-glass"></i></div>
          <div style="font-weight:600;margin-bottom:4px;">Nenhum item encontrado</div>
          <div style="font-size:13px;color:var(--text-muted);">Tente outro termo de busca ou segmento.</div>
        </td></tr>`;
      return;
    }

    // Usa data-idx para evitar quebra com caracteres especiais no onclick
    tbody.innerHTML = items.map((item, idx) => {
      const taxaConclusao = item.total_requisicoes > 0
        ? Math.round((item.total_concluidos / item.total_requisicoes) * 100) : 0;
      const barColor = taxaConclusao >= 70 ? 'var(--success)' : taxaConclusao >= 40 ? 'var(--warning)' : 'var(--accent)';

      // Escapa atributos HTML
      const descEsc = item.descricao.replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      const segEsc  = item.segmento.replace(/&/g,'&amp;').replace(/"/g,'&quot;');

      return `
      <tr class="cat-row" data-descricao="${descEsc}" data-segmento="${segEsc}"
          style="cursor:pointer;transition:background .12s;">
        <td style="padding:14px 20px;">
          <div style="font-size:13px;font-weight:600;color:var(--text);max-width:340px;word-break:break-word;">
            ${item.descricao || '<span style="color:var(--text-muted);font-style:italic;">Sem descrição</span>'}
          </div>
        </td>
        <td style="padding:14px 16px;">
          <span style="background:var(--brand-surface);color:var(--brand);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:600;white-space:nowrap;">
            ${item.segmento}
          </span>
        </td>
        <td style="padding:14px 16px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:var(--brand);">${Fmt.number(item.total_requisicoes)}</div>
        </td>
        <td style="padding:14px 16px;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:3px;">
            <div style="font-size:12px;font-weight:700;color:${barColor};">${taxaConclusao}%</div>
            <div style="width:64px;height:5px;background:var(--border);border-radius:3px;overflow:hidden;">
              <div style="width:${taxaConclusao}%;height:100%;background:${barColor};border-radius:3px;"></div>
            </div>
            <div style="font-size:10px;color:var(--text-muted);">${item.total_concluidos} concluídas</div>
          </div>
        </td>
        <td style="padding:14px 16px;text-align:center;">
          ${item.total_fornecedores > 0
            ? `<span style="display:inline-flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--text);">
                <i class="fa-solid fa-truck" style="color:var(--text-muted);font-size:11px;"></i>${item.total_fornecedores}
               </span>`
            : `<span style="color:var(--text-muted);font-size:12px;">—</span>`}
        </td>
        <td style="padding:14px 16px;">
          ${item.preco_medio
            ? `<div style="font-size:14px;font-weight:700;color:var(--success-deeper);">${Fmt.currency(item.preco_medio)}</div>
               <div style="font-size:10px;color:var(--text-muted);">média concluídas</div>`
            : `<span style="color:var(--text-muted);font-size:12px;">Sem referência</span>`}
        </td>
        <td style="padding:14px 16px;font-size:12px;color:var(--text-muted);">
          ${item.ultima_requisicao ? Fmt.date(item.ultima_requisicao) : '—'}
        </td>
        <td style="padding:14px 16px;">
          <i class="fa-solid fa-chevron-right" style="color:var(--text-muted);font-size:11px;"></i>
        </td>
      </tr>`;
    }).join('');

    // Event delegation — adicionado apenas uma vez por tbody
    if (!this._tbodyListenerAdded) {
      this._tbodyListenerAdded = true;
      tbody.addEventListener('click', (e) => {
        const row = e.target.closest('tr.cat-row');
        if (!row) return;
        this._abrirDetalhe(row.dataset.descricao, row.dataset.segmento);
      });
      tbody.addEventListener('mouseenter', (e) => {
        const row = e.target.closest('tr.cat-row');
        if (row) row.style.background = 'var(--brand-surface)';
      }, true);
      tbody.addEventListener('mouseleave', (e) => {
        const row = e.target.closest('tr.cat-row');
        if (row) row.style.background = '';
      }, true);
    }
  },

  _renderPaginacao() {
    const info = document.getElementById('cat-pag-info');
    const btns = document.getElementById('cat-pag-btns');
    if (!info || !btns) return;

    const start = (this._page - 1) * this._perPage + 1;
    const end   = Math.min(this._page * this._perPage, this._total);
    info.textContent = `Exibindo ${start}–${end} de ${Fmt.number(this._total)} itens`;

    const pages = this._pages;
    const cur   = this._page;
    const btn = (p, label, disabled, active) => `
      <button class="btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}"
              style="min-width:36px;padding:0 10px;height:34px;${disabled ? 'opacity:.4;cursor:default;' : ''}"
              ${disabled ? 'disabled' : `onclick="Pages.catalogo._irPagina(${p})"`}>
        ${label}
      </button>`;

    let html = btn(cur-1, '<i class="fa-solid fa-chevron-left" style="font-size:10px;"></i>', cur<=1, false);

    const range = [];
    if (pages <= 7) {
      for (let i = 1; i <= pages; i++) range.push(i);
    } else {
      range.push(1);
      if (cur > 3)       range.push('…');
      for (let i = Math.max(2,cur-1); i <= Math.min(pages-1,cur+1); i++) range.push(i);
      if (cur < pages-2) range.push('…');
      range.push(pages);
    }

    range.forEach(p => {
      html += p === '…'
        ? `<span style="padding:0 6px;color:var(--text-muted);line-height:34px;">…</span>`
        : btn(p, p, false, p === cur);
    });

    html += btn(cur+1, '<i class="fa-solid fa-chevron-right" style="font-size:10px;"></i>', cur>=pages, false);
    btns.innerHTML = html;
  },

  _atualizarContador() {
    const el = document.getElementById('cat-contador');
    if (!el) return;
    const temFiltro = this._busca || this._segmento;
    el.innerHTML = temFiltro
      ? `<span style="background:var(--brand-surface);color:var(--brand);padding:3px 10px;border-radius:20px;font-weight:600;">
           ${Fmt.number(this._total)} resultado${this._total !== 1 ? 's' : ''}
         </span>`
      : '';
    const limparBtn = document.getElementById('cat-limpar');
    if (limparBtn) limparBtn.style.display = temFiltro ? '' : 'none';
  },

  _irPagina(p) {
    if (p < 1 || p > this._pages) return;
    this._page = p;
    this._carregar();
    document.querySelector('.card[style*="overflow:hidden"]')?.scrollIntoView({ behavior:'smooth', block:'start' });
  },

  _onBusca(val) {
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => {
      this._busca = val.trim();
      this._page  = 1;
      this._carregar();
    }, 350);
  },

  _onSegmento(val) {
    this._segmento = val;
    this._page     = 1;
    this._carregar();
  },

  _limparFiltros() {
    this._busca    = '';
    this._segmento = '';
    this._page     = 1;
    const buscaEl = document.getElementById('cat-busca');
    const segEl   = document.getElementById('cat-segmento');
    if (buscaEl) buscaEl.value = '';
    if (segEl)   segEl.value   = '';
    this._carregar();
  },

  _pulseCard(el) {
    el.style.transition = 'transform .1s';
    el.style.transform  = 'scale(0.97)';
    setTimeout(() => { el.style.transform = ''; }, 150);
  },

  _focarSegmento() {
    const sel = document.getElementById('cat-segmento');
    if (sel) {
      sel.focus();
      sel.style.borderColor = 'var(--brand)';
      sel.style.boxShadow   = '0 0 0 3px var(--brand-surface)';
      setTimeout(() => { sel.style.borderColor = ''; sel.style.boxShadow = ''; }, 2000);
      sel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },

  _buscarComPreco() {
    // Filtra por busca vazia + página 1 mas ordena traz os com mais requisições concluídas
    // Visualmente: limpa filtros e rola para a tabela, onde os top itens já têm preço
    this._limparFiltros();
    setTimeout(() => {
      document.querySelector('#cat-tbody')?.closest('.card')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      Toast.info('Itens com preço', 'Itens com compras concluídas aparecem no topo com o preço médio em verde.');
    }, 400);
  },

  // ── Drawer de detalhe ──────────────────────────────────────
  async _abrirDetalhe(descricao, segmento) {
    document.getElementById('cat-drawer')?.remove();
    document.getElementById('cat-overlay')?.remove();

    // Overlay
    const overlay = document.createElement('div');
    overlay.id = 'cat-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:999;transition:opacity .2s;opacity:0;';
    document.body.appendChild(overlay);
    requestAnimationFrame(() => { overlay.style.opacity = '1'; });
    overlay.onclick = () => this._fecharDrawer();

    // Drawer
    const drawer = document.createElement('div');
    drawer.id = 'cat-drawer';
    drawer.style.cssText = `
      position:fixed;top:0;right:0;width:540px;max-width:100vw;height:100vh;
      background:#fff;box-shadow:-6px 0 40px rgba(0,0,0,.14);
      z-index:1000;display:flex;flex-direction:column;
      transform:translateX(100%);transition:transform .25s cubic-bezier(.4,0,.2,1);
    `;

    drawer.innerHTML = `
      <!-- Header -->
      <div style="padding:20px 24px 16px;border-bottom:1px solid var(--border);">
        <div style="display:flex;align-items:flex-start;gap:12px;">
          <div style="width:44px;height:44px;background:var(--brand-surface);border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid fa-boxes-stacked" style="color:var(--brand);font-size:18px;"></i>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:15px;font-weight:800;color:var(--text);line-height:1.3;word-break:break-word;">${descricao || 'Sem descrição'}</div>
            <span style="background:var(--brand-surface);color:var(--brand);border-radius:6px;padding:3px 9px;font-size:11px;font-weight:600;margin-top:6px;display:inline-block;">
              ${segmento}
            </span>
          </div>
          <button onclick="Pages.catalogo._fecharDrawer()"
                  style="background:none;border:1px solid var(--border);border-radius:8px;cursor:pointer;padding:6px 10px;color:var(--text-muted);flex-shrink:0;font-size:16px;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      <!-- Body -->
      <div id="cat-drawer-body" style="flex:1;overflow-y:auto;padding:20px 24px;">
        <div class="loading-center" style="padding:48px 0;">
          <div class="spinner"></div><span>Carregando histórico...</span>
        </div>
      </div>
      <!-- Footer -->
      <div style="padding:16px 24px;border-top:1px solid var(--border);background:var(--surface);">
        <button class="btn btn-primary btn-block" onclick="App.navigate('intake')">
          <i class="fa-solid fa-cart-plus"></i> Usar este item em Nova Requisição
        </button>
      </div>`;

    document.body.appendChild(drawer);
    requestAnimationFrame(() => { drawer.style.transform = 'translateX(0)'; });

    // Carrega dados
    try {
      const params = new URLSearchParams({ descricao, segmento });
      const data = await Api.get(`/api/catalogo/detalhe?${params}`);
      this._renderDrawerBody(data.historico || [], descricao);
    } catch {
      const body = document.getElementById('cat-drawer-body');
      if (body) body.innerHTML = `
        <div style="text-align:center;padding:48px 0;color:var(--accent);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:28px;display:block;margin-bottom:12px;"></i>
          Erro ao carregar o histórico.
        </div>`;
    }
  },

  _fecharDrawer() {
    const drawer  = document.getElementById('cat-drawer');
    const overlay = document.getElementById('cat-overlay');
    if (drawer)  { drawer.style.transform  = 'translateX(100%)'; }
    if (overlay) { overlay.style.opacity   = '0'; }
    setTimeout(() => { drawer?.remove(); overlay?.remove(); }, 260);
  },

  _renderDrawerBody(hist, descricao) {
    const body = document.getElementById('cat-drawer-body');
    if (!body) return;

    const totalReq  = hist.length;
    const concluidos = hist.filter(h => (h.status||'').toLowerCase().includes('concluí') || (h.status||'').toLowerCase().includes('concluido')).length;
    const comPreco  = hist.filter(h => h.valor && h.valor > 0);
    const precoMedio = comPreco.length ? comPreco.reduce((s,h) => s + h.valor, 0) / comPreco.length : null;
    const precoMin   = comPreco.length ? Math.min(...comPreco.map(h => h.valor)) : null;
    const precoMax   = comPreco.length ? Math.max(...comPreco.map(h => h.valor)) : null;
    const fornUnicos = [...new Set(hist.map(h => h.fornecedor).filter(Boolean))];
    const taxaConcl  = totalReq > 0 ? Math.round((concluidos/totalReq)*100) : 0;

    body.innerHTML = `
      <!-- KPIs mini -->
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:20px;">
        <div style="background:var(--brand-surface);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--brand);">${Fmt.number(totalReq)}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Requisições</div>
        </div>
        <div style="background:var(--success-surface);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--success-deeper);">${taxaConcl}%</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Concluídas</div>
        </div>
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--text);">${fornUnicos.length}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">Fornecedores</div>
        </div>
      </div>

      <!-- Preços -->
      ${precoMedio ? `
      <div style="background:var(--success-surface);border:1px solid var(--success);border-radius:10px;padding:14px 16px;margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--success-dark);margin-bottom:8px;">
          <i class="fa-solid fa-tag"></i> Referência de Preço
        </div>
        <div style="display:flex;gap:16px;flex-wrap:wrap;">
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Preço Médio</div>
            <div style="font-size:18px;font-weight:800;color:var(--success-deeper);">${Fmt.currency(precoMedio)}</div>
          </div>
          ${precoMin !== precoMax ? `
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Mínimo</div>
            <div style="font-size:16px;font-weight:700;color:var(--success-dark);">${Fmt.currency(precoMin)}</div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);">Máximo</div>
            <div style="font-size:16px;font-weight:700;color:var(--text);">${Fmt.currency(precoMax)}</div>
          </div>` : ''}
        </div>
      </div>` : ''}

      <!-- Fornecedores -->
      ${fornUnicos.length > 0 ? `
      <div style="margin-bottom:16px;">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:8px;">
          <i class="fa-solid fa-truck"></i> Fornecedores que já atenderam
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;">
          ${fornUnicos.map(f => `
            <span style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--text);">
              ${f}
            </span>`).join('')}
        </div>
      </div>` : ''}

      <!-- Histórico -->
      <div>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:12px;">
          <i class="fa-solid fa-clock-rotate-left"></i> Histórico (${hist.length} registros)
        </div>
        ${hist.length === 0
          ? `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">Sem histórico disponível.</div>`
          : hist.map(h => `
            <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-subtle);">
              <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                  <span style="font-size:11px;font-weight:700;color:var(--brand);">#${h.id||'—'}</span>
                  ${StatusBadge.get(h.status||'')}
                </div>
                <div style="font-size:12px;color:var(--text-muted);display:flex;gap:12px;flex-wrap:wrap;">
                  ${h.data     ? `<span><i class="fa-regular fa-calendar" style="width:12px;"></i> ${Fmt.date(h.data)}</span>`       : ''}
                  ${h.comprador ? `<span><i class="fa-solid fa-user" style="width:12px;"></i> ${h.comprador}</span>`                   : ''}
                </div>
                ${h.fornecedor ? `<div style="font-size:12px;color:var(--text-muted);margin-top:3px;"><i class="fa-solid fa-truck" style="width:12px;"></i> ${h.fornecedor}</div>` : ''}
              </div>
              <div style="text-align:right;flex-shrink:0;">
                ${h.valor    ? `<div style="font-size:13px;font-weight:700;color:var(--success-deeper);">${Fmt.currency(h.valor)}</div>`  : ''}
                ${h.quantidade ? `<div style="font-size:11px;color:var(--text-muted);">Qtd: ${h.quantidade}</div>` : ''}
              </div>
            </div>`).join('')}
      </div>`;
  }
};
