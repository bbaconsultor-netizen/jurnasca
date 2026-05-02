// SIR Nasca — Parcelas, Canales, Tomas modules

// =================== Drawer (generic edit) ===================
const ViewDrawer = ({ title, sub, children, onClose, onEdit }) => (
  <>
    <div className="drawer-backdrop" onClick={onClose}></div>
    <div className="drawer">
      <div className="drawer-head">
        <div>
          <h3 className="drawer-title">{title}</h3>
          <div className="drawer-sub">{sub}</div>
        </div>
        <div style={{display:"flex",gap:6}}>
          {onEdit && <button className="btn"><Icon name="edit"/> Editar</button>}
          <button className="icon-btn" onClick={onClose}><Icon name="x"/></button>
        </div>
      </div>
      <div className="drawer-body">{children}</div>
      <div className="drawer-foot">
        <button className="btn ghost danger-ghost"><Icon name="trash"/> Desactivar</button>
        <button className="btn">Cerrar</button>
        <button className="btn primary">Guardar cambios</button>
      </div>
    </div>
  </>
);

// =================== Parcelas ===================
const Parcelas = ({ role }) => {
  const [q, setQ] = React.useState("");
  const [view, setView] = React.useState(null);
  const [sectorFilter, setSectorFilter] = React.useState("Todos");
  const sectors = [...new Set(SIRDATA.PARCELAS.map(p => p.sector))];
  const filtered = SIRDATA.PARCELAS.filter(p => {
    const r = SIRDATA.REGANTES.find(x => x.codigo === p.reganteCod);
    const text = (p.codigo + " " + p.predio + " " + (r?SIRDATA.nameOf(r):"") + " " + p.canal).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (sectorFilter !== "Todos" && p.sector !== sectorFilter) return false;
    return true;
  });
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Parcelas</h1>
          <div className="page-subtitle">{SIRDATA.PARCELAS.length} parcelas · {SIRDATA.PARCELAS.reduce((s,p)=>s+p.areaTotal,0).toFixed(1)} ha totales</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/> Exportar</button>
          <button className="btn primary"><Icon name="plus"/> Nueva parcela</button>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search"><Icon name="search"/><input placeholder="Buscar por regante, predio o código…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className={"filter-chip" + (sectorFilter==="Todos"?" active":"")} onClick={()=>setSectorFilter("Todos")}>Todos</button>
          {sectors.map(s => <button key={s} className={"filter-chip"+(sectorFilter===s?" active":"")} onClick={()=>setSectorFilter(s)}>{s}</button>)}
          <div style={{marginLeft:"auto"}}><button className="btn"><Icon name="filter"/> Más filtros</button></div>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Código</th><th>Predio</th><th>Regante</th><th>Sector</th><th>Cultivo</th>
              <th className="num">Área (ha)</th><th>Canal · Toma</th><th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(p => {
                const r = SIRDATA.REGANTES.find(x => x.codigo === p.reganteCod);
                return (
                  <tr key={p.codigo} onClick={()=>setView(p)} style={{cursor:"pointer"}}>
                    <td className="mono">{p.codigo}</td>
                    <td>
                      <div style={{fontWeight:500}}>{p.predio}</div>
                      <div style={{fontSize:11,color:"var(--text-3)",fontFamily:"var(--font-mono)"}}>{p.ucat}</div>
                    </td>
                    <td>{r ? SIRDATA.nameOf(r) : "—"}</td>
                    <td style={{fontSize:12}}>{p.sector}</td>
                    <td>{p.cultivo}</td>
                    <td className="num mono">{p.areaTotal}</td>
                    <td className="mono" style={{fontSize:11,color:"var(--text-2)"}}>{p.canal} · {p.toma}</td>
                    <td><Pill estado={p.estado}/></td>
                    <td><div className="row-actions"><button onClick={(e)=>{e.stopPropagation();setView(p);}}><Icon name="eye"/></button><button onClick={(e)=>e.stopPropagation()}><Icon name="edit"/></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {view && (
        <ViewDrawer title={view.predio} sub={<><span className="mono">{view.codigo}</span> · {view.ucat}</>} onClose={()=>setView(null)} onEdit>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section>
              <h4 className="section-title">Identificación</h4>
              <dl className="kv">
                <dt>Código</dt><dd className="mono">{view.codigo}</dd>
                <dt>Predio</dt><dd>{view.predio}</dd>
                <dt>Unidad catastral</dt><dd className="mono">{view.ucat}</dd>
                <dt>Estado</dt><dd><Pill estado={view.estado}/></dd>
              </dl>
            </section>
            <section>
              <h4 className="section-title">Titularidad</h4>
              <dl className="kv">
                <dt>Regante</dt><dd>{(()=>{ const r = SIRDATA.REGANTES.find(x=>x.codigo===view.reganteCod); return r?<><span className="mono">{r.codigo}</span> · {SIRDATA.nameOf(r)}</>:"—"; })()}</dd>
                <dt>Comisión</dt><dd>{view.comision}</dd>
                <dt>Comité</dt><dd>{view.comite}</dd>
              </dl>
            </section>
            <section>
              <h4 className="section-title">Riego</h4>
              <dl className="kv">
                <dt>Cultivo principal</dt><dd>{view.cultivo}</dd>
                <dt>Área total</dt><dd className="mono">{view.areaTotal} ha</dd>
                <dt>Área bajo riego</dt><dd className="mono">{view.areaRiego} ha</dd>
                <dt>Canal asociado</dt><dd className="mono">{view.canal}</dd>
                <dt>Toma asociada</dt><dd className="mono">{view.toma}</dd>
              </dl>
            </section>
            <section>
              <h4 className="section-title">Ubicación</h4>
              <dl className="kv">
                <dt>Sector</dt><dd>{view.sector}</dd>
                <dt>Ubicación</dt><dd>{view.ubicacion}</dd>
                <dt>Coordenadas</dt><dd className="mono">{view.coords}</dd>
              </dl>
            </section>
          </div>
        </ViewDrawer>
      )}
    </div>
  );
};

// =================== Canales ===================
const Canales = ({ role }) => {
  const [view, setView] = React.useState(null);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Canales</h1>
          <div className="page-subtitle">{SIRDATA.CANALES.length} canales · {SIRDATA.CANALES.reduce((s,c)=>s+c.longitud,0).toFixed(1)} km de red</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/> Exportar</button>
          <button className="btn primary"><Icon name="plus"/> Nuevo canal</button>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search"><Icon name="search"/><input placeholder="Buscar canal por código o nombre…"/></div>
          <button className="filter-chip active">Todos</button>
          {["Principal","Secundario","Lateral","Acequia"].map(t=><button key={t} className="filter-chip">{t}</button>)}
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Código</th><th>Nombre</th><th>Tipo</th><th>Comisión</th>
              <th className="num">Long. (km)</th><th className="num">Q máx (m³/s)</th>
              <th className="num">Tomas</th><th className="num">Parcelas</th><th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {SIRDATA.CANALES.map(c => {
                const tomas = SIRDATA.TOMAS.filter(t=>t.canal===c.codigo).length;
                const parcelas = SIRDATA.PARCELAS.filter(p=>p.canal===c.codigo).length;
                return (
                  <tr key={c.codigo} onClick={()=>setView(c)} style={{cursor:"pointer"}}>
                    <td className="mono">{c.codigo}</td>
                    <td><div style={{fontWeight:500}}>{c.nombre}</div><div style={{fontSize:11,color:"var(--text-3)"}}>{c.uIni} → {c.uFin}</div></td>
                    <td><span className="pill muted">{c.tipo}</span></td>
                    <td style={{fontSize:12}}>{c.comision.replace("C.U. ","")}</td>
                    <td className="num mono">{c.longitud}</td>
                    <td className="num mono">{c.caudalMax}</td>
                    <td className="num mono">{tomas}</td>
                    <td className="num mono">{parcelas}</td>
                    <td><Pill estado={c.estado}/></td>
                    <td><div className="row-actions"><button onClick={(e)=>{e.stopPropagation();setView(c);}}><Icon name="eye"/></button><button onClick={(e)=>e.stopPropagation()}><Icon name="edit"/></button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {view && (
        <ViewDrawer title={view.nombre} sub={<><span className="mono">{view.codigo}</span> · {view.tipo}</>} onClose={()=>setView(null)} onEdit>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section>
              <h4 className="section-title">Generales</h4>
              <dl className="kv">
                <dt>Código</dt><dd className="mono">{view.codigo}</dd>
                <dt>Nombre</dt><dd>{view.nombre}</dd>
                <dt>Tipo</dt><dd><span className="pill muted">{view.tipo}</span></dd>
                <dt>Comisión</dt><dd>{view.comision}</dd>
                <dt>Estado</dt><dd><Pill estado={view.estado}/></dd>
              </dl>
            </section>
            <section>
              <h4 className="section-title">Caracterización</h4>
              <dl className="kv">
                <dt>Longitud estimada</dt><dd className="mono">{view.longitud} km</dd>
                <dt>Caudal máximo</dt><dd className="mono">{view.caudalMax} m³/s</dd>
                <dt>Ubicación inicial</dt><dd>{view.uIni}</dd>
                <dt>Ubicación final</dt><dd>{view.uFin}</dd>
              </dl>
            </section>
            <section>
              <h4 className="section-title">Tomas asociadas</h4>
              <div className="card" style={{boxShadow:"none"}}>
                <table className="data">
                  <thead><tr><th>Código</th><th>Nombre</th><th className="num">Q aut.</th><th className="num">Q med.</th><th>Estado</th></tr></thead>
                  <tbody>
                    {SIRDATA.TOMAS.filter(t=>t.canal===view.codigo).map(t=>(
                      <tr key={t.codigo}>
                        <td className="mono">{t.codigo}</td><td>{t.nombre}</td>
                        <td className="num mono">{t.caudalAut}</td><td className="num mono">{t.caudalMed}</td>
                        <td><Pill estado={t.estado}/></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </ViewDrawer>
      )}
    </div>
  );
};

// =================== Tomas ===================
const Tomas = ({ role }) => {
  const [view, setView] = React.useState(null);
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tomas de agua</h1>
          <div className="page-subtitle">{SIRDATA.TOMAS.length} tomas · Caudal autorizado total {SIRDATA.TOMAS.reduce((s,t)=>s+t.caudalAut,0).toFixed(2)} m³/s</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/> Exportar</button>
          <button className="btn primary"><Icon name="plus"/> Nueva toma</button>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search"><Icon name="search"/><input placeholder="Buscar toma…"/></div>
          <button className="filter-chip active">Todas</button>
          <button className="filter-chip">Operativas</button>
          <button className="filter-chip">Mantenimiento</button>
          <button className="filter-chip" style={{color:"var(--danger)",borderColor:"var(--danger-bg)",background:"var(--danger-bg)"}}>⚠ Caudal bajo</button>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Código</th><th>Nombre</th><th>Canal</th><th>Comité</th>
              <th className="num">Q aut. (m³/s)</th><th className="num">Q med. (m³/s)</th><th style={{minWidth:120}}>Comparativa</th>
              <th>Última med.</th><th>Estado</th>
            </tr></thead>
            <tbody>
              {SIRDATA.TOMAS.map(t => {
                const ratio = t.caudalMed / t.caudalAut;
                const pct = Math.min(100, Math.round(ratio * 100));
                const color = ratio < 0.75 ? "var(--danger)" : ratio < 0.9 ? "var(--warning)" : "var(--success)";
                return (
                  <tr key={t.codigo} onClick={()=>setView(t)} style={{cursor:"pointer"}}>
                    <td className="mono">{t.codigo}</td>
                    <td><div style={{fontWeight:500}}>{t.nombre}</div><div style={{fontSize:11,color:"var(--text-3)"}}>{t.ubicacion}</div></td>
                    <td className="mono" style={{fontSize:12}}>{t.canal}</td>
                    <td style={{fontSize:12,color:"var(--text-2)"}}>{t.comite.replace("Comité ","")}</td>
                    <td className="num mono">{t.caudalAut.toFixed(2)}</td>
                    <td className="num mono" style={{color, fontWeight:600}}>{t.caudalMed.toFixed(2)}</td>
                    <td>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{flex:1,height:5,background:"var(--surface-2)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:pct+"%",height:"100%",background:color}}></div>
                        </div>
                        <span style={{fontSize:11,fontFamily:"var(--font-mono)",color,minWidth:30,textAlign:"right"}}>{pct}%</span>
                      </div>
                    </td>
                    <td style={{fontSize:11.5,fontFamily:"var(--font-mono)"}}>{t.fechaMed}</td>
                    <td><Pill estado={t.estado}/></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {view && (
        <ViewDrawer title={view.nombre} sub={<><span className="mono">{view.codigo}</span> · Canal {view.canal}</>} onClose={()=>setView(null)} onEdit>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section>
              <h4 className="section-title">Caudal</h4>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div style={{padding:"12px 14px",background:"var(--surface-2)",borderRadius:6}}>
                  <div style={{fontSize:10.5,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Autorizado</div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:600,marginTop:4}}>{view.caudalAut} <span style={{fontSize:13,color:"var(--text-3)",fontWeight:400}}>m³/s</span></div>
                </div>
                <div style={{padding:"12px 14px",background:"var(--surface-2)",borderRadius:6}}>
                  <div style={{fontSize:10.5,color:"var(--text-3)",textTransform:"uppercase",letterSpacing:"0.06em",fontWeight:600}}>Medido</div>
                  <div style={{fontFamily:"var(--font-display)",fontSize:24,fontWeight:600,marginTop:4,color: view.caudalMed < view.caudalAut * 0.9 ? "var(--danger)" : "var(--success)"}}>
                    {view.caudalMed} <span style={{fontSize:13,color:"var(--text-3)",fontWeight:400}}>m³/s</span>
                  </div>
                </div>
              </div>
            </section>
            <section>
              <h4 className="section-title">Identificación</h4>
              <dl className="kv">
                <dt>Código</dt><dd className="mono">{view.codigo}</dd>
                <dt>Canal asociado</dt><dd className="mono">{view.canal}</dd>
                <dt>Comisión</dt><dd>{view.comision}</dd>
                <dt>Comité</dt><dd>{view.comite}</dd>
                <dt>Ubicación</dt><dd>{view.ubicacion}</dd>
                <dt>Estado</dt><dd><Pill estado={view.estado}/></dd>
              </dl>
            </section>
            <section>
              <h4 className="section-title">Última medición</h4>
              <dl className="kv">
                <dt>Fecha</dt><dd className="mono">{view.fechaMed}</dd>
                <dt>Responsable</dt><dd>{view.responsable}</dd>
              </dl>
            </section>
            <section>
              <h4 className="section-title">Parcelas conectadas</h4>
              <div className="card" style={{boxShadow:"none"}}>
                <table className="data">
                  <thead><tr><th>Código</th><th>Predio</th><th>Cultivo</th><th className="num">Área</th></tr></thead>
                  <tbody>
                    {SIRDATA.PARCELAS.filter(p=>p.toma===view.codigo).map(p=>(
                      <tr key={p.codigo}>
                        <td className="mono">{p.codigo}</td><td>{p.predio}</td><td>{p.cultivo}</td><td className="num mono">{p.areaTotal} ha</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </ViewDrawer>
      )}
    </div>
  );
};

Object.assign(window, { Parcelas, Canales, Tomas, ViewDrawer });
