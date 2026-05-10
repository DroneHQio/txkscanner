import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getResources, createResource, updateResource } from '../api/client';
import type { Resource, ResourceType } from '../types';
import { useUser } from '../hooks/useUser';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

const RESOURCE_TYPES: ResourceType[] = [
  'HazMat team', 'Law enforcement', 'EMS', 'Fire mutual aid', 'Emergency management',
  'TCEQ/state environmental', 'Railroad emergency contact', 'Pipeline emergency contact',
  'Facility representative', 'CHEMTREC', 'Poison Control', 'Tow/recovery',
  'Public works', 'School/facility admin', 'Other',
];

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function statusColor(r: Resource) {
  if (r.cleared_time) return 'border-l-slate-500';
  if (r.arrived_time) return 'border-l-green-600';
  if (r.eta) return 'border-l-yellow-600';
  return 'border-l-orange-600';
}

function statusLabel(r: Resource) {
  if (r.cleared_time) return { label: 'Cleared', cls: 'badge-blue' };
  if (r.arrived_time) return { label: 'On Scene', cls: 'badge-green' };
  if (r.eta) return { label: 'En Route', cls: 'badge-yellow' };
  return { label: 'Requested', cls: 'badge-red' };
}

export function ResourceTracking() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const { user } = useUser();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    resource_type: 'HazMat team' as ResourceType,
    time_requested: new Date().toTimeString().slice(0, 5),
    requested_by: user?.name || '',
    contact_person: '',
    phone: '',
    eta: '',
    notes: '',
  });

  useEffect(() => {
    if (!incidentId) return;
    getResources(incidentId)
      .then(setResources)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId) return;
    setSaving(true);
    try {
      const r = await createResource(incidentId, form);
      setResources(prev => [r, ...prev]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  const markArrived = async (r: Resource) => {
    if (!incidentId) return;
    const now = new Date().toTimeString().slice(0, 5);
    const updated = await updateResource(incidentId, r.id, { arrived_time: now });
    setResources(prev => prev.map(x => x.id === r.id ? updated : x));
  };

  const markCleared = async (r: Resource) => {
    if (!incidentId) return;
    const now = new Date().toTimeString().slice(0, 5);
    const updated = await updateResource(incidentId, r.id, { cleared_time: now });
    setResources(prev => prev.map(x => x.id === r.id ? updated : x));
  };

  return (
    <Layout title="Resource Tracking" backTo={id ? `/incidents/${id}` : '/incidents'} actions={
      <button className="btn-primary text-sm px-3 py-2" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Request'}
      </button>
    }>
      <div className="space-y-4 pb-8">
        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-3">
            <h2 className="section-title">Request Resource</h2>
            <div>
              <label className="label">Resource Type</label>
              <select className="input-field" value={form.resource_type} onChange={e => set('resource_type', e.target.value)}>
                {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Time Requested</label>
                <input className="input-field" type="time" value={form.time_requested} onChange={e => set('time_requested', e.target.value)} />
              </div>
              <div>
                <label className="label">Requested By</label>
                <input className="input-field" value={form.requested_by} onChange={e => set('requested_by', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Contact Person</label>
                <input className="input-field" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input className="input-field" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">ETA</label>
              <input className="input-field" value={form.eta} onChange={e => set('eta', e.target.value)} placeholder="15 min / 14:30" />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input-field min-h-[60px] resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Log Resource Request'}
            </button>
          </form>
        )}

        {loading && <LoadingSpinner />}

        {!loading && resources.length === 0 && !showForm && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">📞</p>
            <p>No resources requested yet.</p>
          </div>
        )}

        {resources.map(r => {
          const { label, cls } = statusLabel(r);
          return (
            <div key={r.id} className={`card border-l-4 ${statusColor(r)}`}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-white">{r.resource_type}</p>
                  {r.contact_person && <p className="text-slate-400 text-sm">{r.contact_person}</p>}
                  {r.phone && <p className="text-orange-400 text-sm font-mono">{r.phone}</p>}
                </div>
                <span className={`${cls} text-xs shrink-0`}>{label}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                {r.time_requested && <span>Req: {r.time_requested}</span>}
                {r.eta && <span>ETA: {r.eta}</span>}
                {r.arrived_time && <span className="text-green-400">Arrived: {r.arrived_time}</span>}
                {r.cleared_time && <span className="text-slate-400">Cleared: {r.cleared_time}</span>}
              </div>
              {r.notes && <p className="text-slate-300 text-sm mt-2">{r.notes}</p>}
              {!r.arrived_time && (
                <button className="btn-success text-xs py-2 mt-2 w-full" onClick={() => markArrived(r)}>
                  Mark Arrived
                </button>
              )}
              {r.arrived_time && !r.cleared_time && (
                <button className="btn-secondary text-xs py-2 mt-2 w-full" onClick={() => markCleared(r)}>
                  Mark Cleared
                </button>
              )}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
