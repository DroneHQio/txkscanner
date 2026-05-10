import { Router } from 'express';
import { db } from '../db/database';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const now = new Date().toISOString();
    const result = await db.insert(users).values({ ...req.body, created_at: now }).returning().get();
    res.status(201).json(result);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create user' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, parseInt(req.params.id))).get();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get user' }); }
});

export default router;
