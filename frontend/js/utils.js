/* ============================================================
   SHP — UTILS.JS
   API client, Toast, Modal, Formatters
   ============================================================ */

const API_BASE = 'http://localhost:8000';

/* ── API CLIENT ───────────────────────────────────────────── */
const Api = {
  async _handleResponse(r) {
    if (!r.ok) {
      let detail = `HTTP ${r.status}`;
      try { const j = await r.json(); detail = j.detail || j.message || detail; } catch {}
      throw new Error(detail);
    }
    return r.json();
  },
  async get(path) {
    const r = await fetch(API_BASE + path);
    return this._handleResponse(r);
  },
  async post(path, body) {
    const r = await fetch(API_BASE + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return this._handleResponse(r);
  },
  async patch(path, body) {
    const r = await fetch(API_BASE + path, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return this._handleResponse(r);
  },
  async delete(path) {
    const r = await fetch(API_BASE + path, { method: 'DELETE' });
    return this._handleResponse(r);
  }
};

/* ── FORMATTERS ───────────────────────────────────────────── */
const Fmt = {
  currency(val) {
    if (!val && val !== 0) return 'R$ —';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL'
    }).format(val);
  },
  number(val) {
    if (!val && val !== 0) return '—';
    return new Intl.NumberFormat('pt-BR').format(val);
  },
  date(str) {
    if (!str) return '—';
    return str;
  },
  pct(val) {
    if (!val && val !== 0) return '0%';
    return `${Number(val).toFixed(1)}%`;
  },
  shortName(str) {
    if (!str) return '?';
    const parts = str.trim().split(' ');
    return parts[0].charAt(0).toUpperCase() + (parts[1] ? parts[1].charAt(0).toUpperCase() : '');
  }
};

/* ── STATUS BADGE HELPER ──────────────────────────────────── */
const StatusBadge = {
  get(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('aguardando aprovação')) {
      return `<span class="badge badge-warning"><i class="fa-solid fa-clock"></i> Aguardando Aprovação</span>`;
    }
    if (s.includes('aguardando cotação')) {
      return `<span class="badge badge-brand"><i class="fa-solid fa-search-dollar"></i> Aguardando Cotação</span>`;
    }
    if (s.includes('concluído') || s.includes('concluido')) {
      return `<span class="badge badge-success"><i class="fa-solid fa-check"></i> Concluído</span>`;
    }
    if (s.includes('reprovado')) {
      return `<span class="badge badge-accent"><i class="fa-solid fa-xmark"></i> Reprovado</span>`;
    }
    if (s === 'aprovado') {
      return `<span class="badge badge-success"><i class="fa-solid fa-check-double"></i> Aprovado</span>`;
    }
    if (s === 'bloqueado') {
      return `<span class="badge badge-accent"><i class="fa-solid fa-ban"></i> Bloqueado</span>`;
    }
    return `<span class="badge badge-gray">${status}</span>`;
  }
};

/* ── TOAST ────────────────────────────────────────────────── */
const Toast = {
  _container: null,

  _init() {
    if (!this._container) {
      this._container = document.getElementById('toast-container');
    }
  },

  show({ type = 'info', title, message, duration = 4000 }) {
    this._init();
    const icons = {
      success: 'fa-circle-check',
      error:   'fa-circle-xmark',
      warning: 'fa-triangle-exclamation',
      info:    'fa-circle-info'
    };

    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-icon"><i class="fa-solid ${icons[type] || icons.info}"></i></div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-msg">${message}</div>` : ''}
      </div>
      <button class="toast-close" onclick="this.closest('.toast').remove()">
        <i class="fa-solid fa-xmark"></i>
      </button>
    `;
    this._container.appendChild(el);

    setTimeout(() => {
      el.classList.add('removing');
      setTimeout(() => el.remove(), 300);
    }, duration);
  },

  success(title, message)  { this.show({ type: 'success', title, message }); },
  error(title, message)    { this.show({ type: 'error',   title, message }); },
  warning(title, message)  { this.show({ type: 'warning', title, message }); },
  info(title, message)     { this.show({ type: 'info',    title, message }); }
};

/* ── MODAL ────────────────────────────────────────────────── */
const Modal = {
  _overlay: null,
  _resolve: null,

  _init() {
    if (!this._overlay) {
      this._overlay = document.getElementById('modal-overlay');
    }
  },

  async confirm({ icon = 'warn', title, subtitle = '', body, confirmText = 'Confirmar', cancelText = 'Cancelar', confirmClass = 'btn-primary' }) {
    this._init();
    const iconMap = {
      warn:    { cls: 'modal-icon-warn',    fa: 'fa-triangle-exclamation' },
      danger:  { cls: 'modal-icon-danger',  fa: 'fa-circle-xmark' },
      success: { cls: 'modal-icon-success', fa: 'fa-circle-check' },
      info:    { cls: 'modal-icon-info',    fa: 'fa-circle-info' }
    };
    const ic = iconMap[icon] || iconMap.info;

    this._overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-icon ${ic.cls}">
            <i class="fa-solid ${ic.fa}"></i>
          </div>
          <div>
            <div class="modal-title">${title}</div>
            ${subtitle ? `<div class="modal-subtitle">${subtitle}</div>` : ''}
          </div>
        </div>
        ${body ? `<div class="modal-body"><p>${body}</p></div>` : ''}
        <div class="modal-footer">
          <button class="btn btn-outline" id="modal-cancel">${cancelText}</button>
          <button class="btn ${confirmClass}" id="modal-confirm">${confirmText}</button>
        </div>
      </div>
    `;

    this._overlay.classList.add('open');

    return new Promise((resolve) => {
      document.getElementById('modal-confirm').onclick = () => {
        this.close(); resolve(true);
      };
      document.getElementById('modal-cancel').onclick = () => {
        this.close(); resolve(false);
      };
      this._overlay.onclick = (e) => {
        if (e.target === this._overlay) { this.close(); resolve(false); }
      };
    });
  },

  async prompt({ icon = 'info', title, subtitle = '', placeholder = '', label = 'Motivo', required = true }) {
    this._init();
    const iconMap = {
      warn:    { cls: 'modal-icon-warn',    fa: 'fa-triangle-exclamation' },
      danger:  { cls: 'modal-icon-danger',  fa: 'fa-circle-xmark' },
      info:    { cls: 'modal-icon-info',    fa: 'fa-circle-info' }
    };
    const ic = iconMap[icon] || iconMap.info;

    this._overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <div class="modal-icon ${ic.cls}">
            <i class="fa-solid ${ic.fa}"></i>
          </div>
          <div>
            <div class="modal-title">${title}</div>
            ${subtitle ? `<div class="modal-subtitle">${subtitle}</div>` : ''}
          </div>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label${required ? ' form-label-required' : ''}">${label}</label>
            <textarea id="modal-input" class="form-control" rows="3" placeholder="${placeholder}" style="resize:vertical;"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline" id="modal-cancel">Cancelar</button>
          <button class="btn btn-danger" id="modal-confirm">Confirmar</button>
        </div>
      </div>
    `;

    this._overlay.classList.add('open');
    setTimeout(() => document.getElementById('modal-input').focus(), 100);

    return new Promise((resolve) => {
      document.getElementById('modal-confirm').onclick = () => {
        const val = document.getElementById('modal-input').value.trim();
        if (required && !val) {
          document.getElementById('modal-input').style.borderColor = 'var(--accent)';
          return;
        }
        this.close(); resolve(val);
      };
      document.getElementById('modal-cancel').onclick = () => {
        this.close(); resolve(null);
      };
    });
  },

  close() {
    this._init();
    this._overlay.classList.remove('open');
  }
};

/* ── SKELETON LOADER HELPER ───────────────────────────────── */
const Skeleton = {
  kpiGrid(count = 4) {
    const card = `
      <div class="card">
        <div class="skeleton skeleton-line" style="width:40%;height:40px;border-radius:10px;margin-bottom:16px;"></div>
        <div class="skeleton skeleton-line" style="width:70%;height:28px;"></div>
        <div class="skeleton skeleton-line" style="width:50%;height:14px;"></div>
      </div>`;
    return `<div class="grid-4 mb-4">${Array(count).fill(card).join('')}</div>`;
  },
  list(count = 3) {
    const row = `
      <div class="card mb-2">
        <div class="skeleton skeleton-line" style="width:30%;height:16px;margin-bottom:10px;"></div>
        <div class="skeleton skeleton-line" style="width:80%;height:12px;margin-bottom:6px;"></div>
        <div class="skeleton skeleton-line" style="width:60%;height:12px;"></div>
      </div>`;
    return Array(count).fill(row).join('');
  },
  chart() {
    return `<div class="skeleton skeleton-chart"></div>`;
  }
};

/* ── NOTIFICATION COUNTER ─────────────────────────────────── */
async function refreshNotifBadge() {
  try {
    const [aprovs, sourcing, pendentes] = await Promise.all([
      Api.get('/api/aprovacoes/pendentes'),
      Api.get('/api/sourcing/pedidos-aprovados'),
      Api.get('/api/usuarios/pendentes-acesso').catch(() => [])
    ]);
    const total = (aprovs.pedidos?.length || 0) + (sourcing?.length || 0) + (pendentes?.length || 0);
    const badge = document.getElementById('header-notif-count');
    if (badge) {
      badge.textContent = total;
      badge.classList.toggle('hidden', total === 0);
    }
  } catch { /* silently fail */ }
}

/* ── NOTIFICATION PANEL ───────────────────────────────────── */
function toggleNotifPanel(e) {
  e.stopPropagation();
  const panel = document.getElementById('notif-panel');
  const btn   = document.getElementById('notif-btn');
  if (!panel) return;

  // Close user dropdown if open
  closeUserMenu();

  if (panel.style.display !== 'none') {
    closeNotifPanel(); return;
  }

  // Position below the bell button
  const rect = btn.getBoundingClientRect();
  panel.style.top  = (rect.bottom + 8) + 'px';
  panel.style.right = (window.innerWidth - rect.right) + 'px';
  panel.style.display = 'block';

  _loadNotifPanel();

  // Close on outside click
  setTimeout(() => document.addEventListener('click', _notifOutsideClick, { once: true }), 0);
}

function closeNotifPanel() {
  const panel = document.getElementById('notif-panel');
  if (panel) panel.style.display = 'none';
}

function _notifOutsideClick(e) {
  const panel = document.getElementById('notif-panel');
  if (panel && !panel.contains(e.target)) closeNotifPanel();
}

async function _loadNotifPanel() {
  const body = document.getElementById('notif-panel-body');
  if (!body) return;

  body.innerHTML = '<div class="fp-loading"><div class="spinner" style="width:20px;height:20px;"></div></div>';

  try {
    const [aprovData, sourData, pendData] = await Promise.allSettled([
      Api.get('/api/aprovacoes/pendentes'),
      Api.get('/api/sourcing/pedidos-aprovados'),
      Api.get('/api/usuarios/pendentes-acesso')
    ]);

    const aprovList = aprovData.status === 'fulfilled' ? (aprovData.value.pedidos || []) : [];
    const sourList  = sourData.status  === 'fulfilled' ? (sourData.value || []) : [];
    const pendList  = pendData.status  === 'fulfilled' ? (pendData.value || []) : [];

    let html = '';

    // Seção: Solicitações de Acesso Pendentes
    if (pendList.length > 0) {
      html += `<div class="fp-section-title" style="color:var(--warning-deeper,#b45309);">
                 <i class="fa-solid fa-user-clock"></i> Acesso Pendente (${pendList.length})
               </div>`;
      pendList.slice(0, 4).forEach(p => {
        html += `
          <div class="fp-notif-item" onclick="closeNotifPanel();App.navigate('configuracoes')">
            <div class="fp-notif-dot" style="background:#f59e0b;"></div>
            <div class="fp-notif-text">
              ${p.nome}
              <div class="fp-notif-sub">Aguardando ativação de acesso</div>
            </div>
          </div>`;
      });
      if (pendList.length > 4) {
        html += `<div style="padding:8px 16px;font-size:11.5px;color:var(--brand);cursor:pointer;font-weight:600;"
                      onclick="closeNotifPanel();App.navigate('configuracoes')">
                   + ${pendList.length - 4} mais aguardando →
                 </div>`;
      }
    }

    // Seção: Aprovações Pendentes
    if (aprovList.length > 0) {
      html += `<div class="fp-section-title"><i class="fa-solid fa-user-shield"></i> Aprovações Pendentes (${aprovList.length})</div>`;
      aprovList.slice(0, 6).forEach(p => {
        const id   = p.id_pedido || p.id_sharepoint || p.id || '—';
        const unit = p.unidade ? ` · ${p.unidade}` : '';
        const itens = p.itens?.length ? ` · ${p.itens.length} item${p.itens.length > 1 ? 's' : ''}` : '';
        html += `
          <div class="fp-notif-item" onclick="closeNotifPanel();App.navigate('aprovacoes')">
            <div class="fp-notif-dot" style="background:#ff2f69;"></div>
            <div class="fp-notif-text">
              Req. #${id}${unit}
              <div class="fp-notif-sub">Aguardando aprovação${itens}</div>
            </div>
          </div>`;
      });
      if (aprovList.length > 6) {
        html += `<div style="padding:8px 16px;font-size:11.5px;color:var(--brand);cursor:pointer;font-weight:600;"
                      onclick="closeNotifPanel();App.navigate('aprovacoes')">
                   + ${aprovList.length - 6} mais aguardando →
                 </div>`;
      }
    }

    // Seção: Para Cotar
    if (sourList.length > 0) {
      html += `<div class="fp-section-title"><i class="fa-solid fa-magnifying-glass-chart"></i> Para Cotar (${sourList.length})</div>`;
      sourList.slice(0, 5).forEach(p => {
        const id   = p.id_sharepoint || p.id || '—';
        const seg  = p.segmento || p.categoria || '';
        html += `
          <div class="fp-notif-item" onclick="closeNotifPanel();App.navigate('sourcing')">
            <div class="fp-notif-dot" style="background:#01E18E;"></div>
            <div class="fp-notif-text">
              Req. #${id}
              <div class="fp-notif-sub">${seg ? seg : 'Aguardando cotação'}</div>
            </div>
          </div>`;
      });
      if (sourList.length > 5) {
        html += `<div style="padding:8px 16px;font-size:11.5px;color:var(--brand);cursor:pointer;font-weight:600;"
                      onclick="closeNotifPanel();App.navigate('sourcing')">
                   + ${sourList.length - 5} mais para cotar →
                 </div>`;
      }
    }

    if (!html) {
      html = `<div class="fp-empty">
        <i class="fa-solid fa-circle-check"></i>
        Tudo em dia! Nenhuma ação pendente.
      </div>`;
    }

    body.innerHTML = html;
  } catch {
    body.innerHTML = `<div class="fp-empty">
      <i class="fa-solid fa-plug-circle-exclamation"></i>
      Não foi possível carregar as notificações.
    </div>`;
  }
}

/* ── USER DROPDOWN ────────────────────────────────────────── */
function toggleUserMenu(e) {
  e.stopPropagation();
  const panel = document.getElementById('user-dropdown');
  const btn   = document.getElementById('header-user-btn');
  if (!panel) return;

  // Close notif panel if open
  closeNotifPanel();

  if (panel.style.display !== 'none') {
    closeUserMenu(); return;
  }

  const rect = btn.getBoundingClientRect();
  panel.style.top   = (rect.bottom + 8) + 'px';
  panel.style.right = (window.innerWidth - rect.right) + 'px';
  panel.style.display = 'block';

  setTimeout(() => document.addEventListener('click', _userMenuOutsideClick, { once: true }), 0);
}

function closeUserMenu() {
  const panel = document.getElementById('user-dropdown');
  if (panel) panel.style.display = 'none';
}

function _userMenuOutsideClick(e) {
  const panel = document.getElementById('user-dropdown');
  if (panel && !panel.contains(e.target)) closeUserMenu();
}
