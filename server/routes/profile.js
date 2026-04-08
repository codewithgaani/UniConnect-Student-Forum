const express = require('express');
const db = require('../db/connection');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.put('/', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const { year, section, course } = req.body || {};
    let query = 'UPDATE users SET year = ?, section = ?, course = ?';
    let params = [year || null, section || null, course || null];

    let profilePicUrl = null;
    if (req.file) {
      profilePicUrl = '/uploads/' + req.file.filename;
      query += ', profile_pic_url = ?';
      params.push(profilePicUrl);
    }

    query += ' WHERE id = ?';
    params.push(req.user.user.id);

    await db.execute(query, params);

    // Fetch the updated user omitting password
    const [users] = await db.execute('SELECT id, username, role_id, year, section, course, profile_pic_url FROM users WHERE id = ?', [req.user.user.id]);
    
    res.json({ message: 'Profile updated successfully', user: users[0] });
  } catch (err) {
    if (err.message === 'File type not supported') {
      return res.status(400).json({ error: 'File type not supported' });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
    if (err.code === 'ECONNREFUSED' || (err.message && err.message.includes('connect'))) {
      return res.status(500).json({ error: 'Database connection failed' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
