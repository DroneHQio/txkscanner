import { Router } from 'express';
import { db } from '../db/database';
import { shipping_papers } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id/shipping-papers', async (req, res) => {
  try {
    const list = await db.select().from(shipping_papers).where(eq(shipping_papers.incident_id, parseInt(req.params.id))).all();
    res.json(list);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get shipping papers' }); }
});

router.post('/:id/shipping-papers', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(shipping_papers).values({ ...req.body, incident_id: parseInt(req.params.id), created_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create shipping paper record' }); }
});

router.patch('/:id/shipping-papers/:paperId', async (req, res) => {
  try {
    const result = await db.update(shipping_papers).set(req.body).where(eq(shipping_papers.id, parseInt(req.params.paperId))).returning().get();
    if (!result) return res.status(404).json({ error: 'Record not found' });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update shipping paper record' }); }
});

export default router;
