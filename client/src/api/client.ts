import type {
  User, Incident, IncidentNote, WeatherSnapshot, ErgMaterial,
  ChecklistItem, ExposureLog, DeconLog, Resource, ShippingPaper, MapMarker, Photo
} from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Users
export const createUser = (data: Omit<User, 'id'>) =>
  request<User>('/users', { method: 'POST', body: JSON.stringify(data) });

// Incidents
export const listIncidents = () => request<Incident[]>('/incidents');
export const getIncident = (id: number) => request<Incident>(`/incidents/${id}`);
export const createIncident = (data: Partial<Incident>) =>
  request<Incident>('/incidents', { method: 'POST', body: JSON.stringify(data) });
export const updateIncident = (id: number, data: Partial<Incident>) =>
  request<Incident>(`/incidents/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
export const closeIncident = (id: number) =>
  request<Incident>(`/incidents/${id}/close`, { method: 'POST' });
export const getReport = (id: number) => request<any>(`/incidents/${id}/report`);

// Notes
export const getNotes = (id: number) => request<IncidentNote[]>(`/incidents/${id}/notes`);
export const createNote = (id: number, data: Partial<IncidentNote>) =>
  request<IncidentNote>(`/incidents/${id}/notes`, { method: 'POST', body: JSON.stringify(data) });

// Weather
export const getWeather = (id: number) => request<WeatherSnapshot[]>(`/incidents/${id}/weather`);
export const fetchWeather = (id: number, lat: number, lon: number) =>
  request<WeatherSnapshot>(`/incidents/${id}/weather`, {
    method: 'POST',
    body: JSON.stringify({ lat, lon }),
  });

// ERG
export const searchErg = (q: string) => request<ErgMaterial[]>(`/erg?q=${encodeURIComponent(q)}`);
export const getErgById = (id: number) => request<ErgMaterial>(`/erg/${id}`);

// Checklist
export const getChecklist = (id: number) => request<ChecklistItem[]>(`/incidents/${id}/checklist`);
export const updateChecklistItem = (incidentId: number, itemId: number, data: Partial<ChecklistItem>) =>
  request<ChecklistItem>(`/incidents/${incidentId}/checklist/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Exposure
export const getExposure = (id: number) => request<ExposureLog[]>(`/incidents/${id}/exposure`);
export const createExposure = (id: number, data: Partial<ExposureLog>) =>
  request<ExposureLog>(`/incidents/${id}/exposure`, { method: 'POST', body: JSON.stringify(data) });

// Decon
export const getDecon = (id: number) => request<DeconLog[]>(`/incidents/${id}/decon`);
export const createDecon = (id: number, data: Partial<DeconLog>) =>
  request<DeconLog>(`/incidents/${id}/decon`, { method: 'POST', body: JSON.stringify(data) });

// Resources
export const getResources = (id: number) => request<Resource[]>(`/incidents/${id}/resources`);
export const createResource = (id: number, data: Partial<Resource>) =>
  request<Resource>(`/incidents/${id}/resources`, { method: 'POST', body: JSON.stringify(data) });
export const updateResource = (incidentId: number, resourceId: number, data: Partial<Resource>) =>
  request<Resource>(`/incidents/${incidentId}/resources/${resourceId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

// Shipping Papers
export const getShippingPapers = (id: number) => request<ShippingPaper[]>(`/incidents/${id}/shipping-papers`);
export const createShippingPaper = (id: number, data: Partial<ShippingPaper>) =>
  request<ShippingPaper>(`/incidents/${id}/shipping-papers`, { method: 'POST', body: JSON.stringify(data) });

// Markers
export const getMarkers = (id: number) => request<MapMarker[]>(`/incidents/${id}/markers`);
export const createMarker = (id: number, data: Partial<MapMarker>) =>
  request<MapMarker>(`/incidents/${id}/markers`, { method: 'POST', body: JSON.stringify(data) });
export const deleteMarker = (incidentId: number, markerId: number) =>
  request<{ success: boolean }>(`/incidents/${incidentId}/markers/${markerId}`, { method: 'DELETE' });

// Photos
export const getPhotos = (id: number) => request<Photo[]>(`/incidents/${id}/photos`);
export const createPhoto = (id: number, data: Partial<Photo>) =>
  request<Photo>(`/incidents/${id}/photos`, { method: 'POST', body: JSON.stringify(data) });
export const deletePhoto = (incidentId: number, photoId: number) =>
  request<{ success: boolean }>(`/incidents/${incidentId}/photos/${photoId}`, { method: 'DELETE' });
