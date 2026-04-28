/* ── GESTÃO DE CONTAS FIXAS ─────────────────────────────── */
window.Pages = window.Pages || {};

const CF_MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
const CF_CATEGORIAS = ['Aluguel','Serviços Gerais','Limpeza','Jardinagem','Segurança','Energia','Água / Saneamento',
                       'Telecomunicações','TI / Software','Seguros','Manutenção','Outros'];

window.Pages.contratos = {
  title: 'Gestão de Contas Fixas',
  subtitle: 'Contratos anuais e recorrentes',
  icon: 'fa-calendar-check',

  _anoRef: new Date().getFullYear(),
  _contas: [],

  render() {
    return `
    <style>
      /* ── Animações ──────────────────────────────────────────── */
      @keyframes fadeIn  { from{opacity:0} to{opacity:1} }
      @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }

      /* ── Tabela ─────────────────────────────────────────────── */
      .cfg-table-wrap { overflow-x:auto; }
      .cfg-table {
        width:100%; border-collapse:collapse; min-width:700px;
      }
      .cfg-table thead th {
        background:var(--bg); padding:10px 16px;
        font-size:11px; font-weight:700; text-transform:uppercase;
        letter-spacing:.06em; color:var(--text-muted);
        border-bottom:1px solid var(--border); text-align:left;
        white-space:nowrap;
      }
      .cfg-table tbody tr {
        border-bottom:1px solid var(--border-subtle);
        transition:background .12s;
      }
      .cfg-table tbody tr:last-child { border-bottom:none; }
      .cfg-table tbody tr:hover { background:var(--brand-surface); }
      .cfg-table td {
        padding:12px 16px; font-size:13px; color:var(--text);
        vertical-align:middle;
      }

      /* ── Botões de ação ─────────────────────────────────────── */
      .cfg-act-btn {
        width:30px; height:30px; border-radius:8px;
        border:1px solid var(--border); background:var(--bg);
        cursor:pointer; display:inline-flex; align-items:center;
        justify-content:center; font-size:12px;
        transition:background .15s, border-color .15s, color .15s;
      }
      .cfg-act-edit { color:var(--brand); }
      .cfg-act-edit:hover { background:var(--brand-surface); border-color:var(--brand); }
      .cfg-act-del { color:var(--accent); margin-left:4px; }
      .cfg-act-del:hover { background:var(--accent-surface); border-color:var(--accent); }

      /* ── Drawer backdrop ────────────────────────────────────── */
      .cfg-backdrop {
        position:fixed; inset:0; background:rgba(0,0,0,.35);
        backdrop-filter:blur(2px); z-index:1000;
        display:flex; justify-content:flex-end;
        animation:fadeIn .2s ease;
      }
      .cfg-drawer {
        width:480px; max-width:95vw; height:100vh;
        background:#fff; display:flex; flex-direction:column;
        box-shadow:-8px 0 40px rgba(0,0,0,.15);
        animation:slideIn .22s ease; overflow:hidden;
      }
      .cfg-drw-hdr {
        padding:20px 24px 16px; border-bottom:1px solid var(--border);
        display:flex; align-items:center; justify-content:space-between;
        flex-shrink:0;
      }
      .cfg-drw-title { font-size:16px; font-weight:800; color:var(--text); }
      .cfg-drw-close {
        width:32px; height:32px; border-radius:8px;
        border:1px solid var(--border); background:none; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        color:var(--text-muted); font-size:14px; transition:background .15s;
      }
      .cfg-drw-close:hover { background:var(--bg); color:var(--accent); }
      .cfg-drw-body {
        flex:1; overflow-y:auto; padding:24px;
        display:flex; flex-direction:column; gap:16px;
      }
      .cfg-drw-footer {
        padding:16px 24px; border-top:1px solid var(--border);
        display:flex; gap:10px; justify-content:flex-end;
        flex-shrink:0;
      }

      /* ── Toggle ─────────────────────────────────────────────── */
      .cfg-toggle {
        position:relative; width:40px; height:22px;
        display:inline-block; flex-shrink:0;
      }
      .cfg-toggle input { opacity:0; width:0; height:0; }
      .cfg-toggle-slider {
        position:absolute; inset:0; border-radius:22px;
        background:var(--border); cursor:pointer;
        transition:background .2s;
      }
      .cfg-toggle-slider::before {
        content:''; position:absolute;
        width:16px; height:16px; border-radius:50%;
        left:3px; top:3px; background:#fff;
        transition:transform .2s;
      }
      .cfg-toggle input:checked + .cfg-toggle-slider { background:var(--brand); }
      .cfg-toggle input:checked + .cfg-toggle-slider::before { transform:translateX(18px); }

      /* ── Barra de progresso ─────────────────────────────────── */
      .progress-fill.safe    { background:var(--success); }
      .progress-fill.caution { background:#F59E0B; }
      .progress-fill.danger  { background:var(--accent); }

      /* ── KPI compact ─────────────────────────────────────────── */
      .cf-kpi-row {
        display:grid; grid-template-columns:repeat(4,1fr); gap:14px; margin-bottom:18px;
      }
      @media (max-width:1100px) { .cf-kpi-row { grid-template-columns:repeat(2,1fr); } }
      .cf-kpi {
        background:var(--surface-card); border:1px solid var(--border-subtle);
        border-radius:var(--r-lg); padding:18px 20px;
        display:flex; align-items:center; gap:14px;
        box-shadow:var(--shadow-sm); transition:box-shadow .15s, transform .15s;
      }
      .cf-kpi:hover { box-shadow:var(--shadow-md); transform:translateY(-1px); }
      .cf-kpi-icon {
        width:44px; height:44px; border-radius:var(--r-md);
        display:flex; align-items:center; justify-content:center;
        font-size:18px; flex-shrink:0;
      }
      .cf-kpi-body { flex:1; min-width:0; }
      .cf-kpi-val  { font-size:22px; font-weight:800; color:var(--text); letter-spacing:-.5px; line-height:1.15; }
      .cf-kpi-lbl  { font-size:12px; color:var(--text-muted); font-weight:500; margin-top:2px; white-space:nowrap; }

      /* ── Filter bar ──────────────────────────────────────────── */
      .cf-filter-bar {
        background:var(--surface-card); border:1px solid var(--border-subtle);
        border-radius:var(--r-lg); padding:14px 18px; margin-bottom:16px;
        display:flex; gap:10px; flex-wrap:wrap; align-items:flex-end;
        box-shadow:var(--shadow-sm);
      }
      .cf-filter-group { display:flex; flex-direction:column; gap:4px; min-width:130px; flex:1; }
      .cf-filter-label {
        font-size:10.5px; font-weight:700; text-transform:uppercase;
        letter-spacing:.06em; color:var(--text-muted);
      }
      .cf-filter-bar .form-control {
        height:34px; font-size:13px; padding:0 10px;
      }
      .cf-filter-bar input.form-control { padding:0 10px 0 32px; }
      .cf-search-wrap { position:relative; }
      .cf-search-wrap i {
        position:absolute; left:10px; top:50%; transform:translateY(-50%);
        color:var(--text-subtle); font-size:12px; pointer-events:none;
      }
      .cf-chip-row {
        display:flex; gap:6px; flex-wrap:wrap; align-items:center;
        margin-bottom:12px; min-height:0;
      }
      .cf-chip {
        display:inline-flex; align-items:center; gap:5px;
        padding:3px 10px 3px 10px; border-radius:var(--r-full);
        font-size:12px; font-weight:600; border:1px solid;
        background:var(--brand-surface); color:var(--brand); border-color:var(--brand);
      }
      .cf-chip button {
        background:none; border:none; cursor:pointer; padding:0 0 0 2px;
        color:inherit; font-size:11px; line-height:1; display:flex; align-items:center;
      }
    </style>

    <div class="page-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Gestão de Contas Fixas</h1>
          <p class="page-subtitle">Controle de contratos anuais, recorrentes e contas mensais fixas</p>
        </div>
        <div class="page-header-actions">
          <select id="cf-ano-sel" class="form-control" style="width:100px;height:36px;font-size:13px;"
                  onchange="Pages.contratos._anoRef=+this.value;Pages.contratos._load()">
            ${[2024,2025,2026,2027].map(a=>`<option value="${a}" ${a===this._anoRef?'selected':''}>${a}</option>`).join('')}
          </select>
          <button class="btn btn-primary" onclick="Pages.contratos._novaContaDrawer()">
            <i class="fa-solid fa-plus"></i> Nova Conta Fixa
          </button>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="cf-kpi-row" id="cf-kpis">
        ${[1,2,3,4].map(()=>`
          <div class="cf-kpi">
            <div class="cf-kpi-icon" style="background:var(--surface);"></div>
            <div class="cf-kpi-body">
              <div class="skeleton skeleton-line" style="width:70%;height:20px;margin-bottom:6px;border-radius:5px;"></div>
              <div class="skeleton skeleton-line" style="width:90%;height:12px;border-radius:4px;"></div>
            </div>
          </div>`).join('')}
      </div>

      <!-- Filtros -->
      <div class="cf-filter-bar">
        <div class="cf-filter-group" style="max-width:150px;">
          <span class="cf-filter-label">Unidade</span>
          <select id="cf-fil-unid" class="form-control" onchange="Pages.contratos._applyFilters()">
            <option value="">Todas</option>
          </select>
        </div>
        <div class="cf-filter-group" style="max-width:180px;">
          <span class="cf-filter-label">Categoria</span>
          <select id="cf-fil-cat" class="form-control" onchange="Pages.contratos._applyFilters()">
            <option value="">Todas</option>
            ${CF_CATEGORIAS.map(c=>`<option value="${c}">${c}</option>`).join('')}
          </select>
        </div>
        <div class="cf-filter-group" style="max-width:150px;">
          <span class="cf-filter-label">Status</span>
          <select id="cf-fil-status" class="form-control" onchange="Pages.contratos._applyFilters()">
            <option value="">Todos</option>
            <option value="ativo">Ativos</option>
            <option value="encerrado">Encerrados</option>
          </select>
        </div>
        <div class="cf-filter-group" style="flex:2;min-width:180px;">
          <span class="cf-filter-label">Buscar</span>
          <div class="cf-search-wrap">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input id="cf-search" type="text" class="form-control" placeholder="Nome, fornecedor..."
                   oninput="Pages.contratos._applyFilters()">
          </div>
        </div>
        <button class="btn btn-outline btn-sm" style="height:34px;white-space:nowrap;align-self:flex-end;"
                onclick="Pages.contratos._clearFilters()">
          <i class="fa-solid fa-xmark"></i> Limpar
        </button>
      </div>

      <!-- Tabela principal -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="padding:14px 20px 12px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid var(--border-subtle);">
          <span style="font-weight:700;font-size:13.5px;color:var(--text);">
            <i class="fa-solid fa-calendar-check" style="color:var(--brand);margin-right:6px;"></i>
            Contas Fixas
            <span class="badge badge-gray" style="margin-left:6px;" id="cf-count">—</span>
          </span>
          <div id="cf-chip-row" class="cf-chip-row" style="margin-bottom:0;"></div>
        </div>
        <div id="cf-table-wrap" style="overflow-x:auto;">
          <div style="padding:50px;text-align:center;"><div class="spinner"></div></div>
        </div>
      </div>
    </div>`;
  },

  async init() {
    this._anoRef = new Date().getFullYear();
    await this._load();
  },

  async _load() {
    try {
      this._contas = await Api.get('/api/contas-fixas');
      this._renderKpis();
      this._renderTable(this._contas);
    } catch (e) {
      document.getElementById('cf-table-wrap').innerHTML =
        `<div style="padding:40px;text-align:center;color:var(--text-muted);">Erro ao carregar dados</div>`;
    }
  },

  _renderKpis() {
    const ano     = this._anoRef;
    const ativas  = this._contas.filter(c => c.status === 'ativo');
    const todas   = this._contas.length;
    const totalAnual = ativas.reduce((s, c) => s + (c.valor_anual || 0), 0);
    const totalPago  = ativas.reduce((s, c) => s + (c.pago_ano  || 0), 0);
    const totalSaldo = totalAnual - totalPago;
    const pct        = totalAnual > 0 ? (totalPago / totalAnual * 100) : 0;
    const alertaCor  = pct > 90 ? '#ff2f69' : '#F59E0B';
    const alertaBg   = pct > 90 ? 'rgba(255,47,105,.12)' : 'rgba(245,158,11,.12)';

    const kpis = [
      { icon:'fa-file-signature', color:'var(--brand)', bg:'var(--brand-surface)',
        val: `${ativas.length} <span style="font-size:14px;font-weight:500;color:var(--text-muted);">/ ${todas}</span>`,
        label:'Contratos Ativos' },
      { icon:'fa-sack-dollar',    color:'#3B82F6', bg:'rgba(59,130,246,.10)',
        val: Fmt.currency(totalAnual), label:`Comprometido ${ano}` },
      { icon:'fa-circle-check',   color:'var(--success-deeper,#007a50)', bg:'rgba(1,225,142,.12)',
        val: Fmt.currency(totalPago),
        label:`Pago em ${ano}`,
        extra: totalAnual > 0 ? `<div style="margin-top:5px;background:var(--border-subtle);border-radius:4px;height:4px;overflow:hidden;">
          <div style="width:${Math.min(pct,100).toFixed(1)}%;height:100%;background:var(--success);border-radius:4px;transition:width .4s;"></div>
        </div><span style="font-size:11px;color:var(--text-muted);">${pct.toFixed(1)}% pago</span>` : '' },
      { icon:'fa-hourglass-half', color: alertaCor, bg: alertaBg,
        val: Fmt.currency(totalSaldo), label:'Saldo a Pagar' },
    ];

    document.getElementById('cf-kpis').innerHTML = kpis.map(k => `
      <div class="cf-kpi">
        <div class="cf-kpi-icon" style="background:${k.bg};color:${k.color};">
          <i class="fa-solid ${k.icon}"></i>
        </div>
        <div class="cf-kpi-body">
          <div class="cf-kpi-val">${k.val}</div>
          <div class="cf-kpi-lbl">${k.label}</div>
          ${k.extra||''}
        </div>
      </div>`).join('');
  },

  _renderTable(lista, skipDropdowns) {
    // Popula dropdown de unidades com as existentes nas contas (apenas na primeira chamada)
    if (!skipDropdowns) {
      const unidEl = document.getElementById('cf-fil-unid');
      if (unidEl) {
        const unidades = [...new Set(this._contas.map(c=>c.unidade).filter(Boolean))].sort();
        const cur = unidEl.value;
        unidEl.innerHTML = `<option value="">Todas</option>` +
          unidades.map(u=>`<option value="${u}" ${u===cur?'selected':''}>${u}</option>`).join('');
      }
    }
    document.getElementById('cf-count').textContent = lista.length;
    if (lista.length === 0) {
      document.getElementById('cf-table-wrap').innerHTML = `
        <div style="padding:60px;text-align:center;">
          <i class="fa-solid fa-calendar-check" style="font-size:36px;color:var(--border);margin-bottom:12px;display:block;"></i>
          <div style="font-weight:700;font-size:15px;color:var(--text-muted);">Nenhuma conta fixa cadastrada</div>
          <div style="font-size:13px;color:var(--text-subtle);margin-top:6px;">Clique em "Nova Conta Fixa" para começar</div>
        </div>`;
      return;
    }

    const rows = lista.map(c => {
      const pct   = c.pct_ano || 0;
      const pColor = pct > 90 ? 'var(--accent)' : pct > 70 ? '#F59E0B' : 'var(--success)';
      const pClass = pct > 90 ? 'danger' : pct > 70 ? 'caution' : 'safe';
      const statusBadge = c.status === 'ativo'
        ? `<span class="badge badge-success">Ativo</span>`
        : `<span class="badge badge-gray">Encerrado</span>`;
      return `
        <tr id="cf-row-${c.id}">
          <td>
            <div style="font-weight:600;color:var(--text);">${c.nome}</div>
            ${c.descricao ? `<div style="font-size:11.5px;color:var(--text-muted);margin-top:1px;">${c.descricao.substring(0,60)}${c.descricao.length>60?'...':''}</div>` : ''}
          </td>
          <td style="font-size:13px;">${c.fornecedor || '<span style="color:var(--text-subtle)">—</span>'}</td>
          <td>${c.categoria ? `<span class="badge badge-gray">${c.categoria}</span>` : '<span style="color:var(--text-subtle)">—</span>'}</td>
          <td>${c.unidade ? `<span class="badge badge-gray">${c.unidade}</span>` : '<span style="color:var(--text-subtle)">—</span>'}</td>
          <td style="font-size:13px;font-weight:600;">${Fmt.currency(c.valor_anual||0)}</td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;min-width:160px;">
              <div style="flex:1;background:var(--border-subtle);border-radius:4px;height:6px;overflow:hidden;">
                <div class="progress-fill ${pClass}" style="width:${Math.min(pct,100)}%;height:100%;border-radius:4px;"></div>
              </div>
              <span style="font-size:12px;font-weight:700;color:${pColor};white-space:nowrap;">${pct.toFixed(2)}%</span>
            </div>
            <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${Fmt.currency(c.pago_ano||0)} pago</div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align:center;white-space:nowrap;">
            <button class="cfg-act-btn" title="Ver lançamentos"
                    onclick="Pages.contratos._abrirDetalhes(${c.id})"
                    style="color:var(--brand);">
              <i class="fa-solid fa-receipt"></i>
            </button>
            <button class="cfg-act-btn cfg-act-edit" title="Editar"
                    onclick="Pages.contratos._editarContaDrawer(${c.id})">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="cfg-act-btn cfg-act-del" title="Excluir"
                    onclick="Pages.contratos._deletar(${c.id},'${c.nome.replace(/'/g,'')}')">
              <i class="fa-solid fa-trash"></i>
            </button>
          </td>
        </tr>`;
    }).join('');

    document.getElementById('cf-table-wrap').innerHTML = `
      <table class="cfg-table">
        <thead>
          <tr>
            <th>Conta / Descrição</th>
            <th>Fornecedor / Prestador</th>
            <th>Categoria</th>
            <th>Unidade</th>
            <th>Valor Anual</th>
            <th style="min-width:200px;">Utilização ${this._anoRef}</th>
            <th>Status</th>
            <th style="width:96px;text-align:center;">Ações</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  },

  _applyFilters() {
    const unid   = (document.getElementById('cf-fil-unid')?.value   || '').toLowerCase();
    const cat    = (document.getElementById('cf-fil-cat')?.value    || '').toLowerCase();
    const status = (document.getElementById('cf-fil-status')?.value || '').toLowerCase();
    const q      = (document.getElementById('cf-search')?.value     || '').toLowerCase();

    const filtrados = this._contas.filter(c => {
      if (unid   && (c.unidade||'').toLowerCase()   !== unid)   return false;
      if (cat    && (c.categoria||'').toLowerCase() !== cat)    return false;
      if (status && (c.status||'').toLowerCase()    !== status) return false;
      if (q && !(
        c.nome.toLowerCase().includes(q) ||
        (c.fornecedor||'').toLowerCase().includes(q) ||
        (c.categoria||'').toLowerCase().includes(q) ||
        (c.unidade||'').toLowerCase().includes(q)
      )) return false;
      return true;
    });

    // Chips de filtros ativos
    const chips = [];
    if (unid)   chips.push({ label: `Unidade: ${document.getElementById('cf-fil-unid').options[document.getElementById('cf-fil-unid').selectedIndex].text}`, clear: ()=>{ document.getElementById('cf-fil-unid').value=''; this._applyFilters(); } });
    if (cat)    chips.push({ label: `Categoria: ${document.getElementById('cf-fil-cat').options[document.getElementById('cf-fil-cat').selectedIndex].text}`, clear: ()=>{ document.getElementById('cf-fil-cat').value=''; this._applyFilters(); } });
    if (status) chips.push({ label: status==='ativo'?'Somente Ativos':'Somente Encerrados', clear: ()=>{ document.getElementById('cf-fil-status').value=''; this._applyFilters(); } });
    if (q)      chips.push({ label: `"${q}"`, clear: ()=>{ document.getElementById('cf-search').value=''; this._applyFilters(); } });

    const chipRow = document.getElementById('cf-chip-row');
    if (chipRow) {
      chipRow.innerHTML = chips.map((ch, i) =>
        `<span class="cf-chip">${ch.label}<button onclick="Pages.contratos._chipClear(${i})"><i class="fa-solid fa-xmark"></i></button></span>`
      ).join('');
    }
    this._chipClears = chips.map(ch => ch.clear);
    this._renderTable(filtrados, true);
  },

  _chipClear(i) { if (this._chipClears?.[i]) this._chipClears[i](); },

  _clearFilters() {
    const ids = ['cf-fil-unid','cf-fil-cat','cf-fil-status','cf-search'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    const chipRow = document.getElementById('cf-chip-row');
    if (chipRow) chipRow.innerHTML = '';
    this._renderTable(this._contas);
  },

  /* ── Drawer Nova / Editar ────────────────────────────────── */
  async _novaContaDrawer() { await this._openDrawer(null); },

  async _editarContaDrawer(id) {
    const c = this._contas.find(x => x.id === id);
    if (c) await this._openDrawer(c);
  },

  async _openDrawer(c) {
    const isEdit = !!c;
    const catOpts = CF_CATEGORIAS.map(cat =>
      `<option value="${cat}" ${c?.categoria===cat?'selected':''}>${cat}</option>`).join('');

    // Busca unidades cadastradas no sistema
    let unidades = [...new Set(this._contas.map(x=>x.unidade).filter(Boolean))];
    try {
      const opcoes = await Api.get('/api/configuracoes/opcoes');
      const apiUnidades = (opcoes.unidades || []).map(u => u.nome || u);
      unidades = [...new Set([...apiUnidades, ...unidades])];
    } catch { /* usa apenas as já carregadas nas contas */ }

    const unidOpts = ['', ...unidades].map(u =>
      `<option value="${u}" ${c?.unidade===u?'selected':''}>${u||'Selecione...'}</option>`).join('');

    const root = document.createElement('div');
    root.id = 'cf-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="cf-backdrop">
        <div class="cfg-drawer">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">${isEdit ? 'Editar Conta Fixa' : 'Nova Conta Fixa'}</div>
            <button class="cfg-drw-close" id="cf-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body">

            <div class="form-group">
              <label class="form-label form-label-required">Nome da Conta</label>
              <input id="cf-nome" class="form-control" placeholder="Ex: Aluguel Armazém Garuva"
                     value="${c?.nome||''}">
            </div>
            <div class="form-group">
              <label class="form-label">Fornecedor / Prestador</label>
              <input id="cf-forn" class="form-control" placeholder="Nome da empresa ou pessoa"
                     value="${c?.fornecedor||''}">
            </div>
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Categoria</label>
                <select id="cf-cat" class="form-control">
                  <option value="">Selecione...</option>${catOpts}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Unidade</label>
                <select id="cf-unid" class="form-control">${unidOpts}</select>
              </div>
            </div>
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Valor Mensal Referência (R$)</label>
                <input id="cf-vmensal" class="form-control" type="number" min="0" step="0.01"
                       placeholder="0,00" value="${c?.valor_mensal||''}"
                       oninput="document.getElementById('cf-vanual').value=(+this.value*12).toFixed(2)">
              </div>
              <div class="form-group">
                <label class="form-label">Valor Anual (R$)</label>
                <input id="cf-vanual" class="form-control" type="number" min="0" step="0.01"
                       placeholder="0,00" value="${c?.valor_anual||''}">
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Orçamento Mensal — Plano YTD (R$)</label>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:6px;">
                ${CF_MESES.map((m,i) => `
                  <div>
                    <label style="font-size:10px;color:var(--text-muted);font-weight:700;text-transform:uppercase;letter-spacing:.04em;display:block;margin-bottom:3px;">${m}</label>
                    <input id="cf-orcado-${i+1}" class="form-control" type="number" min="0" step="0.01"
                           placeholder="0,00" style="padding:5px 8px;font-size:12px;"
                           value="${c?.orcado_mensais?.[i+1] || c?.orcado_mensais?.[String(i+1)] || ''}">
                  </div>`).join('')}
              </div>
              <div style="font-size:11px;color:var(--text-subtle);margin-top:5px;">
                <i class="fa-solid fa-circle-info" style="margin-right:4px;"></i>
                Preencha o valor orçado de cada mês para calcular o Plano YTD corretamente.
              </div>
            </div>
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Início do Contrato</label>
                <input id="cf-inicio" class="form-control" type="date" value="${c?.data_inicio||''}">
              </div>
              <div class="form-group">
                <label class="form-label">Vencimento</label>
                <input id="cf-fim" class="form-control" type="date" value="${c?.data_fim||''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Descrição</label>
              <textarea id="cf-desc" class="form-control" rows="2"
                        placeholder="Detalhes do contrato, escopo do serviço..."
                        style="resize:vertical;">${c?.descricao||''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label" style="display:flex;align-items:center;justify-content:space-between;">
                <span>Contrato Ativo</span>
                <label class="cfg-toggle">
                  <input type="checkbox" id="cf-ativo" ${(c?.status||'ativo')==='ativo'?'checked':''}>
                  <span class="cfg-toggle-slider"></span>
                </label>
              </label>
            </div>
          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="cf-cancel">Cancelar</button>
            <button class="btn btn-primary" id="cf-save" data-id="${c?.id||''}">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit?'Salvar Alterações':'Criar Conta'}
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(root);
    const close = () => root.remove();
    document.getElementById('cf-drw-close').addEventListener('click', close);
    document.getElementById('cf-cancel').addEventListener('click', close);
    document.getElementById('cf-backdrop').addEventListener('click', e => {
      if (e.target === document.getElementById('cf-backdrop')) close();
    });

    document.getElementById('cf-save').addEventListener('click', async () => {
      const nome = document.getElementById('cf-nome').value.trim();
      if (!nome) { Toast.warning('Campo obrigatório','Informe o nome da conta.'); return; }
      const orcado_mensais = {};
      for (let m = 1; m <= 12; m++) {
        const v = parseFloat(document.getElementById(`cf-orcado-${m}`)?.value);
        if (!isNaN(v) && v > 0) orcado_mensais[m] = v;
      }
      const payload = {
        nome,
        fornecedor:    document.getElementById('cf-forn').value.trim() || null,
        categoria:     document.getElementById('cf-cat').value || null,
        unidade:       document.getElementById('cf-unid').value || null,
        valor_mensal:  parseFloat(document.getElementById('cf-vmensal').value) || 0,
        valor_anual:   parseFloat(document.getElementById('cf-vanual').value)  || 0,
        data_inicio:   document.getElementById('cf-inicio').value || null,
        data_fim:      document.getElementById('cf-fim').value    || null,
        descricao:     document.getElementById('cf-desc').value.trim() || null,
        status:        document.getElementById('cf-ativo').checked ? 'ativo' : 'encerrado',
        orcado_mensais,
      };
      const btn = document.getElementById('cf-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        if (isEdit) await Api.patch(`/api/contas-fixas/${c.id}`, payload);
        else        await Api.post('/api/contas-fixas', payload);
        Toast.success(isEdit ? 'Conta atualizada' : 'Conta criada', nome);
        close();
        await this._load();
      } catch (err) {
        Toast.error('Erro ao salvar', err.message||'');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit?'Salvar Alterações':'Criar Conta'}`;
      }
    });
  },

  /* ── Excluir ─────────────────────────────────────────────── */
  async _deletar(id, nome) {
    const ok = await Modal.confirm({
      icon:'danger', title:`Excluir "${nome}"?`,
      body:'Todos os lançamentos desta conta também serão removidos.',
      confirmText:'Excluir', confirmClass:'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/contas-fixas/${id}`);
      Toast.success('Conta excluída', nome);
      await this._load();
    } catch { Toast.error('Erro ao excluir'); }
  },

  /* Retorna quantos meses do ano de referência já passaram (YTD) */
  _ytdMeses() {
    const now      = new Date();
    const anoAtual = now.getFullYear();
    const mesAtual = now.getMonth() + 1;
    if (this._anoRef < anoAtual) return 12;
    if (this._anoRef > anoAtual) return 0;
    return mesAtual;
  },

  /* Soma os orçamentos mensais definidos pelo usuário até o mês YTD */
  _planoYTD(c) {
    const mesRef  = this._ytdMeses();
    if (mesRef === 0) return 0;
    const orcados = c.orcado_mensais || {};
    let total = 0;
    for (let m = 1; m <= mesRef; m++) {
      total += parseFloat(orcados[m] || orcados[String(m)] || 0);
    }
    return total;
  },

  /* ── Painel de Detalhes / Lançamentos ───────────────────── */
  async _abrirDetalhes(id) {
    const c = this._contas.find(x => x.id === id);
    if (!c) return;

    const mesRef   = this._ytdMeses();
    const planoYTD = this._planoYTD(c);

    const root = document.createElement('div');
    root.id = 'cf-det-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="cf-det-back">
        <div class="cfg-drawer" style="width:620px;max-width:100vw;">
          <div class="cfg-drw-hdr">
            <div>
              <div class="cfg-drw-title">${c.nome}</div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
                ${c.fornecedor||''} ${c.unidade?`· ${c.unidade}`:''} ${c.categoria?`· ${c.categoria}`:''}
              </div>
            </div>
            <button class="cfg-drw-close" id="cf-det-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body" style="padding:0;">

            <!-- Resumo anual — 4 KPIs -->
            <div style="padding:16px 22px;background:var(--brand-surface);border-bottom:1px solid var(--border-subtle);">
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:10px;">
                <div>
                  <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.06em;">Valor Anual</div>
                  <div style="font-size:17px;font-weight:800;color:var(--text);">${Fmt.currency(c.valor_anual||0)}</div>
                </div>
                <div>
                  <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.06em;">Plano YTD</div>
                  <div style="font-size:17px;font-weight:800;color:var(--text);">${Fmt.currency(planoYTD)}</div>
                  <div style="font-size:10.5px;color:var(--text-subtle);margin-top:2px;">${mesRef} ${mesRef===1?'mês':'meses'} orçados</div>
                </div>
                <div>
                  <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.06em;">Real YTD</div>
                  <div id="cf-det-real-ytd" style="font-size:17px;font-weight:800;color:var(--success-deeper,#007a50);">—</div>
                </div>
                <div>
                  <div style="font-size:10px;color:var(--text-muted);text-transform:uppercase;font-weight:700;letter-spacing:.06em;">% Saving</div>
                  <div id="cf-det-saving" style="font-size:17px;font-weight:800;color:var(--text);">—</div>
                  <div id="cf-det-saving-sub" style="font-size:10.5px;margin-top:2px;"></div>
                </div>
              </div>
              <div style="background:var(--border-subtle);border-radius:6px;height:8px;overflow:hidden;">
                <div class="progress-fill ${c.pct_ano>90?'danger':c.pct_ano>70?'caution':'safe'}"
                     style="width:${Math.min(c.pct_ano||0,100)}%;height:100%;border-radius:6px;transition:width .4s;"></div>
              </div>
              <div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--text-muted);margin-top:4px;">
                <span>${(c.pct_ano||0).toFixed(1)}% utilizado em ${this._anoRef}</span>
                <span>${Fmt.currency(c.valor_mensal||0)}/mês</span>
              </div>
            </div>

            <!-- Grade mensal -->
            <div style="padding:14px 22px 10px;border-bottom:1px solid var(--border-subtle);">
              <div style="font-size:12px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-bottom:10px;">
                Lançamentos ${this._anoRef}
              </div>
              <div id="cf-meses-grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;">
                ${CF_MESES.map((_,i)=>`
                  <div class="cf-mes-pill" id="cf-mes-${i+1}" style="padding:6px;border-radius:8px;text-align:center;
                       background:var(--bg);border:1px solid var(--border-subtle);cursor:pointer;font-size:12px;transition:.15s;"
                       onclick="Pages.contratos._selecionarMes(${id},${i+1},this)">
                    <div style="font-weight:700;color:var(--text-muted);">${CF_MESES[i]}</div>
                    <div class="cf-mes-val" style="font-size:11px;color:var(--text-subtle);">—</div>
                  </div>`).join('')}
              </div>
            </div>

            <!-- Lista de lançamentos (carregada dinamicamente) -->
            <div id="cf-lanc-section" style="padding:14px 22px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <span style="font-size:13px;font-weight:700;color:var(--text);">Detalhes dos Lançamentos</span>
                <button class="btn btn-primary btn-sm" onclick="Pages.contratos._novoLancamentoForm(${id})">
                  <i class="fa-solid fa-plus"></i> Lançar Pagamento
                </button>
              </div>
              <div id="cf-lanc-list"><div style="text-align:center;padding:20px;"><div class="spinner" style="width:20px;height:20px;margin:auto;"></div></div></div>
            </div>

          </div>
        </div>
      </div>`;

    document.body.appendChild(root);
    const close = () => root.remove();
    document.getElementById('cf-det-close').addEventListener('click', close);
    document.getElementById('cf-det-back').addEventListener('click', e => {
      if (e.target === document.getElementById('cf-det-back')) close();
    });

    this._carregarLancamentos(id);
  },

  async _carregarLancamentos(id) {
    try {
      const lancamentos = await Api.get(`/api/contas-fixas/${id}/lancamentos?ano=${this._anoRef}`);

      // ── YTD: Real YTD e % Saving ────────────────────────────────
      const mesRef  = Pages.contratos._ytdMeses();
      const conta   = Pages.contratos._contas.find(x => x.id === id);
      const realYTD = lancamentos
        .filter(l => l.mes <= mesRef)
        .reduce((s, l) => s + l.valor, 0);
      const planoYTD = mesRef > 0 ? (conta?.valor_anual || 0) / 12 * mesRef : 0;
      const saving   = planoYTD > 0 ? (planoYTD - realYTD) / planoYTD * 100 : 0;
      const savingColor = saving >= 0 ? 'var(--success-deeper,#007a50)' : 'var(--accent)';

      const realYTDEl = document.getElementById('cf-det-real-ytd');
      if (realYTDEl) { realYTDEl.textContent = Fmt.currency(realYTD); }

      const savingEl = document.getElementById('cf-det-saving');
      if (savingEl) {
        savingEl.textContent = `${saving >= 0 ? '+' : ''}${saving.toFixed(1)}%`;
        savingEl.style.color = savingColor;
      }

      const savingSubEl = document.getElementById('cf-det-saving-sub');
      if (savingSubEl) {
        const diff = Math.abs(planoYTD - realYTD);
        savingSubEl.textContent = saving >= 0
          ? `${Fmt.currency(diff)} economizado`
          : `${Fmt.currency(diff)} acima do plano`;
        savingSubEl.style.color = savingColor;
      }
      // ────────────────────────────────────────────────────────────

      // Preenche pills mensais
      CF_MESES.forEach((_, i) => {
        const mes = i + 1;
        const pill = document.getElementById(`cf-mes-${mes}`);
        if (!pill) return;
        const lancs = lancamentos.filter(l => l.mes === mes);
        const total = lancs.reduce((s, l) => s + l.valor, 0);
        if (lancs.length > 0) {
          pill.style.background = 'rgba(1,225,142,0.12)';
          pill.style.borderColor = 'var(--success)';
          pill.querySelector('.cf-mes-val').innerHTML = `<span style="color:var(--success-deeper,#007a50);font-weight:700;">${Fmt.currency(total)}</span>`;
        }
      });

      // Lista de lançamentos
      const lista = document.getElementById('cf-lanc-list');
      if (!lista) return;
      if (lancamentos.length === 0) {
        lista.innerHTML = `<div style="text-align:center;padding:24px;color:var(--text-muted);font-size:13px;">
          <i class="fa-solid fa-receipt" style="font-size:22px;display:block;margin-bottom:8px;opacity:.3;"></i>
          Nenhum lançamento registrado em ${this._anoRef}
        </div>`;
        return;
      }
      lista.innerHTML = `<table class="cfg-table" style="font-size:12.5px;">
        <thead><tr>
          <th>Mês</th><th>Valor</th><th>Tipo Doc.</th><th>Nº Documento</th><th>Arquivo</th><th>Data</th><th style="width:44px;"></th>
        </tr></thead>
        <tbody>
          ${lancamentos.map(l => `
            <tr>
              <td><strong>${CF_MESES[l.mes-1]} ${l.ano}</strong></td>
              <td style="font-weight:700;color:var(--success-deeper,#007a50);">${Fmt.currency(l.valor)}</td>
              <td><span class="badge badge-gray">${l.tipo_doc||'—'}</span></td>
              <td>${l.numero_doc||'<span style="color:var(--text-subtle)">—</span>'}</td>
              <td>${l.arquivo_nome
                ? `<a href="${l.arquivo_path}" target="_blank" style="color:var(--brand);font-size:12px;">
                     <i class="fa-solid fa-paperclip"></i> ${l.arquivo_nome.substring(0,20)}${l.arquivo_nome.length>20?'...':''}
                   </a>`
                : '<span style="color:var(--text-subtle)">—</span>'}</td>
              <td style="font-size:11.5px;color:var(--text-muted);">${(l.data_lancamento||'').split('T')[0]||l.data_lancamento||'—'}</td>
              <td style="white-space:nowrap;">
                <button class="cfg-act-btn cfg-act-edit" title="Editar lançamento"
                        onclick="Pages.contratos._editarLancamento(${l.id},${id})"
                        style="margin-right:4px;">
                  <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="cfg-act-btn cfg-act-del" title="Excluir"
                        onclick="Pages.contratos._deletarLancamento(${l.id},${id})">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    } catch {
      const lista = document.getElementById('cf-lanc-list');
      if (lista) lista.innerHTML = `<div style="color:var(--accent);font-size:13px;padding:16px;">Erro ao carregar lançamentos</div>`;
    }
  },

  _selecionarMes(id, mes, pill) {
    // Apenas rola até o formulário de lançamento, pré-selecionando o mês
    this._novoLancamentoForm(id, mes);
  },

  /* ── Formulário de Lançamento ───────────────────────────── */
  _novoLancamentoForm(id, mesPre) {
    const secao = document.getElementById('cf-lanc-section');
    if (!secao) return;

    // Remove form anterior se existir
    const antigo = document.getElementById('cf-lanc-form-wrap');
    if (antigo) antigo.remove();

    const conta = this._contas.find(x => x.id === id);
    const mesOpts = CF_MESES.map((m,i) =>
      `<option value="${i+1}" ${(mesPre||(new Date().getMonth()+1))===i+1?'selected':''}>${m}</option>`
    ).join('');

    const formDiv = document.createElement('div');
    formDiv.id = 'cf-lanc-form-wrap';
    formDiv.innerHTML = `
      <div style="background:var(--brand-surface);border:1px solid var(--border-subtle);border-radius:12px;padding:16px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:700;color:var(--brand);margin-bottom:12px;">
          <i class="fa-solid fa-plus-circle"></i> Novo Lançamento
        </div>
        <div class="form-grid form-grid-3" style="margin-bottom:10px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Mês</label>
            <select id="cf-lmes" class="form-control">${mesOpts}</select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Ano</label>
            <input id="cf-lano" class="form-control" type="number" value="${this._anoRef}">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Valor (R$)</label>
            <input id="cf-lvalor" class="form-control" type="number" min="0" step="0.01"
                   placeholder="${Fmt.currency(conta?.valor_mensal||0)}"
                   value="${conta?.valor_mensal||''}">
          </div>
        </div>
        <div class="form-grid form-grid-2" style="margin-bottom:10px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Tipo de Documento</label>
            <select id="cf-ltipo" class="form-control">
              <option value="NF">Nota Fiscal (NF)</option>
              <option value="Boleto">Boleto</option>
              <option value="Fatura">Fatura</option>
              <option value="Recibo">Recibo</option>
              <option value="Outro">Outro</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Número do Documento</label>
            <input id="cf-lndoc" class="form-control" placeholder="Ex: NF-0001234">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label class="form-label">Arquivo (NF / Boleto / Fatura)</label>
          <input id="cf-larq" class="form-control" type="file"
                 accept=".pdf,.png,.jpg,.jpeg,.xml"
                 style="padding:6px 10px;cursor:pointer;">
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">Observações</label>
          <input id="cf-lobs" class="form-control" placeholder="Opcional">
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('cf-lanc-form-wrap').remove()">
            Cancelar
          </button>
          <button class="btn btn-primary btn-sm" id="cf-lsave" onclick="Pages.contratos._salvarLancamento(${id})">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Lançamento
          </button>
        </div>
      </div>`;

    secao.insertBefore(formDiv, secao.querySelector('#cf-lanc-list'));
    document.getElementById('cf-lvalor')?.focus();
  },

  async _salvarLancamento(id) {
    const mes   = parseInt(document.getElementById('cf-lmes').value);
    const ano   = parseInt(document.getElementById('cf-lano').value);
    const valor = parseFloat(document.getElementById('cf-lvalor').value);
    if (!valor || valor <= 0) { Toast.warning('Valor inválido','Informe o valor do lançamento.'); return; }

    const btn = document.getElementById('cf-lsave');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    try {
      const tipo_doc  = document.getElementById('cf-ltipo').value;
      const numero_doc = document.getElementById('cf-lndoc').value.trim();
      const obs       = document.getElementById('cf-lobs').value.trim();
      const arqInput  = document.getElementById('cf-larq');
      let arquivo_path = null, arquivo_nome = null;

      if (arqInput.files[0]) {
        const file = arqInput.files[0];
        const filePath = `contas_fixas/${id}_${ano}_${String(mes).padStart(2,'0')}_${file.name}`;
        arquivo_path = await SbStorage.upload('uploads', filePath, file);
        arquivo_nome = file.name;
      }

      await Api.post(`/api/contas-fixas/${id}/lancamentos`, {
        mes, ano, valor, tipo_doc, numero_doc, obs, arquivo_path, arquivo_nome
      });

      Toast.success('Lançamento registrado', `${CF_MESES[mes-1]} ${ano} — ${Fmt.currency(valor)}`);
      document.getElementById('cf-lanc-form-wrap')?.remove();
      await this._load();
      this._carregarLancamentos(id);
    } catch (err) {
      Toast.error('Erro ao salvar lançamento', err.message||'');
      btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Lançamento';
    }
  },

  /* ── Editar Lançamento ──────────────────────────────────── */
  async _editarLancamento(lid, contaId) {
    let lanc;
    try {
      const todos = await Api.get(`/api/contas-fixas/${contaId}/lancamentos?ano=${this._anoRef}`);
      lanc = todos.find(l => l.id === lid);
    } catch { Toast.error('Erro ao carregar lançamento'); return; }
    if (!lanc) return;

    const secao = document.getElementById('cf-lanc-section');
    if (!secao) return;
    document.getElementById('cf-lanc-form-wrap')?.remove();

    const mesOpts = CF_MESES.map((m, i) =>
      `<option value="${i+1}" ${lanc.mes === i+1 ? 'selected' : ''}>${m}</option>`
    ).join('');

    const formDiv = document.createElement('div');
    formDiv.id = 'cf-lanc-form-wrap';
    formDiv.innerHTML = `
      <div style="background:rgba(66,44,118,.06);border:1px solid var(--brand);border-radius:12px;padding:16px;margin-bottom:14px;">
        <div style="font-size:13px;font-weight:700;color:var(--brand);margin-bottom:12px;">
          <i class="fa-solid fa-pen-to-square"></i> Editar Lançamento — ${CF_MESES[lanc.mes-1]} ${lanc.ano}
        </div>
        <div class="form-grid form-grid-3" style="margin-bottom:10px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Mês</label>
            <select id="cf-lmes" class="form-control">${mesOpts}</select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Ano</label>
            <input id="cf-lano" class="form-control" type="number" value="${lanc.ano}">
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Valor (R$)</label>
            <input id="cf-lvalor" class="form-control" type="number" min="0" step="0.01" value="${lanc.valor}">
          </div>
        </div>
        <div class="form-grid form-grid-2" style="margin-bottom:10px;">
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Tipo de Documento</label>
            <select id="cf-ltipo" class="form-control">
              ${['NF','Boleto','Fatura','Recibo','Outro'].map(t =>
                `<option value="${t}" ${lanc.tipo_doc===t?'selected':''}>${t==='NF'?'Nota Fiscal (NF)':t}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0;">
            <label class="form-label">Número do Documento</label>
            <input id="cf-lndoc" class="form-control" placeholder="Ex: NF-0001234" value="${lanc.numero_doc||''}">
          </div>
        </div>
        <div class="form-group" style="margin-bottom:10px;">
          <label class="form-label">Arquivo${lanc.arquivo_nome ? ' (substituir)' : ''}</label>
          ${lanc.arquivo_nome ? `
            <div style="font-size:12px;color:var(--text-muted);margin-bottom:5px;">
              <i class="fa-solid fa-paperclip"></i>
              <a href="${lanc.arquivo_path}" target="_blank" style="color:var(--brand);">${lanc.arquivo_nome}</a>
              — atual
            </div>` : ''}
          <input id="cf-larq" class="form-control" type="file"
                 accept=".pdf,.png,.jpg,.jpeg,.xml"
                 style="padding:6px 10px;cursor:pointer;">
        </div>
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label">Observações</label>
          <input id="cf-lobs" class="form-control" placeholder="Opcional" value="${lanc.obs||''}">
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn btn-outline btn-sm"
                  onclick="document.getElementById('cf-lanc-form-wrap').remove()">
            Cancelar
          </button>
          <button class="btn btn-primary btn-sm" id="cf-lsave"
                  onclick="Pages.contratos._salvarEdicaoLancamento(${lid},${contaId})">
            <i class="fa-solid fa-floppy-disk"></i> Salvar Alterações
          </button>
        </div>
      </div>`;

    secao.insertBefore(formDiv, secao.querySelector('#cf-lanc-list'));
    document.getElementById('cf-lvalor')?.focus();
  },

  async _salvarEdicaoLancamento(lid, contaId) {
    const valor = parseFloat(document.getElementById('cf-lvalor').value);
    if (!valor || valor <= 0) { Toast.warning('Valor inválido', 'Informe o valor do lançamento.'); return; }

    const btn = document.getElementById('cf-lsave');
    btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';

    try {
      const mes        = parseInt(document.getElementById('cf-lmes').value);
      const ano        = parseInt(document.getElementById('cf-lano').value);
      const tipo_doc   = document.getElementById('cf-ltipo').value;
      const numero_doc = document.getElementById('cf-lndoc').value.trim();
      const obs        = document.getElementById('cf-lobs').value.trim();
      const arqInput   = document.getElementById('cf-larq');
      const payload    = { valor, mes, ano, tipo_doc, numero_doc, obs };

      if (arqInput?.files[0]) {
        const file     = arqInput.files[0];
        const filePath = `contas_fixas/${contaId}_${ano}_${String(mes).padStart(2,'0')}_${file.name}`;
        payload.arquivo_path = await SbStorage.upload('uploads', filePath, file);
        payload.arquivo_nome = file.name;
      }

      await Api.patch(`/api/contas-fixas/lancamentos/${lid}`, payload);
      Toast.success('Lançamento atualizado', `${CF_MESES[mes-1]} ${ano} — ${Fmt.currency(valor)}`);
      document.getElementById('cf-lanc-form-wrap')?.remove();
      await this._load();
      this._carregarLancamentos(contaId);
    } catch (err) {
      Toast.error('Erro ao salvar', err.message || '');
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Alterações';
    }
  },

  async _deletarLancamento(lid, contaId) {
    const ok = await Modal.confirm({
      icon:'danger', title:'Excluir lançamento?',
      body:'O lançamento e o arquivo vinculado serão removidos permanentemente.',
      confirmText:'Excluir', confirmClass:'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/contas-fixas/lancamentos/${lid}`);
      Toast.success('Lançamento excluído');
      await this._load();
      this._carregarLancamentos(contaId);
    } catch { Toast.error('Erro ao excluir'); }
  },
};
