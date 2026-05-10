import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';
import path from 'path';
import fs from 'fs';

const dbDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'hazmat.db');
const sqlite = new Database(dbPath);

// Enable WAL mode for better performance
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

// Create tables if they don't exist
export function initializeDatabase() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      agency TEXT NOT NULL,
      unit TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      incident_number TEXT,
      agency TEXT,
      unit TEXT,
      incident_commander TEXT,
      address TEXT,
      lat REAL,
      lon REAL,
      scene_type TEXT,
      product_status TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      material_name TEXT,
      un_number TEXT,
      erg_guide TEXT,
      initial_isolation_distance REAL,
      protective_action_distance REAL,
      evacuation_status TEXT,
      shelter_status TEXT,
      hot_zone TEXT,
      warm_zone TEXT,
      cold_zone TEXT,
      started_at TEXT,
      closed_at TEXT,
      created_at TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS incident_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      user_id INTEGER,
      user_name TEXT,
      unit TEXT,
      category TEXT,
      note_text TEXT NOT NULL,
      lat REAL,
      lon REAL,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS weather_snapshots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      temperature REAL,
      humidity REAL,
      wind_direction TEXT,
      wind_speed TEXT,
      wind_gust TEXT,
      forecast_summary TEXT,
      alerts TEXT,
      checked_at TEXT NOT NULL DEFAULT '',
      raw_data TEXT
    );

    CREATE TABLE IF NOT EXISTS erg_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      un_number TEXT NOT NULL,
      name TEXT NOT NULL,
      erg_guide TEXT NOT NULL,
      placard_class TEXT,
      potential_hazards TEXT,
      health_hazards TEXT,
      fire_hazards TEXT,
      public_safety TEXT,
      protective_clothing TEXT,
      evacuation_guidance TEXT,
      fire_response TEXT,
      spill_guidance TEXT,
      first_aid TEXT,
      has_distance_data INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS erg_distances (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      material_id INTEGER NOT NULL,
      spill_size TEXT NOT NULL,
      day_night TEXT NOT NULL,
      initial_isolation_meters REAL,
      protective_action_meters REAL
    );

    CREATE TABLE IF NOT EXISTS checklist_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT NOT NULL,
      item_text TEXT NOT NULL,
      sort_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS incident_checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      template_id INTEGER,
      section TEXT NOT NULL,
      item_text TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      completed INTEGER DEFAULT 0,
      completed_by TEXT,
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS exposure_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      person_name TEXT NOT NULL,
      type TEXT,
      agency TEXT,
      unit TEXT,
      contact_info TEXT,
      exposure_type TEXT,
      symptoms TEXT,
      ppe_worn TEXT,
      zone_entered TEXT,
      time_entered TEXT,
      time_exited TEXT,
      decon_completed INTEGER DEFAULT 0,
      ems_evaluated INTEGER DEFAULT 0,
      transported INTEGER DEFAULT 0,
      hospital TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS decon_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      established_time TEXT,
      location TEXT,
      personnel_assigned TEXT,
      water_source TEXT,
      runoff_controlled INTEGER DEFAULT 0,
      gross_decon_completed INTEGER DEFAULT 0,
      technical_decon_requested INTEGER DEFAULT 0,
      person_name TEXT,
      time_through_decon TEXT,
      clothing_removed INTEGER DEFAULT 0,
      ems_handoff INTEGER DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      resource_type TEXT NOT NULL,
      time_requested TEXT,
      requested_by TEXT,
      contact_person TEXT,
      phone TEXT,
      eta TEXT,
      arrived_time TEXT,
      cleared_time TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS shipping_papers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      shipping_paper_found INTEGER DEFAULT 0,
      sds_found INTEGER DEFAULT 0,
      location_found TEXT,
      carrier TEXT,
      driver_name TEXT,
      facility_contact TEXT,
      product_name TEXT,
      un_number TEXT,
      quantity TEXT,
      container_type TEXT,
      hazard_class TEXT,
      packing_group TEXT,
      emergency_contact TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS map_markers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      marker_type TEXT NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      label TEXT,
      created_at TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS photos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      incident_id INTEGER NOT NULL,
      caption TEXT,
      lat REAL,
      lon REAL,
      category TEXT,
      uploaded_by TEXT,
      filename TEXT,
      created_at TEXT NOT NULL DEFAULT ''
    );
  `);
}
