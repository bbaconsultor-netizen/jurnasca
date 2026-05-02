// SIR Nasca v2 — Padrón v2 (with create/edit modal + role-aware actions + mobile)

const PadronV2 = ({ role, openCreate, setOpenCreate }) => {
  const [view, setView] = React.useState(null);
  const [edit, setEdit] = React.useState(null);
  const [q, setQ] = React.useState("");
  const [comFilter, setComFilter] = React.useState("Todas");
  const [regantes, setRegantes] = React.useState([...SIRDATA.REGANTES]);
  const readonly = !can(role, "write");

  const filtered = regantes.filter(r => {
    const text = (r.codigo + " " + r.dni + " " + SIRDATA.nameOf(r) + " " + r.razonSocial).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (comFilter !== "Todas" && r.comision !== comFilter) return false;
    return true;
  });

  const fields = [
    { name:"codigo", label:"Código de regante", section:"Identificación", required:true, mono:true, placeholder:"REG-0017", default: `REG-${String(regantes.length+1).padStart(4,"0")}` },
    { name:"tipoDoc", label:"Tipo", type:"select", section:"Identificación", required:true, options:[{value:"DNI",label:"DNI"},{value:"RUC",label:"RUC (persona jurídica)"}], default:"DNI" },
    { name:"dni", label:"N° de documento", section:"Identificación", required:true, mono:true, placeholder:"20498123", pattern:/^\d{8,11}$/, patternMsg:"8 a 11 dígitos" },
    { name:"nombres", label:"Nombres", section:"Identificación" },
    { name:"apellidos", label:"Apellidos", section:"Identificación" },
    { name:"razonSocial", label:"Razón social (si RUC)", section:"Identificación", span:2 },
    { name:"telefono", label:"Teléfono", section:"Contacto", placeholder:"956 234 891" },
    { name:"correo", label:"Correo electrónico", section:"Contacto", type:"email", placeholder:"correo@nasca.pe" },
    { name:"direccion", label:"Dirección", section:"Contacto", span:2 },
    { name:"comision", label:"Comisión", section:"Adscripción", required:true, type:"select", options:SIRDATA.COMISIONES },
    { name:"comite", label:"Comité", section:"Adscripción", required:true, type:"select", options:SIRDATA.COMITES },
    { name:"estado", label:"Estado", section:"Adscripción", type:"select", options:["Activo","Inactivo"], default:"Activo" },
    { name:"obs", label:"Observaciones", section:"Adscripción", type:"textarea", span:2 },
  ];

  const handleSave = (vals) => {
    setRegantes(rs => [{ ...vals, dni: vals.dni }, ...rs]);
    setOpenCreate(false);
  };
  const handleEdit = (vals) => {
    setRegantes(rs => rs.map(r => r.codigo === edit.codigo ? { ...r, ...vals } : r));
    setEdit(null);
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Padrón de Regantes</h1>
          <div className="page-subtitle">{regantes.length} regantes registrados · 5 comisiones · 7 comités</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/><span className="table-mobile-hide">Excel</span></button>
          <button className="btn"><Icon name="printer"/><span className="table-mobile-hide">PDF</span></button>
          <button className="btn primary" disabled={readonly} title={readonly?"Sin permisos":""} onClick={()=>setOpenCreate(true)}>
            <Icon name="plus"/> Nuevo regante
          </button>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search"><Icon name="search"/><input placeholder="Buscar por DNI, nombre o código…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className={"filter-chip" + (comFilter==="Todas"?" active":"")} onClick={()=>setComFilter("Todas")}>Todas</button>
          {SIRDATA.COMISIONES.map(c => (
            <button key={c} className={"filter-chip"+(comFilter===c?" active":"")} onClick={()=>setComFilter(c)}>{c.replace("C.U. ","")}</button>
          ))}
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Código</th><th className="table-mobile-hide">DNI/RUC</th><th>Regante</th>
              <th className="table-mobile-hide">Comisión</th><th className="table-mobile-hide">Comité</th>
              <th className="num table-mobile-hide">Parcelas</th>
              <th className="num">Deuda</th><th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(r => {
                const parcelas = SIRDATA.PARCELAS.filter(p => p.reganteCod === r.codigo).length;
                const deuda = deudaPorRegante(r.codigo);
                return (
                  <tr key={r.codigo} onClick={() => setView(r)} style={{cursor:"pointer"}}>
                    <td className="mono">{r.codigo}</td>
                    <td className="mono table-mobile-hide" style={{color:"var(--text-2)"}}>{r.dni || (r.razonSocial ? "RUC" : "—")}</td>
                    <td>
                      <div style={{fontWeight:500}}>{SIRDATA.nameOf(r)}</div>
                      <div style={{fontSize:11,color:"var(--text-3)"}}>{r.correo || r.telefono}</div>
                    </td>
                    <td className="table-mobile-hide" style={{fontSize:12}}>{r.comision.replace("C.U. ","")}</td>
                    <td className="table-mobile-hide" style={{fontSize:12,color:"var(--text-2)"}}>{r.comite.replace("Comité ","")}</td>
                    <td className="num mono table-mobile-hide">{parcelas}</td>
                    <td className="num mono" style={{color: deuda > 0 ? "var(--danger)" : "var(--text-3)"}}>{deuda > 0 ? fmtSoles(deuda) : "—"}</td>
                    <td><Pill estado={r.estado} /></td>
                    <td>
                      <div className="row-actions">
                        <button title="Ver" onClick={(e)=>{e.stopPropagation();setView(r);}}><Icon name="eye"/></button>
                        {!readonly && <button title="Editar" onClick={(e)=>{e.stopPropagation();setEdit(r);}}><Icon name="edit"/></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {view && <FichaRegante regante={view} onClose={()=>setView(null)} />}
      {openCreate && (
        <FormModal
          title="Nuevo regante"
          sub="Completa los datos para registrar un nuevo regante en el padrón."
          fields={fields}
          onClose={()=>setOpenCreate(false)}
          onSave={handleSave}
        />
      )}
      {edit && (
        <FormModal
          mode="edit"
          title={`Editar ${SIRDATA.nameOf(edit)}`}
          sub={<><span className="mono">{edit.codigo}</span> · {edit.comision}</>}
          fields={fields}
          initial={edit}
          onClose={()=>setEdit(null)}
          onSave={handleEdit}
        />
      )}
    </div>
  );
};

window.PadronV2 = PadronV2;
