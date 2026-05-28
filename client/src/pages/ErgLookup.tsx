import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { searchErg, getErgById, updateIncident, createNote } from '../api/client';
import type { ErgMaterial } from '../types';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { Disclaimer } from '../components/Disclaimer';
import { useUser } from '../hooks/useUser';

function Section({ title, text }: { title: string; text?: string | null }) {
  if (!text) return null;
  return (
    <div>
      <p className="text-orange-400 text-sm font-bold mt-3 mb-1">{title}</p>
      <p className="text-slate-300 text-sm whitespace-pre-wrap">{text}</p>
    </div>
  );
}

export function ErgLookup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ErgMaterial[]>([]);
  const [selected, setSelected] = useState<ErgMaterial | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const search = async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await searchErg(q);
      setResults(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = async (mat: ErgMaterial) => {
    setLoading(true);
    try {
      const full = await getErgById(mat.id);
      setSelected(full);
      setResults([]);
      setQuery('');
    } finally {
      setLoading(false);
    }
  };

  const applyToIncident = async () => {
    if (!selected || !id) return;
    setSaving(true);
    try {
      await updateIncident(parseInt(id), {
        material_name: selected.name,
        un_number: selected.un_number,
        erg_guide: selected.erg_guide,
      });
      await createNote(parseInt(id), {
        user_name: user?.name,
        unit: user?.unit,
        category: 'ERG lookup',
        note_text: `ERG consulted: ${selected.name} (${selected.un_number}) — Guide #${selected.erg_guide}`,
      });
      setMessage('Applied to incident ✓');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="ERG Lookup" backTo={id ? `/incidents/${id}` : '/incidents'}>
      <div className="space-y-4 pb-8">
        <Disclaimer compact />

        <div>
          <input
            className="input-field text-lg"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search UN#, chemical name, ERG guide..."
            autoFocus
          />
        </div>

        {loading && <LoadingSpinner text="Searching..." />}

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map(mat => (
              <button
                key={mat.id}
                className="card w-full text-left hover:bg-slate-700 transition-colors"
                onClick={() => handleSelect(mat)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-white">{mat.name}</p>
                    <p className="text-slate-400 text-sm">{mat.un_number}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge-orange text-xs bg-orange-900 text-orange-300 px-2 py-1 rounded-full">
                      Guide {mat.erg_guide}
                    </span>
                    <p className="text-slate-500 text-xs mt-1">Class {mat.placard_class}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {!query && !selected && (
          <div className="card">
            <p className="text-slate-400 text-sm mb-3">Quick search examples:</p>
            <div className="flex flex-wrap gap-2">
              {['UN1005', 'UN1017', 'Chlorine', 'Ammonia', 'Gasoline', 'Propane'].map(q => (
                <button key={q} className="bg-slate-700 text-slate-300 rounded-lg px-3 py-2 text-sm" onClick={() => setQuery(q)}>
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <div className="space-y-3">
            <div className="card border-orange-600">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h2 className="text-xl font-black text-white">{selected.name}</h2>
                  <p className="text-orange-400 font-mono text-lg">{selected.un_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-yellow-400">Guide {selected.erg_guide}</p>
                  <p className="text-slate-400 text-sm">Class {selected.placard_class}</p>
                </div>
              </div>

              {selected.has_distance_data && selected.distances && selected.distances.length > 0 && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-3">
                  <p className="text-red-400 font-bold text-sm mb-2">
                    ⚠️ SAMPLE/MOCK Distance Data — Not official ERG values
                  </p>
                  {selected.distances.map(d => (
                    <div key={d.id} className="text-sm text-slate-300">
                      {d.spill_size.toUpperCase()} spill ({d.day_night}):
                      Isolation {d.initial_isolation_meters}m · PA {d.protective_action_meters}m
                    </div>
                  ))}
                </div>
              )}

              <Section title="Potential Hazards" text={selected.potential_hazards} />
              <Section title="Health Hazards" text={selected.health_hazards} />
              <Section title="Fire / Explosion Hazards" text={selected.fire_hazards} />
              <Section title="Public Safety" text={selected.public_safety} />
              <Section title="Protective Clothing" text={selected.protective_clothing} />
              <Section title="Evacuation Guidance" text={selected.evacuation_guidance} />
              <Section title="Fire Response" text={selected.fire_response} />
              <Section title="Spill / Leak Guidance" text={selected.spill_guidance} />
              <Section title="First Aid" text={selected.first_aid} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {id && (
                <button className="btn-primary" onClick={applyToIncident} disabled={saving}>
                  {saving ? 'Saving...' : '✅ Apply to Incident'}
                </button>
              )}
              <button className="btn-secondary" onClick={() => setSelected(null)}>
                Search Again
              </button>
            </div>
            {message && <p className="text-green-400 text-sm text-center">{message}</p>}
          </div>
        )}
      </div>
    </Layout>
  );
}
