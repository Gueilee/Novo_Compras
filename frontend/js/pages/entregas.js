/* ── ENTREGAS PAGE (Confirmação de Recebimento) ──────────────
   Gerencia o fluxo pós-PO: Aguardando Entrega → Recebido → Conciliação
   ─────────────────────────────────────────────────────────── */
window.Pages = window.Pages || {};

window.Pages.entregas = {
  title: 'Confirmação de Entrega',
  subtitle: 'Confirme o recebimento antes da conciliação fiscal',
  icon: 'fa-truck-ramp-box',
  _data: null,
  _tab: 'pendentes',
  _busca: '',
  _unidade: '',

  render() {
    return `
    <div class="page-fade-in">

      <!-- ── Header ──────────────────────────────────────────── -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Confirmação de Entrega</h1>
          <p class="page-subtitle">Confirme o recebimento de produtos e serviços antes da conciliação da Nota Fiscal</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-ghost btn-sm" onclick="Pages.entregas.carregarDados()">
            <i class="fa-solid fa-rotate-right"></i> Atualizar
          </button>
          <span class="badge badge-brand" style="padding:6px 14px;font-size:12px;">
            <i class="fa-solid fa-truck-ramp-box"></i>&nbsp; Pós-Compra
          </span>
        </div>
      </div>

      <!-- ── Pipeline visual ─────────────────────────────────── -->
      <div style="display:flex;align-items:stretch;gap:0;margin-bottom:24px;">

        <div style="flex:1;background:#fff;border:1px solid var(--border);border-radius:var(--r-md);
                    padding:14px 18px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:var(--brand-surface);border-radius:10px;
               display:flex;align-items:center;justify-content:center;color:var(--brand);flex-shrink:0;">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);">Etapa Anterior</div>
            <div style="font-size:13px;font-weight:600;color:var(--text);">PO Emitida</div>
            <div style="font-size:11px;color:var(--text-muted);">Fornecedor selecionado</div>
          </div>
        </div>

        <div style="width:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-chevron-right" style="color:var(--border);font-size:14px;"></i>
        </div>

        <div style="flex:1;background:#fff;border:2px solid var(--warning);border-radius:var(--r-md);
                    padding:14px 18px;display:flex;align-items:center;gap:12px;
                    box-shadow:0 0 0 3px var(--warning-surface);">
          <div style="width:36px;height:36px;background:var(--warning-surface);border-radius:10px;
               display:flex;align-items:center;justify-content:center;color:var(--warning-dark);flex-shrink:0;">
            <i class="fa-solid fa-truck-ramp-box"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--warning-dark);">● Etapa Atual</div>
            <div style="font-size:13px;font-weight:700;color:var(--text);">Ag. Entrega</div>
            <div style="font-size:11px;color:var(--text-muted);">Confirme o recebimento físico</div>
          </div>
        </div>

        <div style="width:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-chevron-right" style="color:var(--border);font-size:14px;"></i>
        </div>

        <div style="flex:1;background:#fff;border:1px solid var(--border);border-radius:var(--r-md);
                    padding:14px 18px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:var(--success-surface);border-radius:10px;
               display:flex;align-items:center;justify-content:center;color:var(--success-dark);flex-shrink:0;">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:var(--success-dark);">Próximo</div>
            <div style="font-size:13px;font-weight:600;color:var(--text);">Recebido</div>
            <div style="font-size:11px;color:var(--text-muted);">Aguardando conciliação</div>
          </div>
        </div>

        <div style="width:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-chevron-right" style="color:var(--border);font-size:14px;"></i>
        </div>

        <div style="flex:1;background:var(--brand);border:1px solid var(--brand);border-radius:var(--r-md);
                    padding:14px 18px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:10px;
               display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:rgba(255,255,255,.7);">Final</div>
            <div style="font-size:13px;font-weight:600;color:#fff;">Conciliação</div>
            <div style="font-size:11px;color:rgba(255,255,255,.7);">NF conciliada → Concluído</div>
          </div>
        </div>

      </div>

      <!-- ── KPI Cards ────────────────────────────────────────── -->
      <div id="ent-kpis" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
        <div class="card" style="padding:20px;display:flex;align-items:center;gap:14px;">
          <div class="spinner" style="width:22px;height:22px;flex-shrink:0;"></div>
          <span style="font-size:13px;color:var(--text-muted);">Carregando...</span>
        </div>
        <div class="card" style="padding:20px;"></div>
        <div class="card" style="padding:20px;"></div>
      </div>

      <!-- ── Card com tabs ────────────────────────────────────── -->
      <div class="card" style="padding:0;overflow:hidden;">

        <!-- Tabs header -->
        <div style="display:flex;border-bottom:2px solid var(--border);">
          <button id="ent-tab-pendentes"
                  onclick="Pages.entregas.setTab('pendentes')"
                  style="flex:1;padding:14px 20px;background:none;border:none;border-bottom:3px solid var(--brand);
                         margin-bottom:-2px;font-size:13px;font-weight:700;color:var(--brand);cursor:pointer;
                         display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;">
            <i class="fa-solid fa-clock"></i>
            Aguardando Entrega
            <span id="ent-badge-pendentes"
                  style="background:var(--warning-surface);color:var(--warning-dark);border-radius:20px;
                         padding:2px 8px;font-size:11px;font-weight:700;">0</span>
          </button>
          <button id="ent-tab-recebidos"
                  onclick="Pages.entregas.setTab('recebidos')"
                  style="flex:1;padding:14px 20px;background:none;border:none;border-bottom:3px solid transparent;
                         margin-bottom:-2px;font-size:13px;font-weight:700;color:var(--text-muted);cursor:pointer;
                         display:flex;align-items:center;justify-content:center;gap:8px;transition:all .15s;">
            <i class="fa-solid fa-box-open"></i>
            Recebidos
            <span id="ent-badge-recebidos"
                  style="background:var(--success-surface);color:var(--success-dark);border-radius:20px;
                         padding:2px 8px;font-size:11px;font-weight:700;">0</span>
          </button>
        </div>

        <!-- Filtros -->
        <div style="padding:10px 20px;border-bottom:1px solid var(--border);display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <div style="flex:1;min-width:180px;position:relative;">
            <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-muted);font-size:12px;pointer-events:none;"></i>
            <input type="text" id="ent-busca" class="form-control" placeholder="Buscar #ID ou fornecedor..."
                   style="padding-left:32px;height:36px;font-size:13px;"
                   oninput="Pages.entregas._onBusca(this.value)">
          </div>
          <select id="ent-unidade" class="form-control" style="height:36px;font-size:13px;width:auto;min-width:160px;"
                  onchange="Pages.entregas._onUnidade(this.value)">
            <option value="">Todas as unidades</option>
          </select>
          <button id="ent-limpar-btn" class="btn btn-ghost btn-sm" style="display:none;color:var(--accent);height:36px;"
                  onclick="Pages.entregas._limparFiltros()">
            <i class="fa-solid fa-xmark"></i> Limpar
          </button>
        </div>

        <!-- List area -->
        <div id="ent-list" style="padding:20px;">
          <div class="loading-center" style="padding:56px;">
            <div class="spinner"></div>
            <span>Carregando entregas...</span>
          </div>
        </div>

      </div>
    </div>`;
  },

  async init() {
    this._busca   = '';
    this._unidade = '';
    await this.carregarDados();
  },

  async carregarDados() {
    try {
      this._data = await Api.get('/api/entregas/pendentes');
      this._renderKPIs();
      this._renderList();
    } catch (e) {
      const el = document.getElementById('ent-list');
      if (el) el.innerHTML = `
        <div style="text-align:center;padding:56px 24px;">
          <div style="width:64px;height:64px;background:var(--accent-surface);border-radius:20px;
               display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:26px;color:var(--accent);"></i>
          </div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;">Erro ao carregar entregas</div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">Verifique a conexão com o banco de dados.</div>
          <button class="btn btn-ghost btn-sm" onclick="Pages.entregas.carregarDados()">
            <i class="fa-solid fa-rotate-right"></i> Tentar novamente
          </button>
        </div>`;
    }
  },

  _renderKPIs() {
    const all       = this._data || [];
    const pendentes = all.filter(r => r.status === 'Aguardando Entrega');
    const recebidos = all.filter(r => r.status === 'Recebido');
    const valorTransito = pendentes.reduce((s, r) => s + (r.valor_fechado || 0), 0);

    const bp = document.getElementById('ent-badge-pendentes');
    const br = document.getElementById('ent-badge-recebidos');
    if (bp) bp.textContent = pendentes.length;
    if (br) br.textContent = recebidos.length;

    // Popula select de unidades com base nos dados carregados
    const unidades = [...new Set((this._data || []).map(r => r.unidade).filter(Boolean))].sort();
    const sel = document.getElementById('ent-unidade');
    if (sel && unidades.length) {
      const prev = sel.value;
      sel.innerHTML = '<option value="">Todas as unidades</option>' +
        unidades.map(u => `<option value="${u}" ${u === prev ? 'selected' : ''}>${u}</option>`).join('');
    }

    const el = document.getElementById('ent-kpis');
    if (!el) return;
    el.innerHTML = `
      <div class="card" style="padding:20px;display:flex;align-items:center;gap:16px;">
        <div style="width:48px;height:48px;background:var(--warning-surface);border-radius:14px;
             display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid fa-clock" style="color:var(--warning-dark);font-size:20px;"></i>
        </div>
        <div>
          <div style="font-size:28px;font-weight:800;color:var(--text);line-height:1;">${pendentes.length}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Aguardando Entrega</div>
        </div>
      </div>
      <div class="card" style="padding:20px;display:flex;align-items:center;gap:16px;">
        <div style="width:48px;height:48px;background:var(--success-surface);border-radius:14px;
             display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid fa-box-open" style="color:var(--success-dark);font-size:20px;"></i>
        </div>
        <div>
          <div style="font-size:28px;font-weight:800;color:var(--text);line-height:1;">${recebidos.length}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Recebidos — Ag. Conciliação</div>
        </div>
      </div>
      <div class="card" style="padding:20px;display:flex;align-items:center;gap:16px;">
        <div style="width:48px;height:48px;background:var(--brand-surface);border-radius:14px;
             display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid fa-sack-dollar" style="color:var(--brand);font-size:20px;"></i>
        </div>
        <div>
          <div style="font-size:22px;font-weight:800;color:var(--text);line-height:1;">${Fmt.currency(valorTransito)}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Valor em Trânsito</div>
        </div>
      </div>`;
  },

  setTab(tab) {
    this._tab = tab;

    const tabPend = document.getElementById('ent-tab-pendentes');
    const tabRec  = document.getElementById('ent-tab-recebidos');
    if (tabPend) {
      tabPend.style.borderBottom = tab === 'pendentes' ? '3px solid var(--brand)' : '3px solid transparent';
      tabPend.style.color = tab === 'pendentes' ? 'var(--brand)' : 'var(--text-muted)';
    }
    if (tabRec) {
      tabRec.style.borderBottom = tab === 'recebidos' ? '3px solid var(--brand)' : '3px solid transparent';
      tabRec.style.color = tab === 'recebidos' ? 'var(--brand)' : 'var(--text-muted)';
    }

    this._renderList();
  },

  _renderList() {
    const el = document.getElementById('ent-list');
    if (!el) return;

    const b = this._busca.toLowerCase();
    const items = (this._data || []).filter(r => {
      if (this._tab === 'pendentes' ? r.status !== 'Aguardando Entrega' : r.status !== 'Recebido') return false;
      if (b && !`#${r.id} ${r.fornecedor || ''} ${r.itens_preview || ''}`.toLowerCase().includes(b)) return false;
      if (this._unidade && r.unidade !== this._unidade) return false;
      return true;
    });

    if (items.length === 0) {
      el.innerHTML = `
        <div style="text-align:center;padding:56px 24px;">
          <div style="width:72px;height:72px;background:var(--surface);border-radius:22px;
               display:flex;align-items:center;justify-content:center;margin:0 auto 18px;
               border:2px dashed var(--border);">
            <i class="fa-solid ${this._tab === 'pendentes' ? 'fa-truck-ramp-box' : 'fa-box-open'}"
               style="font-size:28px;color:var(--text-subtle);"></i>
          </div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px;">
            ${this._tab === 'pendentes' ? 'Nenhuma entrega pendente' : 'Nenhum item aguardando conciliação'}
          </div>
          <div style="font-size:13px;color:var(--text-muted);max-width:380px;margin:0 auto;">
            ${this._tab === 'pendentes'
              ? 'Quando uma PO for emitida e selecionado o fornecedor, as requisições aparecerão aqui para confirmação do recebimento físico.'
              : 'Itens confirmados como recebidos ficam aqui até que a conciliação com a Nota Fiscal seja realizada.'}
          </div>
        </div>`;
      return;
    }

    el.innerHTML = `<div style="display:grid;gap:12px;">${items.map(r => this._cardHtml(r)).join('')}</div>`;
  },

  _cardHtml(r) {
    const isPend     = r.status === 'Aguardando Entrega';
    const borderCol  = isPend ? 'var(--warning)' : 'var(--success)';
    const tagBg      = isPend ? 'var(--warning-surface)' : 'var(--success-surface)';
    const tagColor   = isPend ? 'var(--warning-dark)' : 'var(--success-dark)';
    const tagIcon    = isPend ? 'fa-clock' : 'fa-box-open';
    const tagText    = isPend ? 'Aguardando Entrega' : 'Recebido';

    return `
      <div style="background:#fff;border:1px solid var(--border);border-left:4px solid ${borderCol};
                  border-radius:12px;padding:18px 20px;transition:box-shadow .2s;"
           onmouseover="this.style.boxShadow='0 4px 20px rgba(0,0,0,.08)'"
           onmouseout="this.style.boxShadow='none'">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;">

          <!-- Left: info -->
          <div style="flex:1;min-width:0;">
            <!-- Title row -->
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
              <span style="font-size:16px;font-weight:800;color:var(--text);">
                Req. <span style="color:var(--brand);">#${r.id}</span>
              </span>
              <span style="background:${tagBg};color:${tagColor};border-radius:20px;padding:3px 10px;
                           font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:5px;">
                <i class="fa-solid ${tagIcon}" style="font-size:9px;"></i> ${tagText}
              </span>
              <span style="font-size:12px;color:var(--text-muted);display:inline-flex;align-items:center;gap:5px;">
                <i class="fa-solid fa-building" style="font-size:10px;color:var(--text-subtle);"></i>${r.unidade || '—'}
              </span>
            </div>

            <!-- Items preview -->
            ${r.itens_preview ? `
            <div style="font-size:13px;color:var(--text);margin-bottom:10px;
                        background:var(--surface);border-radius:8px;padding:8px 12px;
                        display:flex;align-items:center;gap:8px;">
              <i class="fa-solid fa-list" style="color:var(--text-subtle);flex-shrink:0;font-size:11px;"></i>
              <span>${r.itens_preview}</span>
              ${r.itens_count > 2 ? `<span style="font-size:11px;color:var(--text-muted);">+${r.itens_count - 2} mais</span>` : ''}
            </div>` : ''}

            <!-- Meta row -->
            <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;">
              ${r.fornecedor ? `
              <div style="display:flex;align-items:center;gap:7px;">
                <div style="width:22px;height:22px;background:var(--brand-surface);border-radius:6px;
                     display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                  <i class="fa-solid fa-building-user" style="font-size:9px;color:var(--brand);"></i>
                </div>
                <span style="font-size:12.5px;font-weight:600;color:var(--text);">${r.fornecedor}</span>
              </div>` : ''}
              ${r.valor_fechado ? `
              <div style="display:flex;align-items:center;gap:5px;">
                <i class="fa-solid fa-tag" style="font-size:11px;color:var(--text-subtle);"></i>
                <span style="font-size:13px;font-weight:700;color:var(--text);">${Fmt.currency(r.valor_fechado)}</span>
              </div>` : ''}
              <div style="display:flex;align-items:center;gap:5px;">
                <i class="fa-solid fa-calendar-days" style="font-size:11px;color:var(--text-subtle);"></i>
                <span style="font-size:12px;color:var(--text-muted);">${r.data || '—'}</span>
              </div>
              ${r.comprador ? `
              <div style="display:flex;align-items:center;gap:5px;">
                <i class="fa-solid fa-user-tie" style="font-size:11px;color:var(--text-subtle);"></i>
                <span style="font-size:12px;color:var(--text-muted);">${r.comprador}</span>
              </div>` : ''}
            </div>
          </div>

          <!-- Right: actions -->
          <div style="display:flex;flex-direction:column;gap:8px;flex-shrink:0;align-items:stretch;min-width:168px;">
            ${isPend ? `
            <button class="btn btn-primary btn-sm"
                    style="white-space:nowrap;justify-content:center;"
                    onclick="Pages.entregas.abrirModal(${r.id})">
              <i class="fa-solid fa-check-double"></i>&nbsp; Confirmar Entrega
            </button>
            ` : `
            <button class="btn btn-sm"
                    style="white-space:nowrap;justify-content:center;background:var(--success-dark);
                           border-color:var(--success-dark);color:#fff;"
                    onclick="App.navigate('recebimento')">
              <i class="fa-solid fa-scale-balanced"></i>&nbsp; Conciliar NF
            </button>
            `}
            <button class="btn btn-ghost btn-sm"
                    style="white-space:nowrap;justify-content:center;"
                    onclick="Pages.consulta._targetId=${r.id};App.navigate('consulta')">
              <i class="fa-solid fa-eye"></i>&nbsp; Ver Detalhes
            </button>
          </div>

        </div>
      </div>`;
  },

  _onBusca(val) {
    this._busca = val.trim();
    this._atualizarLimparBtn();
    this._renderList();
  },

  _onUnidade(val) {
    this._unidade = val;
    this._atualizarLimparBtn();
    this._renderList();
  },

  _limparFiltros() {
    this._busca   = '';
    this._unidade = '';
    const bEl = document.getElementById('ent-busca');
    const uEl = document.getElementById('ent-unidade');
    if (bEl) bEl.value = '';
    if (uEl) uEl.value = '';
    this._atualizarLimparBtn();
    this._renderList();
  },

  _atualizarLimparBtn() {
    const btn = document.getElementById('ent-limpar-btn');
    if (btn) btn.style.display = (this._busca || this._unidade) ? '' : 'none';
  },

  abrirModal(id) {
    const req = (this._data || []).find(r => r.id === id);
    if (!req) return;

    // Close any existing modal
    this._fecharModal();

    const today = new Date().toLocaleDateString('pt-BR');

    const wrap = document.createElement('div');
    wrap.id = 'ent-modal-wrap';
    wrap.style.cssText = `position:fixed;inset:0;z-index:10000;display:flex;align-items:center;
      justify-content:center;background:rgba(0,0,0,.5);animation:fpFadeIn .15s ease;padding:16px;`;
    wrap.onclick = (e) => { if (e.target === wrap) this._fecharModal(); };

    wrap.innerHTML = `
      <div style="background:var(--surface-card,#fff);border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.22);
                  width:100%;max-width:520px;overflow:hidden;animation:fpFadeIn .2s ease;">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:14px;padding:20px 24px;
                    border-bottom:1px solid var(--border);">
          <div style="width:44px;height:44px;background:var(--success-surface);border-radius:14px;
               display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid fa-box-open" style="color:var(--success-dark);font-size:20px;"></i>
          </div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:800;color:var(--text);">Confirmar Recebimento</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
              Req. <strong style="color:var(--brand);">#${req.id}</strong> &nbsp;·&nbsp; ${req.unidade || '—'}
            </div>
          </div>
          <button onclick="Pages.entregas._fecharModal()"
                  style="background:none;border:none;color:var(--text-muted);cursor:pointer;
                         font-size:16px;padding:6px;border-radius:8px;line-height:1;"
                  onmouseover="this.style.background='var(--bg)'" onmouseout="this.style.background='none'">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Req summary -->
        <div style="padding:14px 24px;background:var(--brand-surface);border-bottom:1px solid var(--border-subtle);">
          <div style="display:flex;gap:24px;flex-wrap:wrap;">
            ${req.fornecedor ? `
            <div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-subtle);font-weight:700;">Fornecedor</div>
              <div style="font-size:13px;font-weight:600;color:var(--text);margin-top:2px;">${req.fornecedor}</div>
            </div>` : ''}
            ${req.valor_fechado ? `
            <div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-subtle);font-weight:700;">Valor da PO</div>
              <div style="font-size:14px;font-weight:800;color:var(--brand);margin-top:2px;">${Fmt.currency(req.valor_fechado)}</div>
            </div>` : ''}
            ${req.itens_preview ? `
            <div>
              <div style="font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-subtle);font-weight:700;">Itens</div>
              <div style="font-size:12.5px;color:var(--text);margin-top:2px;max-width:200px;">${req.itens_preview}</div>
            </div>` : ''}
          </div>
        </div>

        <!-- Form body -->
        <div style="padding:22px 24px;">

          <div style="margin-bottom:16px;">
            <label style="display:block;font-size:12px;font-weight:700;color:var(--text);margin-bottom:6px;">
              Data de Recebimento
            </label>
            <input type="text" id="ent-modal-data" value="${today}" placeholder="DD/MM/AAAA"
                   style="width:100%;padding:10px 13px;background:var(--surface);border:1.5px solid var(--border);
                          border-radius:9px;font-size:13px;font-family:var(--font);outline:none;color:var(--text);
                          box-sizing:border-box;transition:border-color .15s;"
                   onfocus="this.style.borderColor='var(--brand)'" onblur="this.style.borderColor='var(--border)'">
          </div>

          <div style="margin-bottom:20px;">
            <label style="display:block;font-size:12px;font-weight:700;color:var(--text);margin-bottom:6px;">
              Observações&nbsp;<span style="font-weight:400;color:var(--text-muted);">(opcional)</span>
            </label>
            <textarea id="ent-modal-obs" rows="3"
                      placeholder="Ex: Produtos conferidos, embalagens sem avaria, quantidade conforme pedido..."
                      style="width:100%;padding:10px 13px;background:var(--surface);border:1.5px solid var(--border);
                             border-radius:9px;font-size:13px;font-family:var(--font);outline:none;color:var(--text);
                             resize:vertical;box-sizing:border-box;transition:border-color .15s;"
                      onfocus="this.style.borderColor='var(--brand)'" onblur="this.style.borderColor='var(--border)'"></textarea>
          </div>

          <!-- Warning notice -->
          <div style="display:flex;gap:10px;padding:12px 14px;background:var(--warning-surface);
               border:1px solid #fcd34d;border-radius:9px;margin-bottom:22px;">
            <i class="fa-solid fa-triangle-exclamation" style="color:var(--warning-dark);flex-shrink:0;margin-top:1px;font-size:13px;"></i>
            <span style="font-size:12px;color:var(--text);line-height:1.5;">
              Ao confirmar, a requisição será movida para <strong>Recebido</strong> e ficará disponível
              para conciliação com a Nota Fiscal. Esta ação não pode ser desfeita.
            </span>
          </div>

          <!-- Action buttons -->
          <div style="display:flex;gap:10px;">
            <button class="btn btn-ghost" style="flex:1;" onclick="Pages.entregas._fecharModal()">
              Cancelar
            </button>
            <button class="btn btn-primary" style="flex:2;" id="ent-modal-confirm-btn"
                    onclick="Pages.entregas.confirmarEntrega(${req.id})">
              <i class="fa-solid fa-check-double"></i>&nbsp; Confirmar Recebimento
            </button>
          </div>

        </div>
      </div>`;

    document.body.appendChild(wrap);
  },

  _fecharModal() {
    const wrap = document.getElementById('ent-modal-wrap');
    if (wrap) wrap.remove();
  },

  async confirmarEntrega(id) {
    const btn  = document.getElementById('ent-modal-confirm-btn');
    const obs  = document.getElementById('ent-modal-obs')?.value?.trim() || '';
    const data = document.getElementById('ent-modal-data')?.value?.trim() || '';

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<div class="spinner" style="width:16px;height:16px;display:inline-block;vertical-align:middle;margin-right:8px;"></div> Confirmando...';
    }

    try {
      await Api.post(`/api/entregas/confirmar/${id}`, { obs, data_recebimento: data });
      this._fecharModal();
      Toast.success('Entrega confirmada!', `Req. #${id} movida para "Recebido" — pronta para conciliação.`);
      await this.carregarDados();
    } catch (e) {
      Toast.error('Erro ao confirmar', e.message || 'Verifique a API e tente novamente.');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-check-double"></i>&nbsp; Confirmar Recebimento';
      }
    }
  }
};
