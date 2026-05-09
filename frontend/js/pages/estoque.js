/* ============================================================
   SHP — CONTROLE DE ESTOQUE
   ============================================================ */
window.Pages = window.Pages || {};

window.Pages.estoque = {
  title: 'Controle de Estoque',
  _itens: [],
  _busca: '',

  render() {
    return `
    <div class="page-fade-in" id="est-root">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Controle de Estoque</h1>
          <p class="page-subtitle">Gerencie entradas, saídas e saldo atual dos itens</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-primary" onclick="Pages.estoque._novoItem()">
            <i class="fa-solid fa-plus"></i> Novo Item
          </button>
        </div>
      </div>

      <!-- Filtro -->
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:20px;">
        <div style="position:relative;flex:1;max-width:360px;">
          <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-subtle);font-size:12px;pointer-events:none;"></i>
          <input type="text" id="est-busca" placeholder="Buscar item..."
                 style="width:100%;padding:9px 12px 9px 34px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);font-size:13px;font-family:var(--font);outline:none;color:var(--text);"
                 oninput="Pages.estoque._onBusca(this.value)"
                 onfocus="this.style.borderColor='var(--brand)'" onblur="this.style.borderColor='var(--border)'">
        </div>
        <button class="btn btn-outline btn-sm" onclick="Pages.estoque.init()" title="Recarregar">
          <i class="fa-solid fa-rotate-right"></i>
        </button>
      </div>

      <!-- Tabela de itens -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div id="est-table-wrap" style="overflow-x:auto;">
          <div style="padding:50px;text-align:center;"><div class="spinner"></div></div>
        </div>
      </div>
    </div>

    <style>
    .est-table { width:100%;border-collapse:collapse;min-width:780px; }
    .est-table thead th {
      background:var(--bg);padding:10px 16px;font-size:11px;font-weight:700;
      text-transform:uppercase;letter-spacing:.06em;color:var(--text-muted);
      border-bottom:1px solid var(--border);text-align:left;white-space:nowrap;
    }
    .est-table tbody tr { border-bottom:1px solid var(--border-subtle);transition:background .12s; }
    .est-table tbody tr:last-child { border-bottom:none; }
    .est-table tbody tr:hover { background:var(--brand-surface); }
    .est-table td { padding:12px 16px;font-size:13px;color:var(--text);vertical-align:middle; }
    .est-saldo-ok   { color:var(--success-dark);font-weight:700; }
    .est-saldo-low  { color:var(--warning-deeper,#b45309);font-weight:700; }
    .est-saldo-zero { color:var(--accent);font-weight:700; }
    .est-act-btn {
      width:30px;height:30px;border-radius:8px;border:1px solid var(--border);
      background:var(--bg);cursor:pointer;display:inline-flex;align-items:center;
      justify-content:center;font-size:12px;transition:background .15s,border-color .15s,color .15s;
      margin-left:3px;
    }
    .est-act-entrada { color:#01a864; }
    .est-act-entrada:hover { background:rgba(1,225,142,.1);border-color:#01a864; }
    .est-act-saida   { color:var(--warning-deeper,#b45309); }
    .est-act-saida:hover { background:var(--warning-surface);border-color:var(--warning-dark); }
    .est-act-hist    { color:var(--brand); }
    .est-act-hist:hover { background:var(--brand-surface);border-color:var(--brand); }
    .est-act-del     { color:var(--accent); }
    .est-act-del:hover { background:var(--accent-surface);border-color:var(--accent); }
    </style>`;
  },

  async init() {
    this._busca = '';
    const bEl = document.getElementById('est-busca');
    if (bEl) bEl.value = '';
    try {
      this._itens = await Api.get('/api/estoque');
      this._renderTabela();
    } catch {
      const w = document.getElementById('est-table-wrap');
      if (w) w.innerHTML = `<div style="padding:50px;text-align:center;color:var(--accent);">Erro ao carregar estoque</div>`;
    }
  },

  _onBusca(v) {
    this._busca = v.toLowerCase();
    this._renderTabela();
  },

  _renderTabela() {
    const wrap = document.getElementById('est-table-wrap');
    if (!wrap) return;
    const busca = this._busca;
    const itens = busca
      ? this._itens.filter(i => (i.descricao||'').toLowerCase().includes(busca) || (i.segmento||'').toLowerCase().includes(busca))
      : this._itens;

    if (!itens.length) {
      wrap.innerHTML = `<div style="padding:60px;text-align:center;color:var(--text-muted);">
        <i class="fa-solid fa-warehouse" style="font-size:36px;opacity:.25;display:block;margin-bottom:12px;"></i>
        ${this._busca ? 'Nenhum item encontrado.' : 'Nenhum item cadastrado. Clique em "Novo Item" para começar.'}
      </div>`;
      return;
    }

    const rows = itens.map(item => {
      const saldoCls = item.saldo_atual <= 0
        ? 'est-saldo-zero'
        : item.saldo_atual <= (item.estoque_minimo || 0)
          ? 'est-saldo-low'
          : 'est-saldo-ok';
      const alertIcon = item.saldo_atual <= 0
        ? '<i class="fa-solid fa-circle-exclamation" style="color:var(--accent);margin-right:5px;" title="Estoque zerado"></i>'
        : item.saldo_atual <= (item.estoque_minimo || 0) && item.estoque_minimo > 0
          ? '<i class="fa-solid fa-triangle-exclamation" style="color:var(--warning-dark);margin-right:5px;" title="Abaixo do mínimo"></i>'
          : '';
      return `
        <tr id="est-row-${item.id}">
          <td>
            <div style="font-weight:600;color:var(--text);">${item.descricao}</div>
            ${item.segmento ? `<div style="font-size:11px;color:var(--text-muted);">${item.segmento}</div>` : ''}
          </td>
          <td style="font-size:12px;color:var(--text-muted);">${item.unidade_operacional || '—'}</td>
          <td class="${saldoCls}">
            ${alertIcon}${(+item.saldo_atual).toFixed(3).replace(/\.?0+$/,'')} ${item.unidade_medida || 'un'}
          </td>
          <td style="font-size:12px;color:var(--text-muted);">
            ${item.estoque_minimo > 0 ? (+item.estoque_minimo).toFixed(3).replace(/\.?0+$/,'') + ' ' + (item.unidade_medida||'un') : '—'}
          </td>
          <td style="text-align:right;white-space:nowrap;">
            <button class="est-act-btn est-act-entrada" title="Registrar Entrada"
                    onclick="Pages.estoque._movDrawer(${item.id},'${item.descricao.replace(/'/g,'\\'')}','${item.unidade_medida||'un'}','entrada')">
              <i class="fa-solid fa-arrow-down"></i>
            </button>
            <button class="est-act-btn est-act-saida" title="Registrar Saída"
                    onclick="Pages.estoque._movDrawer(${item.id},'${item.descricao.replace(/'/g,'\\'')}','${item.unidade_medida||'un'}','saida')">
              <i class="fa-solid fa-arrow-up"></i>
            </button>
            <button class="est-act-btn est-act-hist" title="Ver Histórico"
                    onclick="Pages.estoque._histDrawer(${item.id},'${item.descricao.replace(/'/g,'\\'')}')">
              <i class="fa-solid fa-clock-rotate-left"></i>
            </button>
            <button class="est-act-btn" style="color:var(--text-muted);" title="Ajuste / Editar"
                    onclick="Pages.estoque._editDrawer(${item.id})">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="est-act-btn est-act-del" title="Excluir item"
                    onclick="Pages.estoque._delItem(${item.id},'${item.descricao.replace(/'/g,'\\'')}')">
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
            <th>Estoque Mínimo</th>
            <th style="text-align:right;padding-right:20px;">Ações</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  /* ── Novo item ────────────────────────────────────────── */
  _novoItem() {
    this._editDrawer(null);
  },

  _editDrawer(id) {
    const item = id ? this._itens.find(i => i.id === id) : null;
    const isEdit = !!item;
    const opts = (window.Pages.configuracoes?._opts?.unidades || []);
    const unidOpts = ['', ...opts].map(v => `<option value="${v}" ${item?.unidade_operacional===v?'selected':''}>${v||'Selecione...'}</option>`).join('');

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
            <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);padding:14px 16px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-muted);margin-bottom:6px;">Saldo Atual</div>
              <div style="font-size:22px;font-weight:800;color:var(--text);">${(+item.saldo_atual).toFixed(3).replace(/\.?0+$/,'')} <span style="font-size:13px;font-weight:400;color:var(--text-muted);">${item.unidade_medida||'un'}</span></div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">Para ajustar o saldo, use o botão de ajuste na tabela.</div>
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

  /* ── Movimento (entrada / saída) drawer ──────────────── */
  _movDrawer(itemId, descricao, um, tipo) {
    const isEntrada = tipo === 'entrada';
    const cor = isEntrada ? '#01a864' : 'var(--warning-deeper,#b45309)';
    const icon = isEntrada ? 'fa-arrow-down' : 'fa-arrow-up';
    const label = isEntrada ? 'Entrada de Estoque' : 'Saída de Estoque';

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
            <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 16px;margin-bottom:4px;">
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
                        placeholder="Motivo, referência, etc."
                        style="resize:vertical;min-height:70px;"></textarea>
            </div>
          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="movdrw-cancel">Cancelar</button>
            <button class="btn btn-primary" id="movdrw-save" style="background:${cor};border-color:${cor};">
              <i class="fa-solid fa-floppy-disk"></i> Registrar ${isEntrada ? 'Entrada' : 'Saída'}
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
          payload.fornecedor = document.getElementById('movdrw-forn')?.value.trim() || null;
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
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> Registrar ${isEntrada ? 'Entrada' : 'Saída'}`;
      }
    });
  },

  /* ── Ajuste manual de saldo ───────────────────────────── */
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
            <div style="background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);padding:12px 16px;margin-bottom:4px;">
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
            <button class="btn btn-primary" id="ajdrw-save">
              <i class="fa-solid fa-check"></i> Aplicar Ajuste
            </button>
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

  /* ── Histórico de movimentações ───────────────────────── */
  async _histDrawer(itemId, descricao) {
    const root = document.createElement('div');
    root.id = 'est-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="est-backdrop">
        <div class="cfg-drawer" style="width:520px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title"><i class="fa-solid fa-clock-rotate-left" style="margin-right:8px;color:var(--brand);"></i>Histórico</div>
            <button class="cfg-drw-close" id="est-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div style="padding:10px 20px 4px;font-size:12.5px;color:var(--text-muted);">${descricao}</div>
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
        body.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-muted);"><i class="fa-solid fa-inbox" style="font-size:28px;opacity:.3;display:block;margin-bottom:10px;"></i>Nenhuma movimentação registrada.</div>`;
        return;
      }
      const tipoLabel = { entrada: 'Entrada', saida: 'Saída', ajuste: 'Ajuste' };
      const tipoCor = { entrada: '#01a864', saida: 'var(--warning-deeper,#b45309)', ajuste: 'var(--brand)' };
      const tipoIcon = { entrada: 'fa-arrow-down', saida: 'fa-arrow-up', ajuste: 'fa-sliders' };

      body.innerHTML = movs.map(m => `
        <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--border-subtle);">
          <div style="width:34px;height:34px;border-radius:10px;background:${tipoCor[m.tipo]}15;
                      display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid ${tipoIcon[m.tipo]}" style="color:${tipoCor[m.tipo]};font-size:13px;"></i>
          </div>
          <div style="flex:1;min-width:0;">
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
      document.getElementById('hist-body').innerHTML = `<div style="text-align:center;padding:40px;color:var(--accent);">Erro ao carregar histórico</div>`;
    }
  },

  /* ── Excluir item ─────────────────────────────────────── */
  async _delItem(id, desc) {
    const ok = await Modal.confirm({
      icon: 'danger',
      title: 'Excluir item de estoque?',
      body: `<strong>${desc}</strong> e todo o seu histórico de movimentações serão removidos.`,
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
