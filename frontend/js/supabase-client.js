/* ═══════════════════════════════════════════════════════════
   SHP — SUPABASE CLIENT
   Substitui o backend FastAPI por chamadas diretas ao Supabase.
   Sobrescreve o objeto Api definido em utils.js.
   ═══════════════════════════════════════════════════════════ */

const _SB_URL = 'https://ayuypxbipvuayyiatbir.supabase.co';
const _SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dXlweGJpcHZ1YXl5aWF0YmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcwNDg0MTQsImV4cCI6MjA5MjYyNDQxNH0.a_uCBEuB8oLX94d3n936HX6we9rLV_19hOfLfCpapmM';

const _sb = supabase.createClient(_SB_URL, _SB_KEY);
window._SHP_SB_URL = _SB_URL;
window._SHP_SB_KEY = _SB_KEY;

// ── Helpers ────────────────────────────────────────────────
const _now = () => new Date().toLocaleString('pt-BR');
const _normCnpj = c => (c || '').replace(/\D/g, '');
const _fmtCnpj  = c => (c || '').replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
  const basePath = path.split('?')[0];
  const full = `${method} ${basePath}`;

  // Dashboard
  if (full === 'GET /dashboard-dados') return _dashboardDados(path);

  // Saving
  if (full === 'GET /api/saving/dashboard') return _savingDashboard(path);

  // Formulário de Intake
  if (full === 'GET /api/opcoes-formulario') return _opcoesFormulario();

  // Criar requisição
  if (full === 'POST /requisicoes') return _criarRequisicao(body);

  // Aprovações
  if (full === 'GET /api/aprovacoes/pendentes') return _aprovacoesPendentes();
  const mAprov = basePath.match(/^\/api\/aprovacoes\/(\d+)$/);
  if (method === 'POST' && mAprov) return _aprovarRequisicao(+mAprov[1], body);

  // Atribuição de comprador
  if (full === 'GET /api/atribuicao/pendentes') return _listarPendentesAtribuicao();
  const mAtrib = basePath.match(/^\/api\/atribuicao\/(\d+)$/);
  if (method === 'PATCH' && mAtrib) return _atribuirComprador(+mAtrib[1], body);

  // Sourcing
  if (full === 'GET /api/sourcing/segmentos') return _sourcingSegmentos();
  if (full === 'GET /api/sourcing/pedidos-aprovados') return _pedidosAprovados();
  const mFornSeg = basePath.match(/^\/fornecedores\/(.+)$/);
  if (method === 'GET' && mFornSeg) return _fornecedoresPorSegmento(decodeURIComponent(mFornSeg[1]));
  const mReqSrc = basePath.match(/^\/api\/sourcing\/requisicao\/(\d+)$/);
  if (method === 'GET' && mReqSrc) return _requisicaoParaFornecedor(+mReqSrc[1]);
  if (full === 'POST /api/cotacao/enviar') return _salvarCotacao(body);
  if (full === 'POST /api/cotacao/disparar-email') return _dispararEmailConvite(body);
  const mSel = basePath.match(/^\/api\/sourcing\/selecionar\/(\d+)$/);
  if (method === 'POST' && mSel) return _selecionarFornecedor(+mSel[1], body);
  const mDescComp = basePath.match(/^\/api\/sourcing\/desconto-comprador\/(\d+)$/);
  if (method === 'GET'  && mDescComp) return _getDescontoComprador(+mDescComp[1]);
  if (method === 'POST' && mDescComp) return _salvarDescontoComprador(+mDescComp[1], body);
  const mComp = basePath.match(/^\/api\/cotacao\/comparativo\/(\d+)$/);
  if (method === 'GET' && mComp) return _comparativoCotacoes(+mComp[1]);
  const mLanceUp = basePath.match(/^\/api\/cotacao\/lance\/(\d+)$/);
  if (method === 'PATCH' && mLanceUp) return _atualizarLance(+mLanceUp[1], body);
  if (method === 'GET' && path.startsWith('/api/cotacao/historico')) return _historicoCotacoes(path);
  const mEstoque = basePath.match(/^\/api\/sourcing\/verificar-estoque\/(\d+)$/);
  if (method === 'GET' && mEstoque) return _verificarEstoque(+mEstoque[1]);
  const mUsarEst = basePath.match(/^\/api\/sourcing\/usar-estoque\/(\d+)$/);
  if (method === 'POST' && mUsarEst) return _usarEstoque(+mUsarEst[1], body);

  // Entregas (Confirmação de Recebimento)
  if (full === 'GET /api/entregas/pendentes') return _entregasPendentes();
  const mEntConf = basePath.match(/^\/api\/entregas\/confirmar\/(\d+)$/);
  if (method === 'POST' && mEntConf) return _confirmarRecebimento(+mEntConf[1], body);

  // Recebimento / Conciliação
  if (full === 'GET /api/recebimento/pendentes') return _recebimentoPendentes();
  const mDadosPO = basePath.match(/^\/api\/recebimento\/dados-po\/(\d+)$/);
  if (method === 'GET' && mDadosPO) return _dadosPO(+mDadosPO[1]);
  const mMatch = basePath.match(/^\/api\/recebimento\/match\/(\d+)$/);
  if (method === 'POST' && mMatch) return _realizarMatch(+mMatch[1], body);
  const mNfUp = basePath.match(/^\/api\/recebimento\/nf-uploads\/(\d+)$/);
  if (method === 'GET' && mNfUp) return _nfUploads(+mNfUp[1]);

  // Requisições CRUD (order matters: specific paths before generic /:id)
  const mDet = basePath.match(/^\/api\/requisicoes\/(\d+)\/detalhes-completos$/);
  if (method === 'GET' && mDet) return _detalhesCompletos(+mDet[1]);
  if (full === 'GET /api/requisicoes/filtros')      return _filtrosRequisicoes();
  if (full === 'GET /api/requisicoes/por-unidade')  return _requisicoesPorUnidade();
  const mReqItens = basePath.match(/^\/api\/requisicoes\/(\d+)\/itens$/);
  if (method === 'PATCH' && mReqItens) return _atualizarItensRequisicao(+mReqItens[1], body);
  const mReqId = basePath.match(/^\/api\/requisicoes\/(\d+)$/);
  if (method === 'GET'    && mReqId) return _getRequisicao(+mReqId[1]);
  if (method === 'PATCH'  && mReqId) return _atualizarRequisicao(+mReqId[1], body);
  if (method === 'DELETE' && mReqId) return _deletarRequisicao(+mReqId[1]);
  if (method === 'GET' && path.startsWith('/api/requisicoes')) return _listarRequisicoes(path);

  // Arquivos
  const mArqList = basePath.match(/^\/api\/arquivos\/(\d+)$/);
  if (method === 'GET' && mArqList) return _arquivosRequisicao(+mArqList[1]);
  if (method === 'DELETE' && mArqList) return _deletarArquivo(+mArqList[1]);

  // Catálogo (specific before generic)
  if (full === 'GET /api/catalogo/stats') return _catalogoStats();
  if (method === 'GET' && path.startsWith('/api/catalogo/detalhe')) return _catalogoDetalhe(path);
  if (method === 'GET' && path.startsWith('/api/catalogo/fornecedores')) return _catalogoFornecedores(path);
  if (full === 'POST /api/catalogo/fornecedores') return _criarFornecedor(body);
  const mFornUp = basePath.match(/^\/api\/catalogo\/fornecedores\/(.+)$/);
  if (method === 'PUT'    && mFornUp) return _atualizarFornecedor(decodeURIComponent(mFornUp[1]), body);
  if (method === 'DELETE' && mFornUp) return _deletarFornecedor(decodeURIComponent(mFornUp[1]));
  if (full === 'GET /api/catalogo-itens') return _catalogoItens(path);
  if (method === 'GET' && path.startsWith('/api/catalogo')) return _catalogoLista(path);

  // Contas Fixas (alias /api/contas-fixas ↔ /api/contratos)
  if (full === 'GET /api/contas-fixas')  return _listarContratos();
  if (full === 'POST /api/contas-fixas') return _criarContrato(body);
  if (full === 'GET /api/contratos')     return _listarContratos();
  if (full === 'POST /api/contratos')    return _criarContrato(body);
  const mCFLanc = basePath.match(/^\/api\/contas-fixas\/lancamentos\/(\d+)$/);
  if (method === 'DELETE' && mCFLanc) return _deletarLancamento(+mCFLanc[1]);
  if (method === 'PATCH'  && mCFLanc) return _atualizarLancamento(+mCFLanc[1], body);
  const mCFLancs = basePath.match(/^\/api\/contas-fixas\/(\d+)\/lancamentos$/);
  if (method === 'GET'  && mCFLancs) return _lancamentosContrato(+mCFLancs[1]);
  if (method === 'POST' && mCFLancs) return _adicionarLancamento(+mCFLancs[1], body);
  const mCFId = basePath.match(/^\/api\/contas-fixas\/(\d+)$/);
  if (method === 'PATCH'  && mCFId) return _atualizarContrato(+mCFId[1], body);
  if (method === 'DELETE' && mCFId) return _deletarContrato(+mCFId[1]);
  const mContLanc = basePath.match(/^\/api\/contratos\/(\d+)\/lancamento$/);
  if (method === 'POST' && mContLanc) return _adicionarLancamento(+mContLanc[1], body);
  const mContLancs = basePath.match(/^\/api\/contratos\/(\d+)\/lancamentos$/);
  if (method === 'GET' && mContLancs) return _lancamentosContrato(+mContLancs[1]);
  const mCont = basePath.match(/^\/api\/contratos\/(\d+)$/);
  if (method === 'PUT'    && mCont) return _atualizarContrato(+mCont[1], body);
  if (method === 'DELETE' && mCont) return _deletarContrato(+mCont[1]);

  // Orçamento
  if (full === 'GET /api/orcamentos')          return _listarOrcamentos();
  if (full === 'POST /api/orcamentos/salvar')  return _salvarOrcamento(body);
  const mOrcDel = basePath.match(/^\/api\/orcamentos\/([^/]+)\/(\d+)$/);
  if (method === 'DELETE' && mOrcDel) return _deletarOrcamento(decodeURIComponent(mOrcDel[1]), +mOrcDel[2]);
  const mOrc = basePath.match(/^\/api\/orcamento\/(.+)$/);
  if (method === 'GET' && mOrc) return _orcamentoUnidade(decodeURIComponent(mOrc[1]));
  if (full === 'POST /api/orcamento') return _salvarOrcamento(body);

  // Configurações
  if (full === 'GET /api/configuracoes/opcoes') return _configOpcoes();

  // Consulta
  if (method === 'GET' && path.startsWith('/api/consulta/requisicoes')) return _consultaRequisicoes(path);

  // Home activity feed
  if (full === 'GET /api/home/atividade-recente') return _atividadeRecente();

  // Usuários CRUD (specific paths before generic /:id)
  if (full === 'POST /api/usuarios/solicitar-acesso')    return _solicitarAcesso(body);
  if (full === 'GET /api/usuarios/pendentes-acesso')     return _usuariosPendentes();
  if (full === 'POST /api/usuarios/importar-historico')  return { inseridos: 0, ignorados: 0 };
  if (method === 'GET' && path.startsWith('/api/usuarios/verificar')) return _verificarUsuario(path);
  if (full === 'GET /api/usuarios')  return _listarUsuarios();
  if (full === 'POST /api/usuarios') return _criarUsuario(body);
  const mUsuRejeitar = basePath.match(/^\/api\/usuarios\/(\d+)\/rejeitar$/);
  if (method === 'PATCH' && mUsuRejeitar) return _rejeitarUsuario(+mUsuRejeitar[1]);
  const mAtiv = basePath.match(/^\/api\/usuarios\/(\d+)\/ativar$/);
  if ((method === 'POST' || method === 'PATCH') && mAtiv) return _ativarUsuario(+mAtiv[1]);
  const mUsuId = basePath.match(/^\/api\/usuarios\/(\d+)$/);
  if (method === 'PATCH'  && mUsuId) return _atualizarUsuario(+mUsuId[1], body);
  if (method === 'DELETE' && mUsuId) return _deletarUsuario(+mUsuId[1]);

  // Compradores CRUD (alias /api/compradores ↔ /api/config/compradores)
  if (full === 'GET /api/compradores')                    return _listarCompradores();
  if (full === 'POST /api/compradores')                   return _salvarComprador(body);
  if (full === 'POST /api/compradores/importar-historico') return { inseridos: 0, ignorados: 0 };
  if (full === 'GET /api/config/compradores')             return _listarCompradores();
  if (full === 'POST /api/config/compradores')            return _salvarComprador(body);
  const mCompPatch = basePath.match(/^\/api\/compradores\/(\d+)$/);
  if (method === 'PATCH'  && mCompPatch) return _atualizarComprador(+mCompPatch[1], body);
  if (method === 'DELETE' && mCompPatch) return _deletarComprador(+mCompPatch[1]);
  const mCompDel = basePath.match(/^\/api\/config\/compradores\/(\d+)$/);
  if (method === 'DELETE' && mCompDel) return _deletarComprador(+mCompDel[1]);

  // Categorias CRUD
  if (full === 'GET /api/categorias')  return _listarCategorias();
  if (full === 'POST /api/categorias') return _criarCategoria(body);
  const mCatId = basePath.match(/^\/api\/categorias\/(\d+)$/);
  if (method === 'PATCH'  && mCatId) return _atualizarCategoria(+mCatId[1], body);
  if (method === 'DELETE' && mCatId) return _deletarCategoria(+mCatId[1]);

  // Segmentos de Compra
  if (full === 'GET /api/config/segmentos-compra')  return _listarSegmentosCompra();
  if (full === 'POST /api/config/segmentos-compra') return _criarSegmentoCompra(body);
  const mSegComp = basePath.match(/^\/api\/config\/segmentos-compra\/(\d+)$/);
  if (method === 'PATCH'  && mSegComp) return _atualizarSegmentoCompra(+mSegComp[1], body);
  if (method === 'DELETE' && mSegComp) return _deletarSegmentoCompra(+mSegComp[1]);

  // Tipos de Despesa
  if (full === 'GET /api/config/tipo-despesa')  return _listarTipoDespesa();
  if (full === 'POST /api/config/tipo-despesa') return _criarTipoDespesa(body);
  const mTipDesp = basePath.match(/^\/api\/config\/tipo-despesa\/(\d+)$/);
  if (method === 'PATCH'  && mTipDesp) return _atualizarTipoDespesa(+mTipDesp[1], body);
  if (method === 'DELETE' && mTipDesp) return _deletarTipoDespesa(+mTipDesp[1]);

  // Controle de Estoque
  if (full === 'GET /api/estoque')           return _listarEstoque();
  if (full === 'GET /api/estoque/busca')     return _buscarEstoque(path);
  if (full === 'POST /api/estoque/entrada')  return _entradaEstoque(body);
  if (full === 'POST /api/estoque/saida')    return _saidaEstoque(body);
  if (full === 'POST /api/estoque/ajuste')   return _ajusteEstoque(body);
  const mEstMov = basePath.match(/^\/api\/estoque\/(\d+)\/movimentacoes$/);
  if (method === 'GET' && mEstMov) return _movimentacoesItem(+mEstMov[1]);
  const mEstItem = basePath.match(/^\/api\/estoque\/(\d+)$/);
  if (method === 'DELETE' && mEstItem) return _deletarItemEstoque(+mEstItem[1]);
  if (method === 'PATCH'  && mEstItem) return _atualizarItemEstoque(+mEstItem[1], body);

  // Gestão de Fornecedores (SPA interna)
  if (method === 'GET' && path.startsWith('/api/fornecedores/lista')) return _listarFornecedoresGestao(path);

  // Portal fornecedor — minha cotação existente
  if (method === 'GET' && path.startsWith('/api/cotacao/minha')) return _minhaCotacao(path);

  // Portal fornecedor — cadastro
  if (method === 'GET' && path.startsWith('/api/fornecedor/cadastro')) return _getCadastroFornecedor(path);
  if (full === 'POST /api/fornecedor/cadastro') return _salvarCadastroFornecedor(body);

  console.warn('[SHP] Rota não mapeada:', method, path);
  return {};
}

// ── Api global (sobrescreve utils.js) ─────────────────────
// IMPORTANTE: usa Object.assign para mutar o objeto const Api de utils.js.
// window.Api = {} cria uma propriedade no window que NUNCA é vista porque
// const Api (declarativo) tem prioridade no escopo global sobre window props.
Object.assign(Api, {
  async get(path)         { return _route('GET',    path, null); },
  async post(path, body)  { return _route('POST',   path, body); },
  async patch(path, body) { return _route('PATCH',  path, body); },
  async put(path, body)   { return _route('PUT',    path, body); },
  async delete(path)      { return _route('DELETE', path, null); },
});

// ══════════════════════════════════════════════════════════
// IMPLEMENTAÇÕES
// ══════════════════════════════════════════════════════════

// ── Dashboard ─────────────────────────────────────────────
async function _dashboardDados(path = '') {
  const qp    = new URLSearchParams((path || '').split('?')[1] || '');
  const fUnid = qp.get('unidade') || '';
  const fAno  = qp.get('period')  || '';
  const fMes  = qp.get('mes')     || '';

  // Push ALL filters to SQL so count and data are always consistent
  const unidArr = fUnid ? fUnid.split(',').map(s => s.trim()).filter(Boolean) : [];
  const anoArr  = fAno  ? fAno.split(',').map(s => s.trim()).filter(Boolean)  : [];
  const mesArr  = fMes  ? fMes.split(',').map(s => s.trim()).filter(Boolean)  : [];
  const applyFilters = (q) => {
    if (unidArr.length === 1) q = q.eq('unidade', unidArr[0]);
    else if (unidArr.length > 1) q = q.in('unidade', unidArr);
    return q;
  };
  const jsFilter = (r) => {
    if (anoArr.length > 0) {
      const p = (r.data_solicitacao || '').split('/');
      if (p.length < 3 || !anoArr.includes(p[2])) return false;
    }
    if (mesArr.length > 0) {
      const p = (r.data_solicitacao || '').split('/');
      if (p.length < 3 || !mesArr.includes(p[1])) return false;
    }
    return true;
  };

  // Parallel: exact count (bypasses PostgREST row cap) + full data rows
  const [{ count: totalExato }, { data: rawReqs }] = await Promise.all([
    applyFilters(_sb.from('requisicoes').select('*', { count: 'exact', head: true })),
    applyFilters(_sb.from('requisicoes')
      .select('status, valor_fechado, unidade, data_solicitacao, comprador')
      .limit(10000))
  ]);

  const reqs     = (rawReqs || []).filter(jsFilter);
  const total    = totalExato ?? reqs.length;
  // Investimento Total = soma de TODOS os valores fechados (todas as POs emitidas)
  const totalGasto = reqs.reduce((s, r) => s + (Number(r.valor_fechado) || 0), 0);

  // Status pipeline — qtd field (required by dashboard.js _renderCharts)
  const statusMap = {};
  reqs?.forEach(r => { statusMap[r.status] = (statusMap[r.status] || 0) + 1; });
  const status = Object.entries(statusMap).map(([s, qtd]) => ({ status: s, qtd }));

  // Por unidade — qtd field (required by dashboard.js _renderCharts)
  const unidadeMap = {};
  reqs?.forEach(r => { if (r.unidade) unidadeMap[r.unidade] = (unidadeMap[r.unidade] || 0) + 1; });
  const unidades = Object.entries(unidadeMap)
    .map(([unidade, qtd]) => ({ unidade, qtd }))
    .sort((a, b) => b.qtd - a.qtd);

  // Sazonalidade mensal MM/YYYY (required by dashboard.js _renderCharts)
  const sazonMap = {};
  reqs?.forEach(r => {
    if (!r.data_solicitacao) return;
    const p = r.data_solicitacao.split('/');
    if (p.length >= 3) {
      const chave = `${p[1]}/${p[2]}`; // MM/YYYY from DD/MM/YYYY
      sazonMap[chave] = (sazonMap[chave] || 0) + 1;
    }
  });
  const sazonalidade = Object.entries(sazonMap)
    .map(([mes, qtd]) => ({ mes, qtd }))
    .sort((a, b) => {
      const [aM, aY] = a.mes.split('/');
      const [bM, bY] = b.mes.split('/');
      return aY !== bY ? Number(aY) - Number(bY) : Number(aM) - Number(bM);
    });

  // Top compradores (required by dashboard.js _renderCharts)
  const comprMap = {};
  reqs?.forEach(r => { if (r.comprador) comprMap[r.comprador] = (comprMap[r.comprador] || 0) + 1; });
  const compradores = Object.entries(comprMap)
    .map(([nome, qtd]) => ({ nome, qtd }))
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 10);

  const [
    { count: fornCount },
    { data: lancesData }
  ] = await Promise.all([
    _sb.from('fornecedores').select('*', { count: 'exact', head: true }),
    _sb.from('lances_fornecedor').select('id_requisicao, preco_unitario, selecionado').gt('preco_unitario', 0).limit(10000)
  ]);

  // Savings = (max quote - selected quote) per requisição
  const reqLances = {};
  for (const l of (lancesData || [])) {
    if (!reqLances[l.id_requisicao]) reqLances[l.id_requisicao] = { max: 0, selected: null };
    reqLances[l.id_requisicao].max = Math.max(reqLances[l.id_requisicao].max, l.preco_unitario);
    if (l.selecionado) reqLances[l.id_requisicao].selected = l.preco_unitario;
  }
  let savingValor = 0;
  for (const v of Object.values(reqLances)) {
    if (v.selected !== null && v.max > v.selected) savingValor += v.max - v.selected;
  }
  const savingBase = totalGasto + savingValor;
  const savingPct = savingBase > 0 ? (savingValor / savingBase) * 100 : 0;

  const unidadesOpts = [...new Set((rawReqs || []).map(r => r.unidade).filter(Boolean))].sort();
  const anosOpts = [...new Set((rawReqs || []).map(r => {
    if (!r.data_solicitacao) return null;
    const p = r.data_solicitacao.split('/');
    return p.length >= 3 ? p[2] : null;
  }).filter(Boolean))].sort();

  return {
    kpis: { total_pedidos: total, total_gasto: totalGasto, total_fornecedores: fornCount || 0, saving_valor: savingValor, saving_pct: savingPct },
    status,
    unidades,
    sazonalidade,
    compradores,
    opts: { unidades: unidadesOpts, anos: anosOpts }
  };
}

// ── Saving Dashboard ───────────────────────────────────────
async function _savingDashboard(path) {
  const qp         = new URLSearchParams((path || '').split('?')[1] || '');
  const filterComp = qp.get('comprador') || '';
  const filterUnit = qp.get('unidade')   || '';

  const _empty = () => ({
    pedidos: [], compradores: [],
    kpis: { total_saving: 0, pct_saving: 0, count: 0, melhor_comprador: '—' },
    opts: { compradores: [], unidades: [] }
  });

  // 1. Requisições concluídas com valor fechado
  let q = _sb.from('requisicoes')
    .select('id_sharepoint, comprador, unidade, data_solicitacao, fornecedor, valor_fechado, status, preco_negociado_final')
    .in('status', ['Aguardando Entrega', 'Recebido', 'Concluído'])
    .not('valor_fechado', 'is', null)
    .gt('valor_fechado', 0)
    .order('id_sharepoint', { ascending: false });
  if (filterComp) q = q.eq('comprador', filterComp);
  if (filterUnit)  q = q.eq('unidade',   filterUnit);

  const { data: reqs, error } = await q;
  if (error) _err(error);
  if (!reqs || !reqs.length) return _empty();

  // 2. Todos os lances das requisições encontradas
  const ids = reqs.map(r => r.id_sharepoint);
  const { data: lances } = await _sb.from('lances_fornecedor')
    .select('id_requisicao, preco_unitario, preco_original, selecionado')
    .in('id_requisicao', ids)
    .gt('preco_unitario', 0);

  // 3. Agrupa lances por requisição
  const byReq = {};
  for (const l of (lances || [])) {
    if (!byReq[l.id_requisicao]) byReq[l.id_requisicao] = [];
    byReq[l.id_requisicao].push(l);
  }

  // 4. Calcula saving por requisição
  const pedidos = [];
  let totalSaving = 0, totalBase = 0;

  for (const r of reqs) {
    const reqLances = byReq[r.id_sharepoint] || [];
    if (!reqLances.length) continue;
    const selLance  = reqLances.find(l => l.selecionado);
    if (!selLance) continue;

    // preço efetivo: usa preco_negociado_final (desconto adicional via Conciliação) se disponível
    const precoLance = selLance.preco_unitario;
    const precoFinal = (r.preco_negociado_final && r.preco_negociado_final > 0 && r.preco_negociado_final < precoLance)
      ? r.preco_negociado_final
      : precoLance;
    const maxQuote   = Math.max(...reqLances.map(l => l.preco_unitario));
    // baseline: preco_original gravado (negociação real) ou max das cotações (saving de mercado)
    const baseline   = (selLance.preco_original && selLance.preco_original > precoFinal)
      ? selLance.preco_original
      : maxQuote;

    const savingAbs = baseline > precoFinal ? +(baseline - precoFinal).toFixed(2) : 0;
    if (savingAbs <= 0) continue;

    const savingPct = +(savingAbs / baseline * 100).toFixed(2);
    totalSaving += savingAbs;
    totalBase   += baseline;

    pedidos.push({
      id:          r.id_sharepoint,
      comprador:   r.comprador  || '—',
      unidade:     r.unidade    || '—',
      data:        r.data_solicitacao,
      fornecedor:  r.fornecedor || '—',
      status:      r.status,
      n_cotacoes:  reqLances.length,
      preco_base:  +baseline.toFixed(2),
      preco_final: +precoFinal.toFixed(2),
      saving_abs:  savingAbs,
      saving_pct:  savingPct
    });
  }

  // 5. Agrega por comprador
  const byComp = {};
  for (const p of pedidos) {
    if (!byComp[p.comprador]) byComp[p.comprador] = { nome: p.comprador, saving: 0, base: 0, count: 0 };
    byComp[p.comprador].saving += p.saving_abs;
    byComp[p.comprador].base   += p.preco_base;
    byComp[p.comprador].count++;
  }
  const compradores = Object.values(byComp)
    .map(c => ({ ...c, pct: c.base > 0 ? +(c.saving / c.base * 100).toFixed(1) : 0 }))
    .sort((a, b) => b.saving - a.saving);

  // 6. Opções de filtro (dataset completo, não filtrado)
  const { data: allFin } = await _sb.from('requisicoes')
    .select('comprador, unidade')
    .in('status', ['Aguardando Entrega', 'Recebido', 'Concluído']);
  const opts = {
    compradores: [...new Set((allFin || []).map(r => r.comprador).filter(Boolean))].sort(),
    unidades:    [...new Set((allFin || []).map(r => r.unidade).filter(Boolean))].sort()
  };

  const pctTotal = totalBase > 0 ? +(totalSaving / totalBase * 100).toFixed(1) : 0;

  return {
    pedidos, compradores,
    kpis: {
      total_saving:     +totalSaving.toFixed(2),
      pct_saving:       pctTotal,
      count:            pedidos.length,
      melhor_comprador: compradores[0]?.nome || '—'
    },
    opts
  };
}

// ── Orçamentos (listagem completa — consumido calculado de requisições) ────
async function _listarOrcamentos() {
  const [{ data: orcs }, { data: reqs }] = await Promise.all([
    _sb.from('orcamentos').select('*').order('unidade'),
    _sb.from('requisicoes')
      .select('unidade, valor_fechado, data_solicitacao')
      .not('valor_fechado', 'is', null)
      .gt('valor_fechado', 0)
      .limit(10000)
  ]);

  // Build spending map: unidade → { year → total }
  const spendMap = {};
  for (const r of (reqs || [])) {
    const ano = (r.data_solicitacao || '').split('/')[2] || '';
    const key = `${r.unidade}|${ano}`;
    spendMap[key] = (spendMap[key] || 0) + (Number(r.valor_fechado) || 0);
  }
  // Also accumulate all-time per unidade (for budgets when year doesn't match history)
  const spendAll = {};
  for (const r of (reqs || [])) {
    spendAll[r.unidade] = (spendAll[r.unidade] || 0) + (Number(r.valor_fechado) || 0);
  }

  const orcamentos = (orcs || []).map(o => {
    const consumidoAno = spendMap[`${o.unidade}|${o.ano}`] || 0;
    // If no spending in the budget year, show all-time total so dashboard is useful
    const consumido = consumidoAno > 0 ? consumidoAno : (spendAll[o.unidade] || 0);
    return {
      ...o,
      consumido,
      percentual: o.orcamento_anual > 0 ? (consumido / o.orcamento_anual) * 100 : 0
    };
  });
  const unidades = [...new Set(orcamentos.map(o => o.unidade).filter(Boolean))].sort();
  return { orcamentos, unidades };
}

// ── Atividade Recente (Home Feed) — lê do activity_log ────
async function _atividadeRecente() {
  const { data: logs } = await _sb.from('activity_log')
    .select('id_requisicao, evento, tipo, comprador, unidade, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  const cores = {
    'Aguardando Aprovação': '#f59e0b', 'Aprovado': '#01E18E',
    'Reprovado': '#ff2f69', 'Aguardando Cotação': '#422c76',
    'Em Cotação': '#422c76', 'Aguardando Entrega': '#f59e0b',
    'Recebido': '#01E18E', 'Concluído': '#01E18E', 'Bloqueado': '#ff2f69'
  };
  return (logs || []).map(l => ({
    data:    l.created_at || '',
    usuario: l.comprador  || '',
    unidade: l.unidade    || '',
    texto:   l.evento,
    cor:     cores[l.tipo] || '#888899'
  }));
}

// Grava um evento no activity_log (fire-and-forget nas chamadas)
async function _logAtividade(id_req, tipo, comprador, unidade) {
  await _sb.from('activity_log').insert({
    id_requisicao: id_req,
    evento:    `Req. #${id_req} — ${tipo}`,
    tipo,
    comprador: comprador || '',
    unidade:   unidade   || ''
  });
}
// Variante que busca comprador/unidade da req antes de logar
async function _logBuscaReq(id_req, tipo) {
  const { data: r } = await _sb.from('requisicoes')
    .select('comprador, unidade').eq('id_sharepoint', id_req).single();
  return _logAtividade(id_req, tipo, r?.comprador, r?.unidade);
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
    segmento_compra: body.segmento_compra || null,
    tipo_despesa:    body.tipo_despesa    || null,
    status: 'Aguardando Aprovação',
    data_solicitacao: new Date().toLocaleDateString('pt-BR')
  }).select().single();
  if (error) _err(error);
  if (body.itens?.length) {
    const itens = body.itens.map(i => ({
      id_requisicao: req.id_sharepoint, descricao: i.descricao,
      quantidade: i.quantidade, segmento_historico: i.segmento,
      origem: i.origem || 'compra'
    }));
    const { error: eItens } = await _sb.from('itens_requisicao').insert(itens);
    if (eItens) {
      if (eItens.message?.includes('origem')) {
        const { error: e2 } = await _sb.from('itens_requisicao')
          .insert(itens.map(({ origem, ...r }) => r));
        if (e2) _err(e2);
      } else { _err(eItens); }
    }
  }
  _logAtividade(req.id_sharepoint, 'Aguardando Aprovação', body.comprador, body.unidade).catch(() => {});
  return { id: req.id_sharepoint, id_pedido: req.id_sharepoint, status: 'ok' };
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
  const upd = { status: novoStatus, updated_at: new Date().toISOString() };
  if (body.justificativa) upd.observacoes = body.justificativa;
  const { error } = await _sb.from('requisicoes').update(upd).eq('id_sharepoint', id);
  if (error) _err(error);
  _logBuscaReq(id, novoStatus).catch(() => {});
  return { status: 'ok' };
}

// ── Sourcing ───────────────────────────────────────────────
async function _pedidosAprovados() {
  const { data, error } = await _sb.from('requisicoes')
    .select('id_sharepoint, comprador, unidade, data_solicitacao, status, itens_requisicao(segmento_historico), lances_fornecedor(id, preco_unitario)')
    .in('status', ['Aguardando Cotação', 'Em Cotação', 'Aprovado Gestor'])
    .order('id_sharepoint', { ascending: false });
  if (error) _err(error);
  return (data || []).map(r => {
    const lances = r.lances_fornecedor || [];
    return {
      id: r.id_sharepoint, solicitante: r.comprador, unidade: r.unidade,
      data: r.data_solicitacao, status: r.status,
      segmento: r.itens_requisicao?.[0]?.segmento_historico || '',
      convites_enviados:   lances.length,
      propostas_recebidas: lances.filter(l => (l.preco_unitario || 0) > 0).length
    };
  });
}

async function _dispararEmailConvite(body) {
  const cnpjN = _normCnpj(body.cnpj_fornecedor);
  const reqId  = body.id_requisicao;
  // Cria um lance com preco=0 como marcador de "convite enviado"
  const { data: existing } = await _sb.from('lances_fornecedor')
    .select('id').eq('id_requisicao', reqId).eq('cnpj_fornecedor', cnpjN).maybeSingle();
  if (!existing) {
    await _sb.from('lances_fornecedor').insert({
      id_requisicao: reqId, cnpj_fornecedor: cnpjN,
      preco_unitario: 0, data_resposta: _now()
    });
  }
  // Avança status para "Em Cotação" (convites foram disparados)
  await _sb.from('requisicoes')
    .update({ status: 'Em Cotação', updated_at: new Date().toISOString() })
    .eq('id_sharepoint', reqId);
  return { status: 'ok' };
}

async function _fornecedoresPorSegmento(segmento) {
  // Step 1: find category IDs matching the segment name
  const { data: cats } = await _sb.from('categorias').select('id').ilike('segmento', `%${segmento}%`);
  const catIds = (cats || []).map(c => c.id);

  let fornecedores = [];
  if (catIds.length) {
    // Step 2: get CNPJs linked to those categories (explicit — no PostgREST FK join)
    const { data: links } = await _sb.from('fornecedores_segmentos')
      .select('cnpj_fornecedor')
      .in('id_categoria', catIds);
    const cnpjs = [...new Set((links || []).map(l => l.cnpj_fornecedor).filter(Boolean))];

    if (cnpjs.length) {
      // Step 3: fetch full supplier records by CNPJ
      const { data: fs } = await _sb.from('fornecedores')
        .select('*')
        .in('cnpj', cnpjs)
        .order('razao_social');
      fornecedores = fs || [];
    }
  }

  // Fallback: if the junction table returned nothing, show ALL suppliers
  // (handles suppliers imported without segment linking)
  if (!fornecedores.length) {
    const { data: all } = await _sb.from('fornecedores')
      .select('*')
      .order('razao_social')
      .limit(500);
    fornecedores = all || [];
  }

  const { data: hist } = await _sb.from('requisicoes')
    .select('data_solicitacao, valor_fechado, fornecedor, itens_requisicao(descricao, quantidade)')
    .eq('status', 'Concluído').limit(5);
  return {
    fornecedores,
    historico_precos: (hist || []).map(h => ({
      data: h.data_solicitacao, item: h.itens_requisicao?.[0]?.descricao || '',
      qtd: h.itens_requisicao?.[0]?.quantidade || 0, valor: h.valor_fechado, fornecedor: h.fornecedor
    })),
    total_fornecedores: fornecedores.length
  };
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
      preco_unitario:  body.preco_unitario,
      preco_original:  body.preco_original || body.preco_unitario,
      desconto_tipo:   body.desconto_tipo  || null,
      desconto_valor:  body.desconto_valor || null,
      prazo_entrega_dias: body.prazo_entrega,
      pagamento: body.pagamento, validade_dias: body.validade_dias,
      observacoes: body.observacoes, frete_incluso: body.frete_incluso,
      imposto_incluso: body.imposto_incluso, data_resposta: _now()
    }).eq('id', existing.id);
    lanceId = existing.id;
  } else {
    const { data: novo, error } = await _sb.from('lances_fornecedor').insert({
      id_requisicao: body.id_requisicao, cnpj_fornecedor: cnpjN,
      preco_unitario:  body.preco_unitario,
      preco_original:  body.preco_original || body.preco_unitario,
      desconto_tipo:   body.desconto_tipo  || null,
      desconto_valor:  body.desconto_valor || null,
      prazo_entrega_dias: body.prazo_entrega,
      pagamento: body.pagamento, validade_dias: body.validade_dias,
      observacoes: body.observacoes, frete_incluso: body.frete_incluso,
      imposto_incluso: body.imposto_incluso, data_resposta: _now()
    }).select().single();
    if (error) _err(error);
    lanceId = novo.id;
    // Avança status se ainda em 'Aguardando Cotação'
    await _sb.from('requisicoes').update({ status: 'Em Cotação', updated_at: new Date().toISOString() })
      .eq('id_sharepoint', body.id_requisicao).eq('status', 'Aguardando Cotação');
    _logBuscaReq(body.id_requisicao, 'Em Cotação').catch(() => {});
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

/* ── Estoque: verificação e baixa ───────────────────────────────── */

async function _verificarEstoque(id) {
  const { data: itens } = await _sb.from('itens_requisicao')
    .select('descricao, quantidade').eq('id_requisicao', id);
  if (!itens || !itens.length) return { itens: [], temEstoque: false, todosSuficientes: false };

  const { data: estoqueItems } = await _sb.from('controle_estoque')
    .select('id, descricao, saldo_atual, unidade_medida').gt('saldo_atual', 0).order('descricao');

  const resultado = itens.map(item => {
    const descLow = (item.descricao || '').toLowerCase().trim();
    const match = (estoqueItems || []).find(e => {
      const eLow = (e.descricao || '').toLowerCase().trim();
      return eLow === descLow || eLow.includes(descLow) || descLow.includes(eLow);
    });
    if (!match) {
      return { descricao: item.descricao, quantidade_pedida: item.quantidade, saldo: 0,
               id_item: null, status: 'SEM_ESTOQUE', unidade: 'un' };
    }
    return {
      descricao: item.descricao, quantidade_pedida: item.quantidade,
      saldo: match.saldo_atual, id_item: match.id, unidade: match.unidade_medida || 'un',
      status: match.saldo_atual >= item.quantidade ? 'OK' : 'INSUFICIENTE'
    };
  });

  return {
    itens: resultado,
    temEstoque: resultado.some(r => r.status !== 'SEM_ESTOQUE'),
    todosSuficientes: resultado.every(r => r.status === 'OK')
  };
}

async function _usarEstoque(id, body) {
  const itens = body.itens || [];
  const registradoPor = body.registrado_por || null;

  for (const item of itens) {
    if (!item.id_item || !item.quantidade) continue;

    // Busca saldo atual
    const { data: est } = await _sb.from('controle_estoque')
      .select('saldo_atual').eq('id', item.id_item).single();
    if (!est) continue;

    const novoSaldo = (est.saldo_atual || 0) - item.quantidade;

    // Atualiza saldo
    await _sb.from('controle_estoque')
      .update({ saldo_atual: novoSaldo })
      .eq('id', item.id_item);

    // Registra movimentação de saída
    await _sb.from('movimentacoes_estoque').insert({
      id_item: item.id_item,
      tipo: 'SAIDA',
      quantidade: item.quantidade,
      saldo_apos: novoSaldo,
      id_requisicao: id,
      registrado_por: registradoPor,
      observacoes: `Atendimento direto por estoque — Req. #${id}`
    });
  }

  // Marca requisição como Concluída
  await _sb.from('requisicoes').update({ status: 'Concluido' }).eq('id', id);

  return { status: 'ok', requisicao: id, itens_baixados: itens.length };
}

async function _selecionarFornecedor(id, body) {
  const cnpjN   = _normCnpj(body.cnpj_fornecedor);
  const cnpjFmt = _fmtCnpj(cnpjN);

  // Reset todos os lances, depois marca o vencedor nos dois formatos possíveis
  await _sb.from('lances_fornecedor').update({ selecionado: 0 }).eq('id_requisicao', id);
  await _sb.from('lances_fornecedor').update({ selecionado: 1 })
    .eq('id_requisicao', id)
    .or(`cnpj_fornecedor.eq.${cnpjN},cnpj_fornecedor.eq.${cnpjFmt}`);

  // Busca o lance com maior preço entre os dois formatos (evita maybeSingle em duplicatas)
  const { data: lances } = await _sb.from('lances_fornecedor')
    .select('preco_unitario')
    .eq('id_requisicao', id)
    .or(`cnpj_fornecedor.eq.${cnpjN},cnpj_fornecedor.eq.${cnpjFmt}`)
    .order('preco_unitario', { ascending: false })
    .limit(1);
  const lance = lances?.[0];

  // Nome do fornecedor comparando CNPJ normalizado
  const [{ data: allForns }, { data: reqAtual }] = await Promise.all([
    _sb.from('fornecedores').select('cnpj,razao_social'),
    _sb.from('requisicoes').select('preco_negociado_final').eq('id_sharepoint', id).single()
  ]);
  const fornRec = (allForns || []).find(f => _normCnpj(f.cnpj) === cnpjN);
  const nomeForn = fornRec?.razao_social || cnpjFmt;

  // Usa preco_negociado_final (desconto adicional do comprador) se disponível e menor
  const precoLance = lance?.preco_unitario || 0;
  const precoNeg   = reqAtual?.preco_negociado_final;
  const valorFechado = (precoNeg && precoNeg > 0 && precoNeg < precoLance)
    ? precoNeg : precoLance;

  await _sb.from('requisicoes').update({
    status: 'Aguardando Entrega', fornecedor: nomeForn,
    valor_fechado: valorFechado,
    updated_at: new Date().toISOString()
  }).eq('id_sharepoint', id);
  _logBuscaReq(id, 'Aguardando Entrega').catch(() => {});
  return { status: 'ok', fornecedor: nomeForn };
}

async function _getDescontoComprador(id) {
  const { data: lances } = await _sb.from('lances_fornecedor')
    .select('preco_unitario').eq('id_requisicao', id).gt('preco_unitario', 0);
  const melhorPreco = lances?.length ? Math.min(...lances.map(l => l.preco_unitario)) : null;

  const { data: req } = await _sb.from('requisicoes')
    .select('desconto_comprador_tipo,desconto_comprador_valor,preco_negociado_final')
    .eq('id_sharepoint', id).single();

  return {
    tipo:               req?.desconto_comprador_tipo  || null,
    valor:              req?.desconto_comprador_valor  || null,
    preco_negociado_final: req?.preco_negociado_final || null,
    melhor_preco:       melhorPreco
  };
}

async function _salvarDescontoComprador(id, body) {
  const { tipo, valor, preco_negociado_final } = body;
  await _sb.from('requisicoes').update({
    desconto_comprador_tipo:  tipo  || null,
    desconto_comprador_valor: valor || null,
    preco_negociado_final:    preco_negociado_final || null,
    updated_at: new Date().toISOString()
  }).eq('id_sharepoint', id);
  return { status: 'ok' };
}

async function _comparativoCotacoes(id) {
  // No FK between lances_fornecedor.cnpj_fornecedor and fornecedores.cnpj,
  // so we do a two-step fetch to avoid PostgREST relationship error.
  const { data: lances, error } = await _sb.from('lances_fornecedor')
    .select('*')
    .eq('id_requisicao', id)
    .order('selecionado', { ascending: false })
    .order('preco_unitario', { ascending: true });
  if (error) _err(error);

  // fornecedores.cnpj is stored with punctuation; lances use normalized digits-only.
  // Fetch all (9 rows) and normalize keys for matching.
  const { data: allForns } = await _sb.from('fornecedores').select('cnpj,razao_social,email,telefone');
  const fornMap = Object.fromEntries((allForns || []).map(f => [_normCnpj(f.cnpj), f]));

  // Busca aprovação do gestor
  const { data: reqData } = await _sb.from('requisicoes')
    .select('aprovado_gestor_cnpj, aprovado_gestor_obs, aprovado_gestor_em')
    .eq('id_sharepoint', id)
    .maybeSingle();
  const aprovadoCnpj = reqData?.aprovado_gestor_cnpj ? _normCnpj(reqData.aprovado_gestor_cnpj) : null;

  const seen = new Set();
  const result = [];
  for (const l of (lances || [])) {
    if (seen.has(l.cnpj_fornecedor)) continue;
    seen.add(l.cnpj_fornecedor);
    const { data: itens } = await _sb.from('lances_fornecedor_itens').select('*').eq('id_lance', l.id);
    const forn = fornMap[l.cnpj_fornecedor];
    const isGA = aprovadoCnpj !== null && _normCnpj(l.cnpj_fornecedor) === aprovadoCnpj;
    result.push({
      id: l.id,
      fornecedor: forn?.razao_social || _fmtCnpj(l.cnpj_fornecedor),
      preco: l.preco_unitario, prazo: l.prazo_entrega_dias, data: l.data_resposta,
      cnpj: l.cnpj_fornecedor, pagamento: l.pagamento || '30 DDL',
      validade_dias: l.validade_dias || 15, observacoes: l.observacoes,
      frete_incluso: l.frete_incluso, imposto_incluso: l.imposto_incluso,
      selecionado: !!l.selecionado, email: forn?.email, telefone: forn?.telefone,
      itens_precos: itens || [],
      aprovado_gestor: isGA,
      aprovado_gestor_obs: isGA ? (reqData?.aprovado_gestor_obs || '') : null
    });
  }
  return result;
}

async function _atualizarLance(id, body) {
  const update = {};
  if (body.preco_unitario  !== undefined) update.preco_unitario       = body.preco_unitario;
  if (body.prazo_entrega_dias !== undefined) update.prazo_entrega_dias = body.prazo_entrega_dias;
  if (body.pagamento       !== undefined) update.pagamento             = body.pagamento;
  const { error } = await _sb.from('lances_fornecedor').update(update).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
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
    .eq('status', 'Recebido').order('id_sharepoint', { ascending: false }).limit(50);
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

  // Desconto adicional informado pelo comprador — pula verificação de valor divergente
  const temNegociacao = body.preco_negociado_final && body.preco_negociado_final > 0;
  if (!temNegociacao && po.valor_esperado > 0 && Math.abs(body.valor_nf - po.valor_esperado) > 0.01)
    divergencias.push(`Valor divergente: NF R$ ${body.valor_nf.toFixed(2)} vs PO R$ ${po.valor_esperado.toFixed(2)}`);

  const aprovado = divergencias.length === 0;
  if (aprovado) {
    const upd = { status: 'Concluído', valor_fechado: body.valor_nf, updated_at: new Date().toISOString() };
    if (temNegociacao) upd.preco_negociado_final = body.preco_negociado_final;
    await _sb.from('requisicoes').update(upd).eq('id_sharepoint', id);
    _logBuscaReq(id, 'Concluído').catch(() => {});
  }

  // Monta detalhes de aprovação incluindo saving se houver
  const detalheAprovado = [`Quantidade OK: ${qtdRec} un.`, `Valor da NF: R$ ${body.valor_nf.toFixed(2)}`];
  if (aprovado && temNegociacao && po.valor_esperado > 0) {
    const savAmt = po.valor_esperado - body.preco_negociado_final;
    if (savAmt > 0)
      detalheAprovado.push(`Desconto adicional registrado: R$ ${savAmt.toFixed(2)} economizados vs PO de R$ ${po.valor_esperado.toFixed(2)} (${(savAmt / po.valor_esperado * 100).toFixed(1)}%)`);
  }

  // Busca fornecedor da requisição para passagem ao estoque
  let fornecedor = null;
  try {
    const { data: req } = await _sb.from('requisicoes').select('fornecedor').eq('id_sharepoint', id).maybeSingle();
    fornecedor = req?.fornecedor || null;
  } catch {}
  return {
    status: aprovado ? 'APROVADO' : 'BLOQUEADO',
    mensagem: aprovado ? 'Todos os dados conferem. Pagamento liberado.' : 'Divergências encontradas. Pagamento bloqueado.',
    detalhes: aprovado ? detalheAprovado : divergencias,
    preco_unitario: po.preco_unitario || null,
    fornecedor,
  };
}

async function _nfUploads(id) {
  const { data } = await _sb.from('nf_uploads').select('*').eq('id_pedido', id).order('enviado_em', { ascending: false });
  return (data || []).map(u => ({ ...u, tipo: u.tipo || 'PDF', tamanho_kb: u.tamanho_kb || 0 }));
}

// ── Entregas pendentes (Aguardando Entrega + Recebido) ─────
async function _entregasPendentes() {
  const { data, error } = await _sb.from('requisicoes')
    .select('id_sharepoint, unidade, comprador, data_solicitacao, status, fornecedor, valor_fechado, itens_requisicao(descricao,quantidade)')
    .in('status', ['Aguardando Entrega', 'Recebido'])
    .order('id_sharepoint', { ascending: false })
    .limit(300);
  if (error) _err(error);
  return (data || []).map(r => ({
    id:            r.id_sharepoint,
    unidade:       r.unidade,
    comprador:     r.comprador,
    data:          r.data_solicitacao,
    status:        r.status,
    fornecedor:    r.fornecedor,
    valor_fechado: r.valor_fechado,
    itens_count:   (r.itens_requisicao || []).length,
    itens_preview: (r.itens_requisicao || []).slice(0, 2)
                     .map(i => `${i.quantidade}x ${i.descricao}`).join(', ')
  }));
}

// ── Confirmar recebimento (Aguardando Entrega → Recebido) ──
async function _confirmarRecebimento(id, body) {
  const upd = { status: 'Recebido', updated_at: new Date().toISOString() };
  if (body.obs) {
    const { data: req } = await _sb.from('requisicoes')
      .select('observacoes').eq('id_sharepoint', id).single();
    const prev = req?.observacoes || '';
    upd.observacoes = prev
      ? `${prev}\n[Entrega ${body.data_recebimento || _now()}] ${body.obs}`
      : `[Entrega ${body.data_recebimento || _now()}] ${body.obs}`;
  }
  const { error } = await _sb.from('requisicoes').update(upd).eq('id_sharepoint', id);
  if (error) _err(error);
  _logBuscaReq(id, 'Recebido').catch(() => {});
  return { status: 'ok' };
}

// ── Detalhes Completos ─────────────────────────────────────
async function _detalhesCompletos(id) {
  const [{ data: req }, { data: itens }, { data: lancesRaw }, { data: arqs }] = await Promise.all([
    _sb.from('requisicoes').select('*').eq('id_sharepoint', id).single(),
    _sb.from('itens_requisicao').select('*').eq('id_requisicao', id),
    _sb.from('lances_fornecedor').select('*')  // No FK join — two-step lookup below
       .eq('id_requisicao', id).order('selecionado', { ascending: false }),
    _sb.from('arquivos_requisicao').select('*').eq('id_requisicao', id).order('enviado_em')
  ]);
  if (!req) throw new Error('Requisição não encontrada');

  // fornecedores.cnpj stored with punctuation; normalize keys for matching
  const { data: allForns } = await _sb.from('fornecedores').select('cnpj,razao_social,email,telefone');
  const fornMap = Object.fromEntries((allForns || []).map(f => [_normCnpj(f.cnpj), f]));

  const aprovadoCnpjDet = req.aprovado_gestor_cnpj ? _normCnpj(req.aprovado_gestor_cnpj) : null;

  const seen = new Set();
  const cotacoes = [];
  for (const l of (lancesRaw || [])) {
    if (seen.has(l.cnpj_fornecedor)) continue;
    seen.add(l.cnpj_fornecedor);
    const { data: litens } = await _sb.from('lances_fornecedor_itens').select('*').eq('id_lance', l.id);
    const forn = fornMap[l.cnpj_fornecedor];
    cotacoes.push({
      cnpj: l.cnpj_fornecedor, nome: forn?.razao_social || _fmtCnpj(l.cnpj_fornecedor),
      preco_unitario: l.preco_unitario, prazo: l.prazo_entrega_dias, pagamento: l.pagamento,
      data: l.data_resposta, selecionado: !!l.selecionado, observacoes: l.observacoes,
      frete_incluso: !!l.frete_incluso, imposto_incluso: !!l.imposto_incluso,
      arquivo_nome: l.arquivo_nome, arquivo_path: l.arquivo_path, validade_dias: l.validade_dias,
      itens_precos: litens || [],
      aprovado_gestor: aprovadoCnpjDet !== null && _normCnpj(l.cnpj_fornecedor) === aprovadoCnpjDet
    });
  }
  return {
    id: req.id_sharepoint, unidade: req.unidade, solicitante: req.comprador, comprador: req.comprador,
    setor: req.setor, data: req.data_solicitacao, status: req.status,
    justificativa: req.justificativa, fornecedor: req.fornecedor, valor_fechado: req.valor_fechado,
    observacoes: req.observacoes, comprador_responsavel: req.comprador,
    preco_negociado_final:    req.preco_negociado_final    || null,
    desconto_comprador_tipo:  req.desconto_comprador_tipo  || null,
    desconto_comprador_valor: req.desconto_comprador_valor || null,
    aprovado_gestor_cnpj: req.aprovado_gestor_cnpj || null,
    itens: (itens || []).map(i => ({
      id: i.id, descricao: i.descricao, quantidade: i.quantidade,
      segmento: i.segmento_historico, unidade: i.unidade_medida || ''
    })),
    cotacoes, arquivos: arqs || [],
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
  const anoRef = new Date().getFullYear();
  const { data, error } = await _sb.from('contas_fixas')
    .select('*, lancamentos_cf(*)')
    .order('criado_em', { ascending: false });
  if (error) _err(error);
  return (data || []).map(c => {
    const lancsAno = (c.lancamentos_cf || []).filter(l => l.ano === anoRef);
    const pago_ano = lancsAno.reduce((s, l) => s + (l.valor || 0), 0);
    const pct_ano  = c.valor_anual > 0 ? (pago_ano / c.valor_anual) * 100 : 0;
    return { ...c, pago_ano, pct_ano };
  });
}

async function _criarContrato(body) {
  const { data, error } = await _sb.from('contas_fixas').insert({
    nome: body.nome, fornecedor: body.fornecedor, categoria: body.categoria,
    unidade: body.unidade, valor_anual: body.valor_anual, valor_mensal: body.valor_mensal,
    data_inicio: body.data_inicio, data_fim: body.data_fim,
    status: body.status || 'ativo', descricao: body.descricao,
    orcado_mensais: body.orcado_mensais || {}
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

async function _atualizarLancamento(id, body) {
  const fields = {};
  if (body.valor      !== undefined) fields.valor       = body.valor;
  if (body.mes        !== undefined) fields.mes         = body.mes;
  if (body.ano        !== undefined) fields.ano         = body.ano;
  if (body.tipo_doc   !== undefined) fields.tipo_doc    = body.tipo_doc;
  if (body.numero_doc !== undefined) fields.numero_doc  = body.numero_doc;
  if (body.obs        !== undefined) fields.obs         = body.obs;
  if (body.arquivo_path !== undefined) fields.arquivo_path = body.arquivo_path;
  if (body.arquivo_nome !== undefined) fields.arquivo_nome = body.arquivo_nome;
  const { error } = await _sb.from('lancamentos_cf').update(fields).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
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

// ── Requisições CRUD ───────────────────────────────────────
async function _filtrosRequisicoes() {
  const { data } = await _sb.from('requisicoes')
    .select('unidade, status, comprador').limit(2000);
  const unidades   = [...new Set((data || []).map(r => r.unidade).filter(Boolean))].sort();
  const statuses   = [...new Set((data || []).map(r => r.status).filter(Boolean))].sort();
  const compradores = [...new Set((data || []).map(r => r.comprador).filter(Boolean))].sort();
  return { unidades, statuses, compradores };
}

async function _listarRequisicoes(path) {
  const params    = new URLSearchParams(path.split('?')[1] || '');
  const page      = Math.max(1, parseInt(params.get('page') || '1'));
  const perPage   = Math.min(100, parseInt(params.get('per_page') || '20'));
  const status    = params.get('status');
  const unidade   = params.get('unidade');
  const comprador = params.get('comprador');
  const q         = params.get('q') || params.get('busca');
  const idReq     = params.get('id_req');
  const sortBy    = params.get('sort_by')    || 'id';
  const sortOrd   = params.get('sort_order') || 'desc';

  // Map frontend field names → DB column names
  const colMap = {
    id: 'id_sharepoint', valor: 'valor_fechado', comprador: 'comprador',
    unidade: 'unidade', status: 'status', data: 'data_solicitacao'
  };
  const col = colMap[sortBy] || 'id_sharepoint';

  let query = _sb.from('requisicoes')
    .select('id_sharepoint, unidade, setor, comprador, data_solicitacao, status, fornecedor, valor_fechado, itens_requisicao(descricao,quantidade)', { count: 'exact' })
    .order(col, { ascending: sortOrd === 'asc' })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status && status !== 'todos') {
    const statArr = status.split(',').map(s => s.trim()).filter(Boolean);
    if (statArr.includes('abertos')) {
      query = query.not('status', 'in', '("Concluído","Reprovado","Cancelado")');
    } else if (statArr.length === 1) {
      query = query.eq('status', statArr[0]);
    } else if (statArr.length > 1) {
      query = query.in('status', statArr);
    }
  }
  if (unidade) {
    const unArr = unidade.split(',').map(s => s.trim()).filter(Boolean);
    if (unArr.length === 1) query = query.eq('unidade', unArr[0]);
    else if (unArr.length > 1) query = query.in('unidade', unArr);
  }
  if (comprador) {
    const cArr = comprador.split(',').map(s => s.trim()).filter(Boolean);
    if (cArr.length === 1) query = query.eq('comprador', cArr[0]);
    else if (cArr.length > 1) query = query.in('comprador', cArr);
  }
  if (idReq && +idReq > 0) {
    query = query.eq('id_sharepoint', +idReq);
  } else if (q) {
    if (/^\d+$/.test(q)) {
      query = query.or(`id_sharepoint.eq.${+q},comprador.ilike.%${q}%,fornecedor.ilike.%${q}%`);
    } else {
      query = query.or(`comprador.ilike.%${q}%,fornecedor.ilike.%${q}%,unidade.ilike.%${q}%`);
    }
  }

  const { data, count, error } = await query;
  if (error) _err(error);
  const total = count || 0;

  return {
    total,
    pages: Math.max(1, Math.ceil(total / perPage)),
    items: (data || []).map(r => ({
      id:                    r.id_sharepoint,
      id_pedido:             r.id_sharepoint,
      id_sharepoint:         r.id_sharepoint,
      unidade:               r.unidade,
      setor:                 r.setor,
      solicitante:           r.comprador,
      comprador:             r.comprador,
      comprador_responsavel: null,
      data:                  r.data_solicitacao,
      status:                r.status,
      fornecedor:            r.fornecedor,
      valor:                 r.valor_fechado,
      valor_fechado:         r.valor_fechado,
      itens_count:           (r.itens_requisicao || []).length,
      itens_preview:         (r.itens_requisicao || []).slice(0, 2).map(i => `${i.quantidade}x ${i.descricao}`).join(', ')
    }))
  };
}

async function _requisicoesPorUnidade() {
  const [{ count: grandTotal }, { data, error }] = await Promise.all([
    _sb.from('requisicoes').select('*', { count: 'exact', head: true }),
    _sb.from('requisicoes')
      .select('unidade, status, valor_fechado, data_solicitacao, id_sharepoint, comprador')
      .order('id_sharepoint', { ascending: false })
      .limit(10000)
  ]);
  if (error) _err(error);
  const map = {};
  for (const r of (data || [])) {
    const u = r.unidade || 'Sem Unidade';
    if (!map[u]) map[u] = { unidade: u, total: 0, total_valor: 0, concluidos: 0, em_andamento: 0, reprovados: 0, recentes: [] };
    map[u].total++;
    // Sum ALL valor_fechado (POs emitidas), not only Concluído
    if (r.valor_fechado) map[u].total_valor += r.valor_fechado;
    if (r.status === 'Concluído') map[u].concluidos++;
    if (['Aguardando Cotação','Em Cotação','Aguardando Entrega','Recebido'].includes(r.status)) map[u].em_andamento++;
    if (r.status === 'Reprovado') map[u].reprovados++;
    // Map id_sharepoint → id so the template's r.id works correctly
    if (map[u].recentes.length < 3) map[u].recentes.push({
      id: r.id_sharepoint, comprador: r.comprador, status: r.status
    });
  }
  const units = Object.values(map).sort((a, b) => b.total - a.total);
  return { units, grand_total: grandTotal ?? units.reduce((a, u) => a + u.total, 0) };
}

async function _getRequisicao(id) {
  const { data: req, error } = await _sb.from('requisicoes')
    .select('*, itens_requisicao(*)').eq('id_sharepoint', id).single();
  if (error) _err(error);
  return {
    id: req.id_sharepoint, unidade: req.unidade, comprador: req.comprador,
    setor: req.setor, data: req.data_solicitacao, status: req.status,
    justificativa: req.justificativa, observacoes: req.observacoes,
    fornecedor: req.fornecedor, valor_fechado: req.valor_fechado,
    itens: (req.itens_requisicao || []).map(i => ({
      id: i.id, descricao: i.descricao, quantidade: i.quantidade, segmento: i.segmento_historico
    }))
  };
}

async function _atualizarRequisicao(id, body) {
  const { error } = await _sb.from('requisicoes').update(body).eq('id_sharepoint', id);
  if (error) _err(error);
  return { status: 'ok' };
}

async function _atualizarItensRequisicao(reqId, body) {
  const itens = body.itens || [];
  const results = await Promise.all(
    itens.map(it => _sb.from('itens_requisicao').update({ quantidade: it.quantidade }).eq('id', it.id))
  );
  const failed = results.find(r => r.error);
  if (failed) _err(failed.error);
  return { status: 'ok' };
}

async function _deletarRequisicao(id) {
  await Promise.all([
    _sb.from('itens_requisicao').delete().eq('id_requisicao', id),
    _sb.from('lances_fornecedor').delete().eq('id_requisicao', id),
    _sb.from('arquivos_requisicao').delete().eq('id_requisicao', id)
  ]);
  await _sb.from('requisicoes').delete().eq('id_sharepoint', id);
  return { status: 'ok' };
}

// ── Configurações ──────────────────────────────────────────
async function _configOpcoes() {
  const [{ data: orcs }, { data: cats }, { data: users }] = await Promise.all([
    _sb.from('orcamentos').select('unidade').order('unidade'),
    _sb.from('categorias').select('segmento').order('segmento'),
    _sb.from('usuarios').select('nome').eq('ativo', 1).order('nome')
  ]);
  const unidades  = [...new Set((orcs || []).map(o => o.unidade).filter(Boolean))].sort();
  const categorias = (cats || []).map(c => c.segmento).filter(Boolean);
  const gestores_sugestoes = (users || []).map(u => u.nome).filter(Boolean);
  return { unidades, categorias, gestores_sugestoes };
}

// ── Usuários CRUD ──────────────────────────────────────────
async function _verificarUsuario(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const email  = params.get('email') || '';
  if (!email) return { ativo: 0, nome: '', cargo: '' };
  const { data } = await _sb.from('usuarios')
    .select('id, nome, email, cargo, ativo, unidade')
    .ilike('email', email).maybeSingle();
  return {
    ativo:    data?.ativo   ?? 0,
    nome:     data?.nome    || '',
    cargo:    data?.cargo   || '',
    unidade:  data?.unidade || '',
    id:       data?.id      || null,
  };
}

async function _listarUsuarios() {
  const { data, error } = await _sb.from('usuarios')
    .select('*').order('nome');
  if (error) _err(error);
  return data || [];
}

async function _criarUsuario(body) {
  const { data, error } = await _sb.from('usuarios').insert({
    nome: body.nome, email: body.email, unidade: body.unidade || null,
    cargo: body.cargo || null, gestor_nome: body.gestor_nome || null,
    ativo: body.ativo ?? 1, solicitacao_pendente: 0
  }).select().single();
  if (error) _err(error);
  return data;
}

async function _atualizarUsuario(id, body) {
  const upd = {};
  if (body.nome        !== undefined) upd.nome        = body.nome;
  if (body.email       !== undefined) upd.email       = body.email;
  if (body.unidade     !== undefined) upd.unidade     = body.unidade;
  if (body.cargo       !== undefined) upd.cargo       = body.cargo;
  if (body.gestor_nome !== undefined) upd.gestor_nome = body.gestor_nome;
  if (body.ativo       !== undefined) upd.ativo       = body.ativo;
  const { error } = await _sb.from('usuarios').update(upd).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

async function _deletarUsuario(id) {
  await _sb.from('usuarios').delete().eq('id', id);
  return { status: 'ok' };
}

async function _rejeitarUsuario(id) {
  await _sb.from('usuarios').update({ ativo: 0, solicitacao_pendente: 0 }).eq('id', id);
  return { status: 'ok' };
}

// ── Compradores CRUD ───────────────────────────────────────
async function _atualizarComprador(id, body) {
  const { error } = await _sb.from('compradores_responsabilidade').update({
    comprador: body.comprador, email: body.email, unidade: body.unidade,
    categoria: body.categoria, prioridade: body.prioridade, ativo: body.ativo
  }).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

// ── Orçamento — excluir ────────────────────────────────────
async function _deletarOrcamento(unidade, ano) {
  await _sb.from('orcamentos').delete().eq('unidade', unidade).eq('ano', ano);
  return { status: 'ok' };
}

// ── Catálogo — helper: dois fetches separados (sem FK join) ──
// PostgREST só faz join automático se existir FK no schema do Supabase.
// Catálogo agora usa a view v_catalogo_itens (agregação server-side).
// Isso resolve o limite de 1000 linhas do PostgREST: a view retorna ~1 linha
// por item único (já agrupado), e a busca/paginação acontece no servidor.

async function _catalogoStats() {
  const [
    { count: totalItens },
    { count: totalReqs },
    { count: comPreco }
  ] = await Promise.all([
    _sb.from('v_catalogo_itens').select('*', { count: 'exact', head: true }),
    _sb.from('requisicoes').select('*', { count: 'exact', head: true }),
    _sb.from('v_catalogo_itens').select('*', { count: 'exact', head: true }).gt('preco_medio', 0)
  ]);
  const { data: segRows } = await _sb.from('v_catalogo_itens')
    .select('segmento')
    .not('segmento', 'is', null)
    .neq('segmento', '—')
    .limit(1000);
  const totalSegmentos = new Set((segRows || []).map(r => r.segmento)).size;
  return {
    total_itens:      totalItens  || 0,
    total_segmentos:  totalSegmentos,
    com_preco:        comPreco    || 0,
    total_requisicoes: totalReqs  || 0
  };
}

async function _catalogoLista(path) {
  const params  = new URLSearchParams(path.split('?')[1] || '');
  const page    = Math.max(1, parseInt(params.get('page') || '1'));
  const perPage = Math.min(100, parseInt(params.get('per_page') || '20'));
  const busca    = (params.get('busca') || '').trim();
  const segFilt  = (params.get('segmento') || '').trim();
  const comPreco = params.get('com_preco') === '1';
  const offset   = (page - 1) * perPage;

  // Build server-side query on the view — search, filter, sort and paginate in Postgres
  let q = _sb.from('v_catalogo_itens')
    .select('*', { count: 'exact' })
    .order('ultima_id', { ascending: false })
    .range(offset, offset + perPage - 1);
  if (busca)    q = q.ilike('descricao', `%${busca}%`);
  if (segFilt)  q = q.eq('segmento', segFilt);
  if (comPreco) q = q.gt('preco_medio', 0);

  // Segmentos for the dropdown (separate small query, no filter)
  const [{ data: rows, count, error }, { data: segRows }] = await Promise.all([
    q,
    _sb.from('v_catalogo_itens')
      .select('segmento')
      .not('segmento', 'is', null)
      .neq('segmento', '—')
      .order('segmento')
      .limit(500)
  ]);
  if (error) _err(error);

  const segmentos = [...new Set((segRows || []).map(r => r.segmento).filter(Boolean))].sort();
  const total  = count || 0;
  const pages  = Math.max(1, Math.ceil(total / perPage));

  return {
    total,
    pages,
    segmentos,
    items: (rows || []).map(i => ({
      descricao:          i.descricao,
      segmento:           i.segmento   || '—',
      total_requisicoes:  i.total_requisicoes,
      total_concluidos:   i.total_concluidos,
      total_fornecedores: i.total_fornecedores,
      preco_medio:        i.preco_medio ? parseFloat(i.preco_medio) : null,
      ultima_requisicao:  i.ultima_requisicao,
      ultima_id:          i.ultima_id
    }))
  };
}

async function _catalogoDetalhe(path) {
  const params    = new URLSearchParams(path.split('?')[1] || '');
  const descricao = params.get('descricao') || '';
  if (!descricao) return { historico: [] };

  // Two-step: fetch item rows then look up requisitions by id
  const { data: rows } = await _sb.from('itens_requisicao')
    .select('quantidade, id_requisicao')
    .eq('descricao', descricao)
    .order('id_requisicao', { ascending: false })
    .limit(100);

  const ids = [...new Set((rows || []).map(r => r.id_requisicao).filter(Boolean))];
  let reqMap = {};
  if (ids.length) {
    const { data: reqs } = await _sb.from('requisicoes')
      .select('id_sharepoint, status, data_solicitacao, comprador, fornecedor, valor_fechado')
      .in('id_sharepoint', ids);
    reqMap = Object.fromEntries((reqs || []).map(r => [r.id_sharepoint, r]));
  }

  const historico = (rows || []).map(i => {
    const req = reqMap[i.id_requisicao] || {};
    return {
      id:         req.id_sharepoint || i.id_requisicao,
      status:     req.status     || '—',
      data:       req.data_solicitacao || '—',
      comprador:  req.comprador  || '—',
      fornecedor: req.fornecedor || null,
      valor:      req.valor_fechado || null,
      quantidade: i.quantidade
    };
  });

  return { historico };
}

// ── Sourcing — segmentos ───────────────────────────────────
async function _sourcingSegmentos() {
  // Priority: return only segments that have at least one supplier linked
  const { data: links } = await _sb.from('fornecedores_segmentos').select('id_categoria').limit(2000);
  const linkedIds = [...new Set((links || []).map(l => l.id_categoria).filter(Boolean))];

  if (linkedIds.length) {
    const { data: cats } = await _sb.from('categorias')
      .select('segmento')
      .in('id', linkedIds)
      .order('segmento');
    const segs = [...new Set((cats || []).map(c => c.segmento).filter(Boolean))].sort();
    if (segs.length) return segs;
  }

  // Fallback: all categories (no suppliers linked yet)
  const { data } = await _sb.from('categorias').select('segmento').order('segmento');
  return (data || []).map(c => c.segmento).filter(Boolean);
}

// ── Contas Fixas — excluir lançamento ─────────────────────
async function _deletarLancamento(id) {
  const { data: lanc } = await _sb.from('lancamentos_cf').select('arquivo_path').eq('id', id).maybeSingle();
  if (lanc?.arquivo_path) {
    const filePath = lanc.arquivo_path.replace(/^.*\/object\/public\/uploads\//, '');
    await SbStorage.remove('uploads', filePath).catch(() => {});
  }
  await _sb.from('lancamentos_cf').delete().eq('id', id);
  return { status: 'ok' };
}

// ── Categorias CRUD ───────────────────────────────────────
async function _listarCategorias() {
  const { data, error } = await _sb.from('categorias').select('*').order('macro_categoria').order('segmento');
  if (error) _err(error);
  return data || [];
}

async function _criarCategoria(body) {
  const { data, error } = await _sb.from('categorias').insert({
    macro_categoria: body.macro_categoria,
    segmento: body.segmento
  }).select().single();
  if (error) _err(error);
  return data;
}

async function _atualizarCategoria(id, body) {
  const update = {};
  if (body.macro_categoria !== undefined) update.macro_categoria = body.macro_categoria;
  if (body.segmento        !== undefined) update.segmento        = body.segmento;
  const { error } = await _sb.from('categorias').update(update).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

async function _deletarCategoria(id) {
  const { error } = await _sb.from('categorias').delete().eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

// ── Segmentos de Compra ────────────────────────────────────
async function _listarSegmentosCompra() {
  const { data, error } = await _sb.from('segmentos_compra').select('id, nome, ativo, ordem').order('ordem').order('nome');
  if (error) _err(error);
  return data || [];
}
async function _criarSegmentoCompra(body) {
  const nome = (body.nome || '').trim().toUpperCase();
  if (!nome) throw new Error('Nome obrigatório');
  const { data, error } = await _sb.from('segmentos_compra').insert({ nome, ativo: true, ordem: body.ordem || 999 }).select().single();
  if (error) _err(error);
  return data;
}
async function _atualizarSegmentoCompra(id, body) {
  const upd = {};
  if (body.nome  !== undefined) upd.nome  = (body.nome || '').trim().toUpperCase();
  if (body.ativo !== undefined) upd.ativo = !!body.ativo;
  if (body.ordem !== undefined) upd.ordem = body.ordem;
  const { error } = await _sb.from('segmentos_compra').update(upd).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}
async function _deletarSegmentoCompra(id) {
  const { error } = await _sb.from('segmentos_compra').delete().eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

// ── Tipos de Despesa ───────────────────────────────────────
async function _listarTipoDespesa() {
  const { data, error } = await _sb.from('tipo_despesa').select('id, nome, ativo, ordem').order('ordem').order('nome');
  if (error) _err(error);
  return data || [];
}
async function _criarTipoDespesa(body) {
  const nome = (body.nome || '').trim().toUpperCase();
  if (!nome) throw new Error('Nome obrigatório');
  const { data, error } = await _sb.from('tipo_despesa').insert({ nome, ativo: true, ordem: body.ordem || 999 }).select().single();
  if (error) _err(error);
  return data;
}
async function _atualizarTipoDespesa(id, body) {
  const upd = {};
  if (body.nome  !== undefined) upd.nome  = (body.nome || '').trim().toUpperCase();
  if (body.ativo !== undefined) upd.ativo = !!body.ativo;
  if (body.ordem !== undefined) upd.ordem = body.ordem;
  const { error } = await _sb.from('tipo_despesa').update(upd).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}
async function _deletarTipoDespesa(id) {
  const { error } = await _sb.from('tipo_despesa').delete().eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

// ── Controle de Estoque ───────────────────────────────────
async function _listarEstoque() {
  const { data, error } = await _sb.from('controle_estoque').select('*').order('descricao');
  if (error) _err(error);
  return data || [];
}

async function _buscarEstoque(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const q = params.get('q') || '';
  const { data, error } = await _sb.from('controle_estoque')
    .select('id, descricao, saldo_atual, unidade_medida, estoque_minimo')
    .ilike('descricao', `%${q}%`)
    .order('descricao')
    .limit(5);
  if (error) _err(error);
  return data || [];
}

async function _catalogoItens(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const q = params.get('q') || '';
  const { data, error } = await _sb.from('catalogo_itens')
    .select('id, descricao, unidade, segmento')
    .ilike('descricao', `%${q}%`)
    .eq('ativo', true)
    .order('descricao')
    .limit(12);
  if (error) _err(error);
  return data || [];
}

async function _atualizarItemEstoque(id, body) {
  const update = {};
  if (body.descricao         !== undefined) update.descricao         = body.descricao;
  if (body.segmento          !== undefined) update.segmento          = body.segmento;
  if (body.unidade_operacional !== undefined) update.unidade_operacional = body.unidade_operacional;
  if (body.unidade_medida    !== undefined) update.unidade_medida    = body.unidade_medida;
  if (body.estoque_minimo    !== undefined) update.estoque_minimo    = body.estoque_minimo;
  const { error } = await _sb.from('controle_estoque').update(update).eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

async function _deletarItemEstoque(id) {
  const { error } = await _sb.from('controle_estoque').delete().eq('id', id);
  if (error) _err(error);
  return { status: 'ok' };
}

async function _movimentacoesItem(id) {
  const { data, error } = await _sb.from('movimentacoes_estoque')
    .select('*').eq('id_item', id).order('registrado_em', { ascending: false }).limit(100);
  if (error) _err(error);
  return data || [];
}

async function _entradaEstoque(body) {
  // Upsert item (create if doesn't exist)
  let itemId = body.id_item;
  if (!itemId && body.descricao) {
    const { data: existing } = await _sb.from('controle_estoque')
      .select('id, saldo_atual').ilike('descricao', body.descricao.trim()).maybeSingle();
    if (existing) {
      itemId = existing.id;
    } else {
      const { data: novoItem, error: errIns } = await _sb.from('controle_estoque').insert({
        descricao: body.descricao,
        segmento: body.segmento || null,
        unidade_operacional: body.unidade_operacional || null,
        unidade_medida: body.unidade_medida || 'un',
        saldo_atual: 0,
        estoque_minimo: body.estoque_minimo || 0
      }).select().single();
      if (errIns) _err(errIns);
      itemId = novoItem.id;
    }
  }
  const qtd = +body.quantidade;
  const { data: item, error: errFetch } = await _sb.from('controle_estoque')
    .select('saldo_atual').eq('id', itemId).single();
  if (errFetch) _err(errFetch);
  const novoSaldo = (item.saldo_atual || 0) + qtd;
  if (qtd > 0) {
    await _sb.from('controle_estoque').update({ saldo_atual: novoSaldo }).eq('id', itemId);
    await _sb.from('movimentacoes_estoque').insert({
      id_item: itemId, tipo: 'entrada', quantidade: qtd, saldo_apos: novoSaldo,
      id_requisicao: body.id_requisicao || null,
      fornecedor: body.fornecedor || null,
      valor_unitario: body.valor_unitario || null,
      observacoes: body.observacoes || null,
      registrado_por: body.registrado_por || null
    });
  }
  return { status: 'ok', id_item: itemId, saldo_apos: item.saldo_atual || 0 };
}

async function _saidaEstoque(body) {
  const itemId = body.id_item;
  const qtd = +body.quantidade;
  const { data: item, error } = await _sb.from('controle_estoque')
    .select('saldo_atual').eq('id', itemId).single();
  if (error) _err(error);
  const novoSaldo = Math.max(0, (item.saldo_atual || 0) - qtd);
  await _sb.from('controle_estoque').update({ saldo_atual: novoSaldo }).eq('id', itemId);
  await _sb.from('movimentacoes_estoque').insert({
    id_item: itemId, tipo: 'saida', quantidade: qtd, saldo_apos: novoSaldo,
    observacoes: body.observacoes || null,
    registrado_por: body.registrado_por || null
  });
  return { status: 'ok', saldo_apos: novoSaldo };
}

async function _ajusteEstoque(body) {
  const itemId = body.id_item;
  const novoSaldo = +body.saldo_novo;
  const { data: item, error } = await _sb.from('controle_estoque')
    .select('saldo_atual').eq('id', itemId).single();
  if (error) _err(error);
  const diff = novoSaldo - (item.saldo_atual || 0);
  await _sb.from('controle_estoque').update({ saldo_atual: novoSaldo }).eq('id', itemId);
  await _sb.from('movimentacoes_estoque').insert({
    id_item: itemId, tipo: 'ajuste', quantidade: diff, saldo_apos: novoSaldo,
    observacoes: body.observacoes || `Ajuste manual: ${diff >= 0 ? '+' : ''}${diff}`,
    registrado_por: body.registrado_por || null
  });
  return { status: 'ok', saldo_apos: novoSaldo };
}

// ── Portal fornecedor — minha cotação ─────────────────────
async function _minhaCotacao(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const idReq  = +params.get('id');
  const cnpj   = _normCnpj(params.get('cnpj') || '');
  if (!idReq || !cnpj) return null;
  const { data: lance } = await _sb.from('lances_fornecedor')
    .select('*').eq('id_requisicao', idReq).eq('cnpj_fornecedor', cnpj).maybeSingle();
  if (!lance) return null;
  // Busca itens individuais
  const { data: itens } = await _sb.from('lances_fornecedor_itens')
    .select('preco_unitario, descricao, quantidade').eq('id_lance', lance.id).order('id');
  lance.itens_precos = JSON.stringify((itens || []).map(i => i.preco_unitario));
  return lance;
}

// ── Cadastro de Fornecedor (portal) ───────────────────────
async function _getCadastroFornecedor(path) {
  const params = new URLSearchParams(path.split('?')[1] || '');
  const cnpj = _normCnpj(params.get('cnpj') || '');
  if (!cnpj) return null;
  const { data } = await _sb.from('fornecedores')
    .select('*')
    .eq('cnpj', cnpj).maybeSingle();
  return data || null;
}

// ── Atribuição de Comprador ────────────────────────────────
async function _listarPendentesAtribuicao() {
  const { data, error } = await _sb.from('requisicoes')
    .select('id_sharepoint, comprador, unidade, setor, data_solicitacao, status, justificativa, itens_requisicao(descricao, quantidade)')
    .eq('status', 'Aguardando Cotação')
    .order('id_sharepoint', { ascending: false });
  if (error) _err(error);
  return (data || []).map(r => ({
    id:         r.id_sharepoint,
    solicitante: r.comprador,
    comprador:  r.comprador,
    unidade:    r.unidade,
    setor:      r.setor,
    data:       r.data_solicitacao,
    justificativa: r.justificativa,
    itens:      (r.itens_requisicao || []).map(i => ({ descricao: i.descricao, quantidade: i.quantidade })),
  }));
}

async function _atribuirComprador(id, body) {
  if (!body.comprador) throw new Error('Comprador não informado');
  const { error } = await _sb.from('requisicoes')
    .update({ comprador: body.comprador, updated_at: new Date().toISOString() })
    .eq('id_sharepoint', id);
  if (error) _err(error);
  _logAtividade(id, `Comprador atribuído: ${body.comprador}`, body.comprador, null).catch(() => {});
  return { status: 'ok' };
}

async function _listarFornecedoresGestao(path) {
  const { data, error } = await _sb
    .from('fornecedores')
    .select('cnpj,razao_social,email,telefone,contato_comercial_email,contato_comercial_tel,contato_financeiro_email,contato_financeiro_tel,contato_fiscal_email,contato_fiscal_tel,segmentos_interesse,endereco_logradouro,endereco_numero,endereco_bairro,endereco_cidade,endereco_uf,cadastro_completo')
    .order('razao_social', { ascending: true })
    .limit(2000);
  if (error) _err(error);
  const fornecedores  = data || [];
  const total         = fornecedores.length;
  const cadastrados   = fornecedores.filter(f => f.cadastro_completo === true).length;
  return { fornecedores, total, cadastrados };
}

async function _salvarCadastroFornecedor(body) {
  const cnpj = _normCnpj(body.cnpj || '');
  if (!cnpj) throw new Error('CNPJ inválido');
  const payload = {
    cnpj,
    razao_social:              body.razao_social             || null,
    endereco_logradouro:       body.endereco_logradouro      || null,
    endereco_numero:           body.endereco_numero          || null,
    endereco_complemento:      body.endereco_complemento     || null,
    endereco_bairro:           body.endereco_bairro          || null,
    endereco_cidade:           body.endereco_cidade          || null,
    endereco_uf:               body.endereco_uf              || null,
    endereco_cep:              body.endereco_cep             || null,
    contato_comercial_email:   body.contato_comercial_email  || null,
    contato_comercial_tel:     body.contato_comercial_tel    || null,
    contato_financeiro_email:  body.contato_financeiro_email || null,
    contato_financeiro_tel:    body.contato_financeiro_tel   || null,
    contato_fiscal_email:      body.contato_fiscal_email     || null,
    contato_fiscal_tel:        body.contato_fiscal_tel       || null,
    segmentos_interesse:       body.segmentos_interesse      || [],
    doc_cartao_cnpj:           body.doc_cartao_cnpj          || null,
    doc_alvara_funcionamento:  body.doc_alvara_funcionamento || null,
    doc_alvara_sanitario:      body.doc_alvara_sanitario     || null,
    doc_iso_9001:              body.doc_iso_9001             || null,
    doc_ultima_alteracao:      body.doc_ultima_alteracao     || null,
    cadastro_completo: true,
    cadastrado_em: new Date().toISOString(),
    // Espelha nos campos legado (existem na tabela)
    email:    body.contato_comercial_email || null,
    telefone: body.contato_comercial_tel   || null,
  };
  const { data: existing } = await _sb.from('fornecedores').select('cnpj').eq('cnpj', cnpj).maybeSingle();
  if (existing) {
    const { error } = await _sb.from('fornecedores').update(payload).eq('cnpj', cnpj);
    if (error) _err(error);
  } else {
    const { error } = await _sb.from('fornecedores').insert(payload);
    if (error) _err(error);
  }
  // Sync junction table for segmentos
  if (body.segmentos_interesse?.length) {
    const { data: cats } = await _sb.from('categorias').select('id, segmento')
      .in('segmento', body.segmentos_interesse);
    await _sb.from('fornecedores_segmentos').delete().eq('cnpj_fornecedor', cnpj);
    if (cats && cats.length)
      await _sb.from('fornecedores_segmentos').insert(cats.map(c => ({ cnpj_fornecedor: cnpj, id_categoria: c.id })));
  }
  return { status: 'ok' };
}

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
