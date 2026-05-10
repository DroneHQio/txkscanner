import { Router } from 'express';
import { db } from '../db/database';
import { exposure_logs } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id/exposure', async (req, res) => {
  try {
    const logs = await db.select().from(exposure_logs).where(eq(exposure_logs.incident_id, parseInt(req.params.id))).all();
    res.json(logs);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get exposure logs' }); }
});

router.post('/:id/exposure', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(exposure_logs).values({ ...req.body, incident_id: parseInt(req.params.id), created_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create exposure log' }); }
});

router.patch('/:id/exposure/:logId', async (req, res) => {
  try {
    const result = await db.update(exposure_logs).set(req.body).where(eq(exposure_logs.id, parseInt(req.params.logId))).returning().get();
    if (!result) return res.status(404).json({ error: 'Log not found' });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update exposure log' }); }
});

export default router;
