import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { Disclaimer } from '../components/Disclaimer';

export function StartPage() {
  const { user, saveUser } = useUser();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [agency, setAgency] = useState(user?.agency || '');
  const [unit, setUnit] = useState(user?.unit || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !agency.trim() || !unit.trim()) {
      setError('All fields are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveUser({ name: name.trim(), agency: agency.trim(), unit: unit.trim() });
      navigate('/incidents');
    } catch {
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start pt-8 px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="text-5xl mb-3">🚒</div>
          <h1 className="text-3xl font-black text-orange-400">HazMat Scene Runner</h1>
          <p className="text-slate-400 mt-1 text-sm">Initial Phase Incident Management</p>
        </div>

        {/* Disclaimer */}
        <Disclaimer />

        {/* User form */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">Responder Sign-In</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Full Name *</label>
              <input
                className="input-field"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="John Smith"
                autoComplete="name"
              />
            </div>
            <div>
              <label className="label">Agency *</label>
              <input
                className="input-field"
                value={agency}
                onChange={e => setAgency(e.target.value)}
                placeholder="City Fire Department"
              />
            </div>
            <div>
              <label className="label">Unit / Apparatus *</label>
              <input
                className="input-field"
                value={unit}
                onChange={e => setUnit(e.target.value)}
                placeholder="Engine 1 / HazMat 1"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button type="submit" className="btn-primary w-full text-lg" disabled={saving}>
              {saving ? 'Saving...' : 'Enter App →'}
            </button>
          </form>
        </div>

        {user && (
          <button
            className="btn-secondary w-full"
            onClick={() => navigate('/incidents')}
          >
            Continue as {user.name} ({user.unit})
          </button>
        )}

        <p className="text-center text-slate-600 text-xs pb-4">
          HazMat Scene Runner MVP — For training and initial response support only
        </p>
      </div>
    </div>
  );
}
