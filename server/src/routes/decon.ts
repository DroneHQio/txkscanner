import { Router } from 'express';
import { db } from '../db/database';
import { decon_logs } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id/decon', async (req, res) => {
  try {
    const logs = await db.select().from(decon_logs).where(eq(decon_logs.incident_id, parseInt(req.params.id))).all();
    res.json(logs);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get decon logs' }); }
});

router.post('/:id/decon', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(decon_logs).values({ ...req.body, incident_id: parseInt(req.params.id), created_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create decon log' }); }
});

router.patch('/:id/decon/:logId', async (req, res) => {
  try {
    const result = await db.update(decon_logs).set(req.body).where(eq(decon_logs.id, parseInt(req.params.logId))).returning().get();
    if (!result) return res.status(404).json({ error: 'Log not found' });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update decon log' }); }
});

export default router;
