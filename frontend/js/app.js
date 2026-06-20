/* ============================================================
   SHP — APP.JS
   SPA Router, Shell initialization, Navigation
   ============================================================ */

const App = {
  _currentPage: null,

  /* Map of page id → nav title shown in header */
  _pageTitles: {
    home:           'Início',
    dashboard:      'Dashboard Analítico',
    saving:         'Painel de Saving',
    pedidos:        'Requisições',
    intake:         'Nova Requisição',
    aprovacoes:     'Painel de Requisições',
    sourcing:       'Fornecedores & Cotação',
    entregas:       'Confirmação de Entrega',
    recebimento:    'Conciliação',
    catalogo:       'Catálogo de Itens',
    contratos:      'Gestão de Contas Fixas',
    consulta:       'Consulta de Requisições',
    estoque:        'Controle de Estoque',
    fornecedores:   'Gestão de Fornecedores',
    configuracoes:  'Configurações',
  },

  _pageSubtitles: {
    home:           'SHP — Sistema de Compras',
    dashboard:      'Inteligência & Dados',
    saving:         'Inteligência & Dados',
    pedidos:        'Inteligência & Dados',
    intake:         'Operação de Compras',
    aprovacoes:     'Operação de Compras',
    sourcing:       'Operação de Compras',
    entregas:       'Operação de Compras',
    recebimento:    'Operação de Compras',
    catalogo:       'Compras Estratégicas',
    contratos:      'Compras Estratégicas & Fixas',
    consulta:       'Compras Estratégicas',
    estoque:        'Compras Estratégicas',
    fornecedores:   'Compras Estratégicas',
    configuracoes:  'Administração',
  },

  navigate(pageId) {
    const page = window.Pages?.[pageId];
    if (!page) {
      console.error(`Page "${pageId}" not found in window.Pages`, Object.keys(window.Pages || {}));
      Toast.error('Página não encontrada', `Módulo "${pageId}" não carregou. Pressione Ctrl+Shift+R para forçar atualização.`);
      return;
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    const navEl = document.getElementById(`nav-${pageId}`);
    if (navEl) navEl.classList.add('active');

    // Update header
    const titleEl = document.getElementById('header-page-title');
    const pathEl  = document.getElementById('header-breadcrumb-path');
    if (titleEl) titleEl.textContent = this._pageTitles[pageId] || page.title;
    if (pathEl) {
      if (pageId === 'home') {
        pathEl.innerHTML = `<span style="color:var(--text);font-weight:600;">Início</span>`;
      } else {
        pathEl.innerHTML = `
          <span style="cursor:pointer;" onclick="App.navigate('home')">Início</span>
          <i class="fa-solid fa-chevron-right" style="font-size:9px;opacity:0.5;"></i>
          <span>${this._pageSubtitles[pageId] || 'Sistema'}</span>
          <i class="fa-solid fa-chevron-right" style="font-size:9px;opacity:0.5;"></i>
          <span style="color:var(--text);font-weight:600;">${this._pageTitles[pageId] || page.title}</span>
        `;
      }
    }

    // Show/hide sidebar and header for Home vs inner pages
    const sidebar = document.querySelector('.sidebar');
    const header  = document.querySelector('.header');
    const content = document.getElementById('content');
    if (pageId === 'home') {
      if (sidebar) sidebar.style.display = 'none';
      if (header)  header.style.display  = 'none';
      if (content) content.classList.add('home-fullscreen');
    } else {
      if (sidebar) sidebar.style.display = '';
      if (header)  header.style.display  = '';
      if (content) content.classList.remove('home-fullscreen');
    }
    content.innerHTML = page.render();

    // Scroll to top
    content.scrollTop = 0;

    this._currentPage = pageId;

    // Initialize page (async)
    if (page.init) {
      Promise.resolve(page.init()).catch(err => {
        console.error(`Error initializing page "${pageId}":`, err);
        Toast.error('Erro ao carregar página', 'Tente novamente.');
      });
    }

    // Update URL hash for bookmarking
    history.replaceState(null, '', `#${pageId}`);
  },

  init() {
    // Check hash for initial page
    const hash = location.hash.replace('#', '');
    const initialPage = (hash && window.Pages?.[hash]) ? hash : 'home';
    this.navigate(initialPage);

    // Refresh notification counts
    refreshNotifBadge();
    setInterval(refreshNotifBadge, 30000); // every 30s
  }
};

/* Initialize when DOM is ready */
document.addEventListener('DOMContentLoaded', () => App.init());
