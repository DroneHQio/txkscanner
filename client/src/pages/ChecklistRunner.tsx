import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getChecklist, updateChecklistItem } from '../api/client';
import type { ChecklistItem } from '../types';
import { useUser } from '../hooks/useUser';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

const SECTION_ORDER = [
  'Initial Arrival', 'Scene Size-Up', 'Product Identification', 'Isolation',
  'Command', 'Notifications', 'Evacuation/Shelter', 'Responder Safety',
  'Decon', 'Exposure Tracking', 'Environmental Concerns', 'Termination',
];

export function ChecklistRunner() {
  const { id } = useParams<{ id: string }>();
  const incidentId = id ? parseInt(id) : null;
  const { user } = useUser();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('Initial Arrival');

  useEffect(() => {
    if (!incidentId) return;
    getChecklist(incidentId)
      .then(setItems)
      .finally(() => setLoading(false));
  }, [incidentId]);

  const toggle = async (item: ChecklistItem) => {
    if (!incidentId) return;
    const updated = await updateChecklistItem(incidentId, item.id, {
      completed: !item.completed,
      completed_by: !item.completed ? (user?.name || 'Unknown') : undefined,
    });
    setItems(prev => prev.map(i => i.id === item.id ? updated : i));
  };

  const sections = SECTION_ORDER.filter(s => items.some(i => i.section === s));
  const sectionItems = (section: string) => items.filter(i => i.section === section).sort((a, b) => a.sort_order - b.sort_order);
  const sectionDone = (section: string) => sectionItems(section).filter(i => i.completed).length;
  const sectionTotal = (section: string) => sectionItems(section).length;
  const totalDone = items.filter(i => i.completed).length;
  const totalItems = items.length;

  if (loading) return <Layout title="Checklist" backTo={id ? `/incidents/${id}` : '/incidents'}><LoadingSpinner /></Layout>;

  return (
    <Layout title="Checklist Runner" backTo={id ? `/incidents/${id}` : '/incidents'}>
      <div className="space-y-4 pb-8">
        {/* Overall progress */}
        <div className="card">
          <div className="flex justify-between mb-2">
            <span className="text-slate-300 text-sm">Overall Progress</span>
            <span className="text-orange-400 font-bold">{totalDone}/{totalItems}</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4">
            <div
              className="bg-orange-500 h-4 rounded-full transition-all"
              style={{ width: totalItems ? `${(totalDone / totalItems) * 100}%` : '0%' }}
            />
          </div>
          {totalDone === totalItems && totalItems > 0 && (
            <p className="text-green-400 text-center mt-2 font-bold">✅ Checklist Complete!</p>
          )}
        </div>

        {/* Section tabs */}
        <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
          {sections.map(s => {
            const done = sectionDone(s);
            const total = sectionTotal(s);
            const allDone = done === total;
            return (
              <button
                key={s}
                className={`shrink-0 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  activeSection === s
                    ? 'bg-orange-600 text-white'
                    : allDone
                    ? 'bg-green-900 text-green-300'
                    : 'bg-slate-700 text-slate-300'
                }`}
                onClick={() => setActiveSection(s)}
              >
                {allDone ? '✅ ' : ''}{s} ({done}/{total})
              </button>
            );
          })}
        </div>

        {/* Items for active section */}
        <div className="space-y-2">
          <h2 className="section-title">{activeSection}</h2>
          {sectionItems(activeSection).map(item => (
            <button
              key={item.id}
              className={`w-full text-left card flex items-start gap-3 transition-colors ${item.completed ? 'opacity-60' : 'hover:bg-slate-700'}`}
              onClick={() => toggle(item)}
            >
              <div className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                item.completed ? 'bg-green-600 border-green-600' : 'border-slate-500'
              }`}>
                {item.completed && <span className="text-white text-xs">✓</span>}
              </div>
              <div className="flex-1">
                <p className={`text-sm ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                  {item.item_text}
                </p>
                {item.completed && item.completed_by && (
                  <p className="text-slate-500 text-xs mt-1">{item.completed_by} · {item.completed_at ? new Date(item.completed_at).toLocaleTimeString() : ''}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}
