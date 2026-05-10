import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createIncident } from '../api/client';
import { useUser } from '../hooks/useUser';
import { useGps } from '../hooks/useGps';
import { Layout } from '../components/Layout';
import type { SceneType, ProductStatus } from '../types';

const SCENE_TYPES: SceneType[] = ['Highway', 'Rail', 'Pipeline', 'Fixed facility', 'School', 'Farm/ag', 'Industrial', 'Residential', 'Unknown'];
const PRODUCT_STATUSES: ProductStatus[] = ['Known product', 'Unknown product', 'Placard only', 'Shipping papers found', 'SDS found', 'Vapor cloud only', 'Leaking container', 'Fire involved'];

export function NewIncident() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getLocation, loading: gpsLoading } = useGps();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    incident_number: '',
    agency: user?.agency || '',
    unit: user?.unit || '',
    incident_commander: user?.name || '',
    address: '',
    lat: '',
    lon: '',
    scene_type: '' as SceneType | '',
    product_status: '' as ProductStatus | '',
    started_at: new Date().toISOString().slice(0, 16),
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleGps = async () => {
    try {
      const { lat, lon } = await getLocation();
      setForm(f => ({ ...f, lat: lat.toFixed(6), lon: lon.toFixed(6) }));
    } catch {
      setError('Could not get GPS location. Check permissions.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Incident name is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        lat: form.lat ? parseFloat(form.lat) : undefined,
        lon: form.lon ? parseFloat(form.lon) : undefined,
        started_at: form.started_at ? new Date(form.started_at).toISOString() : new Date().toISOString(),
        scene_type: form.scene_type || undefined,
        product_status: form.product_status || undefined,
      };
      const inc = await createIncident(payload);
      navigate(`/incidents/${inc.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create incident.');
      setSaving(false);
    }
  };

  return (
    <Layout title="New Incident" backTo="/incidents">
      <form onSubmit={handleSubmit} className="space-y-4 pb-8">
        <div className="card space-y-4">
          <h2 className="section-title">Incident Info</h2>
          <div>
            <label className="label">Incident Name *</label>
            <input className="input-field" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Chemical spill - Main St" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Incident Number</label>
              <input className="input-field" value={form.incident_number} onChange={e => set('incident_number', e.target.value)} placeholder="2024-001" />
            </div>
            <div>
              <label className="label">Date/Time Started</label>
              <input className="input-field" type="datetime-local" value={form.started_at} onChange={e => set('started_at', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Agency</label>
              <input className="input-field" value={form.agency} onChange={e => set('agency', e.target.value)} />
            </div>
            <div>
              <label className="label">Unit</label>
              <input className="input-field" value={form.unit} onChange={e => set('unit', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Incident Commander</label>
            <input className="input-field" value={form.incident_commander} onChange={e => set('incident_commander', e.target.value)} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">Location</h2>
          <div>
            <label className="label">Address</label>
            <input className="input-field" value={form.address} onChange={e => set('address', e.target.value)} placeholder="123 Main St, City, State" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Latitude</label>
              <input className="input-field" value={form.lat} onChange={e => set('lat', e.target.value)} placeholder="29.7604" />
            </div>
            <div>
              <label className="label">Longitude</label>
              <input className="input-field" value={form.lon} onChange={e => set('lon', e.target.value)} placeholder="-95.3698" />
            </div>
          </div>
          <button type="button" className="btn-secondary w-full" onClick={handleGps} disabled={gpsLoading}>
            {gpsLoading ? '📡 Getting GPS...' : '📍 Get GPS Location'}
          </button>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">Scene Type</h2>
          <div className="grid grid-cols-2 gap-2">
            {SCENE_TYPES.map(t => (
              <button
                key={t}
                type="button"
                className={`py-3 px-3 rounded-lg font-medium text-sm transition-colors min-h-[44px] ${
                  form.scene_type === t ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                onClick={() => set('scene_type', t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">Product Status</h2>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_STATUSES.map(p => (
              <button
                key={p}
                type="button"
                className={`py-3 px-3 rounded-lg font-medium text-sm transition-colors min-h-[44px] ${
                  form.product_status === p ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
                onClick={() => set('product_status', p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-red-400 bg-red-900/30 rounded-lg p-3">{error}</p>}

        <button type="submit" className="btn-primary w-full text-lg" disabled={saving}>
          {saving ? 'Starting Incident...' : '🚨 Start Incident'}
        </button>
      </form>
    </Layout>
  );
}
