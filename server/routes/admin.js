const express = require('express');
const db = require('../db/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Middleware to check for admin role (assuming role_id 3 is admin)
const adminAuth = (req, res, next) => {
  if (req.user.user.role_id !== 3) {
    return res.status(403).json({ error: 'Access denied. Admins only.' });
  }
  next();
};

// Get stats
router.get('/stats', auth, adminAuth, async (req, res) => {
  try {
    const [[{ usersCount }]] = await db.execute('SELECT COUNT(*) as usersCount FROM users');
    const [[{ postsCount }]] = await db.execute('SELECT COUNT(*) as postsCount FROM posts');
    const [[{ resourcesCount }]] = await db.execute('SELECT COUNT(*) as resourcesCount FROM resources');

    res.json({ usersCount, postsCount, resourcesCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT u.id, u.username, u.year, u.course, r.name as role 
      FROM users u 
      JOIN roles r ON u.role_id = r.id
      ORDER BY u.created_at DESC
    `);
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    if (req.params.id == req.user.user.id) {
      return res.status(400).json({ error: 'Cannot delete yourself' });
    }
    await db.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create announcement
router.post('/announcements', auth, adminAuth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    
    await db.execute('INSERT INTO log_announcements (message) VALUES (?)', [message]);
    res.status(201).json({ message: 'Announcement created successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get latest announcement (no admin auth required)
router.get('/announcements/latest', auth, async (req, res) => {
  try {
    const [announcements] = await db.execute('SELECT message, created_at FROM log_announcements ORDER BY created_at DESC LIMIT 1');
    if (announcements.length > 0) {
      res.json(announcements[0]);
    } else {
      res.json(null);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
