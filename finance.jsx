// SIR Nasca — Pagos, Reportes, Auditoría, Configuración

const Pagos = ({ role }) => {
  const [tab, setTab] = React.useState("deudas");
  const [view, setView] = React.useState(null);
  const totalDeudas = SIRDATA.DEUDAS.reduce((s,d)=>s+d.total,0);
  const totalRecaudado = SIRDATA.PAGOS.reduce((s,p)=>s+p.monto,0);

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Pagos y deudas</h1>
          <div className="page-subtitle">Gestión financiera · Campaña 2026 · I</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/> Exportar</button>
          <button className="btn"><Icon name="report"/> Generar deuda masiva</button>
          <button className="btn primary"><Icon name="plus"/> Registrar pago</button>
        </div>
      </div>

      <div className="kpi-grid" style={{gridTemplateColumns:"repeat(4,1fr)"}}>
        <KPI label="Recaudación abril" value={fmtSoles(31450)} icon="wallet" delta="+8.8%" deltaDir="up"/>
        <KPI label="Deuda pendiente" value={fmtSoles(totalDeudas)} icon="alert"/>
        <KPI label="Recibos emitidos" value="140" icon="report"/>
        <KPI label="Total recaudado año" value={fmtSoles(totalRecaudado * 12)} icon="trend-up"/>
      </div>

      <div className="card">
        <div className="tabs" style={{padding:0}}>
          {[
            {id:"deudas", label:"Deudas pendientes", count: SIRDATA.DEUDAS.length},
            {id:"pagos", label:"Pagos registrados", count: SIRDATA.PAGOS.length},
            {id:"conceptos", label:"Conceptos de pago", count: SIRDATA.CONCEPTOS.length},
            {id:"recibos", label:"Recibos"},
          ].map(t => (
            <button key={t.id} className={"tab"+(tab===t.id?" active":"")} onClick={()=>setTab(t.id)}>
              {t.label}{t.count!==undefined && <span style={{marginLeft:6,fontSize:10,color:"var(--text-3)",fontFamily:"var(--font-mono)"}}>({t.count})</span>}
            </button>
          ))}
        </div>

        {tab === "deudas" && (
          <>
            <div className="toolbar">
              <div className="search"><Icon name="search"/><input placeholder="Buscar deuda por regante o ID…"/></div>
              <button className="filter-chip active">Todas</button>
              <button className="filter-chip">Pendientes</button>
              <button className="filter-chip" style={{color:"var(--danger)"}}>Vencidas</button>
              <button className="filter-chip">Pagadas</button>
            </div>
            <table className="data">
              <thead><tr>
                <th>ID</th><th>Regante</th><th>Concepto</th><th>Periodo</th>
                <th className="num">Monto</th><th className="num">Mora</th><th className="num">Total</th>
                <th>Emisión</th><th>Estado</th><th></th>
              </tr></thead>
              <tbody>
                {SIRDATA.DEUDAS.map(d => {
                  const r = SIRDATA.REGANTES.find(x=>x.codigo===d.reganteCod);
                  return (
                    <tr key={d.id}>
                      <td className="mono">{d.id}</td>
                      <td><div style={{fontWeight:500}}>{r ? SIRDATA.nameOf(r):"—"}</div><div className="mono" style={{fontSize:11,color:"var(--text-3)"}}>{d.reganteCod}</div></td>
                      <td>{d.concepto}</td>
                      <td className="mono">{d.periodo}</td>
                      <td className="num mono">{fmtSoles(d.monto)}</td>
                      <td className="num mono" style={{color: d.mora>0?"var(--danger)":"var(--text-3)"}}>{d.mora>0?fmtSoles(d.mora):"—"}</td>
                      <td className="num mono" style={{fontWeight:600}}>{fmtSoles(d.total)}</td>
                      <td className="mono" style={{fontSize:11.5}}>{d.emision}</td>
                      <td><Pill estado={d.estado}/></td>
                      <td><div className="row-actions"><button onClick={()=>setView({type:"deuda",d})}><Icon name="eye"/></button><button><Icon name="money"/></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {tab === "pagos" && (
          <>
            <div className="toolbar">
              <div className="search"><Icon name="search"/><input placeholder="Buscar por recibo, regante o monto…"/></div>
              <button className="filter-chip active">Todos los medios</button>
              <button className="filter-chip">Efectivo</button>
              <button className="filter-chip">Transferencia</button>
              <button className="filter-chip">Yape/Plin</button>
              <div style={{marginLeft:"auto"}}>
                <button className="btn"><Icon name="calendar"/> Abril 2026</button>
              </div>
            </div>
            <table className="data">
              <thead><tr>
                <th>Recibo</th><th>Fecha</th><th>Regante</th><th>Deuda</th><th>Medio</th>
                <th className="num">Monto</th><th>Usuario</th><th></th>
              </tr></thead>
              <tbody>
                {SIRDATA.PAGOS.map(p => {
                  const r = SIRDATA.REGANTES.find(x=>x.codigo===p.reganteCod);
                  return (
                    <tr key={p.id}>
                      <td className="mono">{p.recibo}</td>
                      <td className="mono" style={{fontSize:11.5}}>{p.fecha}</td>
                      <td>{r ? SIRDATA.nameOf(r) : "—"}</td>
                      <td className="mono" style={{fontSize:11,color:"var(--text-3)"}}>{p.deuda}</td>
                      <td><span className="pill muted">{p.medio}</span></td>
                      <td className="num mono" style={{fontWeight:600}}>{fmtSoles(p.monto)}</td>
                      <td className="mono" style={{fontSize:11.5,color:"var(--text-2)"}}>{p.usuario}</td>
                      <td><div className="row-actions"><button onClick={()=>setView({type:"recibo",p})}><Icon name="printer"/></button><button><Icon name="eye"/></button></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {tab === "conceptos" && (
          <table className="data">
            <thead><tr><th>Código</th><th>Concepto</th><th>Periodicidad</th><th className="num">Monto base</th><th>Estado</th></tr></thead>
            <tbody>
              {SIRDATA.CONCEPTOS.map(c => (
                <tr key={c.codigo}>
                  <td className="mono">{c.codigo}</td><td>{c.nombre}</td>
                  <td><span className="pill muted">{c.codigo === "TAR" ? "Semestral" : c.codigo === "CTA" ? "Anual" : "Variable"}</span></td>
                  <td className="num mono">{fmtSoles(c.monto)}</td>
                  <td><Pill estado="Activo"/></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {tab === "recibos" && (
          <div className="empty">Vista de recibos emitidos — disponible en versión completa.</div>
        )}
      </div>

      {view && view.type === "recibo" && (() => {
        const r = SIRDATA.REGANTES.find(x => x.codigo === view.p.reganteCod);
        return (
          <>
            <div className="drawer-backdrop" onClick={()=>setView(null)}></div>
            <div className="drawer">
              <div className="drawer-head">
                <div>
                  <h3 className="drawer-title">Recibo {view.p.recibo}</h3>
                  <div className="drawer-sub">{view.p.fecha}</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button className="btn"><Icon name="printer"/> Imprimir</button>
                  <button className="btn"><Icon name="download"/> PDF</button>
                  <button className="icon-btn" onClick={()=>setView(null)}><Icon name="x"/></button>
                </div>
              </div>
              <div className="drawer-body" style={{background:"var(--surface-2)"}}>
                <div style={{background:"#fff",border:"1px solid var(--border)",padding:"24px 28px",fontSize:13,maxWidth:520,margin:"0 auto"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",borderBottom:"2px solid var(--primary)",paddingBottom:14,marginBottom:18}}>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <div style={{width:40,height:40,background:"var(--primary)",color:"#fff",borderRadius:"50%",display:"grid",placeItems:"center",fontFamily:"var(--font-display)",fontWeight:600}}>JN</div>
                      <div>
                        <div style={{fontFamily:"var(--font-display)",fontWeight:600,fontSize:14}}>SIR Nasca</div>
                        <div style={{fontSize:10,color:"var(--text-3)",letterSpacing:"0.04em"}}>JUNTA DE USUARIOS DE NASCA</div>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontSize:10,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.06em"}}>Recibo de pago</div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:14,fontWeight:600,marginTop:2}}>{view.p.recibo}</div>
                    </div>
                  </div>
                  <dl className="kv" style={{gridTemplateColumns:"110px 1fr",fontSize:12}}>
                    <dt>Regante</dt><dd>{r ? SIRDATA.nameOf(r) : "—"}</dd>
                    <dt>Código</dt><dd className="mono">{view.p.reganteCod}</dd>
                    <dt>Fecha</dt><dd className="mono">{view.p.fecha}</dd>
                    <dt>Medio de pago</dt><dd>{view.p.medio}</dd>
                    <dt>Concepto</dt><dd>Tarifa de agua 2026 - I</dd>
                  </dl>
                  <div style={{marginTop:18,paddingTop:14,borderTop:"1px dashed var(--border)",display:"flex",justifyContent:"space-between",alignItems:"baseline"}}>
                    <div style={{fontSize:11,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Total pagado</div>
                    <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:600}}>{fmtSoles(view.p.monto)}</div>
                  </div>
                  <div style={{marginTop:24,fontSize:10.5,color:"var(--text-3)",textAlign:"center",letterSpacing:"0.04em"}}>
                    Documento generado por SIR Nasca — usuario: {view.p.usuario}
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

// =================== Reportes ===================
const REPORTES_LIST = [
  { id: "padron", icon: "users", titulo: "Padrón de regantes", desc: "Listado completo con datos personales y adscripción.", formato: ["Excel","PDF"] },
  { id: "parcelas-regante", icon: "land", titulo: "Parcelas por regante", desc: "Detalle de parcelas, cultivos y áreas por titular.", formato: ["Excel","PDF"] },
  { id: "canales-tomas", icon: "canal", titulo: "Canales y tomas", desc: "Inventario de infraestructura hidráulica.", formato: ["Excel","PDF"] },
  { id: "recau-diaria", icon: "wallet", titulo: "Recaudación diaria", desc: "Pagos del día con detalle por medio de pago.", formato: ["Excel","PDF"] },
  { id: "recau-mensual", icon: "trend-up", titulo: "Recaudación mensual", desc: "Resumen mensual con comparativa de campañas.", formato: ["Excel","PDF"] },
  { id: "deuda", icon: "alert", titulo: "Deuda pendiente", desc: "Detalle de deudas activas con antigüedad.", formato: ["Excel","PDF"] },
  { id: "morosidad", icon: "report", titulo: "Morosidad por regante", desc: "Regantes con deudas vencidas y montos.", formato: ["Excel","PDF"] },
  { id: "caudales", icon: "drop", titulo: "Comparativa de caudales", desc: "Caudal autorizado vs medido por toma.", formato: ["Excel","PDF"] },
];

const Reportes = ({ role }) => (
  <div className="page">
    <div className="page-head">
      <div>
        <h1 className="page-title">Reportes</h1>
        <div className="page-subtitle">Genera reportes en Excel o PDF</div>
      </div>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
      {REPORTES_LIST.map(r => (
        <div key={r.id} className="card" style={{padding:"16px 18px",display:"flex",gap:14,alignItems:"flex-start"}}>
          <div style={{width:38,height:38,borderRadius:6,background:"var(--surface-2)",color:"var(--primary)",display:"grid",placeItems:"center",flexShrink:0}}>
            <Icon name={r.icon} size={18}/>
          </div>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:600,fontSize:14}}>{r.titulo}</div>
            <div style={{fontSize:12,color:"var(--text-3)",marginTop:3,lineHeight:1.45}}>{r.desc}</div>
            <div style={{display:"flex",gap:6,marginTop:10}}>
              {r.formato.map(f => (
                <button key={f} className="btn sm">
                  <Icon name={f === "PDF" ? "printer" : "download"} size={12}/>{f}
                </button>
              ))}
              <button className="btn sm ghost">Configurar</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// =================== Auditoría / Config ===================
const Auditoria = () => (
  <div className="page">
    <div className="page-head">
      <div>
        <h1 className="page-title">Auditoría</h1>
        <div className="page-subtitle">Registro cronológico de operaciones del sistema</div>
      </div>
      <div className="page-actions"><button className="btn"><Icon name="download"/> Exportar bitácora</button></div>
    </div>
    <div className="card">
      <div className="toolbar">
        <div className="search"><Icon name="search"/><input placeholder="Buscar usuario, módulo o acción…"/></div>
        <button className="filter-chip active">Todos</button>
        <button className="filter-chip">Crear</button>
        <button className="filter-chip">Editar</button>
        <button className="filter-chip">Eliminar</button>
        <button className="filter-chip">Pagos</button>
      </div>
      <table className="data">
        <thead><tr><th>Fecha/Hora</th><th>Usuario</th><th>Rol</th><th>Acción</th><th>Módulo</th><th>Entidad</th><th>IP</th></tr></thead>
        <tbody>
          {[
            ["2026-04-28 11:24:31","tesoreria01","Tesorería","Crear pago","Pagos","PAG-2026-0140","192.168.1.42"],
            ["2026-04-28 09:50:12","tesoreria01","Tesorería","Crear pago","Pagos","PAG-2026-0139","192.168.1.42"],
            ["2026-04-27 16:08:55","admin","Administrador","Crear pago","Pagos","PAG-2026-0138","192.168.1.10"],
            ["2026-04-27 14:21:08","padron01","Padrón","Editar regante","Padrón","REG-0014","192.168.1.18"],
            ["2026-04-27 10:33:42","tesoreria01","Tesorería","Crear pago","Pagos","PAG-2026-0137","192.168.1.42"],
            ["2026-04-26 17:02:11","tecnico01","Área Técnica","Registrar medición","Tomas","TOM-009","192.168.1.25"],
            ["2026-04-26 14:11:28","tesoreria01","Tesorería","Crear pago","Pagos","PAG-2026-0136","192.168.1.42"],
            ["2026-04-25 09:14:50","admin","Administrador","Crear regante","Padrón","REG-0016","192.168.1.10"],
            ["2026-04-24 16:48:39","tecnico01","Área Técnica","Editar canal","Canales","CAN-04","192.168.1.25"],
          ].map((row, i) => (
            <tr key={i}>
              <td className="mono" style={{fontSize:11.5}}>{row[0]}</td>
              <td className="mono">{row[1]}</td>
              <td><span className="pill muted">{row[2]}</span></td>
              <td>{row[3]}</td>
              <td style={{color:"var(--text-2)",fontSize:12}}>{row[4]}</td>
              <td className="mono">{row[5]}</td>
              <td className="mono" style={{fontSize:11,color:"var(--text-3)"}}>{row[6]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const Configuracion = () => (
  <div className="page">
    <div className="page-head">
      <div>
        <h1 className="page-title">Configuración</h1>
        <div className="page-subtitle">Parámetros generales y usuarios del sistema</div>
      </div>
    </div>
    <div className="row-grid c2">
      <div className="card">
        <div className="card-head"><h3 className="card-title">Datos institucionales</h3></div>
        <div className="card-body">
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="field"><label>Razón social</label><input defaultValue="Junta de Usuarios del Sector Hidráulico Menor Nasca"/></div>
            <div className="field"><label>RUC</label><input defaultValue="20498771234" className="mono"/></div>
            <div className="field"><label>Dirección</label><input defaultValue="Av. Los Incas 423, Nasca, Ica"/></div>
            <div className="field-row">
              <div className="field"><label>Teléfono</label><input defaultValue="(056) 522 100"/></div>
              <div className="field"><label>Correo</label><input defaultValue="contacto@junasca.pe"/></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Campaña actual</label><select defaultValue="2026-I"><option>2026-I</option><option>2026-II</option></select></div>
              <div className="field"><label>Tasa de mora (% mensual)</label><input defaultValue="2.5" className="mono"/></div>
            </div>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-head">
          <h3 className="card-title">Usuarios del sistema</h3>
          <button className="btn sm primary"><Icon name="plus"/> Nuevo</button>
        </div>
        <table className="data">
          <thead><tr><th>Usuario</th><th>Rol</th><th>Estado</th></tr></thead>
          <tbody>
            {SIRDATA.ROLES.map(r => (
              <tr key={r.id}>
                <td>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <div className="role-avatar" style={{width:24,height:24,fontSize:10}}>{r.initials}</div>
                    <div>
                      <div style={{fontWeight:500,fontSize:13}}>{r.name}</div>
                      <div style={{fontSize:11,color:"var(--text-3)",fontFamily:"var(--font-mono)"}}>{r.id}@junasca.pe</div>
                    </div>
                  </div>
                </td>
                <td><span className="pill info">{r.role}</span></td>
                <td><Pill estado="Activo"/></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

Object.assign(window, { Pagos, Reportes, Auditoria, Configuracion });
