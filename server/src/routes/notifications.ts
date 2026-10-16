import { Router, Response } from 'express';
import { db } from '../db';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

// GET notifications for current user
router.get('/', (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const notifications = db.prepare(`
    SELECT * FROM notifications
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 20
  `).all(userId);

  return res.json({
    success: true,
    data: notifications,
  });
});

// PATCH mark notification as read
router.patch('/:id/read', (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  db.prepare('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?').run(id, req.user?.id);

  return res.json({ success: true });
});

// POST mark all as read
router.post('/mark-all-read', (req: AuthRequest, res: Response) => {
  db.prepare('UPDATE notifications SET is_read = 1 WHERE user_id = ?').run(req.user?.id);

  return res.json({ success: true });
});

export default router;
