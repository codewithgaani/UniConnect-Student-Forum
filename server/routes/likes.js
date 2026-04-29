const express = require('express');
const db = require('../db/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Toggle like on a post
router.post('/post/:postId', auth, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user.id;

    // Check if post exists
    const [posts] = await db.execute('SELECT id FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });

    // Check if like exists
    const [likes] = await db.execute('SELECT id FROM likes WHERE post_id = ? AND user_id = ?', [postId, userId]);

    if (likes.length > 0) {
      // Unlike
      await db.execute('DELETE FROM likes WHERE id = ?', [likes[0].id]);
      res.json({ liked: false });
    } else {
      // Like
      await db.execute('INSERT INTO likes (post_id, user_id) VALUES (?, ?)', [postId, userId]);
      res.json({ liked: true });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
