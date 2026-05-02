// SIR Nasca v2 — MiniMap (Leaflet) for picking coordinates in form
// Uses global L (Leaflet)

const MiniMap = ({ value, onChange, height = 240 }) => {
  const ref = React.useRef(null);
  const mapRef = React.useRef(null);
  const markerRef = React.useRef(null);

  // Parse current value
  const parsed = GEODATA.parseCoords(value);
  const [coords, setCoords] = React.useState(parsed || GEODATA.NASCA_CENTER);
  const [hasPin, setHasPin] = React.useState(!!parsed);

  // Init map once
  React.useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const map = L.map(ref.current, {
      zoomControl: true,
      attributionControl: true,
    }).setView(parsed || GEODATA.NASCA_CENTER, parsed ? 14 : 12);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "© OpenStreetMap",
    }).addTo(map);

    // Click handler
    map.on("click", (e) => {
      const ll = [e.latlng.lat, e.latlng.lng];
      setCoords(ll);
      setHasPin(true);
      const str = `${ll[0].toFixed(4)}, ${ll[1].toFixed(4)}`;
      onChange?.(str);
    });

    mapRef.current = map;
    setTimeout(() => map.invalidateSize(), 100);
  }, []);

  // Sync marker
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (hasPin) {
      const icon = L.divIcon({
        className: "minimap-pin-icon",
        html: `<div style="width:14px;height:14px;border-radius:50%;background:#1E40AF;border:2.5px solid white;box-shadow:0 0 0 1px #1E40AF, 0 2px 6px rgba(0,0,0,0.3);"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      if (markerRef.current) {
        markerRef.current.setLatLng(coords);
      } else {
        markerRef.current = L.marker(coords, { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", (e) => {
          const ll = e.target.getLatLng();
          const c = [ll.lat, ll.lng];
          setCoords(c);
          onChange?.(`${c[0].toFixed(4)}, ${c[1].toFixed(4)}`);
        });
      }
    } else if (markerRef.current) {
      mapRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  }, [hasPin, coords]);

  // External value changes (e.g. typed in textbox)
  React.useEffect(() => {
    const p = GEODATA.parseCoords(value);
    if (p && (p[0] !== coords[0] || p[1] !== coords[1])) {
      setCoords(p);
      setHasPin(true);
      mapRef.current?.setView(p, Math.max(mapRef.current.getZoom(), 13));
    } else if (!p && hasPin && !value) {
      setHasPin(false);
    }
  }, [value]);

  const clear = () => {
    setHasPin(false);
    onChange?.("");
  };

  return (
    <div className="minimap-wrap">
      <div className="minimap-hint">
        <span className="pin"></span>
        Click en el mapa para fijar la ubicación, o arrastra el marcador.
      </div>
      <div ref={ref} style={{ height }}></div>
      <div className="minimap-coords">
        <span>{hasPin ? `Lat: ${coords[0].toFixed(5)} · Lng: ${coords[1].toFixed(5)}` : "Sin coordenadas"}</span>
        {hasPin && <button type="button" onClick={clear}>Limpiar</button>}
      </div>
    </div>
  );
};

window.MiniMap = MiniMap;
