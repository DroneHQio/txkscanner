import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPhotos, createPhoto, deletePhoto } from '../api/client';
import type { Photo } from '../types';
import { useUser } from '../hooks/useUser';
import { useGps } from '../hooks/useGps';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

const PHOTO_CATEGORIES = [
  'Placard', 'UN Number', 'Shipping Papers', 'SDS', 'Container Damage',
  'Leak', 'Vapor Cloud', 'Scene Overview', 'Roadblock', 'Decon Area',
  'Command Post', 'Other',
];

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function PhotoAttachments() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const { user } = useUser();
  const { getLocation } = useGps();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ caption: '', category: 'Scene Overview', filename: '' });

  useEffect(() => {
    if (!incidentId) return;
    getPhotos(incidentId)
      .then(setPhotos)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentId) return;
    setSaving(true);
    try {
      let lat: number | undefined;
      let lon: number | undefined;
      try {
        const pos = await getLocation();
        lat = pos.lat;
        lon = pos.lon;
      } catch {}

      const p = await createPhoto(incidentId, {
        ...form,
        lat,
        lon,
        uploaded_by: user?.name,
      });
      setPhotos(prev => [p, ...prev]);
      setShowForm(false);
      setForm({ caption: '', category: 'Scene Overview', filename: '' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (photoId: number) => {
    if (!incidentId || !confirm('Remove this photo record?')) return;
    await deletePhoto(incidentId, photoId);
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  return (
    <Layout title="Photo Attachments" backTo={id ? `/incidents/${id}` : '/incidents'} actions={
      <button className="btn-primary text-sm px-3 py-2" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : '+ Add Photo'}
      </button>
    }>
      <div className="space-y-4 pb-8">
        <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 text-sm text-slate-300">
          📷 Photo records log metadata (caption, GPS, category, timestamp). Attach physical photos to the printed report or your CAD system.
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="card space-y-3">
            <h2 className="section-title">Add Photo Record</h2>
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={form.category} onChange={e => set('category', e.target.value)}>
                {PHOTO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Caption / Description</label>
              <input className="input-field" value={form.caption} onChange={e => set('caption', e.target.value)} placeholder="What does this photo show?" />
            </div>
            <div>
              <label className="label">Filename or Reference (optional)</label>
              <input className="input-field" value={form.filename} onChange={e => set('filename', e.target.value)} placeholder="IMG_1234.jpg" />
            </div>
            <p className="text-slate-400 text-xs">GPS will be captured automatically if available.</p>
            <button type="submit" className="btn-primary w-full" disabled={saving}>
              {saving ? 'Saving...' : 'Log Photo Record'}
            </button>
          </form>
        )}

        {loading && <LoadingSpinner />}

        {!loading && photos.length === 0 && !showForm && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-4xl mb-2">📷</p>
            <p>No photo records yet.</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {photos.map(p => (
            <div key={p.id} className="card">
              <div className="bg-slate-700 rounded-lg h-24 flex items-center justify-center mb-2 text-4xl">
                📷
              </div>
              <p className="text-xs font-medium text-white truncate">{p.caption || '(No caption)'}</p>
              <p className="text-xs text-orange-400">{p.category}</p>
              {p.lat && <p className="text-xs text-slate-500 font-mono">{p.lat.toFixed(4)}, {p.lon?.toFixed(4)}</p>}
              <p className="text-xs text-slate-500">{fmt(p.created_at)}</p>
              <button className="text-red-400 text-xs mt-1 underline" onClick={() => handleDelete(p.id)}>Remove</button>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
