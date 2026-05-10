import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getNotes, createNote } from '../api/client';
import type { IncidentNote, NoteCategory } from '../types';
import { useUser } from '../hooks/useUser';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

const CATEGORIES: NoteCategory[] = [
  'General', 'Command', 'Product identification', 'ERG lookup', 'Weather update',
  'Evacuation', 'Shelter-in-place', 'Exposure', 'Decon', 'EMS', 'Law enforcement',
  'HazMat team', 'Fire suppression', 'Spill control', 'Public information',
  'Road closure', 'Environmental concern', 'Command transfer', 'Call closed',
];

const QUICK_NOTES = [
  { label: 'Arrived on scene', cat: 'Command' as NoteCategory },
  { label: 'Established command', cat: 'Command' as NoteCategory },
  { label: 'Product unknown', cat: 'Product identification' as NoteCategory },
  { label: 'Product identified', cat: 'Product identification' as NoteCategory },
  { label: 'ERG consulted', cat: 'ERG lookup' as NoteCategory },
  { label: 'Weather checked', cat: 'Weather update' as NoteCategory },
  { label: 'Wind direction confirmed', cat: 'Weather update' as NoteCategory },
  { label: 'HazMat team requested', cat: 'HazMat team' as NoteCategory },
  { label: 'Law enforcement requested', cat: 'Law enforcement' as NoteCategory },
  { label: 'EMS requested', cat: 'EMS' as NoteCategory },
  { label: 'Evacuation ordered', cat: 'Evacuation' as NoteCategory },
  { label: 'Shelter-in-place ordered', cat: 'Shelter-in-place' as NoteCategory },
  { label: 'Road closed', cat: 'Road closure' as NoteCategory },
  { label: 'Decon established', cat: 'Decon' as NoteCategory },
  { label: 'Victim located', cat: 'Exposure' as NoteCategory },
  { label: 'Exposure reported', cat: 'Exposure' as NoteCategory },
  { label: 'Command transferred', cat: 'Command transfer' as NoteCategory },
  { label: 'Incident stabilized', cat: 'Command' as NoteCategory },
  { label: 'Scene turned over', cat: 'Call closed' as NoteCategory },
];

function fmt(dt: string) {
  return new Date(dt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function NotesLog() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const { user } = useUser();
  const [notes, setNotes] = useState<IncidentNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [category, setCategory] = useState<NoteCategory>('General');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'write' | 'quick' | 'log'>('log');

  useEffect(() => {
    if (!incidentId) return;
    getNotes(incidentId)
      .then(setNotes)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const addNote = async (noteText: string, cat: NoteCategory) => {
    if (!incidentId || !noteText.trim()) return;
    setSaving(true);
    try {
      const n = await createNote(incidentId, {
        user_name: user?.name,
        unit: user?.unit,
        category: cat,
        note_text: noteText,
      });
      setNotes(prev => [n, ...prev]);
      setText('');
    } finally {
      setSaving(false);
    }
  };

  const handleQuick = async (q: typeof QUICK_NOTES[0]) => {
    await addNote(q.label, q.cat);
  };

  return (
    <Layout title="Notes Log" backTo={id ? `/incidents/${id}` : '/incidents'}>
      <div className="space-y-4 pb-8">
        <div className="flex gap-2">
          {(['log', 'write', 'quick'] as const).map(t => (
            <button
              key={t}
              className={`flex-1 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`}
              onClick={() => setTab(t)}
            >
              {t === 'log' ? '📋 Log' : t === 'write' ? '✏️ Write Note' : '⚡ Quick Notes'}
            </button>
          ))}
        </div>

        {tab === 'write' && (
          <div className="card space-y-3">
            <div>
              <label className="label">Category</label>
              <select className="input-field" value={category} onChange={e => setCategory(e.target.value as NoteCategory)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Note</label>
              <textarea
                className="input-field min-h-[100px] resize-none"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter note..."
              />
            </div>
            <button className="btn-primary w-full" onClick={() => addNote(text, category)} disabled={saving || !text.trim()}>
              {saving ? 'Saving...' : 'Add Note'}
            </button>
          </div>
        )}

        {tab === 'quick' && (
          <div className="grid grid-cols-2 gap-2">
            {QUICK_NOTES.map(q => (
              <button
                key={q.label}
                className="bg-slate-700 hover:bg-slate-600 text-white text-sm py-3 px-3 rounded-lg min-h-[60px] text-left leading-tight transition-colors"
                onClick={() => handleQuick(q)}
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        {tab === 'log' && (
          <div className="space-y-2">
            {loading && <LoadingSpinner />}
            {!loading && notes.length === 0 && (
              <div className="text-center py-8 text-slate-400">
                <p className="text-4xl mb-2">📋</p>
                <p>No notes yet. Add notes from the Quick Notes or Write Note tab.</p>
              </div>
            )}
            {notes.map(n => (
              <div key={n.id} className="card border-l-4 border-l-orange-600">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1">
                    <p className="text-white text-sm">{n.note_text}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {n.user_name} · {n.unit}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="badge-blue text-xs">{n.category}</span>
                    <p className="text-slate-500 text-xs mt-1">{fmt(n.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
