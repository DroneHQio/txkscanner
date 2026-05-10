import { Router } from 'express';
import { db } from '../db/database';
import { incident_checklist_items } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/:id/checklist', async (req, res) => {
  try {
    const items = await db.select().from(incident_checklist_items)
      .where(eq(incident_checklist_items.incident_id, parseInt(req.params.id))).all();
    res.json(items);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get checklist' }); }
});

router.patch('/:id/checklist/:itemId', async (req, res) => {
  try {
    const itemId = parseInt(req.params.itemId);
    const { completed, completed_by } = req.body;
    const now = new Date().toISOString();
    const result = await db.update(incident_checklist_items)
      .set({ completed, completed_by: completed_by || null, completed_at: completed ? now : null })
      .where(eq(incident_checklist_items.id, itemId)).returning().get();
    if (!result) return res.status(404).json({ error: 'Checklist item not found' });
    res.json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to update checklist item' }); }
});

export default router;
