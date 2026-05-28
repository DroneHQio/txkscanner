import { Router } from 'express';
import { db } from '../db/database';
import { resources } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id/resources', async (req, res) => {
  try {
    const list = await db.select().from(resources).where(eq(resources.incident_id, parseInt(req.params.id))).all();
    res.json(list);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get resources' }); }
});

router.post('/:id/resources', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(resources).values({ ...req.body, incident_id: parseInt(req.params.id), created_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create resource' }); }
});

router.patch('/:id/resources/:resourceId', async (req, res) => {
  try {
    const result = await db.update(resources).set(req.body).where(eq(resources.id, parseInt(req.params.resourceId))).returning().get();
    if (!result) return res.status(404).json({ error: 'Resource not found' });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update resource' }); }
});

export default router;
