/* ============================================================
   SHP — HOME.JS
   Central launchpad for the purchasing team
   ============================================================ */

window.Pages = window.Pages || {};

window.Pages.home = {
  title: 'Home',

  _pendingData: { aprovacoes: 0, sourcing: 0, contratos_vencendo: 0 },

  render() {
    const hour    = new Date().getHours();
    const greet   = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite';
    const todayFmt = new Date().toLocaleDateString('pt-BR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    // Capitalise first letter
    const today = todayFmt.charAt(0).toUpperCase() + todayFmt.slice(1);

    return `
      <div class="home-root">

        <!-- ══════ HERO ══════════════════════════════════════════ -->
        <div class="home-hero">
          <div class="home-hero-bg"></div>
          <div class="home-hero-content">
            <div class="home-hero-left">
              <div class="home-hero-greeting">${greet}, Gueilee</div>
              <div class="home-hero-date">
                <i class="fa-regular fa-calendar"></i> ${today}
              </div>
              <div class="home-hero-tagline">
                Seu painel de controle de compras está pronto.
              </div>
            </div>
            <div class="home-hero-right">
              <div class="home-kpi-pill" id="hkpi-aprovacoes" onclick="App.navigate('aprovacoes')">
                <div class="home-kpi-pill-icon" style="background:rgba(255,47,105,.18);">
                  <i class="fa-solid fa-user-shield" style="color:#ff2f69;"></i>
                </div>
                <div>
                  <div class="home-kpi-pill-num" id="hkpi-num-aprov">—</div>
                  <div class="home-kpi-pill-lbl">Aprovações pendentes</div>
                </div>
              </div>
              <div class="home-kpi-pill" id="hkpi-sourcing" onclick="App.navigate('sourcing')">
                <div class="home-kpi-pill-icon" style="background:rgba(1,225,142,.18);">
                  <i class="fa-solid fa-magnifying-glass-chart" style="color:#01E18E;"></i>
                </div>
                <div>
                  <div class="home-kpi-pill-num" id="hkpi-num-sour">—</div>
                  <div class="home-kpi-pill-lbl">Pedidos para cotar</div>
                </div>
              </div>
              <div class="home-kpi-pill" id="hkpi-contratos" onclick="App.navigate('contratos')">
                <div class="home-kpi-pill-icon" style="background:rgba(245,158,11,.18);">
                  <i class="fa-solid fa-calendar-check" style="color:#F59E0B;"></i>
                </div>
                <div>
                  <div class="home-kpi-pill-num" id="hkpi-num-cont" style="font-size:13px;">Contas</div>
                  <div class="home-kpi-pill-lbl">Fixas & Contratos</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ══════ BODY ══════════════════════════════════════════ -->
        <div class="home-body">

          <!-- ── LEFT: module cards ───────────────────────────── -->
          <div class="home-modules">
            <div class="home-section-title">Módulos do Sistema</div>
            <div class="home-module-grid">

              ${this._moduleCard({
                id: 'dashboard',
                icon: 'fa-chart-pie',
                color: '#422c76',
                bg: 'rgba(66,44,118,0.10)',
                title: 'Dashboard Analítico',
                desc: 'KPIs, gráficos de gasto, evolução orçamentária e análise por centro de custo.',
                tag: 'Inteligência & Dados',
              })}

              ${this._moduleCard({
                id: 'intake',
                icon: 'fa-file-invoice',
                color: '#3B82F6',
                bg: 'rgba(59,130,246,0.10)',
                title: 'Nova Requisição',
                desc: 'Abra uma solicitação de compra com múltiplos itens, centro de custo e justificativa.',
                tag: 'Operação de Compras',
                action: 'Criar Requisição',
              })}

              ${this._moduleCard({
                id: 'aprovacoes',
                icon: 'fa-user-shield',
                color: '#ff2f69',
                bg: 'rgba(255,47,105,0.10)',
                title: 'Painel de Requisições',
                desc: 'Aprove ou reprove requisições pendentes, com visibilidade total do fluxo.',
                tag: 'Operação de Compras',
                badgeId: 'home-badge-aprovacoes',
              })}

              ${this._moduleCard({
                id: 'sourcing',
                icon: 'fa-magnifying-glass-chart',
                color: '#01E18E',
                bg: 'rgba(1,225,142,0.10)',
                title: 'Fornecedores & Cotação',
                desc: 'Pesquise fornecedores, envie RFQs e compare propostas lado a lado.',
                tag: 'Operação de Compras',
                badgeId: 'home-badge-sourcing',
              })}

              ${this._moduleCard({
                id: 'recebimento',
                icon: 'fa-boxes-stacked',
                color: '#0EA5E9',
                bg: 'rgba(14,165,233,0.10)',
                title: 'Conciliação',
                desc: 'Valide o recebimento cruzando PO, nota fiscal e entrada física de mercadorias.',
                tag: 'Operação de Compras',
              })}

              ${this._moduleCard({
                id: 'catalogo',
                icon: 'fa-book-open',
                color: '#8B5CF6',
                bg: 'rgba(139,92,246,0.10)',
                title: 'Catálogo de Itens',
                desc: 'Itens padronizados com especificações técnicas e histórico de preços.',
                tag: 'Compras Estratégicas',
              })}

              ${this._moduleCard({
                id: 'contratos',
                icon: 'fa-calendar-check',
                color: '#F59E0B',
                bg: 'rgba(245,158,11,0.10)',
                title: 'Gestão de Contas Fixas',
                desc: 'Contratos anuais recorrentes: aluguel, limpeza, jardinagem. Concilie NFs e boletos mensalmente.',
                tag: 'Compras Estratégicas',
              })}

              ${this._moduleCard({
                id: 'consulta',
                icon: 'fa-magnifying-glass-arrow-right',
                color: '#06B6D4',
                bg: 'rgba(6,182,212,0.10)',
                title: 'Consulta de Requisições',
                desc: 'Busque qualquer requisição pelo ID e veja todos os detalhes: itens, cotações e arquivos anexados.',
                tag: 'Compras Estratégicas',
                action: 'Consultar',
              })}

              <!-- Portal Fornecedor (external) -->
              <div class="home-module-card home-module-external"
                   onclick="window.open('fornecedor.html','_blank')">
                <div class="home-module-card-inner">
                  <div class="home-module-icon" style="background:rgba(100,116,139,0.10);">
                    <i class="fa-solid fa-building-user" style="color:#64748B;"></i>
                  </div>
                  <div class="home-module-body">
                    <div class="home-module-tag">Acesso Externo</div>
                    <div class="home-module-title">
                      Portal do Fornecedor
                      <i class="fa-solid fa-arrow-up-right-from-square" style="font-size:10px;opacity:.5;margin-left:6px;"></i>
                    </div>
                    <div class="home-module-desc">Área exclusiva para fornecedores responderem cotações e acompanharem pedidos.</div>
                  </div>
                  <div class="home-module-cta">Abrir <i class="fa-solid fa-arrow-right"></i></div>
                </div>
              </div>

            </div>
          </div>

          <!-- ── RIGHT: activity feed ─────────────────────────── -->
          <div class="home-sidebar">

            <!-- Activity Feed — ocupa o espaço restante -->
            <div class="home-widget home-widget-feed">
              <div class="home-widget-title">
                <i class="fa-solid fa-clock-rotate-left"></i> Atividade Recente
                <button onclick="Pages.home._loadFeed()" title="Atualizar"
                        style="margin-left:auto;background:none;border:none;cursor:pointer;color:var(--text-muted);font-size:12px;padding:2px 4px;border-radius:4px;"
                        onmouseenter="this.style.color='var(--brand)'" onmouseleave="this.style.color='var(--text-muted)'">
                  <i class="fa-solid fa-rotate-right"></i>
                </button>
              </div>
              <div class="home-feed" id="home-feed">
                ${this._feedSkeleton()}
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>
      /* ── Home Root ─────────────────────────────────────────── */
      .home-root {
        display: flex;
        flex-direction: column;
        gap: 0;
        height: 100%;
        background: var(--bg);
      }

      /* ── Hero ──────────────────────────────────────────────── */
      .home-hero {
        position: relative;
        overflow: hidden;
        padding: 36px 36px 40px;
        flex-shrink: 0;
      }
      .home-hero-bg {
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, #2a1a52 0%, #422c76 45%, #6b1d54 75%, #9e1b46 100%);
        z-index: 0;
      }
      .home-hero-bg::before {
        content: '';
        position: absolute;
        inset: 0;
        background:
          radial-gradient(ellipse 60% 80% at 80% 50%, rgba(255,47,105,.18) 0%, transparent 70%),
          radial-gradient(ellipse 40% 60% at 20% 0%,  rgba(1,225,142,.10) 0%, transparent 60%);
      }
      .home-hero-bg::after {
        content: '';
        position: absolute;
        bottom: -1px; left: 0; right: 0;
        height: 32px;
        background: var(--bg);
        clip-path: ellipse(55% 100% at 50% 100%);
      }
      .home-hero-content {
        position: relative;
        z-index: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 32px;
        flex-wrap: wrap;
      }
      .home-hero-greeting {
        font-size: 28px;
        font-weight: 800;
        color: #fff;
        letter-spacing: -0.5px;
        line-height: 1.1;
      }
      .home-hero-date {
        font-size: 13px;
        color: rgba(255,255,255,.6);
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .home-hero-tagline {
        font-size: 14px;
        color: rgba(255,255,255,.45);
        margin-top: 10px;
        font-style: italic;
      }
      .home-hero-right {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
      .home-kpi-pill {
        background: rgba(255,255,255,.08);
        border: 1px solid rgba(255,255,255,.12);
        backdrop-filter: blur(8px);
        border-radius: 14px;
        padding: 14px 20px;
        display: flex;
        align-items: center;
        gap: 14px;
        cursor: pointer;
        transition: background .2s, transform .15s;
        min-width: 175px;
      }
      .home-kpi-pill:hover {
        background: rgba(255,255,255,.15);
        transform: translateY(-2px);
      }
      .home-kpi-pill-icon {
        width: 40px; height: 40px;
        border-radius: 10px;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
        flex-shrink: 0;
      }
      .home-kpi-pill-num {
        font-size: 22px;
        font-weight: 800;
        color: #fff;
        line-height: 1;
      }
      .home-kpi-pill-lbl {
        font-size: 11px;
        color: rgba(255,255,255,.55);
        margin-top: 3px;
        white-space: nowrap;
      }

      /* ── Body layout ───────────────────────────────────────── */
      .home-body {
        display: flex;
        gap: 24px;
        padding: 24px 36px 28px;
        flex: 1;
        min-height: 0;
        align-items: stretch;
      }
      .home-modules { flex: 1; min-width: 0; }
      .home-sidebar {
        width: 300px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        gap: 16px;
        min-height: 0;
      }
      /* Feed ocupa o espaço restante da sidebar */
      .home-widget-feed {
        flex: 1;
        min-height: 0;
        overflow: hidden;
      }

      /* ── Section titles ────────────────────────────────────── */
      .home-section-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        color: var(--text-muted);
        margin-bottom: 14px;
      }

      /* ── Module cards grid ─────────────────────────────────── */
      .home-module-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 14px;
      }
      .home-module-card {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        cursor: pointer;
        transition: box-shadow .2s, transform .15s, border-color .2s;
        overflow: hidden;
      }
      .home-module-card:hover {
        box-shadow: 0 8px 24px rgba(0,0,0,.10);
        transform: translateY(-3px);
        border-color: var(--brand);
      }
      .home-module-card-inner {
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        height: 100%;
      }
      .home-module-icon {
        width: 44px; height: 44px;
        border-radius: 12px;
        display: flex; align-items: center; justify-content: center;
        font-size: 18px;
        flex-shrink: 0;
      }
      .home-module-body { flex: 1; }
      .home-module-tag {
        font-size: 10px;
        font-weight: 600;
        letter-spacing: .07em;
        text-transform: uppercase;
        color: var(--text-subtle);
        margin-bottom: 4px;
      }
      .home-module-title {
        font-size: 14px;
        font-weight: 700;
        color: var(--text);
        margin-bottom: 6px;
        line-height: 1.2;
      }
      .home-module-desc {
        font-size: 12px;
        color: var(--text-muted);
        line-height: 1.5;
      }
      .home-module-cta {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        font-weight: 600;
        color: var(--brand);
        opacity: 0;
        transform: translateX(-4px);
        transition: opacity .2s, transform .2s;
      }
      .home-module-card:hover .home-module-cta {
        opacity: 1;
        transform: translateX(0);
      }
      .home-module-badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 20px;
        height: 20px;
        padding: 0 6px;
        border-radius: 10px;
        background: var(--accent);
        color: #fff;
        font-size: 11px;
        font-weight: 700;
        margin-left: 6px;
        vertical-align: middle;
      }
      .home-module-badge.hidden { display: none; }
      .home-module-external { opacity: .8; }
      .home-module-external:hover { opacity: 1; }

      /* ── Right sidebar widgets ─────────────────────────────── */
      .home-widget {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 16px;
        padding: 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .home-widget-title {
        font-size: 12px;
        font-weight: 700;
        color: var(--text-muted);
        text-transform: uppercase;
        letter-spacing: .07em;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .home-widget-title i { color: var(--brand); }

      /* Activity feed */
      .home-feed {
        display: flex;
        flex-direction: column;
        gap: 2px;
        overflow-y: auto;
        flex: 1;
        min-height: 0;
      }
      .home-feed-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-subtle);
      }
      .home-feed-item:last-child { border-bottom: none; }
      .home-feed-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        margin-top: 4px;
        flex-shrink: 0;
      }
      .home-feed-text {
        font-size: 12px;
        color: var(--text);
        line-height: 1.4;
        flex: 1;
      }
      .home-feed-time {
        font-size: 10.5px;
        color: var(--text-subtle);
        white-space: nowrap;
        flex-shrink: 0;
      }

      /* (tip card removed) */

      /* Skeleton lines for feed */
      .home-feed-skel {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 0;
        border-bottom: 1px solid var(--border-subtle);
      }
      </style>
    `;
  },

  _moduleCard({ id, icon, color, bg, title, desc, tag, action, badgeId }) {
    const badgeHtml = badgeId
      ? `<span class="home-module-badge hidden" id="${badgeId}">0</span>`
      : '';
    return `
      <div class="home-module-card" onclick="App.navigate('${id}')">
        <div class="home-module-card-inner">
          <div class="home-module-icon" style="background:${bg};">
            <i class="fa-solid ${icon}" style="color:${color};"></i>
          </div>
          <div class="home-module-body">
            <div class="home-module-tag">${tag}</div>
            <div class="home-module-title">${title}${badgeHtml}</div>
            <div class="home-module-desc">${desc}</div>
          </div>
          <div class="home-module-cta">${action || 'Acessar'} <i class="fa-solid fa-arrow-right"></i></div>
        </div>
      </div>
    `;
  },

  _feedSkeleton() {
    return Array(4).fill(0).map(() => `
      <div class="home-feed-skel">
        <div class="skeleton" style="width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0;"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:5px;">
          <div class="skeleton skeleton-line" style="width:85%;height:11px;border-radius:4px;"></div>
          <div class="skeleton skeleton-line" style="width:40%;height:9px;border-radius:4px;"></div>
        </div>
      </div>
    `).join('');
  },

  async init() {
    // Load pending counts
    try {
      const [aprovs, sour] = await Promise.allSettled([
        Api.get('/api/aprovacoes/pendentes'),
        Api.get('/api/sourcing/pedidos-aprovados'),
      ]);

      const nAprov = aprovs.status === 'fulfilled' ? (aprovs.value.pedidos?.length || 0) : 0;
      const nSour  = sour.status  === 'fulfilled' ? (sour.value?.length || 0) : 0;

      this._setKpi('hkpi-num-aprov', nAprov);
      this._setKpi('hkpi-num-sour',  nSour);

      const bAprov = document.getElementById('home-badge-aprovacoes');
      if (bAprov) { bAprov.textContent = nAprov; bAprov.classList.toggle('hidden', nAprov === 0); }
      const bSour = document.getElementById('home-badge-sourcing');
      if (bSour) { bSour.textContent = nSour; bSour.classList.toggle('hidden', nSour === 0); }

    } catch { /* silently ignore — counters stay at — */ }

    // Load activity feed
    this._loadFeed();
  },

  _setKpi(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  async _loadFeed() {
    const feed = document.getElementById('home-feed');
    if (!feed) return;

    feed.innerHTML = this._feedSkeleton();

    try {
      const eventos = await Api.get('/api/home/atividade-recente');

      if (!eventos || eventos.length === 0) {
        feed.innerHTML = `
          <div style="text-align:center;padding:24px 0;color:var(--text-muted);font-size:13px;">
            <i class="fa-solid fa-inbox" style="font-size:20px;display:block;margin-bottom:8px;opacity:.4;"></i>
            Nenhuma atividade registrada ainda.
          </div>`;
        return;
      }

      feed.innerHTML = eventos.map(ev => {
        const timeStr = this._formatarData(ev.data);
        const sub     = ev.usuario && ev.unidade ? `${ev.usuario} · ${ev.unidade}`
                      : ev.usuario               ? ev.usuario
                      : ev.unidade               ? ev.unidade
                      : '';
        return `
          <div class="home-feed-item">
            <div class="home-feed-dot" style="background:${ev.cor};box-shadow:0 0 0 3px ${ev.cor}22;"></div>
            <div class="home-feed-text">
              ${ev.texto}
              ${sub ? `<div style="font-size:10.5px;color:var(--text-muted);margin-top:2px;">${sub}</div>` : ''}
            </div>
            <div class="home-feed-time">${timeStr}</div>
          </div>`;
      }).join('');
    } catch {
      // fallback silencioso — não quebra a home
      feed.innerHTML = `
        <div style="text-align:center;padding:20px 0;color:var(--text-muted);font-size:12px;">
          <i class="fa-solid fa-plug-circle-exclamation" style="display:block;font-size:18px;margin-bottom:6px;opacity:.5;"></i>
          Atividade indisponível no momento.
        </div>`;
    }
  },

  _formatarData(dataStr) {
    if (!dataStr) return '—';
    try {
      // Tenta parsear formatos comuns: "DD/MM/YYYY HH:MM" ou ISO
      let d;
      if (/\d{2}\/\d{2}\/\d{4}/.test(dataStr)) {
        const [datePart, timePart = ''] = dataStr.split(' ');
        const [day, month, year] = datePart.split('/');
        d = new Date(`${year}-${month}-${day}T${timePart || '00:00'}:00`);
      } else {
        d = new Date(dataStr);
      }
      if (isNaN(d)) return dataStr;

      const now   = new Date();
      const diffMs = now - d;
      const diffM  = Math.floor(diffMs / 60000);
      const diffH  = Math.floor(diffMs / 3600000);
      const diffD  = Math.floor(diffMs / 86400000);

      if (diffM < 2)   return 'Agora';
      if (diffM < 60)  return `${diffM} min`;
      if (diffH < 24)  return `${diffH}h atrás`;
      if (diffD === 1) return 'Ontem';
      if (diffD < 7)   return `${diffD} dias`;
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch {
      return dataStr;
    }
  }
};
