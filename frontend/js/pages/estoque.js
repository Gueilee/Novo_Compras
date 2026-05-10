/* ============================================================
   SHP — CONTROLE DE ESTOQUE  v3
   ============================================================ */
window.Pages = window.Pages || {};

window.Pages.estoque = {
  title: 'Controle de Estoque',
  _itens: [],
  _busca: '',
  _unidades: [],

  render() {
    return `
    <div class="page-fade-in" id="est-root">

      <!-- Header -->
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Controle de Estoque</h1>
          <p class="page-subtitle">Monitore saldos, registre movimentações e gerencie alertas de reposição</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline btn-sm" onclick="Pages.estoque.init()" title="Recarregar">
            <i class="fa-solid fa-rotate-right"></i>
          </button>
          <button class="btn btn-primary" onclick="Pages.estoque._novoItem()">
            <i class="fa-solid fa-plus"></i> Novo Item
          </button>
        </div>
      </div>

      <!-- KPI cards -->
      <div id="est-kpis" style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:24px;">
        <div class="card" style="padding:20px;display:flex;align-items:center;gap:14px;">
          <div class="spinner" style="width:22px;height:22px;flex-shrink:0;"></div>
          <span style="font-size:13px;color:var(--text-muted);">Carregando...</span>
        </div>
        <div class="card" style="padding:20px;"></div>
        <div class="card" style="padding:20px;"></div>
      </div>

      <!-- Filtros -->
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px;">
        <div style="position:relative;flex:1;min-width:200px;">
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:11px;top:50%;
             transform:translateY(-50%);color:var(--text-muted);font-size:12px;pointer-events:none;"></i>
          <input type="text" id="est-busca" placeholder="Buscar item ou segmento..."
                 style="width:100%;height:36px;padding:0 12px 0 34px;background:#fff;
                        border:1px solid var(--border);border-radius:var(--r-md);
                        font-size:13px;font-family:var(--font);outline:none;color:var(--text);
                        box-sizing:border-box;transition:border-color .15s;"
                 oninput="Pages.estoque._onBusca(this.value)"
                 onfocus="this.style.borderColor='var(--brand)'"
                 onblur="this.style.borderColor='var(--border)'">
        </div>
        <div id="est-unidade-wrap"></div>
        <button id="est-limpar-btn" class="btn btn-ghost btn-sm"
                style="display:none;color:var(--accent);height:36px;"
                onclick="Pages.estoque._limparFiltros()">
          <i class="fa-solid fa-xmark"></i> Limpar
        </button>
      </div>

      <!-- Tabela -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div id="est-table-wrap" style="overflow-x:auto;">
          <div style="padding:60px;text-align:center;">
            <div class="spinner" style="width:32px;height:32px;margin:0 auto 12px;"></div>
            <div style="font-size:13px;color:var(--text-muted);">Carregando estoque...</div>
          </div>
        </div>
      </div>

    </div>

    <style>
    .est-table { width:100%; border-collapse:collapse; min-width:760px; }
    .est-table thead th {
      background:var(--surface); padding:11px 16px;
      font-size:10.5px; font-weight:700; text-transform:uppercase;
      letter-spacing:.06em; color:var(--text-muted);
      border-bottom:2px solid var(--border); text-align:left; white-space:nowrap;
    }
    .est-table tbody tr { border-bottom:1px solid var(--border-subtle); transition:background .12s; }
    .est-table tbody tr:last-child { border-bottom:none; }
    .est-table tbody tr:hover { background:var(--brand-surface); }
    .est-table td { padding:13px 16px; font-size:13px; color:var(--text); vertical-align:middle; }

    /* Stock level pills */
    .est-pill {
      display:inline-flex; align-items:center; gap:5px;
      padding:3px 10px; border-radius:20px; font-size:12px; font-weight:700; white-space:nowrap;
    }
    .est-pill-ok    { background:var(--success-surface); color:var(--success-deeper,#007a4d); }
    .est-pill-low   { background:var(--warning-surface); color:var(--warning-dark); }
    .est-pill-zero  { background:var(--accent-surface); color:var(--accent); }

    /* Progress bar */
    .est-bar-track { height:6px; background:var(--border); border-radius:4px; overflow:hidden; min-width:80px; }
    .est-bar-fill  { height:100%; border-radius:4px; transition:width .3s; }

    /* Action buttons */
    .est-act-btn {
      width:32px; height:32px; border-radius:8px; border:1px solid var(--border);
      background:#fff; cursor:pointer; display:inline-flex; align-items:center;
      justify-content:center; font-size:12px; transition:all .15s; margin-left:3px;
    }
    .est-act-btn:hover { transform:translateY(-1px); box-shadow:0 2px 8px rgba(0,0,0,.1); }
    .est-act-entrada { color:var(--success-deeper,#007a4d); }
    .est-act-entrada:hover { background:var(--success-surface); border-color:var(--success-dark); }
    .est-act-saida   { color:var(--warning-dark); }
    .est-act-saida:hover   { background:var(--warning-surface); border-color:var(--warning-dark); }
    .est-act-hist    { color:var(--brand); }
    .est-act-hist:hover    { background:var(--brand-surface); border-color:var(--brand); }
    .est-act-edit    { color:var(--text-muted); }
    .est-act-edit:hover    { background:var(--surface); border-color:var(--text-muted); color:var(--text); }
    .est-act-del     { color:var(--accent); }
    .est-act-del:hover     { background:var(--accent-surface); border-color:var(--accent); }

    /* ── Drawer / modal (self-contained — não depende de configuracoes.js) ── */
    .cfg-backdrop {
      position:fixed; inset:0; background:rgba(0,0,0,.4);
      backdrop-filter:blur(2px); z-index:2000;
      display:flex; justify-content:flex-end;
      animation:estFadeIn .2s ease;
    }
    @keyframes estFadeIn  { from{opacity:0} to{opacity:1} }
    @keyframes estSlideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

    .cfg-drawer {
      height:100vh; background:#fff; display:flex; flex-direction:column;
      box-shadow:-8px 0 40px rgba(0,0,0,.18);
      animation:estSlideIn .22s ease; overflow:hidden;
    }
    .cfg-drw-hdr {
      padding:20px 24px 16px; border-bottom:1px solid var(--border);
      display:flex; align-items:center; justify-content:space-between;
      flex-shrink:0; background:#fff;
    }
    .cfg-drw-title { font-size:16px; font-weight:800; color:var(--text); }
    .cfg-drw-close {
      width:32px; height:32px; border-radius:8px; border:1px solid var(--border);
      background:none; cursor:pointer; display:flex; align-items:center;
      justify-content:center; color:var(--text-muted); font-size:14px;
      transition:background .15s; flex-shrink:0;
    }
    .cfg-drw-close:hover { background:var(--bg); color:var(--accent); }
    .cfg-drw-body {
      flex:1; overflow-y:auto; padding:20px 24px;
      display:flex; flex-direction:column; gap:14px;
    }
    .cfg-drw-footer {
      padding:16px 24px; border-top:1px solid var(--border);
      display:flex; gap:10px; background:#fff; flex-shrink:0;
    }
    .cfg-drw-footer .btn { flex:1; justify-content:center; }
    </style>`;
  },

  /* ── init ──────────────────────────────────────────────────── */
  async init() {
    this._busca    = '';
    this._unidades = [];
    const bEl = document.getElementById('est-busca');
    if (bEl) bEl.value = '';
    try {
      this._itens = await Api.get('/api/estoque');
      this._populateFilters();
      this._renderKPIs();
      this._renderTabela();
    } catch {
      const w = document.getElementById('est-table-wrap');
      if (w) w.innerHTML = `
        <div style="padding:60px;text-align:center;">
          <div style="width:64px;height:64px;background:var(--accent-surface);border-radius:20px;
               display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:26px;color:var(--accent);"></i>
          </div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;">Erro ao carregar estoque</div>
          <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">Verifique a conexão com o banco de dados.</div>
          <button class="btn btn-ghost btn-sm" onclick="Pages.estoque.init()">
            <i class="fa-solid fa-rotate-right"></i> Tentar novamente
          </button>
        </div>`;
    }
  },

  /* ── KPI cards ─────────────────────────────────────────────── */
  _renderKPIs() {
    const itens = this._itens;
    const total   = itens.length;
    const zeros   = itens.filter(i => (+i.saldo_atual) <= 0).length;
    const baixos  = itens.filter(i => (+i.saldo_atual) > 0 && i.estoque_minimo > 0 && (+i.saldo_atual) <= (+i.estoque_minimo)).length;
    const ok      = total - zeros - baixos;

    const el = document.getElementById('est-kpis');
    if (!el) return;
    el.innerHTML = `
      <div class="card" style="padding:20px;display:flex;align-items:center;gap:16px;">
        <div style="width:48px;height:48px;background:var(--brand-surface);border-radius:14px;
             display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid fa-warehouse" style="font-size:20px;color:var(--brand);"></i>
        </div>
        <div>
          <div style="font-size:28px;font-weight:800;color:var(--text);line-height:1;">${total}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Itens cadastrados</div>
        </div>
        ${ok > 0 ? `<div style="margin-left:auto;text-align:right;">
          <div style="font-size:12px;font-weight:700;color:var(--success-deeper,#007a4d);">
            <i class="fa-solid fa-circle-check" style="margin-right:4px;"></i>${ok} OK
          </div>
        </div>` : ''}
      </div>
      <div class="card" style="padding:20px;display:flex;align-items:center;gap:16px;">
        <div style="width:48px;height:48px;background:var(--warning-surface);border-radius:14px;
             display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:20px;color:var(--warning-dark);"></i>
        </div>
        <div>
          <div style="font-size:28px;font-weight:800;color:var(--text);line-height:1;">${baixos}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Abaixo do mínimo</div>
        </div>
      </div>
      <div class="card" style="padding:20px;display:flex;align-items:center;gap:16px;">
        <div style="width:48px;height:48px;background:var(--accent-surface);border-radius:14px;
             display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid fa-circle-exclamation" style="font-size:20px;color:var(--accent);"></i>
        </div>
        <div>
          <div style="font-size:28px;font-weight:800;color:var(--text);line-height:1;">${zeros}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Estoque zerado</div>
        </div>
      </div>`;
  },

  /* ── Populate filters ──────────────────────────────────────── */
  _populateFilters() {
    const unidades = [...new Set(this._itens.map(i => i.unidade_operacional).filter(Boolean))].sort();
    const wrap = document.getElementById('est-unidade-wrap');
    if (wrap) {
      wrap.innerHTML = msHtml('est-ms-unidade', unidades, this._unidades, 'Unidade',
        "Pages.estoque._toggleUnidade(");
    }
  },

  /* ── Render table ──────────────────────────────────────────── */
  _renderTabela() {
    const wrap = document.getElementById('est-table-wrap');
    if (!wrap) return;

    const b = this._busca.toLowerCase();
    const itens = this._itens.filter(i => {
      if (b && !`${i.descricao||''} ${i.segmento||''}`.toLowerCase().includes(b)) return false;
      if (this._unidades.length && !this._unidades.includes(i.unidade_operacional)) return false;
      return true;
    });

    if (!itens.length) {
      wrap.innerHTML = `
        <div style="padding:60px;text-align:center;">
          <div style="width:72px;height:72px;background:var(--surface);border-radius:22px;
               display:flex;align-items:center;justify-content:center;margin:0 auto 18px;
               border:2px dashed var(--border);">
            <i class="fa-solid fa-warehouse" style="font-size:28px;color:var(--text-subtle);"></i>
          </div>
          <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:8px;">
            ${this._busca || this._unidades.length ? 'Nenhum item encontrado' : 'Nenhum item cadastrado'}
          </div>
          <div style="font-size:13px;color:var(--text-muted);max-width:360px;margin:0 auto;">
            ${this._busca || this._unidades.length
              ? 'Ajuste os filtros para encontrar itens.'
              : 'Clique em "Novo Item" para cadastrar o primeiro item do estoque.'}
          </div>
        </div>`;
      return;
    }

    const rows = itens.map(item => {
      const saldo = +item.saldo_atual;
      const min   = +(item.estoque_minimo || 0);
      const um    = item.unidade_medida || 'un';

      let pillClass = 'est-pill-ok';
      let pillIcon  = 'fa-circle-check';
      let pillLabel = 'OK';
      if (saldo <= 0) { pillClass = 'est-pill-zero'; pillIcon = 'fa-circle-exclamation'; pillLabel = 'Zerado'; }
      else if (min > 0 && saldo <= min) { pillClass = 'est-pill-low'; pillIcon = 'fa-triangle-exclamation'; pillLabel = 'Baixo'; }

      // Progress bar
      let barPct = 100, barColor = 'var(--success-dark)';
      if (min > 0) {
        barPct = Math.min(100, Math.round((saldo / min) * 100));
        barColor = saldo <= 0 ? 'var(--accent)' : saldo <= min ? 'var(--warning-dark)' : 'var(--success-dark)';
      }

      const saldoFmt = saldo.toFixed(3).replace(/\.?0+$/, '');
      const minFmt   = min > 0 ? min.toFixed(3).replace(/\.?0+$/, '') : null;
      const descEsc  = item.descricao.replace(/'/g, "\\'");

      return `
        <tr id="est-row-${item.id}">
          <td>
            <div style="font-weight:600;color:var(--text);margin-bottom:2px;">${item.descricao}</div>
            ${item.segmento ? `<div style="font-size:11px;color:var(--text-muted);">${item.segmento}</div>` : ''}
          </td>
          <td>
            ${item.unidade_operacional
              ? `<span class="badge badge-gray" style="font-size:11px;">${item.unidade_operacional}</span>`
              : '<span style="color:var(--text-subtle);font-size:12px;">—</span>'}
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="est-pill ${pillClass}">
                <i class="fa-solid ${pillIcon}" style="font-size:10px;"></i>${pillLabel}
              </span>
              <div>
                <div style="font-size:14px;font-weight:700;color:var(--text);">${saldoFmt} <span style="font-size:11px;font-weight:400;color:var(--text-muted);">${um}</span></div>
                ${minFmt ? `<div style="font-size:11px;color:var(--text-subtle);">mín: ${minFmt} ${um}</div>` : ''}
              </div>
            </div>
          </td>
          <td style="min-width:100px;">
            ${min > 0 ? `
            <div class="est-bar-track">
              <div class="est-bar-fill" style="width:${barPct}%;background:${barColor};"></div>
            </div>
            <div style="font-size:10px;color:var(--text-subtle);margin-top:2px;">${barPct}% do mín.</div>` : `
            <span style="font-size:12px;color:var(--text-subtle);">Sem mínimo</span>`}
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <button class="est-act-btn est-act-entrada" title="Registrar Entrada"
                    onclick="Pages.estoque._movDrawer(${item.id},'${descEsc}','${um}','entrada')">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
            <button class="est-act-btn est-act-saida" title="Registrar Saída"
                    onclick="Pages.estoque._movDrawer(${item.id},'${descEsc}','${um}','saida')">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button class="est-act-btn est-act-hist" title="Histórico"
                    onclick="Pages.estoque._histDrawer(${item.id},'${descEsc}')">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="est-act-btn est-act-edit" title="Editar"
                    onclick="Pages.estoque._editDrawer(${item.id})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="est-act-btn est-act-del" title="Excluir"
                    onclick="Pages.estoque._delItem(${item.id},'${descEsc}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>`;
    }).join('');

    wrap.innerHTML = `
      <table class="est-table">
        <thead>
          <tr>
            <th>Item / Segmento</th>
            <th>Unidade Operacional</th>
            <th>Saldo Atual</th>
            <th>Nível</th>
            <th style="text-align:right;padding-right:20px;">Ações</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  /* ── Filter handlers ───────────────────────────────────────── */
  _onBusca(v) {
    this._busca = v.toLowerCase();
    this._atualizarLimparBtn();
    this._renderTabela();
  },

  _toggleUnidade(val, checked) {
    if (checked) { if (!this._unidades.includes(val)) this._unidades.push(val); }
    else { const i = this._unidades.indexOf(val); if (i > -1) this._unidades.splice(i, 1); }

    const n = this._unidades.length;
    const lbl = n === 0 ? 'Unidade' : n === 1 ? this._unidades[0] : `${n} selecionados`;
    const wrap = document.getElementById('est-ms-unidade');
    if (wrap) {
      const lblEl = wrap.querySelector('.ms-lbl');
      if (lblEl) lblEl.textContent = lbl;
      wrap.classList.toggle('ms-has-val', n > 0);
    }
    this._atualizarLimparBtn();
    this._renderTabela();
  },

  _limparFiltros() {
    this._busca    = '';
    this._unidades = [];
    const bEl = document.getElementById('est-busca');
    if (bEl) bEl.value = '';
    this._populateFilters();
    this._atualizarLimparBtn();
    this._renderTabela();
  },

  _atualizarLimparBtn() {
    const btn = document.getElementById('est-limpar-btn');
    if (btn) btn.style.display = (this._busca || this._unidades.length) ? '' : 'none';
  },

  /* ── Novo item ─────────────────────────────────────────────── */
  _novoItem() { this._editDrawer(null); },

  _editDrawer(id) {
    const item   = id ? this._itens.find(i => i.id === id) : null;
    const isEdit = !!item;
    const opts   = (window.Pages.configuracoes?._opts?.unidades || []);
    const unidOpts = ['', ...opts].map(v =>
      `<option value="${v}" ${item?.unidade_operacional === v ? 'selected' : ''}>${v || 'Selecione...'}</option>`
    ).join('');

    const root = document.createElement('div');
    root.id = 'est-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="est-backdrop">
        <div class="cfg-drawer" style="width:440px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">${isEdit ? 'Editar Item' : 'Novo Item de Estoque'}</div>
            <button class="cfg-drw-close" id="est-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body">
            <div class="form-group">
              <label class="form-label form-label-required">Descrição do Item</label>
              <input class="form-control" id="estdrw-desc" type="text" placeholder="Ex: Papel A4 500fls"
                     value="${item?.descricao || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Segmento</label>
              <input class="form-control" id="estdrw-seg" type="text" placeholder="Ex: Material de Escritório"
                     value="${item?.segmento || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Unidade Operacional</label>
              <select class="form-control" id="estdrw-unidade">${unidOpts}</select>
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
              <div class="form-group">
                <label class="form-label">Unidade de Medida</label>
                <input class="form-control" id="estdrw-um" type="text" placeholder="un, kg, cx..."
                       value="${item?.unidade_medida || 'un'}">
              </div>
              <div class="form-group">
                <label class="form-label">Estoque Mínimo</label>
                <input class="form-control" id="estdrw-min" type="number" min="0" step="0.001" placeholder="0"
                       value="${item?.estoque_minimo ?? 0}">
              </div>
            </div>
            ${isEdit ? `
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:4px;">Saldo Atual</div>
              <div style="font-size:22px;font-weight:800;color:var(--text);">${(+item.saldo_atual).toFixed(3).replace(/\.?0+$/,'')} <span style="font-size:13px;font-weight:400;color:var(--text-muted);">${item.unidade_medida||'un'}</span></div>
            </div>` : ''}
          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="estdrw-cancel">Cancelar</button>
            <button class="btn btn-primary" id="estdrw-save">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar' : 'Criar Item'}
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const close = () => root.remove();
    document.getElementById('est-drw-close').addEventListener('click', close);
    document.getElementById('estdrw-cancel').addEventListener('click', close);
    document.getElementById('est-backdrop').addEventListener('click', e => { if (e.target.id === 'est-backdrop') close(); });
    setTimeout(() => document.getElementById('estdrw-desc')?.focus(), 80);

    document.getElementById('estdrw-save').addEventListener('click', async () => {
      const desc = document.getElementById('estdrw-desc').value.trim();
      if (!desc) { Toast.warning('Campo obrigatório', 'Informe a descrição do item.'); return; }
      const payload = {
        descricao: desc,
        segmento: document.getElementById('estdrw-seg').value.trim() || null,
        unidade_operacional: document.getElementById('estdrw-unidade').value || null,
        unidade_medida: document.getElementById('estdrw-um').value.trim() || 'un',
        estoque_minimo: parseFloat(document.getElementById('estdrw-min').value) || 0,
      };
      const btn = document.getElementById('estdrw-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        if (isEdit) {
          await Api.patch(`/api/estoque/${item.id}`, payload);
          Toast.success('Item atualizado!', desc);
        } else {
          await Api.post('/api/estoque/entrada', { ...payload, quantidade: 0 });
          Toast.success('Item criado!', desc);
        }
        close();
        this.init();
      } catch (err) {
        Toast.error('Erro ao salvar item', err.message || '');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar' : 'Criar Item'}`;
      }
    });
  },

  /* ── Movimento (entrada / saída) ───────────────────────────── */
  _movDrawer(itemId, descricao, um, tipo) {
    const isEntrada = tipo === 'entrada';
    const cor   = isEntrada ? 'var(--success-deeper,#007a4d)' : 'var(--warning-dark)';
    const icon  = isEntrada ? 'fa-arrow-down' : 'fa-arrow-up';
    const label = isEntrada ? 'Registrar Entrada' : 'Registrar Saída';

    const root = document.createElement('div');
    root.id = 'est-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="est-backdrop">
        <div class="cfg-drawer" style="width:420px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title" style="color:${cor};">
              <i class="fa-solid ${icon}" style="margin-right:8px;"></i>${label}
            </div>
            <button class="cfg-drw-close" id="est-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body">
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);
                        padding:12px 16px;margin-bottom:4px;">
              <div style="font-size:11px;color:var(--text-muted);margin-bottom:2px;">Item</div>
              <div style="font-weight:700;color:var(--text);">${descricao}</div>
            </div>
            <div class="form-group">
              <label class="form-label form-label-required">Quantidade (${um})</label>
              <input class="form-control" id="movdrw-qtd" type="number" min="0.001" step="0.001"
                     placeholder="0" style="font-size:18px;font-weight:700;height:48px;">
            </div>
            ${isEntrada ? `
            <div class="form-group">
              <label class="form-label">Fornecedor</label>
              <input class="form-control" id="movdrw-forn" type="text" placeholder="Nome do fornecedor (opcional)">
            </div>
            <div class="form-group">
              <label class="form-label">Valor Unitário (R$)</label>
              <input class="form-control" id="movdrw-valor" type="number" min="0" step="0.01" placeholder="0,00">
            </div>` : ''}
            <div class="form-group">
              <label class="form-label">Observações</label>
              <textarea class="form-control" id="movdrw-obs" rows="2"
                        placeholder="Motivo, referência, NF..." style="resize:vertical;min-height:70px;"></textarea>
            </div>
          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="movdrw-cancel">Cancelar</button>
            <button class="btn btn-primary" id="movdrw-save" style="background:${cor};border-color:${cor};">
              <i class="fa-solid fa-floppy-disk"></i> Confirmar
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const close = () => root.remove();
    document.getElementById('est-drw-close').addEventListener('click', close);
    document.getElementById('movdrw-cancel').addEventListener('click', close);
    document.getElementById('est-backdrop').addEventListener('click', e => { if (e.target.id === 'est-backdrop') close(); });
    setTimeout(() => document.getElementById('movdrw-qtd')?.focus(), 80);

    document.getElementById('movdrw-save').addEventListener('click', async () => {
      const qtd = parseFloat(document.getElementById('movdrw-qtd').value);
      if (!qtd || qtd <= 0) { Toast.warning('Campo obrigatório', 'Informe uma quantidade válida.'); return; }
      const btn = document.getElementById('movdrw-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        const payload = {
          id_item: itemId, quantidade: qtd,
          observacoes: document.getElementById('movdrw-obs')?.value.trim() || null,
          registrado_por: localStorage.getItem('shp_user_email') || null,
        };
        if (isEntrada) {
          payload.fornecedor    = document.getElementById('movdrw-forn')?.value.trim() || null;
          payload.valor_unitario = parseFloat(document.getElementById('movdrw-valor')?.value) || null;
          await Api.post('/api/estoque/entrada', payload);
        } else {
          await Api.post('/api/estoque/saida', payload);
        }
        Toast.success(`${isEntrada ? 'Entrada' : 'Saída'} registrada!`, `${qtd} ${um} · ${descricao}`);
        close();
        this.init();
      } catch (err) {
        Toast.error(`Erro ao registrar ${isEntrada ? 'entrada' : 'saída'}`, err.message || '');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Confirmar';
      }
    });
  },

  /* ── Ajuste manual de saldo ────────────────────────────────── */
  async _ajusteDrawer(itemId) {
    const item = this._itens.find(i => i.id === itemId);
    if (!item) return;
    const root = document.createElement('div');
    root.id = 'est-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="est-backdrop">
        <div class="cfg-drawer" style="width:380px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title"><i class="fa-solid fa-sliders" style="margin-right:8px;"></i>Ajuste de Saldo</div>
            <button class="cfg-drw-close" id="est-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body">
            <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 16px;margin-bottom:4px;">
              <div style="font-size:11px;color:var(--text-muted);">Item</div>
              <div style="font-weight:700;">${item.descricao}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">Saldo atual: <strong>${(+item.saldo_atual).toFixed(3).replace(/\.?0+$/,'')} ${item.unidade_medida||'un'}</strong></div>
            </div>
            <div class="form-group">
              <label class="form-label form-label-required">Novo Saldo (${item.unidade_medida||'un'})</label>
              <input class="form-control" id="ajdrw-saldo" type="number" min="0" step="0.001"
                     value="${+item.saldo_atual}" style="font-size:18px;font-weight:700;height:48px;">
            </div>
            <div class="form-group">
              <label class="form-label">Motivo do Ajuste</label>
              <textarea class="form-control" id="ajdrw-obs" rows="2" style="resize:vertical;"
                        placeholder="Ex: Contagem física, perda, transferência..."></textarea>
            </div>
          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="ajdrw-cancel">Cancelar</button>
            <button class="btn btn-primary" id="ajdrw-save"><i class="fa-solid fa-check"></i> Aplicar Ajuste</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const close = () => root.remove();
    document.getElementById('est-drw-close').addEventListener('click', close);
    document.getElementById('ajdrw-cancel').addEventListener('click', close);
    document.getElementById('est-backdrop').addEventListener('click', e => { if (e.target.id === 'est-backdrop') close(); });
    setTimeout(() => { const inp = document.getElementById('ajdrw-saldo'); if(inp){inp.focus();inp.select();} }, 80);

    document.getElementById('ajdrw-save').addEventListener('click', async () => {
      const novoSaldo = parseFloat(document.getElementById('ajdrw-saldo').value);
      if (isNaN(novoSaldo) || novoSaldo < 0) { Toast.warning('Valor inválido', 'O saldo não pode ser negativo.'); return; }
      const btn = document.getElementById('ajdrw-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        await Api.post('/api/estoque/ajuste', {
          id_item: itemId, saldo_novo: novoSaldo,
          observacoes: document.getElementById('ajdrw-obs').value.trim() || null,
          registrado_por: localStorage.getItem('shp_user_email') || null,
        });
        Toast.success('Saldo ajustado!', `${item.descricao} → ${novoSaldo} ${item.unidade_medida||'un'}`);
        close();
        this.init();
      } catch (err) {
        Toast.error('Erro ao ajustar saldo', err.message || '');
        btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i> Aplicar Ajuste';
      }
    });
  },

  /* ── Histórico ─────────────────────────────────────────────── */
  async _histDrawer(itemId, descricao) {
    const root = document.createElement('div');
    root.id = 'est-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="est-backdrop">
        <div class="cfg-drawer" style="width:520px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">
              <i class="fa-solid fa-clock-rotate-left" style="margin-right:8px;color:var(--brand);"></i>Histórico de Movimentações
            </div>
            <button class="cfg-drw-close" id="est-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div style="padding:8px 20px 4px;font-size:12.5px;font-weight:600;color:var(--text-muted);">${descricao}</div>
          <div class="cfg-drw-body" id="hist-body">
            <div style="text-align:center;padding:40px;"><div class="spinner"></div></div>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const close = () => root.remove();
    document.getElementById('est-drw-close').addEventListener('click', close);
    document.getElementById('est-backdrop').addEventListener('click', e => { if (e.target.id === 'est-backdrop') close(); });

    try {
      const movs = await Api.get(`/api/estoque/${itemId}/movimentacoes`);
      const body = document.getElementById('hist-body');
      if (!movs.length) {
        body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);">
          <i class="fa-solid fa-inbox" style="font-size:28px;opacity:.3;display:block;margin-bottom:10px;"></i>
          Nenhuma movimentação registrada.</div>`;
        return;
      }
      const tipoLabel = { entrada:'Entrada', saida:'Saída', ajuste:'Ajuste' };
      const tipoCor   = { entrada:'var(--success-deeper,#007a4d)', saida:'var(--warning-dark)', ajuste:'var(--brand)' };
      const tipoIcon  = { entrada:'fa-arrow-down', saida:'fa-arrow-up', ajuste:'fa-sliders' };
      body.innerHTML = movs.map(m => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-subtle);">
          <div style="width:34px;height:34px;border-radius:10px;
               background:${tipoCor[m.tipo]}15;
               display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid ${tipoIcon[m.tipo]}" style="color:${tipoCor[m.tipo]};font-size:13px;"></i>
          </div>
          <div style="flex:1;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:700;color:${tipoCor[m.tipo]};font-size:12.5px;">${tipoLabel[m.tipo]}</span>
              <span style="font-size:11px;color:var(--text-subtle);">${(m.registrado_em||'').replace('T',' ').slice(0,16)}</span>
            </div>
            <div style="font-size:13px;color:var(--text);margin-top:2px;">
              ${m.quantidade > 0 ? '+' : ''}${(+m.quantidade).toFixed(3).replace(/\.?0+$/,'')} un
              → Saldo: <strong>${(+m.saldo_apos).toFixed(3).replace(/\.?0+$/,'')}</strong>
            </div>
            ${m.fornecedor ? `<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;"><i class="fa-solid fa-building" style="font-size:9px;margin-right:3px;"></i>${m.fornecedor}</div>` : ''}
            ${m.observacoes ? `<div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">${m.observacoes}</div>` : ''}
            ${m.registrado_por ? `<div style="font-size:11px;color:var(--text-subtle);margin-top:2px;"><i class="fa-solid fa-user" style="font-size:9px;margin-right:3px;"></i>${m.registrado_por}</div>` : ''}
          </div>
        </div>`).join('');
    } catch {
      document.getElementById('hist-body').innerHTML =
        `<div style="text-align:center;padding:40px;color:var(--accent);">Erro ao carregar histórico</div>`;
    }
  },

  /* ── Excluir item ──────────────────────────────────────────── */
  async _delItem(id, desc) {
    const ok = await Modal.confirm({
      icon: 'danger',
      title: 'Excluir item de estoque?',
      body: `<strong>${desc}</strong> e todo o histórico de movimentações serão removidos permanentemente.`,
      confirmText: 'Excluir', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/estoque/${id}`);
      Toast.success('Item excluído', desc);
      this.init();
    } catch { Toast.error('Erro ao excluir item'); }
  },
};
