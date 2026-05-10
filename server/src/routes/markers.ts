import { Router } from 'express';
import { db } from '../db/database';
import { map_markers } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id/markers', async (req, res) => {
  try {
    const list = await db.select().from(map_markers).where(eq(map_markers.incident_id, parseInt(req.params.id))).all();
    res.json(list);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get markers' }); }
});

router.post('/:id/markers', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(map_markers).values({ ...req.body, incident_id: parseInt(req.params.id), created_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create marker' }); }
});

router.delete('/:id/markers/:markerId', async (req, res) => {
  try {
    await db.delete(map_markers).where(eq(map_markers.id, parseInt(req.params.markerId))).run();
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete marker' }); }
});

export default router;
