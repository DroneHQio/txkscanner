import { useParams, useNavigate } from 'react-router-dom';
import { useIncident } from '../hooks/useIncident';
import { closeIncident } from '../api/client';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Disclaimer } from '../components/Disclaimer';
import { useState } from 'react';

function elapsed(start: string) {
  const ms = Date.now() - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function fmt(dt: string) {
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function Dashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { incident, loading, error, reload } = useIncident(id ? parseInt(id) : null);
  const [closing, setClosing] = useState(false);

  const handleClose = async () => {
    if (!incident || !confirm('Close this incident?')) return;
    setClosing(true);
    try {
      await closeIncident(incident.id);
      reload();
    } finally {
      setClosing(false);
    }
  };

  if (loading) return <Layout title="Dashboard" backTo="/incidents"><LoadingSpinner /></Layout>;
  if (error || !incident) return (
    <Layout title="Dashboard" backTo="/incidents">
      <p className="text-red-400">{error || 'Incident not found'}</p>
    </Layout>
  );

  const latestWeather = incident.weather?.[0];
  const checklistDone = incident.checklist?.filter(c => c.completed).length || 0;
  const checklistTotal = incident.checklist?.length || 0;
  const latestNote = incident.notes?.[0];

  const navButton = (label: string, emoji: string, path: string, color = 'bg-slate-700 hover:bg-slate-600') => (
    <button
      key={path}
      className={`${color} text-white font-semibold py-4 px-3 rounded-xl min-h-[70px] flex flex-col items-center justify-center gap-1 transition-colors text-center`}
      onClick={() => navigate(`/incidents/${incident.id}${path}`)}
    >
      <span className="text-2xl">{emoji}</span>
      <span className="text-xs">{label}</span>
    </button>
  );

  return (
    <Layout
      title={incident.name}
      backTo="/incidents"
      actions={
        <span className={`text-xs font-bold px-2 py-1 rounded-full ${incident.status === 'active' ? 'bg-red-800 text-red-200' : 'bg-slate-600 text-slate-300'}`}>
          {incident.status.toUpperCase()}
        </span>
      }
    >
      <div className="space-y-4 pb-8">
        <Disclaimer compact />

        {/* Status bar */}
        <div className="card">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-slate-400">Incident #</p>
              <p className="font-bold">{incident.incident_number || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400">Elapsed</p>
              <p className="font-bold text-orange-400">{incident.started_at ? elapsed(incident.started_at) : '—'}</p>
            </div>
            <div>
              <p className="text-slate-400">IC</p>
              <p className="font-bold">{incident.incident_commander || '—'}</p>
            </div>
            <div>
              <p className="text-slate-400">Scene Type</p>
              <p className="font-bold">{incident.scene_type || '—'}</p>
            </div>
            {incident.lat && incident.lon && (
              <div className="col-span-2">
                <p className="text-slate-400">GPS</p>
                <p className="font-mono text-sm">{incident.lat.toFixed(5)}, {incident.lon.toFixed(5)}</p>
              </div>
            )}
            {incident.address && (
              <div className="col-span-2">
                <p className="text-slate-400">Address</p>
                <p>{incident.address}</p>
              </div>
            )}
          </div>
        </div>

        {/* Material */}
        {(incident.material_name || incident.un_number) && (
          <div className="card border-orange-700">
            <p className="section-title">Identified Material</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><p className="text-slate-400">Product</p><p className="font-bold">{incident.material_name || '—'}</p></div>
              <div><p className="text-slate-400">UN #</p><p className="font-bold font-mono">{incident.un_number || '—'}</p></div>
              <div><p className="text-slate-400">ERG Guide</p><p className="font-bold">{incident.erg_guide || '—'}</p></div>
              <div><p className="text-slate-400">Init. Isolation</p><p className="font-bold text-red-400">{incident.initial_isolation_distance ? `${incident.initial_isolation_distance}m` : '—'}</p></div>
              <div className="col-span-2"><p className="text-slate-400">Protective Action Dist.</p><p className="font-bold text-yellow-400">{incident.protective_action_distance ? `${incident.protective_action_distance}m` : '—'}</p></div>
            </div>
          </div>
        )}

        {/* Weather */}
        {latestWeather && (
          <div className="card">
            <p className="section-title">Latest Weather</p>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div><p className="text-slate-400">Temp</p><p className="font-bold">{latestWeather.temperature ? `${latestWeather.temperature}°F` : '—'}</p></div>
              <div><p className="text-slate-400">Wind</p><p className="font-bold">{latestWeather.wind_direction || '—'}</p></div>
              <div><p className="text-slate-400">Speed</p><p className="font-bold">{latestWeather.wind_speed || '—'}</p></div>
              {latestWeather.wind_gust && <div><p className="text-slate-400">Gusts</p><p className="font-bold text-yellow-400">{latestWeather.wind_gust}</p></div>}
            </div>
            {latestWeather.forecast_summary && <p className="text-slate-300 text-xs mt-2">{latestWeather.forecast_summary}</p>}
            <p className="text-slate-500 text-xs mt-1">Checked: {fmt(latestWeather.checked_at)}</p>
          </div>
        )}

        {/* Zones */}
        <div className="card">
          <p className="section-title">Zone Status</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`rounded-lg p-2 ${incident.hot_zone ? 'bg-red-800' : 'bg-slate-700'}`}>
              <p className="font-bold text-red-300">HOT</p>
              <p className="text-slate-300 mt-1">{incident.hot_zone || 'Not set'}</p>
            </div>
            <div className={`rounded-lg p-2 ${incident.warm_zone ? 'bg-yellow-800' : 'bg-slate-700'}`}>
              <p className="font-bold text-yellow-300">WARM</p>
              <p className="text-slate-300 mt-1">{incident.warm_zone || 'Not set'}</p>
            </div>
            <div className={`rounded-lg p-2 ${incident.cold_zone ? 'bg-green-900' : 'bg-slate-700'}`}>
              <p className="font-bold text-green-300">COLD</p>
              <p className="text-slate-300 mt-1">{incident.cold_zone || 'Not set'}</p>
            </div>
          </div>
        </div>

        {/* Checklist progress */}
        <div className="card">
          <div className="flex justify-between items-center mb-2">
            <p className="section-title mb-0">Checklist</p>
            <span className="text-sm font-bold text-orange-400">{checklistDone}/{checklistTotal}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-3">
            <div
              className="bg-orange-500 h-3 rounded-full transition-all"
              style={{ width: checklistTotal ? `${(checklistDone / checklistTotal) * 100}%` : '0%' }}
            />
          </div>
        </div>

        {/* Latest note */}
        {latestNote && (
          <div className="card">
            <p className="text-slate-400 text-xs mb-1">Latest Note</p>
            <p className="text-sm">{latestNote.note_text}</p>
            <p className="text-slate-500 text-xs mt-1">{latestNote.category} · {fmt(latestNote.created_at)}</p>
          </div>
        )}

        {/* Action grid */}
        <div>
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">Actions</p>
          <div className="grid grid-cols-3 gap-2">
            {navButton('ERG Lookup', '📚', '/erg', 'bg-orange-700 hover:bg-orange-600')}
            {navButton('Unknown Product', '❓', '/unknown', 'bg-red-800 hover:bg-red-700')}
            {navButton('Weather', '🌦', '/weather')}
            {navButton('Evacuation', '🏃', '/evacuation', 'bg-yellow-700 hover:bg-yellow-600')}
            {navButton('Add Note', '📝', '/notes')}
            {navButton('Map', '🗺', '/map')}
            {navButton('Checklist', '✅', '/checklist')}
            {navButton('Exposure Log', '🧑‍⚕️', '/exposure')}
            {navButton('Decon Log', '🚿', '/decon')}
            {navButton('Resources', '📞', '/resources')}
            {navButton('Shipping Papers', '📄', '/shipping')}
            {navButton('Photos', '📷', '/photos')}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button className="btn-secondary" onClick={() => navigate(`/incidents/${incident.id}/report`)}>
            🖨 Print Report
          </button>
          {incident.status === 'active' && (
            <button className="btn-danger" onClick={handleClose} disabled={closing}>
              {closing ? 'Closing...' : '🔒 Close Incident'}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}
