import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StartPage } from './pages/StartPage';
import { IncidentList } from './pages/IncidentList';
import { NewIncident } from './pages/NewIncident';
import { Dashboard } from './pages/Dashboard';
import { ErgLookup } from './pages/ErgLookup';
import { UnknownProduct } from './pages/UnknownProduct';
import { WeatherPage } from './pages/WeatherPage';
import { EvacuationGuidance } from './pages/EvacuationGuidance';
import { MapView } from './pages/MapView';
import { NotesLog } from './pages/NotesLog';
import { ChecklistRunner } from './pages/ChecklistRunner';
import { ExposureLog } from './pages/ExposureLog';
import { DeconLog } from './pages/DeconLog';
import { ResourceTracking } from './pages/ResourceTracking';
import { ShippingPapers } from './pages/ShippingPapers';
import { PhotoAttachments } from './pages/PhotoAttachments';
import { PrintableReport } from './pages/PrintableReport';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/incidents" element={<IncidentList />} />
        <Route path="/incidents/new" element={<NewIncident />} />
        <Route path="/incidents/:id" element={<Dashboard />} />
        <Route path="/incidents/:id/erg" element={<ErgLookup />} />
        <Route path="/incidents/:id/unknown" element={<UnknownProduct />} />
        <Route path="/incidents/:id/weather" element={<WeatherPage />} />
        <Route path="/incidents/:id/evacuation" element={<EvacuationGuidance />} />
        <Route path="/incidents/:id/map" element={<MapView />} />
        <Route path="/incidents/:id/notes" element={<NotesLog />} />
        <Route path="/incidents/:id/checklist" element={<ChecklistRunner />} />
        <Route path="/incidents/:id/exposure" element={<ExposureLog />} />
        <Route path="/incidents/:id/decon" element={<DeconLog />} />
        <Route path="/incidents/:id/resources" element={<ResourceTracking />} />
        <Route path="/incidents/:id/shipping" element={<ShippingPapers />} />
        <Route path="/incidents/:id/photos" element={<PhotoAttachments />} />
        <Route path="/incidents/:id/report" element={<PrintableReport />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
