import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listIncidents } from '../api/client';
import type { Incident } from '../types';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useUser } from '../hooks/useUser';

function elapsed(start: string) {
  const ms = Date.now() - new Date(start).getTime();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function IncidentList() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    listIncidents()
      .then(setIncidents)
      .catch(() => setError('Failed to load incidents'))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const active = incidents.filter(i => i.status === 'active');
  const closed = incidents.filter(i => i.status === 'closed');

  return (
    <Layout title="Incidents" actions={
      <button className="btn-primary text-sm px-3 py-2" onClick={() => navigate('/incidents/new')}>
        + New
      </button>
    }>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">Signed in: {user?.name} · {user?.unit}</p>
          <button className="text-slate-500 text-xs underline" onClick={() => navigate('/')}>Change</button>
        </div>

        {loading && <LoadingSpinner />}
        {error && <p className="text-red-400">{error}</p>}

        {!loading && incidents.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="text-6xl">📋</div>
            <p className="text-slate-400">No incidents yet.</p>
            <button className="btn-primary" onClick={() => navigate('/incidents/new')}>
              Start New Incident
            </button>
          </div>
        )}

        {active.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-2">
              🔴 Active ({active.length})
            </h2>
            <div className="space-y-2">
              {active.map(inc => (
                <button
                  key={inc.id}
                  className="card w-full text-left hover:bg-slate-700 transition-colors"
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{inc.name}</p>
                      <p className="text-slate-400 text-sm">
                        {inc.incident_number && `#${inc.incident_number} · `}
                        {inc.agency}
                      </p>
                      {inc.material_name && (
                        <p className="text-orange-400 text-sm">{inc.material_name}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="badge-red">ACTIVE</span>
                      <p className="text-slate-500 text-xs mt-1">
                        {inc.started_at ? elapsed(inc.started_at) : ''}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {closed.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Closed ({closed.length})
            </h2>
            <div className="space-y-2">
              {closed.map(inc => (
                <button
                  key={inc.id}
                  className="card w-full text-left hover:bg-slate-700 transition-colors opacity-70"
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-white">{inc.name}</p>
                      <p className="text-slate-400 text-sm">{inc.agency}</p>
                    </div>
                    <span className="badge-blue shrink-0">CLOSED</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
