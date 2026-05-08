/* ── RECEBIMENTO PAGE (Conciliação) ───────────────────────── */
window.Pages = window.Pages || {};

window.Pages.recebimento = {
  title: 'Conciliação',
  subtitle: 'Reconciliação de NF, PO e recebimento físico',
  icon: 'fa-boxes-stacked',
  _pedidoAtual: null,

  render() {
    return `
    <div class="page-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Conciliação</h1>
          <p class="page-subtitle">Reconcilie nota fiscal, ordem de compra e recebimento físico</p>
        </div>
        <div class="page-header-actions">
          <span class="badge badge-brand">
            <i class="fa-solid fa-shield-halved"></i> Controle de Pagamentos
          </span>
        </div>
      </div>

      <!-- Fluxo visual -->
      <div style="display:flex;align-items:center;gap:0;margin-bottom:28px;">
        <div style="flex:1;background:#fff;border:1px solid var(--border);border-radius:var(--r-md);padding:14px 18px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:var(--brand-surface);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--brand);flex-shrink:0;">
            <i class="fa-solid fa-file-invoice-dollar"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--brand);">Passo 1</div>
            <div style="font-size:13px;font-weight:600;color:var(--text);">Ordem de Compra</div>
            <div style="font-size:11px;color:var(--text-muted);">Selecione a PO aprovada</div>
          </div>
        </div>
        <div style="width:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-chevron-right" style="color:var(--border);font-size:14px;"></i>
        </div>
        <div style="flex:1;background:#fff;border:1px solid var(--border);border-radius:var(--r-md);padding:14px 18px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:var(--warning-surface);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--warning-dark);flex-shrink:0;">
            <i class="fa-solid fa-truck-ramp-box"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--warning-dark);">Passo 2</div>
            <div style="font-size:13px;font-weight:600;color:var(--text);">Recebimento Físico</div>
            <div style="font-size:11px;color:var(--text-muted);">Informe quantidades e valores</div>
          </div>
        </div>
        <div style="width:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-chevron-right" style="color:var(--border);font-size:14px;"></i>
        </div>
        <div style="flex:1;background:#fff;border:1px solid var(--border);border-radius:var(--r-md);padding:14px 18px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:var(--success-surface);border-radius:10px;display:flex;align-items:center;justify-content:center;color:var(--success-dark);flex-shrink:0;">
            <i class="fa-solid fa-file-contract"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--success-dark);">Passo 3</div>
            <div style="font-size:13px;font-weight:600;color:var(--text);">Nota Fiscal</div>
            <div style="font-size:11px;color:var(--text-muted);">Anexe o PDF ou XML da NF-e</div>
          </div>
        </div>
        <div style="width:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;">
          <i class="fa-solid fa-chevron-right" style="color:var(--border);font-size:14px;"></i>
        </div>
        <div style="flex:1;background:var(--brand);border:1px solid var(--brand);border-radius:var(--r-md);padding:14px 18px;display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;background:rgba(255,255,255,.15);border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0;">
            <i class="fa-solid fa-scale-balanced"></i>
          </div>
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:rgba(255,255,255,.7);">Resultado</div>
            <div style="font-size:13px;font-weight:600;color:#fff;">Conciliação</div>
            <div style="font-size:11px;color:rgba(255,255,255,.7);">Aprovado ou bloqueado</div>
          </div>
        </div>
      </div>

      <!-- Formulário principal -->
      <div class="card">

        <!-- Seção 1: PO -->
        <div style="margin-bottom:28px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
            <div style="width:28px;height:28px;background:var(--brand);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;">1</div>
            <span style="font-size:14px;font-weight:700;color:var(--text);">Selecione a Ordem de Compra</span>
          </div>
          <select class="form-control" id="rec-po-select" onchange="Pages.recebimento.selecionarPO(this.value)"
                  style="font-size:14px;height:44px;">
            <option value="">Escolha uma PO para conciliar...</option>
          </select>
          <!-- Banner PO selecionada -->
          <div id="rec-po-banner" style="display:none;margin-top:12px;background:var(--brand-surface);border:1px solid var(--brand-light);border-radius:var(--r-md);padding:12px 16px;display:none;align-items:center;gap:12px;">
            <i class="fa-solid fa-circle-check" style="color:var(--brand);font-size:18px;"></i>
            <div>
              <div id="rec-po-banner-title" style="font-size:13px;font-weight:700;color:var(--brand);"></div>
              <div style="font-size:11px;color:var(--text-muted);">PO selecionada e pronta para conciliação</div>
            </div>
          </div>
        </div>

        <div id="rec-po-info" style="display:none;">
          <div style="height:1px;background:var(--border);margin-bottom:28px;"></div>

          <!-- Seção 2: Dados da NF -->
          <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
              <div style="width:28px;height:28px;background:var(--warning-dark);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;">2</div>
              <span style="font-size:14px;font-weight:700;color:var(--text);">Dados do Recebimento e Nota Fiscal</span>
            </div>
            <!-- Painel de referência da PO (preenchido dinamicamente) -->
            <div id="rec-po-ref" style="display:none;align-items:center;gap:10px;padding:10px 14px;
                 background:var(--brand-surface);border:1px solid var(--brand-light);
                 border-radius:10px;margin-bottom:14px;flex-wrap:wrap;"></div>

            <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
              <div class="form-group" style="margin:0;">
                <label class="form-label form-label-required">Número da NF</label>
                <input type="text" class="form-control" id="rec-nf" placeholder="Ex: NF-e 123456"
                       style="height:44px;font-size:14px;">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label form-label-required">Quantidade Recebida</label>
                <input type="number" class="form-control" id="rec-qtd" placeholder="0" min="0" step="0.01"
                       style="height:44px;font-size:14px;">
              </div>
              <div class="form-group" style="margin:0;">
                <label class="form-label form-label-required">Valor Total da NF (R$)</label>
                <input type="number" class="form-control" id="rec-valor" placeholder="0,00" min="0" step="0.01"
                       style="height:44px;font-size:14px;">
              </div>
            </div>
          </div>

          <div style="height:1px;background:var(--border);margin-bottom:28px;"></div>

          <!-- Seção 3: Upload NF -->
          <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px;">
              <div style="width:28px;height:28px;background:var(--success-dark);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:13px;font-weight:700;flex-shrink:0;">3</div>
              <span style="font-size:14px;font-weight:700;color:var(--text);">Anexar Nota Fiscal</span>
              <span style="font-size:11px;color:var(--text-muted);margin-left:4px;">(opcional — PDF ou XML da NF-e)</span>
            </div>

            <!-- Drop Zone -->
            <div id="rec-upload-area"
                 style="border:2px dashed var(--border);border-radius:12px;padding:32px 24px;text-align:center;cursor:pointer;transition:all .2s;background:var(--bg);"
                 onclick="document.getElementById('rec-nf-file').click()"
                 ondragover="event.preventDefault();this.style.borderColor='var(--brand)';this.style.background='var(--brand-surface)';"
                 ondragleave="this.style.borderColor='var(--border)';this.style.background='var(--bg)';"
                 ondrop="event.preventDefault();this.style.borderColor='var(--border)';this.style.background='var(--bg)';Pages.recebimento.handleFileDrop(event);">
              <input type="file" id="rec-nf-file" accept=".pdf,.xml" style="display:none;"
                     onchange="Pages.recebimento.handleFileSelect(this)">

              <div id="rec-upload-placeholder">
                <div style="width:64px;height:64px;background:var(--brand-surface);border-radius:16px;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;color:var(--brand);">
                  <i class="fa-solid fa-file-arrow-up" style="font-size:28px;"></i>
                </div>
                <div style="font-size:15px;font-weight:700;color:var(--text);margin-bottom:6px;">Arraste o arquivo aqui</div>
                <div style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">ou clique para selecionar</div>
                <div style="display:inline-flex;gap:10px;align-items:center;">
                  <span style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--text-muted);">
                    <i class="fa-solid fa-file-pdf" style="color:#e53e3e;margin-right:4px;"></i>PDF
                  </span>
                  <span style="background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:4px 10px;font-size:11px;font-weight:600;color:var(--text-muted);">
                    <i class="fa-solid fa-file-code" style="color:var(--brand);margin-right:4px;"></i>XML NF-e
                  </span>
                  <span style="font-size:11px;color:var(--text-muted);">· máx. 10MB</span>
                </div>
              </div>

              <div id="rec-upload-preview" style="display:none;"></div>
            </div>

            <!-- Histórico de uploads desta PO -->
            <div id="rec-upload-historico" style="display:none;margin-top:12px;"></div>
          </div>

          <div style="height:1px;background:var(--border);margin-bottom:28px;"></div>

          <!-- Seção 4: Entrada no Estoque (opcional) -->
          <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
              <div style="width:28px;height:28px;background:var(--brand-surface);border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--brand);font-size:13px;font-weight:700;flex-shrink:0;">
                <i class="fa-solid fa-warehouse" style="font-size:12px;"></i>
              </div>
              <span style="font-size:14px;font-weight:700;color:var(--text);">Registrar Entrada no Estoque</span>
              <span style="font-size:11px;color:var(--text-muted);">(opcional)</span>
              <label class="cfg-toggle" style="margin-left:auto;" title="Ativar entrada no estoque">
                <input type="checkbox" id="rec-est-toggle" onchange="Pages.recebimento._toggleEstoque(this.checked)">
                <span class="cfg-toggle-slider"></span>
              </label>
            </div>
            <div id="rec-est-fields" style="display:none;background:var(--brand-surface);border:1px solid var(--brand-light);border-radius:var(--r-md);padding:16px 18px;">
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                <div class="form-group" style="margin:0;">
                  <label class="form-label form-label-required">Descrição do Item</label>
                  <input type="text" class="form-control" id="rec-est-desc" placeholder="Ex: Papel A4 500fls" style="height:40px;">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Segmento</label>
                  <input type="text" class="form-control" id="rec-est-seg" placeholder="Ex: Material de Escritório" style="height:40px;">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Quantidade</label>
                  <input type="number" class="form-control" id="rec-est-qtd" min="0.001" step="0.001" placeholder="0" style="height:40px;">
                </div>
                <div class="form-group" style="margin:0;">
                  <label class="form-label">Unidade de Medida</label>
                  <input type="text" class="form-control" id="rec-est-um" placeholder="un, kg, cx..." value="un" style="height:40px;">
                </div>
              </div>
              <div style="font-size:11.5px;color:var(--text-muted);margin-top:10px;">
                <i class="fa-solid fa-circle-info" style="margin-right:4px;color:var(--brand);"></i>
                O fornecedor e valor unitário serão preenchidos automaticamente a partir da PO.
              </div>
            </div>
          </div>

          <div style="height:1px;background:var(--border);margin-bottom:28px;"></div>

          <!-- Botão executar -->
          <button class="btn btn-primary btn-lg btn-block" style="height:52px;font-size:15px;font-weight:700;letter-spacing:0.3px;"
                  onclick="Pages.recebimento.realizarMatch()">
            <i class="fa-solid fa-magnifying-glass-chart" style="font-size:16px;margin-right:8px;"></i>
            Executar Conciliação
          </button>
        </div>
      </div>

      <!-- Resultado (aparece abaixo após execução) -->
      <div id="rec-resultado" style="margin-top:20px;"></div>

    </div>

    <style>
    .cfg-toggle { position:relative;width:40px;height:22px;display:inline-block;flex-shrink:0; }
    .cfg-toggle input { opacity:0;width:0;height:0; }
    .cfg-toggle-slider { position:absolute;inset:0;border-radius:22px;background:var(--border);cursor:pointer;transition:background .2s; }
    .cfg-toggle-slider::before { content:'';position:absolute;width:16px;height:16px;border-radius:50%;left:3px;top:3px;background:#fff;transition:transform .2s; }
    .cfg-toggle input:checked + .cfg-toggle-slider { background:var(--brand); }
    .cfg-toggle input:checked + .cfg-toggle-slider::before { transform:translateX(18px); }
    </style>`;
  },

  async init() {
    try {
      const pos = await Api.get('/api/recebimento/pendentes');
      const sel = document.getElementById('rec-po-select');
      if (sel) {
        pos.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id_pedido;
          opt.textContent = `PO #${p.id_pedido} — ${p.fornecedor}`;
          sel.appendChild(opt);
        });
      }
    } catch {
      Toast.error('Erro ao carregar POs', 'Verifique a API.');
    }
  },

  handleFileSelect(input) {
    const file = input.files[0];
    if (file) this._previewFile(file);
  },

  handleFileDrop(event) {
    const file = event.dataTransfer.files[0];
    if (file) {
      document.getElementById('rec-nf-file').files = event.dataTransfer.files;
      this._previewFile(file);
    }
  },

  _previewFile(file) {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf','xml'].includes(ext)) {
      Toast.warning('Formato inválido', 'Use PDF ou XML da NF-e.');
      return;
    }
    const area        = document.getElementById('rec-upload-area');
    const placeholder = document.getElementById('rec-upload-placeholder');
    const preview     = document.getElementById('rec-upload-preview');
    const isPdf = ext === 'pdf';
    const icon  = isPdf ? 'fa-file-pdf' : 'fa-file-code';
    const color = isPdf ? '#e53e3e' : 'var(--brand)';
    const bg    = isPdf ? '#fff5f5' : 'var(--brand-surface)';

    placeholder.style.display = 'none';
    preview.style.display = '';
    preview.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;padding:8px 0;justify-content:center;">
        <div style="width:56px;height:56px;background:${bg};border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid ${icon}" style="font-size:26px;color:${color};"></i>
        </div>
        <div style="text-align:left;">
          <div style="font-size:14px;font-weight:700;color:var(--text);max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${file.name}</div>
          <div style="font-size:12px;color:var(--text-muted);margin-top:3px;">${(file.size/1024).toFixed(1)} KB · ${ext.toUpperCase()} · Pronto para envio</div>
        </div>
        <button class="btn btn-ghost btn-sm" style="flex-shrink:0;border:1px solid var(--border);"
                onclick="Pages.recebimento._clearFile(event)" title="Remover arquivo">
          <i class="fa-solid fa-xmark"></i> Remover
        </button>
      </div>`;
    area.style.borderColor = 'var(--success)';
    area.style.background  = 'var(--success-surface)';
    area.onclick = null; // disable click-to-open while file is loaded
  },

  _clearFile(event) {
    event.stopPropagation();
    document.getElementById('rec-nf-file').value = '';
    document.getElementById('rec-upload-placeholder').style.display = '';
    document.getElementById('rec-upload-preview').style.display = 'none';
    const area = document.getElementById('rec-upload-area');
    area.style.borderColor = 'var(--border)';
    area.style.background  = 'var(--bg)';
    area.onclick = () => document.getElementById('rec-nf-file').click();
  },

  async selecionarPO(id) {
    this._pedidoAtual = id;
    this._clearFileFromSelect();
    document.getElementById('rec-resultado').innerHTML = '';

    const infoEl   = document.getElementById('rec-po-info');
    const bannerEl = document.getElementById('rec-po-banner');
    if (!id) {
      if (infoEl)   infoEl.style.display   = 'none';
      if (bannerEl) bannerEl.style.display = 'none';
      return;
    }

    // Show banner
    const sel  = document.getElementById('rec-po-select');
    const text = sel.options[sel.selectedIndex]?.text || `PO #${id}`;
    document.getElementById('rec-po-banner-title').textContent = text;
    bannerEl.style.display = 'flex';

    if (infoEl) infoEl.style.display = '';
    this._carregarHistoricoNF(id);

    // Busca valores esperados da PO e pré-preenche os campos
    try {
      const po = await Api.get(`/api/recebimento/dados-po/${id}`);
      const qtdEl   = document.getElementById('rec-qtd');
      const valorEl = document.getElementById('rec-valor');
      if (qtdEl && po.qtd_esperada != null) {
        qtdEl.value = po.qtd_esperada;
        qtdEl.placeholder = po.qtd_esperada;
      }
      if (valorEl && po.valor_esperado != null) {
        valorEl.value = po.valor_esperado > 0 ? po.valor_esperado : '';
        valorEl.placeholder = po.valor_esperado > 0 ? po.valor_esperado : '0,00';
      }
      // Exibe painel de referência
      const refEl = document.getElementById('rec-po-ref');
      if (refEl) {
        if (po.valor_esperado > 0) {
          refEl.style.display = '';
          refEl.innerHTML = `
            <i class="fa-solid fa-circle-info" style="color:var(--brand);flex-shrink:0;"></i>
            <span style="font-size:12.5px;color:var(--text-muted);">
              <strong style="color:var(--text);">Referência da PO:</strong>
              Quantidade: <strong>${po.qtd_esperada}</strong> un. &nbsp;·&nbsp;
              Preço unitário: <strong>${Fmt.currency(po.preco_unitario)}</strong> &nbsp;·&nbsp;
              Valor total esperado: <strong>${Fmt.currency(po.valor_esperado)}</strong>
            </span>`;
        } else {
          refEl.style.display = '';
          refEl.innerHTML = `
            <i class="fa-solid fa-triangle-exclamation" style="color:var(--warning-dark);flex-shrink:0;"></i>
            <span style="font-size:12.5px;color:var(--text-muted);">
              Nenhum preço encontrado na PO. Informe o valor da NF manualmente e a conciliação de valor será ignorada.
            </span>`;
        }
      }
    } catch { /* não crítico */ }
  },

  _clearFileFromSelect() {
    const fi = document.getElementById('rec-nf-file');
    if (fi) fi.value = '';
    const ph   = document.getElementById('rec-upload-placeholder');
    const pv   = document.getElementById('rec-upload-preview');
    const area = document.getElementById('rec-upload-area');
    if (ph)   ph.style.display = '';
    if (pv)   pv.style.display = 'none';
    if (area) {
      area.style.borderColor = 'var(--border)';
      area.style.background  = 'var(--bg)';
      area.onclick = () => document.getElementById('rec-nf-file').click();
    }
  },

  async _carregarHistoricoNF(id) {
    try {
      const uploads = await Api.get(`/api/recebimento/nf-uploads/${id}`);
      const el = document.getElementById('rec-upload-historico');
      if (!el) return;
      if (!uploads || uploads.length === 0) { el.style.display = 'none'; return; }

      el.style.display = '';
      el.innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:14px 16px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:10px;">
            <i class="fa-solid fa-clock-rotate-left"></i> NFs anteriores desta PO
          </div>
          ${uploads.map(u => `
            <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--border-subtle);">
              <i class="fa-solid ${u.tipo==='PDF'?'fa-file-pdf':'fa-file-code'}"
                 style="color:${u.tipo==='PDF'?'#e53e3e':'var(--brand)'};font-size:18px;flex-shrink:0;"></i>
              <div style="flex:1;min-width:0;">
                <div style="font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.nome_arquivo}</div>
                <div style="font-size:11px;color:var(--text-muted);">NF ${u.numero_nf||'—'} · ${u.tamanho_kb} KB · ${u.enviado_em}</div>
              </div>
              <span class="badge badge-success"><i class="fa-solid fa-check"></i> Enviado</span>
            </div>`).join('')}
        </div>`;
    } catch { /* não crítico */ }
  },

  _toggleEstoque(checked) {
    const el = document.getElementById('rec-est-fields');
    if (el) el.style.display = checked ? '' : 'none';
  },

  async realizarMatch() {
    const nf    = document.getElementById('rec-nf')?.value?.trim();
    const qtd   = parseFloat(document.getElementById('rec-qtd')?.value);
    const valor = parseFloat(document.getElementById('rec-valor')?.value);

    if (!nf)              { Toast.warning('Campo obrigatório', 'Informe o número da NF.'); return; }
    if (!qtd || qtd <= 0) { Toast.warning('Campo obrigatório', 'Informe a quantidade recebida.'); return; }
    if (!valor || valor <= 0) { Toast.warning('Campo obrigatório', 'Informe o valor da NF.'); return; }

    const resEl = document.getElementById('rec-resultado');
    resEl.innerHTML = `
      <div class="card" style="padding:32px;text-align:center;">
        <div class="loading-center">
          <div class="spinner"></div>
          <span style="font-size:14px;color:var(--text-muted);">Executando Conciliação...</span>
        </div>
      </div>`;
    resEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Upload NF file (non-blocking)
    const fileInput = document.getElementById('rec-nf-file');
    if (fileInput?.files?.length > 0) {
      try {
        await SbUploadNF(this._pedidoAtual, nf, fileInput.files[0]);
        this._carregarHistoricoNF(this._pedidoAtual);
      } catch { /* não crítico */ }
    }

    try {
      const res = await Api.post(`/api/recebimento/match/${this._pedidoAtual}`, {
        numero_nf: nf, qtd_recebida: qtd, valor_nf: valor
      });

      const approved = res.status === 'APROVADO';
      const acColor  = approved ? 'var(--success-dark)' : 'var(--accent-dark)';
      const acBg     = approved ? 'var(--success-surface)' : 'var(--accent-surface)';
      const acBorder = approved ? 'var(--success)' : 'var(--accent)';

      resEl.innerHTML = `
        <div class="card" style="border-top:4px solid ${approved ? 'var(--success)' : 'var(--accent)'};overflow:hidden;">

          <!-- Banner resultado -->
          <div style="display:flex;align-items:center;gap:20px;padding:24px;background:${acBg};border-bottom:1px solid ${acBorder};margin:-20px -20px 20px;">
            <div style="width:56px;height:56px;background:${acColor};border-radius:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              <i class="fa-solid ${approved ? 'fa-circle-check' : 'fa-circle-xmark'}" style="font-size:26px;color:#fff;"></i>
            </div>
            <div>
              <div style="font-size:20px;font-weight:800;color:${acColor};">
                ${approved ? 'Conciliação Aprovada!' : 'Conciliação Bloqueada'}
              </div>
              <div style="font-size:13px;color:var(--text-muted);margin-top:3px;">${res.mensagem}</div>
            </div>
            <div style="margin-left:auto;flex-shrink:0;">
              <span style="background:${acColor};color:#fff;border-radius:8px;padding:6px 14px;font-size:12px;font-weight:700;">
                ${approved ? 'APROVADO' : 'BLOQUEADO'}
              </span>
            </div>
          </div>

          <!-- Detalhes -->
          <div style="margin-bottom:20px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin-bottom:12px;">
              <i class="fa-solid fa-list-check"></i> Detalhes da Reconciliação
            </div>
            ${res.detalhes.map(d => `
              <div style="display:flex;align-items:flex-start;gap:12px;padding:12px 14px;background:var(--surface);border-radius:8px;margin-bottom:8px;border-left:3px solid ${approved ? 'var(--success)' : 'var(--accent)'};">
                <i class="fa-solid ${approved ? 'fa-check-circle' : 'fa-triangle-exclamation'}"
                   style="color:${approved ? 'var(--success-dark)' : 'var(--accent)'};font-size:15px;margin-top:1px;flex-shrink:0;"></i>
                <span style="font-size:13px;color:var(--text);">${d}</span>
              </div>`).join('')}
          </div>

          <!-- Status pagamento -->
          <div style="display:flex;align-items:center;gap:14px;padding:16px;background:${acBg};border-radius:10px;border:1px solid ${acBorder};">
            <i class="fa-solid ${approved ? 'fa-money-bill-wave' : 'fa-lock'}"
               style="color:${acColor};font-size:22px;flex-shrink:0;"></i>
            <div>
              <div style="font-size:14px;font-weight:700;color:${acColor};">
                ${approved ? 'Pagamento Liberado' : 'Pagamento Bloqueado'}
              </div>
              <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">
                ${approved
                  ? `NF ${nf} autorizada para a fila de pagamento.`
                  : 'Regularize as divergências e submeta novamente.'}
              </div>
            </div>
            ${approved ? `
            <div style="margin-left:auto;">
              <span class="badge badge-success" style="padding:6px 12px;font-size:12px;">
                <i class="fa-solid fa-check"></i> Liberado
              </span>
            </div>` : ''}
          </div>

        </div>`;

      if (approved) {
        Toast.success('Conciliação aprovada!', 'Requisição concluída e NF liberada para pagamento.');
        // Registrar entrada no estoque se toggle ativado
        const estToggle = document.getElementById('rec-est-toggle');
        if (estToggle?.checked) {
          const estDesc = document.getElementById('rec-est-desc')?.value.trim();
          const estQtd  = parseFloat(document.getElementById('rec-est-qtd')?.value);
          if (estDesc && estQtd > 0) {
            try {
              await Api.post('/api/estoque/entrada', {
                descricao: estDesc,
                segmento: document.getElementById('rec-est-seg')?.value.trim() || null,
                unidade_medida: document.getElementById('rec-est-um')?.value.trim() || 'un',
                quantidade: estQtd,
                valor_unitario: res.preco_unitario || null,
                fornecedor: res.fornecedor || null,
                id_requisicao: this._pedidoAtual,
                registrado_por: localStorage.getItem('shp_user_email') || null,
              });
              Toast.success('Entrada no estoque registrada!', `${estQtd} ${document.getElementById('rec-est-um')?.value||'un'} · ${estDesc}`);
            } catch { Toast.warning('Conciliação OK, mas erro ao registrar estoque', 'Registre manualmente no módulo de Estoque.'); }
          }
        }
        // Remove a PO do dropdown e reseta o formulário
        const sel = document.getElementById('rec-po-select');
        if (sel) {
          const opt = sel.querySelector(`option[value="${this._pedidoAtual}"]`);
          if (opt) opt.remove();
          sel.value = '';
        }
        const infoEl   = document.getElementById('rec-po-info');
        const bannerEl = document.getElementById('rec-po-banner');
        if (infoEl)   infoEl.style.display   = 'none';
        if (bannerEl) bannerEl.style.display = 'none';
        this._pedidoAtual = null;
      } else {
        Toast.error('Conciliação bloqueada!', 'Divergências encontradas. Pagamento bloqueado.');
      }
    } catch {
      resEl.innerHTML = `
        <div class="card" style="padding:32px;text-align:center;">
          <div class="empty-icon" style="background:var(--accent-surface);color:var(--accent);margin:0 auto 12px;">
            <i class="fa-solid fa-triangle-exclamation"></i>
          </div>
          <p style="font-weight:600;color:var(--accent);">Erro ao processar a conciliação</p>
          <p style="font-size:13px;color:var(--text-muted);">Verifique a API e tente novamente.</p>
        </div>`;
      Toast.error('Erro ao executar Conciliação');
    }
  }
};
