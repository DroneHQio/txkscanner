import { Router } from 'express';
import { db } from '../db/database';
import { photos } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id/photos', async (req, res) => {
  try {
    const list = await db.select().from(photos).where(eq(photos.incident_id, parseInt(req.params.id))).all();
    res.json(list);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get photos' }); }
});

router.post('/:id/photos', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(photos).values({ ...req.body, incident_id: parseInt(req.params.id), created_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create photo record' }); }
});

router.delete('/:id/photos/:photoId', async (req, res) => {
  try {
    await db.delete(photos).where(eq(photos.id, parseInt(req.params.photoId))).run();
    res.json({ success: true });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to delete photo' }); }
});

export default router;
