/* ═══════════════════════════════════════════════════════════
   SHP — SUPABASE CLIENT
   Substitui o backend FastAPI por chamadas diretas ao Supabase.
   Sobrescreve o objeto Api definido em utils.js.
   ═══════════════════════════════════════════════════════════ */

const _SB_URL = 'https://ayuypxbipvuayyiatbir.supabase.co';
const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dXlweGJpcHZ1YXl5aWF0YmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDg0MTQsImV4cCI6MjA5MjYyNDQxNH0.a_uCBEuB8oLX94d3n936HX6we9rLV_19hOfLfCpapmM';

const _sb = supabase.createClient(_SB_URL, _SB_KEY);

// ── Helpers ────────────────────────────────────────────────
const _now = () => new Date().toLocaleString('pt-BR');
const _normCnpj = c => (c || '').replace(/\D/g, '');
const _err = e => { throw new Error(e.message || e.msg || JSON.stringify(e)); };

// ── Storage público ────────────────────────────────────────
window.SbStorage = {
  async upload(bucket, filePath, file) {
    const { error } = await _sb.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (error) _err(error);
    return _sb.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  },
  url(bucket, filePath) {
    return _sb.storage.from(bucket).getPublicUrl(filePath).data.publicUrl;
  },
  async remove(bucket, filePath) {
    await _sb.storage.from(bucket).remove([filePath]);
  }
};

// ══════════════════════════════════════════════════════════
// ROTEADOR — mapeia paths FastAPI → queries Supabase
// ══════════════════════════════════════════════════════════
async function _route(method, path, body) {
  const full = `${method} ${path}`;

  // Dashboard
  if (full === 'GET /dashboard-dados') return _dashboardDados();

  // Formulário de Intake
  if (full === 'GET /api/opcoes-formulario') return _opcoesFormulario();

  // Criar requisição
  if (full === 'POST /requisicoes') return _criarRequisicao(body);

  // Aprovações
  if (full === 'GET /api/aprovacoes/pendentes') return _aprovacoesPendentes();
  const mAprov = path.match(/^\/api\/aprovacoes\/(\d+)$/);
  if (method === 'POST' && mAprov) return _aprovarRequisicao(+mAprov[1], body);

  // Sourcing
  if (full === 'GET /api/sourcing/pedidos-aprovados') return _pedidosAprovados();
  const mFornSeg = path.match(/^\/fornecedores\/(.+)$/);
  if (method === 'GET' && mFornSeg) return _fornecedoresPorSegmento(decodeURIComponent(mFornSeg[1]));
  const mReqSrc = path.match(/^\/api\/sourcing\/requisicao\/(\d+)$/);
  if (method === 'GET' && mReqSrc) return _requisicaoParaFornecedor(+mReqSrc[1]);
  if (full === 'POST /api/cotacao/enviar') return _salvarCotacao(body);
  const mSel = path.match(/^\/api\/sourcing\/selecionar\/(\d+)$/);
  if (method === 'POST' && mSel) return _selecionarFornecedor(+mSel[1], body);
  const mComp = path.match(/^\/api\/cotacao\/comparativo\/(\d+)$/);
  if (method === 'GET' && mComp) return _comparativoCotacoes(+mComp[1]);
  if (method === 'GET' && path.startsWith('/api/cotacao/historico')) return _historicoCotacoes(path);

  // Recebimento / Conciliação
  if (full === 'GET /api/recebimento/pendentes') return _recebimentoPendentes();
  const mDadosPO = path.match(/^\/api\/recebimento\/dados-po\/(\d+)$/);
  if (method === 'GET' && mDadosPO) return _dadosPO(+mDadosPO[1]);
  const mMatch = path.match(/^\/api\/recebimento\/match\/(\d+)$/);
  if (method === 'POST' && mMatch) return _realizarMatch(+mMatch[1], body);
  const mNfUp = path.match(/^\/api\/recebimento\/nf-uploads\/(\d+)$/);
  if (method === 'GET' && mNfUp) return _nfUploads(+mNfUp[1]);

  // Detalhes completos
  const mDet = path.match(/^\/api\/requisicoes\/(\d+)\/detalhes-completos$/);
  if (method === 'GET' && mDet) return _detalhesCompletos(+mDet[1]);

  // Arquivos
  const mArqList = path.match(/^\/api\/arquivos\/(\d+)$/);
  if (method === 'GET' && mArqList) return _arquivosRequisicao(+mArqList[1]);
  if (method === 'DELETE' && mArqList) return _deletarArquivo(+mArqList[1]);

  // Catálogo
  if (method === 'GET' && path.startsWith('/api/catalogo/fornecedores')) return _catalogoFornecedores(path);
  if (full === 'POST /api/catalogo/fornecedores') return _criarFornecedor(body);
  const mFornUp = path.match(/^\/api\/catalogo\/fornecedores\/(.+)$/);
  if (method === 'PUT'    && mFornUp) return _atualizarFornecedor(decodeURIComponent(mFornUp[1]), body);
  if (method === 'DELETE' && mFornUp) return _deletarFornecedor(decodeURIComponent(mFornUp[1]));

  // Contratos / Contas Fixas
  if (full === 'GET /api/contratos') return _listarContratos();
  if (full === 'POST /api/contratos') return _criarContrato(body);
  const mContLanc = path.match(/^\/api\/contratos\/(\d+)\/lancamento$/);
  if (method === 'POST' && mContLanc) return _adicionarLancamento(+mContLanc[1], body);
  const mContLancs = path.match(/^\/api\/contratos\/(\d+)\/lancamentos$/);
  if (method === 'GET' && mContLancs) return _lancamentosContrato(+mContLancs[1]);
  const mCont = path.match(/^\/api\/contratos\/(\d+)$/);
  if (method === 'PUT'    && mCont) return _atualizarContrato(+mCont[1], body);
  if (method === 'DELETE' && mCont) return _deletarContrato(+mCont[1]);

  // Orçamento
  const mOrc = path.match(/^\/api\/orcamento\/(.+)$/);
  if (method === 'GET' && mOrc) return _orcamentoUnidade(decodeURIComponent(mOrc[1]));
  if (full === 'POST /api/orcamento') return _salvarOrcamento(body);

  // Consulta
  if (method === 'GET' && path.startsWith('/api/consulta/requisicoes')) return _consultaRequisicoes(path);

  // Usuários
  if (full === 'POST /api/usuarios/solicitar-acesso') return _solicitarAcesso(body);
  if (full === 'GET /api/usuarios/pendentes-acesso')  return _usuariosPendentes();
  const mAtiv = path.match(/^\/api\/usuarios\/(\d+)\/ativar$/);
  if (method === 'POST' && mAtiv) return _ativarUsuario(+mAtiv[1]);

  // Config compradores
  if (full === 'GET /api/config/compradores') return _listarCompradores();
  if (full === 'POST /api/config/compradores') return _salvarComprador(body);
  const mCompDel = path.match(/^\/api\/config\/compradores\/(\d+)$/);
  if (method === 'DELETE' && mCompDel) return _deletarComprador(+mCompDel[1]);

  console.warn('[SHP] Rota não mapeada:', method, path);
  return {};
}

// ── Api global (sobrescreve utils.js) ─────────────────────
window.Api = {
  async get(path)         { return _route('GET',    path, null); },
  async post(path, body)  { return _route('POST',   path, body); },
  async patch(path, body) { return _route('PATCH',  path, body); },
  async put(path, body)   { return _route('PUT',    path, body); },
  async delete(path)      { return _route('DELETE', path, null); },
};

// ══════════════════════════════════════════════════════════
// IMPLEMENTAÇÕES
// ══════════════════════════════════════════════════════════

// ── Dashboard ─────────────────────────────────────────────
async function _dashboardDados() {
  const { data: reqs } = await _sb.from('requisicoes').select('status, valor_fechado, unidade, data_solicitacao');
  const total = reqs?.length || 0;
  const concluidas = reqs?.filter(r => r.status === 'Concluído') || [];
  const pendAprov  = reqs?.filter(r => r.status === 'Aguardando Aprovação').length || 0;
  const emCotacao  = reqs?.filter(r => ['Aguardando Cotação','Em Cotação'].includes(r.status)).length || 0;
  const valorTotal = concluidas.reduce((s, r) => s + (r.valor_fechado || 0), 0);
  const { data: orcs } = await _sb.from('orcamentos').select('unidade, orcamento_anual, consumido, ano').eq('ano', 2026);
  const { data: forn } = await _sb.from('fornecedores').select('cnpj', { count: 'exact', head: true });
  const porStatus = {};
  reqs?.forEach(r => { porStatus[r.status] = (porStatus[r.status] || 0) + 1; });
  const porUnidade = {};
  reqs?.forEach(r => { if (r.unidade) porUnidade[r.unidade] = (porUnidade[r.unidade] || 0) + 1; });
  return {
    total_requisicoes: total, pendente_aprovacao: pendAprov, em_cotacao: emCotacao,
    concluidas: concluidas.length, valor_total_fechado: valorTotal,
    total_fornecedores: forn?.count || 0,
    por_status: Object.entries(porStatus).map(([status, count]) => ({ status, count })),
    por_unidade: Object.entries(porUnidade).map(([unidade, count]) => ({ unidade, count })),
    orcamentos: orcs || [],
    ultimas: (reqs || []).slice(-10).reverse()
  };
}

// ── Opções Formulário ──────────────────────────────────────
async function _opcoesFormulario() {
  const [{ data: comps }, { data: cats }, { data: orcs }] = await Promise.all([
    _sb.from('compradores_responsabilidade').select('*').eq('ativo', 1),
    _sb.from('categorias').select('*'),
    _sb.from('orcamentos').select('unidade').eq('ano', 2026)
  ]);
  const unidades = [...new Set((orcs || []).map(o => o.unidade))];
  const compradores = [...new Set((comps || []).map(c => c.comprador))];
  const categorias = (cats || []).map(c => c.segmento);
  const macros = {};
  (cats || []).forEach(c => {
    if (!macros[c.macro_categoria]) macros[c.macro_categoria] = [];
    macros[c.macro_categoria].push(c.segmento);
  });
  return { unidades, compradores, categorias, macros };
}

// ── Criar Requisição ───────────────────────────────────────
async function _criarRequisicao(body) {
  const { data: req, error } = await _sb.from('requisicoes').insert({
    unidade: body.unidade, setor: body.setor, comprador: body.comprador,
    observacoes: body.observacoes, justificativa: body.justificativa,
    status: 'Aguardando Aprovação',
    data_solicitacao: new Date().toLocaleDateString('pt-BR')
  }).select().single();
  if (error) _err(error);
  if (body.itens?.length) {
    const itens = body.itens.map(i => ({
      id_requisicao: req.id_sharepoint, descricao: i.descricao,
      quantidade: i.quantidade, segmento_historico: i.segmento
    }));
    const { error: eItens } = await _sb.from('itens_requisicao').insert(itens);
    if (eItens) _err(eItens);
  }
  return { id: req.id_sharepoint, status: 'ok' };
}

// ── Aprovações ─────────────────────────────────────────────
async function _aprovacoesPendentes() {
  const { data, error } = await _sb.from('requisicoes')
    .select('*, itens_requisicao(*)')
    .eq('status', 'Aguardando Aprovação')
    .order('id_sharepoint', { ascending: false });
  if (error) _err(error);
  const pedidos = (data || []).map(r => ({
    id_pedido: r.id_sharepoint, id_sharepoint: r.id_sharepoint,
    unidade: r.unidade, setor: r.setor, comprador: r.comprador,
    data: r.data_solicitacao, status: r.status,
    justificativa: r.justificativa, observacoes: r.observacoes,
    itens: r.itens_requisicao || []
  }));
  return { pedidos };
}

async function _aprovarRequisicao(id, body) {
  const novoStatus = body.acao === 'aprovar' ? 'Aguardando Cotação' : 'Reprovado';
  const upd = { status: novoStatus };
  if (body.justificativa) upd.observacoes = body.justificativa;
  const { error } = await _sb.from('requisicoes').update(upd).eq('id_sharepoint', id);
  if (error) _err(error);
  return { status: 'ok' };
}

// ── Sourcing ───────────────────────────────────────────────
async function _pedidosAprovados() {
  const { data, error } = await _sb.from('requisicoes')
    .select('id_sharepoint, comprador, unidade, data_solicitacao, status, itens_requisicao(segmento_historico)')
    .in('status', ['Aguardando Cotação', 'Em Cotação'])
    .order('id_sharepoint', { ascending: false });
  if (error) _err(error);
  return (data || []).map(r => ({
    id: r.id_sharepoint, solicitante: r.comprador, unidade: r.unidade,
    data: r.data_solicitacao, status: r.status,
    segmento: r.itens_requisicao?.[0]?.segmento_historico || ''
  }));
}

async function _fornecedoresPorSegmento(segmento) {
  const { data: cats } = await _sb.from('categorias').select('id').ilike('segmento', `%${segmento}%`);
  const catIds = (cats || []).map(c => c.id);
  let fornecedores = [];
  if (catIds.length) {
    const { data: fs } = await _sb.from('fornecedores_segmentos')
      .select('cnpj_fornecedor, fornecedores(*)')
      .in('id_categoria', catIds);
    fornecedores = (fs || []).map(f => f.fornecedores).filter(Boolean);
  }
  const { data: hist } = await _sb.from('requisicoes')
    .select('data_solicitacao, valor_fechado, fornecedor, itens_requisicao(descricao, quantidade)')
    .eq('status', 'Concluído').limit(5);
  return { fornecedores, historico_precos: (hist || []).map(h => ({
    data: h.data_solicitacao, item: h.itens_requisicao?.[0]?.descricao || '',
    qtd: h.itens_requisicao?.[0]?.quantidade || 0, valor: h.valor_fechado, fornecedor: h.fornecedor
  })), total_fornecedores: fornecedores.length };
}

async function _requisicaoParaFornecedor(id) {
  const { data: req, error } = await _sb.from('requisicoes')
    .select('*, itens_requisicao(*)')
    .eq('id_sharepoint', id).single();
  if (error) _err(error);
  return { id: req.id_sharepoint, unidade: req.unidade, comprador: req.comprador,
    status: req.status, justificativa: req.justificativa, observacoes: req.observacoes,
    itens: req.itens_requisicao || [] };
}

async function _salvarCotacao(body) {
  const cnpjN = _normCnpj(body.cnpj_fornecedor);
  // Verifica se já existe (upsert por CNPJ normalizado + requisição)
  const { data: existing } = await _sb.from('lances_fornecedor')
    .select('id').eq('id_requisicao', body.id_requisicao).eq('cnpj_fornecedor', cnpjN).maybeSingle();
  let lanceId;
  if (existing) {
    await _sb.from('lances_fornecedor').update({
      preco_unitario: body.preco_unitario, prazo_entrega_dias: body.prazo_entrega,
      pagamento: body.pagamento, validade_dias: body.validade_dias,
      observacoes: body.observacoes, frete_incluso: body.frete_incluso,
      imposto_incluso: body.imposto_incluso, data_resposta: _now()
    }).eq('id', existing.id);
    lanceId = existing.id;
  } else {
    const { data: novo, error } = await _sb.from('lances_fornecedor').insert({
      id_requisicao: body.id_requisicao, cnpj_fornecedor: cnpjN,
      preco_unitario: body.preco_unitario, prazo_entrega_dias: body.prazo_entrega,
      pagamento: body.pagamento, validade_dias: body.validade_dias,
      observacoes: body.observacoes, frete_incluso: body.frete_incluso,
      imposto_incluso: body.imposto_incluso, data_resposta: _now()
    }).select().single();
    if (error) _err(error);
    lanceId = novo.id;
    // Avança status se ainda em 'Aguardando Cotação'
    await _sb.from('requisicoes').update({ status: 'Em Cotação' })
      .eq('id_sharepoint', body.id_requisicao).eq('status', 'Aguardando Cotação');
  }
  // Salva itens se vieram
  if (body.itens?.length) {
    await _sb.from('lances_fornecedor_itens').delete().eq('id_lance', lanceId);
    await _sb.from('lances_fornecedor_itens').insert(
      body.itens.map(i => ({ id_lance: lanceId, id_requisicao: body.id_requisicao,
        descricao: i.descricao, quantidade: i.quantidade, preco_unitario: i.preco_unitario }))
    );
  }
  return { status: 'ok' };
}

async function _selecionarFornecedor(id, body) {
  const cnpjN = _normCnpj(body.cnpj_fornecedor);
  await _sb.from('lances_fornecedor').update({ selecionado: 0 }).eq('id_requisicao', id);
  await _sb.from('lances_fornecedor').update({ selecionado: 1 })
    .eq('id_requisicao', id).eq('cnpj_fornecedor', cnpjN);
  const { data: lance } = await _sb.from('lances_fornecedor')
    .select('preco_unitario, fornecedores(razao_social)')
    .eq('id_requisicao', id).eq('cnpj_fornecedor', cnpjN).maybeSingle();
  const nomeForn = lance?.fornecedores?.razao_social || cnpjN;
  await _sb.from('requisicoes').update({
    status: 'Aguardando Conciliação', fornecedor: nomeForn,
    valor_fechado: lance?.preco_unitario || 0
  }).eq('id_sharepoint', id);
  return { status: 'ok', fornecedor: nomeForn };
}

async function _comparativoCotacoes(id) {
  const { data: lances, error } = await _sb.from('lances_fornecedor')
    .select('*, fornecedores(razao_social, email, telefone)')
    .eq('id_requisicao', id)
    .order('selecionado', { ascending: false })
    .order('preco_unitario', { ascending: true });
  if (error) _err(error);
  const seen = new Set();
  const result = [];
  for (const l of (lances || [])) {
    if (seen.has(l.cnpj_fornecedor)) continue;
    seen.add(l.cnpj_fornecedor);
    const { data: itens } = await _sb.from('lances_fornecedor_itens').select('*').eq('id_lance', l.id);
    result.push({
      fornecedor: l.fornecedores?.razao_social || l.cnpj_fornecedor,
      preco: l.preco_unitario, prazo: l.prazo_entrega_dias, data: l.data_resposta,
      cnpj: l.cnpj_fornecedor, pagamento: l.pagamento || '30 DDL',
      validade_dias: l.validade_dias || 15, observacoes: l.observacoes,
      frete_incluso: l.frete_incluso, imposto_incluso: l.imposto_incluso,
      selecionado: !!l.selecionado, email: l.fornecedores?.email, telefone: l.fornecedores?.telefone,
      itens_precos: itens || []
    });
  }
  return result;
}

async function _historicoCotacoes(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const cnpj = _normCnpj(params.get('cnpj') || '');
  if (!cnpj) return [];
  const { data } = await _sb.from('lances_fornecedor')
    .select('id_requisicao, preco_unitario, data_resposta, requisicoes(unidade, status)')
    .eq('cnpj_fornecedor', cnpj).order('id', { ascending: false }).limit(10);
  return (data || []).map(l => ({
    id_requisicao: l.id_requisicao, preco: l.preco_unitario, data: l.data_resposta,
    unidade: l.requisicoes?.unidade, status: l.requisicoes?.status
  }));
}

// ── Recebimento / Conciliação ──────────────────────────────
async function _recebimentoPendentes() {
  const { data, error } = await _sb.from('requisicoes')
    .select('id_sharepoint, fornecedor, status')
    .eq('status', 'Aguardando Conciliação').order('id_sharepoint', { ascending: false }).limit(50);
  if (error) _err(error);
  const seen = new Set();
  return (data || []).filter(r => { if (seen.has(r.id_sharepoint)) return false; seen.add(r.id_sharepoint); return true; })
    .map(r => ({ id_pedido: r.id_sharepoint, fornecedor: r.fornecedor || r.id_sharepoint }));
}

async function _dadosPO(id) {
  const [{ data: itens }, { data: lance }] = await Promise.all([
    _sb.from('itens_requisicao').select('quantidade').eq('id_requisicao', id),
    _sb.from('lances_fornecedor').select('preco_unitario').eq('id_requisicao', id).eq('selecionado', 1).maybeSingle()
  ]);
  const qtd = (itens || []).reduce((s, i) => s + (i.quantidade || 0), 0);
  const preco = lance?.preco_unitario || 0;
  return { qtd_esperada: qtd, valor_esperado: preco, preco_unitario: preco };
}

async function _realizarMatch(id, body) {
  const po = await _dadosPO(id);
  const divergencias = [];
  const qtdEsp = Math.round(po.qtd_esperada * 1000) / 1000;
  const qtdRec = Math.round(body.qtd_recebida * 1000) / 1000;
  if (Math.abs(qtdRec - qtdEsp) > 0.001)
    divergencias.push(`Quantidade divergente: recebido ${qtdRec} vs esperado ${qtdEsp}`);
  if (po.valor_esperado > 0 && Math.abs(body.valor_nf - po.valor_esperado) > 0.01)
    divergencias.push(`Valor divergente: NF R$ ${body.valor_nf.toFixed(2)} vs PO R$ ${po.valor_esperado.toFixed(2)}`);
  const aprovado = divergencias.length === 0;
  if (aprovado) {
    await _sb.from('requisicoes').update({ status: 'Concluído', valor_fechado: body.valor_nf }).eq('id_sharepoint', id);
  }
  return {
    status: aprovado ? 'APROVADO' : 'BLOQUEADO',
    mensagem: aprovado ? 'Todos os dados conferem. Pagamento liberado.' : 'Divergências encontradas. Pagamento bloqueado.',
    detalhes: aprovado ? [`Quantidade OK: ${qtdRec} un.`, `Valor OK: R$ ${body.valor_nf.toFixed(2)}`] : divergencias
  };
}

async function _nfUploads(id) {
  const { data } = await _sb.from('nf_uploads').select('*').eq('id_pedido', id).order('enviado_em', { ascending: false });
  return (data || []).map(u => ({ ...u, tipo: u.tipo || 'PDF', tamanho_kb: u.tamanho_kb || 0 }));
}

// ── Detalhes Completos ─────────────────────────────────────
async function _detalhesCompletos(id) {
  const [{ data: req }, { data: itens }, { data: lances }, { data: arqs }] = await Promise.all([
    _sb.from('requisicoes').select('*').eq('id_sharepoint', id).single(),
    _sb.from('itens_requisicao').select('*').eq('id_requisicao', id),
    _sb.from('lances_fornecedor').select('*, fornecedores(razao_social,email,telefone)')
       .eq('id_requisicao', id).order('selecionado', { ascending: false }),
    _sb.from('arquivos_requisicao').select('*').eq('id_requisicao', id).order('enviado_em')
  ]);
  if (!req) throw new Error('Requisição não encontrada');
  const seen = new Set();
  const cotacoes = [];
  for (const l of (lances || [])) {
    if (seen.has(l.cnpj_fornecedor)) continue;
    seen.add(l.cnpj_fornecedor);
    const { data: litens } = await _sb.from('lances_fornecedor_itens').select('*').eq('id_lance', l.id);
    cotacoes.push({
      cnpj: l.cnpj_fornecedor, nome: l.fornecedores?.razao_social || l.cnpj_fornecedor,
      preco_unitario: l.preco_unitario, prazo: l.prazo_entrega_dias, pagamento: l.pagamento,
      data: l.data_resposta, selecionado: !!l.selecionado, observacoes: l.observacoes,
      frete_incluso: !!l.frete_incluso, imposto_incluso: !!l.imposto_incluso,
      arquivo_nome: l.arquivo_nome, arquivo_path: l.arquivo_path, validade_dias: l.validade_dias,
      itens_precos: litens || []
    });
  }
  return {
    id: req.id_sharepoint, unidade: req.unidade, solicitante: req.comprador, comprador: req.comprador,
    setor: req.setor, data: req.data_solicitacao, status: req.status,
    justificativa: req.justificativa, fornecedor: req.fornecedor, valor_fechado: req.valor_fechado,
    observacoes: req.observacoes, comprador_responsavel: req.comprador,
    itens: itens || [], cotacoes, arquivos: arqs || [],
    total_itens: (itens || []).reduce((s, i) => s + (i.quantidade || 0), 0),
    total_cotacoes: cotacoes.length,
    melhor_preco: cotacoes.length ? Math.min(...cotacoes.map(c => c.preco_unitario || Infinity)) : null
  };
}

// ── Arquivos ───────────────────────────────────────────────
async function _arquivosRequisicao(id) {
  const { data } = await _sb.from('arquivos_requisicao').select('*').eq('id_requisicao', id).order('enviado_em');
  return data || [];
}

async function _deletarArquivo(id) {
  const { data: arq } = await _sb.from('arquivos_requisicao').select('caminho').eq('id', id).single();
  if (arq?.caminho) {
    const path = arq.caminho.replace(/^.*\/object\/public\/(uploads|nf-uploads)\//, '');
    const bucket = arq.caminho.includes('nf-uploads') ? 'nf-uploads' : 'uploads';
    await SbStorage.remove(bucket, path).catch(() => {});
  }
  await _sb.from('arquivos_requisicao').delete().eq('id', id);
  return { status: 'ok' };
}

// ── Catálogo ───────────────────────────────────────────────
async function _catalogoFornecedores(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const q = params.get('q') || '';
  let query = _sb.from('fornecedores').select('*, fornecedores_segmentos(categorias(macro_categoria, segmento))');
  if (q) query = query.or(`razao_social.ilike.%${q}%,cnpj.ilike.%${q}%`);
  const { data, error } = await query.order('razao_social').limit(100);
  if (error) _err(error);
  return { fornecedores: data || [], total: data?.length || 0 };
}

async function _criarFornecedor(body) {
  const cnpjN = _normCnpj(body.cnpj);
  const { error } = await _sb.from('fornecedores').insert({
    cnpj: cnpjN, razao_social: body.razao_social,
    email: body.email, telefone: body.telefone, vendedor: body.vendedor
  });
  if (error) _err(error);
  if (body.categorias?.length) {
    const rows = body.categorias.map(id => ({ cnpj_fornecedor: cnpjN, id_categoria: id }));
    await _sb.from('fornecedores_segmentos').insert(rows).onConflict('cnpj_fornecedor,id_categoria').ignore();
  }
  return { status: 'ok' };
}

async function _atualizarFornecedor(cnpj, body) {
  const cnpjN = _normCnpj(cnpj);
  await _sb.from('fornecedores').update({
    razao_social: body.razao_social, email: body.email,
    telefone: body.telefone, vendedor: body.vendedor
  }).eq('cnpj', cnpjN);
  if (body.categorias !== undefined) {
    await _sb.from('fornecedores_segmentos').delete().eq('cnpj_fornecedor', cnpjN);
    if (body.categorias?.length)
      await _sb.from('fornecedores_segmentos').insert(body.categorias.map(id => ({ cnpj_fornecedor: cnpjN, id_categoria: id })));
  }
  return { status: 'ok' };
}

async function _deletarFornecedor(cnpj) {
  await _sb.from('fornecedores').delete().eq('cnpj', _normCnpj(cnpj));
  return { status: 'ok' };
}

// ── Contratos / Contas Fixas ───────────────────────────────
async function _listarContratos() {
  const { data, error } = await _sb.from('contas_fixas')
    .select('*, lancamentos_cf(*)')
    .order('criado_em', { ascending: false });
  if (error) _err(error);
  return data || [];
}

async function _criarContrato(body) {
  const { data, error } = await _sb.from('contas_fixas').insert({
    nome: body.nome, fornecedor: body.fornecedor, categoria: body.categoria,
    unidade: body.unidade, valor_anual: body.valor_anual, valor_mensal: body.valor_mensal,
    data_inicio: body.data_inicio, data_fim: body.data_fim,
    status: body.status || 'ativo', descricao: body.descricao
  }).select().single();
  if (error) _err(error);
  return data;
}

async function _atualizarContrato(id, body) {
  const { error } = await _sb.from('contas_fixas').update(body).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

async function _deletarContrato(id) {
  await _sb.from('contas_fixas').delete().eq('id', id);
  return { status: 'ok' };
}

async function _adicionarLancamento(id_conta, body) {
  const { data: lancamento, error } = await _sb.from('lancamentos_cf').insert({
    id_conta, mes: body.mes, ano: body.ano, valor: body.valor,
    tipo_doc: body.tipo_doc || 'NF', numero_doc: body.numero_doc,
    arquivo_path: body.arquivo_path, arquivo_nome: body.arquivo_nome, obs: body.obs
  }).select().single();
  if (error) _err(error);
  // Atualiza consumido no orçamento da unidade
  const { data: cf } = await _sb.from('contas_fixas').select('unidade').eq('id', id_conta).single();
  if (cf?.unidade) {
    const { data: orc } = await _sb.from('orcamentos').select('consumido').eq('unidade', cf.unidade).eq('ano', body.ano || 2026).maybeSingle();
    if (orc) await _sb.from('orcamentos').update({ consumido: (orc.consumido || 0) + body.valor }).eq('unidade', cf.unidade).eq('ano', body.ano || 2026);
  }
  return lancamento;
}

async function _lancamentosContrato(id) {
  const { data } = await _sb.from('lancamentos_cf').select('*').eq('id_conta', id).order('ano').order('mes');
  return data || [];
}

// ── Orçamento ──────────────────────────────────────────────
async function _orcamentoUnidade(unidade) {
  const { data } = await _sb.from('orcamentos').select('*').eq('unidade', unidade).eq('ano', 2026).maybeSingle();
  return data || { unidade, ano: 2026, orcamento_anual: 0, consumido: 0 };
}

async function _salvarOrcamento(body) {
  const { error } = await _sb.from('orcamentos').upsert({
    unidade: body.unidade, ano: body.ano || 2026,
    orcamento_anual: body.orcamento_anual, consumido: body.consumido || 0
  }, { onConflict: 'unidade,ano' });
  if (error) _err(error);
  return { status: 'ok' };
}

// ── Consulta ───────────────────────────────────────────────
async function _consultaRequisicoes(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const status = params.get('status');
  const unidade = params.get('unidade');
  const q = params.get('q');
  let query = _sb.from('requisicoes')
    .select('*, itens_requisicao(*), lances_fornecedor(*)')
    .order('id_sharepoint', { ascending: false }).limit(200);
  if (status && status !== 'todos') query = query.eq('status', status);
  if (unidade) query = query.eq('unidade', unidade);
  if (q) query = query.or(`comprador.ilike.%${q}%,fornecedor.ilike.%${q}%,unidade.ilike.%${q}%`);
  const { data, error } = await query;
  if (error) _err(error);
  return (data || []).map(r => ({
    id: r.id_sharepoint, id_pedido: r.id_sharepoint, id_sharepoint: r.id_sharepoint,
    unidade: r.unidade, setor: r.setor, comprador: r.comprador,
    data: r.data_solicitacao, status: r.status, fornecedor: r.fornecedor,
    valor_fechado: r.valor_fechado, justificativa: r.justificativa,
    itens: r.itens_requisicao || [], cotacoes: r.lances_fornecedor || []
  }));
}

// ── Usuários ───────────────────────────────────────────────
async function _solicitarAcesso(body) {
  await _sb.from('usuarios').upsert({
    nome: body.nome, email: body.email, unidade: body.unidade,
    cargo: body.cargo, ativo: 0, solicitacao_pendente: 1
  }, { onConflict: 'email', ignoreDuplicates: false });
  return { status: 'ok' };
}

async function _usuariosPendentes() {
  const { data } = await _sb.from('usuarios').select('*').eq('solicitacao_pendente', 1);
  return data || [];
}

async function _ativarUsuario(id) {
  await _sb.from('usuarios').update({ ativo: 1, solicitacao_pendente: 0 }).eq('id', id);
  return { status: 'ok' };
}

// ── Config Compradores ─────────────────────────────────────
async function _listarCompradores() {
  const { data } = await _sb.from('compradores_responsabilidade').select('*').order('comprador');
  return data || [];
}

async function _salvarComprador(body) {
  const { data, error } = await _sb.from('compradores_responsabilidade').insert({
    comprador: body.comprador, email: body.email, unidade: body.unidade,
    categoria: body.categoria, prioridade: body.prioridade || 1, ativo: 1
  }).select().single();
  if (error) _err(error);
  return data;
}

async function _deletarComprador(id) {
  await _sb.from('compradores_responsabilidade').delete().eq('id', id);
  return { status: 'ok' };
}

// ── Upload de arquivos de requisição (chamado dos módulos) ─
window.SbUploadArquivo = async function(idRequisicao, file, origem, enviadoPor) {
  const ts = Date.now();
  const filePath = `requisicoes/${idRequisicao}/${origem}_${ts}_${file.name}`;
  const publicUrl = await SbStorage.upload('uploads', filePath, file);
  await _sb.from('arquivos_requisicao').insert({
    id_requisicao: idRequisicao, origem, nome_arquivo: file.name,
    caminho: publicUrl, tamanho_kb: Math.round(file.size / 1024 * 10) / 10,
    tipo_mime: file.type, enviado_por: enviadoPor || origem
  });
  return publicUrl;
};

// ── Upload de NF para conciliação ─────────────────────────
window.SbUploadNF = async function(idPedido, numeroNf, file) {
  const ext = file.name.split('.').pop().toLowerCase();
  const ts = Date.now();
  const filePath = `nf/${idPedido}_${ts}.${ext}`;
  const publicUrl = await SbStorage.upload('nf-uploads', filePath, file);
  await _sb.from('nf_uploads').insert({
    id_pedido: idPedido, numero_nf: numeroNf, nome_arquivo: file.name,
    caminho: publicUrl, tamanho_kb: Math.round(file.size / 1024 * 10) / 10,
    tipo: ext.toUpperCase()
  });
  await _sb.from('arquivos_requisicao').insert({
    id_requisicao: idPedido, origem: 'comprador', nome_arquivo: file.name,
    caminho: publicUrl, tipo_mime: file.type,
    enviado_por: `Conciliação — NF ${numeroNf || ''}`
  });
  return publicUrl;
};

// ── Upload de documento de cotação ────────────────────────
window.SbUploadCotacaoDoc = async function(idRequisicao, cnpj, file) {
  const cnpjN = _normCnpj(cnpj);
  const ts = Date.now();
  const filePath = `cotacoes/${idRequisicao}_${cnpjN}_${ts}_${file.name}`;
  const publicUrl = await SbStorage.upload('uploads', filePath, file);
  // Atualiza o lance com o caminho do arquivo
  await _sb.from('lances_fornecedor').update({ arquivo_nome: file.name, arquivo_path: publicUrl })
    .eq('id_requisicao', idRequisicao).eq('cnpj_fornecedor', cnpjN);
  // Espelha em arquivos_requisicao
  await _sb.from('arquivos_requisicao').insert({
    id_requisicao: idRequisicao, origem: 'fornecedor', nome_arquivo: file.name,
    caminho: publicUrl, tamanho_kb: Math.round(file.size / 1024 * 10) / 10,
    tipo_mime: file.type, enviado_por: cnpjN
  });
  return publicUrl;
};
