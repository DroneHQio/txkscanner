import { Router } from 'express';
import { db } from '../db/database';
import { incident_notes } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

const router = Router();

router.get('/:id/notes', async (req, res) => {
  try {
    const notes = await db.select().from(incident_notes)
      .where(eq(incident_notes.incident_id, parseInt(req.params.id)))
      .orderBy(desc(incident_notes.created_at)).all();
    res.json(notes);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get notes' }); }
});

router.post('/:id/notes', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(incident_notes).values({
      ...req.body,
      incident_id: parseInt(req.params.id),
      created_at: now,
    }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create note' }); }
});

export default router;
