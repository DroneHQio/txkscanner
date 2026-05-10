import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  agency: text('agency').notNull(),
  unit: text('unit').notNull(),
  created_at: text('created_at').notNull().default(''),
});

export const incidents = sqliteTable('incidents', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  incident_number: text('incident_number'),
  agency: text('agency'),
  unit: text('unit'),
  incident_commander: text('incident_commander'),
  address: text('address'),
  lat: real('lat'),
  lon: real('lon'),
  scene_type: text('scene_type'),
  product_status: text('product_status'),
  status: text('status').notNull().default('active'),
  material_name: text('material_name'),
  un_number: text('un_number'),
  erg_guide: text('erg_guide'),
  initial_isolation_distance: real('initial_isolation_distance'),
  protective_action_distance: real('protective_action_distance'),
  evacuation_status: text('evacuation_status'),
  shelter_status: text('shelter_status'),
  hot_zone: text('hot_zone'),
  warm_zone: text('warm_zone'),
  cold_zone: text('cold_zone'),
  started_at: text('started_at'),
  closed_at: text('closed_at'),
  created_at: text('created_at').notNull().default(''),
  updated_at: text('updated_at').notNull().default(''),
});

export const incident_notes = sqliteTable('incident_notes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  user_id: integer('user_id'),
  user_name: text('user_name'),
  unit: text('unit'),
  category: text('category'),
  note_text: text('note_text').notNull(),
  lat: real('lat'),
  lon: real('lon'),
  created_at: text('created_at').notNull().default(''),
});

export const weather_snapshots = sqliteTable('weather_snapshots', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  temperature: real('temperature'),
  humidity: real('humidity'),
  wind_direction: text('wind_direction'),
  wind_speed: text('wind_speed'),
  wind_gust: text('wind_gust'),
  forecast_summary: text('forecast_summary'),
  alerts: text('alerts'),
  checked_at: text('checked_at').notNull().default(''),
  raw_data: text('raw_data'),
});

export const erg_materials = sqliteTable('erg_materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  un_number: text('un_number').notNull(),
  name: text('name').notNull(),
  erg_guide: text('erg_guide').notNull(),
  placard_class: text('placard_class'),
  potential_hazards: text('potential_hazards'),
  health_hazards: text('health_hazards'),
  fire_hazards: text('fire_hazards'),
  public_safety: text('public_safety'),
  protective_clothing: text('protective_clothing'),
  evacuation_guidance: text('evacuation_guidance'),
  fire_response: text('fire_response'),
  spill_guidance: text('spill_guidance'),
  first_aid: text('first_aid'),
  has_distance_data: integer('has_distance_data', { mode: 'boolean' }).default(false),
});

export const erg_distances = sqliteTable('erg_distances', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  material_id: integer('material_id').notNull(),
  spill_size: text('spill_size').notNull(), // 'small' or 'large'
  day_night: text('day_night').notNull(), // 'day' or 'night'
  initial_isolation_meters: real('initial_isolation_meters'),
  protective_action_meters: real('protective_action_meters'),
});

export const checklist_templates = sqliteTable('checklist_templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  section: text('section').notNull(),
  item_text: text('item_text').notNull(),
  sort_order: integer('sort_order').notNull(),
});

export const incident_checklist_items = sqliteTable('incident_checklist_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  template_id: integer('template_id'),
  section: text('section').notNull(),
  item_text: text('item_text').notNull(),
  sort_order: integer('sort_order').notNull(),
  completed: integer('completed', { mode: 'boolean' }).default(false),
  completed_by: text('completed_by'),
  completed_at: text('completed_at'),
});

export const exposure_logs = sqliteTable('exposure_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  person_name: text('person_name').notNull(),
  type: text('type'), // 'responder' | 'civilian'
  agency: text('agency'),
  unit: text('unit'),
  contact_info: text('contact_info'),
  exposure_type: text('exposure_type'),
  symptoms: text('symptoms'),
  ppe_worn: text('ppe_worn'),
  zone_entered: text('zone_entered'),
  time_entered: text('time_entered'),
  time_exited: text('time_exited'),
  decon_completed: integer('decon_completed', { mode: 'boolean' }).default(false),
  ems_evaluated: integer('ems_evaluated', { mode: 'boolean' }).default(false),
  transported: integer('transported', { mode: 'boolean' }).default(false),
  hospital: text('hospital'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(''),
});

export const decon_logs = sqliteTable('decon_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  established_time: text('established_time'),
  location: text('location'),
  personnel_assigned: text('personnel_assigned'),
  water_source: text('water_source'),
  runoff_controlled: integer('runoff_controlled', { mode: 'boolean' }).default(false),
  gross_decon_completed: integer('gross_decon_completed', { mode: 'boolean' }).default(false),
  technical_decon_requested: integer('technical_decon_requested', { mode: 'boolean' }).default(false),
  person_name: text('person_name'),
  time_through_decon: text('time_through_decon'),
  clothing_removed: integer('clothing_removed', { mode: 'boolean' }).default(false),
  ems_handoff: integer('ems_handoff', { mode: 'boolean' }).default(false),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(''),
});

export const resources = sqliteTable('resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  resource_type: text('resource_type').notNull(),
  time_requested: text('time_requested'),
  requested_by: text('requested_by'),
  contact_person: text('contact_person'),
  phone: text('phone'),
  eta: text('eta'),
  arrived_time: text('arrived_time'),
  cleared_time: text('cleared_time'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(''),
});

export const shipping_papers = sqliteTable('shipping_papers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  shipping_paper_found: integer('shipping_paper_found', { mode: 'boolean' }).default(false),
  sds_found: integer('sds_found', { mode: 'boolean' }).default(false),
  location_found: text('location_found'),
  carrier: text('carrier'),
  driver_name: text('driver_name'),
  facility_contact: text('facility_contact'),
  product_name: text('product_name'),
  un_number: text('un_number'),
  quantity: text('quantity'),
  container_type: text('container_type'),
  hazard_class: text('hazard_class'),
  packing_group: text('packing_group'),
  emergency_contact: text('emergency_contact'),
  notes: text('notes'),
  created_at: text('created_at').notNull().default(''),
});

export const map_markers = sqliteTable('map_markers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  marker_type: text('marker_type').notNull(),
  lat: real('lat').notNull(),
  lon: real('lon').notNull(),
  label: text('label'),
  created_at: text('created_at').notNull().default(''),
});

export const photos = sqliteTable('photos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  incident_id: integer('incident_id').notNull(),
  caption: text('caption'),
  lat: real('lat'),
  lon: real('lon'),
  category: text('category'),
  uploaded_by: text('uploaded_by'),
  filename: text('filename'),
  created_at: text('created_at').notNull().default(''),
});
