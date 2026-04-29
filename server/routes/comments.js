const express = require('express');
const db = require('../db/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Get comments for a post
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const [comments] = await db.execute(`
      SELECT c.*, u.username, u.profile_pic_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);
    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a comment
router.post('/post/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.user.id;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    const [result] = await db.execute(
      'INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)',
      [postId, userId, content]
    );

    const [newComment] = await db.execute(`
      SELECT c.*, u.username, u.profile_pic_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [result.insertId]);

    res.status(201).json(newComment[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.user.id;

    const [comments] = await db.execute('SELECT user_id, post_id FROM comments WHERE id = ?', [commentId]);
    if (comments.length === 0) return res.status(404).json({ error: 'Comment not found' });
    
    // Also let the post owner delete comments on their post
    const [posts] = await db.execute('SELECT user_id FROM posts WHERE id = ?', [comments[0].post_id]);

    if (comments[0].user_id !== userId && posts[0].user_id !== userId && req.user.user.role_id !== 3) {
      return res.status(403).json({ error: 'Unauthorized to delete this comment' });
    }

    await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);
    res.json({ message: 'Comment deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
