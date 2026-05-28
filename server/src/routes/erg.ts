import { Router } from 'express';
import { db } from '../db/database';
import { erg_materials, erg_distances } from '../db/schema';
import { eq } from 'drizzle-orm';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { q } = req.query as Record<string, string>;
    let results = await db.select().from(erg_materials).all();
    if (q) {
      const lower = q.toLowerCase();
      results = results.filter(m =>
        m.name.toLowerCase().includes(lower) ||
        m.un_number.toLowerCase().includes(lower) ||
        m.erg_guide.toLowerCase().includes(lower) ||
        (m.placard_class && m.placard_class.toLowerCase().includes(lower))
      );
    }
    res.json(results);
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to search ERG' }); }
});

router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const material = await db.select().from(erg_materials).where(eq(erg_materials.id, id)).get();
    if (!material) return res.status(404).json({ error: 'Material not found' });
    const distances = await db.select().from(erg_distances).where(eq(erg_distances.material_id, id)).all();
    res.json({ ...material, distances });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to get ERG material' }); }
});

export default router;
