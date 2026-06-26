import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { signToken } from '../auth.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();

const USERNAME_RE = /^[A-Za-z0-9_\u4e00-\u9fa5]{2,20}$/;

router.post('/register', (req, res) => {
  const { username, password } = req.body || {};

  if (typeof username !== 'string' || !USERNAME_RE.test(username.trim())) {
    return res
      .status(400)
      .json({ error: '用户名需为 2-20 个字符（字母、数字、下划线或中文）' });
  }
  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: '密码至少需要 6 个字符' });
  }

  const name = username.trim();
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(name);
  if (exists) {
    return res.status(409).json({ error: '该用户名已被注册' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const info = db
    .prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
    .run(name, hash);

  const user = { id: info.lastInsertRowid, username: name };
  return res.status(201).json({ token: signToken(user), user });
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: '请输入用户名和密码' });
  }

  const row = db
    .prepare('SELECT * FROM users WHERE username = ?')
    .get(username.trim());

  if (!row || !bcrypt.compareSync(password, row.password_hash)) {
    return res.status(401).json({ error: '用户名或密码错误' });
  }

  const user = { id: row.id, username: row.username };
  return res.json({ token: signToken(user), user });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, username: req.user.username } });
});

export default router;
