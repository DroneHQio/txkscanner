import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { getMarkers, createMarker, deleteMarker } from '../api/client';
import { useIncident } from '../hooks/useIncident';
import { useGps } from '../hooks/useGps';
import type { MapMarker, MarkerType } from '../types';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MARKER_COLORS: Record<MarkerType, string> = {
  incident: '#DC2626',
  command_post: '#2563EB',
  staging: '#7C3AED',
  decon: '#0891B2',
  roadblock: '#EA580C',
  hazard: '#CA8A04',
  victim: '#DC2626',
  drainage: '#059669',
  photo: '#6B7280',
};

const MARKER_ICONS: Record<MarkerType, string> = {
  incident: '🔴',
  command_post: '🔵',
  staging: '🟣',
  decon: '🚿',
  roadblock: '🚧',
  hazard: '⚠️',
  victim: '🚑',
  drainage: '🌊',
  photo: '📷',
};

function createColoredIcon(type: MarkerType) {
  const color = MARKER_COLORS[type] || '#666';
  return L.divIcon({
    html: `<div style="background:${color};width:24px;height:24px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;font-size:12px">${MARKER_ICONS[type]}</div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

function MapClickHandler({ onAdd, activeType }: { onAdd: (lat: number, lon: number) => void; activeType: MarkerType | null }) {
  useMapEvents({
    click(e) {
      if (activeType) {
        onAdd(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

function SetView({ lat, lon }: { lat: number; lon: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lon], 15); }, [lat, lon]);
  return null;
}

const ADD_TYPES: { type: MarkerType; label: string }[] = [
  { type: 'command_post', label: 'Command Post' },
  { type: 'staging', label: 'Staging' },
  { type: 'decon', label: 'Decon' },
  { type: 'roadblock', label: 'Roadblock' },
  { type: 'hazard', label: 'Hazard Marker' },
  { type: 'victim', label: 'Victim' },
  { type: 'drainage', label: 'Drainage Concern' },
  { type: 'photo', label: 'Photo Location' },
];

export function MapView() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const { incident, loading: incLoading } = useIncident(incidentId);
  const { getLocation, loading: gpsLoading } = useGps();
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<MarkerType | null>(null);
  const [center, setCenter] = useState<[number, number]>([29.7604, -95.3698]);

  useEffect(() => {
    if (!incidentId) return;
    getMarkers(incidentId)
      .then(setMarkers)
      .finally(() => setLoading(false));
  }, [incidentId]);

  useEffect(() => {
    if (incident?.lat && incident?.lon) {
      setCenter([incident.lat, incident.lon]);
    }
  }, [incident]);

  const handleMapClick = async (lat: number, lon: number) => {
    if (!incidentId || !activeType) return;
    const label = ADD_TYPES.find(t => t.type === activeType)?.label || activeType;
    try {
      const m = await createMarker(incidentId, { marker_type: activeType, lat, lon, label });
      setMarkers(prev => [...prev, m]);
      setActiveType(null);
    } catch {}
  };

  const handleDelete = async (markerId: number) => {
    if (!incidentId) return;
    await deleteMarker(incidentId, markerId);
    setMarkers(prev => prev.filter(m => m.id !== markerId));
  };

  const handleGpsMarker = async (type: MarkerType) => {
    if (!incidentId) return;
    const pos = await getLocation();
    const label = ADD_TYPES.find(t => t.type === type)?.label || type;
    const m = await createMarker(incidentId, { marker_type: type, lat: pos.lat, lon: pos.lon, label });
    setMarkers(prev => [...prev, m]);
  };

  const isoDistance = incident?.initial_isolation_distance;
  const paDistance = incident?.protective_action_distance;

  if (incLoading || loading) return <Layout title="Map View" backTo={id ? `/incidents/${id}` : '/incidents'}><LoadingSpinner /></Layout>;

  return (
    <Layout title="Map View" backTo={id ? `/incidents/${id}` : '/incidents'}>
      <div className="space-y-3 pb-8">
        {activeType && (
          <div className="bg-orange-900/50 border border-orange-600 rounded-lg p-3 text-orange-300 text-sm text-center">
            Tap on the map to place: <strong>{ADD_TYPES.find(t => t.type === activeType)?.label}</strong>
            <button className="ml-3 underline text-xs" onClick={() => setActiveType(null)}>Cancel</button>
          </div>
        )}

        <div className="rounded-xl overflow-hidden" style={{ height: '55vh' }}>
          <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <SetView lat={center[0]} lon={center[1]} />
            <MapClickHandler onAdd={handleMapClick} activeType={activeType} />

            {incident?.lat && incident?.lon && (
              <>
                <Marker position={[incident.lat, incident.lon]} icon={createColoredIcon('incident')}>
                  <Popup>🔴 Incident Location<br />{incident.name}</Popup>
                </Marker>
                {isoDistance && (
                  <Circle center={[incident.lat, incident.lon]} radius={isoDistance} color="#DC2626" fillColor="#DC2626" fillOpacity={0.1} />
                )}
                {paDistance && (
                  <Circle center={[incident.lat, incident.lon]} radius={paDistance} color="#CA8A04" fillColor="#CA8A04" fillOpacity={0.05} dashArray="10 5" />
                )}
              </>
            )}

            {markers.map(m => (
              <Marker key={m.id} position={[m.lat, m.lon]} icon={createColoredIcon(m.marker_type as MarkerType)}>
                <Popup>
                  {MARKER_ICONS[m.marker_type as MarkerType]} {m.label || m.marker_type}
                  <br />
                  <button className="text-red-400 text-xs underline mt-1" onClick={() => handleDelete(m.id)}>Remove</button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Legend */}
        {isoDistance && (
          <div className="text-xs text-slate-400 space-y-1">
            <span className="text-red-400">● Red circle</span>: Initial isolation {isoDistance}m
            {paDistance && <><br /><span className="text-yellow-400">● Yellow dashed</span>: Protective action {paDistance}m</>}
          </div>
        )}

        {/* Add marker buttons */}
        <div className="card">
          <p className="section-title">Add Markers</p>
          <p className="text-slate-400 text-xs mb-3">Select a type, then tap the map — or use GPS position:</p>
          <div className="grid grid-cols-2 gap-2">
            {ADD_TYPES.map(({ type, label }) => (
              <button
                key={type}
                className={`py-3 px-3 rounded-lg text-sm font-medium transition-colors text-left flex items-center gap-2 min-h-[44px] ${activeType === type ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                onClick={() => setActiveType(activeType === type ? null : type)}
              >
                <span>{MARKER_ICONS[type]}</span>
                <span className="text-xs">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {markers.length > 0 && (
          <div className="card">
            <p className="section-title">Placed Markers ({markers.length})</p>
            <div className="space-y-2">
              {markers.map(m => (
                <div key={m.id} className="flex justify-between items-center text-sm">
                  <span>{MARKER_ICONS[m.marker_type as MarkerType]} {m.label || m.marker_type}</span>
                  <button className="text-red-400 text-xs" onClick={() => handleDelete(m.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
