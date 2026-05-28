import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getShippingPapers, createShippingPaper } from '../api/client';
import type { ShippingPaper } from '../types';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function ShippingPapers() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const [papers, setPapers] = useState<ShippingPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    shipping_paper_found: false,
    sds_found: false,
    location_found: '',
    carrier: '',
    driver_name: '',
    facility_contact: '',
    product_name: '',
    un_number: '',
    quantity: '',
    container_type: '',
    hazard_class: '',
    packing_group: '',
    emergency_contact: '',
    notes: '',
  });

  useEffect(() => {
    if (!incidentId) return;
    getShippingPapers(incidentId)
      .then(setPapers)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId) return;
    setSaving(true);
    try {
      const p = await createShippingPaper(incidentId, form);
      setPapers(prev => [p, ...prev]);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Shipping Papers / SDS" backTo={id ? `/incidents/${id}` : '/incidents'} actions={
      <button className="btn-primary text-sm px-3 py-2" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add'}
      </button>
    }>
      <div className="space-y-4 pb-8">
        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-3">
            <h2 className="section-title">Shipping Papers / SDS</h2>
            <div className="grid grid-cols-2 gap-2">
              <button type="button"
                className={`py-3 rounded-lg font-medium text-sm ${form.shipping_paper_found ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-300'}`}
                onClick={() => set('shipping_paper_found', !form.shipping_paper_found)}>
                {form.shipping_paper_found ? '✓ ' : ''}Shipping Papers Found
              </button>
              <button type="button"
                className={`py-3 rounded-lg font-medium text-sm ${form.sds_found ? 'bg-green-700 text-white' : 'bg-slate-700 text-slate-300'}`}
                onClick={() => set('sds_found', !form.sds_found)}>
                {form.sds_found ? '✓ ' : ''}SDS Found
              </button>
            </div>
            <div>
              <label className="label">Location Found</label>
              <input className="input-field" value={form.location_found} onChange={e => set('location_found', e.target.value)} placeholder="Truck cab, facility office..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Carrier / Company</label>
                <input className="input-field" value={form.carrier} onChange={e => set('carrier', e.target.value)} />
              </div>
              <div>
                <label className="label">Driver Name</label>
                <input className="input-field" value={form.driver_name} onChange={e => set('driver_name', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Facility Contact</label>
              <input className="input-field" value={form.facility_contact} onChange={e => set('facility_contact', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Product Name</label>
                <input className="input-field" value={form.product_name} onChange={e => set('product_name', e.target.value)} />
              </div>
              <div>
                <label className="label">UN/NA Number</label>
                <input className="input-field" value={form.un_number} onChange={e => set('un_number', e.target.value)} placeholder="UN1005" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="label">Quantity</label>
                <input className="input-field" value={form.quantity} onChange={e => set('quantity', e.target.value)} />
              </div>
              <div>
                <label className="label">Hazard Class</label>
                <input className="input-field" value={form.hazard_class} onChange={e => set('hazard_class', e.target.value)} placeholder="2.3" />
              </div>
              <div>
                <label className="label">Packing Grp</label>
                <input className="input-field" value={form.packing_group} onChange={e => set('packing_group', e.target.value)} placeholder="I, II, III" />
              </div>
            </div>
            <div>
              <label className="label">Container Type</label>
              <input className="input-field" value={form.container_type} onChange={e => set('container_type', e.target.value)} placeholder="MC-306 tanker, cylinder, IBC..." />
            </div>
            <div>
              <label className="label">Emergency Contact Number</label>
              <input className="input-field" type="tel" value={form.emergency_contact} onChange={e => set('emergency_contact', e.target.value)} />
            </div>
            <div>
              <label className="label">Notes</label>
              <textarea className="input-field min-h-[60px] resize-none" value={form.notes} onChange={e => set('notes', e.target.value)} />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Save Record'}
            </button>
          </form>
        )}

        {loading && <LoadingSpinner />}

        {!loading && papers.length === 0 && !showForm && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">📄</p>
            <p>No shipping paper / SDS records yet.</p>
          </div>
        )}

        {papers.map(p => (
          <div key={p.id} className="card border-l-4 border-l-blue-600">
            <div className="flex flex-wrap gap-2 mb-3">
              {p.shipping_paper_found && <span className="badge-green">Shipping Papers ✓</span>}
              {p.sds_found && <span className="badge-green">SDS ✓</span>}
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {p.product_name && <div><span className="text-slate-400">Product:</span> {p.product_name}</div>}
              {p.un_number && <div><span className="text-slate-400">UN#:</span> <span className="font-mono font-bold text-orange-400">{p.un_number}</span></div>}
              {p.carrier && <div><span className="text-slate-400">Carrier:</span> {p.carrier}</div>}
              {p.driver_name && <div><span className="text-slate-400">Driver:</span> {p.driver_name}</div>}
              {p.quantity && <div><span className="text-slate-400">Qty:</span> {p.quantity}</div>}
              {p.hazard_class && <div><span className="text-slate-400">Class:</span> {p.hazard_class}</div>}
              {p.emergency_contact && <div className="col-span-2"><span className="text-slate-400">Emerg. Contact:</span> <span className="text-orange-400 font-mono">{p.emergency_contact}</span></div>}
            </div>
            {p.notes && <p className="text-slate-300 text-sm mt-2">{p.notes}</p>}
            <p className="text-slate-500 text-xs mt-2">{fmt(p.created_at)}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}
