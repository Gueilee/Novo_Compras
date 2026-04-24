/* ── DASHBOARD PAGE ───────────────────────────────────────── */
window.Pages = window.Pages || {};

window.Pages.dashboard = {
  title:    'Dashboard Analítico',
  subtitle: 'Visão geral de compras',

  _filters: { unidade: '', period: '', mes: '' },
  _opts:    { unidades: [], anos: [] },

  /* ── RENDER ──────────────────────────────────────────────── */
  render() {
    return `
    <div class="page-fade-in">
      <div class="page-header">
        <div class="page-header-left">
          <h1 class="page-title">Dashboard Analítico</h1>
          <p class="page-subtitle">Visão geral de compras</p>
        </div>
        <div class="page-header-actions">
          <button class="btn btn-outline btn-sm" onclick="Pages.dashboard.reload()">
            <i class="fa-solid fa-rotate-right"></i> Atualizar
          </button>
          <button class="btn btn-primary btn-sm" onclick="App.navigate('intake')">
            <i class="fa-solid fa-plus"></i> Nova Requisição
          </button>
        </div>
      </div>

      <!-- ── FILTER BAR ──────────────────────────────────────── -->
      <div class="dash-filter-bar" id="dash-filter-bar">
        <div class="dash-filter-left">
          <i class="fa-solid fa-sliders" style="color:var(--brand);font-size:13px;"></i>
          <span class="dash-filter-label">Filtros:</span>

          <div class="dash-filter-group">
            <label class="dash-filter-lbl">Unidade</label>
            <select class="dash-filter-sel" id="df-unidade">
              <option value="">Todas as unidades</option>
            </select>
          </div>

          <div class="dash-filter-group">
            <label class="dash-filter-lbl">Ano</label>
            <select class="dash-filter-sel" id="df-period">
              <option value="">Todos os anos</option>
            </select>
          </div>

          <div class="dash-filter-group">
            <label class="dash-filter-lbl">Mês</label>
            <select class="dash-filter-sel" id="df-mes" style="min-width:130px;">
              <option value="">Todos os meses</option>
              <option value="01">Janeiro</option>
              <option value="02">Fevereiro</option>
              <option value="03">Março</option>
              <option value="04">Abril</option>
              <option value="05">Maio</option>
              <option value="06">Junho</option>
              <option value="07">Julho</option>
              <option value="08">Agosto</option>
              <option value="09">Setembro</option>
              <option value="10">Outubro</option>
              <option value="11">Novembro</option>
              <option value="12">Dezembro</option>
            </select>
          </div>

          <div id="dash-active-chips" style="display:flex;gap:6px;flex-wrap:wrap;"></div>
        </div>

        <div class="dash-filter-right">
          <button class="btn btn-primary btn-sm" id="dash-btn-filter">
            <i class="fa-solid fa-filter"></i> Aplicar
          </button>
          <button class="btn btn-outline btn-sm" id="dash-btn-clear">
            <i class="fa-solid fa-xmark"></i> Limpar
          </button>
        </div>
      </div>

      <!-- KPI Cards -->
      <div class="grid-4 mb-4" id="dash-kpis">
        ${Skeleton.kpiGrid(4)}
      </div>

      <!-- Charts Row 1 -->
      <div class="grid-2-1 section" id="dash-charts-row1">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title"><i class="fa-solid fa-chart-area"></i> Volume de Requisições</span>
            <span class="badge badge-brand text-xs" id="dash-sazon-badge">—</span>
          </div>
          <div class="chart-container" style="height:260px;">
            <canvas id="chartSazonalidade"></canvas>
          </div>
        </div>
        <div class="chart-card" style="display:flex;flex-direction:column;">
          <div class="chart-header">
            <span class="chart-title"><i class="fa-solid fa-list-check"></i> Status do Pipeline</span>
          </div>
          <div id="status-legend" style="overflow-y:auto;flex:1;padding-top:4px;"></div>
        </div>
      </div>

      <!-- Charts Row 2 -->
      <div class="grid-2 section">
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title"><i class="fa-solid fa-ranking-star"></i> Top Compradores</span>
          </div>
          <div class="chart-container" style="height:220px;">
            <canvas id="chartCompradores"></canvas>
          </div>
        </div>
        <div class="chart-card">
          <div class="chart-header">
            <span class="chart-title"><i class="fa-solid fa-building"></i> Requisições por Unidade</span>
          </div>
          <div class="chart-container" style="height:220px;">
            <canvas id="chartUnidades"></canvas>
          </div>
        </div>
      </div>

      <!-- Budget Overview -->
      <div class="section">
        <div class="section-header">
          <span class="section-title">
            <i class="fa-solid fa-sack-dollar"></i> Orçamento por Unidade
          </span>
        </div>
        <div class="budget-summary-grid" id="dash-budgets">
          ${Skeleton.list(2)}
        </div>
      </div>
    </div>

    <style>
    .dash-filter-bar {
      display:flex; align-items:center; justify-content:space-between;
      flex-wrap:wrap; gap:12px;
      background:#ffffff; border:1px solid var(--border);
      border-radius:var(--r-lg); padding:14px 20px;
      margin-bottom:22px;
      box-shadow:0 2px 8px rgba(0,0,0,.06);
    }
    .dash-filter-left  { display:flex; align-items:center; flex-wrap:wrap; gap:12px; flex:1; }
    .dash-filter-right { display:flex; gap:8px; flex-shrink:0; }
    .dash-filter-label { font-size:12px; font-weight:700; color:var(--text-muted); white-space:nowrap; }
    .dash-filter-group { display:flex; flex-direction:column; gap:3px; }
    .dash-filter-lbl   { font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; color:var(--text-subtle); }
    .dash-filter-sel   {
      height:32px; padding:0 10px; min-width:150px;
      background:var(--bg); border:1px solid var(--border);
      border-radius:var(--r-md); font-size:12.5px;
      font-family:var(--font); color:var(--text); outline:none;
      transition:border-color .15s;
    }
    .dash-filter-sel:focus { border-color:var(--brand); }
    .dash-chip {
      display:inline-flex; align-items:center; gap:5px;
      background:var(--brand-surface); color:var(--brand);
      border:1px solid var(--brand); border-radius:20px;
      padding:2px 10px; font-size:11px; font-weight:700;
    }
    .dash-chip button {
      background:none; border:none; cursor:pointer;
      color:var(--brand); padding:0; font-size:10px; line-height:1;
    }
    </style>`;
  },

  /* ── INIT ────────────────────────────────────────────────── */
  async init() {
    this._filters = { unidade: '', period: '', mes: '' };
    await this._loadData();
    this._bindFilters();
  },

  reload() {
    this._loadData();
  },

  async _loadData() {
    try {
      const p = new URLSearchParams({
        unidade: this._filters.unidade || '',
        period:  this._filters.period  || '',
        mes:     this._filters.mes     || '',
      });
      const dados = await Api.get(`/dashboard-dados?${p}`);

      // Populate filter dropdowns (first load)
      if (dados.opts) {
        this._opts = dados.opts;
        this._populateFilterSelects();
      }

      this._renderKPIs(dados);
      this._renderCharts(dados);
      this._renderActiveChips();
      await this._renderBudgets();
    } catch {
      Toast.error('Erro ao carregar dashboard', 'Verifique se a API está online.');
    }
  },

  /* ── FILTERS ─────────────────────────────────────────────── */
  _bindFilters() {
    const btnFilter = document.getElementById('dash-btn-filter');
    const btnClear  = document.getElementById('dash-btn-clear');
    if (btnFilter) btnFilter.addEventListener('click', () => this._applyFilters());
    if (btnClear)  btnClear.addEventListener('click',  () => this._clearFilters());
  },

  _applyFilters() {
    this._filters.unidade = document.getElementById('df-unidade')?.value || '';
    this._filters.period  = document.getElementById('df-period')?.value  || '';
    this._filters.mes     = document.getElementById('df-mes')?.value     || '';
    this._loadData();
  },

  _clearFilters() {
    this._filters = { unidade: '', period: '', mes: '' };
    const u = document.getElementById('df-unidade'); if (u) u.value = '';
    const p = document.getElementById('df-period');  if (p) p.value = '';
    const m = document.getElementById('df-mes');     if (m) m.value = '';
    this._renderActiveChips();
    this._loadData();
  },

  _populateFilterSelects() {
    const selU = document.getElementById('df-unidade');
    const selP = document.getElementById('df-period');
    if (selU && selU.options.length <= 1) {
      this._opts.unidades.forEach(u => {
        const o = document.createElement('option'); o.value = u; o.textContent = u; selU.appendChild(o);
      });
    }
    if (selP && selP.options.length <= 1) {
      this._opts.anos.forEach(a => {
        const o = document.createElement('option'); o.value = a; o.textContent = a; selP.appendChild(o);
      });
    }
    // Restore active selections
    if (this._filters.unidade && selU) selU.value = this._filters.unidade;
    if (this._filters.period  && selP) selP.value = this._filters.period;
    const selM = document.getElementById('df-mes');
    if (this._filters.mes && selM) selM.value = this._filters.mes;
  },

  _renderActiveChips() {
    const el = document.getElementById('dash-active-chips');
    if (!el) return;
    const chips = [];
    const MES_NOME = {
      '01':'Jan','02':'Fev','03':'Mar','04':'Abr','05':'Mai','06':'Jun',
      '07':'Jul','08':'Ago','09':'Set','10':'Out','11':'Nov','12':'Dez'
    };
    if (this._filters.unidade) chips.push(`<span class="dash-chip">${this._filters.unidade}<button onclick="Pages.dashboard._removeFilter('unidade')">✕</button></span>`);
    if (this._filters.period)  chips.push(`<span class="dash-chip">${this._filters.period}<button onclick="Pages.dashboard._removeFilter('period')">✕</button></span>`);
    if (this._filters.mes)     chips.push(`<span class="dash-chip">${MES_NOME[this._filters.mes] || this._filters.mes}<button onclick="Pages.dashboard._removeFilter('mes')">✕</button></span>`);
    el.innerHTML = chips.join('');
  },

  _removeFilter(key) {
    this._filters[key] = '';
    const map = { unidade: 'df-unidade', period: 'df-period', mes: 'df-mes' };
    const el = document.getElementById(map[key]); if (el) el.value = '';
    this._renderActiveChips();
    this._loadData();
  },

  /* ── KPI CARDS ───────────────────────────────────────────── */
  _renderKPIs(dados) {
    const total      = dados.kpis.total_pedidos;
    const gasto      = dados.kpis.total_gasto;
    const concluidos = (dados.status || []).filter(s => s.status?.toLowerCase().includes('concluí')).reduce((a, b) => a + b.qtd, 0);
    const taxaConc   = total > 0 ? ((concluidos / total) * 100).toFixed(0) : 0;
    const pendAprov  = (dados.status || []).filter(s => s.status?.includes('Aprovação')).reduce((a, b) => a + b.qtd, 0);

    const kpiEl = document.getElementById('dash-kpis');
    kpiEl.innerHTML = `
      <div class="kpi-card kpi-card-clickable" data-kpi="invest">
        <div class="kpi-card-top">
          <div class="kpi-icon-box kpi-icon-brand"><i class="fa-solid fa-sack-dollar"></i></div>
          <span class="kpi-trend-tag kpi-trend-neu"><i class="fa-solid fa-calendar-days"></i> 2025-2026</span>
        </div>
        <div class="kpi-value">${Fmt.currency(gasto)}</div>
        <div class="kpi-label">Investimento Total (POs emitidas)</div>
        <div class="kpi-meta"><span class="kpi-drill"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ver requisições</span></div>
      </div>
      <div class="kpi-card kpi-card-clickable" data-kpi="total">
        <div class="kpi-card-top">
          <div class="kpi-icon-box kpi-icon-accent"><i class="fa-solid fa-file-invoice"></i></div>
          <span class="kpi-trend-tag kpi-trend-up"><i class="fa-solid fa-arrow-up"></i> +${Fmt.number(total)}</span>
        </div>
        <div class="kpi-value">${Fmt.number(total)}</div>
        <div class="kpi-label">Total de Requisições</div>
        <div class="kpi-meta">
          <i class="fa-solid fa-circle-check text-success"></i> ${concluidos} concluídas
          <span class="kpi-drill"><i class="fa-solid fa-arrow-up-right-from-square"></i> Ver lista</span>
        </div>
      </div>
      <div class="kpi-card kpi-card-clickable" data-kpi="taxa">
        <div class="kpi-card-top">
          <div class="kpi-icon-box kpi-icon-success"><i class="fa-solid fa-percent"></i></div>
          <span class="kpi-trend-tag ${taxaConc >= 70 ? 'kpi-trend-up' : 'kpi-trend-neu'}">${taxaConc}% concluídas</span>
        </div>
        <div class="kpi-value">${taxaConc}%</div>
        <div class="kpi-label">Taxa de Conclusão</div>
        <div class="kpi-meta">
          <i class="fa-solid fa-hourglass-half text-muted"></i> ${pendAprov} aguardando aprovação
          <span class="kpi-drill"><i class="fa-solid fa-arrow-up-right-from-square"></i> Em aberto</span>
        </div>
      </div>
      <div class="kpi-card kpi-card-clickable" data-kpi="unidades">
        <div class="kpi-card-top">
          <div class="kpi-icon-box kpi-icon-warning"><i class="fa-solid fa-building"></i></div>
          <span class="kpi-trend-tag kpi-trend-neu">Ativos</span>
        </div>
        <div class="kpi-value">${dados.unidades?.length || 0}</div>
        <div class="kpi-label">Unidades Operacionais</div>
        <div class="kpi-meta">
          <i class="fa-solid fa-building text-muted"></i> ${(dados.unidades || []).map(u => u.unidade).join(', ')}
          <span class="kpi-drill"><i class="fa-solid fa-arrow-up-right-from-square"></i> Por unidade</span>
        </div>
      </div>
    `;

    kpiEl.querySelectorAll('[data-kpi]').forEach(card => {
      card.addEventListener('click', () => {
        const kpi = card.dataset.kpi;
        if (kpi === 'taxa')          window.Pages.pedidos._initialFilter = { status: 'abertos' };
        else if (kpi === 'unidades') window.Pages.pedidos._initialFilter = { mode: 'unidades' };
        else                         window.Pages.pedidos._initialFilter = {};
        App.navigate('pedidos');
      });
    });
  },

  /* ── CHARTS ──────────────────────────────────────────────── */
  _renderCharts(dados) {
    Chart.defaults.font.family = "'Inter', sans-serif";
    Chart.defaults.color = '#888899';

    const DL = window.ChartDataLabels; // from CDN

    /* helper: destroy existing chart on canvas */
    const destroy = id => {
      const c = Chart.getChart(id);
      if (c) c.destroy();
    };

    /* ── 1. Volume de Requisições (line) ───────────────────── */
    destroy('chartSazonalidade');
    const ctxS = document.getElementById('chartSazonalidade');
    if (ctxS) {
      // Convert "MM/YYYY" labels to "Mmm/YY" for display
      const MES = ['','Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
      const fmtMes = str => {
        if (!str || str === 'Sem Data') return str;
        const [mm, yyyy] = str.split('/');
        return `${MES[parseInt(mm)] || mm}/${yyyy?.slice(2) || ''}`;
      };
      const labels = dados.sazonalidade.map(d => fmtMes(d.mes));
      const values = dados.sazonalidade.map(d => d.qtd);

      // Update badge
      const badge = document.getElementById('dash-sazon-badge');
      if (badge) badge.textContent = `${labels.length} período${labels.length !== 1 ? 's' : ''}`;

      new Chart(ctxS, {
        type: 'line',
        plugins: DL ? [DL] : [],
        data: {
          labels,
          datasets: [{
            label: 'Requisições',
            data: values,
            borderColor: '#422c76',
            backgroundColor: ctx => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
              g.addColorStop(0, 'rgba(66,44,118,0.20)');
              g.addColorStop(1, 'rgba(66,44,118,0.01)');
              return g;
            },
            borderWidth: 2.5, fill: true, tension: 0.4,
            pointBackgroundColor: '#422c76',
            pointRadius: 4, pointHoverRadius: 7,
            pointBorderColor: '#fff', pointBorderWidth: 2,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 24 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(18,8,42,0.88)',
              padding: 12, cornerRadius: 10,
              bodyColor: '#ddd', titleColor: '#fff'
            },
            datalabels: DL ? {
              anchor: 'end', align: 'top',
              formatter: v => v,
              color: '#422c76',
              font: { weight: '700', size: 11 },
              display: ctx => ctx.dataset.data[ctx.dataIndex] > 0,
            } : false,
          },
          scales: {
            x: { grid: { display: false }, border: { display: false },
                 ticks: { font: { size: 11 }, maxRotation: 0, autoSkip: true, maxTicksLimit: 14 }},
            y: { display: false, beginAtZero: true }
          }
        }
      });
    }

    /* ── 2. Status do Pipeline (lista) ─────────────────────── */
    const legendEl = document.getElementById('status-legend');
    if (legendEl) {
      const palette = ['#422c76','#01E18E','#ff2f69','#f59e0b','#3B82F6','#8B5CF6','#414042','#64748b','#e879f9','#34d399','#fb7185','#fbbf24'];
      const allStatus = dados.status || [];
      const total = allStatus.reduce((a, s) => a + s.qtd, 0);
      legendEl.innerHTML = allStatus.map((s, i) => {
        const pct = total > 0 ? ((s.qtd / total) * 100).toFixed(1) : 0;
        return `
          <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid var(--border-subtle);">
            <span style="width:9px;height:9px;border-radius:50%;background:${palette[i % palette.length]};flex-shrink:0;"></span>
            <span style="color:var(--text);flex:1;font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${s.status}</span>
            <span style="font-size:11.5px;color:var(--text-muted);min-width:38px;text-align:right;">${pct}%</span>
            <span style="font-weight:700;color:var(--text);font-size:13px;min-width:30px;text-align:right;">${s.qtd}</span>
          </div>`;
      }).join('');
    }

    /* ── 3. Top Compradores (horizontal bar) ───────────────── */
    destroy('chartCompradores');
    const ctxC = document.getElementById('chartCompradores');
    if (ctxC) {
      const maxVal = Math.max(...dados.compradores.map(d => d.qtd), 1);
      new Chart(ctxC, {
        type: 'bar',
        plugins: DL ? [DL] : [],
        data: {
          labels: dados.compradores.map(d => d.nome),
          datasets: [{
            data: dados.compradores.map(d => d.qtd),
            backgroundColor: ctx => {
              const v = ctx.dataset.data[ctx.dataIndex] / maxVal;
              const alpha = 0.5 + v * 0.5;
              return `rgba(66,44,118,${alpha})`;
            },
            borderRadius: 5,
            borderSkipped: false,
          }]
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          layout: { padding: { right: 36 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(18,8,42,0.88)', padding: 12, cornerRadius: 10
            },
            datalabels: DL ? {
              anchor: 'end', align: 'right',
              formatter: v => v,
              color: '#422c76',
              font: { weight: '700', size: 12 },
            } : false,
          },
          scales: {
            x: { display: false },
            y: { grid: { display: false }, border: { display: false },
                 ticks: { font: { size: 12 } }}
          }
        }
      });
    }

    /* ── 4. Requisições por Unidade (vertical bar) ─────────── */
    destroy('chartUnidades');
    const ctxU = document.getElementById('chartUnidades');
    if (ctxU) {
      const palU = ['#ff2f69','#01E18E','#422c76','#f59e0b','#3B82F6','#8B5CF6'];
      new Chart(ctxU, {
        type: 'bar',
        plugins: DL ? [DL] : [],
        data: {
          labels: dados.unidades.map(d => d.unidade),
          datasets: [{
            data: dados.unidades.map(d => d.qtd),
            backgroundColor: dados.unidades.map((_, i) => palU[i % palU.length]),
            borderRadius: 8,
            barPercentage: 0.55,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          layout: { padding: { top: 28 } },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: 'rgba(18,8,42,0.88)', padding: 12, cornerRadius: 10
            },
            datalabels: DL ? {
              anchor: 'end', align: 'top',
              formatter: v => v,
              color: ctx => palU[ctx.dataIndex % palU.length],
              font: { weight: '700', size: 13 },
            } : false,
          },
          scales: {
            y: { display: false },
            x: {
              grid: { display: false }, border: { display: false },
              ticks: {
                font: { size: 12 }, maxRotation: 0, autoSkip: false,
                callback: (_, i, ticks) => {
                  // Wrap long labels
                  const lbl = dados.unidades[i]?.unidade || '';
                  return lbl.length > 10 ? lbl.match(/.{1,10}/g) : lbl;
                }
              }
            }
          }
        }
      });
    }
  },

  /* ── BUDGETS ─────────────────────────────────────────────── */
  async _renderBudgets() {
    const anoAtual = new Date().getFullYear();
    let html = '';
    try {
      // Busca todos os orçamentos cadastrados e filtra pelo ano corrente
      const resp = await Api.get('/api/orcamentos');
      const deste_ano = (resp.orcamentos || []).filter(o => Number(o.ano) === anoAtual);

      for (const orc of deste_ano) {
        const total    = orc.orcamento_anual || 0;
        const consumido = orc.consumido || 0;
        const saldo    = total - consumido;
        const pct      = total > 0 ? (consumido / total) * 100 : 0;
        const color    = pct > 90 ? 'var(--accent)' : pct > 75 ? 'var(--brand-light)' : 'var(--success)';
        const cls      = pct > 90 ? 'danger' : pct > 75 ? 'caution' : 'safe';
        html += `
          <div class="budget-unit-card">
            <div class="budget-unit-header">
              <div>
                <div class="budget-unit-name">${orc.unidade}</div>
                <div class="text-sm text-muted">Orçamento Anual ${anoAtual}</div>
              </div>
              <div class="budget-unit-pct" style="color:${color};">${Fmt.pct(pct)}</div>
            </div>
            <div class="progress-wrap">
              <div class="progress-header">
                <span class="text-sm font-semi">${Fmt.currency(consumido)}</span>
                <span class="text-sm text-muted">de ${Fmt.currency(total)}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill ${cls}" style="width:${Math.min(pct,100)}%;"></div>
              </div>
              <div class="text-xs text-muted mt-1">
                Saldo disponível: <strong style="color:${color};">${Fmt.currency(saldo)}</strong>
              </div>
            </div>
          </div>`;
      }
    } catch {}

    const el = document.getElementById('dash-budgets');
    if (el) el.innerHTML = html || `
      <div class="empty-state">
        <div class="empty-icon"><i class="fa-solid fa-wallet"></i></div>
        <p class="empty-title">Sem dados de orçamento cadastrados para ${anoAtual}</p>
      </div>`;
  }
};
