// SIR Nasca — Padrón de Regantes (table + ficha detallada)

const Pill = ({ estado }) => {
  if (estado === "Activo" || estado === "Activa" || estado === "Operativo") return <span className="pill success"><span className="dot"></span>{estado}</span>;
  if (estado === "Inactivo" || estado === "Inactiva") return <span className="pill muted"><span className="dot"></span>{estado}</span>;
  if (estado === "Mantenimiento") return <span className="pill warning"><span className="dot"></span>{estado}</span>;
  if (estado === "Pendiente") return <span className="pill warning"><span className="dot"></span>{estado}</span>;
  if (estado === "Vencida") return <span className="pill danger"><span className="dot"></span>{estado}</span>;
  if (estado === "Pagada") return <span className="pill success"><span className="dot"></span>{estado}</span>;
  return <span className="pill muted">{estado}</span>;
};
window.Pill = Pill;

// Compute deuda total per regante (mock)
const deudaPorRegante = (codigo) =>
  SIRDATA.DEUDAS.filter(d => d.reganteCod === codigo).reduce((s, d) => s + d.total, 0);

const PadronTable = ({ onView }) => {
  const [q, setQ] = React.useState("");
  const [comFilter, setComFilter] = React.useState("Todas");
  const filtered = SIRDATA.REGANTES.filter(r => {
    const text = (r.codigo + " " + r.dni + " " + SIRDATA.nameOf(r) + " " + r.razonSocial).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (comFilter !== "Todas" && r.comision !== comFilter) return false;
    return true;
  });
  return (
    <div className="card">
      <div className="toolbar">
        <div className="search">
          <Icon name="search" />
          <input placeholder="Buscar por DNI, nombre o código…" value={q} onChange={e=>setQ(e.target.value)} />
        </div>
        <button className={"filter-chip" + (comFilter==="Todas"?" active":"")} onClick={()=>setComFilter("Todas")}>Todas</button>
        {SIRDATA.COMISIONES.map(c => (
          <button key={c} className={"filter-chip" + (comFilter===c?" active":"")} onClick={()=>setComFilter(c)}>
            {c.replace("C.U. ","")}
          </button>
        ))}
        <div style={{marginLeft:"auto",display:"flex",gap:6}}>
          <button className="btn"><Icon name="filter"/> Más filtros</button>
          <button className="btn"><Icon name="download"/> Excel</button>
          <button className="btn"><Icon name="printer"/> PDF</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data">
          <thead><tr>
            <th>Código</th><th>DNI/RUC</th><th>Regante</th><th>Comisión</th><th>Comité</th>
            <th className="num">Parcelas</th><th className="num">Deuda</th><th>Estado</th><th></th>
          </tr></thead>
          <tbody>
            {filtered.map(r => {
              const parcelas = SIRDATA.PARCELAS.filter(p => p.reganteCod === r.codigo).length;
              const deuda = deudaPorRegante(r.codigo);
              return (
                <tr key={r.codigo} onClick={() => onView(r)} style={{cursor:"pointer"}}>
                  <td className="mono">{r.codigo}</td>
                  <td className="mono" style={{color:"var(--text-2)"}}>{r.dni || (r.razonSocial ? "RUC" : "—")}</td>
                  <td>
                    <div style={{fontWeight:500}}>{SIRDATA.nameOf(r)}</div>
                    <div style={{fontSize:11,color:"var(--text-3)"}}>{r.correo || r.telefono}</div>
                  </td>
                  <td style={{fontSize:12}}>{r.comision.replace("C.U. ","")}</td>
                  <td style={{fontSize:12,color:"var(--text-2)"}}>{r.comite.replace("Comité ","")}</td>
                  <td className="num mono">{parcelas}</td>
                  <td className="num mono" style={{color: deuda > 0 ? "var(--danger)" : "var(--text-3)"}}>
                    {deuda > 0 ? fmtSoles(deuda) : "—"}
                  </td>
                  <td><Pill estado={r.estado} /></td>
                  <td>
                    <div className="row-actions">
                      <button title="Ver" onClick={(e)=>{e.stopPropagation();onView(r);}}><Icon name="eye"/></button>
                      <button title="Editar" onClick={(e)=>e.stopPropagation()}><Icon name="edit"/></button>
                      <button title="Más" onClick={(e)=>e.stopPropagation()}><Icon name="more"/></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{padding:"10px 14px",borderTop:"1px solid var(--border)",display:"flex",justifyContent:"space-between",fontSize:12,color:"var(--text-3)"}}>
        <span>Mostrando {filtered.length} de {SIRDATA.REGANTES.length} regantes</span>
        <span>Página 1 de 1</span>
      </div>
    </div>
  );
};

// Detailed ficha drawer
const FichaRegante = ({ regante, onClose }) => {
  const [tab, setTab] = React.useState("general");
  const parcelas = SIRDATA.PARCELAS.filter(p => p.reganteCod === regante.codigo);
  const deudas = SIRDATA.DEUDAS.filter(d => d.reganteCod === regante.codigo);
  const pagos = SIRDATA.PAGOS.filter(p => p.reganteCod === regante.codigo);
  const totalDeuda = deudas.reduce((s, d) => s + d.total, 0);
  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);
  const areaTotal = parcelas.reduce((s, p) => s + p.areaTotal, 0);

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}></div>
      <div className="drawer wide">
        <div className="drawer-head">
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"var(--primary)",color:"var(--primary-ink)",display:"grid",placeItems:"center",fontFamily:"var(--font-display)",fontWeight:600,fontSize:16}}>
              {SIRDATA.nameOf(regante).split(" ").map(s=>s[0]).slice(0,2).join("")}
            </div>
            <div>
              <h3 className="drawer-title">{SIRDATA.nameOf(regante)}</h3>
              <div className="drawer-sub">
                <span className="mono">{regante.codigo}</span> · {regante.dni ? "DNI " + regante.dni : "RUC"} · {regante.comision}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:6}}>
            <button className="btn"><Icon name="printer"/> Imprimir ficha</button>
            <button className="btn"><Icon name="edit"/> Editar</button>
            <button className="icon-btn" onClick={onClose}><Icon name="x"/></button>
          </div>
        </div>

        {/* Quick stats */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,background:"var(--surface)",borderBottom:"1px solid var(--border)"}}>
          {[
            { l: "Parcelas", v: parcelas.length, mono: true },
            { l: "Área total", v: areaTotal.toFixed(1) + " ha", mono: true },
            { l: "Deuda", v: totalDeuda > 0 ? fmtSoles(totalDeuda) : "—", color: totalDeuda > 0 ? "var(--danger)" : "var(--text-3)" },
            { l: "Pagado 2026", v: fmtSoles(totalPagado) },
          ].map((s, i) => (
            <div key={i} style={{padding:"14px 16px",borderRight: i<3?"1px solid var(--border)":"none"}}>
              <div style={{fontSize:10.5,color:"var(--text-3)",letterSpacing:"0.06em",textTransform:"uppercase",fontWeight:600}}>{s.l}</div>
              <div style={{fontFamily:"var(--font-display)",fontSize:18,fontWeight:600,marginTop:4,color:s.color||"var(--text)"}}>{s.v}</div>
            </div>
          ))}
        </div>

        <div className="tabs">
          {["general","parcelas","cuenta","historial"].map(t => (
            <button key={t} className={"tab"+(tab===t?" active":"")} onClick={()=>setTab(t)}>
              {{ general:"Datos generales", parcelas:`Parcelas (${parcelas.length})`, cuenta:`Estado de cuenta`, historial:"Historial" }[t]}
            </button>
          ))}
        </div>

        <div className="drawer-body">
          {tab === "general" && (
            <div style={{display:"flex",flexDirection:"column",gap:24}}>
              <section>
                <h4 className="section-title">Identificación</h4>
                <dl className="kv">
                  <dt>Código de regante</dt><dd className="mono">{regante.codigo}</dd>
                  <dt>{regante.razonSocial ? "RUC" : "DNI"}</dt><dd className="mono">{regante.dni || "20498772341"}</dd>
                  {regante.razonSocial ? (
                    <><dt>Razón social</dt><dd>{regante.razonSocial}</dd></>
                  ) : (
                    <>
                      <dt>Nombres</dt><dd>{regante.nombres}</dd>
                      <dt>Apellidos</dt><dd>{regante.apellidos}</dd>
                    </>
                  )}
                  <dt>Estado</dt><dd><Pill estado={regante.estado}/></dd>
                </dl>
              </section>
              <section>
                <h4 className="section-title">Contacto</h4>
                <dl className="kv">
                  <dt>Teléfono</dt><dd>{regante.telefono || "—"}</dd>
                  <dt>Correo</dt><dd>{regante.correo || "—"}</dd>
                  <dt>Dirección</dt><dd>{regante.direccion}</dd>
                </dl>
              </section>
              <section>
                <h4 className="section-title">Adscripción</h4>
                <dl className="kv">
                  <dt>Comisión</dt><dd>{regante.comision}</dd>
                  <dt>Comité</dt><dd>{regante.comite}</dd>
                </dl>
              </section>
              {regante.obs && (
                <section>
                  <h4 className="section-title">Observaciones</h4>
                  <div style={{padding:"10px 12px",background:"var(--surface-2)",borderRadius:4,fontSize:13,color:"var(--text-2)"}}>{regante.obs}</div>
                </section>
              )}
            </div>
          )}
          {tab === "parcelas" && (
            <div className="card" style={{boxShadow:"none"}}>
              <div className="table-wrap">
                <table className="data">
                  <thead><tr><th>Código</th><th>Predio</th><th>Sector</th><th>Cultivo</th><th className="num">Área</th><th>Canal/Toma</th><th>Estado</th></tr></thead>
                  <tbody>
                    {parcelas.length === 0 && <tr><td colSpan={7} className="empty">Sin parcelas registradas</td></tr>}
                    {parcelas.map(p => (
                      <tr key={p.codigo}>
                        <td className="mono">{p.codigo}</td>
                        <td>{p.predio}</td>
                        <td style={{fontSize:12,color:"var(--text-2)"}}>{p.sector}</td>
                        <td>{p.cultivo}</td>
                        <td className="num mono">{p.areaTotal} ha</td>
                        <td className="mono" style={{fontSize:11,color:"var(--text-2)"}}>{p.canal} · {p.toma}</td>
                        <td><Pill estado={p.estado}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {tab === "cuenta" && (
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div className="card" style={{boxShadow:"none"}}>
                <div className="card-head"><h3 className="card-title">Deudas pendientes</h3></div>
                <div className="table-wrap">
                  <table className="data">
                    <thead><tr><th>ID</th><th>Concepto</th><th>Periodo</th><th className="num">Monto</th><th className="num">Mora</th><th className="num">Total</th><th>Estado</th></tr></thead>
                    <tbody>
                      {deudas.length === 0 && <tr><td colSpan={7} className="empty">Sin deudas pendientes</td></tr>}
                      {deudas.map(d => (
                        <tr key={d.id}>
                          <td className="mono">{d.id}</td><td>{d.concepto}</td><td className="mono">{d.periodo}</td>
                          <td className="num mono">{fmtSoles(d.monto)}</td>
                          <td className="num mono" style={{color: d.mora > 0 ? "var(--danger)" : "var(--text-3)"}}>{d.mora>0?fmtSoles(d.mora):"—"}</td>
                          <td className="num mono" style={{fontWeight:600}}>{fmtSoles(d.total)}</td>
                          <td><Pill estado={d.estado}/></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="card" style={{boxShadow:"none"}}>
                <div className="card-head"><h3 className="card-title">Pagos realizados</h3></div>
                <div className="table-wrap">
                  <table className="data">
                    <thead><tr><th>Recibo</th><th>Fecha</th><th>Medio</th><th className="num">Monto</th></tr></thead>
                    <tbody>
                      {pagos.length === 0 && <tr><td colSpan={4} className="empty">Sin pagos registrados</td></tr>}
                      {pagos.map(p => (
                        <tr key={p.id}>
                          <td className="mono">{p.recibo}</td>
                          <td style={{fontSize:12}}>{p.fecha}</td>
                          <td><span className="pill muted">{p.medio}</span></td>
                          <td className="num mono">{fmtSoles(p.monto)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          {tab === "historial" && (
            <div style={{display:"flex",flexDirection:"column",gap:0}}>
              {[
                { d: "2026-04-28", t: "Pago registrado", desc: "Tarifa de agua 2026-I — S/ 420.00", icon: "money" },
                { d: "2026-03-15", t: "Deuda emitida", desc: "Tarifa de agua 2026-I", icon: "report" },
                { d: "2026-02-10", t: "Datos actualizados", desc: "Teléfono modificado por Padrón", icon: "edit" },
                { d: "2025-12-04", t: "Parcela asociada", desc: "PAR-0002 vinculada al regante", icon: "land" },
                { d: "2025-09-01", t: "Regante creado", desc: "Alta inicial en padrón", icon: "user" },
              ].map((h, i) => (
                <div key={i} style={{display:"flex",gap:12,padding:"12px 0",borderBottom:"1px solid var(--border)"}}>
                  <div style={{width:28,height:28,borderRadius:"50%",background:"var(--surface-2)",color:"var(--text-2)",display:"grid",placeItems:"center",flexShrink:0}}>
                    <Icon name={h.icon} size={13}/>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:500}}>{h.t}</div>
                    <div style={{fontSize:12,color:"var(--text-3)",marginTop:2}}>{h.desc}</div>
                  </div>
                  <div style={{fontSize:11.5,color:"var(--text-3)",fontFamily:"var(--font-mono)"}}>{h.d}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const Padron = ({ role }) => {
  const [view, setView] = React.useState(null);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Padrón de Regantes</h1>
          <div className="page-subtitle">{SIRDATA.REGANTES.length} regantes registrados · 5 comisiones · 7 comités</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/> Exportar Excel</button>
          <button className="btn"><Icon name="printer"/> Exportar PDF</button>
          <button className="btn primary"><Icon name="plus"/> Nuevo regante</button>
        </div>
      </div>
      <PadronTable onView={setView} />
      {view && <FichaRegante regante={view} onClose={()=>setView(null)} />}
    </div>
  );
};

window.Padron = Padron;
window.deudaPorRegante = deudaPorRegante;
