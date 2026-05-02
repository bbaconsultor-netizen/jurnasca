// SIR Nasca v2 — Modules v2 (tabs, mobile, role-aware)

const ParcelasV2 = ({ role, openCreate, setOpenCreate }) => {
  const [view, setView] = React.useState(null);
  const [edit, setEdit] = React.useState(null);
  const [q, setQ] = React.useState("");
  const [sectorFilter, setSectorFilter] = React.useState("Todos");
  const [parcelas, setParcelas] = React.useState([...SIRDATA.PARCELAS]);
  const readonly = !can(role, "write");
  const sectors = [...new Set(SIRDATA.PARCELAS.map(p => p.sector))];

  const filtered = parcelas.filter(p => {
    const r = SIRDATA.REGANTES.find(x => x.codigo === p.reganteCod);
    const text = (p.codigo + " " + p.predio + " " + (r?SIRDATA.nameOf(r):"") + " " + p.canal).toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (sectorFilter !== "Todos" && p.sector !== sectorFilter) return false;
    return true;
  });

  const fields = [
    { name:"codigo", label:"Código de parcela", required:true, mono:true, default:`PAR-${String(parcelas.length+1).padStart(4,"0")}`, section:"Identificación" },
    { name:"predio", label:"Nombre del predio", required:true, section:"Identificación" },
    { name:"ucat", label:"Unidad catastral", mono:true, section:"Identificación" },
    { name:"reganteCod", label:"Regante titular", required:true, type:"select", section:"Identificación",
      options: SIRDATA.REGANTES.map(r => ({ value:r.codigo, label:`${r.codigo} · ${SIRDATA.nameOf(r)}` })) },
    { name:"comision", label:"Comisión", type:"select", section:"Ubicación", options:SIRDATA.COMISIONES, required:true },
    { name:"comite", label:"Comité", type:"select", section:"Ubicación", options:SIRDATA.COMITES, required:true },
    { name:"sector", label:"Sector", section:"Ubicación" },
    { name:"ubicacion", label:"Ubicación detallada", section:"Ubicación" },
    { name:"coords", label:"Coordenadas (click en el mapa)", type:"map", section:"Ubicación", span:2 },
    { name:"areaTotal", label:"Área total (ha)", type:"number", section:"Riego", required:true, mono:true },
    { name:"areaRiego", label:"Área bajo riego (ha)", type:"number", section:"Riego", mono:true },
    { name:"cultivo", label:"Cultivo principal", type:"select", section:"Riego", options:SIRDATA.CULTIVOS },
    { name:"canal", label:"Canal asociado", type:"select", section:"Riego", options: SIRDATA.CANALES.map(c => ({value:c.codigo, label:`${c.codigo} · ${c.nombre}`})) },
    { name:"toma", label:"Toma asociada", type:"select", section:"Riego", options: SIRDATA.TOMAS.map(t => ({value:t.codigo, label:`${t.codigo} · ${t.nombre}`})) },
    { name:"estado", label:"Estado", type:"select", section:"Riego", options:["Activa","Inactiva"], default:"Activa" },
    { name:"obs", label:"Observaciones", type:"textarea", span:2 },
  ];

  const onSave = (vals) => { setParcelas(ps => [{...vals, areaTotal:+vals.areaTotal, areaRiego:+vals.areaRiego}, ...ps]); setOpenCreate(false); };
  const onSaveEdit = (vals) => { setParcelas(ps => ps.map(p => p.codigo === edit.codigo ? {...p, ...vals, areaTotal:+vals.areaTotal, areaRiego:+vals.areaRiego} : p)); setEdit(null); };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Parcelas</h1>
          <div className="page-subtitle">{parcelas.length} parcelas · {parcelas.reduce((s,p)=>s+p.areaTotal,0).toFixed(1)} ha totales</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/><span className="table-mobile-hide">Exportar</span></button>
          <button className="btn primary" disabled={readonly} onClick={()=>setOpenCreate(true)}><Icon name="plus"/> Nueva parcela</button>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search"><Icon name="search"/><input placeholder="Buscar por regante, predio o código…" value={q} onChange={e=>setQ(e.target.value)}/></div>
          <button className={"filter-chip" + (sectorFilter==="Todos"?" active":"")} onClick={()=>setSectorFilter("Todos")}>Todos</button>
          {sectors.map(s => <button key={s} className={"filter-chip"+(sectorFilter===s?" active":"")} onClick={()=>setSectorFilter(s)}>{s}</button>)}
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Código</th><th>Predio</th><th className="table-mobile-hide">Regante</th>
              <th className="table-mobile-hide">Sector</th><th>Cultivo</th>
              <th className="num">Área</th><th className="mono table-mobile-hide">Canal · Toma</th>
              <th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {filtered.map(p => {
                const r = SIRDATA.REGANTES.find(x => x.codigo === p.reganteCod);
                return (
                  <tr key={p.codigo} onClick={()=>setView(p)} style={{cursor:"pointer"}}>
                    <td className="mono">{p.codigo}</td>
                    <td><div style={{fontWeight:500}}>{p.predio}</div><div style={{fontSize:11,color:"var(--text-3)",fontFamily:"var(--font-mono)"}}>{p.ucat}</div></td>
                    <td className="table-mobile-hide">{r ? SIRDATA.nameOf(r) : "—"}</td>
                    <td className="table-mobile-hide" style={{fontSize:12}}>{p.sector}</td>
                    <td>{p.cultivo}</td>
                    <td className="num mono">{p.areaTotal} ha</td>
                    <td className="mono table-mobile-hide" style={{fontSize:11,color:"var(--text-2)"}}>{p.canal} · {p.toma}</td>
                    <td><Pill estado={p.estado}/></td>
                    <td><div className="row-actions">
                      <button onClick={(e)=>{e.stopPropagation();setView(p);}}><Icon name="eye"/></button>
                      {!readonly && <button onClick={(e)=>{e.stopPropagation();setEdit(p);}}><Icon name="edit"/></button>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {view && (
        <ViewDrawer title={view.predio} sub={<><span className="mono">{view.codigo}</span> · {view.ucat}</>} onClose={()=>setView(null)} onEdit={!readonly}>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section><h4 className="section-title">Identificación</h4>
              <dl className="kv">
                <dt>Código</dt><dd className="mono">{view.codigo}</dd>
                <dt>Predio</dt><dd>{view.predio}</dd>
                <dt>Unidad catastral</dt><dd className="mono">{view.ucat}</dd>
                <dt>Estado</dt><dd><Pill estado={view.estado}/></dd>
              </dl></section>
            <section><h4 className="section-title">Titularidad</h4>
              <dl className="kv">
                <dt>Regante</dt><dd>{(()=>{ const r = SIRDATA.REGANTES.find(x=>x.codigo===view.reganteCod); return r?<><span className="mono">{r.codigo}</span> · {SIRDATA.nameOf(r)}</>:"—"; })()}</dd>
                <dt>Comisión</dt><dd>{view.comision}</dd>
                <dt>Comité</dt><dd>{view.comite}</dd>
              </dl></section>
            <section><h4 className="section-title">Riego</h4>
              <dl className="kv">
                <dt>Cultivo principal</dt><dd>{view.cultivo}</dd>
                <dt>Área total</dt><dd className="mono">{view.areaTotal} ha</dd>
                <dt>Área bajo riego</dt><dd className="mono">{view.areaRiego} ha</dd>
                <dt>Canal asociado</dt><dd className="mono">{view.canal}</dd>
                <dt>Toma asociada</dt><dd className="mono">{view.toma}</dd>
              </dl></section>
            <section><h4 className="section-title">Ubicación</h4>
              <dl className="kv">
                <dt>Sector</dt><dd>{view.sector}</dd>
                <dt>Ubicación</dt><dd>{view.ubicacion}</dd>
                <dt>Coordenadas</dt><dd className="mono">{view.coords}</dd>
              </dl></section>
          </div>
        </ViewDrawer>
      )}
      {openCreate && <FormModal title="Nueva parcela" fields={fields} onClose={()=>setOpenCreate(false)} onSave={onSave}/>}
      {edit && <FormModal mode="edit" title={`Editar ${edit.predio}`} sub={<span className="mono">{edit.codigo}</span>} fields={fields} initial={edit} onClose={()=>setEdit(null)} onSave={onSaveEdit}/>}
    </div>
  );
};

const CanalesV2 = ({ role, openCreate, setOpenCreate }) => {
  const [view, setView] = React.useState(null);
  const [edit, setEdit] = React.useState(null);
  const [canales, setCanales] = React.useState([...SIRDATA.CANALES]);
  const readonly = !can(role, "write");

  const fields = [
    { name:"codigo", label:"Código", required:true, mono:true, default:`CAN-${String(canales.length+1).padStart(2,"0")}`, section:"Generales" },
    { name:"nombre", label:"Nombre", required:true, section:"Generales" },
    { name:"tipo", label:"Tipo", type:"select", required:true, options:["Principal","Secundario","Lateral","Acequia"], section:"Generales" },
    { name:"comision", label:"Comisión responsable", type:"select", options:SIRDATA.COMISIONES, section:"Generales" },
    { name:"longitud", label:"Longitud estimada (km)", type:"number", mono:true, section:"Caracterización" },
    { name:"caudalMax", label:"Caudal máximo (m³/s)", type:"number", mono:true, section:"Caracterización" },
    { name:"uIni", label:"Ubicación inicial", section:"Caracterización" },
    { name:"uFin", label:"Ubicación final", section:"Caracterización" },
    { name:"estado", label:"Estado", type:"select", options:["Operativo","Mantenimiento","Inactivo"], default:"Operativo" },
    { name:"obs", label:"Observaciones", type:"textarea", span:2 },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Canales</h1>
          <div className="page-subtitle">{canales.length} canales · {canales.reduce((s,c)=>s+c.longitud,0).toFixed(1)} km de red</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/><span className="table-mobile-hide">Exportar</span></button>
          <button className="btn primary" disabled={readonly} onClick={()=>setOpenCreate(true)}><Icon name="plus"/> Nuevo canal</button>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search"><Icon name="search"/><input placeholder="Buscar canal…"/></div>
          <button className="filter-chip active">Todos</button>
          {["Principal","Secundario","Lateral","Acequia"].map(t=><button key={t} className="filter-chip">{t}</button>)}
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Código</th><th>Nombre</th><th className="table-mobile-hide">Tipo</th>
              <th className="table-mobile-hide">Comisión</th>
              <th className="num">Long.</th><th className="num table-mobile-hide">Q máx</th>
              <th className="num table-mobile-hide">Tomas</th><th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {canales.map(c => {
                const tomas = SIRDATA.TOMAS.filter(t=>t.canal===c.codigo).length;
                return (
                  <tr key={c.codigo} onClick={()=>setView(c)} style={{cursor:"pointer"}}>
                    <td className="mono">{c.codigo}</td>
                    <td><div style={{fontWeight:500}}>{c.nombre}</div><div style={{fontSize:11,color:"var(--text-3)"}}>{c.uIni} → {c.uFin}</div></td>
                    <td className="table-mobile-hide"><span className="pill muted">{c.tipo}</span></td>
                    <td className="table-mobile-hide" style={{fontSize:12}}>{c.comision.replace("C.U. ","")}</td>
                    <td className="num mono">{c.longitud}</td>
                    <td className="num mono table-mobile-hide">{c.caudalMax}</td>
                    <td className="num mono table-mobile-hide">{tomas}</td>
                    <td><Pill estado={c.estado}/></td>
                    <td><div className="row-actions">
                      <button onClick={(e)=>{e.stopPropagation();setView(c);}}><Icon name="eye"/></button>
                      {!readonly && <button onClick={(e)=>{e.stopPropagation();setEdit(c);}}><Icon name="edit"/></button>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {view && (
        <ViewDrawer title={view.nombre} sub={<><span className="mono">{view.codigo}</span> · {view.tipo}</>} onClose={()=>setView(null)} onEdit={!readonly}>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section><h4 className="section-title">Generales</h4>
              <dl className="kv">
                <dt>Código</dt><dd className="mono">{view.codigo}</dd>
                <dt>Nombre</dt><dd>{view.nombre}</dd>
                <dt>Tipo</dt><dd><span className="pill muted">{view.tipo}</span></dd>
                <dt>Comisión</dt><dd>{view.comision}</dd>
                <dt>Estado</dt><dd><Pill estado={view.estado}/></dd>
              </dl></section>
            <section><h4 className="section-title">Caracterización</h4>
              <dl className="kv">
                <dt>Longitud</dt><dd className="mono">{view.longitud} km</dd>
                <dt>Caudal máximo</dt><dd className="mono">{view.caudalMax} m³/s</dd>
                <dt>Inicio</dt><dd>{view.uIni}</dd>
                <dt>Fin</dt><dd>{view.uFin}</dd>
              </dl></section>
            <section><h4 className="section-title">Tomas asociadas</h4>
              <div className="card" style={{boxShadow:"none"}}>
                <table className="data"><thead><tr><th>Código</th><th>Nombre</th><th className="num">Q aut.</th><th className="num">Q med.</th><th>Estado</th></tr></thead>
                <tbody>
                  {SIRDATA.TOMAS.filter(t=>t.canal===view.codigo).map(t=>(
                    <tr key={t.codigo}><td className="mono">{t.codigo}</td><td>{t.nombre}</td><td className="num mono">{t.caudalAut}</td><td className="num mono">{t.caudalMed}</td><td><Pill estado={t.estado}/></td></tr>
                  ))}
                </tbody></table>
              </div></section>
          </div>
        </ViewDrawer>
      )}
      {openCreate && <FormModal title="Nuevo canal" fields={fields} onClose={()=>setOpenCreate(false)} onSave={(v)=>{setCanales(cs=>[{...v,longitud:+v.longitud,caudalMax:+v.caudalMax},...cs]);setOpenCreate(false);}}/>}
      {edit && <FormModal mode="edit" title={`Editar ${edit.nombre}`} fields={fields} initial={edit} onClose={()=>setEdit(null)} onSave={(v)=>{setCanales(cs=>cs.map(c=>c.codigo===edit.codigo?{...c,...v,longitud:+v.longitud,caudalMax:+v.caudalMax}:c));setEdit(null);}}/>}
    </div>
  );
};

const TomasV2 = ({ role, openCreate, setOpenCreate }) => {
  const [view, setView] = React.useState(null);
  const [edit, setEdit] = React.useState(null);
  const [tomas, setTomas] = React.useState([...SIRDATA.TOMAS]);
  const readonly = !can(role, "write");

  const fields = [
    { name:"codigo", label:"Código", required:true, mono:true, default:`TOM-${String(tomas.length+1).padStart(3,"0")}`, section:"Identificación" },
    { name:"nombre", label:"Nombre", required:true, section:"Identificación" },
    { name:"canal", label:"Canal asociado", type:"select", required:true, options:SIRDATA.CANALES.map(c=>({value:c.codigo,label:`${c.codigo} · ${c.nombre}`})), section:"Identificación" },
    { name:"comision", label:"Comisión", type:"select", options:SIRDATA.COMISIONES, section:"Identificación" },
    { name:"comite", label:"Comité", type:"select", options:SIRDATA.COMITES, section:"Identificación" },
    { name:"ubicacion", label:"Ubicación", section:"Identificación" },
    { name:"caudalAut", label:"Caudal autorizado (m³/s)", type:"number", mono:true, section:"Caudal" },
    { name:"caudalMed", label:"Último caudal medido", type:"number", mono:true, section:"Caudal" },
    { name:"fechaMed", label:"Fecha de medición", type:"date", section:"Caudal" },
    { name:"responsable", label:"Responsable", section:"Caudal" },
    { name:"estado", label:"Estado", type:"select", options:["Operativo","Mantenimiento","Inactivo"], default:"Operativo" },
    { name:"obs", label:"Observaciones", type:"textarea", span:2 },
  ];

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tomas de agua</h1>
          <div className="page-subtitle">{tomas.length} tomas · Caudal aut. {tomas.reduce((s,t)=>s+t.caudalAut,0).toFixed(2)} m³/s</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/><span className="table-mobile-hide">Exportar</span></button>
          <button className="btn primary" disabled={readonly} onClick={()=>setOpenCreate(true)}><Icon name="plus"/> Nueva toma</button>
        </div>
      </div>
      <div className="card">
        <div className="toolbar">
          <div className="search"><Icon name="search"/><input placeholder="Buscar toma…"/></div>
          <button className="filter-chip active">Todas</button>
          <button className="filter-chip" style={{color:"var(--danger)"}}>⚠ Caudal bajo</button>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead><tr>
              <th>Código</th><th>Nombre</th><th className="table-mobile-hide">Canal</th>
              <th className="num table-mobile-hide">Q aut.</th><th className="num">Q med.</th>
              <th className="table-mobile-hide" style={{minWidth:120}}>Comparativa</th>
              <th>Estado</th><th></th>
            </tr></thead>
            <tbody>
              {tomas.map(t => {
                const ratio = t.caudalMed / t.caudalAut;
                const pct = Math.min(100, Math.round(ratio * 100));
                const color = ratio < 0.75 ? "var(--danger)" : ratio < 0.9 ? "var(--warning)" : "var(--success)";
                return (
                  <tr key={t.codigo} onClick={()=>setView(t)} style={{cursor:"pointer"}}>
                    <td className="mono">{t.codigo}</td>
                    <td><div style={{fontWeight:500}}>{t.nombre}</div><div style={{fontSize:11,color:"var(--text-3)"}}>{t.ubicacion}</div></td>
                    <td className="mono table-mobile-hide" style={{fontSize:12}}>{t.canal}</td>
                    <td className="num mono table-mobile-hide">{t.caudalAut.toFixed(2)}</td>
                    <td className="num mono" style={{color, fontWeight:600}}>{t.caudalMed.toFixed(2)}</td>
                    <td className="table-mobile-hide">
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{flex:1,height:5,background:"var(--surface-2)",borderRadius:3,overflow:"hidden"}}>
                          <div style={{width:pct+"%",height:"100%",background:color}}></div>
                        </div>
                        <span style={{fontSize:11,fontFamily:"var(--font-mono)",color,minWidth:30,textAlign:"right"}}>{pct}%</span>
                      </div>
                    </td>
                    <td><Pill estado={t.estado}/></td>
                    <td><div className="row-actions">
                      <button onClick={(e)=>{e.stopPropagation();setView(t);}}><Icon name="eye"/></button>
                      {!readonly && <button onClick={(e)=>{e.stopPropagation();setEdit(t);}}><Icon name="edit"/></button>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {view && (
        <ViewDrawer title={view.nombre} sub={<><span className="mono">{view.codigo}</span> · Canal {view.canal}</>} onClose={()=>setView(null)} onEdit={!readonly}>
          <div style={{display:"flex",flexDirection:"column",gap:20}}>
            <section><h4 className="section-title">Caudal</h4>
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
              </div></section>
            <section><h4 className="section-title">Identificación</h4>
              <dl className="kv">
                <dt>Código</dt><dd className="mono">{view.codigo}</dd>
                <dt>Canal</dt><dd className="mono">{view.canal}</dd>
                <dt>Comisión</dt><dd>{view.comision}</dd>
                <dt>Comité</dt><dd>{view.comite}</dd>
                <dt>Ubicación</dt><dd>{view.ubicacion}</dd>
                <dt>Estado</dt><dd><Pill estado={view.estado}/></dd>
              </dl></section>
            <section><h4 className="section-title">Última medición</h4>
              <dl className="kv">
                <dt>Fecha</dt><dd className="mono">{view.fechaMed}</dd>
                <dt>Responsable</dt><dd>{view.responsable}</dd>
              </dl></section>
            <section><h4 className="section-title">Parcelas conectadas</h4>
              <div className="card" style={{boxShadow:"none"}}>
                <table className="data"><thead><tr><th>Código</th><th>Predio</th><th>Cultivo</th><th className="num">Área</th></tr></thead>
                <tbody>
                  {SIRDATA.PARCELAS.filter(p=>p.toma===view.codigo).map(p=>(
                    <tr key={p.codigo}><td className="mono">{p.codigo}</td><td>{p.predio}</td><td>{p.cultivo}</td><td className="num mono">{p.areaTotal} ha</td></tr>
                  ))}
                </tbody></table>
              </div></section>
          </div>
        </ViewDrawer>
      )}
      {openCreate && <FormModal title="Nueva toma de agua" fields={fields} onClose={()=>setOpenCreate(false)} onSave={(v)=>{setTomas(ts=>[{...v,caudalAut:+v.caudalAut,caudalMed:+v.caudalMed},...ts]);setOpenCreate(false);}}/>}
      {edit && <FormModal mode="edit" title={`Editar ${edit.nombre}`} fields={fields} initial={edit} onClose={()=>setEdit(null)} onSave={(v)=>{setTomas(ts=>ts.map(t=>t.codigo===edit.codigo?{...t,...v,caudalAut:+v.caudalAut,caudalMed:+v.caudalMed}:t));setEdit(null);}}/>}
    </div>
  );
};

Object.assign(window, { ParcelasV2, CanalesV2, TomasV2 });
