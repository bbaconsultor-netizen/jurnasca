// SIR Nasca — App shell (sidebar, topbar, login)

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "dashboard", section: "principal" },
  { id: "padron", label: "Padrón de Regantes", icon: "users", section: "operaciones" },
  { id: "parcelas", label: "Parcelas", icon: "land", section: "operaciones" },
  { id: "canales", label: "Canales", icon: "canal", section: "operaciones" },
  { id: "tomas", label: "Tomas de agua", icon: "drop", section: "operaciones" },
  { id: "mapa", label: "Mapa de la red", icon: "map", section: "operaciones" },
  { id: "pagos", label: "Pagos y deudas", icon: "money", section: "financiero" },
  { id: "reportes", label: "Reportes", icon: "report", section: "financiero" },
  { id: "auditoria", label: "Auditoría", icon: "audit", section: "sistema" },
  { id: "config", label: "Configuración", icon: "settings", section: "sistema" },
];

const SECTION_LABELS = {
  principal: "Principal",
  operaciones: "Operaciones",
  financiero: "Financiero",
  sistema: "Sistema",
};

const Brand = ({ size = "default" }) => (
  <>
    <div className="brand-emblem"><span>JN</span></div>
    <div>
      <div className="brand-text">SIR Nasca</div>
      <div className="brand-sub">Junta de Usuarios · Nasca</div>
    </div>
  </>
);

const Sidebar = ({ active, onNav }) => {
  const sections = [...new Set(NAV.map(n => n.section))];
  return (
    <aside className="sidebar">
      <div className="sidebar-brand"><Brand /></div>
      {sections.map(sec => (
        <div className="sidebar-section" key={sec}>
          <div className="sidebar-label">{SECTION_LABELS[sec]}</div>
          {NAV.filter(n => n.section === sec).map(n => (
            <button
              key={n.id}
              className={"sidebar-item" + (active === n.id ? " active" : "")}
              onClick={() => onNav(n.id)}
            >
              <Icon name={n.icon} />
              <span>{n.label}</span>
              {n.id === "pagos" && <span className="badge">7</span>}
            </button>
          ))}
        </div>
      ))}
      <div className="sidebar-footer">
        <span>v0.1 · MVP</span>
        <span>2026 · I</span>
      </div>
    </aside>
  );
};

const RoleSwitcher = ({ role, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef();
  React.useEffect(() => {
    const close = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div className="has-dropdown" ref={ref}>
      <button className="role-pill" onClick={() => setOpen(!open)}>
        <div className="role-avatar">{role.initials}</div>
        <div className="role-meta">
          <div className="name">{role.name}</div>
          <div className="role">{role.role}</div>
        </div>
        <Icon name="chevron-down" size={12} />
      </button>
      {open && (
        <div className="dropdown" style={{ minWidth: 280 }}>
          <div style={{ padding: "8px 10px", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>
            Cambiar de rol (demo)
          </div>
          {SIRDATA.ROLES.map(r => (
            <button
              key={r.id}
              className={r.id === role.id ? "active" : ""}
              onClick={() => { onChange(r); setOpen(false); }}
            >
              <div className="role-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>{r.initials}</div>
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)" }}>{r.desc}</div>
              </div>
              <span className="role-tag">{r.role}</span>
            </button>
          ))}
          <div className="sep"></div>
          <button onClick={() => { window.parent.postMessage({type:"__route_to_login"}, "*"); }}>
            <Icon name="logout" size={14} /> Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

const Topbar = ({ active, role, onChangeRole, onLogout }) => {
  const navItem = NAV.find(n => n.id === active);
  return (
    <header className="topbar">
      <div className="crumbs">
        <span>SIR Nasca</span>
        <span className="sep">/</span>
        <span className="current">{navItem?.label}</span>
      </div>
      <div className="topbar-search">
        <Icon name="search" />
        <input placeholder="Buscar regante, parcela, canal, recibo…" />
      </div>
      <div className="role-switcher">
        <button className="icon-btn" title="Notificaciones">
          <Icon name="bell" />
          <span className="dot"></span>
        </button>
        <RoleSwitcher role={role} onChange={onChangeRole} />
      </div>
    </header>
  );
};

// ========== Login ==========
const Login = ({ onLogin }) => {
  const [user, setUser] = React.useState("admin");
  const [pass, setPass] = React.useState("••••••••");
  return (
    <div className="login-shell">
      <div className="login-left">
        <div className="login-pattern"></div>
        <div className="login-brand"><Brand /></div>
        <div className="login-hero">
          <h1>Sistema Integral de Riego de la Junta de Usuarios de Nasca</h1>
          <p>Padrón de regantes, gestión de parcelas, canales y tomas de agua, recaudación y reportes — todo en una sola plataforma para la Junta de Usuarios del valle de Nasca.</p>
        </div>
        <div className="login-foot">JUNTA DE USUARIOS DEL SECTOR HIDRÁULICO MENOR NASCA · 2026</div>
      </div>
      <div className="login-right">
        <div className="login-card">
          <h2>Iniciar sesión</h2>
          <div className="lead">Ingresa con tu usuario institucional.</div>
          <form className="login-form" onSubmit={(e) => { e.preventDefault(); onLogin(SIRDATA.ROLES[0]); }}>
            <div className="field">
              <label>Usuario</label>
              <input value={user} onChange={e=>setUser(e.target.value)} placeholder="usuario" />
            </div>
            <div className="field">
              <label>Contraseña</label>
              <input type="password" value={pass} onChange={e=>setPass(e.target.value)} />
            </div>
            <div className="row">
              <label style={{display:"flex",gap:6,alignItems:"center"}}>
                <input type="checkbox" defaultChecked /> Recordarme
              </label>
              <a href="#">¿Olvidaste tu contraseña?</a>
            </div>
            <button className="btn primary lg" type="submit">Ingresar</button>
          </form>
          <div className="login-roles">
            <div className="login-roles-label">Acceso rápido por rol (demo)</div>
            <div className="login-roles-grid">
              {SIRDATA.ROLES.map(r => (
                <button key={r.id} className="login-role" onClick={() => onLogin(r)}>
                  <div className="name">{r.role}</div>
                  <div className="desc">{r.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { Sidebar, Topbar, Login, NAV, Brand });
