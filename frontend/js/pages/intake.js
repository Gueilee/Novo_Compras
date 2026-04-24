/* ── INTAKE PAGE (Nova Requisição) ────────────────────────── */
window.Pages = window.Pages || {};

window.Pages.intake = {
  title: 'Nova Requisição',
  subtitle: 'Crie uma nova solicitação de compras',
  icon: 'fa-file-invoice',
  _categorias: [],
  _macros: {},
  _unidades: [],
  _setores: [],

  render() {
    return `
    <div class="page-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Nova Requisição</h1>
          <p class="page-subtitle">Preencha os dados abaixo para solicitar uma compra</p>
        </div>
        <div class="page-header-actions">
          <span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Pendente de envio</span>
        </div>
      </div>

      <!-- Step bar -->
      <div class="step-bar mb-4" id="intake-steps">
        <div class="step-item active">
          <div class="step-circle">1</div>
          <div class="step-label">Identificação</div>
        </div>
        <div class="step-item">
          <div class="step-circle">2</div>
          <div class="step-label">Itens</div>
        </div>
        <div class="step-item">
          <div class="step-circle">3</div>
          <div class="step-label">Revisão & Envio</div>
        </div>
      </div>

      <!-- Section 1: Identificação -->
      <div class="card mb-4">
        <div class="section-header" style="margin-bottom:20px;">
          <span class="section-title">
            <i class="fa-solid fa-circle-user"></i>
            Dados da Solicitação
          </span>
        </div>
        <div class="form-grid form-grid-3">
          <div class="form-group">
            <label class="form-label form-label-required">Unidade Solicitante</label>
            <select class="form-control" id="in-unidade">
              <option value="">Carregando...</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label form-label-required">Setor / Departamento</label>
            <select class="form-control" id="in-setor">
              <option value="">Selecione...</option>
              <option value="ADMINISTRATIVO">ADMINISTRATIVO</option>
              <option value="COMERCIAL">COMERCIAL</option>
              <option value="COMPRAS">COMPRAS</option>
              <option value="FINANCEIRO">FINANCEIRO</option>
              <option value="LOGÍSTICA">LOGÍSTICA</option>
              <option value="MANUTENÇÃO">MANUTENÇÃO</option>
              <option value="OPERAÇÕES">OPERAÇÕES</option>
              <option value="QUALIDADE">QUALIDADE</option>
              <option value="RH / RECURSOS HUMANOS">RH / RECURSOS HUMANOS</option>
              <option value="SEGURANÇA">SEGURANÇA</option>
              <option value="TI / TECNOLOGIA">TI / TECNOLOGIA</option>
              <option value="OUTROS">OUTROS</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label form-label-required">Nome do Solicitante</label>
            <input type="text" class="form-control" id="in-comprador" placeholder="Seu nome completo">
          </div>
        </div>
        <div class="form-grid form-grid-2 mt-2">
          <div class="form-group">
            <label class="form-label">Data da Necessidade</label>
            <input type="date" class="form-control" id="in-data-necessidade">
          </div>
          <div class="form-group">
            <label class="form-label form-label-required">Justificativa / Contexto</label>
            <textarea class="form-control" id="in-justificativa" rows="3"
                      placeholder="Explique o motivo desta solicitação: reposição de estoque, novo projeto, substituição de equipamento..."
                      style="resize:vertical;"></textarea>
          </div>
        </div>

        <!-- Anexos -->
        <div class="mt-3">
          <label class="form-label">Anexos <span style="color:var(--text-muted);font-weight:400;">(opcional — imagens, PDFs, planilhas)</span></label>
          <div id="in-dropzone" class="in-dropzone"
               onclick="document.getElementById('in-file-input').click()"
               ondragover="event.preventDefault();this.classList.add('in-dropzone-over')"
               ondragleave="this.classList.remove('in-dropzone-over')"
               ondrop="event.preventDefault();this.classList.remove('in-dropzone-over');Pages.intake._addFiles(event.dataTransfer.files)">
            <i class="fa-solid fa-cloud-arrow-up" style="font-size:22px;color:var(--brand);opacity:.7;"></i>
            <div style="font-size:13px;color:var(--text-muted);margin-top:6px;">Arraste arquivos ou <span style="color:var(--brand);font-weight:600;cursor:pointer;">clique para selecionar</span></div>
            <div style="font-size:11px;color:var(--text-subtle);margin-top:2px;">PNG, JPG, PDF, XLSX — máx. 10 MB por arquivo</div>
          </div>
          <input type="file" id="in-file-input" multiple accept="image/*,.pdf,.xlsx,.xls,.doc,.docx"
                 style="display:none;" onchange="Pages.intake._addFiles(this.files)">
          <div id="in-file-list" style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px;"></div>
        </div>
      </div>

      <!-- Section 2: Itens -->
      <div class="card mb-4">
        <div class="section-header" style="margin-bottom:20px;">
          <span class="section-title">
            <i class="fa-solid fa-boxes-stacked"></i>
            Itens da Requisição
          </span>
          <button class="btn btn-outline btn-sm" onclick="Pages.intake.adicionarLinha()">
            <i class="fa-solid fa-plus"></i> Adicionar Item
          </button>
        </div>

        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th style="width:40%">Descrição do Material / Serviço</th>
                <th style="width:12%">Quantidade</th>
                <th style="width:12%">Unidade</th>
                <th>Categoria</th>
                <th style="width:38px;"></th>
              </tr>
            </thead>
            <tbody id="intake-items-body"></tbody>
          </table>
        </div>

        <div id="intake-empty-items" class="empty-state" style="padding:30px 0;display:none;">
          <div class="empty-icon"><i class="fa-solid fa-box-open"></i></div>
          <p class="empty-title">Nenhum item adicionado</p>
          <p class="empty-desc">Clique em "Adicionar Item" para incluir os produtos ou serviços que deseja solicitar.</p>
        </div>
      </div>

      <!-- Section 3: Enviar -->
      <div class="card">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <div class="font-bold mb-1">Pronto para enviar?</div>
            <p class="text-sm text-muted">Após o envio, a requisição será encaminhada para aprovação do gestor responsável.</p>
          </div>
          <button class="btn btn-success btn-lg" id="btn-submit-req" onclick="Pages.intake.enviar()">
            <i class="fa-solid fa-paper-plane"></i>
            Enviar para Aprovação
          </button>
        </div>
      </div>
    </div>
    <style>
      .in-dropzone {
        border: 2px dashed var(--border);
        border-radius: var(--r-md);
        padding: 24px 16px;
        text-align: center;
        cursor: pointer;
        transition: border-color .2s, background .2s;
        background: var(--bg);
      }
      .in-dropzone:hover, .in-dropzone-over {
        border-color: var(--brand);
        background: var(--brand-surface, rgba(66,44,118,.06));
      }
    </style>`;
  },

  async init() {
    this._files = []; // reset attachments on each page load

    // ── 0. Validação do usuário logado ─────────────────────────
    const emailLogado = localStorage.getItem('shp_user_email') || '';
    if (emailLogado) {
      try {
        const usuario = await Api.get(`/api/usuarios/verificar?email=${encodeURIComponent(emailLogado)}`);
        if (!usuario.ativo) {
          this._bloquearPorInativo(emailLogado);
          return;
        }
      } catch (err) {
        // usuário não encontrado no cadastro
        this._bloquearPorNaoCadastrado(emailLogado);
        return;
      }
    }

    try {
      // ── 1. Unidades: busca do endpoint de filtros (já retorna todas as reais) ──
      const filtros = await Api.get('/api/requisicoes/filtros');
      const selUnid = document.getElementById('in-unidade');
      if (selUnid) {
        selUnid.innerHTML = '<option value="">Selecione...</option>';
        (filtros.unidades || []).forEach(u => {
          const o = document.createElement('option');
          o.value = u; o.textContent = u;
          selUnid.appendChild(o);
        });
      }

      // ── 2. Categorias: busca do endpoint de formulário ──
      const dados = await Api.get('/api/opcoes-formulario');
      this._macros = dados.categorias || {};
      // Garante uppercase
      const allCats = Object.values(this._macros).flat()
        .map(c => (c || '').toUpperCase()).filter(Boolean);
      // Remove duplicatas e ordena
      this._categorias = [...new Set(allCats)].sort();

      this._updateItemsVisibility();
      this.adicionarLinha(true);

      // Data padrão +7 dias
      const d = new Date(); d.setDate(d.getDate() + 7);
      const el = document.getElementById('in-data-necessidade');
      if (el) el.valueAsDate = d;

    } catch (e) {
      console.error(e);
      Toast.error('Erro ao carregar formulário', 'Verifique a conexão com a API.');
      // Garante que pelo menos a linha de item aparece
      this._updateItemsVisibility();
      this.adicionarLinha(true);
    }
  },

  _bloquearPorNaoCadastrado(email) {
    const el = document.getElementById('content');
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:40px;">
        <div style="max-width:480px;text-align:center;">
          <div style="width:72px;height:72px;border-radius:50%;background:rgba(245,158,11,0.12);
                      display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
            <i class="fa-solid fa-user-clock" style="font-size:28px;color:#f59e0b;"></i>
          </div>
          <h2 style="font-size:20px;font-weight:800;color:var(--text);margin-bottom:10px;">
            Usuário não cadastrado
          </h2>
          <p style="font-size:14px;color:var(--text-muted);line-height:1.6;margin-bottom:6px;">
            O e-mail <strong>${email}</strong> não está registrado no sistema de compras.
          </p>
          <p style="font-size:14px;color:var(--text-muted);line-height:1.6;margin-bottom:28px;">
            Para abrir requisições, seu cadastro precisa ser ativado pelo time de Compras.<br>
            Acesse a tela de login e clique em <strong>"Solicitar Acesso ao Sistema"</strong>.
          </p>
          <div style="display:flex;gap:10px;justify-content:center;">
            <button class="btn btn-primary" onclick="window.location.href='login.html'">
              <i class="fa-solid fa-right-to-bracket"></i> Ir para o Login
            </button>
            <button class="btn btn-outline" onclick="App.navigate('home')">
              <i class="fa-solid fa-house"></i> Voltar ao Início
            </button>
          </div>
        </div>
      </div>`;
  },

  _bloquearPorInativo(email) {
    const el = document.getElementById('content');
    if (!el) return;
    el.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:center;height:100%;padding:40px;">
        <div style="max-width:480px;text-align:center;">
          <div style="width:72px;height:72px;border-radius:50%;background:rgba(255,47,105,0.08);
                      display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">
            <i class="fa-solid fa-user-slash" style="font-size:28px;color:var(--accent);"></i>
          </div>
          <h2 style="font-size:20px;font-weight:800;color:var(--text);margin-bottom:10px;">
            Acesso desativado
          </h2>
          <p style="font-size:14px;color:var(--text-muted);line-height:1.6;margin-bottom:28px;">
            Seu usuário (<strong>${email}</strong>) está inativo no sistema.<br>
            Entre em contato com o time de Compras para reativar seu acesso.
          </p>
          <button class="btn btn-outline" onclick="App.navigate('home')">
            <i class="fa-solid fa-house"></i> Voltar ao Início
          </button>
        </div>
      </div>`;
  },

  adicionarLinha(noFocus = false) {
    const tbody = document.getElementById('intake-items-body');
    if (!tbody) return;

    const id = Date.now();
    const catOptions = this._categorias.map(c =>
      `<option value="${c}">${c}</option>`
    ).join('');

    const tr = document.createElement('tr');
    tr.dataset.id = id;
    tr.innerHTML = `
      <td>
        <input type="text" class="form-control form-control-sm in-desc"
               placeholder="Descreva o item detalhadamente..." style="min-width:200px;">
      </td>
      <td>
        <input type="number" class="form-control form-control-sm in-qtd"
               value="1" min="0.01" step="0.01" style="min-width:80px;">
      </td>
      <td>
        <select class="form-control form-control-sm in-und">
          <option value="UN">UN</option>
          <option value="KG">KG</option>
          <option value="MT">MT</option>
          <option value="LT">LT</option>
          <option value="CX">CX</option>
          <option value="PC">PC</option>
          <option value="SV">SV (Serviço)</option>
        </select>
      </td>
      <td style="min-width:200px;">
        <select class="form-control form-control-sm in-seg">
          <option value="">Selecione...</option>
          ${catOptions}
          <option value="__nova__">＋ Nova Categoria...</option>
        </select>
        <input type="text" class="form-control form-control-sm in-seg-nova"
               placeholder="Digite a nova categoria"
               style="display:none;margin-top:4px;text-transform:uppercase;">
      </td>
      <td>
        <button class="btn btn-ghost btn-sm" style="color:var(--accent);padding:6px;"
                onclick="Pages.intake.removerLinha(this)" title="Remover item">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;
    tbody.appendChild(tr);

    // Show/hide custom category input
    const seg = tr.querySelector('.in-seg');
    const segNova = tr.querySelector('.in-seg-nova');
    seg.addEventListener('change', () => {
      const isNova = seg.value === '__nova__';
      segNova.style.display = isNova ? 'block' : 'none';
      if (isNova) segNova.focus();
    });

    this._updateItemsVisibility();
    if (!noFocus) tr.querySelector('.in-desc').focus();
  },

  removerLinha(btn) {
    btn.closest('tr').remove();
    this._updateItemsVisibility();
  },

  _updateItemsVisibility() {
    const tbody = document.getElementById('intake-items-body');
    const empty = document.getElementById('intake-empty-items');
    if (!tbody || !empty) return;
    const hasItems = tbody.querySelectorAll('tr').length > 0;
    empty.style.display = hasItems ? 'none' : 'flex';
  },

  async enviar() {
    const unidade      = document.getElementById('in-unidade')?.value;
    const setor        = document.getElementById('in-setor')?.value;
    const comprador    = document.getElementById('in-comprador')?.value?.trim();
    const justificativa = document.getElementById('in-justificativa')?.value?.trim();

    if (!unidade)      { Toast.warning('Campo obrigatório', 'Selecione a unidade solicitante.'); return; }
    if (!setor)        { Toast.warning('Campo obrigatório', 'Selecione o setor/departamento.'); return; }
    if (!comprador)    { Toast.warning('Campo obrigatório', 'Informe o nome do solicitante.'); return; }
    if (!justificativa){ Toast.warning('Campo obrigatório', 'Informe a justificativa da solicitação.'); return; }

    const rows = document.querySelectorAll('#intake-items-body tr');
    const itens = Array.from(rows).map(tr => {
      const segSel = tr.querySelector('.in-seg');
      const segNova = tr.querySelector('.in-seg-nova');
      const segmento = segSel?.value === '__nova__'
        ? (segNova?.value?.trim().toUpperCase() || '')
        : (segSel?.value || '');
      return {
        descricao:  tr.querySelector('.in-desc')?.value?.trim() || '',
        quantidade: parseFloat(tr.querySelector('.in-qtd')?.value) || 0,
        segmento
      };
    }).filter(i => i.descricao && i.quantidade > 0);

    if (itens.length === 0) {
      Toast.warning('Sem itens', 'Adicione ao menos um item com descrição e quantidade.');
      return;
    }

    const confirmado = await Modal.confirm({
      icon: 'info',
      title: 'Enviar Requisição?',
      subtitle: `${itens.length} item(s) — ${unidade} / ${setor}`,
      body: `A requisição será enviada para aprovação do gestor da unidade <strong>${unidade}</strong>. Deseja continuar?`,
      confirmText: 'Enviar',
      confirmClass: 'btn-success'
    });
    if (!confirmado) return;

    const btn = document.getElementById('btn-submit-req');
    btn.classList.add('loading');
    btn.innerHTML = `<span class="spinner-sm"></span> Enviando...`;

    try {
      const result = await Api.post('/requisicoes', { unidade, setor, comprador, justificativa, itens });
      const reqId = result.id_pedido;

      // Upload any attached files
      const files = this._files || [];
      if (files.length > 0) {
        btn.innerHTML = `<span class="spinner-sm"></span> Enviando anexos (${files.length})...`;
        for (const file of files) {
          try {
            const fd = new FormData();
            fd.append('origem', 'requisitante');
            fd.append('enviado_por', comprador);
            fd.append('arquivo', file);
            await fetch(`${API_BASE}/api/requisicoes/${reqId}/upload`, { method: 'POST', body: fd });
          } catch { /* non-critical */ }
        }
      }

      this._files = [];
      document.getElementById('in-file-list').innerHTML = '';
      Toast.success('Requisição enviada!', `Pedido #${reqId} criado com sucesso. Aguardando aprovação do gestor.`);
      setTimeout(() => App.navigate('intake'), 500);
    } catch {
      Toast.error('Erro ao enviar', 'Não foi possível criar a requisição. Tente novamente.');
      btn.classList.remove('loading');
      btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Enviar para Aprovação`;
    }
  },

  _files: [],

  _addFiles(fileList) {
    const MAX = 10 * 1024 * 1024; // 10 MB
    for (const f of fileList) {
      if (f.size > MAX) { Toast.warning('Arquivo grande demais', `"${f.name}" excede 10 MB.`); continue; }
      if (this._files.find(x => x.name === f.name && x.size === f.size)) continue;
      this._files.push(f);
    }
    this._renderFileList();
  },

  _removeFile(idx) {
    this._files.splice(idx, 1);
    this._renderFileList();
  },

  _renderFileList() {
    const container = document.getElementById('in-file-list');
    if (!container) return;
    if (!this._files.length) { container.innerHTML = ''; return; }
    const ext2icon = n => {
      const e = n.split('.').pop().toLowerCase();
      if (['jpg','jpeg','png','gif','webp'].includes(e)) return 'fa-image';
      if (e === 'pdf') return 'fa-file-pdf';
      if (['xls','xlsx'].includes(e)) return 'fa-file-excel';
      if (['doc','docx'].includes(e)) return 'fa-file-word';
      return 'fa-file';
    };
    container.innerHTML = this._files.map((f, i) => `
      <div style="display:flex;align-items:center;gap:6px;padding:5px 10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;font-size:12px;color:var(--text);">
        <i class="fa-solid ${ext2icon(f.name)}" style="color:var(--brand);font-size:13px;"></i>
        <span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${f.name}">${f.name}</span>
        <span style="color:var(--text-muted);font-size:11px;">${(f.size/1024).toFixed(0)} KB</span>
        <button onclick="Pages.intake._removeFile(${i})" style="background:none;border:none;cursor:pointer;color:var(--text-muted);padding:0 2px;font-size:12px;" title="Remover">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    `).join('');
  }
};
