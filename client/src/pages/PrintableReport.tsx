import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getReport } from '../api/client';
import { Layout } from '../components/Layout';
import { LoadingSpinner } from '../components/LoadingSpinner';

function fmt(dt?: string) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString();
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-black text-orange-700 border-b-2 border-orange-400 pb-1 mb-3">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null;
  return (
    <div className="flex gap-2 text-sm py-1 border-b border-gray-100">
      <span className="text-gray-500 w-40 shrink-0">{label}</span>
      <span className="text-gray-900 flex-1">{String(value)}</span>
    </div>
  );
}

export function PrintableReport() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    getReport(parseInt(id))
      .then(setData)
      .catch(() => setError('Failed to load report data'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Layout title="Printable Report" backTo={id ? `/incidents/${id}` : '/incidents'}><LoadingSpinner /></Layout>;
  if (error || !data) return <Layout title="Printable Report" backTo={id ? `/incidents/${id}` : '/incidents'}><p className="text-red-400">{error}</p></Layout>;

  const { incident, notes, weather, checklist, exposures, decon, resources, shipping_papers, photos } = data;
  const checklistDone = checklist?.filter((c: any) => c.completed).length || 0;
  const sections = [...new Set(checklist?.map((c: any) => c.section) || [])];

  return (
    <div>
      {/* Screen controls */}
      <div className="no-print bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <button
            className="text-orange-400 font-bold text-lg min-w-[44px] min-h-[44px] flex items-center"
            onClick={() => window.history.back()}
          >
            ←
          </button>
          <h1 className="text-lg font-bold text-white flex-1">Printable Report</h1>
          <button
            className="btn-primary text-sm px-4"
            onClick={() => window.print()}
          >
            🖨 Print
          </button>
        </div>
      </div>

      {/* Printable content */}
      <div className="max-w-4xl mx-auto px-4 py-6 print-area" style={{ fontFamily: 'serif' }}>
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-black text-black">🚒 HazMat Scene Runner</h1>
          <h2 className="text-xl font-bold text-gray-700 mt-1">INCIDENT REPORT</h2>
          <p className="text-sm text-gray-500 mt-2">Generated: {new Date().toLocaleString()}</p>
        </div>

        {/* Disclaimer */}
        <div className="border-2 border-red-500 bg-red-50 rounded p-3 mb-6 text-sm text-red-800">
          <strong>⚠️ IMPORTANT DISCLAIMER:</strong> This app is a first responder support tool for the initial phase of a hazmat incident.
          It does not replace the Emergency Response Guidebook, local SOPs, Incident Command, HazMat Technicians, CHEMTREC,
          emergency management, law enforcement, EMS, or official agency guidance.
        </div>

        <Section title="Incident Summary">
          <Row label="Incident Name" value={incident.name} />
          <Row label="Incident Number" value={incident.incident_number} />
          <Row label="Status" value={incident.status?.toUpperCase()} />
          <Row label="Agency" value={incident.agency} />
          <Row label="Unit" value={incident.unit} />
          <Row label="Incident Commander" value={incident.incident_commander} />
          <Row label="Scene Type" value={incident.scene_type} />
          <Row label="Product Status" value={incident.product_status} />
          <Row label="Started" value={fmt(incident.started_at)} />
          <Row label="Closed" value={incident.closed_at ? fmt(incident.closed_at) : 'Still active'} />
        </Section>

        <Section title="Location">
          <Row label="Address" value={incident.address} />
          <Row label="GPS Coordinates" value={incident.lat ? `${incident.lat}, ${incident.lon}` : undefined} />
        </Section>

        {(incident.material_name || incident.un_number) && (
          <Section title="Product Information">
            <Row label="Material Name" value={incident.material_name} />
            <Row label="UN/NA Number" value={incident.un_number} />
            <Row label="ERG Guide" value={incident.erg_guide} />
            <Row label="Initial Isolation" value={incident.initial_isolation_distance ? `${incident.initial_isolation_distance}m (SAMPLE DATA)` : undefined} />
            <Row label="Protective Action Dist." value={incident.protective_action_distance ? `${incident.protective_action_distance}m (SAMPLE DATA)` : undefined} />
            <Row label="Evacuation Status" value={incident.evacuation_status} />
            <Row label="Shelter-in-Place Status" value={incident.shelter_status} />
          </Section>
        )}

        <Section title="Zone Status">
          <Row label="Hot Zone" value={incident.hot_zone || 'Not established'} />
          <Row label="Warm Zone" value={incident.warm_zone || 'Not established'} />
          <Row label="Cold Zone" value={incident.cold_zone || 'Not established'} />
        </Section>

        {weather && weather.length > 0 && (
          <Section title="Weather Snapshots">
            {weather.map((w: any) => (
              <div key={w.id} className="mb-3 p-3 bg-gray-50 rounded border">
                <p className="text-sm font-bold">{fmt(w.checked_at)}</p>
                {w.temperature != null && <p className="text-sm">Temp: {Math.round(w.temperature)}°F</p>}
                <p className="text-sm">Wind: {w.wind_direction} at {w.wind_speed}{w.wind_gust ? ` (gusts ${w.wind_gust})` : ''}</p>
                {w.forecast_summary && <p className="text-sm text-gray-600">{w.forecast_summary}</p>}
                {w.alerts && w.alerts !== 'none' && <p className="text-sm text-red-600">⚠️ Alerts: {w.alerts}</p>}
              </div>
            ))}
          </Section>
        )}

        {notes && notes.length > 0 && (
          <Section title="Incident Timeline / Notes">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left p-2 border">Time</th>
                  <th className="text-left p-2 border">Category</th>
                  <th className="text-left p-2 border">Author</th>
                  <th className="text-left p-2 border">Note</th>
                </tr>
              </thead>
              <tbody>
                {[...notes].reverse().map((n: any) => (
                  <tr key={n.id} className="border-b">
                    <td className="p-2 border text-gray-600 whitespace-nowrap">{fmt(n.created_at)}</td>
                    <td className="p-2 border">{n.category}</td>
                    <td className="p-2 border">{n.user_name} {n.unit ? `(${n.unit})` : ''}</td>
                    <td className="p-2 border">{n.note_text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {checklist && checklist.length > 0 && (
          <Section title={`Checklist Completion (${checklistDone}/${checklist.length})`}>
            {sections.map((section: any) => {
              const sectionItems = checklist.filter((c: any) => c.section === section);
              return (
                <div key={section} className="mb-3">
                  <p className="font-bold text-gray-700 mb-1">{section}</p>
                  {sectionItems.map((item: any) => (
                    <div key={item.id} className="flex items-start gap-2 text-sm py-0.5">
                      <span className={item.completed ? 'text-green-600' : 'text-gray-400'}>{item.completed ? '☑' : '☐'}</span>
                      <span className={item.completed ? 'text-gray-700' : 'text-gray-400'}>{item.item_text}</span>
                      {item.completed_by && <span className="text-gray-400 text-xs">— {item.completed_by}</span>}
                    </div>
                  ))}
                </div>
              );
            })}
          </Section>
        )}

        {exposures && exposures.length > 0 && (
          <Section title="Exposure Log">
            {exposures.map((e: any) => (
              <div key={e.id} className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                <p className="font-bold">{e.person_name} ({e.type})</p>
                <Row label="Agency/Unit" value={`${e.agency || ''} ${e.unit || ''}`.trim() || undefined} />
                <Row label="Exposure Type" value={e.exposure_type} />
                <Row label="Symptoms" value={e.symptoms} />
                <Row label="PPE Worn" value={e.ppe_worn} />
                <Row label="Zone" value={e.zone_entered} />
                <Row label="Decon Completed" value={e.decon_completed ? 'Yes' : 'No'} />
                <Row label="EMS Evaluated" value={e.ems_evaluated ? 'Yes' : 'No'} />
                <Row label="Transported" value={e.transported ? `Yes — ${e.hospital || 'hospital not listed'}` : 'No'} />
              </div>
            ))}
          </Section>
        )}

        {decon && decon.length > 0 && (
          <Section title="Decon Log">
            {decon.map((d: any) => (
              <div key={d.id} className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                <Row label="Established" value={d.established_time} />
                <Row label="Location" value={d.location} />
                <Row label="Personnel" value={d.personnel_assigned} />
                <Row label="Water Source" value={d.water_source} />
                <Row label="Runoff Controlled" value={d.runoff_controlled ? 'Yes' : 'No'} />
                <Row label="Person Through" value={d.person_name} />
                {d.notes && <p className="text-gray-600 mt-1">{d.notes}</p>}
              </div>
            ))}
          </Section>
        )}

        {resources && resources.length > 0 && (
          <Section title="Resource Requests">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left p-2 border">Resource</th>
                  <th className="text-left p-2 border">Requested</th>
                  <th className="text-left p-2 border">ETA</th>
                  <th className="text-left p-2 border">Arrived</th>
                  <th className="text-left p-2 border">Cleared</th>
                </tr>
              </thead>
              <tbody>
                {resources.map((r: any) => (
                  <tr key={r.id} className="border-b">
                    <td className="p-2 border">{r.resource_type}</td>
                    <td className="p-2 border">{r.time_requested || '—'}</td>
                    <td className="p-2 border">{r.eta || '—'}</td>
                    <td className="p-2 border">{r.arrived_time || '—'}</td>
                    <td className="p-2 border">{r.cleared_time || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {shipping_papers && shipping_papers.length > 0 && (
          <Section title="Shipping Papers / SDS">
            {shipping_papers.map((p: any) => (
              <div key={p.id} className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <div className="flex gap-3 mb-2">
                  {p.shipping_paper_found && <span className="text-green-700 font-bold">✓ Shipping Papers</span>}
                  {p.sds_found && <span className="text-green-700 font-bold">✓ SDS</span>}
                </div>
                <Row label="Product" value={p.product_name} />
                <Row label="UN Number" value={p.un_number} />
                <Row label="Carrier" value={p.carrier} />
                <Row label="Driver" value={p.driver_name} />
                <Row label="Quantity" value={p.quantity} />
                <Row label="Hazard Class" value={p.hazard_class} />
                <Row label="Emergency Contact" value={p.emergency_contact} />
              </div>
            ))}
          </Section>
        )}

        {photos && photos.length > 0 && (
          <Section title="Photo Log">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-200">
                  <th className="text-left p-2 border">Category</th>
                  <th className="text-left p-2 border">Caption</th>
                  <th className="text-left p-2 border">GPS</th>
                  <th className="text-left p-2 border">Time</th>
                  <th className="text-left p-2 border">By</th>
                </tr>
              </thead>
              <tbody>
                {photos.map((p: any) => (
                  <tr key={p.id} className="border-b">
                    <td className="p-2 border">{p.category}</td>
                    <td className="p-2 border">{p.caption || '—'}</td>
                    <td className="p-2 border font-mono text-xs">{p.lat ? `${p.lat.toFixed(4)}, ${p.lon?.toFixed(4)}` : '—'}</td>
                    <td className="p-2 border text-xs">{fmt(p.created_at)}</td>
                    <td className="p-2 border">{p.uploaded_by || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {/* Map placeholder */}
        <Section title="Map">
          <div className="border-2 border-dashed border-gray-300 h-48 flex items-center justify-center text-gray-400 text-sm">
            [Map Screenshot — Print from Map View and attach here]
            {incident.lat && <span className="ml-2">Scene: {incident.lat}, {incident.lon}</span>}
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t-2 border-black text-xs text-gray-500 text-center">
          <p>HazMat Scene Runner — Incident Report — Generated {new Date().toLocaleString()}</p>
          <p className="mt-1">This document is a first responder support record. Verify all data with official records before use in legal or insurance proceedings.</p>
        </div>
      </div>
    </div>
  );
}
