// SIR Nasca — Permisos por rol + helpers

const PERMISOS = {
  "Administrador": { all: true, read: true, write: true, delete: true, finance: true, config: true, audit: true },
  "Padrón":        { read: true, write: true, delete: false, finance: false, config: false, audit: false, modules: ["dashboard","padron","parcelas","canales","tomas","mapa","reportes"] },
  "Área Técnica":  { read: true, write: true, delete: false, finance: false, config: false, audit: false, modules: ["dashboard","parcelas","canales","tomas","mapa","reportes"] },
  "Tesorería":     { read: true, write: true, delete: false, finance: true, config: false, audit: false, modules: ["dashboard","padron","pagos","reportes"] },
  "Consulta":      { read: true, write: false, delete: false, finance: false, config: false, audit: false, modules: ["dashboard","padron","parcelas","canales","tomas","mapa","reportes"] },
};

const can = (role, action) => {
  const p = PERMISOS[role.role] || {};
  if (p.all) return true;
  return !!p[action];
};

const canModule = (role, mod) => {
  const p = PERMISOS[role.role] || {};
  if (p.all) return true;
  return (p.modules || []).includes(mod);
};

window.PERMISOS = PERMISOS;
window.can = can;
window.canModule = canModule;

// ============== Form Modal (reusable) ==============
const FormModal = ({ title, sub, fields, initial = {}, onClose, onSave, mode = "create" }) => {
  const [values, setValues] = React.useState(() => {
    const v = {};
    fields.forEach(f => { v[f.name] = initial[f.name] ?? f.default ?? ""; });
    return v;
  });
  const [errors, setErrors] = React.useState({});

  const set = (n, v) => setValues(s => ({ ...s, [n]: v }));

  const validate = () => {
    const err = {};
    fields.forEach(f => {
      if (f.required && !String(values[f.name]).trim()) err[f.name] = "Requerido";
      if (f.pattern && values[f.name] && !f.pattern.test(values[f.name])) err[f.name] = f.patternMsg || "Formato inválido";
    });
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(values);
  };

  // Group by section if defined
  const sections = {};
  fields.forEach(f => {
    const s = f.section || "_default";
    sections[s] = sections[s] || [];
    sections[s].push(f);
  });

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <div className="modal">
        <form onSubmit={submit} style={{display:"contents"}}>
          <div className="modal-head">
            <div>
              <h3 className="drawer-title">{title}</h3>
              {sub && <div className="drawer-sub">{sub}</div>}
            </div>
            <button type="button" className="icon-btn" onClick={onClose}><Icon name="x"/></button>
          </div>
          <div className="modal-body">
            {Object.entries(sections).map(([sec, flds]) => (
              <div key={sec} style={{marginBottom: 18}}>
                {sec !== "_default" && <h4 className="section-title">{sec}</h4>}
                <div className="form-grid">
                  {flds.map(f => {
                    const span = f.span || 1;
                    const err = errors[f.name];
                    return (
                      <div className="field" key={f.name} style={{gridColumn: `span ${span}`}}>
                        <label>{f.label}{f.required && <span style={{color:"var(--danger)"}}> *</span>}</label>
                        {f.type === "select" ? (
                          <select value={values[f.name]} onChange={e=>set(f.name, e.target.value)} style={err?{borderColor:"var(--danger)"}:{}}>
                            <option value="">— Seleccionar —</option>
                            {f.options.map(o => <option key={o.value || o} value={o.value || o}>{o.label || o}</option>)}
                          </select>
                        ) : f.type === "textarea" ? (
                          <textarea value={values[f.name]} onChange={e=>set(f.name, e.target.value)} placeholder={f.placeholder} rows={3} style={err?{borderColor:"var(--danger)"}:{}}/>
                        ) : f.type === "map" ? (
                          <>
                            <input
                              type="text"
                              value={values[f.name]}
                              onChange={e=>set(f.name, e.target.value)}
                              placeholder="-14.8512, -74.9810"
                              className="mono"
                              style={Object.assign({marginBottom:6}, err?{borderColor:"var(--danger)"}:{})}
                            />
                            <MiniMap value={values[f.name]} onChange={(v)=>set(f.name, v)} />
                          </>
                        ) : (
                          <input
                            type={f.type || "text"}
                            value={values[f.name]}
                            onChange={e=>set(f.name, e.target.value)}
                            placeholder={f.placeholder}
                            className={f.mono ? "mono" : ""}
                            style={err?{borderColor:"var(--danger)"}:{}}
                          />
                        )}
                        {err ? <span className="hint" style={{color:"var(--danger)"}}>{err}</span> : f.hint && <span className="hint">{f.hint}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          <div className="modal-foot">
            <button type="button" className="btn ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn primary">{mode === "edit" ? "Guardar cambios" : "Crear"}</button>
          </div>
        </form>
      </div>
    </>
  );
};

window.FormModal = FormModal;
