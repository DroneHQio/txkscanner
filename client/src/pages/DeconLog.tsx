import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getDecon, createDecon } from '../api/client';
import type { DeconLog as DeconLogType } from '../types';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function DeconLog() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const [logs, setLogs] = useState<DeconLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    established_time: '',
    location: '',
    personnel_assigned: '',
    water_source: '',
    runoff_controlled: false,
    gross_decon_completed: false,
    technical_decon_requested: false,
    person_name: '',
    time_through_decon: '',
    clothing_removed: false,
    ems_handoff: false,
    notes: '',
  });

  useEffect(() => {
    if (!incidentId) return;
    getDecon(incidentId)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId) return;
    setSaving(true);
    try {
      const log = await createDecon(incidentId, form);
      setLogs(prev => [log, ...prev]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Decon Log" backTo={id ? `/incidents/${id}` : '/incidents'} actions={
      <button className="btn-primary text-sm px-3 py-2" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add'}
      </button>
    }>
      <div className="space-y-4 pb-8">
        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-3">
            <h2 className="section-title">Decon Entry</h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Established Time</label>
                <input className="input-field" type="time" value={form.established_time} onChange={e => set('established_time', e.target.value)} />
              </div>
              <div>
                <label className="label">Location</label>
                <input className="input-field" value={form.location} onChange={e => set('location', e.target.value)} placeholder="NW corner of lot" />
              </div>
            </div>
            <div>
              <label className="label">Personnel Assigned</label>
              <input className="input-field" value={form.personnel_assigned} onChange={e => set('personnel_assigned', e.target.value)} />
            </div>
            <div>
              <label className="label">Water Supply Source</label>
              <input className="input-field" value={form.water_source} onChange={e => set('water_source', e.target.value)} placeholder="Hydrant, tanker..." />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Runoff Controlled', key: 'runoff_controlled' },
                { label: 'Gross Decon Done', key: 'gross_decon_completed' },
                { label: 'Tech Decon Req.', key: 'technical_decon_requested' },
              ].map(({ label, key }) => (
                <button key={key} type="button"
                  className={`py-3 rounded-lg text-sm font-medium ${(form as any)[key] ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-300'}`}
                  onClick={() => set(key, !(form as any)[key])}>
                  {(form as any)[key] ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-3">
              <p className="text-slate-400 text-sm mb-2">Person Through Decon (optional):</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Name</label>
                  <input className="input-field" value={form.person_name} onChange={e => set('person_name', e.target.value)} />
                </div>
                <div>
                  <label className="label">Time Through</label>
                  <input className="input-field" type="time" value={form.time_through_decon} onChange={e => set('time_through_decon', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { label: 'Clothing Removed', key: 'clothing_removed' },
                  { label: 'EMS Handoff', key: 'ems_handoff' },
                ].map(({ label, key }) => (
                  <button key={key} type="button"
                    className={`py-3 rounded-lg text-sm font-medium ${(form as any)[key] ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-300'}`}
                    onClick={() => set(key, !(form as any)[key])}>
                    {(form as any)[key] ? '✓ ' : ''}{label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea className="input-field min-h-[60px] resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Add Decon Record'}
            </button>
          </form>
        )}

        {loading && <LoadingSpinner />}

        {!loading && logs.length === 0 && !showForm && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">🚿</p>
            <p>No decon records yet.</p>
          </div>
        )}

        {logs.map(log => (
          <div key={log.id} className="card border-l-4 border-l-cyan-600">
            <div className="grid grid-cols-2 gap-2 text-sm mb-2">
              {log.established_time && <div><span className="text-slate-400">Established:</span> {log.established_time}</div>}
              {log.location && <div><span className="text-slate-400">Location:</span> {log.location}</div>}
              {log.water_source && <div><span className="text-slate-400">Water:</span> {log.water_source}</div>}
              {log.person_name && <div><span className="text-slate-400">Person:</span> {log.person_name}</div>}
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
              {log.runoff_controlled && <span className="badge-green">Runoff ✓</span>}
              {log.gross_decon_completed && <span className="badge-green">Gross Decon ✓</span>}
              {log.technical_decon_requested && <span className="badge-yellow">Tech Decon Req.</span>}
              {log.clothing_removed && <span className="badge-blue">Clothing Removed</span>}
              {log.ems_handoff && <span className="badge-green">EMS Handoff ✓</span>}
            </div>
            {log.notes && <p className="text-slate-300 text-sm mt-2">{log.notes}</p>}
            <p className="text-slate-500 text-xs mt-2">{fmt(log.created_at)}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
