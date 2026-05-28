import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { createNote, updateIncident } from '../api/client';
import { useUser } from '../hooks/useUser';
import { Layout } from '../components/Layout';
import { Disclaimer } from '../components/Disclaimer';

const ACTION_BUTTONS = [
  { label: 'Evacuation Ordered', note: 'Evacuation ordered for affected area.', color: 'bg-red-700 hover:bg-red-600' },
  { label: 'Shelter-in-Place Ordered', note: 'Shelter-in-place ordered for affected area.', color: 'bg-yellow-700 hover:bg-yellow-600' },
  { label: 'Roadblocks Established', note: 'Roadblocks established to control access.', color: 'bg-orange-700 hover:bg-orange-600' },
  { label: 'Law Enforcement Requested', note: 'Law enforcement requested for perimeter and evacuation.', color: 'bg-slate-600 hover:bg-slate-500' },
  { label: 'HazMat Team Requested', note: 'HazMat team requested.', color: 'bg-slate-600 hover:bg-slate-500' },
  { label: 'Command Post Established', note: 'Command post established.', color: 'bg-green-800 hover:bg-green-700' },
  { label: 'Decon Established', note: 'Decon corridor established.', color: 'bg-green-800 hover:bg-green-700' },
];

export function EvacuationGuidance() {
  const { id } = useParams<{ id: string }>();
  const { user } = useUser();
  const [spillSize, setSpillSize] = useState<'small' | 'large'>('small');
  const [dayNight, setDayNight] = useState<'day' | 'night'>('day');
  const [windDir, setWindDir] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [initIso, setInitIso] = useState('');
  const [protAction, setProtAction] = useState('');
  const [lastAction, setLastAction] = useState('');

  const logAction = async (btn: typeof ACTION_BUTTONS[0]) => {
    if (!id) return;
    try {
      await createNote(parseInt(id), {
        user_name: user?.name,
        unit: user?.unit,
        category: btn.label.includes('Evacuation') ? 'Evacuation' : btn.label.includes('Shelter') ? 'Shelter-in-place' : 'Command',
        note_text: `[Evacuation] ${btn.label}: ${btn.note}`,
      });
      setLastAction(`✓ Logged: ${btn.label}`);
      setTimeout(() => setLastAction(''), 3000);
    } catch {
      setLastAction('Failed to log');
    }
  };

  const applyDistances = async () => {
    if (!id || !initIso || !protAction) return;
    await updateIncident(parseInt(id), {
      initial_isolation_distance: parseFloat(initIso),
      protective_action_distance: parseFloat(protAction),
    });
    await createNote(parseInt(id), {
      user_name: user?.name,
      unit: user?.unit,
      category: 'Evacuation',
      note_text: `Isolation distance set: ${initIso}m. Protective action distance set: ${protAction}m. Spill: ${spillSize}, ${dayNight}. Wind: ${windDir || 'unknown'} at ${windSpeed || 'unknown'}.`,
    });
    setLastAction('✓ Distances applied to incident');
    setTimeout(() => setLastAction(''), 3000);
  };

  const isoM = parseFloat(initIso) || 0;
  const paM = parseFloat(protAction) || 0;

  return (
    <Layout title="Evacuation Guidance" backTo={id ? `/incidents/${id}` : '/incidents'}>
      <div className="space-y-4 pb-8">
        <Disclaimer compact />

        <div className="card space-y-4">
          <h2 className="section-title">Scenario</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Spill Size</label>
              <div className="grid grid-cols-2 gap-2">
                {(['small', 'large'] as const).map(s => (
                  <button key={s} className={`py-3 rounded-lg font-medium capitalize ${spillSize === s ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`} onClick={() => setSpillSize(s)}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Time of Day</label>
              <div className="grid grid-cols-2 gap-2">
                {(['day', 'night'] as const).map(d => (
                  <button key={d} className={`py-3 rounded-lg font-medium capitalize ${dayNight === d ? 'bg-orange-600 text-white' : 'bg-slate-700 text-slate-300'}`} onClick={() => setDayNight(d)}>{d}</button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Wind Direction</label>
              <input className="input-field" value={windDir} onChange={e => setWindDir(e.target.value)} placeholder="NNW, SW..." />
            </div>
            <div>
              <label className="label">Wind Speed</label>
              <input className="input-field" value={windSpeed} onChange={e => setWindSpeed(e.target.value)} placeholder="10 mph" />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="section-title">Distance Guidance</h2>
          <p className="text-yellow-400 text-xs">⚠️ Enter values from ERG or HazMat team. All values are SAMPLE/MOCK until official data is imported.</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Initial Isolation (m)</label>
              <input className="input-field" type="number" value={initIso} onChange={e => setInitIso(e.target.value)} placeholder="e.g. 60" />
            </div>
            <div>
              <label className="label">Protective Action Dist. (m)</label>
              <input className="input-field" type="number" value={protAction} onChange={e => setProtAction(e.target.value)} placeholder="e.g. 400" />
            </div>
          </div>

          {(isoM > 0 || paM > 0) && (
            <div className="bg-slate-700 rounded-lg p-4 space-y-3">
              {isoM > 0 && (
                <div className="flex justify-between">
                  <span className="text-red-400 font-bold">Initial Isolation</span>
                  <span className="font-mono text-white">{isoM}m ({Math.round(isoM * 3.281)}ft)</span>
                </div>
              )}
              {paM > 0 && (
                <div className="flex justify-between">
                  <span className="text-yellow-400 font-bold">Protective Action</span>
                  <span className="font-mono text-white">{paM}m ({Math.round(paM * 3.281)}ft)</span>
                </div>
              )}
              {windDir && paM > 0 && (
                <div className="text-slate-300 text-sm">
                  Downwind evacuation direction: opposite of {windDir} wind
                </div>
              )}
            </div>
          )}

          <button className="btn-primary w-full" onClick={applyDistances} disabled={!initIso && !protAction}>
            Apply Distances to Incident
          </button>
        </div>

        <div className="card">
          <h2 className="section-title">Log Actions</h2>
          <div className="grid grid-cols-1 gap-2">
            {ACTION_BUTTONS.map(btn => (
              <button key={btn.label} className={`${btn.color} text-white font-semibold py-3 px-4 rounded-lg min-h-[44px] text-left transition-colors`} onClick={() => logAction(btn)}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {lastAction && (
          <div className="bg-green-900/40 border border-green-700 rounded-lg p-3 text-green-300 text-sm text-center">
            {lastAction}
          </div>
        )}
      </div>
    </Layout>
  );
}
