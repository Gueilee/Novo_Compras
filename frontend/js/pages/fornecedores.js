/* =========================================================
   SHP — GESTÃO DE FORNECEDORES
   ========================================================= */
window.Pages = window.Pages || {};
window.Pages.fornecedores = {
  title: 'Gestão de Fornecedores',

  _todos:    [],
  _filtrado: [],
  _status:   'todos',
  _pag:      1,
  _ppag:     50,

  render() {
    return `
<div style="padding:24px 28px;max-width:1440px;margin:0 auto;">

  <!-- Page Header -->
  <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:28px;flex-wrap:wrap;gap:12px;">
    <div>
      <h2 style="font-size:22px;font-weight:800;color:var(--text);margin:0;letter-spacing:-0.4px;">Base de Fornecedores</h2>
      <p style="font-size:13px;color:var(--text-muted);margin:5px 0 0;">Envie links de cadastro e acompanhe a situação de cada fornecedor</p>
    </div>
    <button onclick="Pages.fornecedores._exportarLinks()"
            style="display:inline-flex;align-items:center;gap:7px;padding:9px 18px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);font-size:13px;font-weight:600;color:var(--text-muted);cursor:pointer;transition:all .15s;"
            onmouseover="this.style.borderColor='var(--brand)';this.style.color='var(--brand)'"
            onmouseout="this.style.borderColor='var(--border)';this.style.color='var(--text-muted)'">
      <i class="fa-solid fa-file-export"></i> Exportar Links Pendentes
    </button>
  </div>

  <!-- KPI Cards -->
  <div id="forn-kpis" style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:24px;">
    ${Array.from({length:4}).map(() => `
      <div style="background:var(--surface-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px 22px;display:flex;align-items:center;gap:14px;">
        <div style="width:44px;height:44px;border-radius:12px;background:var(--bg);flex-shrink:0;"></div>
        <div style="flex:1;">
          <div style="width:80px;height:9px;background:var(--bg);border-radius:4px;margin-bottom:10px;"></div>
          <div style="width:50px;height:24px;background:var(--bg);border-radius:6px;"></div>
        </div>
      </div>
    `).join('')}
  </div>

  <!-- Filters -->
  <div style="display:flex;gap:12px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
    <div style="flex:1;min-width:220px;position:relative;">
      <i class="fa-solid fa-magnifying-glass"
         style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-subtle);font-size:13px;pointer-events:none;"></i>
      <input type="text" id="forn-busca"
             placeholder="Buscar por nome ou CNPJ..."
             oninput="Pages.fornecedores._aplicarFiltros()"
             onfocus="this.style.borderColor='var(--brand)'"
             onblur="this.style.borderColor='var(--border)'"
             style="width:100%;padding:9px 12px 9px 38px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);font-size:13px;font-family:var(--font);color:var(--text);outline:none;box-sizing:border-box;transition:border-color .15s;">
    </div>
    <div style="display:flex;gap:3px;background:var(--surface);border:1px solid var(--border);border-radius:var(--r-md);padding:3px;" id="forn-tabs">
      <button onclick="Pages.fornecedores._setStatus('todos')" id="forn-tab-todos"
              style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:var(--brand);color:#fff;transition:all .15s;">
        Todos
      </button>
      <button onclick="Pages.fornecedores._setStatus('cadastrado')" id="forn-tab-cadastrado"
              style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--text-muted);transition:all .15s;">
        ✓ Cadastrados
      </button>
      <button onclick="Pages.fornecedores._setStatus('pendente')" id="forn-tab-pendente"
              style="padding:6px 14px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--text-muted);transition:all .15s;">
        ⏳ Pendentes
      </button>
    </div>
    <div id="forn-contagem" style="font-size:12px;color:var(--text-muted);white-space:nowrap;padding:0 4px;"></div>
  </div>

  <!-- Table -->
  <div style="background:var(--surface-card);border:1px solid var(--border);border-radius:var(--r-lg);overflow:hidden;">
    <div id="forn-table-wrap">
      <div style="display:flex;align-items:center;justify-content:center;padding:60px;gap:12px;color:var(--text-muted);">
        <div class="spinner"></div>
        <span style="font-size:13px;">Carregando fornecedores...</span>
      </div>
    </div>
  </div>

  <!-- Pagination -->
  <div id="forn-paginacao"
       style="display:flex;align-items:center;justify-content:space-between;margin-top:16px;min-height:32px;gap:12px;flex-wrap:wrap;">
  </div>

</div>

<!-- Detail Drawer -->
<div id="forn-drawer-overlay"
     style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:1000;backdrop-filter:blur(2px);"
     onclick="Pages.fornecedores._fecharDetalhe(event)">
  <div id="forn-drawer"
       style="position:absolute;right:0;top:0;bottom:0;width:420px;max-width:100%;background:var(--surface-card);box-shadow:-8px 0 32px rgba(0,0,0,.18);overflow-y:auto;padding:28px 24px;">
  </div>
</div>`;
  },

  async init() {
    try {
      const data = await Api.get('/api/fornecedores/lista');
      this._todos   = data.fornecedores || [];
      this._status  = 'todos';
      this._pag     = 1;
      this._renderKpis(data);
      this._aplicarFiltros();
      const busca = document.getElementById('forn-busca');
      if (busca) busca.value = '';
    } catch(e) {
      console.error(e);
      document.getElementById('forn-table-wrap').innerHTML = `
        <div style="padding:60px;text-align:center;">
          <i class="fa-solid fa-circle-exclamation" style="font-size:28px;color:#dc2626;display:block;margin-bottom:10px;"></i>
          <p style="color:var(--text-muted);font-size:14px;margin:0;">Erro ao carregar: ${e.message}</p>
        </div>`;
    }
  },

  _renderKpis(data) {
    const total       = this._todos.length;
    const cadastrados = this._todos.filter(f => f.cadastro_completo === true).length;
    const pendentes   = total - cadastrados;
    const pct         = total > 0 ? Math.round((cadastrados / total) * 100) : 0;

    const cards = [
      { icon: 'fa-building-user', label: 'Total de Fornecedores', valor: total.toLocaleString('pt-BR'),         cor: '#6366f1', bg: '#ede9fe' },
      { icon: 'fa-circle-check',  label: 'Cadastro Completo',     valor: cadastrados.toLocaleString('pt-BR'),   cor: '#16a34a', bg: '#dcfce7' },
      { icon: 'fa-clock',         label: 'Cadastro Pendente',     valor: pendentes.toLocaleString('pt-BR'),     cor: '#d97706', bg: '#fef3c7' },
      { icon: 'fa-chart-pie',     label: 'Taxa de Cadastro',      valor: pct + '%',                             cor: '#0284c7', bg: '#e0f2fe' },
    ];

    document.getElementById('forn-kpis').innerHTML = cards.map(k => `
      <div style="background:var(--surface-card);border:1px solid var(--border);border-radius:var(--r-lg);padding:20px 22px;
                  display:flex;align-items:center;gap:16px;transition:box-shadow .2s;cursor:default;"
           onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'"
           onmouseout="this.style.boxShadow='none'">
        <div style="width:44px;height:44px;border-radius:12px;background:${k.bg};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <i class="fa-solid ${k.icon}" style="color:${k.cor};font-size:18px;"></i>
        </div>
        <div>
          <div style="font-size:10.5px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">${k.label}</div>
          <div style="font-size:28px;font-weight:800;color:var(--text);line-height:1;letter-spacing:-0.5px;">${k.valor}</div>
        </div>
      </div>
    `).join('');
  },

  _setStatus(s) {
    this._status = s;
    ['todos','cadastrado','pendente'].forEach(t => {
      const btn = document.getElementById(`forn-tab-${t}`);
      if (!btn) return;
      btn.style.background = t === s ? 'var(--brand)' : 'transparent';
      btn.style.color      = t === s ? '#fff'         : 'var(--text-muted)';
    });
    this._pag = 1;
    this._aplicarFiltros();
  },

  _aplicarFiltros() {
    const busca = (document.getElementById('forn-busca')?.value || '').toLowerCase().trim();
    let lista = [...this._todos];

    if (busca) {
      const buscaNum = busca.replace(/\D/g, '');
      lista = lista.filter(f =>
        f.razao_social?.toLowerCase().includes(busca) ||
        (buscaNum && f.cnpj?.includes(buscaNum))
      );
    }
    if (this._status === 'cadastrado') lista = lista.filter(f => f.cadastro_completo === true);
    if (this._status === 'pendente')   lista = lista.filter(f => !f.cadastro_completo);

    this._filtrado = lista;
    this._pag = 1;
    this._renderTabela();
    this._renderPaginacao();
  },

  _baseUrl() {
    return window.location.href.replace(/[^/]*$/, '');
  },

  _fmtCnpj(c) {
    return (c || '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
  },

  _renderTabela() {
    const inicio  = (this._pag - 1) * this._ppag;
    const pagina  = this._filtrado.slice(inicio, inicio + this._ppag);
    const contEl  = document.getElementById('forn-contagem');
    if (contEl) {
      contEl.textContent = `${this._filtrado.length.toLocaleString('pt-BR')} resultado${this._filtrado.length !== 1 ? 's' : ''}`;
    }

    if (!this._filtrado.length) {
      document.getElementById('forn-table-wrap').innerHTML = `
        <div style="padding:60px;text-align:center;">
          <i class="fa-solid fa-magnifying-glass" style="font-size:28px;color:var(--border);display:block;margin-bottom:12px;"></i>
          <p style="color:var(--text-muted);font-size:14px;margin:0;">Nenhum fornecedor encontrado</p>
        </div>`;
      return;
    }

    const base = this._baseUrl();

    document.getElementById('forn-table-wrap').innerHTML = `
      <div style="overflow-x:auto;">
      <table style="width:100%;border-collapse:collapse;min-width:700px;">
        <thead>
          <tr style="background:var(--bg);border-bottom:1.5px solid var(--border);">
            <th style="${this._thStyle()}width:44px;">#</th>
            <th style="${this._thStyle()}">Razão Social</th>
            <th style="${this._thStyle()}">CNPJ</th>
            <th style="${this._thStyle()}">Status</th>
            <th style="${this._thStyle()}">Segmentos</th>
            <th style="${this._thStyle()}text-align:right;">Links</th>
          </tr>
        </thead>
        <tbody>
          ${pagina.map((f, i) => {
            const num       = inicio + i + 1;
            const cadastrado = f.cadastro_completo === true;
            const cnpjFmt   = this._fmtCnpj(f.cnpj);
            const urlCadastro = `${base}cadastro-fornecedor.html?cnpj=${f.cnpj}`;
            const segs = Array.isArray(f.segmentos_interesse) && f.segmentos_interesse.length
              ? f.segmentos_interesse.slice(0,3).map(s =>
                  `<span style="display:inline-flex;padding:2px 7px;background:var(--bg);border:1px solid var(--border-subtle);border-radius:10px;font-size:10.5px;color:var(--text-muted);font-weight:500;white-space:nowrap;">${s}</span>`
                ).join(' ')
                + (f.segmentos_interesse.length > 3 ? ` <span style="font-size:11px;color:var(--text-subtle);">+${f.segmentos_interesse.length - 3}</span>` : '')
              : `<span style="font-size:12px;color:var(--text-subtle);">—</span>`;

            return `
            <tr style="border-bottom:1px solid var(--border-subtle);transition:background .12s;"
                onmouseover="this.style.background='var(--bg)'"
                onmouseout="this.style.background=''">
              <td style="padding:12px 16px;font-size:12px;color:var(--text-subtle);font-weight:500;">${num}</td>
              <td style="padding:12px 16px;">
                <div style="font-size:13px;font-weight:600;color:var(--text);max-width:300px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${this._esc(f.razao_social)}">${this._esc(f.razao_social) || '—'}</div>
                ${f.email ? `<div style="font-size:11px;color:var(--text-subtle);margin-top:1px;max-width:280px;overflow:hidden;text-overflow:ellipsis;">${f.email}</div>` : ''}
              </td>
              <td style="padding:12px 16px;font-size:12px;color:var(--text-muted);white-space:nowrap;font-variant-numeric:tabular-nums;">${cnpjFmt}</td>
              <td style="padding:12px 16px;white-space:nowrap;">
                ${cadastrado
                  ? `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;background:#dcfce7;color:#166534;border-radius:20px;font-size:11px;font-weight:700;"><i class="fa-solid fa-circle-check" style="font-size:9px;"></i> Cadastrado</span>`
                  : `<span style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;background:#fef3c7;color:#92400e;border-radius:20px;font-size:11px;font-weight:700;"><i class="fa-solid fa-clock" style="font-size:9px;"></i> Pendente</span>`
                }
              </td>
              <td style="padding:12px 16px;max-width:240px;">${segs}</td>
              <td style="padding:12px 16px;text-align:right;">
                <div style="display:inline-flex;gap:6px;align-items:center;">
                  <button onclick="Pages.fornecedores._copiarLink('${this._esc(f.cnpj)}', '${this._esc(urlCadastro)}')"
                          title="Copiar link de cadastro para enviar ao fornecedor"
                          style="display:inline-flex;align-items:center;gap:5px;padding:6px 12px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:var(--r-md);font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;white-space:nowrap;"
                          onmouseover="this.style.background='#dbeafe';this.style.borderColor='#93c5fd'"
                          onmouseout="this.style.background='#eff6ff';this.style.borderColor='#bfdbfe'">
                    <i class="fa-solid fa-link" style="font-size:10px;"></i> Cadastro
                  </button>
                  ${cadastrado ? `
                  <button onclick="Pages.fornecedores._verDetalhe('${this._esc(f.cnpj)}')"
                          title="Ver dados do fornecedor"
                          style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--surface);color:var(--text-muted);border:1px solid var(--border);border-radius:var(--r-md);font-size:12px;cursor:pointer;transition:all .15s;"
                          onmouseover="this.style.background='var(--bg)';this.style.color='var(--text)'"
                          onmouseout="this.style.background='var(--surface)';this.style.color='var(--text-muted)'">
                    <i class="fa-solid fa-eye"></i>
                  </button>` : ''}
                </div>
              </td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      </div>`;
  },

  _thStyle() {
    return 'padding:11px 16px;text-align:left;font-size:10.5px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:.07em;white-space:nowrap;';
  },

  _esc(s) {
    return (s || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
  },

  _renderPaginacao() {
    const totalPags = Math.ceil(this._filtrado.length / this._ppag);
    const el = document.getElementById('forn-paginacao');
    if (!el) return;

    if (totalPags <= 1) {
      el.innerHTML = `<span style="font-size:12px;color:var(--text-muted);">${this._filtrado.length.toLocaleString('pt-BR')} fornecedor${this._filtrado.length !== 1 ? 'es' : ''}</span>`;
      return;
    }

    const inicio = (this._pag - 1) * this._ppag + 1;
    const fim    = Math.min(this._pag * this._ppag, this._filtrado.length);
    const p      = this._pag;

    const btnStyle = (ativo) =>
      `padding:6px 10px;min-width:32px;border:1px solid ${ativo ? 'var(--brand)' : 'var(--border)'};border-radius:var(--r-md);background:${ativo ? 'var(--brand)' : 'var(--surface)'};color:${ativo ? '#fff' : 'var(--text-muted)'};cursor:pointer;font-size:12px;font-weight:${ativo ? '700' : '400'};transition:all .15s;`;

    const nums = this._paginaNums(p, totalPags);

    el.innerHTML = `
      <span style="font-size:12px;color:var(--text-muted);">Exibindo ${inicio.toLocaleString('pt-BR')}–${fim.toLocaleString('pt-BR')} de ${this._filtrado.length.toLocaleString('pt-BR')}</span>
      <div style="display:flex;gap:4px;align-items:center;">
        <button onclick="Pages.fornecedores._irPag(${p-1})" ${p<=1?'disabled':''} style="${btnStyle(false)}${p<=1?'opacity:.4;cursor:not-allowed;':''}">
          <i class="fa-solid fa-chevron-left" style="font-size:10px;"></i>
        </button>
        ${nums.map(n => n === '…'
          ? `<span style="font-size:12px;color:var(--text-subtle);padding:0 4px;">…</span>`
          : `<button onclick="Pages.fornecedores._irPag(${n})" style="${btnStyle(n===p)}">${n}</button>`
        ).join('')}
        <button onclick="Pages.fornecedores._irPag(${p+1})" ${p>=totalPags?'disabled':''} style="${btnStyle(false)}${p>=totalPags?'opacity:.4;cursor:not-allowed;':''}">
          <i class="fa-solid fa-chevron-right" style="font-size:10px;"></i>
        </button>
      </div>
      <span style="font-size:12px;color:var(--text-muted);">Página ${p} de ${totalPags}</span>`;
  },

  _paginaNums(p, total) {
    if (total <= 7) return Array.from({length:total}, (_,i) => i+1);
    const nums = new Set([1, total, p]);
    for (let d = -2; d <= 2; d++) { const n = p+d; if (n>=1&&n<=total) nums.add(n); }
    const sorted = [...nums].sort((a,b)=>a-b);
    const result = [];
    for (let i = 0; i < sorted.length; i++) {
      if (i > 0 && sorted[i] - sorted[i-1] > 1) result.push('…');
      result.push(sorted[i]);
    }
    return result;
  },

  _irPag(p) {
    const total = Math.ceil(this._filtrado.length / this._ppag);
    if (p < 1 || p > total) return;
    this._pag = p;
    this._renderTabela();
    this._renderPaginacao();
    document.getElementById('content')?.scrollTo({ top: 0, behavior: 'smooth' });
  },

  _copiarLink(cnpj, url) {
    const copiar = (txt) => {
      navigator.clipboard.writeText(txt).then(() => {
        Toast.success('Link copiado!', 'Cole e envie pelo WhatsApp, e-mail ou qualquer canal que preferir.');
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = txt; ta.style.position='fixed'; ta.style.opacity='0';
        document.body.appendChild(ta); ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        Toast.success('Link copiado!', 'Cole e envie para o fornecedor.');
      });
    };
    copiar(url);
  },

  _verDetalhe(cnpj) {
    const f = this._todos.find(x => x.cnpj === cnpj);
    if (!f) return;

    const cnpjFmt = this._fmtCnpj(f.cnpj);
    const segs = Array.isArray(f.segmentos_interesse) && f.segmentos_interesse.length
      ? f.segmentos_interesse.map(s => `<span style="display:inline-flex;padding:3px 9px;background:var(--bg);border:1px solid var(--border);border-radius:10px;font-size:12px;color:var(--text-muted);margin:2px;">${s}</span>`).join('')
      : '<span style="color:var(--text-subtle);font-size:13px;">Não informado</span>';

    const row = (label, valor) => valor ? `
      <div style="padding:12px 0;border-bottom:1px solid var(--border-subtle);">
        <div style="font-size:10.5px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:.07em;margin-bottom:4px;">${label}</div>
        <div style="font-size:13px;color:var(--text);">${valor}</div>
      </div>` : '';

    const base = this._baseUrl();
    const urlCad = `${base}cadastro-fornecedor.html?cnpj=${f.cnpj}`;

    document.getElementById('forn-drawer').innerHTML = `
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:20px;">
        <div>
          <div style="font-size:15px;font-weight:800;color:var(--text);line-height:1.3;margin-bottom:6px;">${this._esc(f.razao_social)}</div>
          <span style="display:inline-flex;align-items:center;gap:5px;padding:4px 11px;background:#dcfce7;color:#166534;border-radius:20px;font-size:11px;font-weight:700;">
            <i class="fa-solid fa-circle-check" style="font-size:9px;"></i> Cadastrado
          </span>
        </div>
        <button onclick="Pages.fornecedores._fecharDetalhe()"
                style="width:32px;height:32px;border:1px solid var(--border);border-radius:var(--r-md);background:var(--surface);color:var(--text-muted);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .15s;"
                onmouseover="this.style.background='var(--bg)'"
                onmouseout="this.style.background='var(--surface)'">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      ${row('CNPJ', `<span style="font-family:monospace;">${cnpjFmt}</span>`)}
      ${row('E-mail', f.email)}
      ${row('Telefone', f.telefone)}
      ${row('Contato Comercial', [f.contato_comercial_email, f.contato_comercial_tel].filter(Boolean).join(' · '))}
      ${row('Contato Financeiro', [f.contato_financeiro_email, f.contato_financeiro_tel].filter(Boolean).join(' · '))}
      ${row('Contato Fiscal', [f.contato_fiscal_email, f.contato_fiscal_tel].filter(Boolean).join(' · '))}
      ${f.endereco_cidade ? row('Endereço', [f.endereco_logradouro, f.endereco_numero, f.endereco_bairro, f.endereco_cidade, f.endereco_uf].filter(Boolean).join(', ')) : ''}

      <div style="padding:12px 0;border-bottom:1px solid var(--border-subtle);">
        <div style="font-size:10.5px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">Segmentos de Interesse</div>
        <div>${segs}</div>
      </div>

      <div style="margin-top:20px;">
        <div style="font-size:10.5px;font-weight:700;color:var(--text-subtle);text-transform:uppercase;letter-spacing:.07em;margin-bottom:8px;">Link de Atualização de Cadastro</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <input readonly value="${urlCad}"
                 style="flex:1;padding:8px 10px;background:var(--bg);border:1px solid var(--border);border-radius:var(--r-md);font-size:11px;color:var(--text-muted);font-family:monospace;overflow:hidden;text-overflow:ellipsis;outline:none;">
          <button onclick="Pages.fornecedores._copiarLink('${f.cnpj}', '${this._esc(urlCad)}')"
                  style="padding:8px 12px;background:#eff6ff;color:#1d4ed8;border:1px solid #bfdbfe;border-radius:var(--r-md);font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;transition:all .15s;"
                  onmouseover="this.style.background='#dbeafe'"
                  onmouseout="this.style.background='#eff6ff'">
            <i class="fa-solid fa-copy"></i> Copiar
          </button>
        </div>
      </div>`;

    const overlay = document.getElementById('forn-drawer-overlay');
    if (overlay) {
      overlay.style.display = 'block';
      requestAnimationFrame(() => {
        const drawer = document.getElementById('forn-drawer');
        if (drawer) { drawer.style.transform = 'translateX(100%)'; drawer.style.transition = 'none'; }
        requestAnimationFrame(() => {
          if (drawer) { drawer.style.transition = 'transform .25s cubic-bezier(.4,0,.2,1)'; drawer.style.transform = 'translateX(0)'; }
        });
      });
    }
  },

  _fecharDetalhe(e) {
    if (e && e.target !== document.getElementById('forn-drawer-overlay')) return;
    const overlay = document.getElementById('forn-drawer-overlay');
    if (overlay) overlay.style.display = 'none';
  },

  _exportarLinks() {
    const base      = this._baseUrl();
    const pendentes = this._filtrado.filter(f => !f.cadastro_completo);
    if (!pendentes.length) {
      Toast.info('Sem pendências', 'Todos os fornecedores nos resultados atuais já têm cadastro completo.');
      return;
    }
    const linhas = pendentes.map(f =>
      `${f.razao_social}\t${this._fmtCnpj(f.cnpj)}\t${base}cadastro-fornecedor.html?cnpj=${f.cnpj}`
    ).join('\n');
    navigator.clipboard.writeText(linhas).then(() => {
      Toast.success('Exportado!', `${pendentes.length} link${pendentes.length !== 1 ? 's' : ''} copiado${pendentes.length !== 1 ? 's' : ''} (Nome, CNPJ e Link separados por tab — cole diretamente no Excel).`);
    }).catch(() => {
      Toast.error('Erro', 'Não foi possível copiar. Tente selecionar o texto manualmente.');
    });
  },
};
