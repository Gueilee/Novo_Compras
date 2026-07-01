/* ============================================================
   SHP — CONFIGURAÇÕES
   Cadastro de Usuários/Gestores e Compradores por Unidade
   ============================================================ */
window.Pages = window.Pages || {};

window.Pages.configuracoes = {
  title: 'Configurações',

  _tab: 'usuarios',   // 'usuarios' | 'compradores' | 'orcamento' | 'fornecedores' | 'categorias'
  _tabTarget: null,   // set externally to open a specific tab on load
  _opts: { unidades: [], categorias: [], usuarios: [] },

  /* ── shell ─────────────────────────────────────────────── */
  render() {
    return `
    <div class="page-fade-in" id="cfg-root">

      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Configurações</h1>
          <p class="page-subtitle">Gerencie usuários, gestores e compradores responsáveis</p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="cfg-tabs" id="cfg-tabs">
        <button class="cfg-tab active" data-tab="usuarios"
                onclick="Pages.configuracoes._switchTab('usuarios')">
          <i class="fa-solid fa-users"></i> Usuários & Gestores
        </button>
        <button class="cfg-tab" data-tab="compradores"
                onclick="Pages.configuracoes._switchTab('compradores')">
          <i class="fa-solid fa-briefcase"></i> Compradores por Unidade
        </button>
        <button class="cfg-tab" data-tab="orcamento"
                onclick="Pages.configuracoes._switchTab('orcamento')">
          <i class="fa-solid fa-sack-dollar"></i> Orçamento por Unidade
        </button>
        <button class="cfg-tab" data-tab="fornecedores"
                onclick="Pages.configuracoes._switchTab('fornecedores')">
          <i class="fa-solid fa-building-user"></i> Fornecedores
        </button>
        <button class="cfg-tab" data-tab="categorias"
                onclick="Pages.configuracoes._switchTab('categorias')">
          <i class="fa-solid fa-tags"></i> Categorias
        </button>
        <button class="cfg-tab" data-tab="segmentos"
                onclick="Pages.configuracoes._switchTab('segmentos')">
          <i class="fa-solid fa-layer-group"></i> Segmentos de Compra
        </button>
        <button class="cfg-tab" data-tab="despesas"
                onclick="Pages.configuracoes._switchTab('despesas')">
          <i class="fa-solid fa-receipt"></i> Tipos de Despesa
        </button>
      </div>

      <!-- Content -->
      <div id="cfg-content">
        <div style="padding:60px;text-align:center;"><div class="spinner"></div></div>
      </div>

    </div>

    <style>
    /* ── Tabs ───────────────────────────────────────────────── */
    .cfg-tabs {
      display:flex; gap:4px; margin-bottom:24px;
      border-bottom:2px solid var(--border);
      padding-bottom:0;
    }
    .cfg-tab {
      padding:10px 20px; font-size:13.5px; font-weight:600;
      font-family:var(--font); cursor:pointer;
      background:none; border:none; color:var(--text-muted);
      display:flex; align-items:center; gap:8px;
      border-bottom:2px solid transparent; margin-bottom:-2px;
      transition:color .15s, border-color .15s;
    }
    .cfg-tab:hover { color:var(--text); }
    .cfg-tab.active { color:var(--brand); border-bottom-color:var(--brand); }

    /* ── Section card ────────────────────────────────────────── */
    .cfg-card {
      background:#fff; border:1px solid var(--border);
      border-radius:var(--r-lg); overflow:hidden; margin-bottom:20px;
    }
    .cfg-card-hdr {
      display:flex; align-items:center; justify-content:space-between;
      padding:16px 22px; border-bottom:1px solid var(--border-subtle);
      background:var(--bg);
    }
    .cfg-card-title {
      font-size:14px; font-weight:700; color:var(--text);
      display:flex; align-items:center; gap:8px;
    }
    .cfg-card-title i { color:var(--brand); }

    /* ── Table ───────────────────────────────────────────────── */
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
    .cfg-inactive { opacity:.45; }

    /* ── Action btns ─────────────────────────────────────────── */
    .cfg-act-btn {
      width:30px; height:30px; border-radius:8px;
      border:1px solid var(--border); background:var(--bg);
      cursor:pointer; display:inline-flex; align-items:center;
      justify-content:center; font-size:12px;
      transition:background .15s, border-color .15s, color .15s;
    }
    .cfg-act-edit  { color:var(--brand); }
    .cfg-act-edit:hover  { background:var(--brand-surface); border-color:var(--brand); }
    .cfg-act-del   { color:var(--accent); margin-left:4px; }
    .cfg-act-del:hover   { background:var(--accent-surface); border-color:var(--accent); }

    /* ── Form drawer ─────────────────────────────────────────── */
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
    .fdrw-sec-title { font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:.06em; color:var(--brand); margin-bottom:12px; display:flex; align-items:center; gap:6px; }
    .fdrw-seg-lbl { display:flex; align-items:center; gap:8px; padding:8px 11px; border:1.5px solid var(--border); border-radius:8px; cursor:pointer; background:var(--bg); font-size:12.5px; color:#333; user-select:none; transition:all .15s; }
    .fdrw-seg-lbl.on { border-color:var(--brand); background:#f0ecfa; }
    .fdrw-seg-box { width:16px; height:16px; border:2px solid #d0c4f9; border-radius:4px; background:#fff; display:flex; align-items:center; justify-content:center; flex-shrink:0; color:#fff; font-size:9px; transition:all .15s; }
    .fdrw-seg-lbl.on .fdrw-seg-box { background:var(--brand); border-color:var(--brand); }

    /* ── Toggle active ───────────────────────────────────────── */
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

    /* ── Priority badge ──────────────────────────────────────── */
    .cfg-prio {
      display:inline-flex; align-items:center; justify-content:center;
      width:24px; height:24px; border-radius:50%; font-size:11px;
      font-weight:800; border:2px solid;
    }
    .cfg-prio-1 { background:#422c7615; color:#422c76; border-color:#422c7640; }
    .cfg-prio-2 { background:rgba(1,225,142,.1); color:#00b870; border-color:rgba(1,225,142,.4); }
    .cfg-prio-3 { background:var(--accent-surface); color:var(--accent); border-color:rgba(255,47,105,.3); }

    /* ── Empty ───────────────────────────────────────────────── */
    .cfg-empty {
      padding:60px 24px; text-align:center;
    }
    .cfg-empty i { font-size:36px; color:var(--text-subtle); margin-bottom:12px; display:block; }
    .cfg-empty p { color:var(--text-muted); font-size:14px; }
    </style>`;
  },

  /* ── init ─────────────────────────────────────────────────── */
  async init() {
    try {
      this._opts = await Api.get('/api/configuracoes/opcoes');
    } catch {}
    // Allow external callers to pre-select a tab (e.g. user dropdown)
    const tab = this._tabTarget || this._tab || 'usuarios';
    this._tabTarget = null;
    this._switchTab(tab);
  },

  _switchTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.cfg-tab').forEach(b =>
      b.classList.toggle('active', b.dataset.tab === tab)
    );
    if (tab === 'usuarios')         this._loadUsuarios();
    else if (tab === 'orcamento')   this._loadOrcamento();
    else if (tab === 'fornecedores') this._loadFornecedores();
    else if (tab === 'categorias')  this._loadCategorias();
    else if (tab === 'segmentos')   this._loadSegmentos();
    else if (tab === 'despesas')    this._loadDespesas();
    else                            this._loadCompradores();
  },

  /* ══════════════════════════════════════════════════════════
     TAB 1 — USUÁRIOS & GESTORES
  ══════════════════════════════════════════════════════════ */
  async _loadUsuarios() {
    const el = document.getElementById('cfg-content');
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;
    try {
      const [rows, pendentes] = await Promise.all([
        Api.get('/api/usuarios'),
        Api.get('/api/usuarios/pendentes-acesso').catch(() => [])
      ]);
      el.innerHTML = this._htmlUsuariosTab(rows, pendentes);
    } catch {
      el.innerHTML = `<div class="cfg-empty"><i class="fa-solid fa-circle-xmark"></i><p>Erro ao carregar usuários</p></div>`;
    }
  },

  _htmlUsuariosTab(rows, pendentes = []) {
    // ── Seção de solicitações pendentes ──────────────────────
    const pendentesHtml = pendentes.length === 0 ? '' : `
      <div class="cfg-card" style="border-left:3px solid var(--warning,#f59e0b);margin-bottom:16px;">
        <div class="cfg-card-hdr">
          <span class="cfg-card-title" style="color:var(--warning-deeper,#b45309);">
            <i class="fa-solid fa-user-clock"></i>
            Solicitações de Acesso Pendentes
            <span class="badge" style="background:var(--warning-surface,#fef3c7);color:var(--warning-deeper,#b45309);margin-left:4px;">${pendentes.length}</span>
          </span>
        </div>
        <div style="padding:0 4px 4px;">
          ${pendentes.map(p => `
            <div style="display:flex;align-items:center;gap:12px;padding:12px 18px;border-bottom:1px solid var(--border-subtle);background:var(--warning-surface,#fffbeb)20;">
              <div style="width:36px;height:36px;border-radius:50%;background:var(--warning-surface,#fef3c7);
                          color:var(--warning-deeper,#b45309);display:flex;align-items:center;justify-content:center;
                          font-weight:800;font-size:13px;flex-shrink:0;">
                ${Fmt.shortName(p.nome)}
              </div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:600;color:var(--text);">${p.nome}</div>
                <div style="font-size:11.5px;color:var(--text-muted);">${p.email}</div>
                ${p.gestor_nome ? `<div style="font-size:11px;color:var(--text-subtle);margin-top:1px;"><i class="fa-solid fa-user-tie" style="font-size:9px;"></i> ${p.gestor_nome}</div>` : ''}
              </div>
              <div style="font-size:11px;color:var(--text-subtle);white-space:nowrap;">
                ${(p.criado_em||'').split('T')[0]||'—'}
              </div>
              <div style="display:flex;gap:6px;flex-shrink:0;">
                <button class="btn btn-primary btn-sm"
                        onclick="Pages.configuracoes._ativarUsuario(${p.id},'${p.nome.replace(/'/g,'')}')">
                  <i class="fa-solid fa-check"></i> Ativar
                </button>
                <button class="btn btn-outline btn-sm" style="color:var(--accent);border-color:var(--accent);"
                        onclick="Pages.configuracoes._rejeitarUsuario(${p.id},'${p.nome.replace(/'/g,'')}')">
                  <i class="fa-solid fa-xmark"></i> Rejeitar
                </button>
              </div>
            </div>`).join('')}
        </div>
      </div>`;

    // ── Tabela de usuários cadastrados ───────────────────────
    const tableRows = rows.length === 0
      ? `<tr><td colspan="7"><div class="cfg-empty">
           <i class="fa-solid fa-users"></i>
           <p>Nenhum usuário cadastrado ainda.<br>Clique em "Novo Usuário" para começar.</p>
         </div></td></tr>`
      : rows.map(u => `
          <tr class="${u.ativo ? '' : 'cfg-inactive'}" id="urow-${u.id}">
            <td>
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:34px;height:34px;border-radius:50%;background:var(--brand-surface);
                            color:var(--brand);display:flex;align-items:center;justify-content:center;
                            font-weight:800;font-size:13px;flex-shrink:0;">
                  ${Fmt.shortName(u.nome)}
                </div>
                <div>
                  <div style="font-weight:600;color:var(--text);">${u.nome}</div>
                  <div style="font-size:11.5px;color:var(--text-muted);">${u.email}</div>
                </div>
              </div>
            </td>
            <td>${u.unidade ? `<span class="badge badge-gray">${u.unidade}</span>` : '<span style="color:var(--text-subtle);">—</span>'}</td>
            <td style="font-size:12.5px;">${u.cargo || '<span style="color:var(--text-subtle);">—</span>'}</td>
            <td>
              ${u.gestor_nome
                ? `<span style="display:flex;align-items:center;gap:5px;font-size:12.5px;">
                     <i class="fa-solid fa-user-tie" style="color:var(--brand);font-size:10px;"></i>
                     ${u.gestor_nome}
                   </span>`
                : '<span style="color:var(--text-subtle);font-size:12px;">Sem gestor</span>'}
            </td>
            <td>
              <span class="badge ${u.ativo ? 'badge-success' : 'badge-gray'}">
                ${u.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td style="font-size:11.5px;color:var(--text-muted);">${(u.criado_em || '').split('T')[0] || u.criado_em || '—'}</td>
            <td style="text-align:center;white-space:nowrap;">
              <button class="cfg-act-btn" title="${u.ativo ? 'Desativar usuário' : 'Ativar usuário'}"
                      style="color:${u.ativo ? 'var(--warning-deeper,#b45309)' : 'var(--success-deeper,#007a50)'};"
                      onclick="Pages.configuracoes._toggleAtivo(${u.id}, ${u.ativo}, '${u.nome.replace(/'/g,'')}')">
                <i class="fa-solid ${u.ativo ? 'fa-user-slash' : 'fa-user-check'}"></i>
              </button>
              <button class="cfg-act-btn cfg-act-edit"
                      onclick="Pages.configuracoes._editUsuario(${u.id})"
                      title="Editar">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="cfg-act-btn cfg-act-del"
                      onclick="Pages.configuracoes._delUsuario(${u.id}, '${u.nome.replace(/'/g,'')}')"
                      title="Excluir">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>`).join('');

    return `
      ${pendentesHtml}
      <div class="cfg-card">
        <div class="cfg-card-hdr">
          <span class="cfg-card-title">
            <i class="fa-solid fa-users"></i>
            Usuários & Gestores
            <span class="badge badge-gray" style="margin-left:4px;">${rows.length}</span>
          </span>
          <button class="btn btn-primary btn-sm"
                  onclick="Pages.configuracoes._newUsuario()">
            <i class="fa-solid fa-plus"></i> Novo Usuário
          </button>
        </div>
        <div class="cfg-table-wrap">
          <table class="cfg-table">
            <thead>
              <tr>
                <th>Nome / E-mail</th>
                <th>Unidade</th>
                <th>Cargo</th>
                <th>Gestor Imediato</th>
                <th>Status</th>
                <th>Criado em</th>
                <th style="width:88px;text-align:center;">Ações</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
  },

  /* ── New / Edit usuario drawer ──────────────────────────── */
  _newUsuario() {
    this._openUsuarioDrawer(null);
  },

  async _editUsuario(id) {
    try {
      const all = await Api.get('/api/usuarios');
      const u = all.find(x => x.id === id);
      if (u) this._openUsuarioDrawer(u);
    } catch { Toast.error('Erro ao carregar usuário'); }
  },

  _openUsuarioDrawer(u) {
    const isEdit  = !!u;
    const opts    = this._opts;

    const unidOpts = ['', ...(opts.unidades || [])].map(v =>
      `<option value="${v}" ${u?.unidade === v ? 'selected':''}>${v || 'Selecione...'}</option>`
    ).join('');

    const gestorSugestoes = (opts.gestores_sugestoes || [])
      .filter(n => !isEdit || n !== u?.nome)  // não sugerir o próprio usuário
      .map(n => `<option value="${n}">`)
      .join('');

    const root = document.createElement('div');
    root.id = 'cfg-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="cfg-backdrop">
        <div class="cfg-drawer">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">${isEdit ? 'Editar Usuário' : 'Novo Usuário'}</div>
            <button class="cfg-drw-close" id="cfg-drw-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="cfg-drw-body">

            <div class="form-group">
              <label class="form-label form-label-required">Nome completo</label>
              <input id="cfg-u-nome" class="form-control" type="text"
                     placeholder="Nome completo" value="${u?.nome || ''}">
            </div>
            <div class="form-group">
              <label class="form-label form-label-required">E-mail</label>
              <input id="cfg-u-email" class="form-control" type="email"
                     placeholder="usuario@vendemmia.com" value="${u?.email || ''}">
            </div>
            <div class="form-grid form-grid-2">
              <div class="form-group">
                <label class="form-label">Unidade</label>
                <select id="cfg-u-unidade" class="form-control">
                  ${unidOpts}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Cargo</label>
                <input id="cfg-u-cargo" class="form-control" type="text"
                       placeholder="Ex: Analista, Gestor..." value="${u?.cargo || ''}">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fa-solid fa-user-tie" style="color:var(--brand);"></i>
                Gestor Imediato
              </label>
              <input id="cfg-u-gestor" class="form-control" type="text"
                     list="cfg-gestores-list"
                     placeholder="Digite ou selecione o nome do gestor..."
                     value="${u?.gestor_nome || ''}"
                     autocomplete="off">
              <datalist id="cfg-gestores-list">
                ${gestorSugestoes}
              </datalist>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">
                Selecione da lista ou digite um novo nome. Defina quem receberá as requisições deste usuário para aprovação.
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" style="display:flex;align-items:center;justify-content:space-between;">
                <span>Usuário Ativo</span>
                <label class="cfg-toggle">
                  <input type="checkbox" id="cfg-u-ativo" ${(u?.ativo ?? 1) ? 'checked' : ''}>
                  <span class="cfg-toggle-slider"></span>
                </label>
              </label>
            </div>

          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="cfg-u-cancel">Cancelar</button>
            <button class="btn btn-primary" id="cfg-u-save" data-id="${u?.id || ''}">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(root);

    const close = () => { root.remove(); };
    document.getElementById('cfg-drw-close').addEventListener('click', close);
    document.getElementById('cfg-u-cancel').addEventListener('click', close);
    document.getElementById('cfg-backdrop').addEventListener('click', e => {
      if (e.target === document.getElementById('cfg-backdrop')) close();
    });

    document.getElementById('cfg-u-save').addEventListener('click', async () => {
      const nome   = document.getElementById('cfg-u-nome').value.trim();
      const email  = document.getElementById('cfg-u-email').value.trim();
      if (!nome || !email) {
        Toast.warning('Campos obrigatórios', 'Informe nome e e-mail.');
        return;
      }
      const payload = {
        nome, email,
        unidade:     document.getElementById('cfg-u-unidade').value || null,
        cargo:       document.getElementById('cfg-u-cargo').value.trim() || null,
        gestor_nome: document.getElementById('cfg-u-gestor').value.trim() || null,
        ativo:       document.getElementById('cfg-u-ativo').checked ? 1 : 0,
      };
      const btn = document.getElementById('cfg-u-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        if (isEdit) await Api.patch(`/api/usuarios/${u.id}`, payload);
        else        await Api.post('/api/usuarios', payload);
        Toast.success(isEdit ? 'Usuário atualizado' : 'Usuário criado', nome);
        close();
        // Refresh opts and list
        this._opts = await Api.get('/api/configuracoes/opcoes').catch(() => this._opts);
        this._loadUsuarios();
      } catch (err) {
        Toast.error('Erro ao salvar', err.message || 'Verifique os dados.');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar Alterações' : 'Criar Usuário'}`;
      }
    });
  },

  async _importarHistorico() {
    const ok = await Modal.confirm({
      icon: 'info',
      title: 'Importar usuários do histórico?',
      body: `O sistema vai ler o histórico de requisições e cadastrar automaticamente:<br><br>
             <ul style="margin:8px 0 0 18px;font-size:13px;line-height:1.8;">
               <li>Todos os <strong>requisitantes</strong> únicos ("Criado por")</li>
               <li>Todos os <strong>gestores imediatos</strong> vinculados</li>
               <li>Unidade e gestor de cada pessoa</li>
             </ul><br>
             <span style="color:var(--text-muted);font-size:12px;">
               Usuários já cadastrados serão ignorados. Os e-mails serão gerados automaticamente
               (ex: ana.paula.alves@vendemmia.com.br) — você pode editar depois.
             </span>`,
      confirmText: 'Importar',
    });
    if (!ok) return;

    const btn = document.querySelector('button[onclick*="_importarHistorico"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importando...'; }

    try {
      const res = await Api.post('/api/usuarios/importar-historico', {});
      Toast.success(
        `${res.inseridos} usuário${res.inseridos !== 1 ? 's' : ''} importado${res.inseridos !== 1 ? 's' : ''}`,
        res.ignorados > 0 ? `${res.ignorados} já existiam e foram ignorados` : 'Importação concluída'
      );
      // Atualiza opts e recarrega lista
      this._opts = await Api.get('/api/configuracoes/opcoes').catch(() => this._opts);
      this._loadUsuarios();
    } catch (err) {
      Toast.error('Erro ao importar', err.message || '');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-file-import"></i> Importar do Histórico'; }
    }
  },

  async _delUsuario(id, nome) {
    const ok = await Modal.confirm({
      icon: 'danger', title: `Excluir "${nome}"?`,
      body: 'O usuário será removido permanentemente. Subordinados perderão o vínculo de gestor.',
      confirmText: 'Excluir', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/usuarios/${id}`);
      Toast.success('Usuário excluído', nome);
      this._opts = await Api.get('/api/configuracoes/opcoes').catch(() => this._opts);
      this._loadUsuarios();
    } catch { Toast.error('Erro ao excluir'); }
  },

  async _toggleAtivo(id, ativoAtual, nome) {
    const ativando = !ativoAtual;
    const ok = await Modal.confirm({
      icon: ativando ? 'info' : 'warning',
      title: ativando ? `Ativar "${nome}"?` : `Desativar "${nome}"?`,
      body: ativando
        ? 'O usuário poderá acessar o sistema e abrir requisições.'
        : 'O usuário perderá o acesso ao sistema. Pode ser reativado a qualquer momento.',
      confirmText: ativando ? 'Ativar' : 'Desativar',
    });
    if (!ok) return;
    try {
      if (ativando) {
        await Api.patch(`/api/usuarios/${id}/ativar`, {});
      } else {
        // busca dados completos para o PATCH existente
        const all = await Api.get('/api/usuarios');
        const u = all.find(x => x.id === id);
        if (!u) throw new Error('Usuário não encontrado');
        await Api.patch(`/api/usuarios/${id}`, { ...u, ativo: 0 });
      }
      Toast.success(ativando ? 'Usuário ativado' : 'Usuário desativado', nome);
      this._loadUsuarios();
    } catch { Toast.error('Erro ao alterar status'); }
  },

  async _ativarUsuario(id, nome) {
    const ok = await Modal.confirm({
      icon: 'info', title: `Ativar acesso para "${nome}"?`,
      body: 'O usuário receberá acesso ao sistema e poderá abrir requisições.',
      confirmText: 'Ativar Acesso',
    });
    if (!ok) return;
    try {
      await Api.patch(`/api/usuarios/${id}/ativar`, {});
      Toast.success('Acesso ativado', nome);
      this._opts = await Api.get('/api/configuracoes/opcoes').catch(() => this._opts);
      this._loadUsuarios();
    } catch { Toast.error('Erro ao ativar usuário'); }
  },

  async _rejeitarUsuario(id, nome) {
    const ok = await Modal.confirm({
      icon: 'danger', title: `Rejeitar solicitação de "${nome}"?`,
      body: 'A solicitação será removida e o usuário não terá acesso ao sistema.',
      confirmText: 'Rejeitar', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.patch(`/api/usuarios/${id}/rejeitar`, {});
      Toast.success('Solicitação rejeitada', nome);
      this._loadUsuarios();
    } catch { Toast.error('Erro ao rejeitar solicitação'); }
  },

  /* ══════════════════════════════════════════════════════════
     TAB 2 — COMPRADORES POR UNIDADE
  ══════════════════════════════════════════════════════════ */
  async _loadCompradores() {
    const el = document.getElementById('cfg-content');
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;
    try {
      const rows = await Api.get('/api/compradores');
      el.innerHTML = this._htmlCompradoresTab(rows);
    } catch {
      el.innerHTML = `<div class="cfg-empty"><i class="fa-solid fa-circle-xmark"></i><p>Erro ao carregar compradores</p></div>`;
    }
  },

  _htmlCompradoresTab(rows) {
    const prioLabel = p => {
      const cls = p <= 1 ? 'cfg-prio-1' : p === 2 ? 'cfg-prio-2' : 'cfg-prio-3';
      return `<span class="cfg-prio ${cls}">${p}</span>`;
    };

    const tableRows = rows.length === 0
      ? `<tr><td colspan="7"><div class="cfg-empty">
           <i class="fa-solid fa-briefcase"></i>
           <p>Nenhum comprador cadastrado.<br>Clique em "Novo Comprador" para começar.</p>
         </div></td></tr>`
      : rows.map(c => `
          <tr class="${c.ativo ? '' : 'cfg-inactive'}" id="crow-${c.id}">
            <td>
              <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:34px;height:34px;border-radius:50%;background:rgba(1,225,142,.1);
                            color:#00b870;display:flex;align-items:center;justify-content:center;
                            font-weight:800;font-size:13px;flex-shrink:0;">
                  ${Fmt.shortName(c.comprador)}
                </div>
                <div>
                  <div style="font-weight:600;">${c.comprador}</div>
                  ${c.email ? `<div style="font-size:11.5px;color:var(--text-muted);">${c.email}</div>` : ''}
                </div>
              </div>
            </td>
            <td>${c.unidade
              ? `<span class="badge badge-brand">${c.unidade}</span>`
              : `<span class="badge badge-gray">Todas</span>`}</td>
            <td>${c.categoria
              ? `<span class="badge badge-gray" style="font-size:11px;">${c.categoria}</span>`
              : `<span style="color:var(--text-subtle);font-size:12px;">Todas</span>`}</td>
            <td style="text-align:center;">${prioLabel(c.prioridade || 1)}</td>
            <td>
              <span class="badge ${c.ativo ? 'badge-success' : 'badge-gray'}">
                ${c.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </td>
            <td style="text-align:center;white-space:nowrap;">
              <button class="cfg-act-btn cfg-act-edit"
                      onclick="Pages.configuracoes._editComprador(${c.id})"
                      title="Editar">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="cfg-act-btn cfg-act-del"
                      onclick="Pages.configuracoes._delComprador(${c.id}, '${c.comprador.replace(/'/g,'')}')"
                      title="Excluir">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>`).join('');

    return `
      <div class="cfg-card">
        <div class="cfg-card-hdr">
          <span class="cfg-card-title">
            <i class="fa-solid fa-briefcase"></i>
            Compradores por Unidade / Categoria
            <span class="badge badge-gray" style="margin-left:4px;">${rows.length}</span>
          </span>
          <button class="btn btn-primary btn-sm"
                  onclick="Pages.configuracoes._newComprador()">
            <i class="fa-solid fa-plus"></i> Novo Comprador
          </button>
        </div>
        <div style="padding:12px 22px;background:var(--brand-surface);border-bottom:1px solid var(--border-subtle);
                    font-size:12.5px;color:var(--brand);display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-circle-info"></i>
          <span>Prioridade <strong>1</strong> = maior prioridade no roteamento automático.
          Deixe Unidade/Categoria em branco para o comprador receber <strong>todas</strong> as requisições.</span>
        </div>
        <div class="cfg-table-wrap">
          <table class="cfg-table">
            <thead>
              <tr>
                <th>Comprador</th>
                <th>Unidade</th>
                <th>Categoria</th>
                <th style="text-align:center;">Prioridade</th>
                <th>Status</th>
                <th style="width:72px;text-align:center;">Ações</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
  },

  /* ── Importar compradores do histórico ─────────────────── */
  async _importarCompradoresHistorico() {
    const ok = await Modal.confirm({
      icon: 'info',
      title: 'Importar compradores do histórico?',
      body: `O sistema vai ler o histórico de requisições e cadastrar automaticamente:<br><br>
             <ul style="margin:8px 0 0 18px;font-size:13px;line-height:1.8;">
               <li>Todos os <strong>compradores únicos</strong> por unidade</li>
               <li>Categoria atribuída automaticamente pela mais frequente</li>
               <li>Se o comprador atende múltiplas categorias, fica sem categoria (atende todas)</li>
             </ul><br>
             <span style="color:var(--text-muted);font-size:12px;">
               Registros já existentes serão ignorados. Você pode editar categoria e prioridade depois.
             </span>`,
      confirmText: 'Importar',
    });
    if (!ok) return;

    const btn = document.querySelector('button[onclick*="_importarCompradoresHistorico"]');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Importando...'; }

    try {
      const res = await Api.post('/api/compradores/importar-historico', {});
      Toast.success(
        `${res.inseridos} comprador${res.inseridos !== 1 ? 'es' : ''} importado${res.inseridos !== 1 ? 's' : ''}`,
        res.ignorados > 0 ? `${res.ignorados} já existiam e foram ignorados` : 'Importação concluída'
      );
      this._loadCompradores();
    } catch (err) {
      Toast.error('Erro ao importar compradores', err.message || '');
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-file-import"></i> Importar do Histórico'; }
    }
  },

  /* ── New / Edit comprador drawer ────────────────────────── */
  _newComprador() { this._openCompradorDrawer(null); },

  async _editComprador(id) {
    try {
      const all = await Api.get('/api/compradores');
      const c = all.find(x => x.id === id);
      if (c) this._openCompradorDrawer(c);
    } catch { Toast.error('Erro ao carregar comprador'); }
  },

  _openCompradorDrawer(c) {
    const isEdit = !!c;
    const opts   = this._opts;

    const unidOpts = [
      `<option value="">Todas as unidades</option>`,
      ...(opts.unidades || []).map(v =>
        `<option value="${v}" ${c?.unidade === v ? 'selected':''}>${v}</option>`)
    ].join('');

    const catOpts = [
      `<option value="">Todas as categorias</option>`,
      ...(opts.categorias || []).map(v =>
        `<option value="${v}" ${c?.categoria === v ? 'selected':''}>${v}</option>`)
    ].join('');

    const root = document.createElement('div');
    root.id = 'cfg-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="cfg-backdrop">
        <div class="cfg-drawer">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">${isEdit ? 'Editar Comprador' : 'Novo Comprador'}</div>
            <button class="cfg-drw-close" id="cfg-drw-close">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div class="cfg-drw-body">

            <div class="form-group">
              <label class="form-label form-label-required">Nome do Comprador</label>
              <input id="cfg-c-nome" class="form-control" type="text"
                     placeholder="Nome completo" value="${c?.comprador || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">E-mail</label>
              <input id="cfg-c-email" class="form-control" type="email"
                     placeholder="comprador@vendemmia.com" value="${c?.email || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Unidade Responsável</label>
              <select id="cfg-c-unidade" class="form-control">${unidOpts}</select>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">
                Deixe em branco para atender todas as unidades
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Categoria Responsável</label>
              <select id="cfg-c-categoria" class="form-control">${catOpts}</select>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">
                Deixe em branco para atender todas as categorias
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Prioridade de Roteamento</label>
              <select id="cfg-c-prio" class="form-control">
                <option value="1" ${(c?.prioridade||1)===1?'selected':''}>1 — Alta (primeiro a receber)</option>
                <option value="2" ${c?.prioridade===2?'selected':''}>2 — Média</option>
                <option value="3" ${c?.prioridade===3?'selected':''}>3 — Baixa (fallback)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="display:flex;align-items:center;justify-content:space-between;">
                <span>Comprador Ativo</span>
                <label class="cfg-toggle">
                  <input type="checkbox" id="cfg-c-ativo" ${(c?.ativo ?? 1) ? 'checked' : ''}>
                  <span class="cfg-toggle-slider"></span>
                </label>
              </label>
            </div>

          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="cfg-c-cancel">Cancelar</button>
            <button class="btn btn-primary" id="cfg-c-save">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar Alterações' : 'Criar Comprador'}
            </button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(root);

    const close = () => root.remove();
    document.getElementById('cfg-drw-close').addEventListener('click', close);
    document.getElementById('cfg-c-cancel').addEventListener('click', close);
    document.getElementById('cfg-backdrop').addEventListener('click', e => {
      if (e.target === document.getElementById('cfg-backdrop')) close();
    });

    document.getElementById('cfg-c-save').addEventListener('click', async () => {
      const comprador = document.getElementById('cfg-c-nome').value.trim();
      if (!comprador) { Toast.warning('Campo obrigatório', 'Informe o nome do comprador.'); return; }
      const payload = {
        comprador,
        email:      document.getElementById('cfg-c-email').value.trim() || null,
        unidade:    document.getElementById('cfg-c-unidade').value || null,
        categoria:  document.getElementById('cfg-c-categoria').value || null,
        prioridade: parseInt(document.getElementById('cfg-c-prio').value) || 1,
        ativo:      document.getElementById('cfg-c-ativo').checked ? 1 : 0,
      };
      const btn = document.getElementById('cfg-c-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        if (isEdit) await Api.patch(`/api/compradores/${c.id}`, payload);
        else        await Api.post('/api/compradores', payload);
        Toast.success(isEdit ? 'Comprador atualizado' : 'Comprador criado', comprador);
        close();
        this._loadCompradores();
      } catch (err) {
        Toast.error('Erro ao salvar', err.message || 'Verifique os dados.');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar Alterações' : 'Criar Comprador'}`;
      }
    });
  },

  async _delComprador(id, nome) {
    const ok = await Modal.confirm({
      icon: 'danger', title: `Excluir comprador "${nome}"?`,
      body: 'O registro de responsabilidade será removido permanentemente.',
      confirmText: 'Excluir', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/compradores/${id}`);
      Toast.success('Comprador excluído', nome);
      this._loadCompradores();
    } catch { Toast.error('Erro ao excluir'); }
  },

  /* ══════════════════════════════════════════════════════════
     TAB 3 — ORÇAMENTO POR UNIDADE
  ══════════════════════════════════════════════════════════ */
  async _loadOrcamento() {
    const el = document.getElementById('cfg-content');
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;
    try {
      const data = await Api.get('/api/orcamentos');
      el.innerHTML = this._htmlOrcamentoTab(data.orcamentos || [], data.unidades || []);
    } catch {
      el.innerHTML = `<div class="cfg-empty"><i class="fa-solid fa-circle-xmark"></i><p>Erro ao carregar orçamentos</p></div>`;
    }
  },

  _htmlOrcamentoTab(rows, unidades) {
    const pctBar = (pct) => {
      const color = pct > 90 ? '#ff2f69' : pct > 75 ? '#f59e0b' : '#01E18E';
      return `
        <div style="display:flex;align-items:center;gap:8px;min-width:140px;">
          <div style="flex:1;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">
            <div style="height:100%;width:${Math.min(pct,100)}%;background:${color};border-radius:3px;transition:width .3s;"></div>
          </div>
          <span style="font-size:11.5px;font-weight:700;color:${color};min-width:38px;text-align:right;">${pct.toFixed(1)}%</span>
        </div>`;
    };

    const tableRows = rows.length === 0
      ? `<tr><td colspan="6"><div class="cfg-empty">
           <i class="fa-solid fa-sack-dollar"></i>
           <p>Nenhum orçamento cadastrado ainda.<br>Clique em "Novo Orçamento" para começar.</p>
         </div></td></tr>`
      : rows.map(o => `
          <tr id="orow-${o.unidade}-${o.ano}">
            <td><span class="badge badge-brand">${o.unidade}</span></td>
            <td style="font-weight:700;color:var(--text);font-size:14px;">${o.ano}</td>
            <td style="font-weight:700;font-size:13.5px;">${Fmt.currency(o.orcamento_anual)}</td>
            <td style="color:var(--text-muted);font-size:13px;">${Fmt.currency(o.consumido)}</td>
            <td>${pctBar(o.percentual)}</td>
            <td style="text-align:center;white-space:nowrap;">
              <button class="cfg-act-btn cfg-act-edit"
                      onclick="Pages.configuracoes._editOrcamento('${o.unidade}', ${o.ano}, ${o.orcamento_anual})"
                      title="Editar valor">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="cfg-act-btn cfg-act-del"
                      onclick="Pages.configuracoes._delOrcamento('${o.unidade}', ${o.ano})"
                      title="Excluir">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>`).join('');

    // Anos únicos existentes + range fixo até 2030
    const anoAtual = new Date().getFullYear();
    const anosFixos = [];
    for (let a = anoAtual - 1; a <= 2030; a++) anosFixos.push(a);
    const anosDisp = [...new Set([...anosFixos, ...rows.map(r => r.ano)])].sort();

    // Inline form para novo orçamento
    const unidOpts = unidades.map(u => `<option value="${u}">${u}</option>`).join('');
    const anoOpts  = anosDisp.map(a => `<option value="${a}" ${a === anoAtual ? 'selected' : ''}>${a}</option>`).join('');

    return `
      <div class="cfg-card">
        <div class="cfg-card-hdr">
          <span class="cfg-card-title">
            <i class="fa-solid fa-sack-dollar"></i>
            Orçamento Anual por Unidade
            <span class="badge badge-gray" style="margin-left:4px;">${rows.length}</span>
          </span>
          <button class="btn btn-primary btn-sm" onclick="Pages.configuracoes._toggleNovoOrcForm()">
            <i class="fa-solid fa-plus"></i> Novo Orçamento
          </button>
        </div>

        <!-- Formulário inline para novo orçamento -->
        <div id="novo-orc-form" style="display:none;padding:18px 22px;border-bottom:1px solid var(--border);background:var(--brand-surface);">
          <div style="font-size:13px;font-weight:700;color:var(--brand);margin-bottom:14px;">
            <i class="fa-solid fa-plus-circle"></i> Cadastrar Orçamento
          </div>
          <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;">
            <div class="form-group" style="margin:0;flex:1;min-width:160px;">
              <label class="form-label">Unidade</label>
              <select id="orc-unidade" class="form-control">
                <option value="">Selecione...</option>
                ${unidOpts}
              </select>
            </div>
            <div class="form-group" style="margin:0;min-width:110px;">
              <label class="form-label">Ano</label>
              <select id="orc-ano" class="form-control">
                ${anoOpts}
              </select>
            </div>
            <div class="form-group" style="margin:0;flex:1;min-width:200px;">
              <label class="form-label">Valor do Orçamento (R$)</label>
              <input id="orc-valor" class="form-control" type="number" min="0" step="0.01"
                     placeholder="Ex: 500000.00">
            </div>
            <div style="display:flex;gap:8px;padding-bottom:1px;">
              <button class="btn btn-primary" onclick="Pages.configuracoes._salvarOrcamento()">
                <i class="fa-solid fa-floppy-disk"></i> Salvar
              </button>
              <button class="btn btn-outline" onclick="Pages.configuracoes._toggleNovoOrcForm()">
                Cancelar
              </button>
            </div>
          </div>
        </div>

        <!-- Resumo anual -->
        ${rows.length > 0 ? this._orcResumo(rows) : ''}

        <div class="cfg-table-wrap">
          <table class="cfg-table">
            <thead>
              <tr>
                <th>Unidade</th>
                <th>Ano</th>
                <th>Orçamento Anual</th>
                <th>Consumido</th>
                <th style="min-width:160px;">Utilização</th>
                <th style="width:80px;text-align:center;">Ações</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
  },

  _orcResumo(rows) {
    // Agrupa por ano
    const porAno = {};
    rows.forEach(r => {
      if (!porAno[r.ano]) porAno[r.ano] = { total: 0, consumido: 0 };
      porAno[r.ano].total    += r.orcamento_anual;
      porAno[r.ano].consumido += r.consumido;
    });
    const anos = Object.keys(porAno).sort().reverse();
    return `
      <div style="display:flex;gap:12px;flex-wrap:wrap;padding:14px 22px;border-bottom:1px solid var(--border-subtle);">
        ${anos.map(ano => {
          const d = porAno[ano];
          const pct = d.total > 0 ? (d.consumido / d.total * 100).toFixed(1) : 0;
          const color = pct > 90 ? '#ff2f69' : pct > 75 ? '#f59e0b' : '#01E18E';
          return `
            <div style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:14px 18px;min-width:200px;">
              <div style="font-size:11px;font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.06em;">Consolidado ${ano}</div>
              <div style="font-size:20px;font-weight:800;color:var(--text);margin-top:4px;">${Fmt.currency(d.total)}</div>
              <div style="font-size:12px;color:${color};margin-top:2px;font-weight:600;">
                ${Fmt.currency(d.consumido)} consumido · ${pct}% utilizado
              </div>
            </div>`;
        }).join('')}
      </div>`;
  },

  _toggleNovoOrcForm() {
    const form = document.getElementById('novo-orc-form');
    if (!form) return;
    const visible = form.style.display !== 'none';
    form.style.display = visible ? 'none' : 'block';
    if (!visible) document.getElementById('orc-valor')?.focus();
  },

  async _salvarOrcamento() {
    const unidade = document.getElementById('orc-unidade')?.value;
    const ano     = parseInt(document.getElementById('orc-ano')?.value);
    const valor   = parseFloat(document.getElementById('orc-valor')?.value);

    if (!unidade) { Toast.warning('Campo obrigatório', 'Selecione a unidade.'); return; }
    if (!ano || isNaN(ano)) { Toast.warning('Campo obrigatório', 'Selecione o ano.'); return; }
    if (!valor || isNaN(valor) || valor <= 0) { Toast.warning('Valor inválido', 'Informe um valor maior que zero.'); return; }

    try {
      await Api.post('/api/orcamentos/salvar', { unidade, ano, orcamento_anual: valor });
      Toast.success('Orçamento salvo', `${unidade} · ${ano} · ${Fmt.currency(valor)}`);
      this._loadOrcamento();
    } catch (err) {
      Toast.error('Erro ao salvar orçamento', err.message || '');
    }
  },

  _editOrcamento(unidade, ano, valorAtual) {
    // Remove instância anterior se existir
    document.getElementById('orc-edit-backdrop')?.remove();

    const root = document.createElement('div');
    root.id = 'orc-edit-backdrop';
    root.innerHTML = `
      <div style="position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);
                  z-index:2000;display:flex;align-items:center;justify-content:center;
                  animation:fadeIn .15s ease;">
        <div style="background:#fff;border-radius:20px;width:440px;max-width:95vw;
                    box-shadow:0 20px 60px rgba(0,0,0,.2);overflow:hidden;
                    animation:slideUp .2s ease;">

          <!-- Header -->
          <div style="padding:22px 26px 18px;border-bottom:1px solid var(--border-subtle);
                      display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:16px;font-weight:800;color:var(--text);">
                <i class="fa-solid fa-pen-to-square" style="color:var(--brand);margin-right:8px;"></i>
                Editar Orçamento
              </div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">
                <span class="badge badge-brand" style="margin-right:6px;">${unidade}</span> Ano ${ano}
              </div>
            </div>
            <button id="orc-edit-close"
                    style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border);
                           background:none;cursor:pointer;display:flex;align-items:center;
                           justify-content:center;color:var(--text-muted);font-size:14px;">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <!-- Body -->
          <div style="padding:24px 26px;display:flex;flex-direction:column;gap:18px;">

            <!-- Info atual -->
            <div style="background:var(--brand-surface);border:1px solid var(--brand);
                        border-radius:12px;padding:14px 18px;
                        display:flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;border-radius:10px;background:var(--brand);
                          display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                <i class="fa-solid fa-sack-dollar" style="color:#fff;font-size:16px;"></i>
              </div>
              <div>
                <div style="font-size:11px;color:var(--brand);font-weight:700;text-transform:uppercase;letter-spacing:.06em;">
                  Valor atual
                </div>
                <div style="font-size:20px;font-weight:800;color:var(--brand);">
                  ${Fmt.currency(valorAtual)}
                </div>
              </div>
            </div>

            <!-- Input novo valor -->
            <div class="form-group" style="margin:0;">
              <label class="form-label form-label-required">Novo valor do orçamento (R$)</label>
              <div style="position:relative;">
                <span style="position:absolute;left:14px;top:50%;transform:translateY(-50%);
                             font-size:13px;font-weight:600;color:var(--text-muted);">R$</span>
                <input id="orc-edit-valor" class="form-control" type="number" min="0" step="0.01"
                       value="${valorAtual}"
                       style="padding-left:36px;font-size:15px;font-weight:600;"
                       placeholder="0,00">
              </div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">
                Informe o novo valor total do orçamento anual para ${unidade} em ${ano}.
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div style="padding:16px 26px;border-top:1px solid var(--border-subtle);
                      display:flex;justify-content:flex-end;gap:10px;">
            <button id="orc-edit-cancel" class="btn btn-outline">Cancelar</button>
            <button id="orc-edit-save" class="btn btn-primary">
              <i class="fa-solid fa-floppy-disk"></i> Salvar Alteração
            </button>
          </div>

        </div>
      </div>
      <style>
        @keyframes slideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
      </style>`;

    document.body.appendChild(root);

    const close = () => root.remove();
    document.getElementById('orc-edit-close').addEventListener('click', close);
    document.getElementById('orc-edit-cancel').addEventListener('click', close);

    // Seleciona o input automaticamente
    setTimeout(() => {
      const inp = document.getElementById('orc-edit-valor');
      if (inp) { inp.focus(); inp.select(); }
    }, 100);

    document.getElementById('orc-edit-save').addEventListener('click', async () => {
      const valor = parseFloat(document.getElementById('orc-edit-valor').value);
      if (isNaN(valor) || valor <= 0) {
        Toast.warning('Valor inválido', 'Informe um valor maior que zero.');
        return;
      }
      const btn = document.getElementById('orc-edit-save');
      btn.disabled = true;
      btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
      try {
        await Api.post('/api/orcamentos/salvar', { unidade, ano, orcamento_anual: valor });
        Toast.success('Orçamento atualizado', `${unidade} · ${ano} · ${Fmt.currency(valor)}`);
        close();
        this._loadOrcamento();
      } catch (err) {
        Toast.error('Erro ao atualizar orçamento', err.message || '');
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Salvar Alteração';
      }
    });
  },

  async _delOrcamento(unidade, ano) {
    const ok = await Modal.confirm({
      icon: 'danger',
      title: `Excluir orçamento ${unidade} - ${ano}?`,
      body: 'O registro de orçamento será removido. O consumo não será afetado.',
      confirmText: 'Excluir', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/orcamentos/${unidade}/${ano}`);
      Toast.success('Orçamento excluído', `${unidade} · ${ano}`);
      this._loadOrcamento();
    } catch { Toast.error('Erro ao excluir'); }
  },

  /* ══════════════════════════════════════════════════════════
     TAB 4 — FORNECEDORES HOMOLOGADOS
  ══════════════════════════════════════════════════════════ */
  async _loadFornecedores() {
    const el = document.getElementById('cfg-content');
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;
    try {
      const rows = await Api.get('/api/catalogo/fornecedores');
      el.innerHTML = this._htmlFornecedoresTab(rows);
    } catch {
      el.innerHTML = `<div class="cfg-empty"><i class="fa-solid fa-circle-xmark"></i><p>Erro ao carregar fornecedores</p></div>`;
    }
  },

  _htmlFornecedoresTab(rows) {
    const tableRows = !rows.length
      ? `<tr><td colspan="6"><div class="cfg-empty"><i class="fa-solid fa-building-user"></i><p>Nenhum fornecedor cadastrado.<br>Clique em "Novo Fornecedor" para começar.</p></div></td></tr>`
      : rows.map(f => `
          <tr id="frow-${(f.cnpj||'').replace(/\D/g,'')}">
            <td>
              <div style="font-weight:600;color:var(--text);">${f.razao_social || f.nome || '—'}</div>
              <div style="font-size:11.5px;color:var(--text-muted);">${f.cnpj || '—'}</div>
            </td>
            <td style="font-size:12.5px;">${f.segmento || f.categoria || '<span style="color:var(--text-subtle);">—</span>'}</td>
            <td style="font-size:12.5px;">${f.cidade ? `${f.cidade}${f.estado ? '/' + f.estado : ''}` : '<span style="color:var(--text-subtle);">—</span>'}</td>
            <td style="font-size:12.5px;">${f.email || '<span style="color:var(--text-subtle);">—</span>'}</td>
            <td style="font-size:12.5px;">${f.telefone || '<span style="color:var(--text-subtle);">—</span>'}</td>
            <td style="text-align:center;white-space:nowrap;">
              <button class="cfg-act-btn cfg-act-edit"
                      onclick="Pages.configuracoes._editFornecedor('${(f.cnpj||'').replace(/\D/g,'')}')"
                      title="Editar"><i class="fa-solid fa-pen-to-square"></i></button>
              <button class="cfg-act-btn cfg-act-del"
                      onclick="Pages.configuracoes._delFornecedor('${(f.cnpj||'').replace(/\D/g,'')}','${(f.razao_social||f.nome||'').replace(/'/g,'')}')"
                      title="Excluir"><i class="fa-solid fa-trash"></i></button>
            </td>
          </tr>`).join('');

    return `
      <div class="cfg-card">
        <div class="cfg-card-hdr">
          <span class="cfg-card-title">
            <i class="fa-solid fa-building-user"></i>
            Fornecedores Homologados
            <span class="badge badge-gray" style="margin-left:4px;">${rows.length}</span>
          </span>
          <button class="btn btn-outline btn-sm" onclick="Pages.configuracoes._linkCadastroFornecedor()"
                  title="Gerar link para o fornecedor preencher o próprio cadastro">
            <i class="fa-solid fa-link"></i> Link de Auto-Cadastro
          </button>
          <button class="btn btn-primary btn-sm" onclick="Pages.configuracoes._newFornecedor()">
            <i class="fa-solid fa-plus"></i> Novo Fornecedor
          </button>
        </div>
        <div class="cfg-table-wrap">
          <table class="cfg-table">
            <thead>
              <tr>
                <th>Razão Social / CNPJ</th>
                <th>Segmento</th>
                <th>Cidade/UF</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th style="width:72px;text-align:center;">Ações</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
  },

  _newFornecedor() { this._openFornecedorDrawer(null); },

  _linkCadastroFornecedor() {
    const base = window.location.href.split('#')[0].replace(/\/[^/]*$/, '/');
    const url  = base + 'cadastro-fornecedor.html';

    const root = document.createElement('div');
    root.id = 'cfg-link-modal';
    root.style.cssText = 'position:fixed;inset:0;z-index:3000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.45);backdrop-filter:blur(3px);padding:20px;';
    root.innerHTML = `
      <div style="background:#fff;border-radius:18px;box-shadow:0 24px 64px rgba(0,0,0,.22);
                  width:100%;max-width:560px;overflow:hidden;animation:fadeIn .2s ease;">

        <!-- Header -->
        <div style="display:flex;align-items:center;gap:14px;padding:20px 24px;border-bottom:1px solid var(--border);">
          <div style="width:44px;height:44px;background:var(--brand-surface);border-radius:12px;
               display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i class="fa-solid fa-link" style="color:var(--brand);font-size:18px;"></i>
          </div>
          <div style="flex:1;">
            <div style="font-size:15px;font-weight:800;color:var(--text);">Link de Auto-Cadastro</div>
            <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
              Envie este link ao fornecedor — ele preenche os dados e salva direto no sistema
            </div>
          </div>
          <button onclick="document.getElementById('cfg-link-modal').remove()"
                  style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border);
                         background:none;cursor:pointer;display:flex;align-items:center;
                         justify-content:center;color:var(--text-muted);font-size:14px;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Body -->
        <div style="padding:22px 24px;">

          <!-- Como funciona -->
          <div style="display:flex;gap:20px;margin-bottom:22px;flex-wrap:wrap;">
            <div style="flex:1;min-width:130px;text-align:center;">
              <div style="width:40px;height:40px;background:var(--brand-surface);border-radius:12px;
                   display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">
                <i class="fa-solid fa-copy" style="color:var(--brand);"></i>
              </div>
              <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:3px;">1. Copie o link</div>
              <div style="font-size:11px;color:var(--text-muted);">Botão abaixo já copia</div>
            </div>
            <div style="flex:1;min-width:130px;text-align:center;">
              <div style="width:40px;height:40px;background:var(--brand-surface);border-radius:12px;
                   display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">
                <i class="fa-solid fa-paper-plane" style="color:var(--brand);"></i>
              </div>
              <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:3px;">2. Envie ao fornecedor</div>
              <div style="font-size:11px;color:var(--text-muted);">WhatsApp, e-mail, etc.</div>
            </div>
            <div style="flex:1;min-width:130px;text-align:center;">
              <div style="width:40px;height:40px;background:var(--success-surface);border-radius:12px;
                   display:flex;align-items:center;justify-content:center;margin:0 auto 8px;">
                <i class="fa-solid fa-database" style="color:var(--success-dark);"></i>
              </div>
              <div style="font-size:12px;font-weight:700;color:var(--text);margin-bottom:3px;">3. Salva automático</div>
              <div style="font-size:11px;color:var(--text-muted);">Aparece aqui na lista</div>
            </div>
          </div>

          <!-- Link box -->
          <div style="background:var(--surface);border:1.5px solid var(--brand);border-radius:10px;
                      padding:12px 14px;display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <i class="fa-solid fa-globe" style="color:var(--brand);flex-shrink:0;font-size:14px;"></i>
            <div style="flex:1;font-size:12px;color:var(--text);word-break:break-all;
                        font-family:monospace;line-height:1.5;">${url}</div>
            <button id="cfg-copy-link-btn" class="btn btn-primary btn-sm" style="flex-shrink:0;white-space:nowrap;"
                    onclick="
                      navigator.clipboard.writeText('${url.replace(/'/g, "\\'")}');
                      this.innerHTML='<i class=\\'fa-solid fa-check\\'></i> Copiado!';
                      this.style.background='var(--success-dark)';
                      this.style.borderColor='var(--success-dark)';
                      setTimeout(() => {
                        this.innerHTML='<i class=\\'fa-solid fa-copy\\'></i> Copiar';
                        this.style.background='';this.style.borderColor='';
                      }, 2500);">
              <i class="fa-solid fa-copy"></i> Copiar
            </button>
          </div>

          <!-- Abrir em nova aba -->
          <div style="text-align:center;">
            <a href="${url}" target="_blank"
               style="font-size:12.5px;color:var(--brand);font-weight:600;text-decoration:none;
                      display:inline-flex;align-items:center;gap:6px;">
              <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:11px;"></i>
              Pré-visualizar formulário
            </a>
          </div>

        </div>

        <!-- Footer -->
        <div style="padding:14px 24px;border-top:1px solid var(--border);background:var(--bg);
                    display:flex;justify-content:flex-end;">
          <button class="btn btn-outline" onclick="document.getElementById('cfg-link-modal').remove()">
            Fechar
          </button>
        </div>
      </div>`;

    document.body.appendChild(root);
    root.addEventListener('click', e => { if (e.target === root) root.remove(); });
  },

  async _editFornecedor(cnpj) {
    try {
      const res = await Api.get(`/api/catalogo/fornecedores?q=${cnpj}`);
      const list = res?.fornecedores || (Array.isArray(res) ? res : []);
      const f = list.find(x => (x.cnpj||'').replace(/\D/g,'') === cnpj) || list[0];
      this._openFornecedorDrawer(f || { cnpj });
    } catch { Toast.error('Erro ao carregar fornecedor'); }
  },

  _openFornecedorDrawer(f) {
    const isEdit = !!(f && f.cnpj);
    const segsAtual = Array.isArray(f?.segmentos_interesse) ? f.segmentos_interesse : [];
    const v = s => (s || '').toString().replace(/"/g, '&quot;');

    const contactBlocks = [
      { tipo: 'Comercial',   icon: 'fa-briefcase',          eid: 'fdrw-com-email', tid: 'fdrw-com-tel', ek: 'contato_comercial_email',  tk: 'contato_comercial_tel',  req: true,  fe: f?.email || '',    ft: f?.telefone || '' },
      { tipo: 'Financeiro',  icon: 'fa-file-invoice-dollar', eid: 'fdrw-fin-email', tid: 'fdrw-fin-tel', ek: 'contato_financeiro_email', tk: 'contato_financeiro_tel', req: false, fe: '',                ft: '' },
      { tipo: 'Fiscal/NF-e', icon: 'fa-file-circle-check',  eid: 'fdrw-fis-email', tid: 'fdrw-fis-tel', ek: 'contato_fiscal_email',     tk: 'contato_fiscal_tel',     req: false, fe: '',                ft: '' },
    ].map(c => `
      <div style="border:1px solid var(--border-subtle);border-radius:10px;padding:12px;margin-bottom:10px;background:var(--bg);">
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:#888;margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          <i class="fa-solid ${c.icon}"></i> Contato ${c.tipo}${c.req ? ' <span style="color:#e53e3e">*</span>' : ''}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div class="form-group">
            <label class="form-label">E-mail${c.req ? ' *' : ''}</label>
            <input class="form-control" id="${c.eid}" type="email" placeholder="${c.tipo.split('/')[0].toLowerCase()}@empresa.com"
                   value="${v(f?.[c.ek] || c.fe)}">
          </div>
          <div class="form-group">
            <label class="form-label">Telefone</label>
            <input class="form-control" id="${c.tid}" type="tel" placeholder="(11) 99999-9999"
                   value="${v(f?.[c.tk] || c.ft)}">
          </div>
        </div>
      </div>`).join('');

    const root = document.createElement('div');
    root.id = 'cfg-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="cfg-backdrop">
        <div class="cfg-drawer" style="width:640px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">${isEdit ? 'Editar Fornecedor' : 'Novo Fornecedor'}</div>
            <button class="cfg-drw-close" id="cfg-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body" style="gap:0;">

            <div style="margin-bottom:20px;">
              <div class="fdrw-sec-title"><i class="fa-solid fa-id-card"></i> Dados da Empresa</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label form-label-required">CNPJ</label>
                  <input class="form-control" id="fdrw-cnpj" type="text" placeholder="00.000.000/0000-00"
                         value="${v(f?.cnpj)}" ${isEdit ? 'readonly style="background:var(--bg);color:var(--text-muted);"' : ''}>
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">Razão Social</label>
                  <input class="form-control" id="fdrw-razao" type="text" placeholder="Nome da empresa"
                         value="${v(f?.razao_social || f?.nome)}">
                </div>
              </div>
              <div class="form-group" style="margin-top:12px;">
                <label class="form-label">Site</label>
                <input class="form-control" id="fdrw-site" type="url" placeholder="https://"
                       value="${v(f?.site)}">
              </div>
            </div>

            <div style="margin-bottom:20px;">
              <div class="fdrw-sec-title"><i class="fa-solid fa-location-dot"></i> Endereço</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">Logradouro</label>
                  <input class="form-control" id="fdrw-logr" type="text" placeholder="Rua, Av., Travessa..."
                         value="${v(f?.endereco_logradouro)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Número</label>
                  <input class="form-control" id="fdrw-num" type="text" placeholder="S/N"
                         value="${v(f?.endereco_numero)}">
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">
                <div class="form-group">
                  <label class="form-label">Bairro</label>
                  <input class="form-control" id="fdrw-bairro" type="text" placeholder="Bairro"
                         value="${v(f?.endereco_bairro)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Complemento</label>
                  <input class="form-control" id="fdrw-compl" type="text" placeholder="Sala, andar..."
                         value="${v(f?.endereco_complemento)}">
                </div>
              </div>
              <div style="display:grid;grid-template-columns:1fr 80px 120px;gap:12px;margin-top:12px;">
                <div class="form-group">
                  <label class="form-label form-label-required">Cidade</label>
                  <input class="form-control" id="fdrw-cidade" type="text" placeholder="Cidade"
                         value="${v(f?.cidade || f?.endereco_cidade)}">
                </div>
                <div class="form-group">
                  <label class="form-label form-label-required">UF</label>
                  <input class="form-control" id="fdrw-estado" type="text" maxlength="2" placeholder="SP"
                         value="${v(f?.estado || f?.endereco_uf)}" style="text-transform:uppercase;">
                </div>
                <div class="form-group">
                  <label class="form-label">CEP</label>
                  <input class="form-control" id="fdrw-cep" type="text" placeholder="00000-000"
                         value="${v(f?.endereco_cep)}">
                </div>
              </div>
            </div>

            <div style="margin-bottom:20px;">
              <div class="fdrw-sec-title"><i class="fa-solid fa-address-book"></i> Contatos</div>
              ${contactBlocks}
            </div>

            <div style="margin-bottom:20px;">
              <div class="fdrw-sec-title"><i class="fa-solid fa-tags"></i> Segmentos de Atuação</div>
              <div id="fdrw-segs-container">
                <div style="font-size:13px;color:#999;text-align:center;padding:12px;">
                  <i class="fa-solid fa-spinner fa-spin"></i> Carregando...
                </div>
              </div>
            </div>

            <div style="margin-bottom:4px;">
              <div class="fdrw-sec-title">
                <i class="fa-solid fa-folder-open"></i> Documentação
                <span style="font-size:10px;font-weight:400;color:#aaa;text-transform:none;letter-spacing:0;margin-left:4px;">(links — opcional)</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div class="form-group">
                  <label class="form-label">Cartão CNPJ (link)</label>
                  <input class="form-control" id="fdrw-doc-cnpj" type="url" placeholder="https://"
                         value="${v(f?.doc_cartao_cnpj)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Alvará de Funcionamento (link)</label>
                  <input class="form-control" id="fdrw-doc-alvara" type="url" placeholder="https://"
                         value="${v(f?.doc_alvara_funcionamento)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Alvará Sanitário (link)</label>
                  <input class="form-control" id="fdrw-doc-sanitario" type="url" placeholder="https://"
                         value="${v(f?.doc_alvara_sanitario)}">
                </div>
                <div class="form-group">
                  <label class="form-label">Certificado ISO 9001 (link)</label>
                  <input class="form-control" id="fdrw-doc-iso" type="url" placeholder="https://"
                         value="${v(f?.doc_iso_9001)}">
                </div>
                <div class="form-group" style="grid-column:1/-1;">
                  <label class="form-label">Última Alteração Contratual (link)</label>
                  <input class="form-control" id="fdrw-doc-alt" type="url" placeholder="https://"
                         value="${v(f?.doc_ultima_alteracao)}">
                </div>
              </div>
            </div>

          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="fdrw-cancel">Cancelar</button>
            <button class="btn btn-primary" id="fdrw-save">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar Alterações' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);

    const close = () => root.remove();
    document.getElementById('cfg-drw-close').addEventListener('click', close);
    document.getElementById('fdrw-cancel').addEventListener('click', close);
    document.getElementById('cfg-backdrop').addEventListener('click', e => { if (e.target.id === 'cfg-backdrop') close(); });

    // Load segmentos async and build checkboxes
    (async () => {
      const container = document.getElementById('fdrw-segs-container');
      if (!container) return;
      try {
        const cats = await Api.get('/api/categorias');
        const segs = [...new Set((cats || []).map(c => c.segmento).filter(Boolean))].sort();
        const allSegs = [...segs, 'Outros'];
        container.innerHTML = `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:7px;">
          ${allSegs.map(s => {
            const on = segsAtual.includes(s);
            return `<label class="fdrw-seg-lbl${on ? ' on' : ''}" data-seg="${s}">
              <input type="checkbox" value="${s}" ${on ? 'checked' : ''} style="display:none;">
              <div class="fdrw-seg-box">${on ? '<i class="fa-solid fa-check"></i>' : ''}</div>
              <span>${s}</span>
            </label>`;
          }).join('')}
        </div>`;
        container.addEventListener('click', e => {
          const lbl = e.target.closest('.fdrw-seg-lbl');
          if (!lbl) return;
          const on = lbl.classList.toggle('on');
          lbl.querySelector('input').checked = on;
          const box = lbl.querySelector('.fdrw-seg-box');
          box.innerHTML = on ? '<i class="fa-solid fa-check"></i>' : '';
        });
      } catch {
        if (container) container.innerHTML = `<div style="font-size:13px;color:#aaa;">Erro ao carregar segmentos.</div>`;
      }
    })();

    document.getElementById('fdrw-save').addEventListener('click', async () => {
      const cnpj  = (document.getElementById('fdrw-cnpj').value || '').replace(/\D/g,'');
      const razao = document.getElementById('fdrw-razao').value.trim();
      if (!cnpj || cnpj.length < 14) { Toast.warning('CNPJ inválido', 'Informe o CNPJ completo.'); return; }
      if (!razao) { Toast.warning('Campo obrigatório', 'Informe a Razão Social.'); return; }

      const selectedSegs = Array.from(document.querySelectorAll('#fdrw-segs-container .fdrw-seg-lbl.on'))
                                .map(el => el.dataset.seg).filter(Boolean);
      const payload = {
        cnpj,
        razao_social:             razao,
        endereco_logradouro:      document.getElementById('fdrw-logr').value.trim()       || null,
        endereco_numero:          document.getElementById('fdrw-num').value.trim()         || null,
        endereco_complemento:     document.getElementById('fdrw-compl').value.trim()       || null,
        endereco_bairro:          document.getElementById('fdrw-bairro').value.trim()      || null,
        endereco_cidade:          document.getElementById('fdrw-cidade').value.trim()      || null,
        endereco_uf:              (document.getElementById('fdrw-estado').value.trim() || '').toUpperCase() || null,
        endereco_cep:             document.getElementById('fdrw-cep').value.replace(/\D/g,'') || null,
        contato_comercial_email:  document.getElementById('fdrw-com-email').value.trim()  || null,
        contato_comercial_tel:    document.getElementById('fdrw-com-tel').value.trim()    || null,
        contato_financeiro_email: document.getElementById('fdrw-fin-email').value.trim()  || null,
        contato_financeiro_tel:   document.getElementById('fdrw-fin-tel').value.trim()    || null,
        contato_fiscal_email:     document.getElementById('fdrw-fis-email').value.trim()  || null,
        contato_fiscal_tel:       document.getElementById('fdrw-fis-tel').value.trim()    || null,
        segmentos_interesse:      selectedSegs,
        doc_cartao_cnpj:          document.getElementById('fdrw-doc-cnpj').value.trim()      || null,
        doc_alvara_funcionamento: document.getElementById('fdrw-doc-alvara').value.trim()    || null,
        doc_alvara_sanitario:     document.getElementById('fdrw-doc-sanitario').value.trim() || null,
        doc_iso_9001:             document.getElementById('fdrw-doc-iso').value.trim()       || null,
        doc_ultima_alteracao:     document.getElementById('fdrw-doc-alt').value.trim()       || null,
        site:                     document.getElementById('fdrw-site').value.trim()          || null,
      };

      const btn = document.getElementById('fdrw-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Salvando...';
      try {
        await Api.post('/api/fornecedor/cadastro', payload);
        Toast.success(isEdit ? 'Fornecedor atualizado!' : 'Fornecedor cadastrado!', razao);
        close();
        this._loadFornecedores();
      } catch (err) {
        Toast.error('Erro ao salvar fornecedor', err.message || '');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar Alterações' : 'Cadastrar'}`;
      }
    });
  },

  async _delFornecedor(cnpj, nome) {
    const ok = await Modal.confirm({
      icon: 'danger',
      title: `Excluir fornecedor?`,
      body: `<strong>${nome || cnpj}</strong> será removido do cadastro de fornecedores.`,
      confirmText: 'Excluir', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/catalogo/fornecedores/${cnpj}`);
      Toast.success('Fornecedor excluído', nome || cnpj);
      this._loadFornecedores();
    } catch { Toast.error('Erro ao excluir fornecedor'); }
  },

  /* ══════════════════════════════════════════════════════════
     TAB 5 — CATEGORIAS
  ══════════════════════════════════════════════════════════ */
  async _loadCategorias() {
    const el = document.getElementById('cfg-content');
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;
    try {
      const rows = await Api.get('/api/categorias');
      el.innerHTML = this._htmlCategoriasTab(rows);
    } catch {
      el.innerHTML = `<div class="cfg-empty"><i class="fa-solid fa-circle-xmark"></i><p>Erro ao carregar categorias</p></div>`;
    }
  },

  _htmlCategoriasTab(rows) {
    const macros = [...new Set(rows.map(r => r.macro_categoria).filter(Boolean))].sort();
    const byMacro = {};
    for (const r of rows) {
      const m = r.macro_categoria || 'Sem macro-categoria';
      if (!byMacro[m]) byMacro[m] = [];
      byMacro[m].push(r);
    }

    const sectionsHtml = macros.length === 0
      ? `<tr><td colspan="3"><div class="cfg-empty"><i class="fa-solid fa-tags"></i><p>Nenhuma categoria cadastrada.<br>Clique em "Nova Categoria" para começar.</p></div></td></tr>`
      : macros.map(m => byMacro[m].map((cat, i) => `
          <tr id="catrow-${cat.id}">
            ${i === 0 ? `<td rowspan="${byMacro[m].length}" style="font-weight:700;color:var(--brand);vertical-align:middle;border-right:2px solid var(--border-subtle);">${m}</td>` : ''}
            <td style="font-size:13px;">${cat.segmento || '—'}</td>
            <td style="text-align:center;white-space:nowrap;">
              <button class="cfg-act-btn cfg-act-edit" title="Editar"
                      onclick="Pages.configuracoes._editCategoria(${cat.id})">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="cfg-act-btn cfg-act-del" title="Excluir"
                      onclick="Pages.configuracoes._delCategoria(${cat.id},'${cat.segmento?.replace(/'/g,'')||''}')">
                <i class="fa-solid fa-trash"></i>
              </button>
            </td>
          </tr>`).join('')).join('');

    return `
      <div class="cfg-card">
        <div class="cfg-card-hdr">
          <span class="cfg-card-title">
            <i class="fa-solid fa-tags"></i>
            Categorias de Compras
            <span class="badge badge-gray" style="margin-left:4px;">${rows.length}</span>
          </span>
          <button class="btn btn-primary btn-sm" onclick="Pages.configuracoes._newCategoria()">
            <i class="fa-solid fa-plus"></i> Nova Categoria
          </button>
        </div>
        <div class="cfg-table-wrap">
          <table class="cfg-table">
            <thead>
              <tr>
                <th style="width:220px;">Macro-Categoria</th>
                <th>Segmento / Subcategoria</th>
                <th style="width:72px;text-align:center;">Ações</th>
              </tr>
            </thead>
            <tbody>${sectionsHtml}</tbody>
          </table>
        </div>
      </div>`;
  },

  _newCategoria() { this._openCategoriaDrawer(null); },

  async _editCategoria(id) {
    try {
      const all = await Api.get('/api/categorias');
      const cat = all.find(c => c.id === id);
      if (cat) this._openCategoriaDrawer(cat);
    } catch { Toast.error('Erro ao carregar categoria'); }
  },

  _openCategoriaDrawer(cat) {
    const isEdit = !!cat;
    const root = document.createElement('div');
    root.id = 'cfg-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="cfg-backdrop">
        <div class="cfg-drawer" style="width:400px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">${isEdit ? 'Editar Categoria' : 'Nova Categoria'}</div>
            <button class="cfg-drw-close" id="cfg-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body">
            <div class="form-group">
              <label class="form-label form-label-required">Macro-Categoria</label>
              <input class="form-control" id="catdrw-macro" type="text"
                     placeholder="Ex: Tecnologia, Facilities, RH..."
                     value="${cat?.macro_categoria || ''}">
            </div>
            <div class="form-group">
              <label class="form-label form-label-required">Segmento / Subcategoria</label>
              <input class="form-control" id="catdrw-seg" type="text"
                     placeholder="Ex: Hardware, Limpeza, Treinamentos..."
                     value="${cat?.segmento || ''}">
            </div>
          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="catdrw-cancel">Cancelar</button>
            <button class="btn btn-primary" id="catdrw-save">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar' : 'Criar Categoria'}
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);
    const close = () => root.remove();
    document.getElementById('cfg-drw-close').addEventListener('click', close);
    document.getElementById('catdrw-cancel').addEventListener('click', close);
    document.getElementById('cfg-backdrop').addEventListener('click', e => { if (e.target.id === 'cfg-backdrop') close(); });
    setTimeout(() => document.getElementById('catdrw-macro')?.focus(), 80);

    document.getElementById('catdrw-save').addEventListener('click', async () => {
      const macro = document.getElementById('catdrw-macro').value.trim();
      const seg   = document.getElementById('catdrw-seg').value.trim();
      if (!macro) { Toast.warning('Campo obrigatório', 'Informe a macro-categoria.'); return; }
      if (!seg)   { Toast.warning('Campo obrigatório', 'Informe o segmento.'); return; }
      const btn = document.getElementById('catdrw-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        if (isEdit) {
          await Api.patch(`/api/categorias/${cat.id}`, { macro_categoria: macro, segmento: seg });
          Toast.success('Categoria atualizada!', `${macro} › ${seg}`);
        } else {
          await Api.post('/api/categorias', { macro_categoria: macro, segmento: seg });
          Toast.success('Categoria criada!', `${macro} › ${seg}`);
        }
        close();
        this._loadCategorias();
      } catch (err) {
        Toast.error('Erro ao salvar categoria', err.message || '');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar' : 'Criar Categoria'}`;
      }
    });
  },

  async _delCategoria(id, nome) {
    const ok = await Modal.confirm({
      icon: 'danger',
      title: 'Excluir categoria?',
      body: `A categoria <strong>${nome || 'selecionada'}</strong> será removida permanentemente.`,
      confirmText: 'Excluir', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`/api/categorias/${id}`);
      Toast.success('Categoria excluída', nome);
      this._loadCategorias();
    } catch { Toast.error('Erro ao excluir categoria'); }
  },

  /* ══════════════════════════════════════════════════════════
     TAB 6 — SEGMENTOS DE COMPRA
  ══════════════════════════════════════════════════════════ */
  async _loadSegmentos() {
    const el = document.getElementById('cfg-content');
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;
    try {
      const rows = await Api.get('/api/config/segmentos-compra');
      el.innerHTML = this._htmlListaSimples({
        rows, entity: 'segmentos', icon: 'fa-layer-group',
        title: 'Segmentos de Compra', desc: 'Classificação interna do tipo de compra',
        addLabel: 'Novo Segmento',
        onAdd:    'Pages.configuracoes._openItemDrawer("segmentos",null)',
        onEdit:   id => `Pages.configuracoes._openItemDrawer('segmentos',${id})`,
        onDel:    (id, nome) => `Pages.configuracoes._delItem('segmentos',${id},'${nome}')`,
      });
    } catch {
      el.innerHTML = `<div class="cfg-empty"><i class="fa-solid fa-circle-xmark"></i><p>Erro ao carregar segmentos</p></div>`;
    }
  },

  /* ══════════════════════════════════════════════════════════
     TAB 7 — TIPOS DE DESPESA
  ══════════════════════════════════════════════════════════ */
  async _loadDespesas() {
    const el = document.getElementById('cfg-content');
    el.innerHTML = `<div style="padding:50px;text-align:center;"><div class="spinner"></div></div>`;
    try {
      const rows = await Api.get('/api/config/tipo-despesa');
      el.innerHTML = this._htmlListaSimples({
        rows, entity: 'despesas', icon: 'fa-receipt',
        title: 'Tipos de Despesa', desc: 'Classificação contábil dos pedidos de compra',
        addLabel: 'Novo Tipo',
        onAdd:    'Pages.configuracoes._openItemDrawer("despesas",null)',
        onEdit:   id => `Pages.configuracoes._openItemDrawer('despesas',${id})`,
        onDel:    (id, nome) => `Pages.configuracoes._delItem('despesas',${id},'${nome}')`,
      });
    } catch {
      el.innerHTML = `<div class="cfg-empty"><i class="fa-solid fa-circle-xmark"></i><p>Erro ao carregar tipos de despesa</p></div>`;
    }
  },

  /* ── Renderer genérico para listas simples (segmentos / despesas) ─── */
  _htmlListaSimples({ rows, entity, icon, title, desc, addLabel, onAdd, onEdit, onDel }) {
    const active   = rows.filter(r => r.ativo);
    const inactive = rows.filter(r => !r.ativo);

    const rowHtml = (r) => `
      <tr id="${entity}row-${r.id}" class="${r.ativo ? '' : 'cfg-inactive'}">
        <td style="font-weight:500;color:var(--text);">${r.nome}</td>
        <td>
          ${r.ativo
            ? '<span class="badge badge-success" style="font-size:11px;">Ativo</span>'
            : '<span class="badge badge-gray" style="font-size:11px;">Inativo</span>'}
        </td>
        <td style="text-align:center;white-space:nowrap;">
          <button class="cfg-act-btn cfg-act-edit" title="Editar"
                  onclick="${onEdit(r.id)}">
            <i class="fa-solid fa-pen-to-square"></i>
          </button>
          <button class="cfg-act-btn cfg-act-del" title="Excluir"
                  onclick="${onDel(r.id, r.nome.replace(/'/g, ''))}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>`;

    const tableRows = rows.length === 0
      ? `<tr><td colspan="3"><div class="cfg-empty">
           <i class="fa-solid fa-${icon}"></i>
           <p>Nenhum item cadastrado. Clique em "${addLabel}" para começar.</p>
         </div></td></tr>`
      : [...active, ...inactive].map(rowHtml).join('');

    return `
      <div class="cfg-card">
        <div class="cfg-card-hdr">
          <span class="cfg-card-title">
            <i class="fa-solid fa-${icon}"></i>
            ${title}
            <span class="badge badge-gray" style="margin-left:4px;">${active.length} ativos</span>
            ${inactive.length > 0 ? `<span class="badge badge-gray" style="margin-left:2px;opacity:.6;">${inactive.length} inativos</span>` : ''}
          </span>
          <button class="btn btn-primary btn-sm" onclick="${onAdd}">
            <i class="fa-solid fa-plus"></i> ${addLabel}
          </button>
        </div>
        <div style="padding:10px 22px 8px;font-size:12.5px;color:var(--text-muted);">
          <i class="fa-solid fa-circle-info" style="color:var(--brand);margin-right:4px;"></i>
          ${desc} — disponível como opção na tela <strong>Nova Requisição</strong>.
        </div>
        <div class="cfg-table-wrap">
          <table class="cfg-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th style="width:90px;">Status</th>
                <th style="width:72px;text-align:center;">Ações</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
      </div>`;
  },

  /* ── Drawer genérico: novo / editar segmento ou despesa ─── */
  async _openItemDrawer(entity, id) {
    const isEdit  = id !== null;
    const apiPath = entity === 'segmentos' ? '/api/config/segmentos-compra' : '/api/config/tipo-despesa';
    const label   = entity === 'segmentos' ? 'Segmento de Compra' : 'Tipo de Despesa';
    const reload  = entity === 'segmentos' ? () => this._loadSegmentos() : () => this._loadDespesas();

    let currentNome = '', currentAtivo = true;
    if (isEdit) {
      try {
        const all = await Api.get(apiPath);
        const item = all.find(r => r.id === id);
        if (!item) { Toast.error('Item não encontrado'); return; }
        currentNome  = item.nome;
        currentAtivo = item.ativo;
      } catch { Toast.error('Erro ao carregar item'); return; }
    }

    document.getElementById('cfg-drawer-root')?.remove();
    const root = document.createElement('div');
    root.id = 'cfg-drawer-root';
    root.innerHTML = `
      <div class="cfg-backdrop" id="cfg-backdrop">
        <div class="cfg-drawer" style="width:380px;">
          <div class="cfg-drw-hdr">
            <div class="cfg-drw-title">${isEdit ? `Editar ${label}` : `Novo ${label}`}</div>
            <button class="cfg-drw-close" id="cfg-drw-close"><i class="fa-solid fa-xmark"></i></button>
          </div>
          <div class="cfg-drw-body">
            <div class="form-group">
              <label class="form-label form-label-required">Nome</label>
              <input class="form-control" id="item-drw-nome" type="text"
                     placeholder="Digite o nome em maiúsculas..." value="${currentNome}"
                     style="text-transform:uppercase;">
            </div>
            ${isEdit ? `
            <div class="form-group">
              <label class="form-label" style="display:flex;align-items:center;justify-content:space-between;">
                <span>Item Ativo</span>
                <label class="cfg-toggle">
                  <input type="checkbox" id="item-drw-ativo" ${currentAtivo ? 'checked' : ''}>
                  <span class="cfg-toggle-slider"></span>
                </label>
              </label>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:4px;">
                Itens inativos não aparecem nas opções da Nova Requisição.
              </div>
            </div>` : ''}
          </div>
          <div class="cfg-drw-footer">
            <button class="btn btn-outline" id="item-drw-cancel">Cancelar</button>
            <button class="btn btn-primary" id="item-drw-save">
              <i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar' : `Criar ${label}`}
            </button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(root);

    const close = () => root.remove();
    document.getElementById('cfg-drw-close').addEventListener('click', close);
    document.getElementById('item-drw-cancel').addEventListener('click', close);
    document.getElementById('cfg-backdrop').addEventListener('click', e => {
      if (e.target.id === 'cfg-backdrop') close();
    });
    setTimeout(() => document.getElementById('item-drw-nome')?.focus(), 80);

    document.getElementById('item-drw-save').addEventListener('click', async () => {
      const nome  = (document.getElementById('item-drw-nome').value || '').trim().toUpperCase();
      const ativo = isEdit ? document.getElementById('item-drw-ativo').checked : true;
      if (!nome) { Toast.warning('Campo obrigatório', 'Informe o nome.'); return; }

      const btn = document.getElementById('item-drw-save');
      btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';
      try {
        if (isEdit) {
          await Api.patch(`${apiPath}/${id}`, { nome, ativo });
          Toast.success(`${label} atualizado`, nome);
        } else {
          await Api.post(apiPath, { nome });
          Toast.success(`${label} criado`, nome);
        }
        close();
        reload();
      } catch (err) {
        Toast.error('Erro ao salvar', err.message || '');
        btn.disabled = false;
        btn.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> ${isEdit ? 'Salvar' : `Criar ${label}`}`;
      }
    });
  },

  async _delItem(entity, id, nome) {
    const label   = entity === 'segmentos' ? 'segmento' : 'tipo de despesa';
    const apiPath = entity === 'segmentos' ? '/api/config/segmentos-compra' : '/api/config/tipo-despesa';
    const reload  = entity === 'segmentos' ? () => this._loadSegmentos() : () => this._loadDespesas();
    const ok = await Modal.confirm({
      icon: 'danger',
      title: `Excluir ${label}?`,
      body: `<strong>${nome || 'O item selecionado'}</strong> será removido permanentemente da lista de opções.`,
      confirmText: 'Excluir', confirmClass: 'btn-danger',
    });
    if (!ok) return;
    try {
      await Api.delete(`${apiPath}/${id}`);
      Toast.success(`${label.charAt(0).toUpperCase() + label.slice(1)} excluído`, nome);
      reload();
    } catch { Toast.error(`Erro ao excluir ${label}`); }
  },
};
