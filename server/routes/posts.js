const express = require('express');
const db = require('../db/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', async (req, res) => {
  try {
    const [posts] = await db.execute(`
      SELECT p.*, u.username, u.year, u.course, u.profile_pic_url 
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a post
router.post('/', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Content is required' });

    const [result] = await db.execute(
      'INSERT INTO posts (user_id, content) VALUES (?, ?)',
      [req.user.user.id, content]
    );

    res.status(201).json({ id: result.insertId, user_id: req.user.user.id, content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
