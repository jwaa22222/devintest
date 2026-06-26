import { Router } from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
const MAX_MESSAGE_LEN = 500;

// Throw a bottle into the sea
router.post('/', requireAuth, (req, res) => {
  const { message } = req.body || {};
  const text = typeof message === 'string' ? message.trim() : '';

  if (!text) {
    return res.status(400).json({ error: '瓶子里不能是空消息' });
  }
  if (text.length > MAX_MESSAGE_LEN) {
    return res.status(400).json({ error: `消息不能超过 ${MAX_MESSAGE_LEN} 个字符` });
  }

  const info = db
    .prepare('INSERT INTO bottles (user_id, message) VALUES (?, ?)')
    .run(req.user.id, text);

  return res.status(201).json({ id: info.lastInsertRowid, message: text });
});

// Catch a random bottle thrown by someone else
router.post('/catch', requireAuth, (req, res) => {
  const bottle = db
    .prepare(
      `SELECT b.id, b.message, b.created_at, u.username AS author
       FROM bottles b
       JOIN users u ON u.id = b.user_id
       WHERE b.user_id != ?
       ORDER BY RANDOM()
       LIMIT 1`
    )
    .get(req.user.id);

  if (!bottle) {
    return res.status(404).json({ error: '大海空空如也，暂时没有别人的瓶子，先扔一个吧～' });
  }

  db.prepare('UPDATE bottles SET picked_up = picked_up + 1 WHERE id = ?').run(
    bottle.id
  );

  return res.json({ bottle });
});

// List the bottles I've thrown, with their replies
router.get('/mine', requireAuth, (req, res) => {
  const bottles = db
    .prepare(
      `SELECT id, message, created_at, picked_up
       FROM bottles WHERE user_id = ? ORDER BY created_at DESC`
    )
    .all(req.user.id);

  const replyStmt = db.prepare(
    `SELECT r.id, r.message, r.created_at, u.username AS author
     FROM replies r JOIN users u ON u.id = r.user_id
     WHERE r.bottle_id = ? ORDER BY r.created_at ASC`
  );

  const result = bottles.map((b) => ({ ...b, replies: replyStmt.all(b.id) }));
  return res.json({ bottles: result });
});

// Reply to a bottle
router.post('/:id/replies', requireAuth, (req, res) => {
  const bottleId = Number(req.params.id);
  const { message } = req.body || {};
  const text = typeof message === 'string' ? message.trim() : '';

  if (!Number.isInteger(bottleId)) {
    return res.status(400).json({ error: '无效的瓶子 ID' });
  }
  if (!text) {
    return res.status(400).json({ error: '回复内容不能为空' });
  }
  if (text.length > MAX_MESSAGE_LEN) {
    return res.status(400).json({ error: `回复不能超过 ${MAX_MESSAGE_LEN} 个字符` });
  }

  const bottle = db.prepare('SELECT id FROM bottles WHERE id = ?').get(bottleId);
  if (!bottle) {
    return res.status(404).json({ error: '这个瓶子已经不存在了' });
  }

  const info = db
    .prepare('INSERT INTO replies (bottle_id, user_id, message) VALUES (?, ?, ?)')
    .run(bottleId, req.user.id, text);

  return res.status(201).json({ id: info.lastInsertRowid, message: text });
});

export default router;
