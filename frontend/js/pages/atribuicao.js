/* ============================================================
   SHP — ATRIBUIÇÃO DE COMPRADOR
   Tela restrita às Gestoras de Compras (Janaina Ferreira / Paola Schreiber)
   Permite atribuir ou reatribuir o comprador responsável por cada
   requisição aprovada (status "Aguardando Cotação").
   ============================================================ */

window.Pages = window.Pages || {};

window.Pages.atribuicao = {
  title: 'Atribuição de Comprador',

  _todos:           [],   // todas as requisições carregadas
  _isGestora:       false,
  _userNome:        '',
  _unidadeFiltrada: [],   // chips de unidade ativos

  // ── Constantes ────────────────────────────────────────────

  _GESTORAS: ['Janaina Ferreira', 'Paola Schreiber'],

  _COMPRADORES: [
    'Ana Paula Alves',
    'Giullia Galtarussa',
    'Janaina Ferreira',
    'Luiz Felipe Cipriano',
    'Paola Schreiber',
  ],

  // Regras automáticas: unidade → comprador sugerido
  _REGRAS: {
    'VCI':            'Ana Paula Alves',
    'ITAPEVI':        'Giullia Galtarussa',
    'Navegantes CD1': 'Luiz Felipe Cipriano',
    'Navegantes CD2': 'Luiz Felipe Cipriano',
    'Garuva':         'Luiz Felipe Cipriano',
    'Todas Unidades': 'Janaina Ferreira',   // sugestão padrão; ambas são elegíveis
  },

  // Cores das badges de unidade
  _UNIDADE_CORES: {
    'VCI':            { bg: '#ede9fe', text: '#6d28d9', icon: 'fa-building' },
    'ITAPEVI':        { bg: '#fff7ed', text: '#c2410c', icon: 'fa-industry' },
    'Navegantes CD1': { bg: '#ecfdf5', text: '#065f46', icon: 'fa-warehouse' },
    'Navegantes CD2': { bg: '#f0fdf4', text: '#16a34a', icon: 'fa-warehouse' },
    'Garuva':         { bg: '#eff6ff', text: '#1d4ed8', icon: 'fa-anchor'   },
    'Todas Unidades': { bg: '#fdf4ff', text: '#7e22ce', icon: 'fa-globe'    },
  },

  // Cores dos avatares dos compradores
  _COMPRADOR_COR: {
    'Ana Paula Alves':      { bg: '#fce7f3', text: '#9d174d' },
    'Giullia Galtarussa':   { bg: '#fff7ed', text: '#9a3412' },
    'Janaina Ferreira':     { bg: '#ede9fe', text: '#5b21b6' },
    'Luiz Felipe Cipriano': { bg: '#eff6ff', text: '#1e40af' },
    'Paola Schreiber':      { bg: '#ecfdf5', text: '#065f46' },
  },

  // ── Helpers ───────────────────────────────────────────────

  _sugerirComprador(unidade) {
    if (!unidade) return '';
    return this._REGRAS[unidade.trim()] || '';
  },

  _unidadeCor(unidade) {
    return this._UNIDADE_CORES[unidade] || { bg: 'var(--surface)', text: 'var(--text-muted)', icon: 'fa-building' };
  },

  _compradorCor(nome) {
    return this._COMPRADOR_COR[nome] || { bg: 'var(--surface)', text: 'var(--text-muted)' };
  },

  _inicialNome(nome) {
    if (!nome) return '?';
    const parts = nome.trim().split(' ');
    return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0][0];
  },

  // ── Render ────────────────────────────────────────────────

  render() {
    return `
      <div class="page-fade-in" id="atrib-root">

        <!-- Header -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Atribuição de Comprador</h1>
            <p class="page-subtitle">Gerencie a distribuição de requisições aprovadas entre os compradores responsáveis</p>
          </div>
          <div style="display:flex;gap:10px;align-items:center;" id="atrib-header-actions">
            <button class="btn btn-secondary" onclick="Pages.atribuicao._aplicarRegras()" id="atrib-btn-regras">
              <i class="fa-solid fa-wand-magic-sparkles"></i> Aplicar Regras Automáticas
            </button>
            <button class="btn btn-secondary btn-sm" onclick="Pages.atribuicao._carregar()" title="Recarregar">
              <i class="fa-solid fa-rotate-right"></i>
            </button>
          </div>
        </div>

        <!-- Acesso negado -->
        <div id="atrib-access-denied" style="display:none;">
          <div class="empty-state" style="padding:80px 20px;margin-top:40px;">
            <div class="empty-icon">
              <i class="fa-solid fa-lock" style="color:var(--accent);"></i>
            </div>
            <p class="empty-title">Acesso Restrito</p>
            <p class="empty-desc">
              Esta tela é exclusiva para as Gestoras de Compras.<br>
              Apenas <strong>Janaina Ferreira</strong> e <strong>Paola Schreiber</strong>
              podem acessar e atribuir compradores.
            </p>
          </div>
        </div>

        <!-- Conteúdo principal -->
        <div id="atrib-main">

          <!-- KPI cards -->
          <div id="atrib-kpis"
               style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px;">
          </div>

          <!-- Barra de filtros -->
          <div class="card" style="padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div style="position:relative;flex:1;min-width:220px;">
              <i class="fa-solid fa-magnifying-glass"
                 style="position:absolute;left:11px;top:50%;transform:translateY(-50%);color:var(--text-subtle);font-size:12px;pointer-events:none;"></i>
              <input type="text" class="form-control" id="atrib-busca"
                     placeholder="Buscar por nº, unidade, solicitante…"
                     style="padding-left:33px;height:38px;font-size:13px;"
                     oninput="Pages.atribuicao._filtrar()">
            </div>
            <div id="atrib-chips-unidade" style="display:flex;flex-wrap:wrap;gap:6px;"></div>
            <button class="btn btn-secondary btn-sm" onclick="Pages.atribuicao._limparFiltros()"
                    style="white-space:nowrap;">
              <i class="fa-solid fa-xmark"></i> Limpar
            </button>
          </div>

          <!-- Tabela -->
          <div class="card" style="overflow:hidden;padding:0;">
            <div id="atrib-lista">
              <div style="padding:48px;text-align:center;">
                <div class="spinner" style="width:32px;height:32px;"></div>
                <p style="margin-top:14px;color:var(--text-muted);font-size:13px;">Carregando requisições…</p>
              </div>
            </div>
          </div>

        </div><!-- /atrib-main -->

      </div><!-- /atrib-root -->

      <style>
        /* ── Tabela ─────────────────────────────────────── */
        .atrib-table {
          width: 100%; border-collapse: collapse;
        }
        .atrib-table th {
          font-size: 10.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .06em; color: var(--text-subtle);
          padding: 11px 16px; text-align: left;
          border-bottom: 1px solid var(--border);
          background: var(--surface); white-space: nowrap;
        }
        .atrib-table td {
          padding: 13px 16px; border-bottom: 1px solid var(--border-subtle);
          vertical-align: middle;
        }
        .atrib-table tbody tr:hover td { background: var(--surface); }
        .atrib-table tbody tr:last-child td { border-bottom: none; }
        .atrib-row-ok td { background: #f0fdf4 !important; }
        .atrib-row-ok:hover td { background: #dcfce7 !important; }

        /* ── Badges ─────────────────────────────────────── */
        .atrib-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 700;
        }
        .atrib-sugestao-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: #f0fdf4; border: 1px solid #86efac;
          color: #15803d; border-radius: 20px;
          font-size: 11.5px; font-weight: 600; padding: 4px 11px;
        }

        /* ── Select de comprador ─────────────────────────── */
        .atrib-select {
          border: 1.5px solid var(--border); border-radius: 8px;
          padding: 7px 10px; font-size: 13px; font-family: inherit;
          background: var(--bg); color: var(--text);
          min-width: 190px; cursor: pointer; outline: none;
          transition: border-color .15s;
        }
        .atrib-select:focus { border-color: var(--brand); }
        .atrib-select.sugerido { border-color: #86efac; background: #f0fdf4; }

        /* ── Botão confirmar ─────────────────────────────── */
        .atrib-btn-ok {
          padding: 7px 16px; border-radius: 8px; border: none;
          background: var(--brand); color: #fff;
          font-size: 12.5px; font-weight: 700; cursor: pointer;
          transition: opacity .15s, background .15s; white-space: nowrap;
          font-family: inherit; display: inline-flex; align-items: center; gap: 6px;
        }
        .atrib-btn-ok:hover:not(:disabled) { opacity: .87; }
        .atrib-btn-ok:disabled { opacity: .35; cursor: not-allowed; }
        .atrib-btn-ok.done { background: #16a34a; }

        /* ── KPI cards ───────────────────────────────────── */
        .atrib-kpi {
          background: var(--card); border: 1px solid var(--border);
          border-radius: var(--r-lg); padding: 18px 20px;
        }
        .atrib-kpi-label {
          font-size: 10.5px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .06em; color: var(--text-subtle); margin-bottom: 8px;
        }
        .atrib-kpi-val {
          font-size: 30px; font-weight: 800; color: var(--text); line-height: 1;
        }
        .atrib-kpi-sub { font-size: 12px; color: var(--text-muted); margin-top: 4px; }

        /* ── Compradores distribuição ─────────────────────── */
        .atrib-dist-row {
          display: flex; align-items: center; gap: 10px;
          padding: 6px 0; border-bottom: 1px solid var(--border-subtle);
        }
        .atrib-dist-row:last-child { border-bottom: none; }
        .atrib-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; flex-shrink: 0;
        }
        .atrib-bar-wrap { flex: 1; height: 5px; background: var(--border); border-radius: 3px; }
        .atrib-bar { height: 100%; border-radius: 3px; background: var(--brand); min-width: 3px; }

        /* ── Chip de filtro ──────────────────────────────── */
        .atrib-chip {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 13px; border-radius: 20px;
          font-size: 11.5px; font-weight: 600; cursor: pointer;
          border: 1.5px solid var(--border);
          background: var(--bg); color: var(--text-muted);
          transition: all .15s; user-select: none;
        }
        .atrib-chip.on { background: var(--brand); color: #fff; border-color: var(--brand); }

        /* ── Avatar comprador na linha ───────────────────── */
        .atrib-comp-info {
          display: flex; align-items: center; gap: 8px;
        }
        .atrib-comp-avatar {
          width: 24px; height: 24px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 800; flex-shrink: 0;
        }
      </style>`;
  },

  // ── Init ──────────────────────────────────────────────────

  async init() {
    this._unidadeFiltrada = [];

    // Identificar usuário
    const email = localStorage.getItem('shp_user_email') || '';
    let perfil = { ativo: 0, nome: '', cargo: '' };
    try {
      perfil = await Api.get(`/api/usuarios/verificar?email=${encodeURIComponent(email)}`);
    } catch {}

    this._userNome  = perfil.nome || '';
    this._isGestora = this._GESTORAS.includes(this._userNome);

    const main   = document.getElementById('atrib-main');
    const denied = document.getElementById('atrib-access-denied');
    const hdrAct = document.getElementById('atrib-header-actions');

    if (!this._isGestora) {
      if (main)   main.style.display   = 'none';
      if (denied) denied.style.display = '';
      if (hdrAct) hdrAct.style.display = 'none';
      return;
    }

    await this._carregar();
  },

  // ── Dados ─────────────────────────────────────────────────

  async _carregar() {
    const lista = document.getElementById('atrib-lista');
    if (lista) {
      lista.innerHTML = `
        <div style="padding:48px;text-align:center;">
          <div class="spinner" style="width:32px;height:32px;"></div>
          <p style="margin-top:14px;color:var(--text-muted);font-size:13px;">Carregando requisições…</p>
        </div>`;
    }
    try {
      this._todos = await Api.get('/api/atribuicao/pendentes');
      this._renderKpis();
      this._renderChips();
      this._filtrar();
    } catch {
      if (lista) {
        lista.innerHTML = `
          <div class="empty-state" style="padding:60px;">
            <div class="empty-icon"><i class="fa-solid fa-circle-xmark"></i></div>
            <p class="empty-title">Erro ao carregar</p>
            <p class="empty-desc">Verifique a conexão e tente novamente.</p>
          </div>`;
      }
    }
  },

  // ── KPIs ──────────────────────────────────────────────────

  _renderKpis() {
    const wrap = document.getElementById('atrib-kpis');
    if (!wrap) return;

    const total       = this._todos.length;
    const semAtrib    = this._todos.filter(r => !r.comprador).length;
    const comAtrib    = total - semAtrib;

    // Distribuição por comprador
    const byComp = {};
    this._COMPRADORES.forEach(c => { byComp[c] = 0; });
    this._todos.forEach(r => {
      if (r.comprador && byComp.hasOwnProperty(r.comprador)) byComp[r.comprador]++;
    });
    const maxQtd = Math.max(1, ...Object.values(byComp));

    const distHtml = this._COMPRADORES.map(nome => {
      const qtd = byComp[nome] || 0;
      const cor = this._compradorCor(nome);
      const pct = Math.round((qtd / maxQtd) * 100);
      return `
        <div class="atrib-dist-row">
          <div class="atrib-avatar" style="background:${cor.bg};color:${cor.text};">
            ${this._inicialNome(nome)}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${nome}</div>
          </div>
          <div class="atrib-bar-wrap" style="width:60px;">
            <div class="atrib-bar" style="width:${pct}%;"></div>
          </div>
          <div style="font-size:12px;font-weight:700;color:var(--text-muted);min-width:20px;text-align:right;">${qtd}</div>
        </div>`;
    }).join('');

    wrap.innerHTML = `
      <!-- Pendentes -->
      <div class="atrib-kpi" style="border-top:3px solid var(--brand);">
        <div class="atrib-kpi-label"><i class="fa-solid fa-clock" style="color:var(--brand);margin-right:5px;"></i>Aguardando Atribuição</div>
        <div class="atrib-kpi-val" style="color:var(--brand);">${total}</div>
        <div class="atrib-kpi-sub">requisições aprovadas</div>
      </div>

      <!-- Sem comprador -->
      <div class="atrib-kpi" style="border-top:3px solid #f59e0b;">
        <div class="atrib-kpi-label"><i class="fa-solid fa-user-slash" style="color:#f59e0b;margin-right:5px;"></i>Sem Comprador</div>
        <div class="atrib-kpi-val" style="color:#f59e0b;">${semAtrib}</div>
        <div class="atrib-kpi-sub">precisam de atribuição</div>
      </div>

      <!-- Com comprador -->
      <div class="atrib-kpi" style="border-top:3px solid #16a34a;">
        <div class="atrib-kpi-label"><i class="fa-solid fa-user-check" style="color:#16a34a;margin-right:5px;"></i>Já Atribuídas</div>
        <div class="atrib-kpi-val" style="color:#16a34a;">${comAtrib}</div>
        <div class="atrib-kpi-sub">com comprador definido</div>
      </div>

      <!-- Distribuição -->
      <div class="atrib-kpi" style="grid-column:span 2;">
        <div class="atrib-kpi-label"><i class="fa-solid fa-users" style="margin-right:5px;"></i>Distribuição por Comprador</div>
        <div style="margin-top:8px;">${distHtml}</div>
      </div>`;
  },

  // ── Filtros ───────────────────────────────────────────────

  _renderChips() {
    const unidades = [...new Set(this._todos.map(r => r.unidade).filter(Boolean))].sort();
    const wrap = document.getElementById('atrib-chips-unidade');
    if (!wrap) return;
    wrap.innerHTML = unidades.map(u => {
      const cor = this._unidadeCor(u);
      const on  = this._unidadeFiltrada.includes(u);
      return `<span class="atrib-chip${on ? ' on' : ''}"
                    onclick="Pages.atribuicao._toggleChip('${u.replace(/'/g, "\\'")}')">
                <i class="fa-solid ${cor.icon}" style="font-size:10px;"></i> ${u}
              </span>`;
    }).join('');
  },

  _toggleChip(u) {
    const idx = this._unidadeFiltrada.indexOf(u);
    if (idx >= 0) this._unidadeFiltrada.splice(idx, 1);
    else this._unidadeFiltrada.push(u);
    this._renderChips();
    this._filtrar();
  },

  _limparFiltros() {
    this._unidadeFiltrada = [];
    const el = document.getElementById('atrib-busca');
    if (el) el.value = '';
    this._renderChips();
    this._filtrar();
  },

  _filtrar() {
    const busca = (document.getElementById('atrib-busca')?.value || '').toLowerCase();
    const lista = this._todos.filter(r => {
      if (this._unidadeFiltrada.length && !this._unidadeFiltrada.includes(r.unidade)) return false;
      if (busca && !`#${r.id} ${r.unidade || ''} ${r.solicitante || ''} ${r.setor || ''}`.toLowerCase().includes(busca)) return false;
      return true;
    });
    this._renderLista(lista);
  },

  // ── Lista ─────────────────────────────────────────────────

  _renderLista(itens) {
    const lista = document.getElementById('atrib-lista');
    if (!lista) return;

    if (!this._todos.length) {
      lista.innerHTML = `
        <div class="empty-state" style="padding:70px 20px;">
          <div class="empty-icon"><i class="fa-solid fa-circle-check" style="color:#16a34a;"></i></div>
          <p class="empty-title">Nenhuma requisição pendente</p>
          <p class="empty-desc">Todas as requisições aprovadas já estão em cotação.</p>
        </div>`;
      return;
    }

    if (!itens.length) {
      lista.innerHTML = `
        <div class="empty-state" style="padding:50px 20px;">
          <div class="empty-icon"><i class="fa-solid fa-filter"></i></div>
          <p class="empty-title">Nenhum resultado</p>
          <p class="empty-desc">Ajuste os filtros para ver as requisições.</p>
        </div>`;
      return;
    }

    lista.innerHTML = `
      <table class="atrib-table">
        <thead>
          <tr>
            <th>Requisição</th>
            <th>Unidade</th>
            <th>Itens Solicitados</th>
            <th>Data</th>
            <th>Sugestão Automática</th>
            <th>Atribuir Para</th>
            <th style="width:120px;"></th>
          </tr>
        </thead>
        <tbody>
          ${itens.map(r => this._htmlRow(r)).join('')}
        </tbody>
      </table>`;
  },

  _htmlRow(r) {
    const sugestao     = this._sugerirComprador(r.unidade);
    const compradorAtual = r.comprador || '';
    const jaConfirmado = compradorAtual && this._COMPRADORES.includes(compradorAtual);
    const cor          = this._unidadeCor(r.unidade);
    const corComp      = compradorAtual ? this._compradorCor(compradorAtual) : null;

    // Resumo dos itens
    const itensTexto = (r.itens || []).length > 0
      ? r.itens.map(i => `${i.quantidade}× ${i.descricao}`).join(' · ')
      : (r.justificativa || '—');
    const itensShort = itensTexto.length > 70 ? itensTexto.substring(0, 67) + '…' : itensTexto;

    // Select options
    const opts = `<option value="">— selecionar —</option>` +
      this._COMPRADORES.map(c => `<option value="${c}" ${compradorAtual === c ? 'selected' : ''}>${c}</option>`).join('');

    // Classe da linha
    const rowClass = jaConfirmado ? 'atrib-row-ok' : '';

    return `
      <tr id="atrib-row-${r.id}" class="${rowClass}">
        <td>
          <div style="font-size:14px;font-weight:800;color:var(--brand);">#${r.id}</div>
          <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${r.solicitante || '—'}</div>
        </td>
        <td>
          <span class="atrib-badge" style="background:${cor.bg};color:${cor.text};">
            <i class="fa-solid ${cor.icon}" style="font-size:9px;"></i>
            ${r.unidade || '—'}
          </span>
        </td>
        <td style="max-width:240px;">
          <div style="font-size:12.5px;color:var(--text);" title="${itensTexto}">${itensShort}</div>
        </td>
        <td>
          <div style="font-size:12px;color:var(--text-muted);white-space:nowrap;">${r.data || '—'}</div>
        </td>
        <td>
          ${sugestao
            ? `<span class="atrib-sugestao-badge"><i class="fa-solid fa-wand-sparkles" style="font-size:10px;"></i> ${sugestao}</span>`
            : `<span style="font-size:12px;color:var(--text-subtle);">Sem regra definida</span>`}
          ${r.unidade === 'Todas Unidades' ? `<div style="font-size:10.5px;color:var(--text-subtle);margin-top:4px;">Também elegível: Paola Schreiber</div>` : ''}
        </td>
        <td>
          <div class="atrib-comp-info">
            ${compradorAtual && corComp
              ? `<div class="atrib-comp-avatar" style="background:${corComp.bg};color:${corComp.text};">${this._inicialNome(compradorAtual)}</div>`
              : ''}
            <select class="atrib-select${sugestao && !compradorAtual ? ' sugerido' : ''}"
                    id="atrib-sel-${r.id}"
                    onchange="Pages.atribuicao._onSelChange(${r.id})">
              ${opts}
            </select>
          </div>
        </td>
        <td>
          <button class="atrib-btn-ok${jaConfirmado ? ' done' : ''}"
                  id="atrib-btn-${r.id}"
                  onclick="Pages.atribuicao._confirmar(${r.id})"
                  ${!compradorAtual ? 'disabled' : ''}>
            ${jaConfirmado
              ? '<i class="fa-solid fa-circle-check"></i> Atribuído'
              : '<i class="fa-solid fa-check"></i> Confirmar'}
          </button>
        </td>
      </tr>`;
  },

  // ── Ações ─────────────────────────────────────────────────

  _onSelChange(id) {
    const sel = document.getElementById(`atrib-sel-${id}`);
    const btn = document.getElementById(`atrib-btn-${id}`);
    if (btn) btn.disabled = !sel?.value;
  },

  async _confirmar(id) {
    const sel       = document.getElementById(`atrib-sel-${id}`);
    const comprador = sel?.value;
    if (!comprador) return;

    const btn = document.getElementById(`atrib-btn-${id}`);
    const selEl = document.getElementById(`atrib-sel-${id}`);
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; }

    try {
      await Api.patch(`/api/atribuicao/${id}`, { comprador });

      // Atualiza estado local
      const req = this._todos.find(r => r.id === id);
      if (req) req.comprador = comprador;

      // Atualiza UI da linha
      const row = document.getElementById(`atrib-row-${id}`);
      if (row) row.classList.add('atrib-row-ok');
      if (btn) { btn.className = 'atrib-btn-ok done'; btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Atribuído'; }
      if (selEl) { selEl.classList.remove('sugerido'); }

      // Atualiza avatar ao lado do select
      const cor = this._compradorCor(comprador);
      const compInfo = selEl?.closest('.atrib-comp-info');
      if (compInfo) {
        const oldAvatar = compInfo.querySelector('.atrib-comp-avatar');
        if (oldAvatar) oldAvatar.remove();
        const av = document.createElement('div');
        av.className = 'atrib-comp-avatar';
        av.style.cssText = `background:${cor.bg};color:${cor.text};`;
        av.textContent = this._inicialNome(comprador);
        compInfo.insertBefore(av, selEl);
      }

      this._renderKpis();
      Toast.success('Comprador atribuído!', `Requisição #${id} → ${comprador}`);
    } catch {
      Toast.error('Erro ao atribuir', 'Verifique a conexão e tente novamente.');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmar'; }
    }
  },

  async _aplicarRegras() {
    const paraAtribuir = this._todos.filter(r => {
      const sugestao = this._sugerirComprador(r.unidade);
      return sugestao && r.comprador !== sugestao;
    });

    if (!paraAtribuir.length) {
      Toast.info('Tudo em ordem', 'Todas as requisições já seguem as regras automáticas de atribuição.');
      return;
    }

    const ok = await Modal.confirm(
      'Aplicar Regras Automáticas',
      `Serão atribuídas automaticamente <strong>${paraAtribuir.length}</strong> requisição(ões) conforme as regras de unidade.<br><br>
       <span style="font-size:12px;color:var(--text-muted);">
         VCI → Ana Paula Alves &nbsp;·&nbsp;
         ITAPEVI → Giullia Galtarussa &nbsp;·&nbsp;
         Navegantes/Garuva → Luiz Felipe &nbsp;·&nbsp;
         Todas Unidades → Janaina Ferreira
       </span>`,
      { labelOk: 'Aplicar', labelCancel: 'Cancelar' }
    );
    if (!ok) return;

    const btnRegras = document.getElementById('atrib-btn-regras');
    if (btnRegras) { btnRegras.disabled = true; btnRegras.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Aplicando…'; }

    let sucesso = 0, erros = 0;

    for (const r of paraAtribuir) {
      const comprador = this._sugerirComprador(r.unidade);
      if (!comprador) continue;
      try {
        await Api.patch(`/api/atribuicao/${r.id}`, { comprador });
        r.comprador = comprador;
        sucesso++;

        // Atualiza a linha sem re-renderizar tudo
        const sel = document.getElementById(`atrib-sel-${r.id}`);
        if (sel) sel.value = comprador;
        const row = document.getElementById(`atrib-row-${r.id}`);
        if (row) row.classList.add('atrib-row-ok');
        const btn = document.getElementById(`atrib-btn-${r.id}`);
        if (btn) { btn.className = 'atrib-btn-ok done'; btn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Atribuído'; }
      } catch { erros++; }
    }

    if (btnRegras) { btnRegras.disabled = false; btnRegras.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> Aplicar Regras Automáticas'; }

    this._renderKpis();

    if (erros) Toast.warning('Aplicado com erros', `${sucesso} atribuídas com sucesso, ${erros} com erro.`);
    else       Toast.success('Regras aplicadas!', `${sucesso} requisição(ões) atribuídas automaticamente.`);
  },
};
