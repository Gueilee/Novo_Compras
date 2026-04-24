/* ══════════════════════════════════════════════════════════════
   PEDIDO DE COMPRAS — gerador de PDF via janela de impressão
   Uso: POCompra.gerar(idRequisicao)
══════════════════════════════════════════════════════════════ */
window.POCompra = {

  async gerar(idRequisicao) {
    const btn = event?.currentTarget;
    if (btn) { btn.disabled = true; btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Gerando PO...`; }

    try {
      const d = await Api.get(`/api/requisicoes/${idRequisicao}/detalhes-completos`);
      const fornSel = (d.cotacoes || []).find(c => c.selecionado);

      if (!fornSel) {
        Toast.warning('Sem fornecedor selecionado', 'Selecione um fornecedor antes de gerar a PO.');
        return;
      }

      const html = this._buildHtml(d, fornSel);
      const win = window.open('', '_blank', 'width=860,height=750,scrollbars=yes');
      win.document.write(html);
      win.document.close();
      win.focus();
      win.onload = () => setTimeout(() => win.print(), 500);
    } catch (e) {
      Toast.error('Erro ao gerar PO', e.message || 'Tente novamente.');
    } finally {
      if (btn) { btn.disabled = false; btn.innerHTML = `<i class="fa-solid fa-file-invoice"></i> Gerar PO`; }
    }
  },

  _fmt(val) {
    if (val == null || val === '') return '—';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  },

  _fmtCnpj(cnpj) {
    if (!cnpj) return '—';
    const c = cnpj.replace(/\D/g, '');
    if (c.length !== 14) return cnpj;
    return `${c.slice(0,2)}.${c.slice(2,5)}.${c.slice(5,8)}/${c.slice(8,12)}-${c.slice(12)}`;
  },

  _poNumber(id) {
    const year = new Date().getFullYear();
    return `PC-${year}-${String(id).padStart(5,'0')}`;
  },

  _buildHtml(d, forn) {
    const hoje = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
    const hojeHora = new Date().toLocaleString('pt-BR');
    const poNum = this._poNumber(d.id);
    const solicitante = d.solicitante || d.comprador || '—';
    const compradorResp = d.comprador_responsavel || solicitante;

    const qtdTotal = (d.itens || []).reduce((s, i) => s + (i.quantidade || 0), 0);
    const valorTotal = forn.preco_unitario || 0; // preco_unitario agora é o total da proposta

    // Usa preços por item se disponíveis, senão distribui o total igualmente
    const itensPrecos = forn.itens_precos || [];
    const itensRows = (d.itens || []).map((it, i) => {
      // Tenta casar pelo índice ou descrição
      const ip = itensPrecos[i] || itensPrecos.find(p => p.descricao === it.descricao);
      const precUnit = ip ? ip.preco_unitario : 0;
      const subtotal = (it.quantidade || 0) * precUnit;
      return `
        <tr>
          <td class="td-center" style="color:#64748b;">${i + 1}</td>
          <td><strong>${it.descricao}</strong>${it.segmento ? `<br><span class="item-cat">${it.segmento}</span>` : ''}</td>
          <td class="td-center">${it.quantidade}</td>
          <td class="td-right">${precUnit > 0 ? this._fmt(precUnit) : '—'}</td>
          <td class="td-right"><strong>${subtotal > 0 ? this._fmt(subtotal) : '—'}</strong></td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Pedido de Compras ${poNum}</title>
<style>
  @page {
    size: A4 portrait;
    margin: 14mm 12mm 16mm 12mm;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
    font-size: 9.5pt;
    color: #1e293b;
    background: #fff;
    line-height: 1.5;
  }

  /* ── Barra de ação (ocultada ao imprimir) ─────────────── */
  .no-print {
    background: #f1f5f9;
    border-bottom: 2px solid #422c76;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .print-btn {
    background: #422c76;
    color: #fff;
    border: none;
    border-radius: 7px;
    padding: 9px 20px;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .print-btn:hover { background: #5b3fa8; }

  /* ── Wrapper ──────────────────────────────────────────── */
  .page { padding: 2mm 0; }

  /* ── Cabeçalho ────────────────────────────────────────── */
  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0;
  }
  .header-left { display: flex; align-items: center; gap: 10px; }
  .brand-logo { height: 40px; object-fit: contain; }
  .brand-name { font-size: 20pt; font-weight: 800; color: #422c76; letter-spacing: -0.5px; line-height: 1; }
  .brand-sub { font-size: 7.5pt; color: #94a3b8; margin-top: 2px; }
  .header-right { text-align: right; }
  .doc-type {
    font-size: 20pt;
    font-weight: 900;
    color: #422c76;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    line-height: 1;
  }
  .doc-po-num {
    font-size: 13pt;
    font-weight: 800;
    color: #ff2f69;
    margin-top: 4px;
  }
  .doc-date { font-size: 8pt; color: #94a3b8; margin-top: 3px; }

  .header-divider {
    border: none;
    border-top: 3px solid #422c76;
    margin: 10px 0;
  }
  .header-stripe {
    height: 4px;
    background: linear-gradient(90deg, #422c76 0%, #ff2f69 60%, #fbbf24 100%);
    border-radius: 2px;
    margin-bottom: 14px;
  }

  /* ── Bloco Fornecedor / Comprador ─────────────────────── */
  .parties {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 14px;
  }
  .party-box {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }
  .party-header {
    padding: 6px 12px;
    font-size: 7.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: #fff;
  }
  .party-header.para { background: #422c76; }
  .party-header.de   { background: #334155; }
  .party-body { padding: 10px 12px; }
  .party-name { font-size: 11pt; font-weight: 800; color: #1e293b; margin-bottom: 3px; }
  .party-detail { font-size: 8.5pt; color: #64748b; line-height: 1.6; }
  .party-detail strong { color: #1e293b; }

  /* ── Info row ─────────────────────────────────────────── */
  .info-row {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-bottom: 14px;
  }
  .info-box {
    background: #f8f6ff;
    border: 1px solid #ede9fe;
    border-radius: 7px;
    padding: 7px 10px;
  }
  .info-lbl {
    font-size: 6.5pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .07em;
    color: #94a3b8;
    margin-bottom: 2px;
  }
  .info-val {
    font-size: 9pt;
    font-weight: 700;
    color: #1e293b;
  }
  .info-val.accent { color: #422c76; }

  /* ── Seção título ─────────────────────────────────────── */
  .section-label {
    font-size: 8pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .09em;
    color: #422c76;
    margin-bottom: 7px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .section-label::after {
    content: '';
    flex: 1;
    height: 1.5px;
    background: #ede9fe;
  }

  /* ── Tabela de itens ──────────────────────────────────── */
  .items-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 6px;
    font-size: 8.5pt;
  }
  .items-table thead tr {
    background: #422c76;
    color: #fff;
  }
  .items-table th {
    padding: 7px 10px;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 7pt;
    letter-spacing: .05em;
    text-align: left;
  }
  .items-table td {
    padding: 7px 10px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }
  .items-table tr:nth-child(even) td { background: #f8f6ff; }
  .item-cat { font-size: 7.5pt; color: #94a3b8; }
  .td-center { text-align: center; }
  .td-right  { text-align: right; }

  /* Totais */
  .totals-row td {
    padding: 8px 10px;
    background: #f1f5f9;
    border-top: 2px solid #422c76;
    border-bottom: none;
    font-weight: 700;
  }
  .grand-total {
    font-size: 13pt;
    font-weight: 900;
    color: #422c76;
  }

  /* ── Caixa de condições resumidas ─────────────────────── */
  .conditions-summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin: 12px 0 14px;
  }
  .cond-box {
    border: 1px solid #e2e8f0;
    border-radius: 7px;
    padding: 8px 10px;
    text-align: center;
  }
  .cond-lbl { font-size: 7pt; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: #94a3b8; margin-bottom: 3px; }
  .cond-val { font-size: 10pt; font-weight: 800; color: #422c76; }

  /* ── Observações da proposta ──────────────────────────── */
  .obs-box {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 7px;
    padding: 8px 12px;
    margin-bottom: 12px;
    font-size: 8.5pt;
    color: #78350f;
    line-height: 1.5;
  }
  .obs-box strong { font-size: 7pt; text-transform: uppercase; letter-spacing: .06em; color: #92400e; display: block; margin-bottom: 3px; }

  /* ── Caixa de instrução NF ────────────────────────────── */
  .nf-instruction {
    background: #f0f9ff;
    border: 1px solid #bae6fd;
    border-left: 4px solid #0284c7;
    border-radius: 0 7px 7px 0;
    padding: 10px 14px;
    margin-bottom: 14px;
    font-size: 8.5pt;
    color: #0c4a6e;
    line-height: 1.6;
  }
  .nf-instruction strong { font-weight: 700; }

  /* ── Condições gerais ─────────────────────────────────── */
  .terms-section {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 14px;
    page-break-inside: avoid;
  }
  .terms-header {
    background: #422c76;
    color: #fff;
    padding: 8px 14px;
    font-size: 9pt;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: .07em;
  }
  .terms-body {
    padding: 12px 14px;
    font-size: 8pt;
    color: #334155;
    line-height: 1.65;
    column-count: 2;
    column-gap: 20px;
  }
  .terms-body h3 {
    font-size: 8pt;
    font-weight: 800;
    color: #422c76;
    margin: 8px 0 3px;
    text-transform: uppercase;
    letter-spacing: .05em;
    break-after: avoid;
    column-span: none;
  }
  .terms-body h3:first-child { margin-top: 0; }
  .terms-body ul {
    margin: 3px 0 8px 14px;
    padding: 0;
  }
  .terms-body li { margin-bottom: 2px; }
  .terms-body p { margin-bottom: 6px; }
  .terms-body .email-highlight {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    border-radius: 4px;
    padding: 2px 7px;
    font-size: 8pt;
    font-weight: 700;
    color: #1d4ed8;
    display: inline-block;
    margin: 1px 0;
  }

  /* ── Assinatura ───────────────────────────────────────── */
  .signature-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin: 14px 0 12px;
  }
  .sig-block { }
  .sig-line {
    border-bottom: 1.5px solid #334155;
    height: 32px;
    margin-bottom: 5px;
  }
  .sig-label { font-size: 8pt; color: #64748b; text-align: center; line-height: 1.4; }
  .sig-name { font-weight: 700; color: #1e293b; }

  /* ── Rodapé ───────────────────────────────────────────── */
  .footer {
    border-top: 2px solid #422c76;
    padding-top: 8px;
    margin-top: 10px;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    font-size: 7.5pt;
    color: #94a3b8;
  }
  .footer-brand { font-weight: 800; color: #422c76; font-size: 8.5pt; }
  .footer-right { text-align: right; line-height: 1.6; }

  /* ── Impressão ────────────────────────────────────────── */
  @media print {
    .no-print { display: none !important; }
    body { font-size: 9pt; }
    @page { margin: 12mm 10mm 14mm 10mm; }
    .terms-body { font-size: 7.5pt; }
  }
</style>
</head>
<body>

<!-- Barra de ação (não impressa) -->
<div class="no-print">
  <div style="font-size:13px;font-weight:700;color:#422c76;">
    📄 Pedido de Compras — ${poNum}
    <span style="font-weight:400;color:#64748b;font-size:12px;margin-left:10px;">Clique em Imprimir para salvar como PDF e enviar ao fornecedor</span>
  </div>
  <button class="print-btn" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>
</div>

<div class="page">

  <!-- ══ CABEÇALHO ══════════════════════════════════════════════ -->
  <div class="header">
    <div class="header-left">
      <img class="brand-logo" src="/img/logo.png" alt="Vendemmia"
           onerror="this.style.display='none';document.getElementById('brand-fb').style.display='block'">
      <div id="brand-fb" style="display:none;">
        <div class="brand-name">Vendemmia</div>
      </div>
      <div>
        <div class="brand-sub">Sistema de Compras — SHP</div>
        <div style="font-size:7.5pt;color:#94a3b8;">Vendemmia Logística S.A.</div>
      </div>
    </div>
    <div class="header-right">
      <div class="doc-type">Pedido de Compras</div>
      <div class="doc-po-num">${poNum}</div>
      <div class="doc-date">Emitido em ${hoje}</div>
    </div>
  </div>
  <hr class="header-divider">
  <div class="header-stripe"></div>

  <!-- ══ PARTES ═══════════════════════════════════════════════ -->
  <div class="parties">
    <div class="party-box">
      <div class="party-header para">📦 Fornecedor (PARA)</div>
      <div class="party-body">
        <div class="party-name">${forn.nome}</div>
        <div class="party-detail">
          <strong>CNPJ:</strong> ${this._fmtCnpj(forn.cnpj)}<br>
          ${forn.email ? `<strong>E-mail:</strong> ${forn.email}<br>` : ''}
          ${forn.telefone ? `<strong>Telefone:</strong> ${forn.telefone}` : ''}
        </div>
      </div>
    </div>
    <div class="party-box">
      <div class="party-header de">🏢 Compradora (DE)</div>
      <div class="party-body">
        <div class="party-name">Vendemmia Logística S.A.</div>
        <div class="party-detail">
          <strong>Unidade:</strong> ${d.unidade || '—'}${d.setor ? ` · ${d.setor}` : ''}<br>
          <strong>Solicitante:</strong> ${solicitante}<br>
          <strong>Comprador:</strong> ${compradorResp}
        </div>
      </div>
    </div>
  </div>

  <!-- ══ INFO ROW ══════════════════════════════════════════════ -->
  <div class="info-row">
    <div class="info-box">
      <div class="info-lbl">Nº do Pedido</div>
      <div class="info-val accent">${poNum}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Data de Emissão</div>
      <div class="info-val">${hoje}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Requisição Interna</div>
      <div class="info-val">#${d.id}</div>
    </div>
    <div class="info-box">
      <div class="info-lbl">Prazo de Entrega</div>
      <div class="info-val accent">${forn.prazo ?? '—'} dias úteis</div>
    </div>
  </div>

  <!-- ══ ITENS ═════════════════════════════════════════════════ -->
  <div class="section-label">📋 Itens do Pedido</div>
  <table class="items-table">
    <thead>
      <tr>
        <th style="width:28px;">#</th>
        <th>Descrição do Item / Serviço</th>
        <th style="width:70px;text-align:center;">Qtd.</th>
        <th style="width:110px;text-align:right;">Preço Unit.</th>
        <th style="width:110px;text-align:right;">Subtotal</th>
      </tr>
    </thead>
    <tbody>
      ${itensRows}
      <tr class="totals-row">
        <td colspan="2" style="font-size:9pt;color:#64748b;">
          ${(d.itens || []).length} item(ns) · ${qtdTotal} unidade(s) no total
        </td>
        <td class="td-center"><strong>${qtdTotal}</strong></td>
        <td class="td-right" style="color:#94a3b8;">—</td>
        <td class="td-right"><span class="grand-total">${this._fmt(valorTotal)}</span></td>
      </tr>
    </tbody>
  </table>

  <!-- ══ CONDIÇÕES RESUMIDAS ═══════════════════════════════════ -->
  <div class="conditions-summary">
    <div class="cond-box">
      <div class="cond-lbl">💳 Condição de Pagamento</div>
      <div class="cond-val" style="font-size:9pt;">${forn.pagamento || '30 DDL'}</div>
    </div>
    <div class="cond-box">
      <div class="cond-lbl">🚚 Frete</div>
      <div class="cond-val" style="font-size:9pt;">${forn.frete_incluso ? 'Incluso no preço' : 'A negociar'}</div>
    </div>
    <div class="cond-box">
      <div class="cond-lbl">📅 Validade da Proposta</div>
      <div class="cond-val" style="font-size:9pt;">${forn.validade_dias ?? 15} dias</div>
    </div>
  </div>

  ${forn.observacoes ? `
  <div class="obs-box">
    <strong>Observações do Fornecedor</strong>
    ${forn.observacoes}
  </div>` : ''}

  <!-- ══ INSTRUÇÃO DE ENVIO DE NF ══════════════════════════════ -->
  <div class="nf-instruction">
    <strong>⚠️ Instrução para Emissão da Nota Fiscal</strong><br>
    A nota fiscal deve conter obrigatoriamente o número do Pedido de Compras <strong>${poNum}</strong>.<br>
    Notas fiscais emitidas sem esse número poderão ter o processamento e pagamento atrasados.<br>
    Enviar <strong>PDF + XML da NF-e</strong> para:
    <span class="email-highlight">notasfiscais@vendemmia.com.br</span>
    ou
    <span class="email-highlight">notasvdmlog@vendemmia.com.br</span>
    conforme CNPJ de destino (ver Condições Gerais abaixo).
  </div>

  <!-- ══ CONDIÇÕES GERAIS ══════════════════════════════════════ -->
  <div class="terms-section">
    <div class="terms-header">📑 Condições Gerais de Compras — Vendemmia</div>
    <div class="terms-body">

      <h3>1. Requisitos para Cotação</h3>
      <p>Toda proposta comercial deve conter:</p>
      <ul>
        <li>Dados cadastrais completos da empresa</li>
        <li>Código do produto e descrição completa</li>
        <li>NCM (Nomenclatura Comum do Mercosul)</li>
        <li>Quantidade, valor unitário e valor total</li>
        <li>Impostos incidentes, condição de pagamento e prazo de entrega</li>
      </ul>

      <h3>2. Condições de Pagamento</h3>
      <p>O prazo mínimo aceito pela Vendemmia é de <strong>30 dias</strong> a contar da data de emissão da nota fiscal.</p>

      <h3>3. Aprovação e Emissão do Pedido</h3>
      <p>Após aprovação da proposta, o fornecedor receberá por e-mail o Pedido de Compras (PC) formalizado. A nota fiscal emitida deve conter obrigatoriamente o número do Pedido de Compras para correto lançamento no sistema.</p>

      <h3>4. Envio de Documentos Fiscais</h3>
      <p>Enviar obrigatoriamente:</p>
      <ul>
        <li>PDF da nota fiscal</li>
        <li>Arquivo XML da nota fiscal</li>
        <li>Boleto bancário ou dados bancários para pagamento</li>
      </ul>

      <h3>5. Endereço de Envio de Notas Fiscais</h3>
      <p>Para CNPJs com final <strong>0001-46, 0002-27, 0003-08, 0004-99, 0005-70, 0006-50, 0009-01</strong>:<br>
      <span class="email-highlight">notasfiscais@vendemmia.com.br</span></p>
      <p>Para CNPJs com final <strong>0007-31, 0008-12, 0010-37</strong>:<br>
      <span class="email-highlight">notasvdmlog@vendemmia.com.br</span></p>

      <h3>6. Dúvidas sobre Pagamentos</h3>
      <p>Em caso de dúvidas ou não identificação de pagamento, entre em contato com o setor financeiro:<br>
      <span class="email-highlight">financeiro2@vendemmia.com.br</span></p>

      <p style="margin-top:8px;font-style:italic;color:#64748b;">
        Atenciosamente,<br>
        <strong style="color:#422c76;">Equipe Vendemmia — Departamento de Compras</strong>
      </p>

    </div>
  </div>

  <!-- ══ ASSINATURA ════════════════════════════════════════════ -->
  <div class="signature-section">
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">
        <div class="sig-name">Comprador Responsável</div>
        ${compradorResp} — Vendemmia
      </div>
    </div>
    <div class="sig-block">
      <div class="sig-line"></div>
      <div class="sig-label">
        <div class="sig-name">Confirmação do Fornecedor</div>
        ${forn.nome} — Data: _____ / _____ / _______
      </div>
    </div>
  </div>

  <!-- ══ RODAPÉ ════════════════════════════════════════════════ -->
  <div class="footer">
    <div>
      <div class="footer-brand">Vendemmia — Sistema de Compras (SHP)</div>
      <div>Documento gerado automaticamente em ${hojeHora}</div>
      <div>Este documento constitui Pedido de Compras formal da Vendemmia Logística S.A.</div>
    </div>
    <div class="footer-right">
      <div><strong>${poNum}</strong> · Req. #${d.id}</div>
      <div>Fornecedor: ${forn.nome}</div>
      <div>Valor Total: <strong>${this._fmt(valorTotal)}</strong></div>
    </div>
  </div>

</div><!-- /page -->
</body>
</html>`;
  }
};
