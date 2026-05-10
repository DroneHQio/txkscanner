export interface User {
  id?: number;
  name: string;
  agency: string;
  unit: string;
  created_at?: string;
}

export type IncidentStatus = 'active' | 'closed';
export type SceneType = 'Highway' | 'Rail' | 'Pipeline' | 'Fixed facility' | 'School' | 'Farm/ag' | 'Industrial' | 'Residential' | 'Unknown';
export type ProductStatus = 'Known product' | 'Unknown product' | 'Placard only' | 'Shipping papers found' | 'SDS found' | 'Vapor cloud only' | 'Leaking container' | 'Fire involved';

export interface Incident {
  id: number;
  name: string;
  incident_number?: string;
  agency?: string;
  unit?: string;
  incident_commander?: string;
  address?: string;
  lat?: number;
  lon?: number;
  scene_type?: SceneType;
  product_status?: ProductStatus;
  status: IncidentStatus;
  material_name?: string;
  un_number?: string;
  erg_guide?: string;
  initial_isolation_distance?: number;
  protective_action_distance?: number;
  evacuation_status?: string;
  shelter_status?: string;
  hot_zone?: string;
  warm_zone?: string;
  cold_zone?: string;
  started_at?: string;
  closed_at?: string;
  created_at: string;
  updated_at: string;
  notes?: IncidentNote[];
  weather?: WeatherSnapshot[];
  checklist?: ChecklistItem[];
  exposures?: ExposureLog[];
  decon?: DeconLog[];
  resources?: Resource[];
  shipping_papers?: ShippingPaper[];
  markers?: MapMarker[];
  photos?: Photo[];
}

export type NoteCategory =
  | 'General' | 'Command' | 'Product identification' | 'ERG lookup'
  | 'Weather update' | 'Evacuation' | 'Shelter-in-place' | 'Exposure'
  | 'Decon' | 'EMS' | 'Law enforcement' | 'HazMat team' | 'Fire suppression'
  | 'Spill control' | 'Public information' | 'Road closure'
  | 'Environmental concern' | 'Command transfer' | 'Call closed';

export interface IncidentNote {
  id: number;
  incident_id: number;
  user_id?: number;
  user_name?: string;
  unit?: string;
  category?: NoteCategory;
  note_text: string;
  lat?: number;
  lon?: number;
  created_at: string;
}

export interface WeatherSnapshot {
  id: number;
  incident_id: number;
  temperature?: number;
  humidity?: number;
  wind_direction?: string;
  wind_speed?: string;
  wind_gust?: string;
  forecast_summary?: string;
  alerts?: string;
  checked_at: string;
  raw_data?: string;
}

export interface ErgMaterial {
  id: number;
  un_number: string;
  name: string;
  erg_guide: string;
  placard_class?: string;
  potential_hazards?: string;
  health_hazards?: string;
  fire_hazards?: string;
  public_safety?: string;
  protective_clothing?: string;
  evacuation_guidance?: string;
  fire_response?: string;
  spill_guidance?: string;
  first_aid?: string;
  has_distance_data?: boolean | number;
  distances?: ErgDistance[];
}

export interface ErgDistance {
  id: number;
  material_id: number;
  spill_size: 'small' | 'large';
  day_night: 'day' | 'night';
  initial_isolation_meters?: number;
  protective_action_meters?: number;
}

export interface ChecklistItem {
  id: number;
  incident_id: number;
  template_id?: number;
  section: string;
  item_text: string;
  sort_order: number;
  completed: boolean;
  completed_by?: string;
  completed_at?: string;
}

export type ExposureType = 'Inhalation' | 'Skin contact' | 'Eye contact' | 'Ingestion' | 'Unknown';

export interface ExposureLog {
  id: number;
  incident_id: number;
  person_name: string;
  type?: 'responder' | 'civilian';
  agency?: string;
  unit?: string;
  contact_info?: string;
  exposure_type?: ExposureType;
  symptoms?: string;
  ppe_worn?: string;
  zone_entered?: string;
  time_entered?: string;
  time_exited?: string;
  decon_completed?: boolean;
  ems_evaluated?: boolean;
  transported?: boolean;
  hospital?: string;
  notes?: string;
  created_at: string;
}

export interface DeconLog {
  id: number;
  incident_id: number;
  established_time?: string;
  location?: string;
  personnel_assigned?: string;
  water_source?: string;
  runoff_controlled?: boolean;
  gross_decon_completed?: boolean;
  technical_decon_requested?: boolean;
  person_name?: string;
  time_through_decon?: string;
  clothing_removed?: boolean;
  ems_handoff?: boolean;
  notes?: string;
  created_at: string;
}

export type ResourceType =
  | 'HazMat team' | 'Law enforcement' | 'EMS' | 'Fire mutual aid'
  | 'Emergency management' | 'TCEQ/state environmental' | 'Railroad emergency contact'
  | 'Pipeline emergency contact' | 'Facility representative' | 'CHEMTREC'
  | 'Poison Control' | 'Tow/recovery' | 'Public works' | 'School/facility admin' | 'Other';

export interface Resource {
  id: number;
  incident_id: number;
  resource_type: ResourceType;
  time_requested?: string;
  requested_by?: string;
  contact_person?: string;
  phone?: string;
  eta?: string;
  arrived_time?: string;
  cleared_time?: string;
  notes?: string;
  created_at: string;
}

export interface ShippingPaper {
  id: number;
  incident_id: number;
  shipping_paper_found?: boolean;
  sds_found?: boolean;
  location_found?: string;
  carrier?: string;
  driver_name?: string;
  facility_contact?: string;
  product_name?: string;
  un_number?: string;
  quantity?: string;
  container_type?: string;
  hazard_class?: string;
  packing_group?: string;
  emergency_contact?: string;
  notes?: string;
  created_at: string;
}

export type MarkerType =
  | 'incident' | 'command_post' | 'staging' | 'decon' | 'roadblock'
  | 'hazard' | 'victim' | 'drainage' | 'photo';

export interface MapMarker {
  id: number;
  incident_id: number;
  marker_type: MarkerType;
  lat: number;
  lon: number;
  label?: string;
  created_at: string;
}

export interface Photo {
  id: number;
  incident_id: number;
  caption?: string;
  lat?: number;
  lon?: number;
  category?: string;
  uploaded_by?: string;
  filename?: string;
  created_at: string;
}
