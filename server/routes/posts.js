const express = require('express');
const db = require('../db/connection');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const [posts] = await db.execute(`
      SELECT p.*, u.username, u.year, u.course, u.profile_pic_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      ORDER BY p.created_at DESC
    `, [userId]);
    
    // MySQL returns 1/0 for EXISTS, let's map it to true/false for frontend
    const formattedPosts = posts.map(post => ({
      ...post,
      is_liked: !!post.is_liked
    }));

    res.json(formattedPosts);
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

    res.status(201).json({ id: result.insertId, user_id: req.user.user.id, content, like_count: 0, comment_count: 0, is_liked: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific post
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.user.id;
    const postId = req.params.id;
    const [posts] = await db.execute(`
      SELECT p.*, u.username, u.year, u.course, u.profile_pic_url,
        (SELECT COUNT(*) FROM likes WHERE post_id = p.id) AS like_count,
        (SELECT COUNT(*) FROM comments WHERE post_id = p.id) AS comment_count,
        EXISTS(SELECT 1 FROM likes WHERE post_id = p.id AND user_id = ?) AS is_liked
      FROM posts p 
      JOIN users u ON p.user_id = u.id 
      WHERE p.id = ?
    `, [userId, postId]);

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = { ...posts[0], is_liked: !!posts[0].is_liked };
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.user.id;
    const { content } = req.body;
    
    if (!content) return res.status(400).json({ error: 'Content is required' });

    // Check ownership or admin
    const [posts] = await db.execute('SELECT user_id FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });
    
    if (posts[0].user_id !== userId && req.user.user.role_id !== 3) {
      return res.status(403).json({ error: 'Unauthorized to edit this post' });
    }

    await db.execute('UPDATE posts SET content = ? WHERE id = ?', [content, postId]);
    res.json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.user.id;

    // Check ownership or admin
    const [posts] = await db.execute('SELECT user_id FROM posts WHERE id = ?', [postId]);
    if (posts.length === 0) return res.status(404).json({ error: 'Post not found' });
    
    if (posts[0].user_id !== userId && req.user.user.role_id !== 3) {
      return res.status(403).json({ error: 'Unauthorized to delete this post' });
    }

    await db.execute('DELETE FROM posts WHERE id = ?', [postId]);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
