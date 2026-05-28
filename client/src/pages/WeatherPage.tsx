import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getWeather, fetchWeather } from '../api/client';
import type { WeatherSnapshot } from '../types';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useGps } from '../hooks/useGps';
import { useIncident } from '../hooks/useIncident';

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function WeatherPage() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const { incident } = useIncident(incidentId);
  const { getLocation, loading: gpsLoading } = useGps();
  const [snapshots, setSnapshots] = useState<WeatherSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!incidentId) return;
    getWeather(incidentId)
      .then(setSnapshots)
      .catch(() => setError('Failed to load weather history'))
      .finally(() => setLoading(false));
  }, [incidentId]);

  const handleFetch = async () => {
    if (!incidentId) return;
    setFetching(true);
    setError('');
    try {
      let lat: number | undefined;
      let lon: number | undefined;

      // Use incident coordinates if available, otherwise get GPS
      if (incident?.lat && incident?.lon) {
        lat = incident.lat;
        lon = incident.lon;
      } else {
        const pos = await getLocation();
        lat = pos.lat;
        lon = pos.lon;
      }

      const snap = await fetchWeather(incidentId, lat, lon);
      setSnapshots(prev => [snap, ...prev]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather. Check network and GPS permissions.');
    } finally {
      setFetching(false);
    }
  };

  const latest = snapshots[0];

  return (
    <Layout title="Weather / Wind" backTo={id ? `/incidents/${id}` : '/incidents'}>
      <div className="space-y-4 pb-8">
        <button
          className="btn-primary w-full text-lg"
          onClick={handleFetch}
          disabled={fetching || gpsLoading}
        >
          {fetching || gpsLoading ? '📡 Fetching NWS Data...' : '🌦 Update Weather (NWS)'}
        </button>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading && <LoadingSpinner />}

        {latest && (
          <div className="card border-blue-700">
            <p className="section-title">Current Conditions</p>
            <div className="grid grid-cols-2 gap-4">
              {latest.temperature != null && (
                <div className="text-center">
                  <p className="text-4xl font-black text-white">{Math.round(latest.temperature)}°F</p>
                  <p className="text-slate-400 text-sm">Temperature</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-4xl font-black text-cyan-400">{latest.wind_direction || '—'}</p>
                <p className="text-slate-400 text-sm">Wind From</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-black text-white">{latest.wind_speed || '—'}</p>
                <p className="text-slate-400 text-sm">Wind Speed</p>
              </div>
              {latest.wind_gust && (
                <div className="text-center">
                  <p className="text-3xl font-black text-yellow-400">{latest.wind_gust}</p>
                  <p className="text-slate-400 text-sm">Gusts</p>
                </div>
              )}
              {latest.humidity != null && (
                <div className="text-center">
                  <p className="text-3xl font-black text-white">{latest.humidity}%</p>
                  <p className="text-slate-400 text-sm">Humidity</p>
                </div>
              )}
            </div>
            {latest.forecast_summary && (
              <p className="text-slate-300 text-sm mt-3 border-t border-slate-700 pt-3">{latest.forecast_summary}</p>
            )}
            {latest.alerts && latest.alerts !== 'none' && (
              <div className="bg-red-900/40 border border-red-600 rounded-lg p-3 mt-3">
                <p className="text-red-400 font-bold text-sm">⚠️ Active Weather Alerts</p>
                <p className="text-red-200 text-sm mt-1">{latest.alerts}</p>
              </div>
            )}
            <p className="text-slate-500 text-xs mt-3">Updated: {fmt(latest.checked_at)}</p>
          </div>
        )}

        {snapshots.length > 1 && (
          <div className="card">
            <p className="section-title">Weather History</p>
            <div className="space-y-3">
              {snapshots.slice(1).map(s => (
                <div key={s.id} className="border-t border-slate-700 pt-3">
                  <div className="flex justify-between text-sm">
                    <span>{s.wind_direction} {s.wind_speed}</span>
                    <span className="text-slate-500">{fmt(s.checked_at)}</span>
                  </div>
                  {s.temperature != null && <p className="text-slate-400 text-xs">{Math.round(s.temperature)}°F</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && snapshots.length === 0 && !error && (
          <div className="text-center py-8 text-slate-400">
            <p className="text-4xl mb-3">🌡️</p>
            <p>No weather data yet. Tap the button above to fetch NWS conditions.</p>
            <p className="text-xs mt-2">Uses National Weather Service API · Requires location.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
