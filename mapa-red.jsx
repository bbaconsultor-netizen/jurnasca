// SIR Nasca v2 — Mapa de la red (full network map)

const MapaRed = () => {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const layersRef = React.useRef({ canales: null, tomas: null, parcelas: null });

  const [showCanales, setShowCanales] = React.useState(true);
  const [showTomas, setShowTomas] = React.useState(true);
  const [showParcelas, setShowParcelas] = React.useState(true);
  const [comFilter, setComFilter] = React.useState({}); // {comName: true}

  // Default: all comisiones on
  React.useEffect(() => {
    const init = {};
    SIRDATA.COMISIONES.forEach(c => { init[c] = true; });
    setComFilter(init);
  }, []);

  // Init map
  React.useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, { zoomControl: true }).setView(GEODATA.NASCA_CENTER, 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18, attribution: "© OpenStreetMap"
    }).addTo(map);
    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 150);
  }, []);

  // Render layers
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !Object.keys(comFilter).length) return;
    // clear
    Object.values(layersRef.current).forEach(l => l && map.removeLayer(l));

    // Canales
    const canalesGroup = L.layerGroup();
    if (showCanales) {
      SIRDATA.CANALES.forEach(c => {
        if (!comFilter[c.comision]) return;
        const trace = GEODATA.CANAL_TRAZAS[c.codigo];
        if (!trace) return;
        const color = GEODATA.COMISION_COLOR[c.comision] || "#666";
        const poly = L.polyline(trace, {
          color, weight: c.tipo === "Principal" ? 4 : c.tipo === "Secundario" ? 3 : 2.2,
          opacity: 0.85,
          dashArray: c.tipo === "Acequia" ? "6,5" : null,
        });
        poly.bindPopup(`
          <div class="pop-title">${c.nombre}</div>
          <div class="pop-sub">${c.codigo} · ${c.tipo}</div>
          <dl>
            <dt>Comisión</dt><dd>${c.comision}</dd>
            <dt>Longitud</dt><dd>${c.longitud} km</dd>
            <dt>Q máx</dt><dd>${c.caudalMax} m³/s</dd>
            <dt>Estado</dt><dd>${c.estado}</dd>
          </dl>
        `);
        canalesGroup.addLayer(poly);
      });
    }
    canalesGroup.addTo(map);
    layersRef.current.canales = canalesGroup;

    // Tomas (triangles)
    const tomasGroup = L.layerGroup();
    if (showTomas) {
      SIRDATA.TOMAS.forEach(t => {
        if (!comFilter[t.comision]) return;
        const ll = GEODATA.TOMA_COORDS[t.codigo];
        if (!ll) return;
        const color = GEODATA.COMISION_COLOR[t.comision] || "#666";
        const ratio = t.caudalMed / t.caudalAut;
        const warn = ratio < 0.85;
        const icon = L.divIcon({
          className: "toma-icon",
          html: `<div style="
            width:0;height:0;
            border-left:8px solid transparent;
            border-right:8px solid transparent;
            border-bottom:13px solid ${warn ? '#DC2626' : color};
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.3));
          "></div>`,
          iconSize: [16, 13],
          iconAnchor: [8, 13],
        });
        const m = L.marker(ll, { icon });
        m.bindPopup(`
          <div class="pop-title">${t.nombre} ${warn ? '⚠' : ''}</div>
          <div class="pop-sub">${t.codigo} · Canal ${t.canal}</div>
          <dl>
            <dt>Comisión</dt><dd>${t.comision}</dd>
            <dt>Q autorizado</dt><dd>${t.caudalAut} m³/s</dd>
            <dt>Q medido</dt><dd style="color:${warn?'#DC2626':'inherit'}">${t.caudalMed} m³/s (${Math.round(ratio*100)}%)</dd>
            <dt>Estado</dt><dd>${t.estado}</dd>
          </dl>
        `);
        tomasGroup.addLayer(m);
      });
    }
    tomasGroup.addTo(map);
    layersRef.current.tomas = tomasGroup;

    // Parcelas (circles)
    const parcelasGroup = L.layerGroup();
    if (showParcelas) {
      SIRDATA.PARCELAS.forEach(p => {
        if (!comFilter[p.comision]) return;
        const ll = GEODATA.parseCoords(p.coords);
        if (!ll) return;
        const r = SIRDATA.REGANTES.find(x => x.codigo === p.reganteCod);
        const color = GEODATA.COMISION_COLOR[p.comision] || "#666";
        // Radius scales with area
        const radius = Math.max(5, Math.min(14, 4 + Math.sqrt(p.areaTotal) * 1.4));
        const c = L.circleMarker(ll, {
          radius,
          color: "#fff",
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.78,
        });
        c.bindPopup(`
          <div class="pop-title">${p.predio}</div>
          <div class="pop-sub">${p.codigo} · ${p.ucat}</div>
          <dl>
            <dt>Regante</dt><dd>${r ? SIRDATA.nameOf(r) : '—'}</dd>
            <dt>Comisión</dt><dd>${p.comision}</dd>
            <dt>Cultivo</dt><dd>${p.cultivo}</dd>
            <dt>Área</dt><dd>${p.areaTotal} ha</dd>
            <dt>Canal · Toma</dt><dd>${p.canal} · ${p.toma}</dd>
          </dl>
        `);
        parcelasGroup.addLayer(c);
      });
    }
    parcelasGroup.addTo(map);
    layersRef.current.parcelas = parcelasGroup;
  }, [showCanales, showTomas, showParcelas, comFilter]);

  const visibleParcelas = SIRDATA.PARCELAS.filter(p => comFilter[p.comision]).length;
  const visibleArea = SIRDATA.PARCELAS.filter(p => comFilter[p.comision]).reduce((s,p)=>s+p.areaTotal,0);
  const visibleCanales = SIRDATA.CANALES.filter(c => comFilter[c.comision]).length;

  return (
    <div className="map-page">
      <div className="page-head">
        <div>
          <h1 className="page-title">Mapa de la red</h1>
          <div className="page-subtitle">Vista geográfica de regantes, parcelas, canales y tomas — Valle de Nasca</div>
        </div>
        <div className="page-actions">
          <button className="btn"><Icon name="download"/><span className="table-mobile-hide">Exportar KMZ</span></button>
          <button className="btn"><Icon name="printer"/><span className="table-mobile-hide">Imprimir mapa</span></button>
        </div>
      </div>

      <div className="map-shell">
        <div className="map-side">
          <div className="map-side-section">
            <h4>Capas</h4>
            <label className="check-row">
              <input type="checkbox" checked={showCanales} onChange={e=>setShowCanales(e.target.checked)}/>
              <span>Canales</span>
              <span className="count">{SIRDATA.CANALES.length}</span>
            </label>
            <label className="check-row">
              <input type="checkbox" checked={showTomas} onChange={e=>setShowTomas(e.target.checked)}/>
              <span>Tomas</span>
              <span className="count">{SIRDATA.TOMAS.length}</span>
            </label>
            <label className="check-row">
              <input type="checkbox" checked={showParcelas} onChange={e=>setShowParcelas(e.target.checked)}/>
              <span>Parcelas</span>
              <span className="count">{SIRDATA.PARCELAS.length}</span>
            </label>
          </div>

          <div className="map-side-section">
            <h4>Comisiones</h4>
            {SIRDATA.COMISIONES.map(c => (
              <label key={c} className="check-row">
                <input type="checkbox" checked={!!comFilter[c]} onChange={e=>setComFilter(f=>({...f, [c]: e.target.checked}))}/>
                <span className="swatch" style={{background: GEODATA.COMISION_COLOR[c]}}></span>
                <span>{c.replace("C.U. ","")}</span>
                <span className="count">{SIRDATA.PARCELAS.filter(p=>p.comision===c).length}</span>
              </label>
            ))}
            <div style={{display:"flex",gap:6,marginTop:8}}>
              <button className="btn" style={{flex:1,fontSize:11,padding:"4px 8px"}} onClick={()=>{
                const all = {}; SIRDATA.COMISIONES.forEach(c=>{all[c]=true;}); setComFilter(all);
              }}>Todas</button>
              <button className="btn" style={{flex:1,fontSize:11,padding:"4px 8px"}} onClick={()=>{
                const none = {}; SIRDATA.COMISIONES.forEach(c=>{none[c]=false;}); setComFilter(none);
              }}>Ninguna</button>
            </div>
          </div>

          <div className="map-side-section">
            <h4>Leyenda</h4>
            <div className="map-legend-row">
              <span className="marker-line" style={{background:"#666"}}></span>
              <span>Canal (grosor = jerarquía)</span>
            </div>
            <div className="map-legend-row">
              <span className="marker-tri"></span>
              <span>Toma de agua</span>
            </div>
            <div className="map-legend-row">
              <span className="marker-dot" style={{background:"#666"}}></span>
              <span>Parcela (tamaño = área)</span>
            </div>
            <div className="map-legend-row" style={{color:"#DC2626",marginTop:6}}>
              <span className="marker-tri" style={{borderBottomColor:"#DC2626"}}></span>
              <span>Toma con caudal bajo</span>
            </div>
          </div>

          <div style={{padding:"10px 16px",fontSize:10.5,color:"var(--text-3)",lineHeight:1.45}}>
            Datos cartográficos © OpenStreetMap contributors. Las coordenadas son referenciales.
          </div>
        </div>

        <div className="map-canvas">
          <div ref={ref} style={{height:"100%",width:"100%"}}></div>
          <div className="map-stat-card">
            <div>
              <span className="lbl">Parcelas</span>
              <span className="val">{visibleParcelas}</span>
            </div>
            <div>
              <span className="lbl">Área</span>
              <span className="val">{visibleArea.toFixed(1)} <span style={{fontSize:11,color:"var(--text-3)",fontWeight:400}}>ha</span></span>
            </div>
            <div>
              <span className="lbl">Canales</span>
              <span className="val">{visibleCanales}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.MapaRed = MapaRed;
