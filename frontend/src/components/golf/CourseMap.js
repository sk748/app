import React, { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const COURSES = [
  { name: "Karen Country Club", lat: -1.3197, lng: 36.7073, par: 72 },
  { name: "Muthaiga Golf Club", lat: -1.2548, lng: 36.8263, par: 72 },
  { name: "Royal Nairobi GC", lat: -1.2921, lng: 36.8219, par: 72 },
];

export default function CourseMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [selected, setSelected] = useState(COURSES[0]);
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://demotiles.maplibre.org/style.json",
      center: [selected.lng, selected.lat],
      zoom: 15,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      // Add green polygon
      const offset = 0.001;
      map.current.addSource("green-area", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [[
              [selected.lng - offset, selected.lat - offset],
              [selected.lng + offset, selected.lat - offset],
              [selected.lng + offset, selected.lat + offset],
              [selected.lng - offset, selected.lat + offset],
              [selected.lng - offset, selected.lat - offset],
            ]],
          },
        },
      });

      map.current.addLayer({
        id: "green-fill",
        type: "fill",
        source: "green-area",
        paint: { "fill-color": "#10b981", "fill-opacity": 0.35 },
      });

      map.current.addLayer({
        id: "green-outline",
        type: "line",
        source: "green-area",
        paint: { "line-color": "#10b981", "line-width": 2 },
      });

      new maplibregl.Marker({ color: "#0082CD" })
        .setLngLat([selected.lng, selected.lat])
        .setPopup(new maplibregl.Popup().setText(selected.name))
        .addTo(map.current);

      map.current.on("click", (e) => {
        const R = 6371;
        const dLat = ((selected.lat - e.lngLat.lat) * Math.PI) / 180;
        const dLon = ((selected.lng - e.lngLat.lng) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) ** 2 + Math.cos((e.lngLat.lat * Math.PI) / 180) * Math.cos((selected.lat * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const meters = R * c * 1000;
        const yards = Math.round(meters * 1.09361);
        setDistance(yards);
      });
    });

    return () => {
      if (map.current) { map.current.remove(); map.current = null; }
    };
  }, [selected]);

  return (
    <div data-testid="course-map" className="space-y-4 max-w-4xl">
      {/* Course selector */}
      <div className="flex flex-wrap gap-2">
        {COURSES.map(c => (
          <button key={c.name} data-testid={`course-btn-${c.name.split(" ")[0].toLowerCase()}`}
            onClick={() => { setSelected(c); setDistance(null); }}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selected.name === c.name ? "bg-azure text-white" : "glass text-slate hover:text-silver"}`}>
            {c.name}
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <div ref={mapContainer} className="absolute inset-0" />

        <div className="absolute top-4 left-4 glass rounded-xl p-3">
          <h3 className="text-silver text-sm font-bold">{selected.name}</h3>
          <p className="text-azure text-xs">Tap map to measure to pin</p>
        </div>

        {distance !== null && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-azure px-6 py-2.5 rounded-full shadow-2xl border border-white/20">
            <span data-testid="distance-display" className="text-white font-black text-lg">{distance}Y to Pin</span>
          </div>
        )}
      </div>
    </div>
  );
}
