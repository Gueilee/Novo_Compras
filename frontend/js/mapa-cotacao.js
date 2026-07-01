/* ══════════════════════════════════════════════════════════════
   MAPA DE COTAÇÃO — gerador de PDF via janela de impressão
   Uso: MapaCotacao.gerar(idRequisicao)
══════════════════════════════════════════════════════════════ */
window.MapaCotacao = {

  async gerar(idRequisicao) {
    const btn = event?.currentTarget;
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gerando...`; }

    try {
      // Passo 1: selecionar aprovadores antes de gerar
      const aprovadores = await this._selecionarAprovadores();
      if (aprovadores === null) return; // usuário cancelou

      const d = await Api.get(`/api/requisicoes/${idRequisicao}/detalhes-completos`);
      const cotacoes = (d.cotacoes || []).filter(c => c.preco_unitario > 0);

      if (cotacoes.length === 0) {
        Toast.warning('Sem cotações', 'Não há propostas com valores para gerar o mapa.');
        return;
      }

      const html = this._buildHtml(d, cotacoes, aprovadores);
      const win = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
      win.document.write(html);
      win.document.close();
      win.focus();
      // Aguarda imagens carregarem antes de imprimir
      win.onload = () => setTimeout(() => win.print(), 400);
    } catch (e) {
      Toast.error('Erro ao gerar mapa', e.message || 'Tente novamente.');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fa-solid fa-file-pdf"></i> Mapa de Cotação`; }
    }
  },

  // ── Estado interno do modal de aprovadores ─────────────────
  _apr: { selecionados: [], busca: '', resolve: null, usuarios: [] },

  async _selecionarAprovadores() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return [];

    this._apr = { selecionados: [], busca: '', resolve: null, usuarios: [] };

    // Carrega usuários em background — renderiza assim que chegar
    Api.get('/api/usuarios').then(res => {
      this._apr.usuarios = ((res.usuarios || res || [])).filter(u => u.ativo !== false && u.email);
      this._renderModalAprovadores();
    }).catch(() => {});

    return new Promise(resolve => {
      this._apr.resolve = resolve;
      this._renderModalAprovadores();
      overlay.classList.add('open');
    });
  },

  _renderModalAprovadores() {
    const overlay = document.getElementById('modal-overlay');
    if (!overlay) return;
    const { selecionados, busca, usuarios } = this._apr;
    const b = busca.toLowerCase();
    const filtrados = usuarios.filter(u =>
      !b || (u.nome||'').toLowerCase().includes(b) || (u.email||'').toLowerCase().includes(b)
    );
    const esc = s => (s||'').replace(/'/g, "\\'").replace(/"/g, '&quot;');

    overlay.innerHTML = `
      <div class="modal" style="max-width:500px;">
        <div class="modal-header">
          <div class="modal-icon" style="background:#f0ecfa;color:#6633ee;">
            <i class="fa-solid fa-user-check"></i>
          </div>
          <div>
            <div class="modal-title">Aprovadores do Mapa</div>
            <div class="modal-subtitle">Selecione até 3 responsáveis pela aprovação</div>
          </div>
        </div>
        <div class="modal-body">

          <div style="position:relative;margin-bottom:10px;">
            <i class="fa-solid fa-magnifying-glass" style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:#bbb;font-size:12px;pointer-events:none;"></i>
            <input type="text" class="form-control form-control-sm"
                   placeholder="Buscar por nome ou e-mail..."
                   style="padding-left:32px;" value="${esc(busca)}"
                   oninput="MapaCotacao._filtrarAprovadores(this.value)">
          </div>

          <div style="max-height:200px;overflow-y:auto;border:1px solid var(--border);border-radius:8px;margin-bottom:12px;">
            ${filtrados.length ? filtrados.map(u => {
              const isSel = selecionados.some(s => s.email === u.email);
              const disabled = !isSel && selecionados.length >= 3;
              return `
                <div onclick="${disabled ? '' : `MapaCotacao._toggleAprovador('${esc(u.email)}','${esc(u.nome||u.email)}','${esc(u.cargo||'')}');`}"
                     style="display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:${disabled?'not-allowed':'pointer'};border-bottom:1px solid var(--border-subtle);background:${isSel?'#f9f7ff':'transparent'};opacity:${disabled?.45:1};">
                  <div style="width:18px;height:18px;flex-shrink:0;border-radius:4px;border:2px solid ${isSel?'#6633ee':'#d1d5db'};background:${isSel?'#6633ee':'transparent'};display:flex;align-items:center;justify-content:center;">
                    ${isSel ? '<i class="fa-solid fa-check" style="color:#fff;font-size:9px;"></i>' : ''}
                  </div>
                  <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${u.nome||u.email}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${u.email}${u.cargo?` · ${u.cargo}`:''}</div>
                  </div>
                  ${isSel ? '<i class="fa-solid fa-circle-check" style="color:#6633ee;font-size:14px;flex-shrink:0;"></i>' : ''}
                </div>`;
            }).join('') : `
              <div style="padding:24px;text-align:center;color:var(--text-muted);font-size:13px;">
                <i class="fa-solid fa-magnifying-glass" style="opacity:.4;"></i>
                <div style="margin-top:6px;">${busca ? 'Nenhum resultado' : 'Carregando usuários...'}</div>
              </div>`}
          </div>

          <div style="margin-bottom:14px;">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:7px;">
              Selecionados
              <span style="color:${selecionados.length===3?'#dc2626':'var(--brand)'};">${selecionados.length}/3</span>
            </div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;min-height:32px;">
              ${selecionados.map(s => `
                <span style="display:inline-flex;align-items:center;gap:5px;background:#f0ecfa;border:1.5px solid #c4b5fd;border-radius:20px;padding:3px 10px;font-size:12px;font-weight:600;color:#5b21b6;">
                  <i class="fa-solid fa-user" style="font-size:9px;"></i>
                  ${s.nome||s.email}
                  <button onclick="MapaCotacao._removeAprovador('${esc(s.email)}');"
                          style="background:none;border:none;cursor:pointer;color:#9333ea;padding:0 0 0 3px;font-size:11px;line-height:1;">
                    <i class="fa-solid fa-xmark"></i>
                  </button>
                </span>
              `).join('') || `<span style="font-size:12px;color:var(--text-subtle);font-style:italic;">Nenhum aprovador selecionado</span>`}
            </div>
          </div>

          <div style="border-top:1px solid var(--border);padding-top:12px;">
            <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em;margin-bottom:6px;">
              Adicionar e-mail externo <span style="font-weight:400;text-transform:none;">(opcional)</span>
            </div>
            <div style="display:flex;gap:8px;">
              <input id="apr-email-manual" type="email" class="form-control form-control-sm"
                     placeholder="email@empresa.com.br" style="flex:1;"
                     onkeydown="if(event.key==='Enter')MapaCotacao._addEmailManual()">
              <button class="btn btn-outline btn-sm" onclick="MapaCotacao._addEmailManual()"
                      style="white-space:nowrap;" ${selecionados.length>=3?'disabled':''}>
                <i class="fa-solid fa-plus"></i> Adicionar
              </button>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" onclick="MapaCotacao._confirmarAprovadores(null)">Cancelar</button>
          <button class="btn btn-outline btn-sm" onclick="MapaCotacao._confirmarAprovadores('skip')"
                  title="Gerar sem aprovadores definidos" style="color:var(--text-muted);">
            <i class="fa-solid fa-forward"></i> Pular
          </button>
          <button class="btn btn-primary" onclick="MapaCotacao._confirmarAprovadores()">
            <i class="fa-solid fa-file-pdf"></i> Gerar Mapa
          </button>
        </div>
      </div>`;
  },

  _toggleAprovador(email, nome, cargo) {
    const arr = this._apr.selecionados;
    const idx = arr.findIndex(a => a.email === email);
    if (idx >= 0) arr.splice(idx, 1);
    else if (arr.length < 3) arr.push({ email, nome, cargo });
    this._renderModalAprovadores();
  },

  _removeAprovador(email) {
    this._apr.selecionados = this._apr.selecionados.filter(a => a.email !== email);
    this._renderModalAprovadores();
  },

  _filtrarAprovadores(busca) {
    this._apr.busca = busca;
    this._renderModalAprovadores();
  },

  _addEmailManual() {
    const input = document.getElementById('apr-email-manual');
    const email = (input?.value || '').trim().toLowerCase();
    if (!email || !email.includes('@')) { Toast.warning('E-mail inválido', 'Informe um e-mail válido.'); return; }
    if (this._apr.selecionados.some(a => a.email === email)) { Toast.warning('Já adicionado', 'Este e-mail já está na lista.'); return; }
    if (this._apr.selecionados.length >= 3) { Toast.warning('Limite atingido', 'Máximo de 3 aprovadores por mapa.'); return; }
    const nome = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    this._apr.selecionados.push({ email, nome, cargo: '' });
    if (input) input.value = '';
    this._renderModalAprovadores();
  },

  _confirmarAprovadores(action) {
    document.getElementById('modal-overlay')?.classList.remove('open');
    if (!this._apr.resolve) return;
    if (action === null)    { this._apr.resolve(null); return; }   // cancelar → aborta gerar()
    if (action === 'skip')  { this._apr.resolve([]);   return; }   // pular → gera sem aprovadores
    this._apr.resolve([...this._apr.selecionados]);                 // confirma com selecionados
  },

  _fmt(val) {
    if (val == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  },

  _buildHtml(d, cotacoes, aprovadores = []) {
    const hoje = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
    const hojeHora = new Date().toLocaleString('pt-BR');

    const menorPreco  = Math.min(...cotacoes.map(c => c.preco_unitario));
    const selecionado = cotacoes.find(c => c.selecionado);
    const solicitante = d.solicitante || d.comprador || '—';
    const compradorResp = d.comprador_responsavel || '—';

    /* ── Colunas de cotação ─────────────────────────────── */
    const colWidth = Math.max(18, Math.floor(62 / cotacoes.length));

    /* ── Cabeçalhos das colunas ─────────────────────────── */
    const thCols = cotacoes.map((c, i) => {
      const isBest = c.preco_unitario === menorPreco;
      const isSel  = c.selecionado;
      return `
        <th class="${isSel ? 'col-sel' : isBest ? 'col-best' : 'col-reg'}" style="width:${colWidth}%;">
          ${isSel ? '<div class="badge-sel">✓ SELECIONADO</div>' : isBest ? '<div class="badge-best">🏆 MENOR PREÇO</div>' : `<div class="badge-num">${i + 1}º</div>`}
          <div class="th-name">${c.nome}</div>
          ${c.cnpj ? `<div class="th-cnpj">${c.cnpj}</div>` : ''}
        </th>`;
    }).join('');

    /* ── Linhas de dados ────────────────────────────────── */
    const rows = [
      {
        label: 'Valor Cotado pelo Fornecedor',
        icon: '💰',
        bold: true,
        cells: cotacoes.map(c => {
          const isBest = c.preco_unitario === menorPreco;
          const varPct = menorPreco > 0 ? ((c.preco_unitario - menorPreco) / menorPreco * 100) : 0;
          return `
            <td class="${c.selecionado ? 'col-sel' : isBest ? 'col-best' : ''}">
              <div class="price-val">${this._fmt(c.preco_unitario)}</div>
              ${varPct > 0.05 ? `<div class="price-var">+${varPct.toFixed(1)}%</div>` : isBest ? `<div class="price-base">base</div>` : ''}
            </td>`;
        }).join(''),
      },
      ...(temDescComp ? [{
        label: 'Desconto Negociado (Comprador)',
        icon: '🏷️',
        bold: false,
        cells: cotacoes.map(c => {
          if (!c.selecionado) return `<td class="${c.preco_unitario === menorPreco ? 'col-best' : ''}">—</td>`;
          return `<td class="col-sel" style="color:#059669;font-weight:700;">
            ${dcTipo === '%' ? `${dcVal}%` : this._fmt(dcVal)}
            <div style="font-size:7.5pt;color:#555;font-weight:400;">Negociado pelo comprador</div>
          </td>`;
        }).join(''),
      }, {
        label: 'Preço Final Negociado',
        icon: '✅',
        bold: true,
        cells: cotacoes.map(c => {
          if (!c.selecionado) return `<td class="${c.preco_unitario === menorPreco ? 'col-best' : ''}">—</td>`;
          return `<td class="col-sel">
            <div class="price-val" style="color:#059669;">${this._fmt(pnf)}</div>
            <div class="price-base">preço final</div>
          </td>`;
        }).join(''),
      }] : []),
      {
        label: 'Detalhamento por Item',
        icon: '📋',
        cells: cotacoes.map(c => {
          const itens = c.itens_precos || [];
          if (itens.length === 0) return `<td class="${c.selecionado ? 'col-sel' : ''}" style="color:#aaa;font-size:8pt;">—</td>`;
          return `<td class="${c.selecionado ? 'col-sel' : ''}" style="text-align:left;padding:5px 8px;">
            ${itens.map(it => `
              <div style="font-size:8pt;padding:2px 0;border-bottom:1px solid rgba(0,0,0,.06);display:flex;justify-content:space-between;gap:8px;">
                <span style="color:#555;flex:1;">${it.descricao} (${it.quantidade}x)</span>
                <span style="font-weight:700;color:#422c76;white-space:nowrap;">${this._fmt(it.preco_unitario)}</span>
              </div>`).join('')}
          </td>`;
        }).join(''),
      },
      {
        label: 'Prazo de Entrega',
        icon: '📦',
        cells: cotacoes.map(c => `<td class="${c.selecionado ? 'col-sel' : ''}">${c.prazo ?? '—'} dias úteis</td>`).join(''),
      },
      {
        label: 'Condição de Pagamento',
        icon: '💳',
        cells: cotacoes.map(c => `<td class="${c.selecionado ? 'col-sel' : ''}">${c.pagamento || '—'}</td>`).join(''),
      },
      {
        label: 'Validade da Proposta',
        icon: '📅',
        cells: cotacoes.map(c => `<td class="${c.selecionado ? 'col-sel' : ''}">${c.validade_dias ?? 15} dias</td>`).join(''),
      },
      {
        label: 'Frete',
        icon: '🚚',
        cells: cotacoes.map(c => `<td class="${c.selecionado ? 'col-sel' : ''}">
          <span class="${c.frete_incluso ? 'ok' : 'no'}">${c.frete_incluso ? '✔ Incluso' : '✖ A negociar'}</span>
        </td>`).join(''),
      },
      {
        label: 'Impostos',
        icon: '🧾',
        cells: cotacoes.map(c => `<td class="${c.selecionado ? 'col-sel' : ''}">
          <span class="${c.imposto_incluso ? 'ok' : 'no'}">${c.imposto_incluso ? '✔ Inclusos' : '✖ A negociar'}</span>
        </td>`).join(''),
      },
      {
        label: 'Observações',
        icon: '📝',
        cells: cotacoes.map(c => `<td class="${c.selecionado ? 'col-sel' : ''}" style="font-size:8.5pt;color:#555;">${c.observacoes || '—'}</td>`).join(''),
      },
      {
        label: 'Documento Anexo',
        icon: '📎',
        cells: cotacoes.map(c => `<td class="${c.selecionado ? 'col-sel' : ''}">
          ${c.arquivo_nome ? `<span style="color:#1d4ed8;">📄 ${c.arquivo_nome}</span>` : '<span style="color:#aaa;">—</span>'}
        </td>`).join(''),
      },
    ];

    const tableRows = rows.map(r => `
      <tr>
        <td class="row-label">
          <span class="row-icon">${r.icon}</span>
          <span ${r.bold ? 'style="font-weight:700;"' : ''}>${r.label}</span>
        </td>
        ${r.cells}
      </tr>`).join('');

    /* ── Itens da requisição ────────────────────────────── */
    const itensRows = (d.itens || []).map((it, i) => `
      <tr>
        <td style="color:#888;width:28px;">${i + 1}</td>
        <td style="font-weight:600;">${it.descricao}</td>
        <td>${it.segmento || '—'}</td>
        <td style="text-align:right;font-weight:700;color:#422c76;">${it.quantidade} ${it.unidade || ''}</td>
      </tr>`).join('');

    /* ── Células de assinatura (dinâmicas por aprovadores) ── */
    const assinaturaCells = aprovadores.length > 0
      ? aprovadores.map(a => `
          <td style="width:${Math.floor(100 / aprovadores.length)}%;padding:0 12px 0 0;">
            <div class="assinatura-linha"></div>
            <div class="assinatura-label">
              ${a.nome || a.email}
              ${a.cargo ? `<br><span style="font-size:6pt;color:#aaa;">${a.cargo}</span>` : ''}
              <br><span style="font-size:6.5pt;color:#999;">${a.email}</span>
            </div>
          </td>`).join('')
      : `<td><div class="assinatura-linha"></div><div class="assinatura-label">Requisitante: ${solicitante}</div></td>
         <td><div class="assinatura-linha"></div><div class="assinatura-label">Comprador: ${compradorResp}</div></td>
         <td><div class="assinatura-linha"></div><div class="assinatura-label">Aprovação / Data</div></td>`;

    /* ── Seção de aprovação do gestor (interativa, no-print) ── */
    const jaAprovadoCnpj = d.aprovado_gestor_cnpj ? d.aprovado_gestor_cnpj.replace(/\D/g, '') : null;
    const aprBtnLabel = jaAprovadoCnpj ? 'Atualizar Aprovação' : 'Confirmar Aprovação e Notificar Comprador';
    const aprSec = (() => {
      if (cotacoes.length === 0) return '';
      const fmt = v => this._fmt(v);
      const radioCards = cotacoes.map(c => {
        const cCnpj = (c.cnpj || '').replace(/\D/g, '');
        const isSel  = jaAprovadoCnpj && cCnpj === jaAprovadoCnpj;
        const isMenor = c.preco_unitario === menorPreco;
        return `
        <label class="apr-card" style="display:flex;align-items:center;gap:12px;padding:12px 16px;border:2px solid ${isSel ? '#422c76' : '#e5e7eb'};border-radius:8px;cursor:pointer;background:${isSel ? '#f8f6ff' : '#fff'};margin-bottom:8px;transition:border-color .15s,background .15s;"
               onclick="document.querySelectorAll('.apr-card').forEach(el=>Object.assign(el.style,{borderColor:'#e5e7eb',background:'#fff'}));Object.assign(this.style,{borderColor:'#422c76',background:'#f8f6ff'});">
          <input type="radio" name="apr-forn" value="${c.cnpj}" ${isSel ? 'checked' : ''} style="width:18px;height:18px;accent-color:#422c76;flex-shrink:0;">
          <div style="flex:1;min-width:0;">
            <div style="font-size:13.5px;font-weight:700;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${c.nome}</div>
            <div style="font-size:11.5px;color:#888;margin-top:2px;">${fmt(c.preco_unitario)} &nbsp;·&nbsp; ${c.prazo ?? '—'} dias &nbsp;·&nbsp; ${c.pagamento || '—'}</div>
          </div>
          ${isMenor ? '<span style="background:#f0fdf4;color:#059669;font-size:10px;font-weight:800;padding:3px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0;">🏆 Menor Preço</span>' : ''}
        </label>`;
      }).join('');

      return `
<div class="no-print" id="apr-gestor-section" style="margin:16px 0;padding:20px 24px;background:#fff;border:2.5px solid #422c76;border-radius:12px;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
    <div style="width:32px;height:32px;background:#422c76;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-size:16px;flex-shrink:0;">✓</div>
    <div>
      <div style="font-size:14px;font-weight:800;color:#422c76;">Aprovação do Gestor — Requisição #${d.id}</div>
      <div style="font-size:12px;color:#888;margin-top:1px;">Selecione o fornecedor preferido e clique em confirmar para notificar o comprador.</div>
    </div>
  </div>
  ${jaAprovadoCnpj ? `<div style="background:#f0fdf4;border:1px solid #059669;border-radius:8px;padding:9px 14px;margin-bottom:12px;font-size:12.5px;color:#065f46;">✅ <strong>Aprovação já registrada.</strong> Você pode selecionar novamente para alterar.</div>` : ''}
  <div id="apr-body">
    ${radioCards}
    <textarea id="apr-obs" rows="2" placeholder="Observação para o comprador (opcional)..."
      style="width:100%;padding:10px 12px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:13px;resize:vertical;font-family:inherit;box-sizing:border-box;margin-top:6px;"></textarea>
    <div style="display:flex;justify-content:flex-end;margin-top:12px;">
      <button id="apr-btn" onclick="aprConfirmar(${d.id})"
        style="display:inline-flex;align-items:center;gap:8px;background:#422c76;color:#fff;border:none;border-radius:8px;padding:11px 24px;font-size:13.5px;font-weight:700;cursor:pointer;"
        onmouseover="this.style.background='#5b3fa8'" onmouseout="this.style.background='#422c76'">
        ✓ ${aprBtnLabel}
      </button>
    </div>
  </div>
</div>
<script>
async function aprConfirmar(idReq) {
  const radio = document.querySelector('input[name="apr-forn"]:checked');
  if (!radio) { alert('Selecione o fornecedor preferido antes de confirmar.'); return; }
  const cnpj = radio.value;
  const obs  = (document.getElementById('apr-obs')?.value || '').trim();
  const btn  = document.getElementById('apr-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '⏳ Enviando...'; }
  try {
    const sbUrl = window.opener?._SHP_SB_URL;
    const sbKey = window.opener?._SHP_SB_KEY;
    if (!sbUrl || !sbKey) throw new Error('Abra o mapa pelo sistema SHP para habilitar a aprovação online.');
    const r = await fetch(sbUrl + '/rest/v1/requisicoes?id_sharepoint=eq.' + idReq, {
      method: 'PATCH',
      headers: {
        'apikey': sbKey, 'Authorization': 'Bearer ' + sbKey,
        'Content-Type': 'application/json', 'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        aprovado_gestor_cnpj: cnpj,
        aprovado_gestor_obs:  obs || null,
        aprovado_gestor_em:   new Date().toLocaleString('pt-BR'),
        status: 'Aprovado Gestor',
        updated_at: new Date().toISOString()
      })
    });
    if (!r.ok) { const t = await r.text(); throw new Error('HTTP ' + r.status + ': ' + t); }
    document.getElementById('apr-body').innerHTML = \`
      <div style="background:#f0fdf4;border:2px solid #059669;border-radius:10px;padding:24px;text-align:center;">
        <div style="font-size:44px;margin-bottom:8px;">✅</div>
        <div style="font-size:15px;font-weight:800;color:#059669;margin-bottom:6px;">Aprovação Confirmada!</div>
        <div style="font-size:13px;color:#555;">O comprador foi notificado. Status: <strong>"Aprovado Gestor"</strong>.</div>
        <div style="margin-top:12px;font-size:12px;color:#888;">Você pode fechar esta janela.</div>
      </div>\`;
  } catch(e) {
    if (btn) { btn.disabled = false; btn.innerHTML = '✓ ${aprBtnLabel}'; }
    alert('Erro ao registrar aprovação: ' + e.message);
  }
}
</script>`;
    })();

    /* ── Bloco de decisão ───────────────────────────────── */
    const pnf    = d.preco_negociado_final;
    const dcTipo = d.desconto_comprador_tipo;
    const dcVal  = d.desconto_comprador_valor;
    const temDescComp = pnf && dcVal && dcVal > 0;
    const precoExibido = selecionado
      ? (temDescComp && pnf < selecionado.preco_unitario ? pnf : selecionado.preco_unitario)
      : null;

    const decisaoBlock = selecionado
      ? `<div class="decisao-box decisao-ok">
          <div class="decisao-title">✓ Fornecedor Selecionado</div>
          <div class="decisao-fornecedor">${selecionado.nome}</div>
          <div class="decisao-sub">
            ${temDescComp ? `
            Preço cotado: <strong>${this._fmt(selecionado.preco_unitario)}</strong>
            &nbsp;·&nbsp; Desconto comprador: <strong style="color:#059669;">${dcTipo === '%' ? dcVal + '%' : this._fmt(dcVal)}</strong>
            &nbsp;·&nbsp; <strong>Preço final: ${this._fmt(pnf)}</strong>
            ` : `Preço: <strong>${this._fmt(selecionado.preco_unitario)}</strong>`}
            &nbsp;·&nbsp; Prazo: <strong>${selecionado.prazo} dias úteis</strong> &nbsp;·&nbsp;
            Pgto: <strong>${selecionado.pagamento || '—'}</strong>
          </div>
          ${aprovadores.length ? `<div style="margin-top:8px;font-size:7.5pt;color:#555;border-top:1px solid rgba(5,150,105,.2);padding-top:6px;">
            <strong>Aprovadores:</strong> ${aprovadores.map(a => a.nome || a.email).join(' · ')}
          </div>` : ''}
        </div>`
      : `<div class="decisao-box decisao-pending">
          <div class="decisao-title">⏳ Aguardando Aprovação</div>
          <div class="decisao-sub">
            ${aprovadores.length
              ? `Mapa encaminhado para aprovação de <strong>${aprovadores.map(a => a.nome || a.email).join(', ')}</strong>.`
              : 'O comprador responsável deve avaliar as propostas e indicar o fornecedor preferido.'}
          </div>
          <table class="assinatura-table">
            <tr>${assinaturaCells}</tr>
          </table>
        </div>`;

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Mapa de Cotação — Requisição #${d.id}</title>
<style>
  @page {
    size: A4 landscape;
    margin: 12mm 10mm 14mm 10mm;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    font-size: 9.5pt;
    color: #1a1a2e;
    background: #fff;
  }

  /* ── Cabeçalho ─────────────────────────────────────── */
  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    border-bottom: 3px solid #422c76;
    padding-bottom: 10px;
    margin-bottom: 14px;
  }
  .brand-block { display: flex; align-items: center; gap: 10px; }
  .brand-logo { height: 36px; object-fit: contain; }
  .brand-name {
    font-size: 18pt;
    font-weight: 800;
    color: #422c76;
    letter-spacing: -0.5px;
    line-height: 1;
  }
  .brand-sub { font-size: 8pt; color: #888; margin-top: 2px; }
  .doc-title-block { text-align: right; }
  .doc-title {
    font-size: 16pt;
    font-weight: 800;
    color: #422c76;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .doc-sub { font-size: 8pt; color: #888; margin-top: 2px; }
  .doc-id {
    font-size: 11pt;
    font-weight: 700;
    color: #ff2f69;
    margin-top: 3px;
  }

  /* ── Info da requisição ─────────────────────────────── */
  .req-info {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 12px;
  }
  .info-box {
    background: #f8f6ff;
    border: 1px solid #e0d9f9;
    border-radius: 6px;
    padding: 7px 10px;
  }
  .info-lbl {
    font-size: 7pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: #888;
    margin-bottom: 2px;
  }
  .info-val {
    font-size: 9.5pt;
    font-weight: 700;
    color: #1a1a2e;
  }
  .info-val.status {
    color: #422c76;
  }

  /* ── Justificativa ──────────────────────────────────── */
  .justificativa-box {
    background: #f8f6ff;
    border-left: 3px solid #422c76;
    border-radius: 0 6px 6px 0;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 9pt;
    color: #333;
    line-height: 1.5;
  }
  .justificativa-box strong { font-size: 8pt; text-transform: uppercase; letter-spacing: .06em; color: #888; display: block; margin-bottom: 3px; }

  /* ── Seção de itens ─────────────────────────────────── */
  .section-title {
    font-size: 8.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .08em;
    color: #422c76;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e0d9f9;
  }

  .itens-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 8.5pt;
  }
  .itens-table th {
    background: #422c76;
    color: #fff;
    padding: 5px 8px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 7.5pt;
    letter-spacing: .05em;
    text-align: left;
  }
  .itens-table td {
    padding: 5px 8px;
    border-bottom: 1px solid #ede9fe;
  }
  .itens-table tr:nth-child(even) td { background: #f8f6ff; }

  /* ── Tabela comparativa ─────────────────────────────── */
  .comp-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 8.5pt;
    margin-bottom: 14px;
    table-layout: fixed;
  }
  .comp-table th {
    padding: 8px 6px;
    text-align: center;
    vertical-align: top;
    border: 1px solid #ddd;
    line-height: 1.3;
  }
  .comp-table td {
    padding: 6px 8px;
    border: 1px solid #eee;
    vertical-align: middle;
    text-align: center;
  }

  /* Coluna de labels (1ª col) */
  .row-label {
    text-align: left !important;
    background: #f8f6ff;
    font-weight: 600;
    color: #555;
    width: 16%;
    border-right: 2px solid #e0d9f9 !important;
    white-space: nowrap;
    padding: 6px 8px !important;
  }
  .row-icon { margin-right: 5px; font-size: 9pt; }

  /* Colunas de fornecedores */
  .col-best { background: #f0fdf4 !important; }
  .col-sel  { background: #eff6ff !important; }
  .col-reg  { background: #fff; }

  /* Cabeçalho de fornecedor */
  .badge-sel  { background: #1d4ed8; color: #fff; font-size: 7pt; font-weight: 800; padding: 2px 5px; border-radius: 4px; margin-bottom: 4px; display: inline-block; }
  .badge-best { background: #059669; color: #fff; font-size: 7pt; font-weight: 800; padding: 2px 5px; border-radius: 4px; margin-bottom: 4px; display: inline-block; }
  .badge-num  { background: #e5e7eb; color: #6b7280; font-size: 7pt; font-weight: 800; padding: 2px 5px; border-radius: 4px; margin-bottom: 4px; display: inline-block; }
  .th-name { font-size: 9pt; font-weight: 800; color: #1a1a2e; line-height: 1.2; }
  .th-cnpj { font-size: 7.5pt; color: #888; margin-top: 2px; }

  /* Valores de preço */
  .price-val { font-size: 11pt; font-weight: 800; color: #422c76; }
  .price-var { font-size: 7.5pt; color: #dc2626; font-weight: 700; margin-top: 2px; }
  .price-base { font-size: 7.5pt; color: #059669; font-weight: 700; margin-top: 2px; }
  .ok { color: #059669; font-weight: 700; }
  .no { color: #d97706; }

  /* ── Bloco de decisão ───────────────────────────────── */
  .decisao-box {
    border-radius: 8px;
    padding: 12px 16px;
    margin-bottom: 12px;
  }
  .decisao-ok {
    background: #f0fdf4;
    border: 1.5px solid #059669;
  }
  .decisao-pending {
    background: #fffbeb;
    border: 1.5px solid #f59e0b;
  }
  .decisao-title {
    font-size: 10pt;
    font-weight: 800;
    margin-bottom: 4px;
    color: #1a1a2e;
  }
  .decisao-fornecedor {
    font-size: 12pt;
    font-weight: 800;
    color: #422c76;
    margin-bottom: 4px;
  }
  .decisao-sub { font-size: 8.5pt; color: #555; }

  /* Linhas de assinatura */
  .assinatura-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 12px;
  }
  .assinatura-table td { padding: 0 16px 0 0; width: 33%; }
  .assinatura-linha {
    border-bottom: 1.5px solid #333;
    height: 28px;
    margin-bottom: 3px;
  }
  .assinatura-label {
    font-size: 7.5pt;
    color: #666;
    text-align: center;
  }

  /* ── Rodapé ─────────────────────────────────────────── */
  .page-footer {
    border-top: 2px solid #422c76;
    padding-top: 7px;
    margin-top: 10px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 7.5pt;
    color: #888;
  }
  .footer-left { line-height: 1.5; }
  .footer-right { text-align: right; line-height: 1.5; }
  .footer-brand { font-weight: 800; color: #422c76; font-size: 8.5pt; }

  /* ── Botão de impressão (oculto ao imprimir) ────────── */
  .print-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: #422c76;
    color: #fff;
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    margin-bottom: 16px;
  }
  .print-btn:hover { background: #5b3fa8; }
  .no-print { }

  @media print {
    .no-print { display: none !important; }
    body { font-size: 9pt; }
    @page { margin: 10mm 8mm 12mm 8mm; }
  }
</style>
</head>
<body>

<div class="no-print" style="background:#f8f6ff;border-bottom:2px solid #422c76;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;">
  <div style="font-size:13px;font-weight:700;color:#422c76;">
    <i>📄</i> Mapa de Cotação — Requisição #${d.id}
    <span style="font-weight:400;color:#888;font-size:12px;margin-left:10px;">Clique em Imprimir para salvar como PDF</span>
  </div>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
</div>

<div style="padding: 0 2mm;">

  <!-- ══ CABEÇALHO ══════════════════════════════════════════ -->
  <div class="page-header">
    <div class="brand-block">
      <img class="brand-logo" src="/img/logo.png" alt="Vendemmia"
           onerror="this.style.display='none';document.getElementById('brand-text').style.display='block'">
      <div id="brand-text" style="display:none;">
        <div class="brand-name">Vendemmia</div>
      </div>
      <div>
        <div class="brand-sub">Sistema de Compras — SHP</div>
      </div>
    </div>
    <div class="doc-title-block">
      <div class="doc-title">Mapa de Cotação</div>
      <div class="doc-id">Requisição #${d.id}</div>
      <div class="doc-sub">Gerado em ${hojeHora}</div>
    </div>
  </div>

  <!-- ══ DADOS DA REQUISIÇÃO ════════════════════════════════ -->
  <div class="req-info">
    <div class="info-box">
      <div class="info-lbl">Solicitante</div>
      <div class="info-val">${solicitante}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Comprador Responsável</div>
      <div class="info-val">${compradorResp}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Unidade / Setor</div>
      <div class="info-val">${d.unidade || '—'}${d.setor ? ` · ${d.setor}` : ''}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Data da Solicitação</div>
      <div class="info-val">${d.data || '—'}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Status Atual</div>
      <div class="info-val status">${d.status || '—'}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Total de Itens</div>
      <div class="info-val">${d.total_itens ?? d.itens?.length ?? 0} item(ns)</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Propostas Recebidas</div>
      <div class="info-val">${cotacoes.length} fornecedor(es)</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Data do Mapa</div>
      <div class="info-val">${hoje}</div>
    </div>
  </div>

  ${d.justificativa ? `
  <div class="justificativa-box">
    <strong>Justificativa da Compra</strong>
    ${d.justificativa}
  </div>` : ''}

  <!-- ══ ITENS SOLICITADOS ══════════════════════════════════ -->
  ${(d.itens?.length) ? `
  <div class="section-title">📋 Itens Solicitados</div>
  <table class="itens-table">
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th>Descrição do Item / Serviço</th>
        <th style="width:140px;">Categoria</th>
        <th style="width:80px;text-align:right;">Quantidade</th>
      </tr>
    </thead>
    <tbody>${itensRows}</tbody>
  </table>` : ''}

  <!-- ══ MAPA COMPARATIVO ═══════════════════════════════════ -->
  <div class="section-title">📊 Comparativo de Propostas</div>
  <table class="comp-table">
    <thead>
      <tr>
        <th style="width:16%;background:#422c76;color:#fff;text-align:left;padding:8px;">Critério</th>
        ${thCols}
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
  </table>

  <!-- ══ DECISÃO / ASSINATURA ══════════════════════════════ -->
  ${decisaoBlock}

  <!-- ══ APROVAÇÃO DO GESTOR (interativo, não impresso) ════ -->
  ${aprSec}

  <!-- ══ RODAPÉ ════════════════════════════════════════════ -->
  <div class="page-footer">
    <div class="footer-left">
      <div class="footer-brand">Vendemmia — Sistema de Compras (SHP)</div>
      <div>Documento gerado automaticamente em ${hojeHora}</div>
      <div>Este documento é confidencial e destinado exclusivamente ao processo de compras interno.</div>
    </div>
    <div class="footer-right">
      <div>Requisição #${d.id} &nbsp;·&nbsp; ${cotacoes.length} proposta(s)</div>
      <div>Solicitante: ${solicitante}</div>
      <div>Comprador: ${compradorResp}</div>
    </div>
  </div>

</div><!-- /padding wrapper -->
</body>
</html>`;
  }
};
