import { useState, useEffect, useCallback } from 'react';
import type { Incident } from '../types';
import { getIncident } from '../api/client';

export function useIncident(id: number | null) {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getIncident(id);
      setIncident(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load incident');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  return { incident, loading, error, reload: load, setIncident };
}
