/* ══════════════════════════════════════════════════════════════
   MAPA DE COTAÇÃO — gerador de PDF via janela de impressão
   Uso: MapaCotacao.gerar(idRequisicao)
══════════════════════════════════════════════════════════════ */
window.MapaCotacao = {

  async gerar(idRequisicao) {
    const btn = event?.currentTarget;
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gerando...`; }

    try {
      const d = await Api.get(`/api/requisicoes/${idRequisicao}/detalhes-completos`);
      const cotacoes = (d.cotacoes || []).filter(c => c.preco_unitario > 0);

      if (cotacoes.length === 0) {
        Toast.warning('Sem cotações', 'Não há propostas com valores para gerar o mapa.');
        return;
      }

      const html = this._buildHtml(d, cotacoes);
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

  _fmt(val) {
    if (val == null) return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  },

  _buildHtml(d, cotacoes) {
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
        label: 'Valor Total da Proposta',
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

    /* ── Bloco de decisão ───────────────────────────────── */
    const decisaoBlock = selecionado
      ? `<div class="decisao-box decisao-ok">
          <div class="decisao-title">✓ Fornecedor Selecionado</div>
          <div class="decisao-fornecedor">${selecionado.nome}</div>
          <div class="decisao-sub">
            Preço: <strong>${this._fmt(selecionado.preco_unitario)}</strong> &nbsp;·&nbsp;
            Prazo: <strong>${selecionado.prazo} dias úteis</strong> &nbsp;·&nbsp;
            Pgto: <strong>${selecionado.pagamento || '—'}</strong>
          </div>
        </div>`
      : `<div class="decisao-box decisao-pending">
          <div class="decisao-title">⏳ Aguardando Seleção</div>
          <div class="decisao-sub">O requisitante deve avaliar as propostas e indicar o fornecedor preferido ao comprador responsável.</div>
          <table class="assinatura-table">
            <tr>
              <td><div class="assinatura-linha"></div><div class="assinatura-label">Requisitante: ${solicitante}</div></td>
              <td><div class="assinatura-linha"></div><div class="assinatura-label">Comprador: ${compradorResp}</div></td>
              <td><div class="assinatura-linha"></div><div class="assinatura-label">Aprovação / Data</div></td>
            </tr>
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
