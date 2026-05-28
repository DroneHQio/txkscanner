import { useParams, useNavigate } from 'react-router-dom';
import { createNote } from '../api/client';
import { useUser } from '../hooks/useUser';
import { Layout } from '../components/Layout';
import { useState } from 'react';

const ACTIONS = [
  { emoji: '❓', label: 'Unknown Placard', note: 'Unknown placard observed. Product not yet identified.' },
  { emoji: '🚫', label: 'No Placard Visible', note: 'No placard visible from safe distance.' },
  { emoji: '☁️', label: 'Vapor Cloud Visible', note: 'Vapor cloud visible. Do not enter. Approach upwind.' },
  { emoji: '💧', label: 'Liquid Leak', note: 'Liquid leak observed. Contain runoff. Identify product.' },
  { emoji: '💨', label: 'Gas Leak', note: 'Gas leak observed. Stay upwind. Isolate area.' },
  { emoji: '🔥', label: 'Fire Involved', note: 'Fire involved. Request additional resources. Do not approach.' },
  { emoji: '🚑', label: 'Victims Down', note: 'Victims down observed. Do not enter without proper PPE and product ID. Request EMS.' },
  { emoji: '🚂', label: 'Rail Car Involved', note: 'Rail car involved. Contact railroad emergency number. Check car markings.' },
  { emoji: '🚛', label: 'Tanker Truck Involved', note: 'Tanker truck involved. Check DOT placard, UN number, shipping papers.' },
  { emoji: '🏭', label: 'Fixed Facility', note: 'Fixed facility involved. Contact facility emergency coordinator. Request SDS.' },
];

const GUIDANCE = [
  '🛑 Stop and isolate.',
  '⬆️ Approach uphill, upwind, upstream.',
  '🚫 Do not enter vapor cloud.',
  '🔭 Identify from distance. Use binoculars or camera if available.',
  '🔍 Check for placards, UN number, container shape, shipping papers, SDS.',
  '📞 Request HazMat team.',
  '📋 Start incident log.',
];

export function UnknownProduct() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const navigate = useNavigate();
  const [lastAction, setLastAction] = useState('');

  const handleAction = async (action: typeof ACTIONS[0]) => {
    if (!id) return;
    try {
      await createNote(parseInt(id), {
        user_name: user?.name,
        unit: user?.unit,
        category: 'Product identification',
        note_text: `[Unknown Product Mode] ${action.label}: ${action.note}`,
      });
      setLastAction(`✓ Logged: ${action.label}`);
      setTimeout(() => setLastAction(''), 3000);
    } catch {
      setLastAction('Failed to log note');
    }
  };

  return (
    <Layout title="Unknown Product Mode" backTo={id ? `/incidents/${id}` : '/incidents'}>
      <div className="space-y-4 pb-8">
        <div className="bg-red-900/40 border border-red-600 rounded-xl p-4">
          <p className="text-red-400 font-black text-lg mb-2">⚠️ UNKNOWN PRODUCT PROTOCOL</p>
          <ul className="space-y-1">
            {GUIDANCE.map(g => (
              <li key={g} className="text-sm text-red-100">{g}</li>
            ))}
          </ul>
        </div>

        <p className="text-slate-400 text-sm">Tap a button to log a timestamped note:</p>

        <div className="grid grid-cols-2 gap-3">
          {ACTIONS.map(action => (
            <button
              key={action.label}
              className="bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-semibold py-5 px-3 rounded-xl min-h-[80px] flex flex-col items-center justify-center gap-2 transition-colors"
              onClick={() => handleAction(action)}
            >
              <span className="text-3xl">{action.emoji}</span>
              <span className="text-sm text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>

        {lastAction && (
          <div className="bg-green-900/40 border border-green-700 rounded-lg p-3 text-green-300 text-sm text-center">
            {lastAction}
          </div>
        )}

        <div className="card">
          <p className="section-title">Next Steps</p>
          <div className="space-y-2 text-sm text-slate-300">
            <p>🔍 <strong>Look for:</strong> Placard shape/color, UN 4-digit number, NFPA diamond, container type (tanker, cylinder, box)</p>
            <p>📞 <strong>CHEMTREC:</strong> 1-800-424-9300 (24/7)</p>
            <p>📞 <strong>Poison Control:</strong> 1-800-222-1222</p>
            <p>📚 <strong>ERG Lookup:</strong> Use guide for placard class if UN number unknown</p>
          </div>
          <button
            className="btn-primary w-full mt-3"
            onClick={() => navigate(`/incidents/${id}/erg`)}
          >
            Open ERG Lookup →
          </button>
        </div>
      </div>
    </Layout>
  );
}
