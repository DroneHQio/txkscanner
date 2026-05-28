import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getExposure, createExposure } from '../api/client';
import type { ExposureLog as ExposureLogType, ExposureType } from '../types';
import { useUser } from '../hooks/useUser';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

const EXPOSURE_TYPES: ExposureType[] = ['Inhalation', 'Skin contact', 'Eye contact', 'Ingestion', 'Unknown'];

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ExposureLog() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const { user } = useUser();
  const [logs, setLogs] = useState<ExposureLogType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    person_name: '',
    type: 'responder' as 'responder' | 'civilian',
    agency: '',
    unit: '',
    contact_info: '',
    exposure_type: 'Inhalation' as ExposureType,
    symptoms: '',
    ppe_worn: '',
    zone_entered: '',
    time_entered: '',
    time_exited: '',
    decon_completed: false,
    ems_evaluated: false,
    transported: false,
    hospital: '',
    notes: '',
  });

  useEffect(() => {
    if (!incidentId) return;
    getExposure(incidentId)
      .then(setLogs)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId || !form.person_name.trim()) return;
    setSaving(true);
    try {
      const log = await createExposure(incidentId, form);
      setLogs(prev => [log, ...prev]);
      setShowForm(false);
      setForm({ ...form, person_name: '', symptoms: '', contact_info: '', notes: '', hospital: '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Exposure Log" backTo={id ? `/incidents/${id}` : '/incidents'} actions={
      <button className="btn-primary text-sm px-3 py-2" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add'}
      </button>
    }>
      <div className="space-y-4 pb-8">
        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-3">
            <h2 className="section-title">New Exposure Entry</h2>
            <div>
              <label className="label">Person Name *</label>
              <input className="input-field" value={form.person_name} onChange={e => set('person_name', e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Type</label>
                <div className="flex gap-2">
                  {(['responder', 'civilian'] as const).map(t => (
                    <button key={t} type="button" className={`flex-1 py-2 rounded-lg capitalize text-sm ${form.type === t ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`} onClick={() => set('type', t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Exposure Type</label>
                <select className="input-field" value={form.exposure_type} onChange={e => set('exposure_type', e.target.value)}>
                  {EXPOSURE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
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
              <label className="label">Contact Info</label>
              <input className="input-field" value={form.contact_info} onChange={e => set('contact_info', e.target.value)} placeholder="Phone or address" />
            </div>
            <div>
              <label className="label">Symptoms</label>
              <textarea className="input-field min-h-[60px] resize-none" value={form.symptoms} onChange={e => set('symptoms', e.target.value)} />
            </div>
            <div>
              <label className="label">PPE Worn</label>
              <input className="input-field" value={form.ppe_worn} onChange={e => set('ppe_worn', e.target.value)} placeholder="Level A, Level B, SCBA..." />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">Zone Entered</label>
                <select className="input-field" value={form.zone_entered} onChange={e => set('zone_entered', e.target.value)}>
                  <option value="">—</option>
                  <option>Hot</option>
                  <option>Warm</option>
                  <option>Cold</option>
                </select>
              </div>
              <div>
                <label className="label">Time In</label>
                <input className="input-field" type="time" value={form.time_entered} onChange={e => set('time_entered', e.target.value)} />
              </div>
              <div>
                <label className="label">Time Out</label>
                <input className="input-field" type="time" value={form.time_exited} onChange={e => set('time_exited', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Decon Done', key: 'decon_completed' },
                { label: 'EMS Eval', key: 'ems_evaluated' },
                { label: 'Transported', key: 'transported' },
              ].map(({ label, key }) => (
                <button
                  key={key}
                  type="button"
                  className={`py-3 rounded-lg text-sm font-medium ${(form as any)[key] ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-300'}`}
                  onClick={() => set(key, !(form as any)[key])}
                >
                  {(form as any)[key] ? '✓ ' : ''}{label}
                </button>
              ))}
            </div>
            {form.transported && (
              <div>
                <label className="label">Hospital</label>
                <input className="input-field" value={form.hospital} onChange={e => set('hospital', e.target.value)} />
              </div>
            )}
            <div>
              <label className="label">Notes</label>
              <textarea className="input-field min-h-[60px] resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Add Exposure Record'}
            </button>
          </form>
        )}

        {loading && <LoadingSpinner />}

        {!loading && logs.length === 0 && !showForm && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">🧑‍⚕️</p>
            <p>No exposures logged.</p>
          </div>
        )}

        {logs.map(log => (
          <div key={log.id} className="card border-l-4 border-l-red-600">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold text-white">{log.person_name}</p>
                <p className="text-slate-400 text-sm">{log.type} · {log.agency} {log.unit}</p>
              </div>
              <span className="badge-red shrink-0">{log.exposure_type}</span>
            </div>
            {log.symptoms && <p className="text-sm text-slate-300 mb-2"><span className="text-slate-500">Symptoms:</span> {log.symptoms}</p>}
            <div className="flex flex-wrap gap-2 text-xs">
              {log.zone_entered && <span className="badge-yellow">Zone: {log.zone_entered}</span>}
              {log.ppe_worn && <span className="badge-blue">PPE: {log.ppe_worn}</span>}
              {log.decon_completed && <span className="badge-green">Decon ✓</span>}
              {log.ems_evaluated && <span className="badge-green">EMS Eval ✓</span>}
              {log.transported && <span className="badge-red">Transported</span>}
            </div>
            <p className="text-slate-500 text-xs mt-2">{fmt(log.created_at)}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
