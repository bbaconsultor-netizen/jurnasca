// SIR Nasca — Dashboard

const fmtSoles = (n) => "S/ " + n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtInt = (n) => n.toLocaleString("es-PE");

const KPI = ({ label, value, unit, icon, delta, deltaDir }) => (
  <div className="kpi">
    <div className="kpi-icon"><Icon name={icon} /></div>
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">{value}{unit && <span className="unit">{unit}</span>}</div>
    {delta && (
      <div className="kpi-meta">
        <span className={"kpi-delta " + (deltaDir || "up")}>
          <Icon name={deltaDir === "down" ? "arrow-down" : "arrow-up"} size={11} /> {delta}
        </span>
        <span>vs mes anterior</span>
      </div>
    )}
  </div>
);

// Recaudación bar+line chart (SVG)
const RecaudacionChart = () => {
  const data = SIRDATA.RECAUDACION_MENSUAL;
  const w = 640, h = 200, pad = { l: 44, r: 12, t: 16, b: 26 };
  const max = Math.max(...data.map(d => d.monto)) * 1.1;
  const bw = (w - pad.l - pad.r) / data.length;
  const yTicks = [0, 10000, 20000, 30000];
  const xPt = (i) => pad.l + i * bw + bw / 2;
  const yPt = (v) => h - pad.b - ((v / max) * (h - pad.t - pad.b));
  const path = data.map((d, i) => `${i===0?"M":"L"}${xPt(i)},${yPt(d.monto)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{width:"100%",height:"auto"}}>
      {yTicks.map(t => (
        <g key={t}>
          <line x1={pad.l} x2={w-pad.r} y1={yPt(t)} y2={yPt(t)} stroke="var(--border)" />
          <text x={pad.l - 6} y={yPt(t) + 3} fontSize="10" fill="var(--text-3)" textAnchor="end" fontFamily="var(--font-mono)">{t === 0 ? "0" : (t/1000)+"k"}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const bh = (d.monto / max) * (h - pad.t - pad.b);
        const x = pad.l + i * bw + bw * 0.18;
        const bw2 = bw * 0.64;
        const isLast = i === data.length - 1;
        return (
          <g key={d.mes}>
            <rect x={x} y={h - pad.b - bh} width={bw2} height={bh}
              fill={isLast ? "var(--primary)" : "var(--accent)"}
              opacity={isLast ? 1 : 0.55} rx="1" />
            <text x={xPt(i)} y={h - 8} fontSize="9.5" fill="var(--text-3)" textAnchor="middle">{d.mes}</text>
          </g>
        );
      })}
      <path d={path} fill="none" stroke="var(--primary)" strokeWidth="1.5" opacity="0.85" />
      {data.map((d, i) => (
        <circle key={i} cx={xPt(i)} cy={yPt(d.monto)} r="2.5" fill="var(--primary)" />
      ))}
    </svg>
  );
};

// Morosidad donut
const MorosidadDonut = () => {
  const data = SIRDATA.MOROSIDAD;
  const total = data.reduce((s, d) => s + d.monto, 0);
  const totalCount = data.reduce((s, d) => s + d.count, 0);
  const r = 56, cx = 70, cy = 70, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div style={{display:"flex",alignItems:"center",gap:18}}>
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle cx={cx} cy={cy} r={r} stroke="var(--surface-2)" strokeWidth="16" fill="none"/>
        {data.map((d, i) => {
          const frac = d.monto / total;
          const dash = c * frac;
          const seg = <circle key={i} cx={cx} cy={cy} r={r}
            stroke={d.color} strokeWidth="16" fill="none"
            strokeDasharray={`${dash} ${c-dash}`}
            strokeDashoffset={-off}
            transform={`rotate(-90 ${cx} ${cy})`} />;
          off += dash;
          return seg;
        })}
        <text x={cx} y={cy-2} textAnchor="middle" fontSize="20" fontWeight="600" fill="var(--text)" fontFamily="var(--font-display)">{totalCount}</text>
        <text x={cx} y={cy+14} textAnchor="middle" fontSize="9.5" fill="var(--text-3)" letterSpacing="0.06em">REGANTES</text>
      </svg>
      <div style={{flex:1, display:"flex", flexDirection:"column", gap:8}}>
        {data.map(d => (
          <div key={d.rango} style={{display:"flex",alignItems:"center",gap:8,fontSize:12}}>
            <span style={{width:8,height:8,background:d.color,borderRadius:2}}></span>
            <span style={{flex:1, color:"var(--text-2)"}}>{d.rango}</span>
            <span style={{fontFamily:"var(--font-mono)",fontSize:11}}>{d.count}</span>
            <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-3)",minWidth:64,textAlign:"right"}}>{fmtSoles(d.monto)}</span>
          </div>
        ))}
        <div style={{borderTop:"1px solid var(--border)",paddingTop:8,marginTop:4,display:"flex",justifyContent:"space-between",fontSize:12}}>
          <span style={{fontWeight:600}}>Total deuda</span>
          <span style={{fontFamily:"var(--font-mono)",fontWeight:600}}>{fmtSoles(total)}</span>
        </div>
      </div>
    </div>
  );
};

// Schematic node-graph: canal → tomas → parcelas
const RedHidraulica = () => {
  // For visual clarity, show 3 canals with their tomas and parcelas
  const canales = SIRDATA.CANALES.slice(0, 5);
  // Build a tree
  const tree = canales.map(c => {
    const tomas = SIRDATA.TOMAS.filter(t => t.canal === c.codigo);
    return {
      ...c,
      tomas: tomas.map(t => ({
        ...t,
        parcelas: SIRDATA.PARCELAS.filter(p => p.toma === t.codigo),
      })),
    };
  });
  return (
    <div style={{padding:"8px 4px 4px"}}>
      <div style={{display:"flex",gap:14,flexWrap:"wrap"}}>
        {tree.map(c => (
          <div key={c.codigo} style={{flex:"1 1 240px",minWidth:230,border:"1px solid var(--border)",borderRadius:6,padding:"10px 12px",background:"var(--surface-2)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
              <Icon name="canal" size={14} />
              <div style={{fontWeight:600,fontSize:12}}>{c.nombre}</div>
              <span className="pill muted" style={{marginLeft:"auto",fontSize:10}}>{c.tipo}</span>
            </div>
            <div style={{fontSize:11,color:"var(--text-3)",marginBottom:10,fontFamily:"var(--font-mono)"}}>
              {c.codigo} · {c.longitud} km · máx {c.caudalMax} m³/s
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              {c.tomas.map(t => {
                const ratio = t.caudalMed / t.caudalAut;
                const status = ratio < 0.75 ? "danger" : ratio < 0.9 ? "warning" : "success";
                return (
                  <div key={t.codigo} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:4,padding:"6px 8px"}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,fontSize:11.5}}>
                      <Icon name="drop" size={11} />
                      <span style={{fontWeight:600}}>{t.nombre}</span>
                      <span className={"pill "+status} style={{marginLeft:"auto",fontSize:9.5}}>
                        {t.caudalMed}/{t.caudalAut} m³/s
                      </span>
                    </div>
                    {t.parcelas.length > 0 && (
                      <div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4,paddingLeft:16}}>
                        {t.parcelas.slice(0,5).map(p => (
                          <span key={p.codigo} title={p.predio} style={{
                            fontSize:9.5,fontFamily:"var(--font-mono)",
                            padding:"1px 5px",background:"var(--surface-2)",
                            border:"1px solid var(--border)",borderRadius:3,color:"var(--text-2)"
                          }}>{p.codigo.replace("PAR-","")}</span>
                        ))}
                        {t.parcelas.length > 5 && <span style={{fontSize:10,color:"var(--text-3)"}}>+{t.parcelas.length-5}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AlertasList = () => (
  <div style={{display:"flex",flexDirection:"column"}}>
    {SIRDATA.ALERTAS.map((a, i) => (
      <div key={i} style={{
        display:"flex",gap:10,padding:"10px 0",
        borderBottom: i < SIRDATA.ALERTAS.length-1 ? "1px solid var(--border)" : "none",
        alignItems:"flex-start"
      }}>
        <div style={{
          width:24,height:24,borderRadius:4,flexShrink:0,
          background: a.tipo==="danger" ? "var(--danger-bg)" : a.tipo==="warning" ? "var(--warning-bg)" : "var(--info-bg)",
          color: a.tipo==="danger" ? "var(--danger)" : a.tipo==="warning" ? "var(--warning)" : "var(--info)",
          display:"grid",placeItems:"center"
        }}>
          <Icon name={a.tipo==="info" ? "info-circle" : "alert"} size={13} />
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12.5,fontWeight:600,lineHeight:1.3}}>{a.titulo}</div>
          <div style={{fontSize:11.5,color:"var(--text-3)",marginTop:2}}>{a.desc}</div>
        </div>
        <div style={{fontSize:10.5,color:"var(--text-3)",whiteSpace:"nowrap",marginTop:2}}>{a.tiempo}</div>
      </div>
    ))}
  </div>
);

const ActividadList = () => (
  <div style={{display:"flex",flexDirection:"column"}}>
    {SIRDATA.ACTIVIDAD.map((a, i) => (
      <div key={i} style={{display:"flex",gap:10,padding:"9px 0",borderBottom: i < SIRDATA.ACTIVIDAD.length-1 ? "1px solid var(--border)" : "none",alignItems:"flex-start"}}>
        <div style={{
          width:22,height:22,borderRadius:"50%",flexShrink:0,
          background:"var(--surface-2)",color:"var(--text-2)",
          display:"grid",placeItems:"center"
        }}>
          <Icon name={a.icon} size={11} />
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:12.5,lineHeight:1.3}}><span style={{fontWeight:600}}>{a.titulo}</span></div>
          <div style={{fontSize:11.5,color:"var(--text-3)",marginTop:1}}>{a.desc}</div>
        </div>
        <div style={{fontSize:10.5,color:"var(--text-3)",whiteSpace:"nowrap"}}>{a.tiempo}</div>
      </div>
    ))}
  </div>
);

const Dashboard = ({ role, onNav }) => {
  const totalRegantes = SIRDATA.REGANTES.length;
  const totalParcelas = SIRDATA.PARCELAS.length;
  const totalCanales = SIRDATA.CANALES.length;
  const totalTomas = SIRDATA.TOMAS.length;
  const recauMes = SIRDATA.RECAUDACION_MENSUAL[SIRDATA.RECAUDACION_MENSUAL.length-1].monto;
  const deudaPend = SIRDATA.DEUDAS.reduce((s, d) => s + d.total, 0);

  const ultimosPagos = SIRDATA.PAGOS.slice(0, 5);
  const morosos = SIRDATA.DEUDAS.map(d => {
    const r = SIRDATA.REGANTES.find(x => x.codigo === d.reganteCod);
    return { ...d, regante: r };
  });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Buenos días, {role.name.split(" ")[0]}</h1>
          <div className="page-subtitle">Resumen operativo · Campaña 2026 · I — viernes 1 de mayo, 2026</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="calendar"/> Periodo: 2026-I</button>
          <button className="btn"><Icon name="download"/> Exportar resumen</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <KPI label="Regantes" value={fmtInt(totalRegantes)} icon="users" delta="+2" deltaDir="up"/>
        <KPI label="Parcelas" value={fmtInt(totalParcelas)} icon="land" delta="+3" deltaDir="up"/>
        <KPI label="Canales" value={fmtInt(totalCanales)} icon="canal"/>
        <KPI label="Tomas de agua" value={fmtInt(totalTomas)} icon="drop"/>
        <KPI label="Recaudación abril" value={fmtSoles(recauMes)} icon="wallet" delta="+8.8%" deltaDir="up"/>
        <KPI label="Deuda pendiente" value={fmtSoles(deudaPend)} icon="alert" delta="-3.2%" deltaDir="down"/>
        <KPI label="Pagos del día" value="12" icon="money" delta="+4" deltaDir="up"/>
        <KPI label="Tomas con caudal bajo" value="2" icon="drop" delta="vs ayer 3" deltaDir="down"/>
      </div>

      {/* Charts row */}
      <div className="row-grid c2" style={{marginBottom:16}}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Recaudación mensual</h3>
              <div className="card-sub">Últimos 12 meses · Soles (S/)</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button className="filter-chip">12 meses</button>
              <button className="filter-chip">Año</button>
              <button className="filter-chip">Campaña</button>
            </div>
          </div>
          <div className="card-body"><RecaudacionChart /></div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Morosidad</h3>
            <button className="btn ghost sm" onClick={() => onNav("pagos")}>Ver detalle <Icon name="chevron-right" size={11}/></button>
          </div>
          <div className="card-body"><MorosidadDonut /></div>
        </div>
      </div>

      {/* Red + alertas */}
      <div className="row-grid c2" style={{marginBottom:16}}>
        <div className="card">
          <div className="card-head">
            <div>
              <h3 className="card-title">Red hidráulica</h3>
              <div className="card-sub">Canal → toma → parcelas (esquemático)</div>
            </div>
            <button className="btn ghost sm" onClick={() => onNav("canales")}>Ver canales <Icon name="chevron-right" size={11}/></button>
          </div>
          <div className="card-body" style={{padding:12}}><RedHidraulica /></div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Alertas</h3>
            <span className="pill warning"><span className="dot"></span>{SIRDATA.ALERTAS.length}</span>
          </div>
          <div className="card-body" style={{paddingTop:4,paddingBottom:4}}><AlertasList /></div>
        </div>
      </div>

      {/* Bottom: últimos pagos + actividad */}
      <div className="row-grid c2">
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Últimos pagos</h3>
            <button className="btn ghost sm" onClick={() => onNav("pagos")}>Ver todos <Icon name="chevron-right" size={11}/></button>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead><tr><th>Recibo</th><th>Regante</th><th>Concepto</th><th className="num">Monto</th><th>Medio</th></tr></thead>
              <tbody>
                {ultimosPagos.map(p => {
                  const r = SIRDATA.REGANTES.find(x => x.codigo === p.reganteCod);
                  return (
                    <tr key={p.id}>
                      <td className="mono">{p.recibo}</td>
                      <td>{r ? SIRDATA.nameOf(r) : "—"}</td>
                      <td style={{color:"var(--text-3)",fontSize:12}}>Tarifa de agua</td>
                      <td className="num mono">{fmtSoles(p.monto)}</td>
                      <td><span className="pill muted">{p.medio.split(" ")[0]}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <h3 className="card-title">Actividad reciente</h3>
          </div>
          <div className="card-body" style={{paddingTop:4,paddingBottom:4}}><ActividadList /></div>
        </div>
      </div>
    </div>
  );
};

window.Dashboard = Dashboard;
window.fmtSoles = fmtSoles;
window.fmtInt = fmtInt;
