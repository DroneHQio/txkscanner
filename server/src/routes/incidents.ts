import { Router } from 'express';
import { db } from '../db/database';
import {
  incidents, incident_notes, weather_snapshots,
  incident_checklist_items, exposure_logs, decon_logs,
  resources, shipping_papers, map_markers, photos, checklist_templates,
} from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const all = await db.select().from(incidents).orderBy(desc(incidents.created_at)).all();
    res.json(all);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to list incidents' }); }
});

router.post('/', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const data = { ...req.body, created_at: now, updated_at: now, status: 'active' };
    const result = await db.insert(incidents).values(data).returning().get();

    const templates = await db.select().from(checklist_templates).all();
    for (const tmpl of templates) {
      await db.insert(incident_checklist_items).values({
        incident_id: result.id,
        template_id: tmpl.id,
        section: tmpl.section,
        item_text: tmpl.item_text,
        sort_order: tmpl.sort_order,
        completed: false,
      }).run();
    }
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create incident' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const incident = await db.select().from(incidents).where(eq(incidents.id, id)).get();
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const [notes, weather, checklist, exposures, decon, resourceList, shipping, markers, photoList] = await Promise.all([
      db.select().from(incident_notes).where(eq(incident_notes.incident_id, id)).orderBy(desc(incident_notes.created_at)).all(),
      db.select().from(weather_snapshots).where(eq(weather_snapshots.incident_id, id)).orderBy(desc(weather_snapshots.checked_at)).all(),
      db.select().from(incident_checklist_items).where(eq(incident_checklist_items.incident_id, id)).all(),
      db.select().from(exposure_logs).where(eq(exposure_logs.incident_id, id)).all(),
      db.select().from(decon_logs).where(eq(decon_logs.incident_id, id)).all(),
      db.select().from(resources).where(eq(resources.incident_id, id)).all(),
      db.select().from(shipping_papers).where(eq(shipping_papers.incident_id, id)).all(),
      db.select().from(map_markers).where(eq(map_markers.incident_id, id)).all(),
      db.select().from(photos).where(eq(photos.incident_id, id)).all(),
    ]);

    res.json({ ...incident, notes, weather, checklist, exposures, decon, resources: resourceList, shipping_papers: shipping, markers, photos: photoList });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get incident' }); }
});

router.patch('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const now = new Date().toISOString();
    const result = await db.update(incidents).set({ ...req.body, updated_at: now }).where(eq(incidents.id, id)).returning().get();
    if (!result) return res.status(404).json({ error: 'Incident not found' });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update incident' }); }
});

router.post('/:id/close', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const now = new Date().toISOString();
    const result = await db.update(incidents).set({ status: 'closed', closed_at: now, updated_at: now }).where(eq(incidents.id, id)).returning().get();
    if (!result) return res.status(404).json({ error: 'Incident not found' });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to close incident' }); }
});

router.get('/:id/report', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const incident = await db.select().from(incidents).where(eq(incidents.id, id)).get();
    if (!incident) return res.status(404).json({ error: 'Incident not found' });

    const [notes, weather, checklist, exposures, decon, resourceList, shipping, markers, photoList] = await Promise.all([
      db.select().from(incident_notes).where(eq(incident_notes.incident_id, id)).orderBy(incident_notes.created_at).all(),
      db.select().from(weather_snapshots).where(eq(weather_snapshots.incident_id, id)).orderBy(desc(weather_snapshots.checked_at)).all(),
      db.select().from(incident_checklist_items).where(eq(incident_checklist_items.incident_id, id)).all(),
      db.select().from(exposure_logs).where(eq(exposure_logs.incident_id, id)).all(),
      db.select().from(decon_logs).where(eq(decon_logs.incident_id, id)).all(),
      db.select().from(resources).where(eq(resources.incident_id, id)).all(),
      db.select().from(shipping_papers).where(eq(shipping_papers.incident_id, id)).all(),
      db.select().from(map_markers).where(eq(map_markers.incident_id, id)).all(),
      db.select().from(photos).where(eq(photos.incident_id, id)).all(),
    ]);

    res.json({ incident, notes, weather, checklist, exposures, decon, resources: resourceList, shipping_papers: shipping, markers, photos: photoList, generated_at: new Date().toISOString() });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to generate report' }); }
});

export default router;
