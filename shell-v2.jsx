// SIR Nasca v2 — Shell v2 (mobile sidebar + role-aware nav)

const SidebarV2 = ({ active, onNav, role, mobileOpen, setMobileOpen }) => {
  const sections = [...new Set(NAV.map(n => n.section))];
  return (
    <>
      <div className={"sidebar-overlay" + (mobileOpen ? " active" : "")} onClick={()=>setMobileOpen(false)}></div>
      <aside className={"sidebar" + (mobileOpen ? " open" : "")}>
        <div className="sidebar-brand"><Brand /></div>
        {sections.map(sec => {
          const items = NAV.filter(n => n.section === sec && canModule(role, n.id));
          if (items.length === 0) return null;
          return (
            <div className="sidebar-section" key={sec}>
              <div className="sidebar-label">{SECTION_LABELS[sec]}</div>
              {items.map(n => (
                <button
                  key={n.id}
                  className={"sidebar-item" + (active === n.id ? " active" : "")}
                  onClick={() => { onNav(n.id); setMobileOpen(false); }}
                >
                  <Icon name={n.icon} />
                  <span>{n.label}</span>
                  {n.id === "pagos" && <span className="badge">7</span>}
                </button>
              ))}
            </div>
          );
        })}
        <div className="sidebar-footer">
          <span>v0.2 · MVP</span>
          <span>2026 · I</span>
        </div>
      </aside>
    </>
  );
};

const TopbarV2 = ({ active, role, onChangeRole, onMenu }) => {
  const navItem = NAV.find(n => n.id === active);
  return (
    <header className="topbar">
      <button className="icon-btn menu-toggle" onClick={onMenu} title="Menú">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
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

window.SidebarV2 = SidebarV2;
window.TopbarV2 = TopbarV2;
